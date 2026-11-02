/*
 * A CSS colour token (src/styles.css `:root`) as a colour for the 3D view, so the scene takes its colours from the
 * same tokens as the DOM. This is the ONE place the app reads a colour token for three.js.
 *
 * Live recolour: `subscribeTokens` / `tokenRevision` (used by `useTokenRevision`, src/ui/useTokenRevision.ts) tell the
 * scene to read its tokens again. The revision goes up when the root element's `style`, `class`, `data-theme` or
 * `lang` change, when a `<style>` / `<link>` in `<head>` is added, removed or rewritten (Vite hot update), and when
 * `refreshTokenColours()` is called. An edit of a rule in the browser's devtools changes neither, so there call
 * `mixoRefreshTokens()` in the console (or have the theme switch call `refreshTokenColours()`).
 * Outside a browser every colour is the neutral grey.
 */

export const NEUTRAL_COLOUR = 0x808080;

/** A `#rrggbb` (or `#rgb`) value as a number; the neutral grey when it is not one. */
export function parseHexColour(value: string): number {
  const text = value.trim().replace(/^#/, '');
  const full = text.length === 3 ? [...text].map((digit) => digit + digit).join('') : text;
  return /^[0-9a-f]{6}$/i.test(full) ? Number.parseInt(full, 16) : NEUTRAL_COLOUR;
}

/** A colour number as `#rrggbb` (for CSS strings such as an SVG cursor, and for three.js colour props). */
export function hexString(colour: number): string {
  return `#${colour.toString(16).padStart(6, '0')}`;
}

/** The computed value of the token `name` (e.g. `--tip-path`) as a number. */
export function tokenColour(name: string): number {
  if (typeof document === 'undefined') return NEUTRAL_COLOUR;
  return parseHexColour(getComputedStyle(document.documentElement).getPropertyValue(name));
}

/** The computed value of the token `name` as `#rrggbb`. */
export function tokenCss(name: string): string {
  return hexString(tokenColour(name));
}

let revision = 0;
const listeners = new Set<() => void>();
let observing = false;

/** The number of times the tokens may have changed; a new number means "read your colours again". */
export function tokenRevision(): number {
  return revision;
}

/** Tell every listener that the tokens changed (a theme switch calls this; the observer calls it for DOM changes). */
export function refreshTokenColours(): void {
  revision += 1;
  for (const listener of [...listeners]) listener();
}

function observeDocument(): void {
  if (observing || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  observing = true;
  const root = document.documentElement;
  new MutationObserver(refreshTokenColours).observe(root, { attributes: true, attributeFilter: ['style', 'class', 'data-theme', 'lang'] });
  new MutationObserver((records) => {
    if (records.some((record) => [...record.addedNodes, ...record.removedNodes].some(isStyleNode) || isStyleNode(record.target.parentNode))) refreshTokenColours();
  }).observe(document.head, { childList: true, subtree: true, characterData: true });
  (window as unknown as { mixoRefreshTokens?: () => void }).mixoRefreshTokens = refreshTokenColours;
}

function isStyleNode(node: Node | null): boolean {
  return node !== null && (node.nodeName === 'STYLE' || node.nodeName === 'LINK');
}

/** Call `listener` whenever the tokens may have changed. Returns the unsubscribe function. */
export function subscribeTokens(listener: () => void): () => void {
  observeDocument();
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
