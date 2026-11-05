import { describe, expect, it, vi } from 'vitest';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { RIM_SAMPLE_SPACING_MM, drawnRim, projectOntoMesh, type RimSession } from './drawnRim';

const at = (x: number, y: number, z: number, normal: readonly [number, number, number] = [0, 1, 0]): SurfaceAnchor =>
  ({ position: [x, y, z], normal: [...normal] });
/** A square loop 10 mm on a side: enough anchors to close, far enough apart to resample into a dense curve. */
const square = (closed = true): SurfacePath =>
  ({ anchors: [at(0, 0, 0), at(10, 0, 0), at(10, 0, 10), at(0, 0, 10)], closed });

/** A miss everywhere: `pick` reports face -1, which is what the engine returns for a ray that hits nothing. */
const missing = () => Float64Array.of(-1, 0, 0, 0, 0);
/** A hit at a fixed spot, in the engine's layout: face, distance, x, y, z. */
const hitting = (x: number, y: number, z: number) => () => Float64Array.of(3, 1, x, y, z);

function engine(over: Partial<RimSession> & { ok?: boolean; reason?: string; floor?: number; flipped?: boolean } = {}): RimSession {
  const scalars = Float64Array.from([1, 0, 1, 0, 5, 0, 5, 1, 0, 0, 0, 0, 1, 96, -5, -5, 5, 5]);
  return {
    pick: over.pick ?? hitting(0, 0, 0),
    dental_rim_from_points: over.dental_rim_from_points ?? (() => ({
      ok: () => over.ok ?? true,
      reason: () => over.reason ?? '',
      floor_offset: () => over.floor ?? -0.23,
      flipped: () => over.flipped ?? false,
      rim_scalars: () => scalars,
      take_rim_points: () => Float32Array.of(0, 0, 0, 1, 0, 0, 1, 0, 1),
      take_visibility_mask: () => new Uint8Array(96 * 96),
    })),
  };
}

describe('a drawn loop becoming a rim', () => {
  it('refuses a loop that is not closed, or has too few anchors to enclose anything', () => {
    expect(drawnRim(engine(), 1, square(false), 'p').kind).toBe('empty');
    expect(drawnRim(engine(), 1, { anchors: [at(0, 0, 0), at(1, 0, 0)], closed: true }, 'p').kind).toBe('empty');
  });

  it('answers our own refusals in our own words, without troubling the engine', () => {
    /*
     * A figure-eight has no interior, so its mask would be meaningless. The dock already has a sentence
     * for SELF_INTERSECTING in three languages; going to the engine for it would get `rim-collinear` or
     * nothing, and the operator would be told less than we already know.
     */
    const bowtie: SurfacePath = { anchors: [at(0, 0, 0), at(10, 0, 10), at(10, 0, 0), at(0, 0, 10)], closed: true };
    const session = engine();
    const spy = vi.spyOn(session, 'dental_rim_from_points');
    const out = drawnRim(session, 1, bowtie, 'p');
    /*
     * DEGENERATE_AREA, not SELF_INTERSECTING, and the order is right: a bowtie's two halves cancel, so
     * it encloses nothing at all, which is a more fundamental thing to tell the operator than the
     * crossing that caused it. `pathProblems` reports both; the dock says the first.
     */
    expect(out).toEqual({ kind: 'unusable', problem: 'DEGENERATE_AREA' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('hands the engine a DENSE curve, not the anchors', () => {
    const session = engine();
    const spy = vi.spyOn(session, 'dental_rim_from_points');
    expect(drawnRim(session, 7, square(), 'reference').kind).toBe('rim');
    const [mesh, points, flip, profile] = spy.mock.calls[0]!;
    // The SAME id reached both calls: the mesh it was projected onto is the mesh it was rastered against.
    expect([mesh, flip, profile]).toEqual([7, false, 'reference']);
    // Four anchors, 40 mm round at 0.5 mm spacing: far more points than anchors, and whole triples.
    expect(points.length % 3).toBe(0);
    expect(points.length / 3).toBeGreaterThan(60);
    expect(RIM_SAMPLE_SPACING_MM).toBeLessThan(1);
  });

  it('reads the rim back, and says when the engine could not decide the side', () => {
    const decided = drawnRim(engine(), 1, square(), 'p');
    expect(decided).toMatchObject({ kind: 'rim', sideUncertain: false, floorOffset: -0.23, flipped: false });
    /*
     * The uncertain case is a RIM, not a refusal: it is complete and usable, the floor just leaned too
     * little to say which way the opening faces. Treating it as a failure would throw away good work;
     * treating it as decided would put supports on the wrong side without anyone being asked.
     */
    const unsure = drawnRim(engine({ reason: 'rim-side-uncertain', floor: -0.01 }), 1, square(), 'p');
    expect(unsure).toMatchObject({ kind: 'rim', sideUncertain: true, floorOffset: -0.01 });
    if (unsure.kind === 'rim') expect(unsure.rim.boundaryKind).toBe('projection-fallback');
  });

  it('passes the operator flip through and reports what the engine did with it', () => {
    const session = engine({ flipped: true });
    const spy = vi.spyOn(session, 'dental_rim_from_points');
    expect(drawnRim(session, 1, square(), 'p', true)).toMatchObject({ kind: 'rim', flipped: true });
    expect(spy.mock.calls[0]![2]).toBe(true);
  });

  it('passes an engine refusal back with its reason rather than inventing one', () => {
    expect(drawnRim(engine({ ok: false, reason: 'rim-collinear' }), 1, square(), 'p'))
      .toEqual({ kind: 'refused', reason: 'rim-collinear' });
  });

  it('still produces a rim when the surface cannot be found under part of the curve', () => {
    // One unreachable stretch keeps its straight-line position rather than voiding the operator's work.
    expect(drawnRim(engine({ pick: missing }), 1, square(), 'p').kind).toBe('rim');
  });
});

describe('putting a point back on the surface', () => {
  it('casts from off the surface, inward first, and reports the hit', () => {
    const session = engine({ pick: hitting(1, 2, 3) });
    const spy = vi.spyOn(session, 'pick');
    expect(projectOntoMesh(session, 9)([0, 0, 0], [0, 1, 0])).toEqual([1, 2, 3]);
    const [handle, rays, , far, side] = spy.mock.calls[0]!;
    expect(handle).toBe(9);
    // Starts ABOVE the point and looks down: a ray begun on the surface starts inside what it seeks.
    expect(rays[1]).toBeGreaterThan(0);
    expect(rays[4]).toBe(-1);
    // Double-sided, because a rim runs round a shell and half of it is met from the inside.
    expect(side).toBe(2);
    // The ray is bounded: it must not find the far wall of a thin aligner.
    expect(far).toBeLessThanOrEqual(rays[1]! * 2);
  });

  it('tries the other way before giving up, for the stretch where the chord stands proud', () => {
    let calls = 0;
    const session = engine({ pick: () => (calls++ === 0 ? missing() : hitting(4, 5, 6)()) });
    expect(projectOntoMesh(session, 1)([0, 0, 0], [0, 1, 0])).toEqual([4, 5, 6]);
    expect(calls).toBe(2);
  });

  it('gives up honestly on a miss both ways, and on a normal that points nowhere', () => {
    expect(projectOntoMesh(engine({ pick: missing }), 1)([0, 0, 0], [0, 1, 0])).toBeUndefined();
    expect(projectOntoMesh(engine(), 1)([0, 0, 0], [0, 0, 0])).toBeUndefined();
  });
});
