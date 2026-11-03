import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, DEFAULT_THEME, readTheme, themeFromSearch, THEMES } from './theme';

/*
 * src/ui/theme.ts: which theme the app wears. The tests run in node, so a document and a localStorage are stood up
 * for the two that touch the page; everything else is pure.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

/** A root element and a store, enough for applyTheme / readTheme. `removeAttribute` clears the dataset key, as a real element does. */
function stubPage(stored?: string) {
  const root = {
    dataset: {} as Record<string, string | undefined>,
    removeAttribute: (name: string) => { if (name === 'data-theme') delete root.dataset.theme; },
  };
  const store = new Map<string, string>(stored === undefined ? [] : [['mixodental.theme', stored]]);
  vi.stubGlobal('document', { documentElement: root });
  vi.stubGlobal('localStorage', { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => void store.set(key, value) });
  return { root, store };
}

describe('themeFromSearch', () => {
  it('reads a theme the app has', () => {
    expect(themeFromSearch('?theme=paper')).toBe('paper');
    expect(themeFromSearch('?step=1&theme=instrument&state=done')).toBe('instrument');
  });

  it('is null for no theme and for a name the app does not have', () => {
    expect(themeFromSearch('')).toBe(null);
    expect(themeFromSearch('?step=1')).toBe(null);
    expect(themeFromSearch('?theme=neon')).toBe(null);
  });
});

describe('readTheme', () => {
  it('prefers the address over the remembered choice', () => {
    stubPage('instrument');
    expect(readTheme('?theme=paper')).toBe('paper');
  });

  it('falls back to the remembered choice, then to the default', () => {
    stubPage('paper');
    expect(readTheme('')).toBe('paper');
    stubPage();
    expect(readTheme('')).toBe(DEFAULT_THEME);
  });

  it('starts on the default when the browser refuses storage', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    expect(readTheme('')).toBe(DEFAULT_THEME);
  });
});

describe('applyTheme', () => {
  it("sets the attribute for the app's theme and remembers it", () => {
    const { root, store } = stubPage();
    applyTheme('instrument');
    expect(root.dataset.theme).toBe('instrument');
    expect(store.get('mixodental.theme')).toBe('instrument');
  });

  it('removes the attribute for the paper set underneath', () => {
    const { root, store } = stubPage('instrument');
    root.dataset.theme = 'instrument';
    applyTheme('paper');
    expect(root.dataset.theme).toBe(undefined);
    expect(store.get('mixodental.theme')).toBe('paper');
  });

  it('switches even when the choice cannot be remembered', () => {
    const { root } = stubPage();
    vi.stubGlobal('document', { documentElement: root });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => { throw new Error('blocked'); } });
    expect(() => applyTheme('instrument')).not.toThrow();
    expect(root.dataset.theme).toBe('instrument');
  });
});

describe('THEMES', () => {
  it("names the app's theme first, so the catalogue switch opens on it", () => {
    expect(THEMES[0]).toBe(DEFAULT_THEME);
    expect([...THEMES]).toEqual(['instrument', 'paper']);
  });
});
