// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { CASE_BUDGET_BYTES, deckUsage, formatBytes, PRACTICAL_MAX_MODELS, RESIDENT_BYTES_PER_TRIANGLE } from './deckBudget';

/** The reference aligner, which every measurement in this area was taken on. */
const ALIGNER = 373_956;
const MiB = 2 ** 20;

describe('what a case costs', () => {
  it('holds a welded aligner at about 6.4 MiB, not the 25.7 MB a triangle-soup estimate gives', () => {
    /*
     * THE NUMBER THIS WHOLE MODULE TURNS ON, and the one that was got wrong first. 18 B/triangle is
     * the INDEXED mesh the scene keeps; 72 B/triangle is the same model as unindexed positions and
     * normals, which is what sits in the STL on disk and what an estimate reaches for by mistake.
     * Four times too big, in the direction that cancels features.
     */
    const { residentBytes } = deckUsage([ALIGNER]);
    expect(residentBytes / MiB).toBeCloseTo(6.4, 1);
  });

  it('scales the resident cost with the case and NOT the generate cost, because the queue is serial', () => {
    const one = deckUsage([ALIGNER]);
    const sixty = deckUsage(Array.from({ length: 60 }, () => ALIGNER));

    expect(sixty.residentBytes).toBe(one.residentBytes * 60);
    // The generate working set is the same in both: one model at a time, each session forgotten
    // after it (`scripts/perf/deck-scale.ts` measured what keeping them costs: ~19.7 MB an item).
    expect(sixty.peakBytes - sixty.residentBytes).toBe(one.peakBytes - one.residentBytes);
  });

  it('sizes the generate on the BIGGEST model, since that is the one that peaks highest', () => {
    const mixed = deckUsage([1000, ALIGNER, 2000]);
    const largestAlone = deckUsage([ALIGNER]);

    expect(mixed.peakBytes - mixed.residentBytes).toBe(largestAlone.peakBytes - largestAlone.residentBytes);
  });

  it('fits sixty aligners inside the allowance, and says so', () => {
    // The feature this module exists to green-light: a 60-model case of ordinary aligners.
    const sixty = deckUsage(Array.from({ length: 60 }, () => ALIGNER));

    expect(sixty.overBudget).toBe(false);
    expect(sixty.capModels).toBeGreaterThan(60);
    expect(sixty.capModels).toBeLessThanOrEqual(PRACTICAL_MAX_MODELS);
  });

  it('refuses a case of heavy scans, which is the case that actually breaks', () => {
    /*
     * NOT sixty aligners - sixty 3M-triangle scans. The cap has to key on SIZE, not on a count: a
     * fixed "max 30 models" would wave this through and refuse a harmless case of small ones.
     */
    const heavy = deckUsage(Array.from({ length: 40 }, () => 3_000_000));

    expect(heavy.overBudget).toBe(true);
    expect(heavy.capModels).toBeLessThan(40);
  });

  it('reads an empty deck as room for many, never as room for none', () => {
    // "0 of 0" would look like a deck that can hold nothing, which is the opposite of the truth.
    const empty = deckUsage([]);

    expect(empty.models).toBe(0);
    expect(empty.residentBytes).toBe(0);
    expect(empty.overBudget).toBe(false);
    expect(empty.peakBytes).toBe(0);
  });

  it('takes the allowance as a parameter, so the arithmetic is pinned and the constant is not', () => {
    const tight = deckUsage([ALIGNER], 1 * MiB);

    expect(tight.overBudget).toBe(true);
    expect(tight.capModels).toBe(0);
    expect(deckUsage([ALIGNER]).allowanceBytes).toBe(CASE_BUDGET_BYTES);
  });

  it('never prints a cap too large to mean anything, however light the models are', () => {
    /*
     * THE DEFECT THIS CAUGHT, on screen rather than in a file: three 12-triangle test cubes left
     * the whole allowance untouched, so the derived cap read **9,942,004 models**. True, useless,
     * and the fastest way to teach someone to stop reading a line. Memory is not the only thing
     * that runs out - a list stops being scannable long before the bytes do.
     */
    const cubes = deckUsage(Array.from({ length: 3 }, () => 12));

    expect(cubes.capModels).toBe(PRACTICAL_MAX_MODELS);
  });

  it('formats both readouts the same way, in units an operator reads', () => {
    expect(formatBytes(0)).toBe('0 KB');
    // A case IS loaded, so no figure may read zero - and a file's size has to be matchable against
    // a folder listing, which `<1 MB` is not.
    expect(formatBytes(1000)).toBe('1 KB');
    expect(formatBytes(98 * 1024)).toBe('98 KB');
    expect(formatBytes(385 * MiB)).toBe('385 MB');
    expect(formatBytes(2 * 1024 * MiB)).toBe('2.0 GB');
  });

  it('states the resident figure as a named constant rather than hiding it in a sum', () => {
    expect(RESIDENT_BYTES_PER_TRIANGLE).toBe(18);
  });
});
