// Copyright (c) Mixo Creative.

import type { Message } from '../i18n';
import type { CapacityLimit, RowState } from './rowState';

/**
 * WHAT A ROW SAYS, as a `Message` so it re-translates when the language changes.
 *
 * Only the five states this release can reach have text. Repair is cut (plan §8 step 9), so nothing
 * can press it and `refused` / `unchanged` / `repaired` / `repaired-open` cannot occur — giving them
 * sentences would mean translating four strings into three languages for rows that cannot exist, and
 * the `never` below is what makes that a compile error rather than a quiet gap if repair returns
 * without its words.
 *
 * TWO DECISIONS IN THE WORDING, both from §7:
 *
 * Neither defect sentence tells the operator to fix anything, because nothing in this release can.
 * Offering a fix with no press behind it is a worse lie than saying only what is true.
 *
 * `holes` and `malformed` stay separate sentences even though both end the same way, because step 5
 * measured them as different populations: **zero** of 18 real scans had an open rim, **8** had
 * non-manifold edges. One merged sentence would hide which of the two the operator is looking at.
 */

/** The advice both defect sentences end with: printable, but worth a look. */
const CHECK_IT = 'It can still be printed, but check the result.';

/** What each capacity guard turned the file away for. The file is fine; it does not fit. */
const LIMIT_TEXT: Record<CapacityLimit, string> = {
  triangles: 'Too many triangles for the plate.',
  memory: 'Too large to hold in memory.',
  plate: 'Too big for the plate.',
};

/** The sentence for a row, or `undefined` for a state this release cannot reach. */
export function rowSentence(row: RowState): Message | undefined {
  switch (row.state) {
    case 'clean':
      return { key: 'Ready to print.' };
    case 'holes':
      return {
        key: 'Has one open edge loop.',
        other: 'Has {n} open edge loops.',
        vars: { n: row.loops },
        then: { key: CHECK_IT },
      };
    case 'malformed':
      // The state has TWO causes and the sentence must say which: a file whose only fault is inverted
      // winding has `nonManifoldEdges: 0`, and "Has 0 edges shared by more than two faces" is absurd.
      return row.nonManifoldEdges > 0
        ? {
          key: 'Has one edge shared by more than two faces.',
          other: 'Has {n} edges shared by more than two faces.',
          vars: { n: row.nonManifoldEdges },
          then: { key: CHECK_IT },
        }
        : { key: 'Some faces point inwards.', then: { key: CHECK_IT } };
    case 'unreadable':
      return { key: 'Could not be read.' };
    case 'too-big':
      return { key: LIMIT_TEXT[row.limit] };
    // Repair is cut, so these four cannot happen. When it returns, each needs its own sentence.
    case 'refused':
    case 'unchanged':
    case 'repaired':
    case 'repaired-open':
      return undefined;
  }
}

/** Whether this release can show the row at all — the five reachable states (§8 step 9). */
export const rowIsReachable = (row: RowState): boolean => rowSentence(row) !== undefined;
