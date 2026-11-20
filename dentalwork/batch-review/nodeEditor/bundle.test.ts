import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { banner } from './sourcesHash.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const bundle = fileURLToPath(new URL('../node-editor/node-editor.js', import.meta.url));

describe('the committed node-editor bundle is built from the current sources', () => {
  // The bundle is committed beside the review page, because that page is plain HTML served without a
  // build step. That makes a stale bundle easy: edit ZoneEditor.tsx, forget `npm run review:editor`,
  // and the page silently keeps running the old editor. This is the check that makes that loud.
  it('exists', () => {
    expect(existsSync(bundle), 'node-editor/node-editor.js is missing - run npm run review:editor').toBe(true);
  });

  it('carries the fingerprint of the sources as they are now', () => {
    const head = readFileSync(bundle, 'utf8').slice(0, 200);
    expect(head, 'the node editor was built from older sources - run npm run review:editor and commit the bundle').toContain(banner(root));
  });
});
