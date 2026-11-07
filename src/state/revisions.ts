// Copyright (c) Mixo Creative.

import { TOOL_ORDER, type ToolId } from './tools';

/**
 * WHICH TOOL'S WORK IS OUT OF DATE, and why this is one field of plain numbers.
 *
 * The rail needs a third state between *ready* and *greyed*: re-orienting must not throw the rim,
 * the area and the supports away, but it must say they no longer match. So each tool's accepted work
 * carries a REVISION, taken from one counter per unit, and a tool is stale when its number is below
 * **the newest revision anywhere above it in the chain** - see `staleTools`, which is where the
 * "below its immediate neighbour" reading was a real bug.
 *
 * WHAT WAS CONSIDERED AND REJECTED: recording the rotation each stage was made at and comparing it.
 * Rotations are floats, so the comparison would need an epsilon, and an epsilon that decides whether
 * the operator is told their supports are out of date is a number nobody can defend. Integers from
 * one counter compare exactly, save as JSON without loss, and read the same a year later.
 *
 * STALENESS CASCADES, which is the property worth having. Re-orienting raises `orient` above all
 * three below it, so all three read stale at once. Re-painting the area raises `area` above
 * `supports` only, and the rim is left alone — it was not affected and saying otherwise would be a
 * lie the operator has to work out for themselves.
 */

/** Each tool's accepted work, by the revision of the unit it was made at. Absent means no work yet. */
export type Revisions = { readonly [K in ToolId]?: number };

/**
 * The tools whose work predates something above them.
 *
 * COMPARED AGAINST THE WHOLE CHAIN ABOVE, not the adjacent link. The first version walked one link
 * and gave up when that link had no work of its own, so `{ orient: 5, area: 1 }` reported NOTHING
 * stale: Area skipped the test because Rim was absent, and read ready although a re-orient had left
 * it four revisions behind. `revisionsField` accepts records with gaps - `normalizeUnit` checks the
 * key names and that each value is a positive integer, not that the chain is contiguous - so that
 * record is one a saved project can really hold.
 *
 * A tool with no work is NOT stale. Staleness is a statement about work that EXISTS, so a missing
 * revision is not this function's answer to give; that is `unavailable` or `ready`, which
 * `toolState` decides.
 */
export function staleTools(revisions: Revisions): readonly ToolId[] {
  const stale: ToolId[] = [];
  TOOL_ORDER.forEach((tool, index) => {
    const mine = revisions[tool];
    if (mine === undefined) return;
    // The newest thing accepted anywhere above this tool. Taking the maximum is what carries the
    // cascade across a gap, and it makes the `stale.includes(upstream)` chaining of the first
    // version unnecessary: a re-orient is above everything, so everything below it reads stale.
    const above = TOOL_ORDER.slice(0, index)
      .map((earlier) => revisions[earlier])
      .filter((at): at is number => at !== undefined);
    if (above.length > 0 && Math.max(...above) > mine) stale.push(tool);
  });
  return stale;
}

/** The next revision to stamp on a unit's work: one above everything already recorded. */
const nextRevision = (revisions: Revisions): number =>
  Math.max(0, ...TOOL_ORDER.map((tool) => revisions[tool] ?? 0)) + 1;

/**
 * `revisions` with `tool` accepted now, dropped when the tool's work is removed.
 *
 * `undefined` for `tool` means nothing is recorded any more: clearing a rim or removing the supports
 * must take the revision with it, or the number would go on claiming work that is gone and
 * `staleTools` would age the tools below it against a ghost.
 */
export function stamped(revisions: Revisions | undefined, tool: ToolId, done: boolean): Revisions | undefined {
  const current = revisions ?? {};
  if (!done) {
    if (current[tool] === undefined) return revisions;
    const { [tool]: _gone, ...rest } = current;
    return Object.keys(rest).length === 0 ? undefined : rest;
  }
  return { ...current, [tool]: nextRevision(current) };
}
