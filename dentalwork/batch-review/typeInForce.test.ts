import { describe, expect, it } from 'vitest';
import { defaultGraph } from './nodeGraph.mjs';
import { TYPE_DEPS } from './typeInForce';

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
