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
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
  test: {
    environment: 'node',
    setupFiles: ['scripts/test-support/useNodeEngine.ts', 'src/dental/editingMode.ts'],
    // Heavy aligner fixtures and first WASM engine load exceed the 5 s default under load.
    testTimeout: 60000,
    // Worker threads drop onTaskUpdate RPCs under heavy WASM load; forks do not.
    pool: 'forks',
    // Agent worktrees live under .claude/worktrees; their copies are not this checkout's tests.
    exclude: [...configDefaults.exclude, '.claude/**'],
  },
});
