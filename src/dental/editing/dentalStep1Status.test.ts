import { describe, expect, it } from 'vitest';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { editStatus, sessionStatus } from '@mixo-geocore/editing/status';
import { kindMessage } from '../../denture/kindText';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);

/*
 * Step 1 is one gesture kind with phases. Its status line used to be fixed per kind, so it said "Drop an
 * aligner STL" with the model already loaded and oriented (app UX review, finding 2).
 */
describe('Step 1 status line follows its phase', () => {
  const waiting = run(initialSession, { type: 'startDental', profile: 'p' });
  const loading = run(waiting, { type: 'dentalLoading', unitId: 'u1' });
  const ready = run(loading, { type: 'dentalOriented', proposal: {} as never, notices: [] });

  it('asks for the file until there is one, then says what to do with it', () => {
    expect(editStatus(waiting)?.key).toMatch(/^Drop an aligner STL/);
    expect(editStatus(ready)?.key).toBe('Review the orientation. Turn the aligner with the gizmo if needed.');
  });

  it('the change reaches the status line when the model is oriented', () => {
    expect(sessionStatus(loading, ready, { type: 'dentalOriented', proposal: {} as never, notices: [] })?.key)
      .toBe('Review the orientation. Turn the aligner with the gizmo if needed.');
  });

  it('a denture reads its own instruction, as its badge does', () => {
    const line = editStatus(ready);
    expect(line && kindMessage(line, 'denture').key).toBe('Review the print angle. Drag the dial: tips turn green with a path to the plate.');
  });
});
