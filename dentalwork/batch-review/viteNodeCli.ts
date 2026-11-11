/** The one job: find vite-node's CLI entry, so spawning `batch.ts` survives a vite-node major. */
import { createRequire } from 'node:module';

/*
 * Resolved through the package's own `exports`, never as a literal path. vite-node 1/2 shipped
 * `vite-node.mjs` at the package root; vite-node 6 ships `dist/cli.mjs`. Two tests held the old
 * literal and failed as a regex mismatch on the vitest 5 bump, which hid the real cause.
 */
export const viteNodeCli = createRequire(import.meta.url).resolve('vite-node/cli');
