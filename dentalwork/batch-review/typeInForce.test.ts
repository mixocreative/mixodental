import { describe, expect, it } from 'vitest';
import { setZoneGraph, zoneGraphDigest } from '@mixo-geocore/host/dental/zoneGraph';
import { defaultGraph } from './nodeGraph.mjs';
import { putInForce, TYPE_DEPS, typeOfRun } from './typeInForce';

/*
 * A type file saved before 2026-11-22 names the rim node's kind `rimCurve`. It is checked through TYPE_DEPS, the one
 * set of checks every type file is read with, so the alias must live there: `src/dentalTypes/typeFile.test.ts` builds
 * its own deps and cannot notice it being dropped (Fable's review of build step 3).
 */
describe('a type file with an old rim name passes the type-file graph check', () => {
  it('reads kind rimCurve as rim', () => {
    const old = defaultGraph();
    old.nodes.find((n) => n.id === 'RIM')!.kind = 'rimCurve';
    expect(TYPE_DEPS.graphProblems(old, {})).toEqual([]);
  });
});

/*
 * Build step 4.4: an aligner type carries no zone graph, and putting it in force used to send "no graph" to the one
 * slot the engine had - clearing the DENTURE's edited graph as a side effect.
 */
describe('putting an aligner type in force', () => {
  it('leaves the denture zone graph in force', () => {
    const edited = defaultGraph();
    edited.nodes.push({ id: 'R2', kind: 'parallelCast', params: { from: 'front', toward: 'tissue', deg: 30, pitchMm: 0.1 }, inputs: {} });
    edited.nodes.push({ id: 'NS2', kind: 'union', params: {}, inputs: { a: 'NS', b: 'R2' } });
    edited.outputs.no_support = 'NS2';
    const denture = setZoneGraph(edited);
    try {
      expect(denture).not.toBe('default');
      const aligner = typeOfRun('aligner', { MIXO_TYPE_ID: 'test-aligner-type' })!;
      expect(putInForce(aligner, {})).toBe('default');
      expect(zoneGraphDigest()).toBe(denture);
    } finally {
      setZoneGraph(null);
    }
  });
});

/* The workbench gives a draft its own name and the badge the user typed (docs/TYPE-PIPELINE.md section 8a). */
describe('a drafted type', () => {
  it('is named after its id in all three languages, and carries the badge', () => {
    const type = typeOfRun('denture', { MIXO_TYPE_ID: 'soft-denture', MIXO_TYPE_BADGE: 'SOFT' })!;
    expect(type.profile.name).toEqual({ en: 'soft-denture', ja: 'soft-denture', 'zh-Hant': 'soft-denture' });
    expect(type.badge).toBe('SOFT');
    expect(typeOfRun('denture', { MIXO_TYPE_ID: 'plain' })!.badge).toBeUndefined();
    expect(() => typeOfRun('denture', { MIXO_TYPE_ID: 'bad', MIXO_TYPE_BADGE: 'TOO LONG' })).toThrow(/badge is 1 to 5 characters/);
  });
});
