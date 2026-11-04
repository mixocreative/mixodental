import { describe, expect, it } from 'vitest';
import type { TiltRow, TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import { angleEvidence, RULE_WORDS } from './angleEvidence';

function row(over: Partial<TiltRow> = {}): TiltRow {
  return {
    tiltDeg: 34.5, step: 0, failed: [], fittingSideTips: 12, largestGapMm: 0.421, largestSlenderness: 3.17,
    largestLayerMm2: 88.46, heightMm: 24.33, robust: true, rotation: [0, 0, 0], ...over,
  };
}

function scan(rows: TiltRow[], over: Partial<Extract<TiltScan, { kind: 'scan' }>> = {}): TiltScan {
  return {
    kind: 'scan', startDeg: 34.5, rows, order: rows.map((_, at) => at), reason: 'robust', band: undefined,
    boxed: { counts: [], picked: [], lows: [], tips: [], paths: [] }, ...over,
  };
}

describe('angleEvidence', () => {
  it('reads the row the dial is on and says what was measured there', () => {
    const found = angleEvidence(scan([row({ tiltDeg: 40 }), row({ tiltDeg: 34.5 })]), 1);
    expect(found?.deg).toBe('34.5');
    expect(found?.robust).toBe(true);
    expect(found?.broken).toEqual([]);
    // The pick is row 0 here, so the row the dial is on is not it.
    expect(found?.isPick).toBe(false);
    expect(found?.facts.map((fact) => fact.id)).toEqual(['tips', 'gap', 'slender', 'layer', 'height']);
    expect(found?.facts.find((fact) => fact.id === 'gap')).toEqual({ id: 'gap', label: 'Widest rim gap', value: '0.42', unit: 'mm' });
    expect(found?.facts.find((fact) => fact.id === 'tips')?.value).toBe('12');
  });

  it('names every rule the angle breaks, in words rather than engine ids', () => {
    const found = angleEvidence(scan([row({ robust: false, failed: [{ rule: 'resin-trap', at: 'v12' }, { rule: 'too-thin', at: 't3' }] })]), 0);
    expect(found?.robust).toBe(false);
    expect(found?.broken).toEqual([RULE_WORDS['resin-trap'], RULE_WORDS['too-thin']]);
    expect(found?.broken.every((words) => !words.includes('-'))).toBe(true);
    expect(found?.isPick).toBe(true);
  });

  it('gives the stable band as degrees written the way the dial writes them, not as row numbers', () => {
    const rows = [row({ tiltDeg: 30 }), row({ tiltDeg: 34.5 }), row({ tiltDeg: 40 })];
    // A profile's angles carry many decimals; the panel must say what the dial says, to one place.
    expect(angleEvidence(scan([row({ tiltDeg: 32.4577512332 })]), 0)?.deg).toBe('32.5');
    expect(angleEvidence(scan(rows, { band: [0, 2] }), 1)?.band).toEqual(['30', '40']);
    expect(angleEvidence(scan(rows), 1)?.band).toBeUndefined();
  });

  /*
   * The point of the module: when nothing measured this angle, it says nothing. A verdict invented for an
   * angle the scan never tried would be worse than a blank panel, because it would be believed.
   */
  it('says nothing when there is no measurement to report', () => {
    expect(angleEvidence(undefined, 0)).toBeUndefined();
    expect(angleEvidence({ kind: 'failed', reason: 'no arch' }, 0)).toBeUndefined();
    expect(angleEvidence(scan([row()]), 7)).toBeUndefined();
  });
});
