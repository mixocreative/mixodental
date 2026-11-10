/**
 * What every icon file IS: the slot it draws in, where it came from, and where the operator meets it.
 *
 * ONE JOB: to be the list, so the style book and the icon folder cannot disagree about it. The folder
 * README carried this as a prose table and it had already rotted - `drop-file`, `next` and `restore`
 * were in the app and not in the table, and nothing said so, because a table in a README is checked by
 * nobody. `src/ui/iconCatalogue.test.ts` fails when a file has no entry or an entry has no file, so the
 * list cannot drift from the folder again.
 *
 * WHAT IS NOT HERE. Whether a file is pixel art is read from the file itself (`shape-rendering=
 * "crispEdges"`), not written down twice; and the drawing rules live in `src/ui/assets/icons/README.md`
 * with their guards in `src/ui/icons.test.ts`. This module says only what each file is FOR.
 */

/**
 * The slot an icon draws in, which is what fixes its size - and so, for pixel art, its whole style.
 * `src/styles.css` holds the sizes as `--pixel-icon-*`; the two rules are in the icon folder's README.
 */
export type IconSlot =
  /**
   * Rule A: a glyph beside a word, at 24px, ONE INK and drawn SMOOTH in the Lucide house style the
   * rest of this set uses - `0 0 24 24`, `fill="none"`, `stroke="currentColor"`, 1.7, round caps.
   *
   * These were pixel art for a while and it was the wrong call: they sat beside a dozen Lucide line
   * icons in the same bars and read as a different set, and at 24px the pixel look costs detail
   * without buying chunkiness. The grid belongs to the key art, which is big enough to show it.
   */
  | 'inline'
  /**
   * Rule B: the COLOURED art on a choice key, at 144px on a 48 grid - three real pixels per cell.
   * The file lives in `src/ui/assets/art/`, not `assets/icons/`, and keeps its own colours.
   */
  | 'key'
  /** Neither rule: a line glyph sized by whatever uses it (a back arrow, a warning sign, a cursor). */
  | 'free';

/** Where the drawing came from, which decides how it is CHANGED. */
export type IconSource =
  /** A drawing. Replace the file. */
  | 'drawn'
  /** Taken from Lucide by `npm run icons:add`. Replace it the same way, or re-run that. */
  | 'lucide'
  /** Written by `scripts/pixel-icons.mjs`. A HAND EDIT IS LOST on the next run: change the generator. */
  | 'generated'
  /**
   * Traced from the owner's reference art by `scripts/trace-art.py`: crop, average down to the grid,
   * clean, quantise. Re-run it to retrace, or replace the file by hand - the FILE is the source.
   */
  | 'traced';

export type IconEntry = {
  /** The file's name without `.svg`, which is also the name `<Icon name=...>` takes. */
  name: string;
  slot: IconSlot;
  source: IconSource;
  /** Where the operator meets it, in the words a designer needs to find the screen. */
  where: string;
  /** Set only on an icon that is drawn and NOT yet used anywhere: the style book marks those. */
  unwired?: true;
};

export const ICON_CATALOGUE: IconEntry[] = [
  /*
   * The item types: the big choices on the start screen, at 144px - and the ONLY entries whose files
   * live in `src/ui/assets/art/`, drawn by `Art` rather than `Icon`, keeping their own colours.
   *
   * They are coloured because six rounds of one-ink drawing proved a dental arch in a single colour is
   * indistinguishable from an archway: the teeth, the keyline and the shading are the whole of what
   * makes an item type readable. The slot says which folder - `key` is art, everything else is icons -
   * so there is no second field to keep in step and no way for the two to disagree.
   */
  { name: 'aligner', slot: 'key', source: 'traced', where: 'Start screen, first big choice: Aligner. A clear segmented shell, seen from above and in front' },
  { name: 'denture', slot: 'key', source: 'traced', where: 'Start screen, middle big choice: Denture. A full arch of teeth on a gum body - the bulky one' },
  /*
   * ANY MODEL takes any STL, dental or not, so it gets a plain block rather than a dental object - and
   * the block is GENERATED where the three dental items are traced. That is the right way round: tracing
   * is for a thing that must be RECOGNISED, where a formula cannot reach the judgement, and a block is
   * abstract - there is no correct block to miss and every edge is a straight line the generator gets
   * exactly right. `scripts/art-block.mjs`.
   */
  { name: 'generic', slot: 'key', source: 'generated', where: 'Start screen, third big choice: Any model. A plain isometric block - not a dental object, because this choice takes any STL' },
  /*
   * Drawn and waiting on code: there is no Dental Model choice on the start screen yet, so nothing uses
   * this. It is the file that was called `generic` until 2026-11-10, when it turned out to be a picture
   * of a study model and to be standing in for a choice that means something else.
   */
  { name: 'dental-model', slot: 'key', source: 'traced', unwired: true, where: 'A study model on a solid base - the only one of the four with a plinth. No screen offers it yet' },

  // The deck rail: the four steps, each a word with its picture. Rule A, and the three pixel ones.
  { name: 'orient', slot: 'inline', source: 'drawn', where: 'Deck rail: Orient. Also the Auto orientation key in the orientation bar - a box with a turn arrow' },
  { name: 'tool-rim', slot: 'inline', source: 'drawn', where: 'Deck rail: Rim. A path with square handles - the trim edge and the points that shape it' },
  { name: 'tool-area', slot: 'inline', source: 'drawn', where: 'Deck rail: Area. A perforated strip - the band where tips may touch, with the tips on its middle line' },
  { name: 'tool-supports', slot: 'inline', source: 'drawn', where: 'Deck rail: Supports. The only side view in the set: a part on pillars above the plate' },

  // Step 2's area tools, and the edit bar's select switch. Lucide line glyphs at 18px.
  { name: 'tool-select', slot: 'free', source: 'lucide', where: 'Step 2 area tools: Select (lucide lasso-select)' },
  { name: 'tool-paint', slot: 'free', source: 'lucide', where: 'Step 2 area tools: Paint (lucide paintbrush)' },
  { name: 'tool-erase', slot: 'free', source: 'lucide', where: 'Step 2 area tools: Erase (lucide eraser)' },
  { name: 'tool-add', slot: 'free', source: 'lucide', where: 'Step 2 area tools: Add (lucide circle-plus)' },
  { name: 'tool-pointer', slot: 'free', source: 'lucide', where: 'Edit bar, How to select: Click - pick one support at a time' },
  { name: 'tool-brush', slot: 'free', source: 'lucide', where: 'Edit bar, How to select: Drag over - paint many supports at once' },

  // The chrome every step shares.
  { name: 'back', slot: 'free', source: 'lucide', where: 'Every step and start screen: the way back, the arrow top-left and on each bar' },
  { name: 'next', slot: 'free', source: 'lucide', where: 'Every step bar: the key that goes on, and Start this item on the Items page' },
  { name: 'restore', slot: 'free', source: 'lucide', where: 'Restore step: the round key that puts a finished step back in hand' },
  { name: 'drop-file', slot: 'free', source: 'lucide', where: 'Start screen and Step 0: the Choose STL file key' },
  { name: 'warning', slot: 'free', source: 'drawn', where: 'Viewport, unresolved-point bubble: a tip, lowest point or island with no support yet' },

  // The one icon that is not a page element: it becomes a canvas cursor.
  { name: 'cursor-rim', slot: 'inline', source: 'drawn', where: 'Rim define mode, the pointer over the model: a crosshair round an open square, because a press there places or grabs a POINT. Built into a cursor by src/components/viewport/style.ts' },
];
