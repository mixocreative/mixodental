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
  | 'full'
  /**
   * The card already has its supports. Open it instead - the key is for cards that have none.
   *
   * THIS IS NOT TIDINESS, it is the one way this queue could destroy work without asking. The
   * pipeline's first step turns the model to the pose the engine proposes, and since 2026-11-18 a
   * turn is a re-orient: the reducer deletes the supports AND the hand edits keyed to their
   * positions. The interactive path asks before it does that (`backLosesWork`); a press on this key
   * asked nothing. Found by Fable reading the diff, after I had seen it happen on screen and read it
   * as the cancel rather than as the re-run.
   *
   * It also makes Auto-gen all mean what it says: without this, every press re-ran every finished
   * card in the case, minutes each.
   */
  | 'built'
  /**
   * The area on this card is the operator's own, painted by hand.
   *
   * `useDentalFlow.next` checks `keepsManualArea` and goes straight on with it; the pipeline has no
   * such branch and would commit a freshly detected area over the top - the `u9` defect, arriving
   * through the second caller. Blocked here rather than branched there, because "detect over the
   * operator's own work" has no good version.
   *
   * KNOWN GAP, recorded rather than implied: a hand-DRAWN RIM is not caught. `drawnRim` builds an
   * ordinary two-contour policy that `isManualArea` cannot tell from a detected one - the debt
   * `src/dental/flow.ts` already carries, which is a change to saved project data to fix.
   */
  | 'own-area';

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
export function autoGenEligibility(card: {
  answered: boolean; detect: DetectState | undefined; atCap: boolean;
  /** This unit already carries supports. */
  built: boolean;
  /** This unit's support area is the operator's own painting (`keepsManualArea`). */
  ownArea: boolean;
}): AutoGenEligibility {
  if (!card.answered) return { ready: false, because: 'unanswered' };
  /*
   * THE OPERATOR'S OWN WORK IS CHECKED BEFORE THE CHECK'S RESULT, because a card carrying a build or
   * a painted area is one the queue must not touch whatever the detector thinks of it - and the
   * detector's answer on such a card is stale by definition: it ran before the work existed.
   */
  if (card.built) return { ready: false, because: 'built' };
  if (card.ownArea) return { ready: false, because: 'own-area' };
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
