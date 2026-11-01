import { describe, expect, it } from 'vitest';
import { parseHexColour, tipColours } from './tipColours';

describe('tipColours', () => {
  it('reads #rrggbb and #rgb tokens', () => {
    expect(parseHexColour(' #4a6b3a')).toBe(0x4a6b3a);
    expect(parseHexColour('#fff')).toBe(0xffffff);
    expect(parseHexColour('var(--x)')).toBe(0x808080);
  });

  it('falls back to neutral outside a browser', () => {
    expect(tipColours().path).toBe(0x808080);
  });
});
