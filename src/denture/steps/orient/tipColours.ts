import type { TipColours } from './liveTipLayers';

/*
 * The live tip colours come from the CSS tokens (src/styles.css `--tip-path`, `--tip-fallback`, `--tip-none`), so a
 * designer changes them in one place. Read once per call from the document; outside a browser every state reads
 * the neutral fallback.
 */

const NEUTRAL = 0x808080;

/** A `#rrggbb` (or `#rgb`) token value as a number; the neutral grey when it is not one. */
export function parseHexColour(value: string): number {
  const text = value.trim().replace(/^#/, '');
  const full = text.length === 3 ? [...text].map((digit) => digit + digit).join('') : text;
  return /^[0-9a-f]{6}$/i.test(full) ? Number.parseInt(full, 16) : NEUTRAL;
}

/** The three path-state colours from the document's tokens. */
export function tipColours(): TipColours {
  if (typeof document === 'undefined') return { path: NEUTRAL, fallback: NEUTRAL, none: NEUTRAL };
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => parseHexColour(style.getPropertyValue(name));
  return { path: read('--tip-path'), fallback: read('--tip-fallback'), none: read('--tip-none') };
}
