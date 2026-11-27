import { describe, expect, it } from 'vitest';
import { defaultGraph, unreached, validate } from './nodeGraph.mjs';
import { ownerDownInMesh, probeCasts, withInertCasts } from './rimProbe.mjs';

describe('rimProbe', () => {
  it('turns the matcher transform into the owner\'s down in the Y-up review mesh', () => {
    // Identity pose (the scan printed as filed): down is -Z in the scan, -Y in the mesh.
    expect(ownerDownInMesh([[1, 0, 0, 5], [0, 1, 0, 0], [0, 0, 1, 3.5], [0, 0, 0, 1]]).map((v) => v + 0)).toEqual([0, -1, 0]);
    // Turned 90 deg about x (bare y -> sup z): the scan's -Y is the plate's down, which is +Z in the mesh.
    expect(ownerDownInMesh([[1, 0, 0, 0], [0, 0, -1, 0], [0, 1, 0, 0], [0, 0, 0, 1]]).map((v) => v + 0)).toEqual([0, 0, 1]);
  });

  it('wires every probe cast in (evaluated) behind an empty mark (inert), and the graph validates', () => {
    const { type, ids } = withInertCasts({ zoneGraph: defaultGraph() }, probeCasts());
    expect(ids.length).toBe(probeCasts().length);
    expect(unreached(type.zoneGraph)).toEqual([]);
    expect(validate(type.zoneGraph).problems).toEqual([]);
    const pe = type.zoneGraph.nodes.find((n) => n.id === 'PE');
    expect(pe.inputs.a).toBe(pe.inputs.b); // subtract(U, U): no face, so no result moves
    expect(probeCasts().every((c) => c.deg > 0)).toBe(true); // 0 means "off" to the engine
  });
});
