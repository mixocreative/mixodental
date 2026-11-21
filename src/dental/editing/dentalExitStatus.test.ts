import { describe, expect, it } from 'vitest';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { sessionStatus } from '@mixo-geocore/editing/status';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const exitLine = (state: EditSession) => sessionStatus(state, reduceSession(state, { type: 'exit' }), { type: 'exit' })?.key;

/*
 * Exit's line reports what was LEFT on the plate. Before geocore 5319c86 it said "Left the aligner on the
 * plate without supports" after Exit from a Step 1 that never got a file (app UX review, finding 10).
 */
describe('Exit says what it left, and nothing when it left nothing', () => {
  const waiting = run(initialSession, { type: 'startDental', profile: 'p' });

  it('with no object active there is no exit line', () => {
    expect(waiting.activeUnitId).toBeUndefined();
    expect(exitLine(waiting)).toBeUndefined();
  });

  it('with an aligner active it still says what was left', () => {
    expect(exitLine({ ...waiting, activeUnitId: 'u1' })).toBe('Left the aligner on the plate without supports.');
  });
});
