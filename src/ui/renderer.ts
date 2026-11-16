/*
 * Which renderer draws the 3D view. There are two while the app moves from three.js to Babylon
 * (owner's decision, 2026-11-16: one renderer across the Mixo line, so a human maintains one 3D
 * vocabulary instead of two). It is chosen by `?renderer=babylon` in the address, so the same scene
 * can be opened twice, side by side, and judged by eye before anything is deleted.
 *
 * Deliberately NOT remembered between visits, unlike the theme: a half-migrated renderer that
 * sticks is a bug report about the wrong renderer. Every reload starts on the one that is finished.
 */

export const RENDERERS = ['three', 'babylon'] as const;
export type Renderer = (typeof RENDERERS)[number];

/** three.js until the Babylon drawing layers are complete; it is the renderer the walk proves. */
export const DEFAULT_RENDERER: Renderer = 'three';

const isRenderer = (value: string | null): value is Renderer =>
  value !== null && (RENDERERS as readonly string[]).includes(value);

/** The renderer named by a query string (`?renderer=babylon`), or null when it names none we know. */
export function rendererFromSearch(search: string): Renderer | null {
  const value = new URLSearchParams(search).get('renderer');
  return isRenderer(value) ? value : null;
}

/** The renderer to draw with: the address first, then the default. */
export function readRenderer(search = typeof location === 'undefined' ? '' : location.search): Renderer {
  return rendererFromSearch(search) ?? DEFAULT_RENDERER;
}
