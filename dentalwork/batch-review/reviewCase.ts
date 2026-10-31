/*
 * One case of the folder review: every STL under the given folders goes through the app's own dental pipeline
 * (import, orientation, print-angle search and its confirm, region, placement, Rust `generate` with
 * its safety and island checks), and
 * each result is written as a review GLB plus one summary for the viewer (`serve.mjs`). Step 1's
 * evidence (what the trim decided: `orientationEvidence.ts`) goes into the row and a companion GLB.
 *
 *   (driven by batch.ts; tested by reviewCase.test.ts)
 *
 * Output names are case-001.glb, case-002.glb...; the original file paths appear only in
 * summary.json / summary.csv inside the output folder, which Git ignores (patient data).
 */
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { nodeEngine, parseStl } from '../../scripts/node-engine';
import { buildDentalReview, pickPrintAngle } from '../../scripts/dental-region-review/build';
import { tiltLabel } from '@mixo-geocore/host/dental/dentalTilt';
import { dentalModelRotation, exportDentalRegionReview } from '../../scripts/dental-region-review/review';
import { removeDegenerateTriangles } from '@mixo-geocore/host/core/removeDegenerate';
import { REFERENCE_PROFILE } from '../../scripts/dental-region-review/profile';
import { explainReason } from './reasons';
import { NO_EVIDENCE, orientationEvidence, orientationLayers, type OrientationEvidence } from '../../src/dental/orientationEvidence';
import { orientationGlb } from './orientationEvidenceGlb';
import { LAYER_COLOURS } from './layerColours';
import { buildDentureReview, dentureLayers, reviewProfileId, shapeNote, type DentalKind } from './profileSelect';
import { peelReport } from './peelReport';
import { CONTACT_MAPPING_LIMIT_MM, boundsCentre, displayedContactCheck, dentureReviewDetail } from './dentureReviewLayers';

export type CaseRow = Omit<OrientationEvidence, 'rotation'> & {
  /** The Step 1 evidence GLB (trim chains, U ends, bottom plane, back arrow) beside `glb`, or ''. */
  orientationGlb: string;
  /** What the operator chose for this run (the shape check only verifies it). */
  kind: DentalKind;
  /** The shape check's note ('looks like a denture' / 'looks like an aligner') when the file does not look like `kind`; '' otherwise. */
  shapeNote: string;
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
  /** Denture only: the owner's contacts beside the bare scan (count, median distance to the scan in mm, share of the owner area we cover, share of ours outside it); null when absent. */
  ownerContacts: number | null; ownerContactsMedianMm: number | null; ownerAreaCoveredPct: number | null; outsideOwnerAreaPct: number | null;
  /** Denture only: the middle plane's state (fitted to the hard edges, or none); '' for an aligner. */
  middlePlane: string;
  /** Denture only: the up decision from the rim, in words ('' for an aligner or no review). */
  upDecision: string;
  /** Denture only: the review's tips per source, e.g. 'rim 12 / hole 3 / area 40 / low 2' ('' for an aligner). */
  tipsBySource: string;
  /** Denture only: tips on an overhang with no free path to the plate (not built). */
  unsupportableTips: number;
  /** Left-out tips per engine reason, e.g. 'leave-out:pillar 3' ('' when none). */
  tipsLeftOutReasons: string;
  /** Denture only: peel report (peelReport.ts). Largest layer area (mm²) above the raft, ours / the owner print, our max's height, layers where ours is >10% above the owner, most tips on one support tree, trunk/neck area ratio; null when not computed. */
  peelMaxOurs: number | null; peelMaxOursAtMm: number | null; peelMaxOwner: number | null; peelMaxOwnerAtMm: number | null; peelRaftTopMm: number | null; peelModelOnlyRatio: number | null; peelLayersOver: number | null; maxTipsPerTrunk: number | null; trunkToNeckArea: number | null;
  /** The per-layer chart data file (`case-001-peel.json`) beside the GLB, or ''; and why the report is missing, if it is. */
  peelFile: string; peelNote: string;
};

