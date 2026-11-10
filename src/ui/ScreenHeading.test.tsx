import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScreenHeading } from './ScreenHeading';

/** Every source file under src/, as text, keyed `src/...` (the same reading as noColourLiterals.test.ts). */
const FILES = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../**/*.tsx', { query: '?raw', import: 'default', eager: true })).map(([path, text]) => [path.startsWith('./') ? path.replace(/^\.\//, 'src/ui/') : path.replace(/^\.\.\//, 'src/'), text]),
);

/**
 * Where an `h2` may still be written by hand: the component itself, which is the one place the tag belongs,
 * and the two that do not name a screen - the terms dialog's own headings (`.title`, the serif style) and the
 * catalogue's section headings.
 */
const ALLOWED = ['src/ui/ScreenHeading.tsx', 'src/components/TermsDialog.tsx', 'src/kit/Section.tsx'];

describe('ScreenHeading', () => {
  it('is one h2 with one class, whatever the screen', () => {
    expect(renderToStaticMarkup(<ScreenHeading>Choose the aligner type</ScreenHeading>))
      .toBe('<h2 class="screen-heading">Choose the aligner type</h2>');
  });

  // A bare `h2` collects whatever the cascade hands it, which is how the app came to have a heading that was
  // 12px bold from the header rule and serif from the title rule at the same time. One component, one answer.
  it('is the only way a screen names itself', () => {
    const offenders = Object.entries(FILES)
      .filter(([path]) => !ALLOWED.includes(path) && !path.endsWith('ScreenHeading.test.tsx'))
      .filter(([, text]) => /<h2[\s>]/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
