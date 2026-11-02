import { describe, expect, it } from 'vitest';
import { NEUTRAL_COLOUR, hexString, parseHexColour, refreshTokenColours, subscribeTokens, tokenColour, tokenCss, tokenRevision } from './tokenColour';

describe('tokenColour', () => {
  it('reads #rrggbb and #rgb values', () => {
    expect(parseHexColour(' #4a6b3a')).toBe(0x4a6b3a);
    expect(parseHexColour('#fff')).toBe(0xffffff);
    expect(parseHexColour('var(--x)')).toBe(NEUTRAL_COLOUR);
  });

  it('is neutral outside a browser', () => {
    expect(tokenColour('--tip-path')).toBe(NEUTRAL_COLOUR);
  });
});

describe('live recolour', () => {
  it('formats a colour as #rrggbb', () => {
    expect(hexString(0x4a6b3a)).toBe('#4a6b3a');
    expect(hexString(0x000fff)).toBe('#000fff');
    expect(tokenCss('--mark-ring')).toBe(hexString(NEUTRAL_COLOUR));
  });

  it('refreshTokenColours raises the revision and calls every subscriber until it unsubscribes', () => {
    let calls = 0;
    const before = tokenRevision();
    const stop = subscribeTokens(() => { calls += 1; });
    refreshTokenColours();
    expect(tokenRevision()).toBe(before + 1);
    expect(calls).toBe(1);
    stop();
    refreshTokenColours();
    expect(calls).toBe(1);
  });
});
