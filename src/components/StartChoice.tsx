import { Icon } from '../ui/Icon';

/**
 * One of the big choices on the start screen: a picture over a word, in a tall key. Every choice on that screen is
 * this component, so all three are the same shape, the same art size and the same text style; the only difference
 * allowed is `main`, which fills the one choice most people want.
 *
 * `icon` is the name of a file in `src/ui/assets/icons/` (see `src/ui/Icon.tsx`): replace the file to replace the
 * picture, no code change. `label` is already translated by the caller, which is also where the word lives.
 */
export function StartChoice({ icon, label, ui, main = false, onChoose }: {
  icon: string;
  label: string;
  /** The element's stable name for designers and the walk, e.g. `start-aligner`. */
  ui: string;
  /** The one choice drawn as a filled key. At most one per screen. */
  main?: boolean;
  onChoose: () => void;
}) {
  return <button type="button" className={main ? 'start-big primary' : 'start-big'} data-ui={ui} onClick={onChoose}>
    <Icon name={icon} className="start-big-art" />
    <span className="start-big-label">{label}</span>
  </button>;
}
