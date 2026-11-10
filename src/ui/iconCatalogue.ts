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
  /** Rule A: beside a word, at 24px - one CSS pixel per fake pixel, so flat and front-on. */
  | 'inline'
  /** Rule B: the art on a choice key, at 72px - nine real pixels per fake one, so isometric reads. */
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
  | 'generated';

export type IconEntry = {
  /** The file's name without `.svg`, which is also the name `<Icon name=...>` takes. */
  name: string;
  slot: IconSlot;
  source: IconSource;
  /** Where the operator meets it, in the words a designer needs to find the screen. */
  where: string;
  /** Set only on an icon that is drawn and NOT yet used anywhere: the style book marks those. */
  unwired?: true;
  /**
   * The file is PIXEL ART on the 24 x 24 grid, and so is held to the grid by `src/ui/icons.test.ts`.
   *
   * Membership is declared HERE rather than read from the file. It used to be read from the file's
   * `shape-rendering="crispEdges"` attribute, which is a marker a vector tool drops on export - so a
   * designer who opened one of these in Illustrator and saved it would have quietly taken the file OUT
   * of the guarded set, which is the one moment the guard exists for.
   */
  pixel?: true;
};

export const ICON_CATALOGUE: IconEntry[] = [
  // The item types: the big choices on the start screen, at 72px - Rule B, and the only isometric drawings
  // in the app. In one colour all three are nearly the same horseshoe, so each `where` names the one
  // feature that tells it from its neighbours, and that feature is what a redrawing must keep.
  { name: 'aligner', slot: 'key', source: 'generated', pixel: true, where: 'Start screen, first big choice: Aligner. THIN - a narrow band with a tall wall and nothing inside' },
  { name: 'denture', slot: 'key', source: 'generated', pixel: true, where: 'Start screen, middle big choice: Denture. BULK - a gum body nearly twice as deep as the aligner band, with a tooth row standing on it' },
  { name: 'generic', slot: 'key', source: 'generated', pixel: true, where: 'Start screen, third big choice: Any model. THE PLINTH - the only one of the three standing on a slab' },

  // The deck rail: the four steps, each a word with its picture. Rule A, and the three pixel ones.
  { name: 'orient', slot: 'inline', source: 'drawn', where: 'Deck rail: Orient. Also the Auto orientation key in the orientation bar - a box with a turn arrow' },
  { name: 'tool-rim', slot: 'inline', source: 'generated', pixel: true, where: 'Deck rail: Rim. A path with square handles - the trim edge and the points that shape it' },
  { name: 'tool-area', slot: 'inline', source: 'generated', pixel: true, where: 'Deck rail: Area. A perforated strip - the band where tips may touch, with the tips on its middle line' },
  { name: 'tool-supports', slot: 'inline', source: 'generated', pixel: true, where: 'Deck rail: Supports. The only side view in the set: a part on pillars above the plate' },

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
  { name: 'cursor-rim', slot: 'inline', source: 'generated', pixel: true, where: 'Rim define mode, the pointer over the model: a crosshair round an open square, because a press there places or grabs a POINT. Built into a cursor by src/components/viewport/style.ts' },
];
