import { useState, type ReactNode } from 'react';

/**
 * A titled block of a panel: the one way the app groups controls under a heading. Every panel has a title; the
 * four shapes it comes in are the two choices below.
 *
 * - `collapsible` false (the default): the title is a plain heading and the body is always there.
 * - `collapsible` true: the title is a button (`aria-expanded`, `aria-controls`) that opens and closes the body,
 *   which is not rendered while closed. `defaultOpen` says which way it starts, and the panel then keeps its own
 *   state; pass `open` and `onToggle` instead when the step has to remember it (across a Back, say), and the
 *   caller owns the state.
 *
 * `columns` lays the body out in 2 or 3 columns of equal width; the body falls back to one column by itself when
 * the panel is narrow (a container query), so a column count never has to be chosen for a particular width.
 *
 * Names: the section is `data-ui={ui}`, the title `{ui}-title`, the body `{ui}-body`, so a designer and the walk
 * can reach any part of any panel by one rule.
 */
export function Panel({ title, ui, collapsible = false, defaultOpen = true, columns = 1, open, onToggle, children }: {
  /** The heading words, already translated. */
  title: string;
  /** The panel's stable name, e.g. `denture-adjust`. */
  ui: string;
  collapsible?: boolean;
  /** How many columns the body is laid out in, where there is room for them. */
  columns?: 1 | 2 | 3;
  /** Only for a collapsible panel that keeps its own state: which way it starts. */
  defaultOpen?: boolean;
  /** Only for a collapsible panel the caller owns: pass both this and `onToggle`. */
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}) {
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  const isOpen = !collapsible || (open ?? ownOpen);
  const toggle = () => {
    const next = !isOpen;
    if (open === undefined) setOwnOpen(next);
    onToggle?.(next);
  };

  const bodyId = `${ui}-body`;
  const body = isOpen ? <div className="panel-widget-body" id={bodyId} data-ui={bodyId} data-columns={columns}>{children}</div> : null;
  return <section className={isOpen ? 'panel-widget is-open' : 'panel-widget'} data-ui={ui}>
    {collapsible
      ? <button type="button" className="panel-widget-title is-toggle" data-ui={`${ui}-title`} aria-expanded={isOpen} aria-controls={bodyId} onClick={toggle}>
        <span className="panel-widget-chevron" aria-hidden="true" />{title}
      </button>
      : <h3 className="panel-widget-title" data-ui={`${ui}-title`}>{title}</h3>}
    {body}
  </section>;
}
