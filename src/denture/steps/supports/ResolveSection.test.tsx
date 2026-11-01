import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UiState } from '@mixo-geocore/editing/commands';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import { ResolveSection } from './ResolveSection';

const ui = { mode: 'dental', dentalStage: 'review', dentalKind: 'denture', dentureResolvable: 1 } as UiState;
const point = (id: string, kind: UnresolvedPoint['kind'], reason = 'x'): UnresolvedPoint => ({ id, kind, stream: '', position: [0, 0, 0], normal: [0, -1, 0], heightMm: 5, reason, bestGapMm: null, neededMm: 1.5 });
const SIDEWAYS = "island's lowest point faces sideways: 82 degrees from straight down (60 allowed), no tip can stand there";

describe('ResolveSection', () => {
  it('counts islands with the resolvable points, apart only when they face sideways, and offers Resolve all', () => {
    const html = renderToStaticMarkup(<ResolveSection mesh={{ unresolved: [point('denture-rim-1', 'tip'), point('island-3', 'island')], modelLanded: [] }} ui={ui} run={() => {}} />);
    expect(html).toContain('data-ui="denture-resolve"');
    expect(html).toContain('2 points have no route from the plate');
    expect(html).not.toContain('by hand');
    expect(html).not.toContain('denture-resolve-islands-sideways');
    const sideways = renderToStaticMarkup(<ResolveSection mesh={{ unresolved: [point('denture-rim-1', 'tip'), point('island-3', 'island', SIDEWAYS)], modelLanded: [] }} ui={ui} run={() => {}} />);
    expect(sideways).toContain('1 point has no route from the plate');
    expect(sideways).toContain('data-ui="denture-resolve-islands-sideways"');
    expect(sideways).toContain('1 island faces sideways');
    expect(html).toContain('data-ui="denture-resolve-all"');
    expect(html).toContain('Resolve all');
    expect(html).not.toContain('disabled');
  });

  it('says when every point is supported, and Resolve all is off', () => {
    const html = renderToStaticMarkup(<ResolveSection mesh={{ unresolved: [], modelLanded: [{ id: 'a', tier: 'allowed', position: [0, 0, 0] }] }} ui={{ ...ui, dentureResolvable: 0 }} run={() => {}} />);
    expect(html).toContain('Every tip and island has a support.');
    expect(html).toContain('1 support stands on the model surface');
    expect(html).toContain('disabled');
  });
});
