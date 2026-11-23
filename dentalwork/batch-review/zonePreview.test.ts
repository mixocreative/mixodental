import { describe, expect, it } from 'vitest';
import { SET_TOKEN, ZONE_STATES, nodeValues, previewGroups, previewNote, sameGraph } from './zonePreview.mjs';

// Two nodes, five faces each: NS a set of faces, Z2 a Mark's zone (0 Undefined, 1 Support, 2 No-support).
const read = { ids: ['NS', 'Z2'], faces: 5, values: Uint8Array.from([1, 1, 0, 0, 1, 2, 1, 0, 1, 2]) };

describe('the per-node preview (plan D2)', () => {
  it('finds a node\'s own slice of the values, and nothing for a node the run never evaluated', () => {
    expect(Array.from(nodeValues(read, 'Z2')!)).toEqual([2, 1, 0, 1, 2]);
    expect(Array.from(nodeValues(read, 'NS')!)).toEqual([1, 1, 0, 0, 1]);
    expect(nodeValues(read, 'Z9')).toBeNull();
    expect(nodeValues(null, 'NS')).toBeNull();
  });

  it('draws a Mark as its three states, every face in exactly one, and a set of faces as one highlight', () => {
    const zone = previewGroups(nodeValues(read, 'Z2')!, true);
    expect(zone.map((g) => g.token)).toEqual(ZONE_STATES.map((s) => s.token));
    expect(zone.map((g) => Array.from(g.faces))).toEqual([[1, 3], [0, 4], [2]]);
    const set = previewGroups(nodeValues(read, 'NS')!, false);
    expect(set).toHaveLength(1);
    expect(set[0]!.token).toBe(SET_TOKEN);
    expect(Array.from(set[0]!.faces)).toEqual([0, 1, 4]);
  });

  it('says what it shows, and says so plainly when it cannot or when the canvas has moved on', () => {
    const groups = previewGroups(nodeValues(read, 'Z2')!, true);
    expect(previewNote({ title: 'Mark support', groups, hasRead: true, canvasChanged: false }))
      .toBe('Showing the zone as it stands at Mark support: Support 2, No-support 2, Undefined 1 faces. Click the empty canvas to see the final zone again.');
    expect(previewNote({ title: 'Mark support', groups, hasRead: true, canvasChanged: true })).toContain('this is what RAN, not your edit');
    expect(previewNote({ title: 'Mark support', groups: null, hasRead: true, canvasChanged: false })).toContain('has not run on this case');
    expect(previewNote({ title: 'Mark support', groups: null, hasRead: false, canvasChanged: false })).toContain('no per-node values');
  });

  // Fable's review: a node with no faces ran (re-running cannot help), and values that do not fit draw nothing.
  it('says a point or depth-map node has nothing to tint, and never says "Showing" when nothing was drawn', () => {
    expect(previewNote({ title: 'Rim crossing', groups: null, hasRead: true, canvasChanged: false, gives: 'position' })).toContain('gives a point, not faces');
    expect(previewNote({ title: 'Depth map', groups: null, hasRead: true, canvasChanged: false, gives: 'depthMap' })).not.toContain('Apply');
    const groups = previewGroups(nodeValues(read, 'Z2')!, true);
    expect(previewNote({ title: 'Mark support', groups, hasRead: true, canvasChanged: false, gives: 'zone', drawn: false })).toContain('nothing is drawn');
  });

  it('compares graphs whatever order their keys were written in', () => {
    const canvas = { nodes: [{ id: 'A', kind: 'union', params: {}, inputs: { a: 'X', b: 'Y' } }], outputs: { zone: 'Z' } };
    const ran = { outputs: { zone: 'Z' }, nodes: [{ id: 'A', inputs: { a: 'X', b: 'Y' }, kind: 'union', params: {} }] };
    expect(sameGraph(canvas, ran)).toBe(true);
    expect(sameGraph(canvas, { ...ran, outputs: { zone: 'Q' } })).toBe(false);
    // Order inside a list is meaning (node order), so it is kept.
    expect(sameGraph({ list: [1, 2] }, { list: [2, 1] })).toBe(false);
  });
});
