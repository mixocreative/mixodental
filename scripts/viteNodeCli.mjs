/**
 * The one job: find vite-node's CLI entry, so anything that spawns a `.ts` script survives a
 * vite-node major.
 *
 * WHY THIS IS A MODULE AND NOT TWO LINES (2026-11-12, MIXO-15). vite-node 1/2 shipped
 * `vite-node.mjs` at the package root; vite-node 6 ships `dist/cli.mjs`. THREE places held the old
 * literal: two batch-review tests and `scripts/real-scan-gate.mjs`. The first pass fixed the two
 * tests, declared the bump clean, and `gate:real` then failed on all 13 real scans at once - the
 * third site. One module, so there is nothing left to miss.
 *
 * Plain `.mjs` on purpose: `scripts/real-scan-gate.mjs` runs under bare node and cannot import a
 * `.ts`, while the TS tests can import this (tsconfig has `allowJs` with Bundler resolution).
 */
import { createRequire } from 'node:module';

/** Resolved through the package's own `exports` map, never as a literal path. */
export const viteNodeCli = createRequire(import.meta.url).resolve('vite-node/cli');
