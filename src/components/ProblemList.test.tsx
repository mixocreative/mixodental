import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProblemList } from './ProblemList';

const outside = { kind: 'outside' as const, position: [0, 0, 0] as [number, number, number], area: 0, points: [[0, 0, 0], [1, 0, 0]] as [number, number, number][], unitId: 'u1', inZone: false };
const list = (kindOf?: (unitId: string) => 'aligner' | 'denture' | undefined) => renderToStaticMarkup(
  <ProblemList problems={[outside]} outOfDate={false} rechecking={() => false} unitName={() => 'A'} {...(kindOf ? { kindOf } : {})} onShow={() => {}} onFix={() => {}} />);

const buried = { kind: 'buried' as const, position: [1, 2, 3] as [number, number, number], area: 0, points: [[1, 2, 3], [4, 5, 6]] as [number, number, number][], unitId: 'u1', inZone: false };

describe('ProblemList', () => {
  it('offers Show but no Fix on an overlap finding, because there is nothing to fix', () => {
    const markup = renderToStaticMarkup(
      <ProblemList problems={[buried]} outOfDate={false} rechecking={() => false} unitName={() => 'A'} onShow={() => {}} onFix={() => {}} />);
    expect(markup).toContain('2 contacts were left out: they sit inside another mesh of this object');
    expect(markup).toContain('data-ui="problem-item-buried"');
    // Show frames the overlap -- the whole point of carrying the positions rather than a count.
    expect(markup).toContain('Show me');
    expect(markup).not.toContain('>Fix<');
  });

  it('names the job object of the finding unit in the outside line', () => {
    expect(list()).toContain('2 low points lie outside the dental support area and are left to the aligner shape.');
    const denture = list(() => 'denture');
    expect(denture).toContain('2 low points lie outside the allowed support area and are left to the denture shape.');
    expect(denture).not.toContain('aligner');
    expect(denture).toContain('data-ui="problem-item-outside"');
  });
});
