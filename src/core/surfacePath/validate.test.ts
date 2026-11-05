import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SurfacePath } from './path';
import { pathProblems, pathUsable, selfIntersects } from './validate';

const pathOf = (closed: boolean, ...positions: Vector[]): SurfacePath =>
  ({ anchors: positions.map((position) => ({ position, normal: [0, 0, 1] as Vector })), closed });
const square = (closed = true): SurfacePath => pathOf(closed, [0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]);

describe('surface path validation', () => {
  it('passes a plain closed loop', () => {
    expect(pathProblems(square())).toEqual([]);
    expect(pathUsable(square())).toBe(true);
  });

  it('wants three anchors for a loop and two for a line', () => {
    expect(pathProblems(pathOf(true, [0, 0, 0], [1, 0, 0]))).toEqual(['TOO_FEW_POINTS']);
    expect(pathProblems(pathOf(false, [0, 0, 0]))).toEqual(['TOO_FEW_POINTS']);
    expect(pathProblems(pathOf(false, [0, 0, 0], [1, 0, 0]))).toEqual([]);
  });

  /*
   * An OPEN path is asked for its two ends and nothing else. It lies in no particular plane, encloses no
   * area, and may legitimately double back over itself - so none of the loop refusals apply to it. This is
   * what lets the same module serve a rim loop and a measuring line.
   */
  it('asks an open path for nothing but its ends, even when it crosses itself', () => {
    const crossing = pathOf(false, [0, 0, 0], [1, 1, 0], [1, 0, 0], [0, 1, 0]);
    expect(pathProblems(crossing)).toEqual([]);
  });

  it('calls collinear anchors collinear', () => {
    expect(pathProblems(pathOf(true, [0, 0, 0], [1, 0, 0], [2, 0, 0]))).toEqual(['COLLINEAR']);
  });

  /*
   * The bowtie. Its anchors share a plane, its area cancels to nothing, and it crosses itself: the reader
   * is told BOTH true things, and is never told it is collinear, which it is not.
   */
  it('reports a self-crossing loop as crossing and as having no area, not as collinear', () => {
    const bowtie = pathOf(true, [0, 0, 0], [1, 1, 0], [1, 0, 0], [0, 1, 0]);
    const problems = pathProblems(bowtie);
    expect(problems).toContain('SELF_INTERSECTING');
    expect(problems).toContain('DEGENERATE_AREA');
    expect(problems).not.toContain('COLLINEAR');
  });

  it('spots a crossing that does not cancel the area', () => {
    // A loop that reaches across itself once: a real interior, but folded.
    const folded = pathOf(true, [0, 0, 0], [4, 0, 0], [0, 1, 0], [4, 1, 0]);
    expect(selfIntersects(folded)).toBe(true);
    expect(pathProblems(folded)).toContain('SELF_INTERSECTING');
  });

  it('does not count segments that merely share an anchor as crossing', () => {
    expect(selfIntersects(square())).toBe(false);
    expect(selfIntersects(pathOf(true, [0, 0, 0], [1, 0, 0], [0, 1, 0]))).toBe(false);
  });

  /*
   * A long thin ring is exactly what a dental rim round an arch looks like, so the sliver test has to be
   * loose enough to pass one: this 40 x 0.4 ring scores far below a circle and must still be allowed.
   */
  it('allows a long thin ring, which is what a real rim is', () => {
    const ring = pathOf(true, [0, 0, 0], [40, 0, 0], [40, 0.4, 0], [0, 0.4, 0]);
    expect(pathProblems(ring)).toEqual([]);
  });

  /*
   * Out and straight back, 10 long by 0.003 wide. The two refusals sit either side of this: the anchors
   * are far enough off a line to span a plane (0.0003 of the span, against a threshold of 1e-6), and the
   * interior is far too thin to mean anything (a shape ratio near 0.0009, against 0.002). So a plane is
   * found and the sliver is named, which is the distinction worth having.
   */
  it('refuses a loop with a plane but no usable interior', () => {
    const sliver = pathOf(true, [0, 0, 0], [10, 0, 0], [10, 0.003, 0], [0, 0.003, 0]);
    expect(pathProblems(sliver)).toEqual(['DEGENERATE_AREA']);
  });

  it('calls a loop thinner than that a line, because that is what it is', () => {
    const line = pathOf(true, [0, 0, 0], [10, 0, 0], [10, 1e-7, 0], [0, 1e-7, 0]);
    expect(pathProblems(line)).toEqual(['COLLINEAR']);
  });
});
