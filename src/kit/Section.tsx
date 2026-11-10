import type { ReactNode } from 'react';

/**
 * One titled band of the style book, and THE ONLY PLACE the page writes an `h2`.
 *
 * It was a local helper inside `Catalogue.tsx` until the icon sheet needed the same band, and a second
 * hand-written `h2` is exactly what `src/ui/ScreenHeading.test.tsx` exists to stop: a bare heading takes
 * whatever the cascade hands it, which once left the app with a heading that was 12px bold and serif at
 * the same time. One component, one answer, one entry on that test's allow list.
 */
export function Section({ title, ui, note, children }: {
  title: string;
  /** The band's stable name for designers and the walk, e.g. `kit-buttons`. */
  ui: string;
  /** A line under the title. The icon sheet states its rule here, where the icons it governs are. */
  note?: string;
  children: ReactNode;
}) {
  return <section className="kit-section" data-ui={ui}>
    <h2>{title}</h2>
    {note ? <p className="kit-section-note">{note}</p> : null}
    <div className="kit-grid">{children}</div>
  </section>;
}
