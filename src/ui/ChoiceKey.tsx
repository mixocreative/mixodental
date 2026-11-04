import { Icon } from './Icon';

/**
 * ONE key for "pick one of these": the big choices on the start screen, and the aligner types on the type
 * screen that follows it.
 *
 * IT EXISTS SO THAT KEY IS DRAWN ONCE. Those two screens ask the reader for exactly the same gesture, one
 * after the other, and they used to be two separate components that disagreed about nearly everything: one
 * had a `--line` hairline and the other `--line-strong`; one answered a hover with an underline and the
 * other by filling itself white; one was 168-220px wide in a grid and the other a fixed 260px in a flex row;
 * one drew its art at 72px and the other at 120px. Nothing about that was a decision - it was two places
 * drifting.
 *
 * `icon` is the name of a file in `src/ui/assets/icons/` (see `src/ui/Icon.tsx`): replace the file to replace
 * the picture, no code change. `label` and `note` arrive already translated, from the caller that owns the
 * words. There is deliberately NO prop that singles a key out as the main one: a filled key among plain ones
 * reads as a recommendation, and the reader is choosing what they came to make.
 */
export function ChoiceKey({ icon, label, note, ui, pressed, onChoose }: {
  icon: string;
  label: string;
  /** The line under the word, for a choice that needs explaining. The start screen's keys do not have one. */
  note?: string;
  /** The element's stable name for designers and the walk, e.g. `start-aligner`. */
  ui: string;
  /** Only for a key that STAYS chosen, like the aligner type. A key that just goes somewhere leaves it out. */
  pressed?: boolean;
  onChoose: () => void;
}) {
  return <button type="button" className="choice-key" data-ui={ui}
    {...(pressed === undefined ? {} : { 'aria-pressed': pressed })} onClick={onChoose}>
    <Icon name={icon} className="choice-key-art" />
    <span className="choice-key-words">
      <span className="choice-key-label">{label}</span>
      {note ? <small className="choice-key-note">{note}</small> : null}
    </span>
  </button>;
}
