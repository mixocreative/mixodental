import { describe, expect, it } from 'vitest';
import { gesture } from '@mixo-geocore/editing/gesture';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { isOrientationStep, NO_SUPPORT_MESHES } from './step1View';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);

describe('isOrientationStep (PD.11 Step 1 viewport)', () => {
  it('is true only for the dental aligner stage', () => {
    expect(isOrientationStep({ mode: 'dental', dentalStage: 'aligner' })).toBe(true);
    for (const dentalStage of ['area', 'review', 'type', 'off']) expect(isOrientationStep({ mode: 'dental', dentalStage })).toBe(false);
    expect(isOrientationStep({ mode: 'off', dentalStage: 'aligner' })).toBe(false);
  });

  it('Step 1 has no support meshes', () => {
    expect(NO_SUPPORT_MESHES.size).toBe(0);
  });

  it('adding supports is not possible in Step 1: the gesture is dental-aligner, not an add', () => {
    const step1 = run(initialSession, { type: 'enterDental' }, { type: 'chooseDentalProfile', id: 'p' });
    const step1Gesture = gesture({ ...step1, mode: 'dental', dentalStage: 'aligner' });
    expect(step1Gesture.kind).toBe('dental-aligner');
  });
});
