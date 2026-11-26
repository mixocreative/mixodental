"""The -sup line-up must find the pose at any origin and orientation, and refuse one that never fits.

Run: python -I -m unittest discover -s scripts -p "test_extract_sup_contacts.py"
"""
import importlib.util
import unittest
from pathlib import Path

import numpy as np
import trimesh
from scipy.spatial.transform import Rotation

spec = importlib.util.spec_from_file_location("extract", Path(__file__).with_name("extract-sup-contacts.py"))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)


def lumpy_part():
    """An asymmetric part (no mirror or turn maps it onto itself), denture-sized in mm."""
    base = trimesh.creation.box(extents=(40, 24, 8))
    bump = trimesh.creation.box(extents=(8, 6, 10))
    bump.apply_translation((12, 5, 8))
    nub = trimesh.creation.icosphere(subdivisions=2, radius=4)
    nub.apply_translation((-14, -7, 5))
    return trimesh.util.concatenate([base.subdivide().subdivide(), bump.subdivide(), nub])


def moved(mesh, degrees, axis, shift):
    T = np.eye(4)
    T[:3, :3] = Rotation.from_rotvec(np.radians(degrees) * np.asarray(axis, float) / np.linalg.norm(axis)).as_matrix()
    T[:3, 3] = shift
    out = mesh.copy()
    out.apply_transform(T)
    return out, T


def run(bare, target):
    return extract.register(bare, target, target, np.arange(len(target.vertices)))


class Register(unittest.TestCase):
    def test_turned_and_moved_same_mesh_is_found_exactly(self):
        bare = lumpy_part()
        for degrees, axis in ((137, (1, 2, 0.5)), (35, (0, 0, 1)), (180, (1, 0, 0))):
            target, truth = moved(bare, degrees, axis, (31, -44, 12.5))
            T, rms, method = run(bare, target)
            self.assertEqual(method, "exact", f"{degrees} deg")
            self.assertLess(rms, 1e-4)
            np.testing.assert_allclose(T, truth, atol=1e-3)

    def test_turned_remeshed_copy_lines_up_by_icp(self):
        bare = lumpy_part()
        target, truth = moved(bare.subdivide(), 120, (0.3, -1, 0.7), (-20, 8, 40))
        T, rms, method = run(bare, target)
        self.assertEqual(method, "icp")
        self.assertLess(rms, 0.05)
        np.testing.assert_allclose(T[:3, :3], truth[:3, :3], atol=1e-2)

    def test_an_unrelated_shape_is_refused_not_written(self):
        bare = lumpy_part()
        other = trimesh.creation.cylinder(radius=15, height=30, sections=48).subdivide()
        _, rms, method = run(bare, other)
        self.assertEqual(method, "failed")
        self.assertGreater(rms, extract.REJECT_RMS_MM)


def with_supports(part):
    """The part with three separate post-shaped supports ending just under its lowest face."""
    posts = []
    lo = part.bounds[0]
    for x, y in ((-10, -5), (0, 5), (10, -5)):
        post = trimesh.creation.cylinder(radius=0.4, height=6, sections=12)
        post.apply_translation((x, y, lo[2] - 3.05))
        posts.append(post)
    return posts


def pair_files(tmp, bare, target):
    scan, sup = Path(tmp) / "a.stl", Path(tmp) / "a-sup.stl"
    bare.export(scan)
    target.export(sup)
    return scan, sup


class Pair(unittest.TestCase):
    def test_how_moved_names_the_pose(self):
        T = np.eye(4)
        self.assertEqual(extract.how_moved(T), "none")
        T[:3, 3] = (5, 0, 0)
        self.assertEqual(extract.how_moved(T), "shifted")
        _, turned = moved(lumpy_part(), 30, (0, 0, 1), (0, 0, 0))
        self.assertEqual(extract.how_moved(turned), "turned")

    def test_a_raft_bigger_than_the_model_is_not_taken_for_it(self):
        import tempfile
        bare = lumpy_part()
        raft = trimesh.creation.box(extents=(70, 50, 2)).subdivide().subdivide()
        raft.apply_translation((0, 0, bare.bounds[0][2] - 7))
        target, _ = moved(trimesh.util.concatenate([bare] + with_supports(bare) + [raft]), 90, (0, 0, 1), (5, 5, 5))
        with tempfile.TemporaryDirectory() as tmp:
            out = extract.process_pair(*pair_files(tmp, bare, target))[0]
        self.assertEqual(out["status"], "ok", out["reason"])
        # the scan is three pieces (lumpy_part), so the model is the SET of target pieces matching them, not the raft
        self.assertEqual(out["model_found_by"], "matched the scan's parts")
        self.assertEqual(out["model_pieces"], 3)
        self.assertEqual(out["moved"], "turned")
        self.assertEqual(len(out["contacts"]), 3)

    def test_supports_joined_to_the_model_are_refused_with_the_reason(self):
        import tempfile
        bare = trimesh.creation.box(extents=(40, 24, 8)).subdivide().subdivide()
        bare.vertices[(bare.vertices[:, 0] > 15) & (bare.vertices[:, 1] > 8), 2] += 3  # one piece, no symmetry
        bottom = int(np.argmin(bare.triangles_center[:, 2]))
        a, b, c = bare.faces[bottom]
        far = bare.triangles_center[bottom] + (0, 0, -400)
        f = len(bare.vertices)
        # a long spike welded onto the model (one face replaced by a closed tent), so the result is ONE manifold
        # piece - as supports joined to the model by a boolean union would be
        fused = trimesh.Trimesh(vertices=np.vstack([bare.vertices, far[None]]),
                                faces=np.vstack([np.delete(bare.faces, bottom, axis=0), [[a, b, f], [b, c, f], [c, a, f]]]),
                                process=False)
        self.assertGreater(fused.area / bare.area, extract.FUSED_AREA_RATIO, "the test fin must be big enough")
        with tempfile.TemporaryDirectory() as tmp:
            out = extract.process_pair(*pair_files(tmp, bare, fused))[0]
        self.assertEqual(out["status"], "failed")
        self.assertIn("joined", out["reason"])
        self.assertEqual(out["contacts"], [])


if __name__ == "__main__":
    unittest.main()
