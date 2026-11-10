/**
 * Coloured pixel art, drawn from a file in `src/ui/assets/art/<name>.svg`. Replace the file to replace
 * the picture; no code change. Size comes from CSS.
 *
 * THE TWIN OF `Icon`, AND THE ONE DIFFERENCE IS COLOUR. `Icon` rewrites every fill and stroke to
 * `currentColor`, which is exactly right for a glyph standing beside a word: it inverts with its key and
 * can never be off-palette. An item type is a PICTURE OF A THING, and six rounds of one-ink drawing
 * proved that a dental arch in a single colour is indistinguishable from an archway - the teeth, the
 * keyline and the shading are the whole of what makes it readable. So this path keeps the file's own
 * colours and shares everything else, `scopeNames` included, because two files that both call a class
 * `cls-1` will still paint each other.
 *
 * It is a separate FOLDER rather than a flag on `Icon`, so the rule is visible in the file tree: anything
 * in `assets/icons/` is one ink, anything in `assets/art/` is not. See `assets/art/README.md`.
 */

import { scopeNames } from './iconSvg';

const FILES = import.meta.glob('./assets/art/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const propName = (attr: string) => (attr.startsWith('aria-') || attr.startsWith('data-') ? attr : attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));
/** Attributes `Art` sets itself, or that would fix the size: the CSS decides the size. */
const OWN_ATTRS = new Set(['xmlns', 'width', 'height', 'version', 'class', 'role', 'aria-hidden', 'focusable']);

const ART = new Map<string, { props: Record<string, string>; body: string }>(
  Object.entries(FILES).map(([path, text]) => {
    const name = path.replace(/^.*\//, '').replace(/\.svg$/, '');
    const root = /<svg\b([^>]*)>([\s\S]*)<\/svg>/i.exec(text.replace(/<!--[\s\S]*?-->/g, ''));
    if (!root) throw new Error(`art file ${name} has no <svg> root`);
    const props: Record<string, string> = {};
    for (const [, attr, value] of root[1]!.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
      if (attr!.startsWith('xmlns') || OWN_ATTRS.has(attr!)) continue;
      props[propName(attr!)] = value!;
    }
    return [name, { props, body: scopeNames(name, root[2]!, props.viewBox) }];
  }),
);

/** Renders the named artwork, or nothing (with a dev warning) when no file has that name. */
export function Art({ name, className }: { name: string; className?: string }) {
  const art = ART.get(name);
  if (!art) {
    if (import.meta.env.DEV) console.warn(`Art "${name}" has no file in src/ui/assets/art/`);
    return null;
  }
  return <svg {...art.props} className={className} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: art.body }} />;
}
