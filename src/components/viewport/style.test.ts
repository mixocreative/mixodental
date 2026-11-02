import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { canvasCursor } from './style';

/** A document whose tokens are these (the tests run outside a browser, where every token is the neutral grey). */
beforeEach(() => {
  const tokens: Record<string, string> = { '--mark-remove': '#111111', '--mark-zone': '#222222', '--mark-ring': '#333333', '--cursor-outline': '#444444', '--cursor-fill': '#555555' };
  vi.stubGlobal('document', { documentElement: {} });
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (name: string) => tokens[name] ?? '' }));
});
afterEach(() => vi.unstubAllGlobals());

describe('canvasCursor', () => {
  const brush = { radius: 3, mode: 'select' } as const;
  it('shows the mode default, and the brush icon only while a brush is over the object', () => {
    expect(canvasCursor({ kind: 'none' }, false)).toBe('');
    expect(canvasCursor({ kind: 'pick' }, true)).toBe('default');
    expect(canvasCursor({ kind: 'add', remove: false }, true)).toBe('crosshair');
    expect(canvasCursor({ kind: 'drag', brush, base: 'select', flipped: false, sizing: false }, false)).toBe('grab');
    expect(canvasCursor({ kind: 'drag', brush, base: 'select', flipped: false, sizing: false }, true)).toContain('data:image/svg+xml');
    const zones = { kind: 'zones', brush: { radius: 3, kind: 'paint' } } as const;
    expect(canvasCursor(zones, false)).toBe('crosshair');
    expect(canvasCursor(zones, true)).not.toEqual(canvasCursor({ kind: 'drag', brush, base: 'select', flipped: false, sizing: false }, true));
  });
});

describe('canvasCursor in Drag over', () => {
  it('draws Unselect with a cursor of its own, not only another colour', () => {
    const at = (mode: 'select' | 'unselect') => canvasCursor({ kind: 'drag', brush: { radius: 3, mode }, base: mode, flipped: false, sizing: false }, true);
    expect(at('unselect')).not.toEqual(at('select'));
    expect(decodeURIComponent(at('unselect'))).toContain('M23 19h7');
    expect(canvasCursor({ kind: 'drag', brush: { radius: 3, mode: 'unselect' }, base: 'unselect', flipped: false, sizing: false }, false)).toBe('grab');
  });
});

describe('canvasCursor colours', () => {
  it('draws the brush from the tokens', () => {
    const cursor = decodeURIComponent(canvasCursor({ kind: 'zones', brush: { radius: 3, kind: 'paint' } }, true));
    expect(cursor).toContain('fill="#222222"');
    expect(cursor).toContain('stroke="#444444"');
    expect(cursor).toContain('fill="#555555"');
  });
});
