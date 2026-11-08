import { describe, expect, it } from 'vitest';
import { gesture, gestureMode } from '@mixo-geocore/editing/gesture';
import { lockNote, sectionLocked, type Panel, type PanelSection } from '@mixo-geocore/editing/locks';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { BENCH_ARRIVALS, BENCH_MODE, BENCH_REGIONS, onBench } from './benchScene';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const withActive = run(initialSession, { type: 'activeUnitChanged', id: 'u1' });
const SECTIONS: readonly PanelSection[] = ['import', 'objects', 'transform', 'supports', 'check', 'settings', 'export'];
const PANELS: readonly Panel[] = ['left', 'right'];
/** Dental Step 3, the step the bench is reached off the end of. */
const step3 = run(withActive, { type: 'startDental', profile: 'p' },
  { type: 'dentalLoading', unitId: 'u1' }, { type: 'dentalOriented', proposal: {} as never, notices: [] },
  { type: 'acceptDentalOrientation' }, { type: 'acceptDentalArea' });

describe('the bench', () => {
  it('is where the app starts, and `onBench` is the positive form of the mode check', () => {
    expect(initialSession.mode).toBe(BENCH_MODE);
    expect(onBench(initialSession)).toBe(true);
    for (const mode of ['edit', 'zones', 'dental'] as const) expect(onBench({ mode })).toBe(false);
  });

  /*
   * PROPERTY 1: NOTHING IS LOCKED. Every other mode dims at least one section and shows a note
   * saying why; the bench dims none. This is most of what makes it read as a resting state.
   */
  it('locks nothing: every section is live and neither panel carries a lock note', () => {
    for (const section of SECTIONS) expect(sectionLocked(section, BENCH_MODE)).toBe(false);
    for (const panel of PANELS) expect(lockNote(panel, BENCH_MODE)).toBeUndefined();
    // And it is the only mode that locks nothing, or the property says nothing about the bench.
    for (const mode of ['edit', 'zones', 'dental'] as const) {
      expect(SECTIONS.some((section) => sectionLocked(section, mode))).toBe(true);
    }
  });

  /* PROPERTY 2: THE CANVAS IS QUIET. No tool is in hand, so a press and a drag only orbit. */
  it('holds no tool: the canvas gesture is none, and none belongs to the bench', () => {
    expect(gesture(initialSession)).toEqual({ kind: 'none' });
    expect(gestureMode({ kind: 'none' })).toBe(BENCH_MODE);
    expect(gesture(run(withActive, { type: 'enterEdit' })).kind).not.toBe('none');
  });

  /* PROPERTY 3: EVERY WAY OUT ENDS HERE. No mode can be left into another mode. */
  it('is where every way out of a mode lands', () => {
    for (const from of [run(withActive, { type: 'enterEdit' }), run(withActive, { type: 'enterZones' }), step3]) {
      expect(onBench(from)).toBe(false);
      expect(onBench(run(from, { type: 'exit' }))).toBe(true);
      expect(onBench(run(from, { type: 'leave' }))).toBe(true);
    }
  });

  it('is reached off the end of the last dental step, and there is no step after it', () => {
    expect(step3.dentalStage).toBe('review');
    const finished = run(step3, { type: 'finishDental', unitId: 'u1' });
    expect(onBench(finished)).toBe(true);
    expect(finished.dentalFinished).toContain('u1');
  });

  it('is where the active object going away leaves you', () => {
    expect(onBench(run(withActive, { type: 'enterEdit' }, { type: 'activeUnitChanged', id: undefined }))).toBe(true);
  });

  it('names every arrival with an event the session reducer answers, and every shell region once', () => {
    expect(BENCH_ARRIVALS.map((arrival) => arrival.event)).toEqual(['start', 'exit', 'leave', 'finishDental', 'activeUnitChanged']);
    expect(BENCH_REGIONS.map((entry) => entry.region)).toEqual(['header', 'left', 'viewport', 'right', 'footer']);
    for (const entry of BENCH_REGIONS) {
      expect(entry.place.length).toBeGreaterThan(0);
      expect(entry.holds.length).toBeGreaterThan(0);
    }
    // The two panels between them account for every section, and the frame regions hold none.
    const panelled = BENCH_REGIONS.flatMap((entry) => entry.sections);
    expect([...panelled].sort()).toEqual([...SECTIONS].sort());
    for (const entry of BENCH_REGIONS.filter((region) => region.region !== 'left' && region.region !== 'right')) {
      expect(entry.sections).toEqual([]);
    }
  });
});
