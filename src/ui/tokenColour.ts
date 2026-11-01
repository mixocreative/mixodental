/*
 * A CSS colour token (src/styles.css `:root`) as a number for three.js materials, so the 3D view takes its colours
 * from the same tokens as the DOM. Read from the document when asked; outside a browser the neutral grey.
 */

export const NEUTRAL_COLOUR = 0x808080;

/** A `#rrggbb` (or `#rgb`) value as a number; the neutral grey when it is not one. */
export function parseHexColour(value: string): number {
  const text = value.trim().replace(/^#/, '');
  const full = text.length === 3 ? [...text].map((digit) => digit + digit).join('') : text;
  return /^[0-9a-f]{6}$/i.test(full) ? Number.parseInt(full, 16) : NEUTRAL_COLOUR;
}

/** The computed value of the token `name` (e.g. `--tip-path`) as a number. */
export function tokenColour(name: string): number {
  if (typeof document === 'undefined') return NEUTRAL_COLOUR;
  return parseHexColour(getComputedStyle(document.documentElement).getPropertyValue(name));
}
