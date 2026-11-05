import { describe, expect, it } from 'vitest';
import { initialSession, reduceSession } from '@mixo-geocore/editing/session';
import { stageAfterOrientation, stageBeforeSupports } from './dentureStages';
import { DENTURE_PROFILE_ID } from '../jobKind';

describe('denture stages', () => {
  it('skips the support-area step for a denture only', () => {
    expect(stageAfterOrientation(DENTURE_PROFILE_ID)).toBe('review');
    expect(stageBeforeSupports(DENTURE_PROFILE_ID)).toBe('aligner');
    expect(stageAfterOrientation('reference-aligner')).toBe('area');
    expect(stageBeforeSupports('reference-aligner')).toBe('area');
  });

  it('runs a denture job from the start screen to Step 2 and back to Step 1', () => {
    let session = reduceSession(initialSession, { type: 'startDental', profile: DENTURE_PROFILE_ID });
    expect(session.dentalStage).toBe('aligner');
    session = reduceSession(session, { type: 'dentalLoading', unitId: 'u' });
    session = reduceSession(session, { type: 'dentureOriented' });
    expect(session.dentalAligner).toBe('ready');
    session = reduceSession(session, { type: 'acceptDentalOrientation' });
    expect(session.dentalStage).toBe('review');
    // A step opens on Select, the tool that changes nothing until it is asked to.
    expect(session.tool).toBe('select');
    session = reduceSession(session, { type: 'backDental' });
    expect(session.dentalStage).toBe('aligner');
    expect(session.dentalAligner).toBe('ready');
  });
});
