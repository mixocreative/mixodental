// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { sceneJsonReplacer, sceneJsonReviver } from './project';

/**
 * HOW A MESH IS WRITTEN INTO A PROJECT FILE, and the crash that makes it worth a test of its own.
 *
 * Until 2026-11-18 `sceneJsonReplacer` wrote typed arrays as `values: Array.from(value)` — every
 * vertex as decimal TEXT. `JSON.stringify` spends 10-18 characters on a float that occupies 4
 * bytes, so one 374k-triangle aligner came to roughly 18.5 MB of string and a case hit V8's ~512 MB
 * maximum string length at about 29 models.
 *
 * The failure was the worst shape this app has: the operator saves at the end of a long session,
 * the tab dies with a string-length error nobody can act on, and every hand edit dies with it.
 * Nothing in the suite looked at the size of what `serializeScene` produced, only at whether it
 * round-tripped — which it does perfectly, right up to the model that kills the tab.
 *
 * So this file tests the ENCODING rather than the scene: that it round-trips, that files written in
 * the old format still open, and that the new one is actually smaller. The last of those is the
 * only one that would have caught the original defect.
 */

const roundTrip = <T>(value: T): T => JSON.parse(JSON.stringify(value, sceneJsonReplacer), sceneJsonReviver) as T;

describe('typed arrays in a project file', () => {
  it('round-trips each kind with its values and its type intact', () => {
    const floats = new Float32Array([0, -1.5, 3.25, 1e-7, 12345.75]);
    const indices = new Uint32Array([0, 1, 2, 4294967295]);
    const bytes = new Uint8Array([0, 7, 255]);

    const back = roundTrip({ floats, indices, bytes });

    expect(back.floats).toBeInstanceOf(Float32Array);
    expect([...back.floats]).toEqual([...floats]);
    expect(back.indices).toBeInstanceOf(Uint32Array);
    expect([...back.indices]).toEqual([...indices]);
    expect(back.bytes).toBeInstanceOf(Uint8Array);
    expect([...back.bytes]).toEqual([...bytes]);
  });

  it('still opens a file written in the old number-list format', () => {
    /*
     * NOT A FALLBACK TO BE REMOVED LATER. Every project file already on a customer's disk holds
     * `values`, and a saved case is the work of a day. This is the shape those files have.
     */
    const old = '{"a":{"$printSceneType":"Float32Array","values":[1,2.5]},'
      + '"b":{"$printSceneType":"Uint32Array","values":[7]},'
      + '"c":{"$printSceneType":"Uint8Array","values":[9]}}';

    const back = JSON.parse(old, sceneJsonReviver) as { a: Float32Array; b: Uint32Array; c: Uint8Array };

    expect([...back.a]).toEqual([1, 2.5]);
    expect([...back.b]).toEqual([7]);
    expect([...back.c]).toEqual([9]);
    expect(back.a).toBeInstanceOf(Float32Array);
  });

  it('writes a mesh in FEWER characters than bytes times four, which is what stops the crash', () => {
    /*
     * THE ASSERTION THAT WOULD HAVE CAUGHT IT. Base64 is 4 characters per 3 bytes, so a float
     * costs about 5.3 characters; decimal text costs 10-18 and has no upper bound - one awkward
     * value like 0.30000001192092896 is 19 on its own. Pinning the ratio pins the ceiling.
     *
     * Positions from a real mesh rather than round numbers: `Array.from` is at its cheapest on
     * `[0, 1, 2]` and at its worst on the float32 values a scanner actually produces, which is the
     * case that crashed.
     */
    const positions = new Float32Array(30_000);
    for (let at = 0; at < positions.length; at += 1) positions[at] = Math.sin(at) * 37.123456;

    const written = JSON.stringify({ positions }, sceneJsonReplacer).length;
    const asNumberList = JSON.stringify({ positions: { $printSceneType: 'Float32Array', values: Array.from(positions) } }).length;

    // 4 characters per BYTE is a generous ceiling: base64 spends 4 per 3 bytes plus the wrapper.
    expect(written).toBeLessThan(positions.byteLength * 4);
    // And it must actually beat what it replaced, by a margin worth the format change.
    expect(written * 2).toBeLessThan(asNumberList);
  });

  it('survives an array long enough to overflow a spread call, which is every real mesh', () => {
    /*
     * `String.fromCharCode(...bytes)` on a megabyte is a million arguments in one call and throws
     * `RangeError: Maximum call stack size exceeded`. The encoder chunks for exactly this reason,
     * and a test with five values would never have found it.
     */
    const big = new Float32Array(300_000);
    big[0] = 1.5;
    big[big.length - 1] = -2.25;

    const back = roundTrip({ big }).big;

    expect(back.length).toBe(big.length);
    expect(back[0]).toBe(1.5);
    expect(back[back.length - 1]).toBe(-2.25);
  });
});
