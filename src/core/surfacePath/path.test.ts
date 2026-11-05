import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import {
  appendAnchor, closePath, emptyPath, insertAnchor, MIN_CLOSED_ANCHORS, moveAnchor,
  openPath, removeAnchor, segments, type SurfaceAnchor, type SurfacePath,
} from './path';

const at = (position: Vector, normal: Vector = [0, 0, 1]): SurfaceAnchor => ({ position, normal });
const pathOf = (closed: boolean, ...positions: Vector[]): SurfacePath => ({ anchors: positions.map((p) => at(p)), closed });
const square = (closed = true): SurfacePath => pathOf(closed, [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]);

describe('surface path edits', () => {
  it('starts empty and open, and grows by appending', () => {
    const empty = emptyPath();
    expect(empty.anchors).toEqual([]);
    expect(empty.closed).toBe(false);
    const one = appendAnchor(empty, at([1, 2, 3]));
    expect(one?.anchors).toHaveLength(1);
    // Edits never touch the path they were given: that is what makes one edit one undo step.
    expect(empty.anchors).toHaveLength(0);
  });

  it('counts one segment per anchor when closed, one fewer when open', () => {
    expect(segments(square(false))).toEqual([[0, 1], [1, 2], [2, 3]]);
    expect(segments(square(true))).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]]);
    expect(segments(pathOf(false, [0, 0, 0]))).toEqual([]);
  });

  it('refuses to append to a closed path: a loop has no end to add to', () => {
    expect(appendAnchor(square(true), at([2, 2, 0]))).toBeUndefined();
    expect(appendAnchor(square(false), at([2, 2, 0]))?.anchors).toHaveLength(5);
  });

  it('inserts into a segment, so a drawn loop is refined rather than redrawn', () => {
    const inserted = insertAnchor(square(true), 2, at([9, 9, 0]));
    expect(inserted?.anchors.map((anchor) => anchor.position[0])).toEqual([0, 1, 9, 1, 0]);
    expect(insertAnchor(square(true), 4, at([9, 9, 0]))?.anchors).toHaveLength(5);
    for (const bad of [-1, 5, 1.5]) expect(insertAnchor(square(true), bad, at([9, 9, 0]))).toBeUndefined();
  });

  it('moves one anchor and leaves the rest', () => {
    const moved = moveAnchor(square(true), 1, at([5, 0, 0], [0, 1, 0]));
    expect(moved?.anchors[1]).toEqual({ position: [5, 0, 0], normal: [0, 1, 0] });
    expect(moved?.anchors).toHaveLength(4);
    expect(moveAnchor(square(true), 9, at([5, 0, 0]))).toBeUndefined();
  });

  /*
   * The refusal that matters: dropping to two anchors cannot silently OPEN the loop. The operator said
   * "this is a loop"; throwing that away as a side effect of a delete would leave no sign it happened.
   */
  it('refuses a removal that would leave a closed path with fewer than three anchors', () => {
    const triangle = pathOf(true, [0, 0, 0], [1, 0, 0], [0, 1, 0]);
    expect(triangle.anchors).toHaveLength(MIN_CLOSED_ANCHORS);
    expect(removeAnchor(triangle, 0)).toBeUndefined();
    // The same anchors as a line may shrink: a line of two ends is still a line.
    expect(removeAnchor({ ...triangle, closed: false }, 0)?.anchors).toHaveLength(2);
    expect(removeAnchor(square(true), 0)?.anchors).toHaveLength(3);
  });

  it('closes only from three anchors, and opens only what is closed', () => {
    expect(closePath(pathOf(false, [0, 0, 0], [1, 0, 0]))).toBeUndefined();
    expect(closePath(pathOf(false, [0, 0, 0], [1, 0, 0], [0, 1, 0]))?.closed).toBe(true);
    expect(closePath(square(true))).toBeUndefined();
    expect(openPath(square(true))?.closed).toBe(false);
    expect(openPath(square(false))).toBeUndefined();
  });
});
