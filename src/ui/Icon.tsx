/**
 * An icon drawn as a separate SVG file in `src/ui/assets/icons/<name>.svg`. Replace the file to
 * replace the icon; no code changes. The file's root `<svg>` is rendered inline, so `currentColor`
 * follows the CSS `color` of the place the icon sits in. Size comes from CSS (width/height/font-size).
 */
import type { CSSProperties } from 'react';

const FILES = import.meta.glob('./assets/icons/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

type Parsed = { props: Record<string, string>; body: string };

/** React prop name for an SVG attribute: `stroke-width` becomes `strokeWidth`; aria-* and data-* stay as they are. */
const propName = (attr: string) => (attr.startsWith('aria-') || attr.startsWith('data-') ? attr : attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));

/** Attributes the Icon sets itself, or that would fix the size: the CSS decides the size. */
const OWN_ATTRS = new Set(['xmlns', 'width', 'height', 'version', 'class', 'role', 'aria-hidden', 'focusable']);

function parse(text: string): Parsed {
  const root = /<svg\b([^>]*)>([\s\S]*)<\/svg>/i.exec(text.replace(/<!--[\s\S]*?-->/g, ''));
  if (!root) throw new Error('icon file has no <svg> root');
  const props: Record<string, string> = {};
  for (const [, attr, value] of root[1]!.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
    if (attr!.startsWith('xmlns') || OWN_ATTRS.has(attr!)) continue;
    props[propName(attr!)] = value!;
  }
  return { props, body: root[2]! };
}

const ICONS = new Map<string, Parsed>(
  Object.entries(FILES).map(([path, text]) => [path.replace(/^.*\//, '').replace(/\.svg$/, ''), parse(text)]),
);

/** Renders the named icon, or nothing (with a dev warning) when no file has that name. */
export function Icon({ name, className, style }: { name: string; className?: string; style?: CSSProperties }) {
  const icon = ICONS.get(name);
  if (!icon) {
    if (import.meta.env.DEV) console.warn(`Icon "${name}" has no file in src/ui/assets/icons/`);
    return null;
  }
  return <svg {...icon.props} className={className} style={style} aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: icon.body }} />;
}
