import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProblemList } from './ProblemList';

const outside = { kind: 'outside' as const, position: [0, 0, 0] as [number, number, number], area: 0, points: [[0, 0, 0], [1, 0, 0]] as [number, number, number][], unitId: 'u1', inZone: false };
const list = (kindOf?: (unitId: string) => 'aligner' | 'denture' | undefined) => renderToStaticMarkup(
  <ProblemList problems={[outside]} outOfDate={false} rechecking={() => false} unitName={() => 'A'} {...(kindOf ? { kindOf } : {})} onShow={() => {}} onFix={() => {}} />);

describe('ProblemList', () => {
  it('names the job object of the finding unit in the outside line', () => {
    expect(list()).toContain('2 low points lie outside the dental support area and are left to the aligner shape.');
    const denture = list(() => 'denture');
    expect(denture).toContain('2 low points lie outside the allowed support area and are left to the denture shape.');
    expect(denture).not.toContain('aligner');
    expect(denture).toContain('data-ui="problem-item-outside"');
  });
});
