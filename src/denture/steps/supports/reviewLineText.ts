/*
 * Denture Step 2's one status line (P7c): what the build left to do, in plain words. Pure: the panel gives the counts,
 * this picks the sentence and whether the one Fix action shows. Spots the denture rules accept on purpose (grey,
 * "accepted by rule") are never counted: the panel leaves them out of `problems`.
 */

/** What the line is about: building, a failed build, points a click can support (Fix), things to look at, or done. */
export type ReviewLineKind = 'building' | 'failed' | 'fix' | 'look' | 'ready';

export interface ReviewLine {
  kind: ReviewLineKind;
  /** The i18n key of the line (`other` is its plural form when `n` is not 1). */
  key: string;
  other?: string;
  n: number;
}

export interface ReviewCounts {
  /** The build is finished for the unit as it is now. */
  built: boolean;
  /** The last build failed (a setting change builds again). */
  failed: boolean;
  /** Unresolved points a click (or Fix) supports from the model surface. */
  resolvable: number;
  /** Unresolved islands no tip can stand on, the build's notes and the check's real findings. */
  problems: number;
}

export function reviewLine({ built, failed, resolvable, problems }: ReviewCounts): ReviewLine {
  if (failed && !built) return { kind: 'failed', key: 'The supports could not be built. Change a setting to build them again, or press Back.', n: 0 };
  if (!built) return { kind: 'building', key: 'Building supports…', n: 0 };
  if (resolvable > 0) return { kind: 'fix', key: '1 spot needs a support.', other: '{n} spots need a support.', n: resolvable };
  if (problems > 0) return { kind: 'look', key: '1 thing to look at.', other: '{n} things to look at.', n: problems };
  return { kind: 'ready', key: 'Supports ready. Every point is held.', n: 0 };
}
