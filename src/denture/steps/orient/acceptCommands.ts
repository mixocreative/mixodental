import type { SupportPoint } from '@mixo-geocore/host/core/analysis/types';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import type { LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { PrintUnit, SceneCommand, SupportSettings } from '../../../state/project';
import type { DentureState } from '../../state/dentureState';

/*
 * Step 1 Next of a denture as one undo step: the denture's support settings, the accepted pose lifted onto the
 * plate, its automatic tips (unit-local) with the pose as the supports' generation frame, and the denture policy.
 * The supports then build from these (Step 2).
 */

export interface AcceptedPose {
  frame: JobTransform;
  points: readonly SupportPoint[];
  settings: Readonly<LiveSupportSettings>;
  denture: DentureState;
}

export function acceptCommands(unit: Pick<PrintUnit, 'id'>, { frame, points, settings, denture }: AcceptedPose): SceneCommand[] {
  const transform = { position: [...frame.position] as [number, number, number], rotation: [...frame.rotation] as [number, number, number] };
  return [
    { type: 'settings/set', unitId: unit.id, settings: { ...settings } as unknown as SupportSettings },
    { type: 'transform/set', unitId: unit.id, transform },
    { type: 'supports/set', unitId: unit.id,
      placement: { points: [...points], regions: [], contactPositions: new Float32Array(points.flatMap((point) => point.position)), contactNormals: new Float32Array(points.flatMap((point) => point.normal)) },
      supports: { kind: 'live', data: { transform: { position: [...transform.position], rotation: [...transform.rotation] } } } },
    { type: 'denture/set', unitId: unit.id, denture },
  ];
}
