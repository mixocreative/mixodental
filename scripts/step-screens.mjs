// Renders every dental step's panel to a standalone HTML file, from FAKE DATA.
//
// `npx vite-node scripts/step-screens.mjs` writes one file per step x state into .stitch/screens/
// (git-ignored). Each file carries the real components and the real stylesheets inlined, so it looks exactly
// like the app, and it needs no model, no engine, no dev server and - the point - **no patient scan**. A
// clinic's scan never leaves the machine, so these are the screens that are safe to capture, to upload to
// Stitch and to hand to a designer.
//
// Run it through vite-node, not node: it resolves the `@mixo-geocore/...` aliases and compiles the .tsx the
// same way the app does.
//
// This is the first slice of the screens gallery (P7e): the states a designer cannot otherwise reach without
// a real case and several minutes of building.
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { SupportSettingsBlock, EditSupportsBlock, ProblemsBlock, IdLabelBlock } from '../src/components/DentalReviewBlocks';
import { Panel } from '../src/components/Panel';
import { ReviewSummary } from '../src/components/ReviewSummary';
import { ResolveSection } from '../src/denture/steps/supports/ResolveSection';
import { DentureSettingsSection } from '../src/denture/settings/DentureSettingsSection';
import { DEFAULT_DENTURE_OPTIONS } from '../src/denture/settings/dentureOptions';
import { PartsList } from '../src/denture/parts/PartsList';
import { DentalBar } from '../src/components/DentalBar';
import { ToolRail } from '../src/deck/ToolRail';
import { IconSheet } from '../src/kit/IconSheet';
import { DEFAULT_PROFILE_ID, profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { DentalRimStep } from '../src/dental/rim/DentalRimStep';
import { rimBadgeText } from '../src/dental/rim/rimStepText';
// Registers the dental command rows, which the rim step resolves its keys and their reasons from.
import '../src/dental/editingMode';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.stitch', 'screens');
const h = React.createElement;
const noop = () => {};

const ui = {
  mode: 'dental', dentalStage: 'review', dentalKind: 'aligner', dentalReviewReady: true, dentureResolvable: 0,
  selection: 0, customisedActive: 0, addAction: 'add', tool: 'add', method: 'click', dragAction: 'select',
  canUndo: false, active: true, supported: true,
};
const review = (over = {}) => ({
  settings: defaultSupportSettings, onSetting: noop,
  structure: { treeEnabled: true, bracesEnabled: true }, onStructure: noop,
  clickReach: { value: 1, onChange: noop },
  verdictPending: false, rimGap: undefined, structureFallback: undefined, problems: [], outOfDate: false,
  rechecking: () => false, unitName: () => 'sample', onShow: noop, onFix: noop, onShowRim: noop,
  finishedCount: 0, backAsk: undefined, onBackConfirm: noop, onBackCancel: noop, ...over,
});
const point = (id) => ({ id, kind: 'tip', stream: '', position: [0, 0, 0], normal: [0, -1, 0], heightMm: 5, reason: 'x', bestGapMm: null, neededMm: 1.5 });
const parts = { parts: [
  { id: 'a', role: 'target', volumeMm3: 1240, tips: 96 },
  { id: 'b', role: 'addOn', volumeMm3: 8.2, tips: 4 },
  { id: 'c', role: 'debris', volumeMm3: 0.4, tips: 0 },
] };
const problem = (kind, unitId) => ({ kind, unitId, inZone: false, position: [0, 0, 0], area: 1 });

/** Every screen this script writes: a stable name, the words under it, and what it renders. */
const SCREENS = [
  ['aligner-step3-settled', 'Aligner Step 3 - supports built, nothing to look at', () => [
    h(ReviewSummary, { key: 'v', kind: 'aligner', tone: 'ready', line: 'Supports ready. Every point is held.', open: false, onToggle: noop }),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'aligner-adjust', collapsible: true, defaultOpen: false }, h('p', null, 'hidden')),
  ]],
  ['aligner-step3-problems', 'Aligner Step 3 - three things to look at, Details open', () => [
    h(ReviewSummary, { key: 'v', kind: 'aligner', tone: 'look', line: '3 things to look at.', open: true, onToggle: noop },
      h(ProblemsBlock, { key: 'p', review: review({ problems: [problem('island', 'u1'), problem('overhang', 'u1'), problem('island', 'u2')] }), ui, send: noop, run: noop, kind: 'aligner', stale: false })),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'aligner-adjust', collapsible: true, defaultOpen: false }, h('p', null, 'hidden')),
  ]],
  ['aligner-step3-adjust-open', 'Aligner Step 3 - Adjust open, the settings behind it', () => [
    h(ReviewSummary, { key: 'v', kind: 'aligner', tone: 'ready', line: 'Supports ready. Every point is held.', open: false, onToggle: noop }),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'aligner-adjust', collapsible: true, defaultOpen: true },
      h(SupportSettingsBlock, { key: 's', review: review(), kind: 'aligner', onAdjust: noop }),
      h(EditSupportsBlock, { key: 'e', gesture: { kind: 'add' }, ui, review: review(), send: noop, run: noop, kind: 'aligner' }),
      h(IdLabelBlock, { key: 'i', review: review(), kind: 'aligner' })),
  ]],
  ['aligner-step3-select', 'Aligner Step 3 - Adjust open resting on Select, the state a step opens in', () => [
    h(ReviewSummary, { key: 'v', kind: 'aligner', tone: 'ready', line: 'Supports ready. Every point is held.', open: false, onToggle: noop }),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'aligner-adjust', collapsible: true, defaultOpen: true },
      h(EditSupportsBlock, { key: 'e', gesture: { kind: 'pick' }, ui: { ...ui, tool: 'select' }, review: review(), send: noop, run: noop, kind: 'aligner' })),
  ]],
  ['aligner-step3-building', 'Aligner Step 3 - still building, so there is nothing to open yet', () => [
    h(ReviewSummary, { key: 'v', kind: 'aligner', tone: 'building', line: 'Building supports…' }),
  ]],
  ['denture-step2-quiet', 'Denture Step 2 - the quiet state, everything folded', () => [
    h(ReviewSummary, { key: 'v', kind: 'denture', tone: 'ready', line: 'Supports ready. Every point is held.', open: false, onToggle: noop }),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'denture-adjust', collapsible: true, defaultOpen: false }, h('p', null, 'hidden')),
  ]],
  ['denture-step2-adjust-open', 'Denture Step 2 - Adjust open', () => [
    h(ReviewSummary, { key: 'v', kind: 'denture', tone: 'ready', line: 'Supports ready. Every point is held.', open: false, onToggle: noop }),
    h(Panel, { key: 'a', title: 'Adjust', ui: 'denture-adjust', collapsible: true, defaultOpen: true },
      h(SupportSettingsBlock, { key: 's', review: review(), kind: 'denture', onAdjust: noop }),
      h(DentureSettingsSection, { key: 'd', options: DEFAULT_DENTURE_OPTIONS, onChange: noop })),
  ]],
  ['denture-step2-unresolved', 'Denture Step 2 - points with no route from the plate, Details open', () => [
    h(ReviewSummary, { key: 'v', kind: 'denture', tone: 'fix', line: '2 spots need a support.', open: true, onToggle: noop },
      h(ResolveSection, { key: 'r', mesh: { unresolved: [point('a'), point('b')], modelLanded: ['x'] } }),
      h(PartsList, { key: 'p', parts, kind: 'denture' })),
  ]],
];

