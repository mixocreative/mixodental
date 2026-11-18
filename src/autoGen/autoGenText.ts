// Copyright (c) Mixo Creative.

import type { AutoGenCard } from './useAutoGen';
import type { Message } from '../i18n';

/**
 * WHAT A CARD SAYS ABOUT ITS OWN AUTO-GEN RUN. Pure: a state in, a message out.
 *
 * SEPARATE FROM THE DETECT CHIP BESIDE IT, for the reason `src/items/README.md` gives about the
 * health mark: these are independent answers and one must not stand for the other. A card can be
 * "Ready" to the detector and stopped here for want of a support area, and collapsing the two would
 * lose whichever was shown second.
 *
 * TWO STOPS SAY NOTHING HERE. `needs-attention` and `no-rim` are already the detect chip's own
 * words, one cell away and in the operator's terms - repeating them would be two lines saying one
 * thing on a card built to be read in a glance - and `gone` has no card left to write on.
 */
export function autoGenSentence(card: AutoGenCard): Message | undefined {
  switch (card.kind) {
    case 'queued': return { key: 'Waiting to generate…' };
    case 'running': return { key: 'Generating supports…' };
    /*
     * A FINISHED CARD CARRIES THE PRINT-ANGLE CHECK'S BAD NEWS, and until now it did not: all three
     * outcomes read "94 supports placed", and the notices existed only if the model was opened. The
     * deck's export needs no open and a reload loses the record, so a case could be exported with
     * nothing ever having said that no angle held.
     */
    case 'done': switch (card.angleCheck) {
      case 'none-held': return { key: '{n} supports placed, but no print angle held. Open it and check the angle.', vars: { n: card.tips } };
      case 'failed': return { key: '{n} supports placed. The print angle could not be checked.', vars: { n: card.tips } };
      case 'not-scanned': return { key: '{n} supports placed. The print angle was not checked.', vars: { n: card.tips } };
      default: return card.tips === 1
        ? { key: '1 support placed' }
        : { key: '{n} supports placed', vars: { n: card.tips } };
    }
    case 'stopped': switch (card.stop.because) {
      /*
       * THE ONE STOP THAT IS ABOUT A SETTING RATHER THAN A MODEL, and it says so rather than
       * generating with something else: an operator who chose a recipe and silently got the type's
       * numbers has supports they did not ask for on a model they are about to print.
       */
      case 'missing': return { key: 'The support recipe this model is set to is no longer saved. Choose one on the card.' };
      case 'no-area': return { key: 'No support area was found. Open it and paint one.' };
      case 'no-tips': return { key: 'No safe support position was found. Open it and place them by hand.' };
      case 'failed': return card.stop.at === 'area'
        ? { key: 'The support area could not be detected. Open it to try again.' }
        : card.stop.at === 'orient'
          // NOT "press Retry": Retry is drawn only for a row whose BATCH check failed, which this is
          // not, so the one instruction on screen pointed at a key that is not there.
          ? { key: 'The orientation check could not run. Open it to orient by hand.' }
          : { key: 'Generating supports failed. Open it to try again.' };
      /*
       * THESE TWO SPEAK BECAUSE THE CHIP CANNOT. The card was eligible, which means the deck's chip
       * said Ready - so when the pipeline's own fresh check disagrees, the chip is the stale one and
       * stays saying Ready. Leaving the card silent meant a press that appeared to do nothing at
       * all, on a model the engine had just raised a doubt about.
       */
      case 'needs-attention': return { key: 'The orientation check now disagrees with this card. Open it and look.' };
      case 'no-rim': return { key: 'No rim was found this time. Open it and draw one.' };
      // `gone`: the model has left the plate, so there is no card left to write on.
      default: return undefined;
    }
  }
}
