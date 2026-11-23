import '../../workers/engineSource';
import { typesReady } from '../../dentalTypes/typesReady';
import { serveTask, transferable } from '@mixo-geocore/host/workers/serveTask';
import { runAfterGeometryReady } from '@mixo-geocore/host/geometryVersion.js';
import { openLiveTilt, type LiveTilt } from '@mixo-geocore/host/dental/dentureTilt';
import { setDentureDrawnRim, type DrawnDentureRim } from '@mixo-geocore/host/dental/dentureDrawnRim';
import { setDentureCaseFlip, type CaseFlip } from '@mixo-geocore/host/dental/orientGraph';
import { reviewDenture } from '@mixo-geocore/host/dental/dentureReview';
import { buildDenture, checkModelLanding, orientAndScan, placeDenture } from './dentureCore';
import type { DentureResult, DentureTask } from './dentureProtocol';
import { ruleReasons } from '../check/ruleSpots';
import { exportFiles } from './dentureExport';
import { DENTURE_STAGE } from '../progress/stagePlans';
import { PROGRESS_STAGE } from '@mixo-geocore/host/core/progress';

/*
 * The denture worker: Step 1's orientation and tilt scan, the live-tilt handle (kept here between calls, so a
 * tilt costs tens of milliseconds), the accepted pose's tips, the support build and the one-point model-surface
 * check and the rule verdict on the support check's spots. One job at a time; the engine's per-model caches stay warm between the scan and the live tilt.
 */

const PROGRESS_INTERVAL_MS = 60;
const live = new Map<string, LiveTilt>();
/** The drawn rim each live handle was opened with: set again before every tilt, since another job may have changed the engine's one slot. */
const liveRims = new Map<string, DrawnDentureRim | null>();
/** The case flip each live handle was opened with, set again before every tilt for the same reason. */
const liveFlips = new Map<string, CaseFlip | null>();

function close(key: string): void {
  live.get(key)?.free();
  live.delete(key);
  liveRims.delete(key);
  liveFlips.delete(key);
}

serveTask<DentureTask, DentureResult>((task, { progress: post }) => runAfterGeometryReady(typesReady, () => {
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
      const { orientation, scan } = orientAndScan(task.mesh, task.profileId, task.scan, (done, total) => progress(done / total, DENTURE_STAGE.scanning), () => progress(0, DENTURE_STAGE.scanning), task.drawnRim, task.caseFlip);
      return { kind: 'oriented', orientation, scan };
    }
    case 'live-open': {
      close(task.key);
      setDentureDrawnRim(task.drawnRim ?? null);
      setDentureCaseFlip(task.caseFlip ?? null);
      const handle = openLiveTilt(task.mesh, task.profileId, task.scan);
      live.set(task.key, handle);
      liveRims.set(task.key, task.drawnRim ?? null);
      liveFlips.set(task.key, task.caseFlip ?? null);
      return { kind: 'live-opened', ok: handle.ok, reason: handle.reason };
    }
    case 'live-at': {
      const handle = live.get(task.key);
      if (handle) { setDentureDrawnRim(liveRims.get(task.key) ?? null); setDentureCaseFlip(liveFlips.get(task.key) ?? null); }
      return { kind: 'live-paths', paths: handle ? handle.at(task.tiltDeg) : { kind: 'failed', reason: 'closed' } };
    }
    case 'live-close':
      close(task.key);
      return { kind: 'live-closed' };
    case 'place': {
      progress(0, 'Placing denture tips');
      const { points, parts, rim } = placeDenture(task.job);
      return { kind: 'placed', points, parts, rim };
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
    case 'detected-rim': {
      // Detection's own rim, never a drawing left in force by another job: this is what Redraw starts from - but in
      // THIS case's sides, so a flipped case is redrawn the way it stands.
      setDentureDrawnRim(null);
      setDentureCaseFlip(task.caseFlip ?? null);
      const review = reviewDenture(task.mesh, task.profileId, 0);
      const lines = review?.rimLoops?.lines.map((line) => ({ points: line.points, closed: line.closed })) ?? [];
      // The rim plane's normal points to the top; the drawing's projection ray wants the tissue side, the way out of the lip.
      const top = review?.rimPlane?.normal ?? review?.up;
      return { kind: 'detected-rim', rim: lines.length > 0 && top ? { lines, normal: [-top[0], -top[1], -top[2]] } : undefined };
    }
    case 'classify-spots':
      setDentureDrawnRim(task.drawnRim ?? null);
      setDentureCaseFlip(task.caseFlip ?? null);
      return { kind: 'spot-reasons', reasons: ruleReasons(task.mesh, task.profileId, task.points, task.rules) };
    case 'check-landing': {
      const { tip, normal, ...job } = task.job;
      return { kind: 'landing', result: checkModelLanding(job, tip, normal) };
    }
  }
}));
