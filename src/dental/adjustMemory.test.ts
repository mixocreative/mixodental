import { afterEach, describe, expect, it, vi } from 'vitest';
import { adjustRemembered, rememberAdjust } from './adjustMemory';

describe('adjustMemory', () => {
  afterEach(() => vi.unstubAllGlobals());

  const store = () => {
    const map = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) });
    return map;
  };

  it('starts closed and remembers the last state for the session', () => {
    store();
    expect(adjustRemembered('denture')).toBe(false);
    rememberAdjust('denture', true);
    expect(adjustRemembered('denture')).toBe(true);
    rememberAdjust('denture', false);
    expect(adjustRemembered('denture')).toBe(false);
  });

  it('remembers each step on its own: the aligner does not follow the denture', () => {
    const map = store();
    rememberAdjust('denture', true);
    expect(adjustRemembered('denture')).toBe(true);
    expect(adjustRemembered('aligner')).toBe(false);
    rememberAdjust('aligner', true);
    expect([...map.keys()].sort()).toEqual(['mixodental.aligner.adjustOpen', 'mixodental.denture.adjustOpen']);
  });

  it('stays closed when storage throws', () => {
    const fail = () => { throw new Error('no storage'); };
    vi.stubGlobal('sessionStorage', { getItem: fail, setItem: fail });
    expect(() => rememberAdjust('denture', true)).not.toThrow();
    expect(adjustRemembered('denture')).toBe(false);
  });
});
