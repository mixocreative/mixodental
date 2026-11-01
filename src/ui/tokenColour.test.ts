import { describe, expect, it } from 'vitest';
import { NEUTRAL_COLOUR, parseHexColour, tokenColour } from './tokenColour';

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
