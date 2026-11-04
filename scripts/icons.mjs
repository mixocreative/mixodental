/**
 * Takes an icon from Lucide into this app's icon folder, in the house style.
 *
 *   npm run icons:add -- arrow-left back
 *   npm run icons:add -- trash-2            (keeps Lucide's own name)
 *
 * WHY THIS EXISTS. Every control that wanted a picture used to get one drawn by hand, one icon at a time,
 * which is slow and drifts: a stroke width here, a cap there, and the set stops looking like a set. Lucide
 * is 2313 icons already drawn to this app's house style - `0 0 24 24`, `fill="none"`, `stroke="currentColor"`,
 * round caps and joins - so there is nothing left to invent.
 *
 * It is a DEV dependency and nothing imports it. The chosen icon is copied into `src/ui/assets/icons/` as a
 * file like any other, so the app ships only the icons it uses, `Icon.tsx` loads it the same way, and a
 * designer can still replace that file with their own drawing. Lucide is ISC licensed and the copy keeps its
 * licence line.
 *
 * Two things are changed on the way in, both from the folder's README:
 *   - `width` and `height` come off the root: the size comes from the app's CSS, never the file.
 *   - the stroke is set to the house 1.7 (Lucide draws at 2), so a Lucide icon sits beside the hand-drawn
 *     dental ones without looking heavier than them.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FROM = join(ROOT, 'node_modules', 'lucide-static', 'icons');
const INTO = join(ROOT, 'src', 'ui', 'assets', 'icons');
/** The weight every icon in this app is drawn at (src/ui/assets/icons/README.md). */
const STROKE = '1.7';

const [name, as = name] = process.argv.slice(2);
if (!name) {
  console.error('usage: npm run icons:add -- <lucide-name> [name-in-this-app]\n       e.g. npm run icons:add -- arrow-left back');
  process.exit(2);
}

const source = join(FROM, `${name}.svg`);
if (!existsSync(source)) {
  console.error(`Lucide has no icon called "${name}".\nSearch the set at https://lucide.dev/icons, or list them: ls node_modules/lucide-static/icons`);
  process.exit(1);
}

const house = readFileSync(source, 'utf8')
  // The size comes from the CSS. A width or height here would fight it.
  .replace(/\n\s*(width|height)="[^"]*"/g, '')
  // The class names are Lucide's own; this app scopes and colours icons itself (src/ui/iconSvg.ts).
  .replace(/\n\s*class="[^"]*"/g, '')
  .replace(/stroke-width="[^"]*"/, `stroke-width="${STROKE}"`)
  .replace(/\n{2,}/g, '\n');

const target = join(INTO, `${as}.svg`);
const replacing = existsSync(target);
writeFileSync(target, house, 'utf8');
console.log(`${replacing ? 'replaced' : 'added'} src/ui/assets/icons/${as}.svg  (lucide "${name}", stroke ${STROKE})`);
console.log(replacing ? '' : `Now add a row for it in src/ui/assets/icons/README.md saying where it appears.`);
