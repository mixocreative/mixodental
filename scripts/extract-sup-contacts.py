"""Line ONE scan up with its supported target (-sup) and find where the target's supports touch it.

Usage: python -I extract-sup-contacts.py <scan.stl> <target-sup.stl> <out.json> [picture.png]

Normally run by typelab/targetMatch.mjs, which finds the pairs (targetPairs.mjs), keys the result by the CONTENT of
both files and keeps it under the git-ignored typelab/output/targets. Scans are read in place and never modified.
Output format "mixo-sup-contacts/2": status ok|failed with a reason, the transform, how the target was moved
(none / shifted / turned), the contacts and their normals. No file names are written into it.

Method:
  1. The model inside the -sup = the best-fitting of its biggest face-connected pieces (choose_model_piece: usually
     the largest; a raft or platform can be bigger). A model piece far bigger than the scan's surface has supports or
     a platform joined to it and is refused (FUSED_AREA_RATIO).
  2. Support geometry = -sup vertices outside that piece.
  3. Bare-to-sup transform, at ANY origin and orientation (a target is usually printed turned and moved
     relative to its scan): first a pose from the shapes alone (global_align: the principal axes matched
     all 24 proper ways, each refined by a short ICP, best trimmed RMS kept); then "exact" = least-squares
     fit on one-to-one vertex correspondences when the denture is the same mesh (RMS ~0); otherwise
     "icp" = point-to-plane ICP, then point-to-point. Above REJECT_RMS_MM the result is "failed" and NO
     contacts are written. rms_mm is reported; rms_flag_over_0.02_mm is set when it exceeds 0.02 mm.
  4. Contacts = for each support piece, its vertex nearest the lined-up scan surface, kept when within TIP_MM;
     those tips are projected onto the scan, mapped to the bare frame, clustered with CLUSTER_MM, and each
     cluster's centre snapped to the scan surface (normal = that face's normal). The older rule (every vertex
     within TOUCH_MM) is still counted in `stats` for comparison only.
"""
import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial import cKDTree

FORMAT = "mixo-sup-contacts/2"
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
# How many of the target's biggest pieces are tried as "the model" (choose_model_piece), and the surface ratio over
# which the model piece is taken to have supports or a platform joined to it.
MODEL_PIECES_TRIED = 3
FUSED_AREA_RATIO = 1.25
# A scan part and a target piece are the same part when their surface areas agree within AREA_MATCH; a scan piece
# under PART_MIN_SHARE of the scan's surface is debris, not a part; a target piece wholly within DEBRIS_MM of the scan
# is scan debris, not a support.
AREA_MATCH = 0.05
PART_MIN_SHARE = 0.01
DEBRIS_MM = 0.05
# Below these the target sits where the scan does (how_moved).
MOVED_DEG = 0.01
MOVED_MM = 0.01


def exact_fit(bare_v, den_v, T0=None, iters=30):
    """Least-squares fit on one-to-one vertex correspondences (identical meshes), from the pose T0. None if not 1:1."""
    if T0 is None:
        T0 = np.eye(4)
        T0[:3, 3] = den_v.mean(0) - bare_v.mean(0)
    T = T0.copy()
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


def principal_frame(pts):
    """Centre and right-handed principal axes (columns, largest spread first) of a point set."""
    c = pts.mean(0)
    w, E = np.linalg.eigh(np.cov((pts - c).T))
    E = E[:, np.argsort(w)[::-1]]
    if np.linalg.det(E) < 0:
        E[:, 2] = -E[:, 2]
    return c, E


def proper_axis_flips():
    """The 24 rotations that map the coordinate axes onto themselves (signed permutations, det +1)."""
    out = []
    for perm in ((0, 1, 2), (0, 2, 1), (1, 0, 2), (1, 2, 0), (2, 0, 1), (2, 1, 0)):
        for signs in np.array(np.meshgrid([1, -1], [1, -1], [1, -1])).T.reshape(-1, 3):
            S = np.zeros((3, 3))
            S[np.arange(3), perm] = signs
            if np.linalg.det(S) > 0:
                out.append(S)
    return out


