import type { ReactNode } from 'react';

/**
 * A folded section: one quiet header button (`{uiName}-toggle`, `aria-expanded`) that opens and closes its body
 * (`{uiName}-body`, not rendered while closed). The owner keeps `open`; `onToggle` gets the new state.
 */
export function Fold({ uiName, label, open, onToggle, children }: {
  uiName: string;
  /** The header words, already translated. */
  label: string;
  open: boolean;
  onToggle: (open: boolean) => void;
  children: ReactNode;
}) {
  const body = `${uiName}-body`;
  return <section className={open ? 'fold is-open' : 'fold'} data-ui={uiName}>
    <button type="button" className="fold-toggle" data-ui={`${uiName}-toggle`} aria-expanded={open} aria-controls={body} onClick={() => onToggle(!open)}>
      <span className="fold-chevron" aria-hidden="true" />{label}
    </button>
    {open ? <div className="fold-body" id={body} data-ui={body}>{children}</div> : null}
  </section>;
}
