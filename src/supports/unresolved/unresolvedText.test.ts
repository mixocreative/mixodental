import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage, translateMessage } from '../../i18n';
import { gapText, heightText, isBareIsland, isRefusedIsland, unresolvedMessage, UNRESOLVED_KEYS } from './unresolvedText';

const point = { id: 'denture-low-3', kind: 'lowest' as const, heightMm: 16.2, bestGapMm: 0.8, neededMm: 1, reason: 'x' };

describe('unresolved-point tooltip text', () => {
  afterEach(() => setLanguage('en'));

  it('says what the point is, how high, why, and the best gap against the needed one (the owner example)', () => {
    expect(translateMessage(unresolvedMessage(point, true))).toBe(
      'Lowest point 16 mm up: no route from the plate, best gap 0.8 mm (1.0 needed). Click to support it from the model surface.');
  });

  it('offers the click only where it resolves the point', () => {
    expect(translateMessage(unresolvedMessage(point, false))).toBe('Lowest point 16 mm up: no route from the plate, best gap 0.8 mm (1.0 needed).');
  });

  it('names islands and other tips, and a search that found no gap', () => {
    expect(translateMessage(unresolvedMessage({ ...point, id: 'island-12', kind: 'island', heightMm: 4.25, bestGapMm: null }, false)))
      .toBe('Island 4.3 mm up: no route from the plate found (1.0 mm gap needed).');
    expect(translateMessage(unresolvedMessage({ ...point, id: 'p7', kind: 'tip', heightMm: 9.96, bestGapMm: 0.55, neededMm: 1.25 }, false)))
      .toBe('Support tip 10.0 mm up: no route from the plate, best gap 0.6 mm (1.3 needed).');
  });

  it('a lowest point that got no tip says so instead of a gap', () => {
    expect(translateMessage(unresolvedMessage({ ...point, id: 'denture-low-unreached-2', bestGapMm: null }, false)))
      .toBe('Lowest point 16 mm up: no support tip could be placed there.');
  });

  it('an island the engine refused a tip says it faces sideways (engine 54), and no click is offered', () => {
    const sideways = { ...point, id: 'island-12', kind: 'island' as const, heightMm: 22, bestGapMm: null, reason: "island's lowest point faces sideways: 82 degrees from straight down (60 allowed), no tip can stand there" };
    expect(isRefusedIsland(sideways)).toBe(true);
    expect(isRefusedIsland({ kind: 'island', reason: 'no support from the plate reaches this island' })).toBe(false);
    expect(isBareIsland('island-12') && !isBareIsland('denture-island-2')).toBe(true);
    expect(translateMessage(unresolvedMessage(sideways, false))).toBe('Island 22 mm up: its lowest point faces sideways, so no support tip can stand there.');
  });

  it('formats heights and gaps for the tooltip', () => {
    expect([heightText(16.4), heightText(10), heightText(9.94), heightText(0.25)]).toEqual(['16', '10', '9.9', '0.3']);
    expect([gapText(1), gapText(0.75), gapText(1.25)]).toEqual(['1.0', '0.8', '1.3']);
  });

  it('translates every sentence', () => {
    for (const lang of ['ja', 'zh-Hant'] as const) {
      setLanguage(lang);
      for (const key of UNRESOLVED_KEYS) expect(translateMessage({ key, vars: { h: 1, gap: 1, need: 1 } }), `${lang}: ${key}`).not.toBe(key.replace(/\{\w+\}/g, '1'));
    }
  });
});