/** The ui the rim step reads: one drawing, at one moment. */
const rimUi = (over = {}) => ({
  // No tool here: `rimToolText(ui.dentalRimTool)` and this field went with Place and Adjust (`5ba0041`).
  mode: 'dental', dentalStage: 'rim', dentalKind: 'aligner', dentalRimAnchors: 0,
  selection: 0, customisedActive: 0, addAction: 'add', tool: 'add', method: 'click', dragAction: 'select',
  canUndo: false, active: true, supported: true, ...over,
});

/**
 * Rim define mode, badge and all: Step 1's detour, where the operator draws the rim detection could not
 * find. `whole: true` - these build their own dock.
 */
const RIM_SCREENS = [
  ['aligner-step1-rim-empty', 'Rim define mode - just opened, nothing placed yet', rimUi()],
  ['aligner-step1-rim-open', 'Rim define mode - seven points down, the loop still open', rimUi({ dentalRimAnchors: 7 })],
  // Was "Adjust in hand", a state that no longer exists. What varies now is whether a point is PICKED,
  // because that is the only thing that turns Delete point on.
  ['aligner-step1-rim-picked', 'Rim define mode - a point picked, so Delete point is on', rimUi({ dentalRimAnchors: 12, dentalRimClosed: true, dentalRimSelected: 4 })],
  ['aligner-step1-rim-crossing', 'Rim define mode - the loop is closed but crosses itself', rimUi({ dentalRimAnchors: 9, dentalRimClosed: true, dentalRimProblem: 'SELF_INTERSECTING' })],
  ['aligner-step1-rim-ready', 'Rim define mode - a sound rim, Done on', rimUi({ dentalRimAnchors: 14, dentalRimClosed: true })],
].map(([name, caption, ui]) => [name, caption, () => ({
  chrome: [
    h('div', { key: 'f', className: 'edit-frame', 'aria-hidden': 'true' }),
    h('div', { key: 'b', className: 'edit-badge', role: 'status' },
      'Step 1 \u00b7 Define the rim', h('span', { key: 's' }, 'upper-7'), h('b', { key: 'w' }, rimBadgeText(ui.dentalRimClosed === true))),
  ],
  /*
   * The mode as the DOOR leaves it: the "why you are here" line, and anything orientation found on the
   * way in. The empty state is exactly what the operator meets, so it carries the holes notice too.
   */
  dock: h(DentalRimStep, { key: 'p', ui, run: noop, notices: ui.dentalRimAnchors ? [] : [{ kind: 'holes' }] }),
}), true]);

