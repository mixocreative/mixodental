// Copyright (c) Mixo Creative.

import { TOOL_ORDER, type ToolId } from './toolState';

/**
 * WHICH TOOL'S WORK IS OUT OF DATE, and why this is one field of plain numbers.
 *
 * The rail needs a third state between *ready* and *greyed*: re-orienting must not throw the rim,
 * the area and the supports away, but it must say they no longer match. So each tool's accepted work
 * carries a REVISION, taken from one counter per unit, and a tool is stale exactly when its number
 * is below the number of the tool above it.
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

/** The tool each one depends on: the rail's order, read as a chain. */
const UPSTREAM: { readonly [K in ToolId]?: ToolId } = Object.fromEntries(
  TOOL_ORDER.slice(1).map((tool, index) => [tool, TOOL_ORDER[index]!]),
);

/**
 * The tools whose work predates what it was made from.
 *
 * A tool with no work is NOT stale — it is unavailable or ready, which `toolState` decides. Staleness
 * is a statement about work that exists, so a missing revision is simply not this function's answer
 * to give.
 */
export function staleTools(revisions: Revisions): readonly ToolId[] {
  const stale: ToolId[] = [];
  for (const tool of TOOL_ORDER) {
    const mine = revisions[tool];
    if (mine === undefined) continue;
    const upstream = UPSTREAM[tool];
    if (upstream === undefined) continue;
    const theirs = revisions[upstream];
    // Upstream with no work of its own cannot have outdated this: that is a prerequisite gone
    // missing, which greys the tool rather than ageing it.
    if (theirs === undefined) continue;
    // Stale if the thing above was accepted LATER, or if the thing above is itself stale — the
    // cascade, so re-orienting reaches the supports three links down.
    if (theirs > mine || stale.includes(upstream)) stale.push(tool);
  }
  return stale;
}

/** The next revision to stamp on a unit's work: one above everything already recorded. */
export const nextRevision = (revisions: Revisions): number =>
  Math.max(0, ...TOOL_ORDER.map((tool) => revisions[tool] ?? 0)) + 1;

/** `revisions` with `tool` accepted now, which is what makes everything below it stale. */
export const accepted = (revisions: Revisions, tool: ToolId): Revisions =>
  ({ ...revisions, [tool]: nextRevision(revisions) });
