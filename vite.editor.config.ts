/*
 * The review page's node editor, built on its own.
 *
 * The folder review (`typelab/viewer.html`) is plain HTML served by `serve.mjs`, not
 * by Vite, so it cannot import TSX or a bare `react`. This builds `nodeEditor/main.tsx` into ONE ES
 * module with React and React Flow bundled and the stylesheet inlined, which the page loads with a
 * dynamic `import()`. Run with `npm run review:editor`.
 *
 * The output is committed beside the page, like the vendored wasm, and
 * `typelab/nodeEditor/bundle.test.ts` fails when the sources have changed since it was
 * built - the same rule `vendor-geometry` enforces, so a stale editor cannot pass quietly.
 */
import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { banner } from './typelab/nodeEditor/sourcesHash.mjs';

const here = resolve(import.meta.dirname, 'typelab');

export default defineConfig({
  define: { 'process.env.NODE_ENV': '"production"' },
  // Without this Vite copies the APP's public/ folder into the bundle directory: the first build
  // committed a stray .nojekyll, a favicon and the hand-written half of the notices file beside the
  // bundle, the last of which would read as complete when it is not.
  publicDir: false,
  esbuild: { jsx: 'automatic' },
  build: {
    target: ['chrome93', 'edge93', 'firefox114', 'safari15.4'],
    // `built/`, not `node-editor/`: one dash from the `nodeEditor/` sources, it read as a copy of them.
    outDir: resolve(here, 'built'),
    emptyOutDir: true,
    lib: { entry: resolve(here, 'nodeEditor/main.tsx'), formats: ['es'], fileName: () => 'node-editor.js' },
    minify: true,
    sourcemap: false,
  },
  plugins: [{
    // The sources' fingerprint, which `bundle.test.ts` recomputes: a stale bundle fails the suite.
    // Stamped in generateBundle, AFTER minification - `rollupOptions.output.banner` was stripped by
    // the minifier, so the first build shipped without one and the test caught it.
    name: 'node-editor-fingerprint',
    generateBundle(_options, bundle) {
      // Minifying strips the licence comments of what is bundled, and MIT and ISC both require the
      // notice to travel with copies. Every package in the production tree is checked permissive by
      // the app's postbuild (`scripts/third-party-notices.mjs` fails on copyleft), and its full texts
      // are written there - this points at them.
      const notice = '/*! Contains third-party code - React, React DOM, @xyflow/react and their dependencies, each MIT or ISC. Full licence texts: THIRD-PARTY-NOTICES.txt, written by npm run build. */';
      for (const chunk of Object.values(bundle)) if (chunk.type === 'chunk') chunk.code = `${banner(here)}\n${notice}\n${chunk.code}`;
    },
  }],
});
