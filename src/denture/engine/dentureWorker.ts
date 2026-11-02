import '../../workers/engineSource';
import { geometryReady } from '@mixo-geocore/host/workers/geometryClient';
import { serveTask, transferable } from '@mixo-geocore/host/workers/serveTask';
import { runAfterGeometryReady } from '@mixo-geocore/host/geometryVersion.js';
import { openLiveTilt, type LiveTilt } from '@mixo-geocore/host/dental/dentureTilt';
import { buildDenture, checkModelLanding, orientAndScan, placeDenture } from './dentureCore';
import type { DentureResult, DentureTask } from './dentureProtocol';
import { exportFiles } from './dentureExport';
import { DENTURE_STAGE } from '../progress/stagePlans';
import { PROGRESS_STAGE } from '@mixo-geocore/host/core/progress';

/*
 * The denture worker: Step 1's orientation and tilt scan, the live-tilt handle (kept here between calls, so a
 * tilt costs tens of milliseconds), the accepted pose's tips, the support build and the one-point model-surface
 * check. One job at a time; the engine's per-model caches stay warm between the scan and the live tilt.
 */

const PROGRESS_INTERVAL_MS = 60;
const live = new Map<string, LiveTilt>();

function close(key: string): void {
  live.get(key)?.free();
  live.delete(key);
}

serveTask<DentureTask, DentureResult>((task, { progress: post }) => runAfterGeometryReady(geometryReady, () => {
  let last = 0;
  let lastStage = '';
  const progress = (fraction: number, stage: string) => {
    const now = performance.now();
    // A new stage always goes through (the staged bar moves by stage); only the fractions inside one are thinned.
    if (now - last < PROGRESS_INTERVAL_MS && fraction < 1 && stage === lastStage) return;
    last = now;
    lastStage = stage;
    post({ fraction, stage });
  };
  switch (task.kind) {
    case 'orient': {
      progress(0, DENTURE_STAGE.reading);
      const { orientation, scan } = orientAndScan(task.mesh, task.profileId, task.scan, (done, total) => progress(done / total, DENTURE_STAGE.scanning), () => progress(0, DENTURE_STAGE.scanning));
      return { kind: 'oriented', orientation, scan };
    }
    case 'live-open': {
      close(task.key);
      const handle = openLiveTilt(task.mesh, task.profileId, task.scan);
      live.set(task.key, handle);
      return { kind: 'live-opened', ok: handle.ok, reason: handle.reason };
    }
    case 'live-at': {
      const handle = live.get(task.key);
      return { kind: 'live-paths', paths: handle ? handle.at(task.tiltDeg) : { kind: 'failed', reason: 'closed' } };
    }
    case 'live-close':
      close(task.key);
      return { kind: 'live-closed' };
    case 'place': {
      progress(0, 'Placing denture tips');
      const { points, parts } = placeDenture(task.job);
      return { kind: 'placed', points, parts };
    }
    case 'build': {
      const mesh = buildDenture(task.job, (fraction, stage) => progress(fraction, stage));
      const buffers: Transferable[] = [mesh.positions.buffer, mesh.indices.buffer, ...(mesh.dentureParts ? [mesh.dentureParts.faceParts.buffer] : [])];
      return transferable<DentureResult>({ kind: 'built', mesh }, buffers);
    }
    case 'export': {
      const out = exportFiles(task.units, task.files, task.revision, (fraction) => progress(fraction, PROGRESS_STAGE.writingStl));
      return transferable<DentureResult>({ kind: 'files', ...out }, out.files.map((file) => file.buffer));
    }
    case 'check-landing': {
      const { tip, normal, ...job } = task.job;
      return { kind: 'landing', result: checkModelLanding(job, tip, normal) };
    }
  }
}));
