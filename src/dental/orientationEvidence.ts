// Shared by the batch review (dentalwork/batch-review/reviewCase.ts) and the app's Debug layers.
// Renderer-free DATA only: the Step 1 columns and the engine's evidence layers (plain typed arrays).
// The three.js GLB builder lives in dentalwork/batch-review/orientationEvidenceGlb.ts. Review only.
/*
 * Step 1 evidence for the folder review: what the engine's orientation decided on one scan (the
 * owner's trim method, Rust `dental::trim`) and the layers that show it (`diagnose_orientation`:
 * detected trim chains in red, the two U ends in green, the bottom plane's outline, the back arrow).
 */
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { DentalCrossCheck } from '@mixo-geocore/host/dental/dental';
import { orientDentalAligner, type DentalArchKind } from '@mixo-geocore/host/dental/dentalOrient';
import { withSession } from '@mixo-geocore/host/supports/supportEngine';

/** The Step 1 columns of a summary row. */
export type OrientationEvidence = {
  /** `open` (the trim plane and its U ends decided), `ring` (a U bridged by a plate; the floor rule decided), or '' when Step 1 failed. */
  archKind: DentalArchKind | '';
  /** Whether the rule that did not decide agrees on up/down; `disagrees` needs a look. '' when Step 1 failed. */
  upCrossCheck: DentalCrossCheck | '';
  /** The floor rule's lean (0 middle .. 1 one end), the cross-check's own strength. */
  floorOffsetRatio: number | null;
  /** The pose Step 1 proposes (Euler XYZ), when the arch front was found. */
  rotation: [number, number, number] | undefined;
  /** Plain words when the case needs a look because of Step 1 (empty otherwise). */
  orientationNote: string;
};

export const NO_EVIDENCE: OrientationEvidence = { archKind: '', upCrossCheck: '', floorOffsetRatio: null, rotation: undefined, orientationNote: '' };

/** Step 1 on `mesh` (unit-local) as the app runs it, read for the summary. */
export function orientationEvidence(mesh: TriangleMesh, profile: string): OrientationEvidence {
  const oriented = orientDentalAligner(mesh, profile);
  if (oriented.kind !== 'oriented') return { ...NO_EVIDENCE, orientationNote: `Step 1 could not orient the scan (${oriented.reason}).` };
  const check = oriented.proposal.diagnostics.crossCheck ?? 'inconclusive';
  const ratio = oriented.proposal.diagnostics.floorOffsetRatio;
  const note = check === 'disagrees'
    ? `Up/down needs a look: the floor rule leans the other way from the trim plane (floor offset ratio ${ratio.toFixed(2)}). The trim plane was used; check which side is up.`
    : '';
  return { archKind: oriented.arch, upCrossCheck: check, floorOffsetRatio: +ratio.toFixed(3), rotation: oriented.rotation, orientationNote: note };
}

/** One evidence layer from the engine: display name, colour (0xRRGGBB) and triangle data. */
export type OrientationLayer = { name: string; color: number; positions: Float32Array; indices: Uint32Array };

interface OrientationDiagnosis {
  layer_count(): number; layer_name(layer: number): string; layer_color(layer: number): number;
  take_layer_positions(layer: number): Float32Array; take_layer_indices(layer: number): Uint32Array; free(): void;
}
interface OrientationSession {
  load_mesh(positions: Float32Array, indices: Uint32Array): number;
  diagnose_orientation(model: number, revision: number, profile: string): OrientationDiagnosis;
}

/** The Step 1 evidence layers (Rust `diagnose_orientation`); empty when Step 1 failed. */
export function orientationLayers(mesh: TriangleMesh, profile: string): OrientationLayer[] {
  return withSession((raw) => {
    const session = raw as unknown as OrientationSession;
    const result = session.diagnose_orientation(session.load_mesh(Float32Array.from(mesh.positions), Uint32Array.from(mesh.indices)), 0, profile);
    try {
      return Array.from({ length: result.layer_count() }, (_, k) => ({
        name: result.layer_name(k), color: result.layer_color(k), positions: result.take_layer_positions(k), indices: result.take_layer_indices(k),
      }));
    } finally {
      result.free();
    }
  });
}
