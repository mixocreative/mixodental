"""cia audit, 2026-11-11 — read an exported STL with a parser that is not ours (S24 class e).

The product's one deliverable is the STL a slicer opens. Everything that proves it today is ours:
`src/supports/export.test.ts` writes the file with `encodeStl` and reads it back with our own
reader ("writes STL Z-up and reads it back Y-up unchanged"), which is S21's self-consistent codec —
it shows the two halves agree, never that the half outside agrees.

So this reads a file the app actually wrote with **trimesh**, an independent library, and asserts
the three things a slicer depends on and a round trip cannot see:

  1. the triangle count in the 80-byte header is the count a third-party parser finds;
  2. the model stands on z = 0 and rises in +z — the Z-up frame slicers assume, which the app's
     own space (y-up) is not;
  3. the winding is consistent and the solid's signed volume is positive, i.e. the normals point
     outward. The y/z swap `(x, y, z) -> (x, -z, y)` is a rotation and not a reflection, so this
     must hold; a reflection would pass every round-trip test we own and arrive inside-out.

Usage: python -I verify-exported-stl.py <file.stl> [more.stl ...]
"""
import struct
import sys

import trimesh


def check(path: str) -> bool:
    with open(path, "rb") as handle:
        header = handle.read(84)
    declared = struct.unpack_from("<I", header, 80)[0]
    mesh = trimesh.load(path, file_type="stl", process=False)
    lo, hi = mesh.bounds
    ok = True

    def say(name: str, passed: bool, detail: str) -> None:
        nonlocal ok
        ok = ok and passed
        print(f"  {'PASS' if passed else 'FAIL'} {name}: {detail}")

    print(f"{path}")
    say("header count equals what an independent parser finds",
        declared == len(mesh.faces), f"header {declared}, trimesh {len(mesh.faces)}")
    say("stands on the plate at z = 0 and rises in +z (Z-up, as a slicer assumes)",
        abs(lo[2]) < 1e-3 and hi[2] > lo[2],
        f"z {lo[2]:.6f} .. {hi[2]:.3f}, x {lo[0]:.3f} .. {hi[0]:.3f}, y {lo[1]:.3f} .. {hi[1]:.3f}")
    say("winding is consistent", bool(mesh.is_winding_consistent), str(mesh.is_winding_consistent))
    say("normals point outward (positive signed volume)",
        mesh.volume > 0, f"signed volume {mesh.volume:.3f} mm^3")
    return ok


if __name__ == "__main__":
    files = sys.argv[1:]
    if not files:
        raise SystemExit("give me one or more exported .stl files")
    results = [check(name) for name in files]
    print(f"\n{sum(results)} of {len(results)} file(s) pass")
    raise SystemExit(0 if all(results) else 1)
