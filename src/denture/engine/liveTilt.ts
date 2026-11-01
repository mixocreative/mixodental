import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';

/*
 * The live-tilt throttle (Round C angle step): while the operator drags the dial, ask the engine for the tips
 * of the newest tilt at most once per animation frame, and never while an answer is still on its way
 * (skip-if-busy: only the latest tilt asked meanwhile is sent when the answer lands). Stale answers are not
 * delivered: an answer whose tilt is no longer the newest is dropped once a newer one is pending.
 * The engine call (`at`) is the denture client's `liveAt` (worker handle from `openLiveTilt`).
 */

/** Schedules `run` for the next frame; returns a cancel. `requestAnimationFrame` in the browser. */
export type FrameScheduler = (run: () => void) => () => void;

export const animationFrames: FrameScheduler = (run) => {
  const id = requestAnimationFrame(run);
  return () => cancelAnimationFrame(id);
};

export interface LiveTiltThrottle {
  /** Ask for the tips of `tiltDeg` (the newest ask wins). */
  request(tiltDeg: number): void;
  /** Stop: nothing more is sent or delivered. */
  dispose(): void;
}

/**
 * A throttle over `at(tiltDeg)`. `onPaths` gets each answer that is still the newest ask (undefined answers,
 * a replaced or failed job, are skipped). `schedule` defaults to animation frames.
 */
export function liveTiltThrottle(at: (tiltDeg: number) => Promise<TiltPaths | undefined>, onPaths: (tiltDeg: number, paths: TiltPaths) => void,
  schedule: FrameScheduler = animationFrames): LiveTiltThrottle {
  let pending: number | undefined;
  let busy = false;
  let cancelFrame: (() => void) | undefined;
  let disposed = false;
  const send = () => {
    cancelFrame = undefined;
    if (disposed || busy || pending === undefined) return;
    const tiltDeg = pending;
    pending = undefined;
    busy = true;
    at(tiltDeg).then((paths) => {
      if (!disposed && paths && pending === undefined) onPaths(tiltDeg, paths);
    }, () => undefined).finally(() => {
      busy = false;
      if (!disposed && pending !== undefined && !cancelFrame) cancelFrame = schedule(send);
    });
  };
  return {
    request(tiltDeg) {
      if (disposed) return;
      pending = tiltDeg;
      if (!busy && !cancelFrame) cancelFrame = schedule(send);
    },
    dispose() {
      disposed = true;
      cancelFrame?.();
      cancelFrame = undefined;
      pending = undefined;
    },
  };
}