/** Runs one STL through the pipeline; writes `<name>.glb` into `out` when it builds. Never throws: errors land in `row.reason`. */
export async function reviewCase(file: string, name: string, out: string, kind: DentalKind = 'aligner'): Promise<CaseRow> {
  const started = performance.now();
  const { rotation: _unused, ...noEvidence } = NO_EVIDENCE;
  const row: CaseRow = { kind, shapeNote: '', case: name, source: file, result: 'error', reason: '', explanation: '', seconds: 0, verdict: '', crossings: 0, uncertain: 0,
    islandsUnresolved: 0, islandsOutsideArea: 0, tipsPlaced: 0, tipsLeftOut: 0, outerGapMm: null, openingGapMm: null,
    rimNeedsReview: false, needsLook: true, glb: '', printAngleDeg: null, stableBand: '', angleReason: '', angleConfirmed: false, structuresLeftOut: '', cleanedDegenerateTriangles: 0,
    ownerContacts: null, ownerContactsMedianMm: null, ownerAreaCoveredPct: null, outsideOwnerAreaPct: null, middlePlane: '',
    upDecision: '', tipsBySource: '', unsupportableTips: 0, tipsLeftOutReasons: '',
    peelMaxOurs: null, peelMaxOursAtMm: null, peelMaxOwner: null, peelMaxOwnerAtMm: null, peelRaftTopMm: null, peelModelOnlyRatio: null, peelLayersOver: null, maxTipsPerTrunk: null, trunkToNeckArea: null, peelFile: '', peelNote: '',
    ...noEvidence, orientationGlb: '' };
  let shapeMesh: TriangleMesh | undefined;
  try {
    const bytes = readFileSync(file);
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    // Explicit, reported clean-up (batch only; the interactive import is unchanged).
    const cleaned = removeDegenerateTriangles(nodeEngine, mesh.positions, mesh.indices);
    if (cleaned.removed > 0) {
      mesh.indices = cleaned.indices;
      row.cleanedDegenerateTriangles = cleaned.removed;
    }
    // Centred as the app's import does, so the review sees the same coordinates as the app. The centre
    // taken here maps the owner's contacts (bare STL frame) to the same frame (denture review).
    const centre = boundsCentre(mesh.positions);
    nodeEngine.center_positions_in_place(mesh.positions);
    shapeMesh = mesh;
    if (kind === 'denture') {
      await reviewDenture(file, mesh, name, out, row, centre);
      return finish(row, started, shapeMesh);
    }
    // Step 1 as the app runs it: arch kind and the up/down cross-check go into the row; the evidence
    // GLB is written below in the review's frame (or Step 1's own pose when nothing was built).
    const { rotation: step1Rotation, ...evidence } = orientationEvidence(mesh, REFERENCE_PROFILE);
    Object.assign(row, evidence);
    const angle = pickPrintAngle(mesh);
    if (angle.kind === 'angle') {
      const { scan } = angle;
      Object.assign(row, { printAngleDeg: Number(tiltLabel(scan.rows[angle.index]!.tiltDeg)), angleReason: scan.reason, angleConfirmed: angle.confirmed,
        stableBand: scan.band ? `${tiltLabel(scan.rows[scan.band[0]]!.tiltDeg)}-${tiltLabel(scan.rows[scan.band[1]]!.tiltDeg)}` : 'none' });
    }
    const review = buildDentalReview(mesh, angle.kind === 'angle' ? angle.rotation : undefined);
    // The evidence takes the model's own transform (lift from the review frame, pose from review.ts), so the overlays sit on the model.
    const evidenceFrame = review.kind === 'proposal' ? { position: review.frame.position, rotation: dentalModelRotation(mesh) }
      : step1Rotation ? { position: [0, 0, 0] as [number, number, number], rotation: step1Rotation } : undefined;
    if (evidenceFrame) {
      const layers = orientationLayers(mesh, REFERENCE_PROFILE);
      if (layers.length > 0) {
        writeFileSync(join(out, `${name}-orientation.glb`), Buffer.from(await orientationGlb(layers, evidenceFrame)));
        row.orientationGlb = `${name}-orientation.glb`;
      }
    }
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
          { name: 'MARK low point with no support', color: LAYER_COLOURS.lowUnsupported, points: islands.filter((i) => i.status === 'unresolved').flatMap((i) => vertex(i.vertex)) },
          { name: 'MARK low point outside the area', color: LAYER_COLOURS.lowOutside, points: islands.filter((i) => i.status === 'outside-policy').flatMap((i) => vertex(i.vertex)) },
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
  return finish(row, started, shapeMesh);
}

function finish(row: CaseRow, started: number, mesh: TriangleMesh | undefined): CaseRow {
  if (row.result !== 'built' && mesh) row.shapeNote = shapeNote(row.kind, mesh);
  row.explanation = [row.reason ? explainReason(row.reason) : '', row.shapeNote ? `This file ${row.shapeNote}; check the type chosen for the run.` : ''].filter(Boolean).join(' ');
  row.seconds = +((performance.now() - started) / 1000).toFixed(1);
  row.needsLook = row.result !== 'built' || row.verdict !== 'clear' || row.islandsUnresolved > 0 || row.rimNeedsReview || row.upCrossCheck === 'disagrees' || row.shapeNote !== '';
  return row;
}

/** Layer-name prefixes of the client GLB (`client/<case>.glb`): the result without the debug layers. */
const CLIENT_LAYERS = ['TEAL denture model', 'SUPPORT PILLARS (ours)', 'Allowed area', 'Rim edge', 'MARK low point outside', 'MARK low point with no support'];

/** The denture path (profileSelect.ts): upright, print angle, tips, supports; the GLB holds the model, supports and the upright plane. */
async function reviewDenture(file: string, mesh: TriangleMesh, name: string, out: string, row: CaseRow, centre: Vector): Promise<void> {
  const review = buildDentureReview(mesh);
  if (review.kind === 'inconclusive') {
    Object.assign(row, { result: 'inconclusive', reason: review.reason });
    return;
  }
  const { supports, scan, index } = review;
  const issues = supports.verdict?.issues ?? [];
  const islands = supports.islands?.status === 'ok' ? supports.islands.islands : [];
  // The host's denture review layers (faces, edges, box, middle plane), our placed tips and pillars, and the owner's
  // contacts, -sup supports and area comparison: all one GLB under the review frame.
  const detail = dentureReviewDetail(file, mesh, centre, review.frame, review.placed, reviewProfileId('denture'), scan.rows[index]!.tiltDeg, review.leftOutTips);
  const allLayers = [...dentureLayers(mesh, review), ...detail.layers];
  const glb = Buffer.from(await orientationGlb(allLayers, review.frame));
  writeFileSync(join(out, `${name}.glb`), glb);
  // Peel and strength report: layer areas of our print against the owner print, from the GLB just written. Never stops the case.
  try {
    const peel = peelReport(glb, review.supports);
    writeFileSync(join(out, `${name}-peel.json`), JSON.stringify(peel));
    Object.assign(row, { peelMaxOurs: peel.peelMaxOurs, peelMaxOursAtMm: peel.peelMaxOursAtMm, peelMaxOwner: peel.peelMaxOwner, peelMaxOwnerAtMm: peel.peelMaxOwnerAtMm, peelRaftTopMm: peel.raftTopMm, peelModelOnlyRatio: peel.modelOnlyRatio, peelLayersOver: peel.peelLayersOver,
      maxTipsPerTrunk: peel.maxTipsPerTrunk, trunkToNeckArea: peel.trunkToNeckArea, peelFile: `${name}-peel.json` });
  } catch (error) {
    row.peelNote = error instanceof Error ? error.message : String(error);
  }
  // The client copy: only the model, the allowed area, the rim edge, the low-point marks and our supports.
  mkdirSync(join(out, 'client'), { recursive: true });
  writeFileSync(join(out, 'client', `${name}.glb`), Buffer.from(await orientationGlb(allLayers.filter((layer) => CLIENT_LAYERS.some((prefix) => layer.name.startsWith(prefix))), review.frame)));
  // The mapping as the viewer will show it: the contacts' median distance to the displayed scan, read back from the GLB.
  const check = displayedContactCheck(glb);
  if (check) row.ownerContactsMedianMm = check.medianMm;
  if (check && check.medianMm > CONTACT_MAPPING_LIMIT_MM) throw new Error(`owner contacts do not sit on the displayed scan (median ${check.medianMm} mm)`);
  Object.assign(row, {
    result: 'built', reason: supports.verdict?.reason ?? (supports.islands?.status === 'inconclusive' ? `islands: ${supports.islands.reason}` : ''),
    verdict: supports.verdict?.status ?? 'none', crossings: issues.filter((i) => i.blocked).length, uncertain: issues.filter((i) => !i.blocked).length,
    islandsUnresolved: islands.filter((i) => i.status === 'unresolved').length, islandsOutsideArea: islands.filter((i) => i.status === 'outside-policy').length,
    tipsPlaced: review.placement.points.length - supports.dropped.length, tipsLeftOut: supports.dropped.length, glb: `${name}.glb`,
    printAngleDeg: Number(tiltLabel(scan.rows[index]!.tiltDeg)), angleReason: scan.reason, angleConfirmed: false,
    stableBand: scan.band ? `${tiltLabel(scan.rows[scan.band[0]]!.tiltDeg)}-${tiltLabel(scan.rows[scan.band[1]]!.tiltDeg)}` : 'none',
    structuresLeftOut: (supports.dentalStructureFallback ?? []).join('+'),
    ownerContacts: detail.ownerContacts, ownerContactsMedianMm: row.ownerContactsMedianMm ?? detail.ownerContactsMedianMm,
    ownerAreaCoveredPct: detail.ownerAreaCoveredPct, outsideOwnerAreaPct: detail.outsideOwnerAreaPct, middlePlane: detail.middlePlane,
    upDecision: detail.upDecision, tipsBySource: detail.tipsBySource, unsupportableTips: detail.unsupportableTips, tipsLeftOutReasons: detail.tipsLeftOutReasons,
  });
}