/** The ui Step 2 reads. `tool` alone says what is in hand: a step rests on Select, never on nothing. */
const areaUi = (over = {}) => ({
  mode: 'dental', dentalStage: 'area', dentalKind: 'aligner', tool: 'select',
  dentalRadius: 2, selection: 0, customisedActive: 0, addAction: 'add', method: 'click', selectStyle: 'click',
  brushMode: 'select', dragAction: 'select', canUndo: false, active: true, supported: true, ...over,
});

/**
 * STEP 2, THE SUPPORT AREA STEP, and the four tools it offers. The dock is the real `DentalBar`, so what
 * each tool puts on screen - the brush size, Add's Click reach, Select's style switch and its selection
 * actions - is decided by the component, not by this file. `whole: true`: it builds its own frame, badge
 * and bar.
 */
const AREA_SCREENS = [
  ['aligner-step2-select', 'Aligner Step 2 - resting on Select, the state the step opens in',
    areaUi({ tool: 'select' }), { brush: undefined, edit: { kind: 'pick' } }],
  ['aligner-step2-paint', 'Aligner Step 2 - Paint in hand, with its brush size and its way out',
    areaUi({ tool: 'paint' }), { brush: { radius: 2, kind: 'allow' }, edit: undefined }],
  ['aligner-step2-add', 'Aligner Step 2 - Add in hand: the add loop, with Click reach',
    areaUi({ tool: 'add' }), { brush: undefined, edit: { kind: 'add', remove: false } }],
  ['aligner-step2-picked', 'Aligner Step 2 - Select in hand with three tips picked',
    areaUi({ tool: 'select', selection: 3 }), { brush: undefined, edit: { kind: 'pick' } }],
  /*
   * A PAINTED AREA, which is precisely a state nobody can reach without the right case. It needs an
   * aligner whose area detection found nothing, or a rim drawn by hand - and then the three strip
   * sliders have no strip to size, so they are shown-and-disabled with the reason beside them
   * (`useDentalTuning.tunable`). It is the state those controls spend most of their life in on a
   * difficult case, and until this screen existed a designer had never seen it.
   */
  ['aligner-step2-painted-area', 'Aligner Step 2 - a PAINTED area: the strip sliders are shown-and-disabled, with the reason',
    areaUi({ tool: 'paint' }), { brush: { radius: 2, kind: 'allow' }, edit: undefined }, { tuningFixed: true }],
].map(([name, caption, ui, gesture, extra]) => [name, caption, () => ({
  chrome: [],
  dock: h(DentalBar, {
    key: 'p', ui, unitName: 'upper-7', send: noop, run: noop,
    gesture: { kind: 'dental-area', notices: [], ...gesture },
    tipCount: 72, previewStatus: 'ready',
    tuning: { stripWidthMm: 3, positionMm: 0.25, density: 1 },
    /*
     * `profileData`, NOT `profileById`. They are different functions on different types: `profileById`
     * returns an `AlignerProfile`, which has no `defaults`, so `?.defaults` was quietly `undefined` -
     * and `DentalBar` renders the Support area panel only when it has both a tuning AND its limits.
     * So the three strip sliders, among the most important controls in this step, had NEVER appeared
     * in a single designer screen, and nothing said so: an optional chain yielding undefined met a
     * render guard that skips in silence. `useDentalTuning` uses `profileData` for exactly this value.
     */
    tuningLimits: profileData(DEFAULT_PROFILE_ID).defaults,
    clickReach: { value: 1, onChange: noop },
    // Per-screen overrides, so a state that differs only in a dock prop needs no second builder.
    ...(extra ?? {}),
  }),
}), true]);

