/**
 * Long CPU-bound tests (knotIslands, goldens, safetyParity) block the worker's event loop for more than
 * vitest's fixed 60 s RPC timeout (not configurable in vitest 3.2). The `onTaskUpdate` message has been
 * delivered by then; only its acknowledgement is late, and the timer fires first, which vitest reports as
 * an unhandled error and exit code 1. Swallow exactly that acknowledgement timeout; every test result,
 * every other RPC and every other error is untouched.
 */
type Rpc = Record<string | symbol, unknown>;
const state = (globalThis as { __vitest_worker__?: { rpc: Rpc } }).__vitest_worker__;
if (state) {
  const real = state.rpc;
  state.rpc = new Proxy(real, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (prop !== 'onTaskUpdate' || typeof value !== 'function') return value;
      return async (...args: unknown[]) => {
        try {
          return await (value as (...a: unknown[]) => unknown)(...args);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('[vitest-worker]: Timeout calling "onTaskUpdate"')) return;
          throw e;
        }
      };
    },
  });
}
