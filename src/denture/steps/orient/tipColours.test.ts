import { describe, expect, it } from 'vitest';
import { NEUTRAL_COLOUR } from '../../../ui/tokenColour';
import { tipColours } from './tipColours';

describe('tipColours', () => {
  it('reads one token per path state (neutral outside a browser)', () => {
    expect(tipColours()).toEqual({ path: NEUTRAL_COLOUR, fallback: NEUTRAL_COLOUR, none: NEUTRAL_COLOUR });
  });
});
