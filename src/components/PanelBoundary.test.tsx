import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { PanelBoundary } from './PanelBoundary';
import { setLanguage } from '../i18n';

/*
 * WHAT THIS CAN AND CANNOT PIN, said plainly because the gap matters.
 *
 * It pins the boundary's DECISION (a throw becomes the failed state) and its FACE (the failed state
 * renders a named sentence, never nothing). It does NOT pin that a crash in one panel leaves its
 * siblings mounted: that is React unwinding to the nearest boundary, and this repo renders components
 * with `renderToStaticMarkup`, which does not run error boundaries at all, with no jsdom to fall back
 * on. Four separate boundaries is the mechanism; the test is that each one has a face worth having.
 *
 * `.css` is read from disk because `?raw` on a stylesheet returns an EMPTY STRING under the test
 * runner - Vite's CSS handling intercepts it (`src/ui/uiStylingDoc.test.ts` had already written that
 * down, and `AppBoundary.test.tsx` learned it again the slow way).
 */
const STYLES = new TextDecoder().decode(readFileSync('src/styles.css'));

/** The boundary after a throw, as React would leave it: `getDerivedStateFromError` then `render`. */
function afterThrow(name: string): string {
  const boundary = new PanelBoundary({ name, children: 'the panel' });
  boundary.state = PanelBoundary.getDerivedStateFromError();
  return renderToStaticMarkup(boundary.render() as never);
}

describe('a stopped panel', () => {
  it('shows the panel while nothing has thrown', () => {
    expect(renderToStaticMarkup(<PanelBoundary name="deck"><p>the panel</p></PanelBoundary>)).toBe('<p>the panel</p>');
  });

  it('turns a throw into the failed state, whatever was thrown', () => {
    expect(PanelBoundary.getDerivedStateFromError()).toEqual({ failed: true });
  });

  /*
   * THE ONE DELIBERATE DIFFERENCE FROM THE SIBLING APP. mixoMesh's `PanelErrorBoundary` renders
   * `null`, so a crashed panel becomes an empty space - and an empty space is indistinguishable from
   * a panel with nothing to show, which is the S22 silence in a smaller box (MIXO-04's class). If
   * this ever regresses to `null`, this is the test that says so.
   */
  it('renders a FACE, not an empty space', () => {
    const html = afterThrow('viewport');
    expect(html).not.toBe('');
    const words = /data-ui="panel-stopped-viewport"[^>]*>([^<]+)</.exec(html)?.[1] ?? '';
    expect(words.trim().split(/\s+/).length, 'a sentence, not a word').toBeGreaterThan(4);
    expect(html).toContain('role="alert"');
  });

  it('names the panel that stopped, so four boundaries are four different faces', () => {
    const names = ['deck', 'viewport', 'jobs', 'settings'];
    const seen = names.map((name) => /data-ui="(panel-stopped-[\w-]+)"/.exec(afterThrow(name))?.[1]);
    expect(seen).toEqual(names.map((name) => `panel-stopped-${name}`));
  });

  it('re-translates, like every other sentence in the app', () => {
    const english = afterThrow('deck');
    setLanguage('ja');
    try {
      expect(afterThrow('deck')).not.toBe(english);
    } finally {
      setLanguage('en');
    }
  });

  it('is legible with no tokens: its CSS carries a literal fallback beside every token', () => {
    const rule = /^\.panel-stopped\s*\{([^}]*)\}/m.exec(STYLES)?.[1];
    expect(rule, '.panel-stopped should be in src/styles.css').toBeDefined();
    for (const match of rule!.matchAll(/var\((--[a-z-]+)([^)]*)\)/g)) {
      expect(match[2], `${match[1]} needs a fallback`).toMatch(/^,\s*\S/);
    }
  });
});
