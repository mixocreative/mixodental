import type { ReactNode } from 'react';

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
 * A screen heading is not an `h2` that happens to sit in the right place. It is this component, and the one
 * rule behind it is `.screen-heading` in src/styles.css. `ScreenHeading.test.tsx` holds the app to it: a bare
 * `h2` anywhere else fails the test.
 */
export function ScreenHeading({ children }: { children: ReactNode }) {
  return <h2 className="screen-heading">{children}</h2>;
}
