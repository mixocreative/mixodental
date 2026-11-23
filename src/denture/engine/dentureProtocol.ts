import type { SupportPoint, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import type { TiltScan, TiltScanSettings } from '@mixo-geocore/host/dental/dentalTilt';
import type { RerouteResult } from '@mixo-geocore/host/supports/editSupport';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import type { DentureJob, DentureMesh, DentureParts, DentureRimUsed } from './dentureCore';
import type { DrawnDentureRim } from '@mixo-geocore/host/dental/dentureDrawnRim';
import type { CaseFlip } from '@mixo-geocore/host/dental/orientGraph';
import type { GenerateRules } from '@mixo-geocore/host/supports/generateRules';
import type { RuleReason } from '../check/ruleSpots';
import type { ExportedFiles, ExportUnitJob } from './dentureExport';

/*
 * Messages between the denture client (main thread) and the denture worker. Each job carries its own
 * copy of the model, except `live-at`, which reads the live-tilt handle `live-open` left in the worker
 * under its key until `live-close` frees it.
 */

/** A placement reads the pose and the hand work, not the support shape. */
/** The detected denture rim as the drawing tool needs it: the lines, and the rim plane's normal toward the tissue side. */
export interface DetectedDentureRim {
  lines: { points: Vector[]; closed: boolean }[];
  normal: Vector;
}

export type DenturePlaceJob = Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand' | 'drawnRim' | 'caseFlip'>;
/** The one-point model-surface check reads the build's inputs and the point (build frame). */
export type DentureLandingJob = Pick<DentureJob, 'mesh' | 'policy' | 'frame' | 'rules' | 'hand' | 'settings' | 'plateY' | 'drawnRim' | 'caseFlip'> & { tip: Vector; normal: Vector };

export type DentureTask =
  | { kind: 'orient'; mesh: TriangleMesh; profileId: string; scan: TiltScanSettings; drawnRim?: DrawnDentureRim; caseFlip?: CaseFlip }
  | { kind: 'live-open'; key: string; mesh: TriangleMesh; profileId: string; scan: TiltScanSettings; drawnRim?: DrawnDentureRim; caseFlip?: CaseFlip }
  | { kind: 'live-at'; key: string; tiltDeg: number }
  | { kind: 'live-close'; key: string }
  | { kind: 'place'; job: DenturePlaceJob }
  | { kind: 'build'; job: DentureJob }
  | { kind: 'check-landing'; job: DentureLandingJob }
  /** The DETECTED rim of the model at tilt 0 (the drawn rim is cleared for it): the seed of Redraw the rim. */
  | { kind: 'detected-rim'; mesh: TriangleMesh; profileId: string; caseFlip?: CaseFlip }
  | { kind: 'classify-spots'; mesh: TriangleMesh; profileId: string; points: Vector[]; rules: GenerateRules; drawnRim?: DrawnDentureRim; caseFlip?: CaseFlip }
  | { kind: 'export'; units: ExportUnitJob[]; files: ExportFilePlan[]; revision: number };

export type DentureResult =
  | { kind: 'oriented'; orientation: DentureOrientation; scan: TiltScan }
  | { kind: 'live-opened'; ok: boolean; reason: string }
  | { kind: 'live-paths'; paths: TiltPaths }
  | { kind: 'live-closed' }
  | { kind: 'placed'; points: SupportPoint[]; parts: DentureParts; rim: DentureRimUsed }
  | { kind: 'built'; mesh: DentureMesh }
  | { kind: 'landing'; result: RerouteResult }
  | { kind: 'spot-reasons'; reasons: (RuleReason | null)[] }
  | { kind: 'detected-rim'; rim: DetectedDentureRim | undefined }
  | ({ kind: 'files' } & ExportedFiles);
