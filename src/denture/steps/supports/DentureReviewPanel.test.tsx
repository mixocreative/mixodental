import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UiState } from '@mixo-geocore/editing/commands';
import type { EditGesture } from '@mixo-geocore/editing/gesture';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import type { DentalReview, ReviewProblem } from '../../../components/DentalReviewBlocks';
import type { DentureMesh } from '../../engine/dentureCore';
import { DentureReviewPanel } from './DentureReviewPanel';

const ui = { mode: 'dental', dentalStage: 'review', dentalKind: 'denture', dentalReviewReady: true, dentureResolvable: 0, selection: 0, customisedActive: 0, addAction: 'add', tool: 'add', method: 'click', dragAction: 'select', canUndo: false, active: true, supported: true } as unknown as UiState;
const review = {
  settings: defaultSupportSettings, onSetting: () => {},
  structure: { treeEnabled: false, bracesEnabled: true }, onStructure: () => {}, clickReach: { value: 1, onChange: () => {} },
  verdictPending: false, buildLanded: true, rimGap: undefined, structureFallback: undefined, problems: [], outOfDate: false, rechecking: () => false, unitName: () => 'sample',
  onShow: () => {}, onFix: () => {}, onShowRim: () => {}, finishedCount: 0, backAsk: undefined, onBackConfirm: () => {}, onBackCancel: () => {},
} satisfies DentalReview;
const point = (id: string): UnresolvedPoint => ({ id, kind: 'tip', stream: '', position: [0, 0, 0], normal: [0, -1, 0], heightMm: 5, reason: 'x', bestGapMm: null, neededMm: 1.5 });
const mesh = (unresolved: UnresolvedPoint[] = []) => ({ unresolved, modelLanded: [] }) as unknown as DentureMesh;
const render = (over: Partial<DentalReview> = {}, built: DentureMesh | undefined = mesh(), stepUi: UiState = ui, ready = true) => renderToStaticMarkup(
  <DentureReviewPanel gesture={{ kind: 'add' } as EditGesture} ui={stepUi} review={{ ...review, ...over }} ready={ready} send={() => {}} run={() => {}}
    restore={{ can: false, run: () => {} }} denture={{ mesh: built, options: undefined, onOptions: () => {} }} />);

describe('DentureReviewPanel', () => {
  it('shows one line, Details, a closed Adjust, Restore step, Add another denture and Back | OK', () => {
    const html = render();
    expect(html).toContain('data-ui="denture-supports-panel"');
    expect(html).toContain('Supports ready. Every point is held.');
    expect(html).toContain('data-ui="denture-review-details-toggle"');
    expect(html).toContain('data-ui="denture-adjust-title"');
    expect(html).toMatch(/data-ui="denture-adjust-title" aria-expanded="false"/);
    for (const hidden of ['Tip size', 'Support thickness', 'Supports may touch the denture', 'Add supports', 'ID label', 'Check for unsupported spots', 'Unresolved points']) expect(html).not.toContain(hidden);
    for (const name of ['restore-step-2', 'denture-add-another', 'denture-review-back', 'denture-review-ok']) expect(html).toContain(`data-ui="${name}"`);
    expect(html.indexOf('denture-review-back')).toBeLessThan(html.indexOf('denture-review-ok'));
    expect(html).not.toContain('denture-resolve-all');
  });

  it('offers Fix when points need a support, and never counts spots accepted by the denture rules', () => {
    const fix = render({}, mesh([point('a'), point('b')]), { ...ui, dentureResolvable: 2 } as UiState);
    expect(fix).toContain('2 spots need a support.');
    expect(fix).toContain('data-ui="denture-resolve-all"');
    expect(fix).toContain('>Fix<');
    const accepted = { kind: 'overhang', unitId: 'u', inZone: false, position: [0, 0, 0], area: 1, rule: 'rim' } as unknown as ReviewProblem;
    expect(render({ problems: [accepted] })).toContain('Supports ready. Every point is held.');
    const real = { kind: 'island', unitId: 'u', inZone: false, position: [0, 0, 0], area: 1 } as unknown as ReviewProblem;
    expect(render({ problems: [accepted, real] })).toContain('1 thing to look at.');
  });

  it('says it is building, with OK off, and asks before Back throws hand work away', () => {
    // The FIRST build, with no verdict behind it: that, and only that, is what "Building supports" is for.
    const building = render({ buildLanded: false }, undefined, { ...ui, dentalReviewReady: false } as UiState, false);
    expect(building).toContain('Building supports');
    expect(building).not.toContain('denture-review-details-toggle');
    expect(building).toMatch(/<button[^>]*disabled[^>]*>OK</);
    const ask = render({ backAsk: { added: 2, removed: 1, customised: 0 } });
    expect(ask).toContain('Discard and go back');
    expect(ask).not.toContain('denture-review-ok');
  });

  /*
   * x9b, this step's half of it. A setting change drops the build, and the verdict already read must then be
   * DIMMED rather than replaced by "Building supports". Details still waits for a real build here: the
   * denture's evidence is read off the mesh, which the change drops, so the fold would open empty.
   */
  it('dims the verdict it has rather than replacing it, while a setting change is on its way', () => {
    const restale = render({ verdictPending: true }, undefined, { ...ui, dentalReviewReady: false } as UiState, false);
    expect(restale).not.toContain('Building supports');
    expect(restale).toContain('Supports ready. Every point is held.');
    expect(restale).toContain('is-stale');
    expect(restale).toContain('aria-busy="true"');
    expect(restale).not.toContain('denture-review-details-toggle');
    // A build that FAILED is not a verdict on its way: keeping the old sentence would read as sound supports.
    const failed = render({ verdictPending: true }, undefined, { ...ui, dentalReviewReady: false, dentalBuildFailed: true } as UiState, false);
    expect(failed).toContain('The supports could not be built.');
    expect(failed).not.toContain('Supports ready. Every point is held.');
  });
});
