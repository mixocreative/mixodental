import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';

/*
 * THE REVIEW PAGE'S SCRIPT PARSES. viewer.html carries its logic in one inline <script type="module">,
 * which no type checker or bundler reads, so a syntax error there showed only as a blank page in the
 * browser: on 2026-11-20 a second `const picked` in the same function stopped the whole page, and
 * nothing in `npm test` could have said so. esbuild (Vite's own parser) reads it here instead.
 */
describe('the folder review page script', () => {
  const page = readFileSync(new URL('./viewer.html', import.meta.url), 'utf8');
  const scripts = [...page.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(([, code]) => code);

  it('is found, so this test is reading something', () => {
    expect(scripts.length).toBeGreaterThan(0);
    expect(scripts.join('').length).toBeGreaterThan(10_000);
  });

  it('parses as an ES module - a duplicate declaration or a stray bracket fails here, not in the browser', () => {
    for (const code of scripts) expect(() => transformSync(code, { loader: 'js', format: 'esm' })).not.toThrow();
  });
});
