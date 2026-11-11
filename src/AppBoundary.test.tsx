import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { AppBoundary, Stopped } from './AppBoundary';
import { publishSceneSave } from './rescue';
import { setLanguage } from './i18n';

/*
 * THE INVARIANT UNDER TEST IS THE AUDIT'S OWN SENTENCE: every way this app can fail has a face.
 *
 * What MIXO-04 found was an empty one - `#root` with zero children and zero text on a browser with
 * no WebGL2. So the assertion that matters below is not which words appear, it is that words appear
 * AT ALL, for every reason the app can stop for. The wording is the owner's to change and these
 * tests are written not to care about it.
 *
 * React's `componentDidCatch` cannot be exercised here: this repo renders components with
 * `renderToStaticMarkup` and has no jsdom, and the server renderer does not run error boundaries.
 * So the boundary's DECISION is tested directly - `getDerivedStateFromError` is a pure static
 * function and `render` is a branch on state - and the proof that React really calls it on a real
 * browser with no WebGL2 is the walk check, which loads the built app with `getContext('webgl*')`
 * blocked and refuses an empty `#root`.
 */

/*
 * SOURCE as text through `import.meta.glob(?raw)`, which is how every guard in this repo reads it,
 * but the STYLESHEET from disk - because `?raw` on a `.css` returns an EMPTY STRING under the test
 * runner, which Vite's own CSS handling intercepts. `src/ui/uiStylingDoc.test.ts` had already found
 * that and written it down; this test learned it again the slow way, by passing vacuously on zero
 * matched rules until its own `rules.length` assertion caught it.
 *
 * `readFileSync` takes ONE argument here on purpose: `src/testFs.d.ts` declares that much and no
 * more, because the project carries no Node types.
 */
const TSX = import.meta.glob<string>('./AppBoundary.tsx', { query: '?raw', import: 'default', eager: true });
const STYLES = new TextDecoder().decode(readFileSync('src/styles.css'));

const REASONS = ['no-webgl2', 'engine', 'crash'] as const;

describe('the stopped screen', () => {
  afterEach(() => {
    setLanguage('en');
    publishSceneSave(undefined);
  });

  it('says something for EVERY reason the app can stop for - never an empty page', () => {
    for (const reason of REASONS) {
      const html = renderToStaticMarkup(<Stopped reason={reason} />);
      const title = /data-ui="stopped-title">([^<]+)</.exec(html)?.[1] ?? '';
      const sentence = /data-ui="stopped-sentence">([^<]+)</.exec(html)?.[1] ?? '';
      expect(title.trim().length, `${reason} heading`).toBeGreaterThan(0);
      // A sentence, not a word: this is the line that has to explain the situation.
      expect(sentence.trim().split(/\s+/).length, `${reason} sentence`).toBeGreaterThan(4);
      expect(html, reason).toContain('role="alert"');
    }
  });

  /*
   * COMPARING THE WHOLE RENDER IS NOT THIS TEST, and a forgery is how that was found.
   *
   * The first version asserted three DISTINCT renders. Giving `crash` the engine's sentence left the
   * headings different, so the markup was still distinct and the test still passed - it proved the
   * three renders differ, which nobody doubted, and not that the three EXPLANATIONS do. Each part is
   * compared on its own now.
   */
  it('gives each reason its own words, so three situations are not one message', () => {
    const part = (html: string, ui: string) => new RegExp(`data-ui="${ui}">([^<]+)<`).exec(html)?.[1] ?? '';
    const said = REASONS.map((reason) => renderToStaticMarkup(<Stopped reason={reason} />));
    for (const ui of ['stopped-title', 'stopped-sentence']) {
      expect(new Set(said.map((html) => part(html, ui))).size, ui).toBe(REASONS.length);
    }
  });

  it('always offers a way out, and marks it as the one to press when there is nothing to save', () => {
    const html = renderToStaticMarkup(<Stopped reason="crash" />);
    expect(html).toContain('data-ui="stopped-reload"');
    expect(html).not.toContain('data-ui="stopped-save"');
  });

  it('offers the save ONLY when the scene holds something - never a button it cannot honour', () => {
    expect(renderToStaticMarkup(<Stopped reason="crash" />)).not.toContain('data-ui="stopped-save"');
    publishSceneSave(async () => {});
    expect(renderToStaticMarkup(<Stopped reason="crash" />)).toContain('data-ui="stopped-save"');
    publishSceneSave(undefined);
    expect(renderToStaticMarkup(<Stopped reason="crash" />)).not.toContain('data-ui="stopped-save"');
  });

  it('re-translates, because the device that cannot run this app is not always an English one', () => {
    const english = renderToStaticMarkup(<Stopped reason="no-webgl2" />);
    setLanguage('ja');
    const japanese = renderToStaticMarkup(<Stopped reason="no-webgl2" />);
    expect(japanese).not.toBe(english);
    // The product and platform names survive translation; they are not words to render in kana.
    expect(japanese).toContain('mixoDental');
    expect(japanese).toContain('WebGL2');
  });

  it('shows the browser\'s own message as detail, and never translates it', () => {
    setLanguage('ja');
    const html = renderToStaticMarkup(<Stopped reason="crash" detail="Error creating WebGL context." />);
    expect(html).toContain('Error creating WebGL context.');
  });

  it('has no detail line when there is no detail', () => {
    expect(renderToStaticMarkup(<Stopped reason="no-webgl2" />)).not.toContain('data-ui="stopped-detail"');
  });

  it('is legible with no tokens: every colour in its CSS carries a literal fallback', () => {
    // `var(--x)` with no second argument renders NOTHING when the property is missing, which in this
    // app is a silent total failure - and this is the screen that shows when things are already
    // wrong. An unstyled but legible error screen beats a correctly-themed invisible one.
    const css = STYLES;
    const rules = [...css.matchAll(/^\.stopped[\w-]*\s*\{([^}]*)\}/gm)].map((m) => m[1]!);
    expect(rules.length, 'the .stopped rules should be in src/styles.css').toBeGreaterThan(3);
    for (const body of rules) {
      for (const match of body.matchAll(/var\((--[a-z-]+)([^)]*)\)/g)) {
        expect(match[2], `${match[1]} needs a fallback`).toMatch(/^,\s*\S/);
      }
    }
  });

  it('styles by class, with no inline style and no colour literal in the TSX (ui-styling rules 1 and 2)', () => {
    const tsx = TSX['./AppBoundary.tsx']!;
    expect(tsx).not.toMatch(/\bstyle=\{/);
    expect(tsx.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  });
});

describe('the root boundary', () => {
  it('keeps the shell instead of the tree, and carries the error through as detail', () => {
    expect(AppBoundary.getDerivedStateFromError(new Error('Error creating WebGL context.'))).toEqual({ detail: 'Error creating WebGL context.' });
    // A throw is not always an Error - a string or an object must still produce a readable line.
    expect(AppBoundary.getDerivedStateFromError('gpu lost')).toEqual({ detail: 'gpu lost' });
    expect(AppBoundary.getDerivedStateFromError(undefined)).toEqual({ detail: 'undefined' });
  });

  it('renders its children while nothing has thrown', () => {
    expect(renderToStaticMarkup(<AppBoundary><p>the app</p></AppBoundary>)).toBe('<p>the app</p>');
  });
});
