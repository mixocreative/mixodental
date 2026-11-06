/*
 * WHAT AN IMPORTED FILE'S ROW SAYS, decided once and in one place.
 *
 * A row on the Items page reports one of a closed set of states. This module is the whole of that
 * decision: pure, no React, no DOM, no strings - it returns a state and the numbers that state needs,
 * and the UI chooses the words. Tested without a browser, so the set can be proven exhaustive.
 *
 * WHY IT LIVES HERE AND NOT UNDER `import/`. It was written into `src/core/import/` first, on a
 * reviewer's suggestion, and `importOracleBoundary.test.ts` refused it: that folder is pinned to
 * exactly `estimate.ts` and `stlHeader.ts` because the TS import geometry was deliberately moved to
 * Rust (SHIP-PLAN rule 6), and the guard keeps it from creeping back. Widening the guard's list to
 * admit this file would have weakened a boundary that is doing its job.
 *
 * It belongs here anyway: this decides WHAT A ROW SAYS, which is the Items page's domain, not the
 * importer's. The importer produces a report; this turns a report into a row.
 *
 * THREE SOURCES, NOT ONE. Half of what a row can say never reaches `diagnose_mesh` at all: a file can
 * fail to parse, or be refused by a capacity guard, before any mesh exists. So the input is a union,
 * and each entry point is separate rather than one function taking an optional everything.
 *
 * WHY THE SETS ARE WHAT THEY ARE (docs/design/2026-11-07-import-and-items-flow.md section 3):
 *
 *   - `watertight` means every body closed. It is NOT the same as "no holes": a mesh with
 *     non-manifold edges and no open rim at all is not watertight, and `scripts/measure-rim-loops.mjs`
 *     found exactly that on 8 of the 18 real scans - zero boundary rims, up to 5,547 non-manifold
 *     edges. So `malformed` is the state the measured corpus actually lands in, and `holes` is the
 *     one it never reaches.
 *   - A repair that is REFUSED returns the file unchanged with `ok: false`. That is not an error to
 *     throw: it is a state the operator reads, and it must not re-offer the press that just failed.
 *   - A repair that ran and changed NOTHING is its own state. Calling it "repaired" would be a false
 *     statement about a file the operator is about to print, and with the fill limit at 0 (no rim was
 *     measured, so none is permitted) every loop reports `fill-disabled`, which is not a refusal -
 *     so this state is reachable, not theoretical.
 */

import type { FillReason, RepairReport, RepairResult } from '@mixo-geocore/host/core/repairMesh';

/** Which capacity guard turned a file away. Each has its own sentence; none of them means "unreadable". */
export type CapacityLimit = 'triangles' | 'memory' | 'plate';

/** A file that never became a mesh. */
export type ImportRefusal =
  /** The reader could not parse it: a damaged or empty STL, or non-finite coordinates. */
  | { readonly kind: 'unreadable'; readonly code: string }
  /** It parsed and was then turned away by a guard. The file is fine; it does not fit. */
  | { readonly kind: 'too-big'; readonly limit: CapacityLimit };

/**
 * Every state a row can be in. Discriminated so a `switch` over `state` is exhaustive and the
 * compiler says so when one is added.
 */
export type RowState =
  | { readonly state: 'unreadable'; readonly code: string }
  | { readonly state: 'too-big'; readonly limit: CapacityLimit }
  | { readonly state: 'clean' }
  | { readonly state: 'holes'; readonly loops: number; readonly longestMm: number }
  | { readonly state: 'malformed'; readonly nonManifoldEdges: number; readonly windingConsistent: boolean }
  | { readonly state: 'refused'; readonly step: string }
  | { readonly state: 'unchanged' }
  | { readonly state: 'repaired' }
  | { readonly state: 'repaired-open'; readonly loops: number; readonly reasons: readonly FillReason[] };

/** The state names, for a catalogue page that must show every one of them. */
export const ROW_STATES = ['unreadable', 'too-big', 'clean', 'holes', 'malformed',
  'refused', 'unchanged', 'repaired', 'repaired-open'] as const;

/** A file that never parsed or was refused by a guard. */
export const verdictOfRefusal = (refusal: ImportRefusal): RowState =>
  (refusal.kind === 'unreadable' ? { state: 'unreadable', code: refusal.code } : { state: 'too-big', limit: refusal.limit });

/**
 * BEFORE ANY REPAIR PRESS - three states, and they are a partition.
 *
 * `watertight` is checked first because it implies no open rim, so the three conditions cannot
 * overlap; and the third is `else`, so nothing falls through. An earlier draft of the plan listed
 * these as four rows keyed partly on `changed()`, which is a field of the REPAIR report and does not
 * exist before a press - that table could report a holed file as "Clean".
 */
export function verdictOfDiagnosis(report: RepairReport): RowState {
  if (report.watertight) return { state: 'clean' };
  if (report.boundaryLoops > 0) {
    const longest = report.bodies.flatMap((body) => body.loopLengthsMm);
    return { state: 'holes', loops: report.boundaryLoops, longestMm: longest.length > 0 ? Math.max(...longest) : 0 };
  }
  return { state: 'malformed', nonManifoldEdges: report.nonManifoldEdges, windingConsistent: report.windingConsistent };
}

/**
 * AFTER A REPAIR PRESS - four states, also a partition: refused, then unchanged, then watertight or
 * not. `reasons` carries only the loops left open, deduplicated, because a row shows why rather than
 * how many times.
 */
export function verdictOfRepair(result: RepairResult): RowState {
  if (!result.ok) return { state: 'refused', step: result.reason.replace(/^body-invariant:/, '') };
  if (!result.changed) return { state: 'unchanged' };
  if (result.after.watertight) return { state: 'repaired' };
  const reasons = [...new Set(result.fills.filter((fill) => fill.reason !== '').map((fill) => fill.reason))];
  return { state: 'repaired-open', loops: result.after.boundaryLoops, reasons };
}

/** Whether this state should offer the operator a Repair press. A refusal must never re-offer it. */
export const offersRepair = (row: RowState): boolean => row.state === 'holes' || row.state === 'malformed';
