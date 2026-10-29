"""Extract support-contact points for every <name>-sup.stl that has a bare partner <name>.stl.

Usage: python -I extract-sup-contacts.py <fixtures_root>

For each <dir>/<name>-sup.stl with <dir>/<name>.stl beside it, writes
<dir>/<name>-sup.contacts.json (format "mixo-sup-contacts/1"). Scans are read in place and never
modified. The outputs sit in git-ignored customer-data folders; do not add them to git.

Method:
  1. Denture/part component inside the -sup = largest face-connected component of the -sup.
  2. Support geometry = -sup vertices outside that component.
  3. Bare-to-sup transform: "exact" = least-squares fit on one-to-one vertex correspondences when
     the denture is the same mesh (RMS ~0); otherwise "icp" = point-to-plane ICP, then point-to-point.
     rms_mm is reported; rms_flag_over_0.02_mm is set when it exceeds 0.02 mm.
  4. Contacts = support vertices within TOUCH_MM of the transformed bare surface, clustered
     with CLUSTER_MM (connected components); each cluster centroid is mapped to the bare frame
     and snapped to the nearest bare-surface point, normal = that face's normal.
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial import cKDTree

FORMAT = "mixo-sup-contacts/1"
TOUCH_MM = 0.3
TIP_MM = 1.0
CLUSTER_MM = 1.0
ICP_ITERS = 80


def kabsch(src, dst):
    cs, cd = src.mean(0), dst.mean(0)
    H = (src - cs).T @ (dst - cd)
    U, _, Vt = np.linalg.svd(H)
    d = np.sign(np.linalg.det(Vt.T @ U.T))
    R = Vt.T @ np.diag([1.0, 1.0, d]) @ U.T
    M = np.eye(4)
    M[:3, :3] = R
    M[:3, 3] = cd - R @ cs
    return M


def apply(T, p):
    return p @ T[:3, :3].T + T[:3, 3]


def icp_point_to_point(A, B, T0):
    tree = cKDTree(B)
    T = T0.copy()
    prev = np.inf
    for _ in range(ICP_ITERS):
        At = apply(T, A)
        d, idx = tree.query(At)
        T = kabsch(At, B[idx]) @ T
        rms = float(np.sqrt(np.mean(d ** 2)))
        if abs(prev - rms) < 1e-7:
            break
        prev = rms
    d, _ = tree.query(apply(T, A))
    return T, float(np.sqrt(np.mean(d ** 2)))


def closest_point_triangles(p, a, b, c):
    """Ericson closest point on triangle, vectorised over rows."""
    ab, ac, ap = b - a, c - a, p - a
    d1 = np.einsum("ij,ij->i", ab, ap)
    d2 = np.einsum("ij,ij->i", ac, ap)
    bp = p - b
    d3 = np.einsum("ij,ij->i", ab, bp)
    d4 = np.einsum("ij,ij->i", ac, bp)
    cp = p - c
    d5 = np.einsum("ij,ij->i", ab, cp)
    d6 = np.einsum("ij,ij->i", ac, cp)
    va = d3 * d6 - d5 * d4
    vb = d5 * d2 - d1 * d6
    vc = d1 * d4 - d3 * d2
    with np.errstate(divide="ignore", invalid="ignore"):
        denom = va + vb + vc
        vv = np.nan_to_num(vb / denom)
        ww = np.nan_to_num(vc / denom)
        t_ab = np.clip(d1 / (d1 - d3), 0, 1)
        t_ac = np.clip(d2 / (d2 - d6), 0, 1)
        t_bc = np.clip((d4 - d3) / ((d4 - d3) + (d5 - d6)), 0, 1)
    res = a + ab * vv[:, None] + ac * ww[:, None]
    m_a = (d1 <= 0) & (d2 <= 0)
    m_b = (d3 >= 0) & (d3 >= d4)
    m_c = (d6 >= 0) & (d6 >= d5)
    m_ab = (vc <= 0) & (d1 >= 0) & (d3 <= 0)
    m_ac = (vb <= 0) & (d2 >= 0) & (d6 <= 0)
    m_bc = (va <= 0) & ((d4 - d3) >= 0) & ((d5 - d6) >= 0)
    res = np.where(m_bc[:, None], b + (c - b) * t_bc[:, None], res)
    res = np.where(m_ac[:, None], a + ac * t_ac[:, None], res)
    res = np.where(m_ab[:, None], a + ab * t_ab[:, None], res)
    res = np.where(m_c[:, None], c, res)
    res = np.where(m_b[:, None], b, res)
    res = np.where(m_a[:, None], a, res)
    return res


def closest_on_mesh(mesh, pts, radius=1.0):
    """Exact closest surface point, testing faces incident to nearby vertices (no rtree needed)."""
    vtree = cKDTree(mesh.vertices)
    V, F, VF = mesh.vertices, mesh.faces, mesh.vertex_faces
    out_p = np.zeros((len(pts), 3))
    out_d = np.full(len(pts), np.inf)
    out_f = np.zeros(len(pts), dtype=int)
    balls = vtree.query_ball_point(pts, radius)
    for i, (p, ball) in enumerate(zip(pts, balls)):
        if not ball:
            _, vi = vtree.query(p)
            ball = [vi]
        cand_f = VF[ball].ravel()
        faces = np.unique(cand_f[cand_f >= 0])
        tri = V[F[faces]]
        cp = closest_point_triangles(np.repeat(p[None], len(faces), axis=0),
                                     tri[:, 0], tri[:, 1], tri[:, 2])
        d = np.linalg.norm(cp - p, axis=1)
        k = int(np.argmin(d))
        out_p[i], out_d[i], out_f[i] = cp[k], d[k], faces[k]
    return out_p, out_d, out_f


def load(path):
    return trimesh.load(str(path), file_type="stl", force="mesh", process=True)


EXACT_RMS_MM = 0.02


def exact_fit(bare_v, den_v, iters=30):
    """Least-squares fit on one-to-one vertex correspondences (identical meshes). None if not 1:1."""
    T = np.eye(4)
    T[:3, 3] = den_v.mean(0) - bare_v.mean(0)
    tree = cKDTree(den_v)
    rms = np.inf
    for _ in range(iters):
        d, idx = tree.query(apply(T, bare_v))
        if len(set(idx.tolist())) != len(bare_v):
            return None, np.inf
        T = kabsch(apply(T, bare_v), den_v[idx]) @ T
        rms = float(np.sqrt(np.mean(d ** 2)))
    d, idx = tree.query(apply(T, bare_v))
    if len(set(idx.tolist())) != len(bare_v):
        return None, np.inf
    return T, float(np.sqrt(np.mean(d ** 2)))


def icp_point_to_plane(A, B, Bn, T0, iters=30):
    """Point-to-plane ICP: A bare samples, B target points with unit normals Bn."""
    from scipy.spatial.transform import Rotation
    tree = cKDTree(B)
    T = T0.copy()
    for _ in range(iters):
        At = apply(T, A)
        d, idx = tree.query(At)
        q, n = B[idx], Bn[idx]
        J = np.hstack([np.cross(At, n), n])
        r = np.einsum("ij,ij->i", n, At - q)
        x, *_ = np.linalg.lstsq(J, -r, rcond=None)
        dT = np.eye(4)
        dT[:3, :3] = Rotation.from_rotvec(x[:3]).as_matrix()
        dT[:3, 3] = x[3:]
        T = dT @ T
        if np.linalg.norm(x) < 1e-9:
            break
    return T


def register(bare, sup, den, den_vert_set):
    """Return (T bare->sup, rms_mm, method). Exact vertex fit when the denture matches the bare
    mesh; otherwise point-to-plane ICP refined by point-to-point ICP."""
    den_v = sup.vertices[den_vert_set]
    if len(den.faces) == len(bare.faces) and len(den_v) == len(bare.vertices):
        T, rms = exact_fit(bare.vertices, den_v)
        if T is not None and rms <= EXACT_RMS_MM:
            return T, rms, "exact"
    den_pts, den_fi = trimesh.sample.sample_surface(den, 60000)
    den_n = den.face_normals[den_fi]
    bare_samp = bare.sample(20000)
    T0 = np.eye(4)
    T0[:3, 3] = den_pts.mean(0) - bare_samp.mean(0)
    T = icp_point_to_plane(bare_samp, den_pts, den_n, T0)
    T, rms = icp_point_to_point(bare_samp, den_pts, T)
    return T, rms, "icp"


def cluster_points(pts, r):
    """Connected components of the r-proximity graph; returns list of index arrays."""
    if not len(pts):
        return []
    pairs = cKDTree(pts).query_pairs(r, output_type="ndarray")
    parent = np.arange(len(pts))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in pairs:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
    roots = np.array([find(i) for i in range(len(pts))])
    return [np.where(roots == r_)[0] for r_ in np.unique(roots)]


def process_pair(bare_path, sup_path):
    bare = load(bare_path)
    sup = load(sup_path)

    groups = sorted(trimesh.graph.connected_components(sup.face_adjacency, min_len=1),
                    key=len, reverse=True)
    denture_faces = np.asarray(groups[0])
    den = trimesh.Trimesh(vertices=sup.vertices, faces=sup.faces[denture_faces], process=False)
    den_vert_set = np.unique(sup.faces[denture_faces])
    T, rms, method = register(bare, sup, den, den_vert_set)

    # support pieces = every non-denture face-connected component
    comp_of_v = np.full(len(sup.vertices), -1, dtype=int)
    for k, g in enumerate(groups[1:], start=1):
        comp_of_v[np.unique(sup.faces[np.asarray(g)])] = k
    sup_mask = comp_of_v >= 0
    sup_mask[den_vert_set] = False
    sup_idx = np.where(sup_mask)[0]
    support_pts = sup.vertices[sup_idx]

    bare_in_sup = bare.copy()
    bare_in_sup.apply_transform(T)
    Tinv = np.linalg.inv(T)

    # exact distance of every support vertex to the bare surface (prefiltered)
    d0, _ = cKDTree(bare_in_sup.vertices).query(support_pts, distance_upper_bound=TOUCH_MM * 4)
    near = d0 <= TOUCH_MM * 4
    near_idx = sup_idx[near]
    _, dist_near, _ = closest_on_mesh(bare_in_sup, support_pts[near], radius=1.0)

    # OLD rule (for comparison): support vertices within TOUCH_MM, clustered at CLUSTER_MM
    old_pts = support_pts[near][dist_near <= TOUCH_MM]
    old_clusters = cluster_points(old_pts, CLUSTER_MM)
    old_count = len(old_clusters)

    # NEW rule: per support piece, its nearest vertex to the bare surface; accept if <= TIP_MM
    best = {}
    for vi, dv in zip(near_idx, dist_near):
        k = comp_of_v[vi]
        if k not in best or dv < best[k][1]:
            best[k] = (vi, dv)
    piece_d = np.array([v[1] for v in best.values()])
    accepted = [v[0] for v in best.values() if v[1] <= TIP_MM]
    acc_pts = sup.vertices[np.array(accepted, dtype=int)] if accepted else np.zeros((0, 3))

    # project each accepted tip point onto the bare surface (bare frame) and cluster
    if len(acc_pts):
        proj, _, tri = closest_on_mesh(bare_in_sup, acc_pts, radius=1.5)
        proj_bare = apply(Tinv, proj)
    else:
        proj_bare, tri = np.zeros((0, 3)), np.zeros(0, dtype=int)
    clusters = cluster_points(proj_bare, CLUSTER_MM)
    snapped, normals = [], []
    for c in clusters:
        p = proj_bare[c].mean(0)
        closest, _, ftri = closest_on_mesh(bare, p[None], radius=1.5)
        snapped.append(closest[0])
        normals.append(bare.face_normals[ftri[0]])

    stats = {
        "pieces": int(len(best)),
        "piece_nearest_mm_min": round(float(piece_d.min()), 4) if len(piece_d) else None,
        "piece_nearest_mm_median": round(float(np.median(piece_d)), 4) if len(piece_d) else None,
        "piece_nearest_mm_p90": round(float(np.percentile(piece_d, 90)), 4) if len(piece_d) else None,
        "accepted_pieces": len(accepted),
        "old_count_touch_0.3mm": old_count,
        "new_count": len(snapped),
    }
    out = {
        "format": FORMAT,
        "bare": bare_path.name,
        "sup": sup_path.name,
        "frame": "bare scan coordinates, mm",
        "transform_bare_to_sup": np.round(T, 6).tolist(),
        "registration": method,
        "rms_mm": round(rms, 6),
        "rms_flag_over_0.02_mm": bool(rms > EXACT_RMS_MM),
        "touch_rule": f"tip-piece nearest point <= {TIP_MM} mm",
        "contacts": np.round(np.array(snapped).reshape(-1, 3), 4).tolist(),
        "normals": np.round(np.array(normals).reshape(-1, 3), 5).tolist(),
        "cluster_mm": CLUSTER_MM,
        "touch_mm": TIP_MM,
    }
    return out, stats, bare, bare_in_sup, snapped


def save_png(bare, snapped, png_path, title):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    surf = bare.sample(40000)
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    for ax, (i, j, name) in zip(axes, [(0, 1, "top X-Y"), (0, 2, "side X-Z")]):
        ax.scatter(surf[:, i], surf[:, j], s=0.3, c="#bbbbbb", linewidths=0)
        if len(snapped):
            ax.scatter(snapped[:, i], snapped[:, j], s=14, c="#d62728", linewidths=0)
        ax.set_aspect("equal")
        ax.set_title(f"{title} {name}: {len(snapped)} contacts")
    fig.tight_layout()
    fig.savefig(png_path, dpi=110)
    plt.close(fig)


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    root = Path(sys.argv[1])
    png_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    pairs = sorted(root.rglob("*-sup.stl"))
    for idx, sup_path in enumerate(pairs, 1):
        bare_path = sup_path.with_name(sup_path.name[: -len("-sup.stl")] + ".stl")
        if not bare_path.exists():
            print(f"skip (no bare partner): {sup_path.name}")
            continue
        out, stats, bare, _, snapped = process_pair(bare_path, sup_path)
        out_path = sup_path.with_name(sup_path.name[: -len(".stl")] + ".contacts.json")
        out_path.write_text(json.dumps(out), encoding="utf-8")
        print(f"wrote {out_path.name}: {json.dumps(stats)}")
        if png_dir is not None:
            png_dir.mkdir(parents=True, exist_ok=True)
            save_png(bare, np.array(snapped).reshape(-1, 3), png_dir / f"pair_{idx}.png", f"pair {idx}")


if __name__ == "__main__":
    main()
