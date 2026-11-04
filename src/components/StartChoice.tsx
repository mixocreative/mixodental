import { Icon } from '../ui/Icon';

/**
 * One of the big choices on the start screen: a picture over a word, in a tall key.
 *
 * EVERY choice on that screen is this component and they are drawn EXACTLY alike - the same shape, the same art
 * size, the same word style, the same fill. None of them is the main one: the reader is choosing what they came to
 * make, not being steered, and a filled key among plain ones reads as a recommendation. There is deliberately no
 * prop to single one out.
 *
 * `icon` is the name of a file in `src/ui/assets/icons/` (see `src/ui/Icon.tsx`): replace the file to replace the
 * picture, no code change. `label` is already translated by the caller, which is also where the word lives.
 */
export function StartChoice({ icon, label, ui, onChoose }: {
  icon: string;
  label: string;
  /** The element's stable name for designers and the walk, e.g. `start-aligner`. */
  ui: string;
  onChoose: () => void;
}) {
  return <button type="button" className="start-big" data-ui={ui} onClick={onChoose}>
    <Icon name={icon} className="start-big-art" />
    <span className="start-big-label">{label}</span>
  </button>;
}
