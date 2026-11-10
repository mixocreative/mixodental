import { Icon } from '../ui/Icon';
import { Art } from '../ui/Art';
import { ICON_CATALOGUE, type IconEntry, type IconSlot } from '../ui/iconCatalogue';
import { Section } from './Section';

/**
 * Every icon the app has, as the designer's working sheet: the drawing, where it appears, and THE PATH OF
 * THE FILE TO EDIT.
 *
 * ONE JOB, and it is the loop rather than the picture. `src/ui/Icon.tsx` reads the icon folder, so
 * replacing a file changes the app with no code change - but only if the designer knows which file. Before
 * this sheet, finding that out meant reading a prose table in the folder's README that had already gone
 * three icons out of date. Here the path is DERIVED from the catalogue's name, so it cannot be wrong, and
 * `src/ui/iconCatalogue.test.ts` fails if the catalogue and the folder disagree.
 *
 * WHY EACH ICON IS SHOWN TWICE, resting and pressed. Every icon is one colour - `scopeIcon` rewrites the
 * colours out of the file - and takes the colour of whatever it sits on, so on a pressed key it inverts to
 * paper on ink. A drawing that only reads one way round is the single most common way an icon here fails,
 * and it cannot be seen at all from the file.
 *
 * WHY THE PIXEL ONES ARE ALSO SHOWN BIG. They are drawn on a 24 x 24 grid and must be displayed at a whole
 * multiple of it. x3 is the honest way to inspect the drawing: still crisp, and the fake pixels visible.
 */

/** The heading and the rule for each group. The ONE place the two rules are stated for a human. */
const RULES: Record<IconSlot, { title: string; rule: string }> = {
  inline: {
    title: 'Rule A - inline glyphs, 24px (1x the grid)',
    rule: 'One CSS pixel per fake pixel, beside a word at text size. FLAT AND FRONT-ON: at 1x a third dimension has nowhere to go and an isometric shape loses its own edges. These must be told apart from each other at a glance, which matters more than any one being a good picture.',
  },
  key: {
    title: 'Rule B - key art, COLOURED, 144px (3x a 48 grid)',
    rule: 'A picture of an object, on a choice key. These keep their own COLOURS - a dental arch in one ink is indistinguishable from an archway, which six rounds of trying proved, so the teeth, the keyline and the shading are the whole of what makes it readable. A 48 grid rather than 24, because fourteen tooth cells need about 50 cells of arch perimeter and 24 gives 27. Files live in src/ui/assets/art/.',
  },
  free: {
    title: 'Line glyphs - sized by whatever they sit in',
    rule: 'Not pixel art and not on the grid: Lucide line icons and two hand drawings, at 14-20px wherever the app puts them. Replace one with another Lucide icon (npm run icons:add) and it will match; draw one by hand and it will not.',
  },
};

const SOURCE_NOTE: Record<IconEntry['source'], string> = {
  drawn: 'a drawing - replace the file',
  lucide: 'from Lucide - npm run icons:add, or replace the file',
  generated: 'scaffolded by scripts/pixel-icons.mjs - the FILE is the source now, edit it',
  traced: 'traced from the reference by scripts/trace-art.py - re-run it, or replace the file',
};

/** The class the app sizes this icon with, which is also what the sheet must use to be true. */
const SLOT_CLASS: Record<IconSlot, string> = { inline: 'icon-sheet-inline', key: 'icon-sheet-key', free: 'icon-sheet-free' };

/**
 * The `key` slot is the coloured set and everything else is the one-ink set, so the slot alone decides
 * which component draws it AND which folder the path names. Deriving both from one field is the point:
 * a card that drew with `Icon` while printing an `art/` path would send a designer to edit a file the
 * app never reads.
 */
const isArt = (entry: IconEntry) => entry.slot === 'key';
const folderOf = (entry: IconEntry) => (isArt(entry) ? 'art' : 'icons');

function Shown({ entry, className }: { entry: IconEntry; className: string }) {
  return isArt(entry) ? <Art name={entry.name} className={className} /> : <Icon name={entry.name} className={className} />;
}

function Card({ entry }: { entry: IconEntry }) {
  // The one-ink set is shown big as well, to judge the drawing. The coloured art is already 144px and
  // carries its own keyline, so a blow-up adds nothing but a wide card.
  const big = entry.pixel === true && !isArt(entry);
  return <div className="kit-card icon-sheet-card" data-ui={`kit-icon-${entry.name}`}>
    <div className="icon-sheet-shows">
      {/* Resting, then pressed: the same file, inverted, because that is how the app uses it. */}
      <span className="icon-sheet-show"><Shown entry={entry} className={SLOT_CLASS[entry.slot]} /></span>
      <span className="icon-sheet-show is-pressed"><Shown entry={entry} className={SLOT_CLASS[entry.slot]} /></span>
      {big ? <span className="icon-sheet-show icon-sheet-show--big"><Shown entry={entry} className="icon-sheet-big" /></span> : null}
    </div>
    <p className="icon-sheet-name">
      {entry.name}
      {entry.unwired ? <em className="icon-sheet-flag"> drawn, not wired up yet</em> : null}
    </p>
    <p className="kit-caption">{entry.where}</p>
    <p className="icon-sheet-file">src/ui/assets/{folderOf(entry)}/{entry.name}.svg</p>
    <p className="kit-caption">{SOURCE_NOTE[entry.source]}</p>
  </div>;
}

const SLOTS: IconSlot[] = ['key', 'inline', 'free'];

export function IconSheet() {
  return <>{SLOTS.map((slot) => {
    const entries = ICON_CATALOGUE.filter((entry) => entry.slot === slot);
    return <Section key={slot} title={RULES[slot].title} ui={`kit-icons-${slot}`} note={RULES[slot].rule}>
      {entries.map((entry) => <Card key={entry.name} entry={entry} />)}
    </Section>;
  })}</>;
}
