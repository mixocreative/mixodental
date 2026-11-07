import { describe, expect, it } from 'vitest';
import { itemsLeft, nextItem } from './nextItem';
import type { PrintUnit } from '../state/project';

const unit = (id: string) => ({ id } as PrintUnit);
const plate = ['a', 'b', 'c', 'd'].map(unit);

describe('which item the loop goes to next', () => {
  it('takes the first unit that is neither finished nor the one just done', () => {
    expect(nextItem(plate, [], undefined)?.id).toBe('a');
    expect(nextItem(plate, ['a'], 'a')?.id).toBe('b');
    expect(nextItem(plate, ['a', 'b'], 'b')?.id).toBe('c');
  });

  it('ends the loop by returning nothing when every item has been through', () => {
    expect(nextItem(plate, ['a', 'b', 'c', 'd'], 'd')).toBeUndefined();
    expect(nextItem([], [], undefined)).toBeUndefined();
  });

  /*
   * THE CASE THAT MATTERS AT THE HANDOVER. `exportedDental` adds the unit to `dentalFinished` before
   * the export runs, and `addAnotherDental` adds it again through `finished()`. So at the moment
   * *Next item* is pressed the unit just done is usually in BOTH places, and sometimes in only one -
   * exported but not yet added-another. Either way it must not be offered back.
   */
  it('never returns the unit just done, whether or not it reached the finished list', () => {
    expect(nextItem(plate, ['a'], 'a')?.id).toBe('b');
    expect(nextItem(plate, [], 'a')?.id).toBe('b');
    // And a finished unit stays skipped once the press has moved on from it.
    expect(nextItem(plate, ['a', 'c'], 'c')?.id).toBe('b');
  });

  it('follows plate order, not the finished order', () => {
    // b was done first, so plate order still sends the operator to a.
    expect(nextItem(plate, ['b'], 'b')?.id).toBe('a');
  });

  it('counts exactly the set it draws from, so the page cannot say one thing and do another', () => {
    expect(itemsLeft(plate, [], undefined)).toBe(4);
    expect(itemsLeft(plate, ['a'], 'a')).toBe(3);
    expect(itemsLeft(plate, ['a', 'b', 'c', 'd'], 'd')).toBe(0);
    // The invariant: a count of 0 and a next item cannot both be true.
    for (const done of [[], ['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd']]) {
      const left = itemsLeft(plate, done, done.at(-1));
      expect(left === 0).toBe(nextItem(plate, done, done.at(-1)) === undefined);
    }
  });
});