def trimmed_rms(d, keep=0.9):
    """RMS of the closest `keep` share: a part the other mesh lacks (a cut base, a platform) does not drown a right pose."""
    d = np.sort(d)[: max(1, int(len(d) * keep))]
    return float(np.sqrt(np.mean(d ** 2)))


def global_align(bare_pts, den_pts, probe=3000, iters=15):
    """A pose of the bare scan onto the -sup's model from the shapes alone, at ANY origin and orientation.

    The owner's targets are routinely printed at another angle, and moved, relative to their scan (2026-11-27: "the
    scanned and supported models won't match origin and orientation, and that's normal"). The old start was the
    centroid shift with NO rotation, so every turned target fell into a wrong ICP minimum (rms 1.4-7.8 mm on 4 of 5
    turned pairs) and its contacts were written anyway. Here: match the principal axes in all 24 proper ways (an axis's
    sign and the order of two similar spreads are ambiguous), give each a short ICP, keep the lowest trimmed rms.
    """
    rng = np.random.default_rng(0)
    a = bare_pts[rng.choice(len(bare_pts), min(probe, len(bare_pts)), replace=False)]
    cb, Eb = principal_frame(bare_pts)
    cd, Ed = principal_frame(den_pts)
    tree = cKDTree(den_pts)
    best, best_rms = None, np.inf
    for S in proper_axis_flips():
        R = Ed @ S @ Eb.T
        T = np.eye(4)
        T[:3, :3] = R
        T[:3, 3] = cd - R @ cb
        for _ in range(iters):
            d, idx = tree.query(apply(T, a))
            T = kabsch(apply(T, a), den_pts[idx]) @ T
        d, _ = tree.query(apply(T, a))
        rms = trimmed_rms(d)
        if rms < best_rms:
            best, best_rms = T, rms
    return best


REJECT_RMS_MM = 0.5


def register(bare, sup, den, den_vert_set):
    """Return (T bare->sup, rms_mm, method). The pose is found first from the shapes (global_align), so origin and
    orientation may differ freely; then an exact vertex fit when the model is the same mesh, otherwise point-to-plane
    ICP refined by point-to-point ICP. method "failed" when even the best fit stays above REJECT_RMS_MM."""
    den_v = sup.vertices[den_vert_set]
    den_pts, den_fi = trimesh.sample.sample_surface(den, 60000, seed=1)
    den_n = den.face_normals[den_fi]
    bare_samp, _ = trimesh.sample.sample_surface(bare, 20000, seed=2)
    same_mesh = len(den.faces) == len(bare.faces) and len(den_v) == len(bare.vertices)
    # A target only LIFTED from its scan fits exactly from the centroid shift: keep that path first, so the global search
    # cannot trade an exact fit (rms ~0) for an ICP one with a residual turn - which moved the contacts of the shifted
    # pairs by a few on the first run of global_align.
    if same_mesh:
        T, rms = exact_fit(bare.vertices, den_v)
        if T is not None and rms <= EXACT_RMS_MM:
            return T, rms, "exact"
    T0 = global_align(bare_samp, den_pts)
    if same_mesh:
        T, rms = exact_fit(bare.vertices, den_v, T0)
        if T is not None and rms <= EXACT_RMS_MM:
            return T, rms, "exact"
    T = icp_point_to_plane(bare_samp, den_pts, den_n, T0)
    T, _ = icp_point_to_point(bare_samp, den_pts, T)
    # The gap to the target's SURFACE (along its normal), not to its nearest sample point: point-to-point between two
    # random samplings never drops below the sample spacing (~0.1 mm here), which reads as a pose error on a right fit.
    _, idx = cKDTree(den_pts).query(apply(T, bare_samp))
    rms = trimmed_rms(np.abs(np.einsum("ij,ij->i", den_n[idx], apply(T, bare_samp) - den_pts[idx])))
    return T, rms, ("icp" if rms <= REJECT_RMS_MM else "failed")


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


