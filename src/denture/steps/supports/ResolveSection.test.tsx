import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UiState } from '@mixo-geocore/editing/commands';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import { ResolveSection } from './ResolveSection';

const ui = { mode: 'dental', dentalStage: 'review', dentalKind: 'denture', dentureResolvable: 1 } as UiState;
const point = (id: string, kind: UnresolvedPoint['kind']): UnresolvedPoint => ({ id, kind, stream: '', position: [0, 0, 0], normal: [0, -1, 0], heightMm: 5, reason: 'x', bestGapMm: null, neededMm: 1.5 });

describe('ResolveSection', () => {
  it('counts the resolvable points and the islands, and offers Resolve all', () => {
    const html = renderToStaticMarkup(<ResolveSection mesh={{ unresolved: [point('denture-rim-1', 'tip'), point('island-3', 'island')], modelLanded: [] }} ui={ui} run={() => {}} />);
    expect(html).toContain('data-ui="denture-resolve"');
    expect(html).toContain('1 point has no route from the plate');
    expect(html).toContain('1 island has no support');
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
