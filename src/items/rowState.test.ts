import { describe, expect, it } from 'vitest';
import type { LoopFill, RepairReport, RepairResult, RepairSteps } from '@mixo-geocore/host/core/repairMesh';
import type { ImportDiagnosis } from '../workers/importProtocol';
import { ROW_STATES, offersRepair, verdictOfDiagnosis, verdictOfRefusal, verdictOfRepair } from './rowState';

/** A watertight verdict as the worker sends it; each test changes only the field it is about. */
const found = (over: Partial<ImportDiagnosis> = {}): ImportDiagnosis => ({
  watertight: true, boundaryLoops: 0, longestRimMm: 0, nonManifoldEdges: 0,
  windingConsistent: true, bodies: 1, ...over,
});

/** The full report, still needed for the `after` side of a repair result. */
const report = (over: Partial<RepairReport> = {}): RepairReport => ({
  triangles: 1000, vertices: 502, bodies: [], boundaryLoops: 0, boundaryEdges: 0,
  nonManifoldEdges: 0, nonManifoldVertices: 0, closed: true, windingConsistent: true,
  watertight: true, noiseShells: 0, bodyGapMm: 0.005, ...over,
});

const result = (over: Partial<RepairResult> = {}): RepairResult => ({
  ok: true, reason: '', changed: true,
  positions: new Float32Array(), indices: new Uint32Array(),
  before: report({ watertight: false, nonManifoldEdges: 4 }), after: report(),
  steps: {} as RepairSteps, fills: [], ...over,
});

const fill = (reason: LoopFill['reason']): LoopFill =>
  ({ body: 0, lengthMm: 3, edges: 8, flatness: 0.1, filled: reason === '', reason, strategy: 'none', trianglesAdded: 0 });

describe('a row state is decided in one place', () => {
  it('covers every state it declares, and declares every state it covers', () => {
    const reached = new Set<string>([
      verdictOfRefusal({ kind: 'unreadable', code: 'StlFormatError' }).state,
      verdictOfRefusal({ kind: 'too-big', limit: 'plate' }).state,
      verdictOfDiagnosis(found()).state,
      verdictOfDiagnosis(found({ watertight: false, boundaryLoops: 2 })).state,
      verdictOfDiagnosis(found({ watertight: false })).state,
      verdictOfRepair(result({ ok: false, reason: 'body-invariant:weld' })).state,
      verdictOfRepair(result({ changed: false })).state,
      verdictOfRepair(result()).state,
      verdictOfRepair(result({ after: report({ watertight: false, boundaryLoops: 1 }) })).state,
    ]);
    expect([...reached].sort()).toEqual([...ROW_STATES].sort());
  });

  /*
   * THE PARTITION, which is the whole point. An earlier plan revision had a table whose rows were not
   * exhaustive, so a holed file fell through to a row reading "Clean. Nothing to do." about a file the
   * operator was about to print. These three conditions cannot overlap and cannot all miss.
   */
  it('before a press: watertight, holes, or malformed - and never two of them', () => {
    expect(verdictOfDiagnosis(found())).toEqual({ state: 'clean' });
    expect(verdictOfDiagnosis(found({ watertight: false, boundaryLoops: 3, longestRimMm: 4.25 })))
      .toEqual({ state: 'holes', loops: 3, longestMm: 4.25 });
    expect(verdictOfDiagnosis(found({ watertight: false, nonManifoldEdges: 5547, windingConsistent: false })))
      .toEqual({ state: 'malformed', nonManifoldEdges: 5547, windingConsistent: false });
  });

  /*
   * THE CASE THE REAL SCANS ACTUALLY LAND IN. `scripts/measure-rim-loops.mjs` over the 18 local scans:
   * ZERO open boundary rims anywhere, and up to 5,547 non-manifold edges on 8 of them. So a mesh can
   * be "not watertight" with no hole in it, and `clean` must not claim otherwise.
   */
  it('calls a non-manifold mesh with no open rim malformed, not clean', () => {
    const measured = found({ watertight: false, boundaryLoops: 0, nonManifoldEdges: 447 });
    expect(verdictOfDiagnosis(measured).state).toBe('malformed');
    expect(verdictOfDiagnosis(measured).state).not.toBe('clean');
  });

  it('after a press: refused, unchanged, repaired, or repaired with loops left', () => {
    expect(verdictOfRepair(result({ ok: false, reason: 'body-invariant:manifold' })))
      .toEqual({ state: 'refused', step: 'manifold' });
    expect(verdictOfRepair(result({ changed: false }))).toEqual({ state: 'unchanged' });
    expect(verdictOfRepair(result())).toEqual({ state: 'repaired' });
    expect(verdictOfRepair(result({
      after: report({ watertight: false, boundaryLoops: 2 }),
      fills: [fill('fill-too-long'), fill('fill-too-long'), fill(''), fill('fill-non-planar')],
    }))).toEqual({ state: 'repaired-open', loops: 2, reasons: ['fill-too-long', 'fill-non-planar'] });
  });

  /*
   * A repair that ran, was not refused and changed nothing is NOT "repaired". With the fill limit at 0
   * - which is what the measurement set it to, because no rim exists to justify any other number -
   * every loop reports `fill-disabled`, and `fill-disabled` is not a refusal. So `ok` is true and
   * `changed` is false, and this state is on the common path rather than a curiosity.
   */
  it('does not call an untouched file repaired', () => {
    expect(verdictOfRepair(result({ ok: true, changed: false, fills: [fill('fill-disabled')] })))
      .toEqual({ state: 'unchanged' });
  });

  it('offers Repair only where a repair could help, and never after a refusal', () => {
    expect(offersRepair(verdictOfDiagnosis(found({ watertight: false, boundaryLoops: 1 })))).toBe(true);
    expect(offersRepair(verdictOfDiagnosis(found({ watertight: false })))).toBe(true);
    expect(offersRepair(verdictOfDiagnosis(found()))).toBe(false);
    // The press that was just refused must not be offered again with nothing changed about the file.
    expect(offersRepair(verdictOfRepair(result({ ok: false, reason: 'body-invariant:weld' })))).toBe(false);
    expect(offersRepair(verdictOfRefusal({ kind: 'unreadable', code: 'StlEmptyError' }))).toBe(false);
    expect(offersRepair(verdictOfRefusal({ kind: 'too-big', limit: 'memory' }))).toBe(false);
  });

  it('keeps the refusing step, so the row can say which one refused', () => {
    for (const step of ['weld', 'degenerate', 'manifold', 'winding']) {
      expect(verdictOfRepair(result({ ok: false, reason: `body-invariant:${step}` })))
        .toEqual({ state: 'refused', step });
    }
  });
});