def how_moved(T):
    """What the target's pose is relative to its scan: "none", "shifted" (moved only) or "turned" (and maybe moved).
    The scan is never changed: this only says the review must use the transform (a new origin) to draw the target."""
    turn_deg = float(np.degrees(np.arccos(np.clip((np.trace(T[:3, :3]) - 1) / 2, -1, 1))))
    shift_mm = float(np.linalg.norm(T[:3, 3]))
    if turn_deg < MOVED_DEG:
        return "none" if shift_mm < MOVED_MM else "shifted"
    return "turned"


def piece_areas(mesh, groups):
    return [float(mesh.area_faces[np.asarray(g)].sum()) for g in groups]


def pieces_like_the_scan(bare, sup, groups):
    """The target's pieces that match the scan's own parts by surface area (within AREA_MATCH), or None when a part of
    the scan has no partner. TRAP: a scan is not always one piece - an aligner with two hooks is three, and a target
    keeps them apart - so "the model" is a SET of pieces. Parts under PART_MIN_SHARE of the scan are debris, not parts."""
    scan_groups = trimesh.graph.connected_components(bare.face_adjacency, min_len=1)
    scan_areas = piece_areas(bare, scan_groups)
    parts = sorted((a for a in scan_areas if a >= PART_MIN_SHARE * sum(scan_areas)), reverse=True)
    target_areas = piece_areas(sup, groups)
    chosen = []
    for area in parts:
        fits = [j for j in range(len(groups)) if j not in chosen and abs(target_areas[j] - area) <= AREA_MATCH * area]
        if not fits:
            return None
        chosen.append(min(fits, key=lambda j: abs(target_areas[j] - area)))
    return chosen


def choose_model(bare, sup, groups):
    """Which pieces of the target ARE the scanned part, and the line-up. First the pieces that match the scan's parts
    by area; failing that (supports or a platform joined to the model change its area) each of the
    MODEL_PIECES_TRIED biggest pieces alone - TRAP: a raft can be bigger than the model. The best fit is kept.
    Returns (pieces, how, den, den_vert_set, T, rms, method)."""
    matched = pieces_like_the_scan(bare, sup, groups)
    tries = ([(matched, "matched the scan's parts")] if matched else []) + \
        [([j], f"piece {j + 1} by size") for j in range(min(MODEL_PIECES_TRIED, len(groups)))]
    best = None
    for pieces, how in tries:
        faces = np.concatenate([np.asarray(groups[j]) for j in pieces])
        den = trimesh.Trimesh(vertices=sup.vertices, faces=sup.faces[faces], process=False)
        den_vert_set = np.unique(sup.faces[faces])
        T, rms, method = register(bare, sup, den, den_vert_set)
        if best is None or rms < best[5]:
            best = (pieces, how, den, den_vert_set, T, rms, method)
        if method != "failed":
            break  # the first try that lines up is kept: the next ones are slower guesses
    return best


