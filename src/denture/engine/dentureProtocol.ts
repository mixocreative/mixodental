import type { SupportPoint, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import type { TiltScan, TiltScanSettings } from '@mixo-geocore/host/dental/dentalTilt';
import type { RerouteResult } from '@mixo-geocore/host/supports/editSupport';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DentureJob, DentureMesh, DentureParts } from './dentureCore';

/*
 * Messages between the denture client (main thread) and the denture worker. Each job carries its own
 * copy of the model, except `live-at`, which reads the live-tilt handle `live-open` left in the worker
 * under its key until `live-close` frees it.
 */

/** A placement reads the pose and the hand work, not the support shape. */
export type DenturePlaceJob = Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand'>;
/** The one-point model-surface check reads the build's inputs and the point (build frame). */
export type DentureLandingJob = Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand' | 'settings' | 'plateY'> & { tip: Vector; normal: Vector };

export type DentureTask =
  | { kind: 'orient'; mesh: TriangleMesh; profileId: string; scan: TiltScanSettings }
  | { kind: 'live-open'; key: string; mesh: TriangleMesh; profileId: string; scan: TiltScanSettings }
  | { kind: 'live-at'; key: string; tiltDeg: number }
  | { kind: 'live-close'; key: string }
  | { kind: 'place'; job: DenturePlaceJob }
  | { kind: 'build'; job: DentureJob }
  | { kind: 'check-landing'; job: DentureLandingJob };

export type DentureResult =
  | { kind: 'oriented'; orientation: DentureOrientation; scan: TiltScan }
  | { kind: 'live-opened'; ok: boolean; reason: string }
  | { kind: 'live-paths'; paths: TiltPaths }
  | { kind: 'live-closed' }
  | { kind: 'placed'; points: SupportPoint[]; parts: DentureParts }
  | { kind: 'built'; mesh: DentureMesh }
  | { kind: 'landing'; result: RerouteResult };
