// Copyright (c) Mixo Creative.

import { estimateGenerateBytes } from '@mixo-geocore/host/core/budget';

/**
 * WHAT A WHOLE CASE COSTS, AND HOW MUCH ROOM IS LEFT. Pure: numbers in, numbers out, no React.
 *
 * The engine already budgets ONE MODEL (`@mixo-geocore/host/core/budget`: 1.5M triangles, refused
 * over 6M). Nothing budgeted a CASE, and a case is what this app is for - 10 to 60 models dropped
 * at once, each one generated in turn. The owner asked for the missing half directly: *"maybe set a
 * safe cap fo rhow many models be genreated on deck. that deck job number vs cap nmber be shown, as
 * well as memory used vs memory allowance be shown on decker."*
 *
 * TWO NUMBERS, BECAUSE A CASE HAS TWO COSTS, and only one of them grows with the case:
 *
 *   RESIDENT - every unit's welded mesh, held for as long as it is on the plate. This is the one
 *              that scales with N, and it is far smaller than it looks: the scene keeps an INDEXED
 *              mesh at 18 B/triangle, so a 374k aligner is ~6.4 MiB and sixty are ~385 MiB. (An
 *              earlier estimate here said 25.7 MB each and 1.5 GB for sixty: that was triangle soup
 *              as it sits in the STL on disk, not the welded mesh the app keeps. Wrong by 4x, in
 *              the frightening direction.)
 *
 *   GENERATE - the working memory of building supports for ONE model, which the engine measures at
 *              850 MiB per million triangles. It does NOT scale with N, because the deck's queue
 *              runs one item at a time and forgets each session after it (`scripts/perf/
 *              deck-scale.ts`: keeping them costs ~19.7 MB per item and never gives it back;
 *              forgetting makes the curve flat at the cost of ~2.4 s per item).
 *
 * So the worst moment in a case is: every mesh resident, plus one generate - and the generate is
 * sized by the BIGGEST model, not the average, because that is the one that will peak highest.
 */

/**
 * Bytes a welded mesh keeps per triangle, stated by the engine's own measurements
 * (`host/core/budget.ts`: *"the scene keeps the 18 B/triangle mesh"*). It is a comment there rather
 * than an export, so it is repeated here with its source named; if the engine ever exports it, this
 * goes and the import takes its place.
 */
export const RESIDENT_BYTES_PER_TRIANGLE = 18;

/**
 * What one case may use. CHOSEN, NOT MEASURED - and labelled that way on purpose.
 *
 * The engine's figures bracket it: one model at the 1.5M triangle budget costs ~1.28 GiB to
 * generate on its own, and 10M triangles stopped a tab at 6.5 GB. A case allowance therefore has to
 * clear one full generate with room for the resident meshes beside it, and stay far below the
 * figure that killed a tab. 2 GiB does both.
 *
 * It is a parameter everywhere below, so the UI can show it, a test can pin the ARITHMETIC rather
 * than this number, and the day real browser figures land it changes in one place.
 */
export const CASE_BUDGET_BYTES = 2 * 2 ** 30;

/**
 * THE OTHER CEILING, and the readout is nonsense without it.
 *
 * Memory is not the only thing that runs out. Three 12-triangle test cubes left ~2 GB of allowance
 * untouched, so the derived cap came out at **9,942,004 models** - a true number and a useless one,
 * and exactly the kind of figure that teaches an operator to stop reading a line. Long before the
 * bytes run out, a list stops being scannable and a thumbnail queue stops being worth watching.
 *
 * A stage case is 10-60 models. 200 is more than three times the largest real one, so it never gets
 * in a working operator's way, and it keeps the readout a number a person can hold in their head.
 */
export const PRACTICAL_MAX_MODELS = 200;

export interface DeckUsage {
  /** Models on the deck now. */
  readonly models: number;
  /** How many models of the CURRENT average size fit inside the allowance. */
  readonly capModels: number;
  /** Every unit's welded mesh, held while it is on the plate. */
  readonly residentBytes: number;
  /** Resident, plus generating the biggest one. The worst moment of a whole-case run. */
  readonly peakBytes: number;
  readonly allowanceBytes: number;
  /** The peak does not fit. The deck says so BEFORE the operator presses, never after. */
  readonly overBudget: boolean;
}

/**
 * The case's usage from its models' triangle counts.
 *
 * An EMPTY deck is not a special case and must not read as one: zero models, zero bytes, and a cap
 * worked out from nothing is the whole allowance, so the readout says "0 of N" rather than "0 of 0"
 * - which would look like a deck that can hold nothing.
 */
export function deckUsage(triangles: readonly number[], allowanceBytes: number = CASE_BUDGET_BYTES): DeckUsage {
  const total = triangles.reduce((sum, count) => sum + count, 0);
  const largest = triangles.length === 0 ? 0 : Math.max(...triangles);
  const residentBytes = total * RESIDENT_BYTES_PER_TRIANGLE;
  const peakBytes = residentBytes + estimateGenerateBytes(largest);
  /*
   * THE CAP IS DERIVED, NEVER A MAGIC COUNT. "Thirty models" is meaningless: thirty aligners and
   * thirty full-arch scans are different cases by an order of magnitude. So the cap is how many
   * models of the size THIS case actually holds fit in what is left after one generate - which
   * moves as the operator drops heavier or lighter files, and is the honest answer to "how many
   * more can I add".
   */
  const average = triangles.length === 0 ? 0 : total / triangles.length;
  const room = allowanceBytes - estimateGenerateBytes(largest);
  const byMemory = average <= 0 || room <= 0 ? 0 : Math.floor(room / (average * RESIDENT_BYTES_PER_TRIANGLE));
  // Whichever ceiling is nearer. On light models that is the practical one; on heavy scans, memory.
  const capModels = Math.min(byMemory, PRACTICAL_MAX_MODELS);
  return {
    models: triangles.length,
    capModels,
    residentBytes,
    peakBytes,
    allowanceBytes,
    overBudget: peakBytes > allowanceBytes,
  };
}

/**
 * `1.4 GB`, `385 MB`, `98 KB` - one place, so every byte figure in this app reads the same way.
 *
 * IT STEPS DOWN TO KB rather than stopping at `<1 MB`. The first version did stop there, to keep a
 * memory gauge from reading `0 MB` while a case was loaded - a gauge that says zero is one the
 * operator stops believing. But this same function prints a FILE's size on a card, and `<1 MB` is
 * not something a lab can match against a folder listing. An exact KB figure serves both: precise
 * enough to recognise a file, and never zero while anything is there.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  const kb = bytes / 2 ** 10;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  const mb = kb / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}
