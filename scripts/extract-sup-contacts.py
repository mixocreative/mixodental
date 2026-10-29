"""Extract support-contact points for every <name>-sup.stl that has a bare partner <name>.stl.

Usage: python -I extract-sup-contacts.py <fixtures_root>

For each <dir>/<name>-sup.stl with <dir>/<name>.stl beside it, writes
<dir>/<name>-sup.contacts.json (format "mixo-sup-contacts/1"). Scans are read in place and never
modified. The outputs sit in git-ignored customer-data folders; do not add them to git.

Method:
  1. Denture/part component inside the -sup = largest face-connected component of the -sup.
  2. Support geometry = -sup vertices outside that component.
  3. Bare-to-sup transform = centroid start + point-to-point ICP (reported as icp_rms_mm).
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


def process_pair(bare_path, sup_path):
    bare = load(bare_path)
    sup = load(sup_path)

    groups = sorted(trimesh.graph.connected_components(sup.face_adjacency, min_len=1),
                    key=len, reverse=True)
    denture_faces = np.asarray(groups[0])
    den = trimesh.Trimesh(vertices=sup.vertices, faces=sup.faces[denture_faces], process=False)
    den_vert_set = np.unique(sup.faces[denture_faces])
    den_surface = den.sample(60000)

    bare_samp = bare.sample(20000)
    T0 = np.eye(4)
    T0[:3, 3] = den_surface.mean(0) - bare_samp.mean(0)
    T, rms = icp_point_to_point(bare_samp, den_surface, T0)

    sup_mask = np.ones(len(sup.vertices), bool)
    sup_mask[den_vert_set] = False
    support_pts = sup.vertices[sup_mask]

    bare_in_sup = bare.copy()
    bare_in_sup.apply_transform(T)
    d0, _ = cKDTree(bare_in_sup.vertices).query(support_pts,
                                                distance_upper_bound=TOUCH_MM * 4)
    cand = support_pts[d0 <= TOUCH_MM * 4]
    _, dist, _ = closest_on_mesh(bare_in_sup, cand, radius=1.0)
    cand = cand[dist <= TOUCH_MM]

    clusters = []
    if len(cand):
        pairs = cKDTree(cand).query_pairs(CLUSTER_MM, output_type="ndarray")
        parent = np.arange(len(cand))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in pairs:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
        roots = np.array([find(i) for i in range(len(cand))])
        clusters = [cand[roots == r] for r in np.unique(roots)]

    Tinv = np.linalg.inv(T)
    snapped, normals = [], []
    for c in clusters:
        cen_bare = apply(Tinv, c.mean(0)[None])
        closest, _, tri = closest_on_mesh(bare, cen_bare, radius=1.5)
        snapped.append(closest[0])
        normals.append(bare.face_normals[tri[0]])

    return {
        "format": FORMAT,
        "bare": bare_path.name,
        "sup": sup_path.name,
        "frame": "bare scan coordinates, mm",
        "transform_bare_to_sup": np.round(T, 6).tolist(),
        "icp_rms_mm": round(rms, 5),
        "contacts": np.round(np.array(snapped).reshape(-1, 3), 4).tolist(),
        "normals": np.round(np.array(normals).reshape(-1, 3), 5).tolist(),
        "cluster_mm": CLUSTER_MM,
        "touch_mm": TOUCH_MM,
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    root = Path(sys.argv[1])
    for sup_path in sorted(root.rglob("*-sup.stl")):
        bare_path = sup_path.with_name(sup_path.name[: -len("-sup.stl")] + ".stl")
        if not bare_path.exists():
            print(f"skip (no bare partner): {sup_path.name}")
            continue
        out = process_pair(bare_path, sup_path)
        out_path = sup_path.with_name(sup_path.name[: -len(".stl")] + ".contacts.json")
        out_path.write_text(json.dumps(out), encoding="utf-8")
        print(f"wrote {out_path.name}: contacts={len(out['contacts'])} icp_rms_mm={out['icp_rms_mm']}")


if __name__ == "__main__":
    main()
