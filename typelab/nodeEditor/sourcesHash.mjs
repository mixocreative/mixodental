/*
 * ONE JOB: a fingerprint of the node editor's sources, stamped into the built bundle and rechecked by
 * a test, so an editor built from old sources cannot pass quietly - the same rule `vendor-geometry`
 * already enforces for the wasm.
 *
 * Line endings are normalised before hashing: this repo checks files out with CRLF on Windows and LF
 * elsewhere, and a fingerprint that changed with the checkout would fail on every other machine while
 * meaning nothing.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** What the bundle is built from, relative to `typelab/`. */
// RimCanvas.tsx since 2026-11-24: it is bundled too, and was missing here, so a bundle built before a Rim canvas change
// still passed bundle.test.ts.
export const EDITOR_SOURCES = ['nodeEditor/ZoneEditor.tsx', 'nodeEditor/RimCanvas.tsx', 'nodeEditor/main.tsx'];

/** The first 16 hex digits of a SHA-256 over the sources, CRLF folded to LF. */
export function sourcesHash(root) {
  const hash = createHash('sha256');
  for (const file of EDITOR_SOURCES) hash.update(readFileSync(resolve(root, file), 'utf8').replace(/\r\n/g, '\n'));
  return hash.digest('hex').slice(0, 16);
}

/** The banner the build writes and the test looks for. */
export const banner = (root) => `/* node-editor sources ${sourcesHash(root)} - rebuild with npm run review:editor */`;
