import { describe, expect, it } from 'vitest';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import { liveTiltThrottle, type FrameScheduler } from './liveTilt';

/** A frame clock the test advances by hand. */
function frames() {
  const queued: (() => void)[] = [];
  const schedule: FrameScheduler = (run) => { queued.push(run); return () => { const at = queued.indexOf(run); if (at >= 0) queued.splice(at, 1); }; };
  return { schedule, tick: () => queued.splice(0).forEach((run) => run()), get size() { return queued.length; } };
}

const paths = (tiltDeg: number): TiltPaths => ({ kind: 'paths', tiltDeg, rotation: [0, 0, 0], tips: [], counts: { lowsWithout: 0, without: 0, fallbacks: 0, tips: 0 }, overhangMm2: 0 });

describe('liveTiltThrottle', () => {
  it('sends at most one ask per frame, the newest', async () => {
    const clock = frames();
    const asked: number[] = [];
    const got: number[] = [];
    const throttle = liveTiltThrottle((deg) => { asked.push(deg); return Promise.resolve(paths(deg)); }, (deg) => got.push(deg), clock.schedule);
    throttle.request(2); throttle.request(4); throttle.request(6);
    expect(clock.size).toBe(1);
    expect(asked).toEqual([]);
    clock.tick();
    expect(asked).toEqual([6]);
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(got).toEqual([6]);
  });

  it('skips while busy and then sends only the latest ask', async () => {
    const clock = frames();
    const asked: number[] = [];
    const got: number[] = [];
    let answer: (value: TiltPaths) => void = () => {};
    const throttle = liveTiltThrottle((deg) => { asked.push(deg); return new Promise((resolve) => { answer = resolve; }); }, (deg) => got.push(deg), clock.schedule);
    throttle.request(10);
    clock.tick();
    throttle.request(12); throttle.request(14);
    clock.tick();
    expect(asked).toEqual([10]);
    answer(paths(10));
    await new Promise((resolve) => setTimeout(resolve, 0));
    // The answer for 10 is stale (14 is waiting): not delivered; 14 goes out on the next frame.
    expect(got).toEqual([]);
    clock.tick();
    expect(asked).toEqual([10, 14]);
    answer(paths(14));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(got).toEqual([14]);
  });

  it('delivers nothing after dispose', async () => {
    const clock = frames();
    const got: number[] = [];
    const throttle = liveTiltThrottle((deg) => Promise.resolve(paths(deg)), (deg) => got.push(deg), clock.schedule);
    throttle.request(3);
    throttle.dispose();
    clock.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(got).toEqual([]);
    expect(clock.size).toBe(0);
  });
});
