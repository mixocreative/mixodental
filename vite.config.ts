import { configDefaults } from 'vitest/config';
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/** Vendored mixo-geocore packages (vendor/mixo-geocore, written by scripts/vendor-geometry.mjs). */
const VENDOR = resolve(import.meta.dirname, 'vendor/mixo-geocore');

export default defineConfig({
  base: '/mixodental/',
  resolve: {
    alias: {
      '@mixo-geocore/host': resolve(VENDOR, 'host'),
      '@mixo-geocore/editing': resolve(VENDOR, 'editing'),
      '@mixo-geocore/engine': resolve(VENDOR, 'pkg-browser/mixo_geometry_wasm.js'),
    },
  },
  build: {
    /*
     * THE BROWSER FLOOR, SAID OUT LOUD (audit MIXO-03).
     *
     * There was no target and no browserslist, so Vite's default `'modules'` applied - Chrome 87 and
     * Safari 14 - while the source needed considerably more. The README promises tablets and phones,
     * which makes the Safari number the one that matters.
     *
     * What sets each number, and nothing else does:
     *   safari 15.4   `crypto.randomUUID` (3 sites), `Object.hasOwn` (1), `Array.prototype.at` (6).
     *                 esbuild lowers SYNTAX, never these APIs, so no target can rescue an older one.
     *   chrome / edge 93   `Object.hasOwn`, the last of the three to ship.
     *   firefox 114   MODULE WORKERS - `new Worker(url, { type: 'module' })` in
     *                 `src/workers/factories.ts`. Firefox shipped them in 114, long after Chrome 80
     *                 and Safari 15, and it is the floor nobody would guess. The audit missed it too.
     *
     * `src/browserFloor.test.ts` keeps this list and package.json's `browserslist` in step, and
     * refuses an API newer than the floor.
     */
    target: ['chrome93', 'edge93', 'firefox114', 'safari15.4'],
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
  test: {
    environment: 'node',
    setupFiles: ['scripts/test-support/tolerateRpcAckTimeout.ts', 'scripts/test-support/useNodeEngine.ts', 'src/dental/editingMode.ts'],
    // Heavy aligner fixtures and first WASM engine load exceed the 5 s default under load.
    testTimeout: 60000,
    // Worker threads drop onTaskUpdate RPCs under heavy WASM load; forks do not.
    // A >60 s CPU-bound test makes vitest's fixed RPC ack time out; see the setup file.
    pool: 'forks',
    // Agent worktrees live under .claude/worktrees; their copies are not this checkout's tests.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
