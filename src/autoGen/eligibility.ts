// Copyright (c) Mixo Creative.

import type { DetectState } from '../items/detectState';

/**
 * WHETHER A CARD MAY BE AUTO-GENERATED, and when it may not, WHY - decided once, with no React and
 * no worker anywhere near it.
 *
 * THE POINT OF A SEPARATE MODULE (owner's ruling 3, `docs/design/2026-11-18-card-deck-plan.md`):
 * auto-gen is an independent pipeline in three layers - this, the pipeline that runs a model through
 * the stages, and the queue that drives them. The layers exist so the middle one can be tested
 * without a browser; this one exists so the question "is this card safe to generate unattended" has
 * exactly one answer, whether it is being asked by one card's key, by Auto-gen all, or by a test.
 *
 * WHAT IT IS GUARDING AGAINST. An unattended generate commits an orientation nobody looked at. Every
 * block below is a case where the engine told us something and the old deck threw it away: 'Ready'
 * was `kind !== 'failed'`, so a model whose pose could not be decided, whose opening contradicted
 * the chosen type, whose two up/down rules disagreed, or whose mesh was not even closed, all read
 * Ready and would all have been generated. See `src/items/detectState.ts` for where those doubts
 * now live.
 *
 * It does NOT re-derive any of that. It reads the row's settled detect state and the two facts the
 * deck owns (has the operator named this model, is the deck at its limit), and says yes or no. Three
 * facts in, one verdict out.
 */

/** Why auto-gen is not offered. One reason, the first that applies, because the card has room for one line. */
export type AutoGenBlock =
  /** No category and type chosen: the queue has nothing to generate FOR. The owner's ruling - the key is absent, not greyed. */
  | 'unanswered'
  /** The orientation check has not finished (queued or running). Asking again later is the whole fix. */
  | 'checking'
  /** The check came back with something a human must settle. `doubts` on the detect state says which. */
  | 'needs-attention'
  /** Detection found no rim: the operator draws one, and that is a drawing job, not a queue job. */
  | 'no-rim'
  /** The check could not run at all. Retry, or open it and orient by hand. */
  | 'failed'
  /** The deck is at its model cap or its memory budget (`src/items/deckBudget.ts`). */
  | 'full';

export type AutoGenEligibility = { readonly ready: true } | { readonly ready: false; readonly because: AutoGenBlock };

const READY: AutoGenEligibility = { ready: true };

/**
 * `answered` is category AND type chosen - the owner's rule that the key appears only on an answered
 * card. `atCap` is the deck's own limit, asked rather than computed here because only the queue
 * knows how many models are already resident.
 *
 * ORDER IS DELIBERATE: the question the operator can act on comes first. "Name this model" precedes
 * "the check is running", because a card nobody has named is not being checked at all - the detector
 * needs the type to run.
 */
export function autoGenEligibility(card: { answered: boolean; detect: DetectState | undefined; atCap: boolean }): AutoGenEligibility {
  if (!card.answered) return { ready: false, because: 'unanswered' };
  if (card.detect === undefined) return { ready: false, because: 'checking' };
  switch (card.detect.kind) {
    case 'waiting':
    case 'running': return { ready: false, because: 'checking' };
    case 'check': return { ready: false, because: 'needs-attention' };
    case 'no-rim': return { ready: false, because: 'no-rim' };
    case 'failed': return { ready: false, because: 'failed' };
    /*
     * THE CAP IS CHECKED LAST, and that is not an accident either. A card that is blocked for its own
     * reasons stays blocked for that reason even when the deck is full, because clearing space would
     * not help it - and a card told "the deck is full" when its real problem is an unreadable mesh
     * sends the operator to delete other people's work for nothing.
     */
    case 'oriented': return card.atCap ? { ready: false, because: 'full' } : READY;
  }
}