def process_pair(bare_path, sup_path):
    bare = load(bare_path)
    sup = load(sup_path)

    groups = sorted(trimesh.graph.connected_components(sup.face_adjacency, min_len=1),
                    key=len, reverse=True)
    model_pieces, model_how, den, den_vert_set, T, rms, method = choose_model(bare, sup, groups)
    # A model much bigger than the scan has supports or a platform JOINED to it: its contacts would be missing (they are
    # inside the model piece) and the comparison would look like a real one. Refuse it with that reason.
    area_ratio = float(den.area / bare.area) if bare.area > 0 else float("inf")
    reason = None
    fused = (f"the model in the target is {area_ratio:.2f} times the scan's surface, so supports or a platform look "
             "joined to it and its support spots cannot be told apart")
    if method == "failed":
        reason = f"the target never lines up with the scan: best gap {rms:.3f} mm, the limit is {REJECT_RMS_MM} mm"
        if area_ratio > FUSED_AREA_RATIO:
            reason += f"; {fused}"
    elif area_ratio > FUSED_AREA_RATIO:
        method = "failed"
        reason = fused

    bare_in_sup = bare.copy()
    bare_in_sup.apply_transform(T)
    Tinv = np.linalg.inv(T)
    scan_tree = cKDTree(bare_in_sup.vertices)

    # support pieces = every piece but the model's, minus scan DEBRIS: a piece lying wholly on the scan's surface is a
    # loose bit of the scan copied into the target (a scan can carry hundreds of stray triangles), and its "nearest
    # point" would read as a support tip at distance 0. A real support reaches away from the model.
    comp_of_v = np.full(len(sup.vertices), -1, dtype=int)
    debris = 0
    for k, g in enumerate(groups, start=1):
        if k - 1 in model_pieces:
            continue
        verts = np.unique(sup.faces[np.asarray(g)])
        if np.all(scan_tree.query(sup.vertices[verts])[0] <= DEBRIS_MM):
            debris += 1
            continue
        comp_of_v[verts] = k
    sup_mask = comp_of_v >= 0
    sup_mask[den_vert_set] = False
    sup_idx = np.where(sup_mask)[0]
    support_pts = sup.vertices[sup_idx]

    # exact distance of every support vertex to the bare surface (prefiltered)
    d0, _ = scan_tree.query(support_pts, distance_upper_bound=TOUCH_MM * 4)
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
    # A pose that never fitted gives contacts in the wrong place, which reads as a real comparison: write none, and let
    # `registration: "failed"` say why (the review shows the target as not lined up).
    clusters = [] if method == "failed" else cluster_points(proj_bare, CLUSTER_MM)
    snapped, normals = [], []
    for c in clusters:
        p = proj_bare[c].mean(0)
        closest, _, ftri = closest_on_mesh(bare, p[None], radius=1.5)
        snapped.append(closest[0])
        normals.append(bare.face_normals[ftri[0]])

    if reason is None and len(snapped) == 0:
        reason = "no support of the target touches the model"
    stats = {
        "pieces": int(len(best)),
        "piece_nearest_mm_min": round(float(piece_d.min()), 4) if len(piece_d) else None,
        "piece_nearest_mm_median": round(float(np.median(piece_d)), 4) if len(piece_d) else None,
        "piece_nearest_mm_p90": round(float(np.percentile(piece_d, 90)), 4) if len(piece_d) else None,
        "accepted_pieces": len(accepted),
        "old_count_touch_0.3mm": old_count,
        "new_count": len(snapped),
    }
    # No file names inside: the result is found by the CONTENT of both files (typelab/targetMatch.mjs), and a name
    # means nothing (owner, 2026-11-27).
    out = {
        "format": FORMAT,
        "status": "ok" if reason is None else "failed",
        "reason": reason,
        "frame": "bare scan coordinates, mm",
        "transform_bare_to_sup": np.round(T, 6).tolist(),
        "moved": how_moved(T),
        "model_pieces": len(model_pieces),
        "model_found_by": model_how,
        "model_area_ratio": round(area_ratio, 4),
        "scan_debris_pieces": debris,
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
    """ONE pair per call. Which files ARE a pair, and where the result is kept, is typelab/targetMatch.mjs's job
    (targetPairs.mjs is the pairing rule): this script only lines one pair up and finds its support spots."""
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = sys.argv[1:]
    if len(args) not in (3, 4) or args[0] in ("-h", "--help"):
        print("usage: python -I extract-sup-contacts.py <scan.stl> <target-sup.stl> <out.json> [picture.png]")
        sys.exit(2)
    bare_path, sup_path, out_path = Path(args[0]), Path(args[1]), Path(args[2])
    out, stats, bare, _, snapped = process_pair(bare_path, sup_path)
    out["stats"] = stats
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out), encoding="utf-8")
    print(json.dumps({"status": out["status"], "reason": out["reason"], "moved": out["moved"], **stats}))
    if len(args) == 4:
        save_png(bare, np.array(snapped).reshape(-1, 3), Path(args[3]), "pair")


if __name__ == "__main__":
    main()
