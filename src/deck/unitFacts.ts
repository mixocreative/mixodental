// Copyright (c) Mixo Creative.

import type { PrintUnit } from '../state/project';
import { staleTools } from './revisions';
import type { ToolFacts, ToolId } from './toolState';

/**
 * WHAT A UNIT PRESENTS TO THE RAIL. The one place that reads the scene's own fields and answers the
 * four questions `toolState` asks, so the rule stays pure and this stays the only thing to change
 * when the scene's shape moves.
 *
 * Each fact is read from the WORK ITSELF rather than from the revision record. The revisions decide
 * staleness and nothing else. Were the facts read from them instead, nothing on the rail would open
 * until the flow had stamped a revision, and every project saved before that field existed would
 * read as untouched.
 */

/**
 * ORIENTING IS INFERRED where it is not recorded, and the inference is sound rather than generous:
 * a rim is drawn on a model the operator was looking at the right way up, and an area is measured
 * from a rim. You cannot arrive at either without having oriented first.
 *
 * Without this, a project saved before `revisions` existed would come back with Rim greyed and the
 * operator told to redo work that is sitting there in front of them — which is exactly the failure
 * the reason-line rule exists to prevent, delivered by the thing meant to prevent it.
 */
const oriented = (unit: PrintUnit): boolean =>
  unit.revisions?.orient !== undefined || hasRim(unit) || unit.dental !== undefined;

/** A rim exists: drawn by hand and still in progress, or carried by an accepted area. */
const hasRim = (unit: PrintUnit): boolean => unit.rimDraft !== undefined || unit.dental !== undefined;

export function unitFacts(unit: PrintUnit, busy?: ToolId): ToolFacts {
  const stale = staleTools(unit.revisions ?? {});
  return {
    oriented: oriented(unit),
    hasRim: hasRim(unit),
    // The accepted footprint. `rimDraft` alone is a rim being drawn, not an area.
    areaAccepted: unit.dental !== undefined,
    ...(busy ? { busy } : {}),
    ...(stale.length > 0 ? { stale } : {}),
  };
}
