import { describe, expect, it } from 'vitest';
import { DEFAULT_RENDERER, readRenderer, rendererFromSearch } from './renderer';

describe('renderer choice', () => {
  it('reads a renderer the app knows from the address', () => {
    expect(rendererFromSearch('?renderer=babylon')).toBe('babylon');
    expect(rendererFromSearch('?renderer=three')).toBe('three');
    expect(rendererFromSearch('?theme=paper&renderer=babylon')).toBe('babylon');
  });

  it('ignores a renderer it does not know, rather than drawing nothing', () => {
    expect(rendererFromSearch('?renderer=webgpu')).toBeNull();
    expect(rendererFromSearch('?renderer=')).toBeNull();
    expect(rendererFromSearch('')).toBeNull();
    expect(readRenderer('?renderer=webgpu')).toBe(DEFAULT_RENDERER);
  });

  it('starts on the finished renderer when the address says nothing', () => {
    expect(readRenderer('')).toBe('three');
    // The whole point of the default: a reload during the migration must not keep the half-built
    // renderer, or a defect gets reported against the one nobody shipped.
    expect(DEFAULT_RENDERER).toBe('three');
  });
});
