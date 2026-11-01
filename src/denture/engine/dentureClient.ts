import type { SupportPoint, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import type { TiltScan, TiltScanSettings } from '@mixo-geocore/host/dental/dentalTilt';
import type { RerouteResult } from '@mixo-geocore/host/supports/editSupport';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import { WorkerTask, type WorkerLike } from '@mixo-geocore/host/workers/WorkerTask';
import type { DentureJob, DentureMesh, DentureParts } from './dentureCore';
import type { DentureLandingJob, DenturePlaceJob, DentureResult, DentureTask } from './dentureProtocol';
import { KeyedQueue } from './keyedQueue';
import type { ExportUnitJob } from './dentureExport';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import type { ExportResult } from '@mixo-geocore/host/workers/meshClient';

/** A support build on the biggest dentures takes tens of seconds; past this the worker is restarted and the job fails. */
const DENTURE_TIMEOUT_MS = 10 * 60_000;

/** A copy of the model whose buffers can move to the worker (the scene keeps its own). */
const copyOf = (mesh: TriangleMesh): TriangleMesh => ({ positions: mesh.positions.slice(), indices: mesh.indices.slice() });

/**
 * The only way the app reaches the denture engine (src/denture/engine): one worker, one job at a time, a newer
 * job of the same key replacing a queued one (`undefined` answers a replaced job). Keys: `orient:<unit>`,
 * `live:<unit>` (open, the tilts and close of one handle share the worker's handle key), `place:<unit>`,
 * `build:<unit>:<mode>`, `landing:<unit>`.
 */
export class DentureClient {
  private readonly runner: WorkerTask<DentureTask, DentureResult>;
  private readonly queue = new KeyedQueue();

  constructor(create: (() => WorkerLike) | null) {
    this.runner = new WorkerTask({ create, name: 'Denture engine', timeoutMs: DENTURE_TIMEOUT_MS, concurrency: 'serial' });
  }

  private run(key: string, task: DentureTask, label: JobLabel | undefined, onProgress?: (fraction: number) => void): Promise<DentureResult | undefined> {
    const transfer = 'mesh' in task ? [task.mesh.positions.buffer, task.mesh.indices.buffer]
      : 'job' in task ? [task.job.mesh.positions.buffer, task.job.mesh.indices.buffer]
        : task.kind === 'export' ? task.units.flatMap((unit) => { const mesh = (unit.denture ?? unit.generic)!.mesh; return [mesh.positions.buffer, mesh.indices.buffer]; }) : [];
    return this.queue.push(key, () => this.runner.run(task, {
      transfer, ...(label ? { label } : {}),
      ...(onProgress ? { onProgress: (fields) => { if (typeof fields.fraction === 'number') onProgress(fields.fraction); } } : {}),
    }));
  }

  /** Step 1: the upright frame and the print-angle search (progress: tilts done / total). */
  orient(unitId: string, mesh: TriangleMesh, profileId: string, scan: TiltScanSettings, label: JobLabel, onProgress?: (fraction: number) => void): Promise<{ orientation: DentureOrientation; scan: TiltScan } | undefined> {
    return this.run(`orient:${unitId}`, { kind: 'orient', mesh: copyOf(mesh), profileId, scan }, label, onProgress)
      .then((result) => (result?.kind === 'oriented' ? { orientation: result.orientation, scan: result.scan } : undefined));
  }

  /** Opens the live-tilt handle of the unit's model (per model once); false when the engine cannot orient it. */
  liveOpen(unitId: string, mesh: TriangleMesh, profileId: string, scan: TiltScanSettings): Promise<boolean> {
    return this.run(`live-open:${unitId}`, { kind: 'live-open', key: unitId, mesh: copyOf(mesh), profileId, scan }, undefined)
      .then((result) => result?.kind === 'live-opened' && result.ok);
  }

  /** The tips of one tilt with their path states; a newer tilt replaces a queued one. */
  liveAt(unitId: string, tiltDeg: number): Promise<TiltPaths | undefined> {
    return this.run(`live-at:${unitId}`, { kind: 'live-at', key: unitId, tiltDeg }, undefined)
      .then((result) => (result?.kind === 'live-paths' ? result.paths : undefined));
  }

  /** Frees the unit's live-tilt handle in the worker. */
  liveClose(unitId: string): Promise<void> {
    return this.run(`live-close:${unitId}`, { kind: 'live-close', key: unitId }, undefined).then(() => undefined);
  }

  /** The accepted pose's automatic tips (unit-local) and the file's parts. */
  place(unitId: string, job: DenturePlaceJob, label: JobLabel): Promise<{ points: SupportPoint[]; parts: DentureParts } | undefined> {
    return this.run(`place:${unitId}`, { kind: 'place', job: { ...job, mesh: copyOf(job.mesh) } }, label)
      .then((result) => (result?.kind === 'placed' ? { points: result.points, parts: result.parts } : undefined));
  }

  /** One support build of the unit (preview or export); a newer build of the same unit and mode replaces a queued one. */
  build(unitId: string, job: DentureJob, label: JobLabel): Promise<DentureMesh | undefined> {
    return this.run(`build:${unitId}:${job.mode}`, { kind: 'build', job: { ...job, mesh: copyOf(job.mesh) } }, label)
      .then((result) => (result?.kind === 'built' ? result.mesh : undefined));
  }

  /** Whether one point can be supported from the model surface (milliseconds once the model is loaded). */
  checkLanding(unitId: string, job: DentureLandingJob, label: JobLabel): Promise<RerouteResult | undefined> {
    return this.run(`landing:${unitId}:${job.tip.join(',')}`, { kind: 'check-landing', job: { ...job, mesh: copyOf(job.mesh) } }, label)
      .then((result) => (result?.kind === 'landing' ? result.result : undefined));
  }

  private exports = 0;

  /** Full-resolution supports and the STL files of an export that holds dentures (each unit carries its own copy of the model). */
  exportFiles(units: readonly ExportUnitJob[], files: ExportFilePlan[], label: JobLabel): Promise<ExportResult> {
    const revision = ++this.exports;
    const copied = units.map((unit) => (unit.denture ? { ...unit, denture: { ...unit.denture, mesh: copyOf(unit.denture.mesh) } } : { ...unit, generic: { ...unit.generic!, mesh: copyOf(unit.generic!.mesh) } }));
    return this.run(`export:${revision}`, { kind: 'export', units: copied, files, revision }, label)
      .then((result) => (result?.kind === 'files' ? { revision, files: result.files, units: result.units } : { revision, files: [], units: [] }));
  }

  dispose(): void {
    this.runner.terminate();
  }
}
