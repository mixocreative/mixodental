import { describe, expect, it } from 'vitest';
import { TIP_STATES, tiltPreviewNote, tiltPreviewOf } from './tiltPreview.mjs';

// A three-angle scan as the engine decodes it: 0 fails a rule twice, 2 and 4 pass, 2 is the pick, band 2-4.
const row = (tiltDeg: number, failed: string[] = [], robust = false) => ({ tiltDeg, step: tiltDeg / 2, failed: failed.map((rule) => ({ rule, at: 't1' })), robust,
  fittingSideTips: 0, largestGapMm: 0, largestSlenderness: 0, largestLayerMm2: 0, heightMm: 0, rotation: [0, 0, 0] });
const scan = { kind: 'scan', startDeg: 0, rows: [row(0, ['gap', 'gap']), row(2.04, [], true), row(4)], order: [1, 2, 0], reason: 'robust', band: [1, 2], boxed: {} };
const tips = [{ position: [0, 0, 0], state: 'path' }, { position: [1, 0, 0], state: 'path' }, { position: [2, 0, 0], state: 'none' }];

describe('the tabs 4 and 5 live preview (plan D3)', () => {
  it('carries the pick, why, the band, each angle\'s failed rules once, and the tips by state', () => {
    const preview = tiltPreviewOf(scan, tips);
    expect(preview).toMatchObject({ kind: 'scan', pickedDeg: 2, reason: 'robust', band: [2, 4], counts: { path: 2, fallback: 0, none: 1, unknown: 0 } });
    expect(preview.rows.map((r: { failed: string[] }) => r.failed)).toEqual([['gap'], [], []]);
    expect(tiltPreviewOf({ kind: 'failed', reason: 'no-rim' }, null)).toEqual({ kind: 'failed', reason: 'no-rim' });
  });

  it('says it is a preview, what moved against the run, and that pillars come with Apply', () => {
    const preview = tiltPreviewOf(scan, tips);
    const four = tiltPreviewNote(preview, { tab: 'support', ranDeg: 6 });
    expect(four).toContain('picks 2° (the run on screen picked 6°)');
    expect(four).toContain('3 tips at that angle: 2 with a path to the plate, 1 with no path');
    expect(four).toContain('Pillars come with Apply');
    expect(four.match(/Apply/g)).toHaveLength(1);
    expect(tiltPreviewNote(preview, { tab: 'angle', ranDeg: 2 })).not.toContain('run on screen picked');
  });

  it('never draws tips it could not place, and says so instead', () => {
    const note = tiltPreviewNote(tiltPreviewOf(scan, null), { tab: 'support' });
    expect(note).toContain('cannot be placed on this review\'s model');
    expect(note).not.toMatch(/\d+ tips at that angle/);
  });

  it('gives every path state a status colour and words', () => {
    for (const state of ['path', 'fallback', 'none', 'unknown']) {
      expect(TIP_STATES[state as keyof typeof TIP_STATES].token).toMatch(/^--/);
      expect(TIP_STATES[state as keyof typeof TIP_STATES].words.length).toBeGreaterThan(3);
    }
  });
});
