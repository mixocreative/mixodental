/**
 * Makes one icon file safe to render inline beside the others.
 *
 * Every icon is injected into the page complete with its `<style>` block, so each file's stylesheet applies
 * to the WHOLE document. Illustrator names its classes `cls-1`, `cls-2`... or `st0`, `st1`... in every
 * export, and the same name means something different in each file - in one it is the invisible artboard, in
 * another a filled shape. Whichever file loaded last therefore painted the others.
 *
 * Three guarantees, so a designer can export however they like and drop the file in:
 *
 *  1. CLASS NAMES AND IDS ARE THE FILE'S OWN. Whatever the names are, they are prefixed with the icon's name,
 *     so nothing is shared between icons.
 *  2. THE ARTBOARD SQUARE IS NEVER DRAWN. The full-canvas rect an export leaves behind is removed outright,
 *     so no stylesheet can give it a fill or an outline.
 *  3. EVERY COLOUR IS THE SAME COLOUR. Colours written into the file are replaced with `currentColor`, so an
 *     icon always takes the colour of the place it sits in and no icon can be off-palette.
 */

/** A colour literal written into a file: a hex value, or a functional notation in the rgb or hsl family. */
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)/g;
/** The paint attributes a colour can sit in. */
const PAINT = /\b(fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*"([^"]*)"/g;

/** Colours become `currentColor`; `none`, `inherit` and `url(#...)` are left alone. */
const asCurrent = (value: string) => (/^(none|inherit|transparent|currentColor)$/i.test(value.trim()) || value.includes('url(') ? value : value.replace(COLOUR, 'currentColor'));

/**
 * The class names a file brings with it: those on its elements AND those its stylesheet declares. A class
 * declared but unused still leaks into the document, where it can match another icon's elements, so both
 * sources count.
 */
function classesOf(body: string): string[] {
  const names = new Set<string>();
  for (const [, list] of body.matchAll(/class\s*=\s*"([^"]*)"/g)) for (const token of list.trim().split(/\s+/)) if (token) names.add(token);
  for (const [, css] of body.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const [, token] of css.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) names.add(token);
  }
  return [...names];
}

/** Drops the full-canvas rect an export leaves behind: nothing can outline a square that is not there. */
function dropArtboard(body: string, viewBox: string | undefined): string {
  const [, , width, height] = (viewBox ?? '').trim().split(/[\s,]+/);
  if (!width || !height) return body;
  return body.replace(/<rect\b[^>]*\/?>(?:<\/rect>)?/g, (tag) => {
    const value = (attr: string) => new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`).exec(tag)?.[1]?.trim();
    const spans = value('width') === width && value('height') === height;
    const atOrigin = !value('x') || Number(value('x')) === 0;
    const atTop = !value('y') || Number(value('y')) === 0;
    return spans && atOrigin && atTop ? '' : tag;
  });
}

/** One icon's body, made its own: see the three guarantees above. `viewBox` comes from the file's root tag. */
export function scopeIcon(name: string, body: string, viewBox?: string): string {
  const classes = classesOf(body);
  let out = dropArtboard(body, viewBox);

  // Ids first, so a later colour pass can never mistake a `url(#...)` reference for a hex colour.
  out = out.replace(/\bid\s*=\s*"([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`)
    .replace(/\b(href|xlink:href)\s*=\s*"#([^"]+)"/g, `$1="#${name}-$2"`);

  out = out.replace(/class\s*=\s*"([^"]*)"/g, (_, list: string) =>
    `class="${list.trim().split(/\s+/).filter(Boolean).map((token) => `${name}-${token}`).join(' ')}"`);

  out = out.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, css: string) => {
    let scoped = css.replace(COLOUR, 'currentColor');
    for (const token of classes) scoped = scoped.replace(new RegExp(`\\.${token.replace(/[^\w-]/g, '\\$&')}\\b`, 'g'), `.${name}-${token}`);
    return `<style>${scoped}</style>`;
  });

  return out.replace(PAINT, (_, attr: string, value: string) => `${attr}="${asCurrent(value)}"`);
}
