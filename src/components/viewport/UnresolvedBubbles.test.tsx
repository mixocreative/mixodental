import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import { UnresolvedBubble } from './UnresolvedBubbles';

const point: UnresolvedPoint = { id: 'denture-rim-4', kind: 'tip', stream: 'rim', position: [0, 3, 0], normal: [0, -1, 0], heightMm: 3, reason: 'x', bestGapMm: 1.2, neededMm: 1.5 };

describe('UnresolvedBubble', () => {
  it('is a plain mark without a resolve action', () => {
    const html = renderToStaticMarkup(<UnresolvedBubble point={point} />);
    expect(html).toContain('role="img"');
    expect(html).not.toContain('data-resolvable');
    expect(html).not.toContain('Click to support it');
  });

  it('is a named button that says the click supports it from the model surface', () => {
    const html = renderToStaticMarkup(<UnresolvedBubble point={point} onResolve={() => {}} />);
    expect(html).toContain('<button');
    expect(html).toContain('data-ui="unresolved-bubble"');
    expect(html).toContain('data-resolvable="true"');
    expect(html).toContain('Click to support it from the model surface.');
  });
});