SCREENS.push(...AREA_SCREENS);

/*
 * THE DECK'S TOOL RAIL, in the four states it can be in at once. It is the one surface a designer
 * cannot otherwise reach without importing a model and getting it into each state in turn, and it is
 * where the rail's own rule lives: greyed, busy and stale must never resemble each other.
 */
SCREENS.push(['deck-tool-rail', 'The deck tool rail - ready, busy, stale and unavailable together', () => ({
  chrome: [],
  dock: h('div', { key: 'p', style: { padding: '18px' } },
    h(ToolRail, { key: 'a', facts: { tools: ['orient', 'rim', 'area', 'supports'], oriented: true, hasRim: true, areaAccepted: false, stale: ['rim'], runningTool: 'area' }, onPick: noop })),
}), true]);

SCREENS.push(...RIM_SCREENS);

// The app's own order (src/main.tsx): layout.css is what makes the dental docks a grid, badge included.
const css = ['src/fonts.css', 'src/styles.css', 'src/styles/layout.css', 'src/styles/theme.css']
  .map((file) => readFileSync(join(ROOT, file), 'utf8')).join('\n')
  // The faces live in node_modules; a standalone file cannot reach them, and the system stack behind them
  // is what a reader without the bundle sees anyway.
  .split('url(../node_modules').join('url(about:blank#');

