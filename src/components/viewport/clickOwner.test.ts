import { describe, expect, it } from 'vitest';
import { modeOwnsClick } from './clickOwner';

describe('modeOwnsClick', () => {
  it('gives rim define mode and the dental area brush the whole click', () => {
    expect(modeOwnsClick('dental-rim')).toBe(true);
    expect(modeOwnsClick('dental-area')).toBe(true);
  });

  /*
   * The edit readings of a click have to keep working everywhere else, and `zones` is the one that
   * looks like it belongs above: `pickAction` already knows that mode and answers for it, so listing
   * it here would be a second rule saying the same thing in a different place.
   */
  it('leaves every other mode to the edit readings', () => {
    for (const kind of ['none', 'zones', 'add', 'pick', 'drag', 'dental-aligner'] as const) {
      expect(modeOwnsClick(kind)).toBe(false);
    }
  });
});
