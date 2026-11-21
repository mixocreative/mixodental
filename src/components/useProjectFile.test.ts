import { describe, expect, it } from 'vitest';
import { saveOutcome } from './useProjectFile';

/*
 * cia MD-01: only a write through the save dialog is confirmed. The download fallback must leave the project
 * unsaved (so the leave-page warning stays on) and must not say "Saved".
 */
describe('saveOutcome', () => {
  it('marks the project saved only for a confirmed write', () => {
    expect(saveOutcome(true, 'case.mxd')).toEqual({ markSaved: true, status: { key: 'Saved {name}.', vars: { name: 'case.mxd' } } });
  });

  it('keeps a download it cannot see land unsaved, and says where the file went', () => {
    const outcome = saveOutcome(false, 'case.mxd');
    expect(outcome.markSaved).toBe(false);
    expect(outcome.status.key).not.toMatch(/^Saved/);
    expect(outcome.status.key).toMatch(/downloads/);
    expect(outcome.status.vars).toEqual({ name: 'case.mxd' });
  });
});
