import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UiState } from '@mixo-geocore/editing/commands';
import { DentureSupportsBlocks } from './DentureSupportsBlocks';

describe('DentureSupportsBlocks', () => {
  it('stacks the unresolved points over the denture settings', () => {
    const html = renderToStaticMarkup(<DentureSupportsBlocks mesh={undefined} options={undefined} onOptions={() => {}} ui={{ mode: 'dental', dentalStage: 'review', dentalKind: 'denture' } as UiState} run={() => {}} />);
    expect(html.indexOf('data-ui="denture-resolve"')).toBeLessThan(html.indexOf('data-ui="denture-settings"'));
    expect(html).toContain('Building supports');
  });
});
