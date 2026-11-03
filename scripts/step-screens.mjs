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
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { SupportSettingsBlock, EditSupportsBlock, ProblemsBlock, IdLabelBlock } from '../src/components/DentalReviewBlocks';
import { Panel } from '../src/components/Panel';
import { ResolveSection } from '../src/denture/steps/supports/ResolveSection';
import { DentureSettingsSection } from '../src/denture/settings/DentureSettingsSection';
import { DEFAULT_DENTURE_OPTIONS } from '../src/denture/settings/dentureOptions';
import { PartsList } from '../src/denture/parts/PartsList';

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
    h(SupportSettingsBlock, { key: 's', review: review(), kind: 'aligner', onAdjust: noop }),
    h(EditSupportsBlock, { key: 'e', gesture: { kind: 'add' }, ui, review: review(), send: noop, run: noop, kind: 'aligner' }),
    h(ProblemsBlock, { key: 'p', review: review(), ui, send: noop, run: noop, kind: 'aligner', stale: false }),
    h(IdLabelBlock, { key: 'i', review: review(), kind: 'aligner' }),
  ]],
  ['aligner-step3-problems', 'Aligner Step 3 - three problems found', () => [
    h(ProblemsBlock, { key: 'p', review: review({ problems: [problem('island', 'u1'), problem('overhang', 'u1'), problem('island', 'u2')] }), ui, send: noop, run: noop, kind: 'aligner', stale: false }),
    h(SupportSettingsBlock, { key: 's', review: review(), kind: 'aligner', onAdjust: noop }),
  ]],
  ['aligner-step3-rechecking', 'Aligner Step 3 - a verdict is on its way, so the block dims', () => [
    h(ProblemsBlock, { key: 'p', review: review({ problems: [problem('island', 'u1')], outOfDate: true }), ui, send: noop, run: noop, kind: 'aligner', stale: true }),
  ]],
  ['denture-step2-adjust-open', 'Denture Step 2 - Adjust open', () => [
    h(Panel, { key: 'a', title: 'Adjust', ui: 'denture-adjust', collapsible: true, defaultOpen: true },
      h(SupportSettingsBlock, { key: 's', review: review(), kind: 'denture', onAdjust: noop }),
      h(DentureSettingsSection, { key: 'd', options: DEFAULT_DENTURE_OPTIONS, onChange: noop })),
  ]],
  ['denture-step2-quiet', 'Denture Step 2 - the quiet state, everything folded', () => [
    h(Panel, { key: 'a', title: 'Details', ui: 'denture-details', collapsible: true, defaultOpen: false }, h('p', null, 'hidden')),
    h(Panel, { key: 'b', title: 'Adjust', ui: 'denture-adjust', collapsible: true, defaultOpen: false }, h('p', null, 'hidden')),
  ]],
  ['denture-step2-unresolved', 'Denture Step 2 - points with no route from the plate', () => [
    h(ResolveSection, { key: 'r', mesh: { unresolved: [point('a'), point('b')], modelLanded: ['x'] } }),
  ]],
  ['denture-step2-parts', 'Denture Step 2 - the parts list of a multi-part file', () => [
    h(PartsList, { key: 'p', parts, kind: 'denture' }),
  ]],
];

const css = ['src/fonts.css', 'src/styles.css', 'src/styles/theme.css']
  .map((file) => readFileSync(join(ROOT, file), 'utf8')).join('\n')
  // The faces live in node_modules; a standalone file cannot reach them, and the system stack behind them
  // is what a reader without the bundle sees anyway.
  .split('url(../node_modules').join('url(about:blank#');

mkdirSync(OUT, { recursive: true });
for (const [name, caption, build] of SCREENS) {
  // The step as the app lays it out: the header strip, the viewport taking the width, and the step panel
  // DOCKED RIGHT. `.dental-side` already says where it goes (absolute, top 56, right 14, bottom 14, 300px
  // wide), so nothing here overrides it - the shell below just gives it the app's own frame to sit in.
  const body = renderToStaticMarkup(
    h('div', { className: 'workspace workspace--dental', style: { position: 'relative', width: '100%', height: '100%' } },
      h('div', { className: 'viewport' },
        h('span', { style: { position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', color: 'var(--muted)', fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase' } }, '3D viewport')),
      h('aside', { className: 'dental-side' }, h('div', { className: 'dental-scroll' }, build()))));
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
console.log(`${SCREENS.length} screens written, from fake data: no model, no patient scan`);
