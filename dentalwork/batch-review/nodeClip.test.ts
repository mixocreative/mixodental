// nodeClip.mjs through both libraries that use it: several nodes at once (owner 2026-11-26, "complete still open"),
// a box selection that takes in a node that may not be copied, and copy on the Orient canvas.
import { describe, expect, it } from 'vitest';
import * as zones from './nodeGraph.mjs';
import * as orient from './orientGraph.mjs';

describe('copying several nodes', () => {
  it('copies and duplicates a selection of several nodes as one group, wires between them kept', () => {
    const g = zones.defaultGraph();
    const clip = zones.copyNodes(g, ['NS', 'R1', 'R1b'], { category: 'denture' });
    expect(clip.nodes.map((n) => n.id).sort()).toEqual(['NS', 'R1', 'R1b']);
    expect(clip.left).toEqual([]);
    const done = zones.duplicateNodes(g, ['NS', 'R1'], { category: 'denture' });
    const ns = done.graph.nodes.find((n) => n.id === done.ids.NS)!;
    // NS read R1 and R1b: the copy reads the COPY of R1 (in the selection) and the original R1b (duplicate keeps it).
    expect(ns.inputs).toEqual({ a: done.ids.R1, b: 'R1b' });
    expect(zones.validate(done.graph).problems.filter((p: string) => Object.values(done.ids).some((id) => p.startsWith(`${id}:`)))).toEqual([]);
  });

  it('leaves out, BY NAME, a node in the selection that may not be copied, instead of refusing the whole copy', () => {
    const clip = zones.copyNodes(zones.defaultGraph(), ['R1', 'RIM'], { category: 'denture' });
    expect(clip.nodes.map((n) => n.id)).toEqual(['R1']);
    expect(clip.left).toEqual([expect.stringMatching(/^RIM: .* is found on an earlier tab and cannot be copied$/)]);
  });

  it('refuses a selection where nothing may be copied, naming each', () => {
    expect(() => zones.copyNodes(zones.defaultGraph(), ['RIM', 'BASINS'], { category: 'denture' })).toThrow(/nothing copied: RIM - .*; BASINS - .*cannot run yet/);
    expect(() => zones.copyNodes(zones.defaultGraph(), [], { category: 'denture' })).toThrow(/select a node/);
  });
});

describe('copy on the Orient canvas', () => {
  it('duplicates an Orient node with a fresh id that reads what the original reads', () => {
    const done = orient.duplicateNodes(orient.defaultGraph(), 'POSE', { category: 'orient' });
    const copy = done.graph.nodes.find((n) => n.id === done.ids.POSE)!;
    expect(copy).toMatchObject({ kind: 'plateSide', inputs: { frame: 'UP' } });
    expect(copy.id).not.toBe('POSE');
  });

  it('pastes the flat-base recipe into the standard Step 1 as a wired group, with nothing cut', () => {
    const recipe = orient.flatBaseGraph();
    const clip = orient.copyNodes(recipe, 'POSE', { category: 'orient', withInputs: true });
    expect(clip.nodes.map((n) => n.id).sort()).toEqual(['FLAT', 'FR', 'POSE']);
    const done = orient.pasteNodes(orient.defaultGraph(), clip, { category: 'orient' });
    expect(done.cut).toEqual([]);
    const pose = done.graph.nodes.find((n) => n.id === done.ids.POSE)!;
    expect(pose.inputs).toEqual({ base: done.ids.FLAT, frame: done.ids.FR });
    // The pasted nodes are complete; only the outputs still point at the old pose, which is the operator's choice.
    expect(orient.validate(orient.bindOutput(orient.bindOutput(done.graph, 'pose', done.ids.POSE), 'frame', done.ids.FR)).problems).toEqual([]);
  });

  it('keeps an Orient clip out of a zone graph, and refuses the old kind by its new name', () => {
    const clip = orient.copyNodes(orient.defaultGraph(), 'UP', { category: 'orient' });
    expect(() => zones.pasteNodes(zones.defaultGraph(), clip, { category: 'denture' })).toThrow(/copied from a orient type/);
    const old = { nodes: [{ id: 'P', kind: 'uprightPose', params: {}, inputs: { frame: null } }], outputs: {} };
    expect(() => orient.copyNodes(old, 'P', { category: 'orient' })).toThrow(/add Plate side instead/);
  });
});
