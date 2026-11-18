// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { autoGenEligibility } from './eligibility';
import { detectStateOf } from '../items/detectState';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';

/**
 * THE GATE THAT DECIDES WHETHER A MODEL IS GENERATED WITH NOBODY WATCHING.
 *
 * Every case below was READY under the deck as it shipped, because 'Ready' meant "the detector did
 * not crash". The tests go through `detectStateOf` on a real engine answer shape rather than
 * hand-building a `DetectState`, so the two halves of the gate are checked together: a doubt the
 * detect state stopped recording would make this file pass while the deck generated the model.
 */

const answer = (over: Partial<Extract<DentalOrientation, { kind: 'oriented' }>> = {}): DentalOrientation => ({
  kind: 'oriented',
  proposal: { kind: 'proposal', rim: {}, diagnostics: { confidence: 1, floorOffsetRatio: 0.1, axialVarianceRatio: 0.1, crossCheck: 'agrees' } } as never,
  rotation: [0, Math.PI, 0],
  opening: 'present',
  meshOk: true,
  matchesProfile: true,
  arch: 'ring',
  ...over,
});

const verdict = (over: Partial<Extract<DentalOrientation, { kind: 'oriented' }>> = {}, atCap = false) =>
  autoGenEligibility({ answered: true, detect: detectStateOf(answer(over)), atCap });

describe('a card the queue may generate unattended', () => {
  it('is ready when the engine agreed with itself on every count', () => {
    expect(verdict()).toEqual({ ready: true });
  });

  it('is not ready until the operator has named it, which is what the detector needs to run', () => {
    expect(autoGenEligibility({ answered: false, detect: undefined, atCap: false })).toEqual({ ready: false, because: 'unanswered' });
  });

  it('is not ready while the check is still queued or running', () => {
    expect(autoGenEligibility({ answered: true, detect: undefined, atCap: false })).toEqual({ ready: false, because: 'checking' });
    expect(autoGenEligibility({ answered: true, detect: { kind: 'waiting' }, atCap: false })).toEqual({ ready: false, because: 'checking' });
    expect(autoGenEligibility({ answered: true, detect: { kind: 'running' }, atCap: false })).toEqual({ ready: false, because: 'checking' });
  });
});

describe('the four doubts the old deck threw away', () => {
  const blocked = { ready: false, because: 'needs-attention' };

  it('holds a model whose pose the engine could not decide - which used to read "Already upright"', () => {
    expect(verdict({ rotation: undefined })).toEqual(blocked);
  });

  it('holds a model whose opening contradicts the type chosen', () => {
    expect(verdict({ matchesProfile: false })).toEqual(blocked);
  });

  it('holds a model whose two up/down rules disagree', () => {
    const disagrees = { kind: 'proposal', rim: {}, diagnostics: { confidence: 1, floorOffsetRatio: 0.9, axialVarianceRatio: 0.1, crossCheck: 'disagrees' } };

    expect(verdict({ proposal: disagrees as never })).toEqual(blocked);
  });

  it('holds a model whose central opening is unclear', () => {
    expect(verdict({ opening: 'ambiguous' })).toEqual(blocked);
  });

  it('holds a model whose mesh is not usable, which is the owner s ruling 6', () => {
    expect(verdict({ meshOk: false })).toEqual(blocked);
  });
});

describe('the reasons that are not the card s own fault', () => {
  it('sends a rimless model to the drawing tool rather than to the queue', () => {
    const noRim = detectStateOf({ kind: 'failed', reason: 'no-cavity', meshOk: true });

    expect(autoGenEligibility({ answered: true, detect: noRim, atCap: false })).toEqual({ ready: false, because: 'no-rim' });
  });

  it('reports a full deck only on a card that would otherwise have gone ahead', () => {
    // Telling an operator the deck is full, when the real problem is this model, sends them to
    // delete other people's work for nothing.
    expect(verdict({}, true)).toEqual({ ready: false, because: 'full' });
    expect(verdict({ meshOk: false }, true)).toEqual({ ready: false, because: 'needs-attention' });
  });
});
