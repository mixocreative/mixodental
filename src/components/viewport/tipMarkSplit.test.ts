import { describe, expect, it } from 'vitest';
import { splitTipMarks, type TipMark } from './tipMarkSplit';

const tip = (id: string): TipMark => ({ id, position: [0, 0, 0], normal: [0, 1, 0] });
const points = [tip('a'), tip('b'), tip('c')];

describe('splitTipMarks', () => {
  it('draws every tip plain when no brush is in hand', () => {
    const sets = splitTipMarks(points, undefined);
    expect(sets.plain.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(sets.solid).toEqual([]);
    expect(sets.ghost).toEqual([]);
  });

  it('puts the selected in solid and the swept in ghost', () => {
    const sets = splitTipMarks(points, { solid: new Set(['a']), ghost: ['b'], ghostTone: 'remove' });
    expect(sets.solid.map((p) => p.id)).toEqual(['a']);
    expect(sets.ghost.map((p) => p.id)).toEqual(['b']);
    expect(sets.plain.map((p) => p.id)).toEqual(['c']);
  });

  /*
   * THE RULE THIS FILE EXISTS FOR. A tip in both sets is drawn SOLID, not ghosted, because
   * `brushPreview` has already decided: an Unselect sweep takes a tip OUT of `solid` before
   * putting it in `ghost`, so anything still in both is one a Select sweep would leave as it is.
   * Ghost it and a Select sweep over the current selection makes it flicker see-through for no
   * reason the operator can act on.
   */
  it('draws a tip that is both selected and swept as solid', () => {
    const sets = splitTipMarks(points, { solid: new Set(['a']), ghost: ['a', 'b'], ghostTone: 'remove' });
    expect(sets.solid.map((p) => p.id)).toEqual(['a']);
    expect(sets.ghost.map((p) => p.id)).toEqual(['b']);
  });

  it('keeps the order the points came in', () => {
    const sets = splitTipMarks([tip('c'), tip('a'), tip('b')], { solid: new Set<string>(), ghost: [], ghostTone: 'ring' });
    expect(sets.plain.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });
});
