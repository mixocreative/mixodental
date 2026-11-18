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
    case 'done': return card.tips === 1
      ? { key: '1 support placed' }
      : { key: '{n} supports placed', vars: { n: card.tips } };
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
          ? { key: 'Could not check the orientation. Press Retry, or open it to orient by hand.' }
          : { key: 'Generating supports failed. Open it to try again.' };
      // `needs-attention`, `no-rim` and `gone`: the chip beside it already says so, or there is no card.
      default: return undefined;
    }
  }
}
