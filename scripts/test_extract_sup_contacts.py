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


if __name__ == "__main__":
    unittest.main()
