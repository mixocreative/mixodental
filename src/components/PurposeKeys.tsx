// Copyright (c) Mixo Creative.

import { ANY_MODEL, PURPOSE_CATEGORIES } from './purposes';
import { ChoiceKey } from '../ui/ChoiceKey';
import { t } from '../i18n';

/**
 * THE PURPOSE QUESTION — "what are you making?" — drawn as the three big keys, for the ENTRY SCREEN
 * ONLY.
 *
 * The deck draws the same question as a dense control instead (`PurposeSelect`), because three
 * pieces of pixel art above a twenty-four-row list push the work off the screen. These keys are
 * right where the operator has nothing in front of them and is choosing with pictures.
 *
 * It exists because the question is asked on two screens and must be the same question on both. The
 * owner's ruling of 2026-11-18: *either the user tells what they want, or they drag-drop files and it
 * shows the deck.* So the entry screen asks it of someone who has no file yet, and the deck asks it
 * of files that already exist — one question, one set of answers, one rendering.
 *
 * IT OWNS THE RENDERING, NOT THE ANSWERS: those are `./purposes.ts`, because a row's own control
 * shows the same list without these big keys. And it owns neither what an answer DOES - `onDental`
 * hands back the profile it chose and the caller decides whether that means a file picker, a batch,
 * or a re-detect.
 */
export function PurposeKeys({ onDental, onAnyModel }: {
  /** An answer that enters the dental flow, with the profile it chose. */
  onDental: (profile: string) => void;
  /**
   * "Any model": work with no flow at all, and the ONLY door to the bench
   * (`src/scenes/sceneMap.ts` `doors`). Hiding it took Support Edit Mode, zones, the plate panel and
   * every export with it, which is why it is an answer to this question rather than a link somewhere.
   */
  onAnyModel: () => void;
}) {
  return <div className="choice-keys">
    {PURPOSE_CATEGORIES.map((category) => <ChoiceKey key={category.id} icon={category.icon} label={t(category.label)}
      ui={`start-${category.icon}`} onChoose={() => onDental(category.id)} />)}
    {/* There is deliberately no `pressed` on any of these: a filled key among plain ones reads as a
        recommendation, and the operator is answering about an object they are holding. */}
    <ChoiceKey icon={ANY_MODEL.icon} label={t(ANY_MODEL.label)} ui="start-any-model" onChoose={onAnyModel} />
  </div>;
}
