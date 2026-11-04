import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

/** A layout effect in the browser, a plain one when this is rendered to a string (the tests do that). */
const useMeasure = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The one line that names a screen: the question it puts to the reader ("What would you like to support?",
 * "Choose the aligner type") or what the screen is busy doing ("Checking and orienting the aligner…").
 *
 * IT EXISTS SO THAT LINE IS DECIDED ONCE. Before it, the app's five screen headings were five different
 * answers to the same question. They were plain `h2` tags, so each one collected whatever the cascade
 * happened to hand it: 18px sans on the start screen, 15px from the stage's own base rule, 12px bold from
 * the theme's header rule - and in Chinese a serif face from the title rule, which outranks the header rule
 * and left one heading half title and half header, in neither size nor face of either.
 *
 * IT MEASURES ITSELF, which is the part CSS cannot do. The words are ranged left and the block is centred
 * (the house rule: a reader's eye returns to one left edge on every line). For a block to LOOK centred it
 * has to be exactly as wide as its longest line - and no CSS width shrinks a box to its WRAPPED text.
 * `fit-content`, `inline-block` and `display: table` all size to the text as if it were one unbroken line,
 * then cap at `max-width`, which left a two-line heading in a box 602px wide holding lines of 334px and
 * 368px: correctly centred, 234px too wide, and visibly sitting left of centre. So after it wraps, the line
 * boxes are measured and the widest becomes the width. It re-measures when the window changes and once the
 * fonts have loaded, because both change where the words break.
 */
export function ScreenHeading({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);

  useMeasure(() => {
    const element = heading.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const fit = () => {
      // Let it take its full measure again first, or each pass would measure the last pass's width.
      element.style.width = '';
      const range = document.createRange();
      range.selectNodeContents(element);
      // One rect per line box, so this is the text as it actually broke.
      const widest = Math.max(0, ...[...range.getClientRects()].map((line) => line.width));
      if (widest > 0) element.style.width = `${Math.ceil(widest)}px`;
    };

    fit();
    // The parent is watched, not the heading: watching the heading would see the width this sets and loop.
    const room = element.parentElement ?? element;
    const observer = new ResizeObserver(fit);
    observer.observe(room);
    // A fallback face measures differently from the real one, so the first fit can be wrong until it lands.
    let live = true;
    void document.fonts?.ready.then(() => { if (live) fit(); });
    return () => { live = false; observer.disconnect(); };
  }, [children]);

  return <h2 ref={heading} className="screen-heading">{children}</h2>;
}
