import { afterEach, describe, expect, it, vi } from 'vitest';
import { adjustRemembered, rememberAdjust } from './adjustMemory';

describe('adjustMemory', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts closed and remembers the last state for the session', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => void store.set(key, value) });
    expect(adjustRemembered()).toBe(false);
    rememberAdjust(true);
    expect(adjustRemembered()).toBe(true);
    rememberAdjust(false);
    expect(adjustRemembered()).toBe(false);
  });

  it('stays closed when storage throws', () => {
    const fail = () => { throw new Error('no storage'); };
    vi.stubGlobal('sessionStorage', { getItem: fail, setItem: fail });
    expect(() => rememberAdjust(true)).not.toThrow();
    expect(adjustRemembered()).toBe(false);
  });
});