// Start clean: a screen dropped from the list above must not linger and be uploaded as if current.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const [name, caption, build, whole = false] of SCREENS) {
  // The step as the app lays it out: the header strip, the viewport taking the width, and the step panel
  // DOCKED RIGHT. `.dental-side` already says where it goes (absolute, top 56, right 14, bottom 14, 300px
  // wide), so nothing here overrides it - the shell below just gives it the app's own frame to sit in.
  const built = build();
  const label = h('span', { key: 'l', style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: 'var(--muted)', fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase' } }, '3D viewport');
  const body = renderToStaticMarkup(
    h('div', { className: 'workspace workspace--dental', style: { position: 'relative', width: '100%', height: '100%' } },
      // The mode's frame and badge belong to the viewport grid, which is where the app puts them.
      // The grid the badge is placed by needs the viewport to have a height; in the app the shell gives it one.
      h('div', { className: 'viewport', style: { position: 'relative', height: '100%' } }, label,
        ...(whole ? [...built.chrome, built.dock] : [h('aside', { key: 'd', className: 'dental-side' }, h('div', { className: 'dental-scroll' }, built))]))));
  writeFileSync(join(OUT, `${name}.html`), `<!doctype html><html lang="en" data-theme="instrument"><head><meta charset="utf-8">
<title>${caption}</title><style>${css}
  html, body { height: 100%; margin: 0; }
  body { display: flex; flex-direction: column; background: var(--paper); }
  .screen-head { flex: none; height: 56px; display: flex; align-items: center; padding: 0 24px; gap: 10px; background: var(--paper); border-bottom: 1px solid var(--line-strong); }
  .screen-head b { font-family: var(--font-title); font-weight: 400; font-size: 17px; letter-spacing: -.01em; color: var(--brand); }
  .screen-head span { font-size: var(--label-size); letter-spacing: var(--label-track); text-transform: uppercase; color: var(--muted); }
  .screen-body { flex: 1 1 auto; min-height: 0; position: relative; }
</style></head>
<body>
  <div class="screen-head"><b>mixoDental</b><span>${caption}</span></div>
  <div class="screen-body">${body}</div>
</body></html>`);
  console.log(`.stitch/screens/${name}.html  ${caption}`);
}

/*
 * THE INDEX, AND THE ICON SHEET: the two pages that turn 19 loose files into a style book.
 *
 * The owner's ask was "the designer edits there, and it shows where the source is". The honest version of
 * that, and the only one that survives a rebuild, is: THE BOOK NAMES THE FILE, AND THE DESIGNER EDITS THE
 * FILE. `.stitch/screens/` is build output and is deleted on every run, so nothing a designer wrote here
 * could ever have lived. What the book owes them instead is the path - and the path has to be TRUE, which
 * is why every one below is checked with existsSync and the build fails rather than printing a lie.
 *
 * The loops differ per kind, and the index says so rather than promising one:
 *   icons   replace src/ui/assets/icons/<name>.svg - no developer, no code change.
 *   tokens  edit the custom property in src/styles.css or src/styles/theme.css.
 *   layout  CSS yes, structure no: that is TSX and the data-ui contract.
 */
const GROUPS = [
  ['The deck', 'deck-', ['src/deck/ToolRail.tsx', 'src/deck/toolState.ts']],
  ['Aligner Step 1 - the rim', 'aligner-step1-', ['src/dental/rim/DentalRimStep.tsx', 'src/dental/rim/rimStepText.ts']],
  ['Aligner Step 2 - the support area', 'aligner-step2-', ['src/components/DentalBar.tsx']],
  ['Aligner Step 3 - supports', 'aligner-step3-', ['src/components/DentalReviewBlocks.tsx', 'src/components/ReviewSummary.tsx']],
  ['Denture Step 2', 'denture-step2-', ['src/denture/steps/supports/ResolveSection.tsx', 'src/denture/parts/PartsList.tsx']],
];
for (const [, , files] of GROUPS) for (const file of files) {
  // A renamed component must break the build, not quietly leave the book pointing at nothing. CI runs
  // `npm run screens`, so this needs no test of its own.
  if (!existsSync(join(ROOT, file))) throw new Error(`step-screens: the index names ${file}, which does not exist`);
}
/*
 * AND EVERY SCREEN MUST LAND IN A GROUP. The index lists screens by matching a name prefix, so a screen
 * whose name matches none of them is written to disk and never linked from anything - present, correct,
 * and invisible, which is the exact failure this book exists to prevent. Adding a screen is the moment
 * it would happen, and the author would have no reason to look at the index.
 */
const ungrouped = SCREENS.map(([name]) => name).filter((name) => !GROUPS.some(([, prefix]) => name.startsWith(prefix)));
if (ungrouped.length > 0) {
  throw new Error(`step-screens: no group matches ${ungrouped.join(', ')} - add a prefix to GROUPS, or the index will not link them`);
}

const page = (title, head, body, extraCss = '') => `<!doctype html><html lang="en" data-theme="instrument"><head><meta charset="utf-8">
<title>${title}</title><style>${css}
  html, body { height: 100%; margin: 0; }
  body { background: var(--paper); color: var(--ink); }
${extraCss}</style></head>
<body>${head}${body}</body></html>`;

const BOOK_CSS = `
  .book { max-width: 1100px; margin: 0 auto; padding: 24px 24px 64px; }
  .book h1 { font-size: 20px; font-weight: 500; margin: 0 0 4px; }
  .book > p { font-size: 12.5px; line-height: 1.7; color: var(--muted); max-width: 76ch; }
  .book h2 { font-size: 13px; font-weight: 700; letter-spacing: .06em; margin: 28px 0 6px; }
  .book .src { font-family: var(--font-mono, monospace); font-size: 11px; color: var(--muted); user-select: all; }
  .book ul { margin: 8px 0 0; padding-left: 18px; }
  .book li { font-size: 12.5px; line-height: 1.9; }
  .book a { color: var(--ink); }
`;

writeFileSync(join(OUT, 'index.html'), page('mixoDental style book', '', `<div class="book">
  <h1>mixoDental style book</h1>
  <p><b>Edit the file this page names, not this page.</b> Everything here is built by <code>npm run screens</code>
  and deleted on the next run, so it is a mirror of the code and never a place work can live. What it owes you
  is the path.</p>
  <p>Icons are the one thing on this page you can change with no developer at all: replace the SVG and the app
  draws the new drawing. Colours, sizes and spacing are CSS custom properties - edit the value and it follows
  everywhere. Layout and wording are TSX, so those are a request to a developer; the screens below exist so the
  request can be exact.</p>
  <h2>Icons</h2>
  <ul><li><a href="icons.html">Every icon, both sets, with the path of each file</a> &mdash; <span class="src">src/ui/assets/icons/ (one ink)&nbsp;&nbsp;src/ui/assets/art/ (coloured)</span></li></ul>
  <h2>Colours, sizes, type</h2>
  <ul>
    <li>Every custom property, with what it is for &mdash; <span class="src">docs/ui-styling.md</span></li>
    <li>The app's theme &mdash; <span class="src">src/styles/theme.css</span>; the set underneath &mdash; <span class="src">src/styles.css</span></li>
    <li>Live, with a theme switch and a language switch &mdash; <span class="src">npm run dev</span>, then <span class="src">/mixodental/kit.html</span></li>
  </ul>
${GROUPS.map(([title, prefix, files]) => {
    const rows = SCREENS.filter(([name]) => name.startsWith(prefix));
    return `  <h2>${title}</h2>
  <p class="src">${files.join('  ')}</p>
  <ul>${rows.map(([name, caption]) => `<li><a href="${name}.html">${caption}</a></li>`).join('\n      ')}</ul>`;
  }).join('\n')}
</div>`, BOOK_CSS));
console.log('.stitch/screens/index.html  the style book front page');

writeFileSync(join(OUT, 'icons.html'), page('mixoDental icons', '', `<div class="kit-page">
  <header class="kit-head"><h1>Icons</h1><p>Replace the file a card names and the app draws the new icon - no code change.
  TWO SETS: the item art keeps its own colours, and the glyphs are one ink that takes the colour of what it
  sits on - which is why only those are shown resting AND pressed.</p></header>
  ${renderToStaticMarkup(h(IconSheet))}
</div>`, readFileSync(join(ROOT, 'src/kit/kit.css'), 'utf8')));
console.log('.stitch/screens/icons.html  every icon, with its file path');

console.log(`${SCREENS.length} screens written, from fake data: no model, no patient scan`);
