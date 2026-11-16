import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { PrintUnit } from '../../../state/project';
import { generationTransform } from '@mixo-geocore/host/supports/unitSupports';
import { inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import type { Vector } from '@mixo-geocore/host/core/vec3';

/*
 * Where a unit's unresolved points and model-landed supports sit, in that unit's own space.
 *
 * THIS IS THE CASE THE SUPPORT-FRAME GUARD ANTICIPATED. `supportFrame.test.ts` forbids
 * `BabylonObjectViewport.tsx` from reaching for `generationTransform`, because drawing supports
 * there was a bug I shipped and argued for. But the bubbles genuinely need it -- as DATA, not as a
 * position: the build REPORTS these points in the frame it generated them in, so they have to be
 * brought back into the unit's own space before they can be drawn with it. The guard's own note
 * says to pass it in from elsewhere rather than import it there, and this module is that
 * elsewhere.
 */

export interface BubblePoint {
  key: string;
  /** Unit-local, ready to be placed under the unit's node. */
  at: Vector;
}

export interface UnitBubbles {
  unresolved: Array<BubblePoint & { point: NonNullable<GeneratedSupportMesh['unresolved']>[number] }>;
  landed: Array<BubblePoint & { entry: NonNullable<GeneratedSupportMesh['modelLanded']>[number] }>;
}

/** Nothing to draw is an empty pair rather than undefined, so callers need no second check. */
export function bubblePointsFor(unit: PrintUnit, supports: GeneratedSupportMesh | undefined): UnitBubbles {
  if (!supports) return { unresolved: [], landed: [] };
  const frame = generationTransform(unit);
  return {
    unresolved: (supports.unresolved ?? []).map((point) => ({
      key: `u:${point.id}`,
      at: inverseTransformPoint(frame, point.position),
      point,
    })),
    landed: (supports.modelLanded ?? []).map((entry) => ({
      key: `l:${entry.id}`,
      at: inverseTransformPoint(frame, entry.position),
      entry,
    })),
  };
}
