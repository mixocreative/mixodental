import { describe, expect, it } from 'vitest';
import { explainReason } from './reasons';

describe('explainReason', () => {
  it('gives plain words for every reason the detector and the build emit', () => {
    for (const code of ['non-manifold-or-degenerate-mesh', 'outer-ridge-not-closed', 'outer-ridge-sharp-all-round', 'central-opening-absent',
      'opening-loop-branched', 'projected-holes-uncertain', 'surface-region-not-isolated', 'orientation-no-cavity', 'contact-footprint-invalid-tuning',
      'diagnostic-band-x', 'dental-pose-inconclusive', 'empty-or-invalid-mesh', 'no-proposed-dental-tips', 'islands: non-manifold edge']) {
      expect(explainReason(code), code).not.toBe(code);
    }
  });

  it('maps the two codes the owner meets most to their sentences', () => {
    expect(explainReason('non-manifold-or-degenerate-mesh')).toMatch(/^The mesh is not a closed surface/);
    expect(explainReason('outer-ridge-sharp-all-round')).toMatch(/sharp all the way round/);
  });

  it('matches by prefix, so a code with a suffix gets its sentence', () => {
    expect(explainReason('opening-loop-branched')).toBe(explainReason('opening-'));
    expect(explainReason('islands: non-manifold edge')).toBe(explainReason('islands:'));
  });

  it('passes an unknown code or error message through verbatim', () => {
    expect(explainReason('the STL file is truncated or damaged')).toBe('the STL file is truncated or damaged');
    expect(explainReason('')).toBe('');
  });
});
