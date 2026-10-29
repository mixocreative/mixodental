/*
 * One case of the folder review: every STL under the given folders goes through the app's own dental pipeline
 * (import, orientation, print-angle search and its confirm, region, placement, Rust `generate` with
 * its safety and island checks), and
 * each result is written as a review GLB plus one summary for the viewer (`serve.mjs`).
 *
 *   (driven by batch.ts; tested by reviewCase.test.ts)
 *
 * Output names are case-001.glb, case-002.glb...; the original file paths appear only in
 * summary.json / summary.csv inside the output folder, which Git ignores (patient data).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { nodeEngine, parseStl } from '../../scripts/node-engine';
import { buildDentalReview, pickPrintAngle } from '../../scripts/dental-region-review/build';
import { tiltLabel } from '@mixo-geocore/host/dental/dentalTilt';
import { exportDentalRegionReview } from '../../scripts/dental-region-review/review';
import { removeDegenerateTriangles } from '@mixo-geocore/host/core/removeDegenerate';
import { explainReason } from './reasons';

export type CaseRow = {
  case: string; source: string; result: 'built' | 'inconclusive' | 'error'; reason: string;
  /** `reason` in plain words with what to do next (empty when there is no reason). */
  explanation: string; seconds: number;
  verdict: string; crossings: number; uncertain: number; islandsUnresolved: number; islandsOutsideArea: number;
  tipsPlaced: number; tipsLeftOut: number; outerGapMm: number | null; openingGapMm: number | null;
  rimNeedsReview: boolean; needsLook: boolean; glb: string;
  /** The print angle the app's Step 1 chose (degrees), its stable band, and whether the confirm held. */
  printAngleDeg: number | null; stableBand: string; angleReason: string; angleConfirmed: boolean;
  /** Structures the repair switched off because they crossed the aligner (tree, brace), joined by '+'. */
  structuresLeftOut: string;
  /** Collapsed triangles (repeated corner or zero area) the batch removed before processing; 0 = scan untouched. */
  cleanedDegenerateTriangles: number;
};

/** Runs one STL through the pipeline; writes `<name>.glb` into `out` when it builds. Never throws: errors land in `row.reason`. */
export async function reviewCase(file: string, name: string, out: string): Promise<CaseRow> {
  const started = performance.now();
  const row: CaseRow = { case: name, source: file, result: 'error', reason: '', explanation: '', seconds: 0, verdict: '', crossings: 0, uncertain: 0,
    islandsUnresolved: 0, islandsOutsideArea: 0, tipsPlaced: 0, tipsLeftOut: 0, outerGapMm: null, openingGapMm: null,
    rimNeedsReview: false, needsLook: true, glb: '', printAngleDeg: null, stableBand: '', angleReason: '', angleConfirmed: false, structuresLeftOut: '', cleanedDegenerateTriangles: 0 };
  try {
    const bytes = readFileSync(file);
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    // Explicit, reported clean-up (batch only; the interactive import is unchanged).
    const cleaned = removeDegenerateTriangles(nodeEngine, mesh.positions, mesh.indices);
    if (cleaned.removed > 0) {
      mesh.indices = cleaned.indices;
      row.cleanedDegenerateTriangles = cleaned.removed;
    }
    // Centred as the app's import does, so the review sees the same coordinates as the app.
    nodeEngine.center_positions_in_place(mesh.positions);
    const angle = pickPrintAngle(mesh);
    if (angle.kind === 'angle') {
      const { scan } = angle;
      Object.assign(row, { printAngleDeg: Number(tiltLabel(scan.rows[angle.index]!.tiltDeg)), angleReason: scan.reason, angleConfirmed: angle.confirmed,
        stableBand: scan.band ? `${tiltLabel(scan.rows[scan.band[0]]!.tiltDeg)}-${tiltLabel(scan.rows[scan.band[1]]!.tiltDeg)}` : 'none' });
    }
    const review = buildDentalReview(mesh, angle.kind === 'angle' ? angle.rotation : undefined);
    if (review.kind === 'inconclusive') {
      Object.assign(row, { result: 'inconclusive', reason: review.reason });
    } else {
      const { supports } = review;
      const issues = supports.verdict?.issues ?? [];
      const islands = supports.islands?.status === 'ok' ? supports.islands.islands : [];
      // Markers sit on a vertex of the crossed face (or the island's vertex): a lookup, no geometry here.
      const vertex = (v: number) => [0, 1, 2].map((axis) => mesh.positions[v * 3 + axis]!);
      const faceVertex = (face: number) => vertex(mesh.indices[face * 3]!);
      const glb = await exportDentalRegionReview(mesh, review.region,
        { supports, frame: review.frame, bands: review.bands, diagnosticContacts: review.diagnosticContacts,
          proposedTips: review.placement.points.length, droppedTips: supports.dropped.length },
        [
          { name: 'MARK support crosses the model', color: 0xff0033, points: issues.filter((i) => i.blocked).flatMap((i) => faceVertex(i.modelFace)) },
          { name: 'MARK crossing that could not be judged', color: 0xffaa00, points: issues.filter((i) => !i.blocked).flatMap((i) => faceVertex(i.modelFace)) },
          { name: 'MARK low point with no support', color: 0x8800ff, points: islands.filter((i) => i.status === 'unresolved').flatMap((i) => vertex(i.vertex)) },
          { name: 'MARK low point outside the area', color: 0x4a6fa5, points: islands.filter((i) => i.status === 'outside-policy').flatMap((i) => vertex(i.vertex)) },
        ]);
      writeFileSync(join(out, `${name}.glb`), Buffer.from(glb));
      const rim = supports.dentalRimCoverage;
      Object.assign(row, {
        result: 'built', reason: supports.verdict?.reason ?? (supports.islands?.status === 'inconclusive' ? `islands: ${supports.islands.reason}` : ''),
        verdict: supports.verdict?.status ?? 'none', crossings: issues.filter((i) => i.blocked).length, uncertain: issues.filter((i) => !i.blocked).length,
        islandsUnresolved: islands.filter((i) => i.status === 'unresolved').length,
        islandsOutsideArea: islands.filter((i) => i.status === 'outside-policy').length,
        tipsPlaced: review.placement.points.length - supports.dropped.length, tipsLeftOut: supports.dropped.length,
        outerGapMm: rim ? +rim.outer.maxGapMm.toFixed(2) : null, openingGapMm: rim ? +rim.opening.maxGapMm.toFixed(2) : null,
        rimNeedsReview: rim?.needsReview ?? false, glb: `${name}.glb`,
        structuresLeftOut: (supports.dentalStructureFallback ?? []).join('+'),
      });
    }
  } catch (error) {
    row.reason = error instanceof Error ? error.message : String(error);
  }
  row.explanation = row.reason ? explainReason(row.reason) : '';
  row.seconds = +((performance.now() - started) / 1000).toFixed(1);
  row.needsLook = row.result !== 'built' || row.verdict !== 'clear' || row.islandsUnresolved > 0 || row.rimNeedsReview;
  return row;
}
