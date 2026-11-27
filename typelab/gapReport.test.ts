import { describe, expect, it } from 'vitest';
import { gapReport, PROCEDURAL_CANDIDATES } from './gapReport.mjs';

describe('the gap report', () => {
  const report = gapReport({
    kind: 'denture', stream: 'dental rim', startScore: 15.6, refusedOnly: true,
    outside: [{ stream: 'dental rim', outsideMm2: 1943, tips: 316 }, { stream: 'hole', outsideMm2: 479, tips: 77 }],
    ceilings: [{ share: 0.4, oursOnly: 100 }, { share: 0.2, oursOnly: 50 }],
    tried: [{ steps: ['no-support on NS for dental rim'], result: { score: 14.9 }, refused: ['score 14.9 is not above 15.6'], predicted: [81, 7806] }],
  });
  it('is a draft engine request that says what was measured and is NOT sent', () => {
    expect(report).toMatch(/^# geocore: a procedural mask/);
    expect(report).toContain('NOT SENT');
    expect(report).toContain('1943 mm2');
    expect(report).toContain('80% of all of it outside');
    expect(report).toContain('measured score 15.6 -> 14.9');
    expect(report).toContain('40% / 20%');
    expect(report).toContain('not "impossible"');
  });
  it('passes a probe only when the calibrated re-score confirms it - never on face counts alone', () => {
    const base = { kind: 'denture', stream: 'dental rim', startScore: 15.6, outside: [], ceilings: [], tried: [] };
    const faceOnly = gapReport({ ...base, probes: [{ name: 'height band', unit: '/255', lo: 26, hi: 51, gains: [5381, 2801], worst: 2801 }] });
    expect(faceOnly).toContain('NOT SENT');
    expect(faceOnly).toContain('does not separate on every pair');
    const confirmed = gapReport({ ...base, probes: [{ name: 'height band', unit: '/255', lo: 26, hi: 51, gains: [5381, 2801], worst: 2801, rescoreGains: [2.1, 1.5], calibrated: true, confirmed: true }] });
    expect(confirmed).toContain('a probe SEPARATES the misses on every pair (height band)');
  });
  it('lists the procedural masks to probe next', () => {
    for (const [name] of PROCEDURAL_CANDIDATES) expect(report).toContain(`**${name}**`);
  });
});
