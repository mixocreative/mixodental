import { describe, expect, it } from 'vitest';
import { resolve, type UiState } from '@mixo-geocore/editing/commands';
import { keyAction } from '@mixo-geocore/editing/keys';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { sessionStatus } from '@mixo-geocore/editing/status';
import { READY } from './uiFixture';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const step3 = run(initialSession, { type: 'enterDental' }, { type: 'chooseDentalProfile', id: 'p' }, { type: 'dentalLoading', unitId: 'u1' },
  { type: 'dentalOriented', proposal: {} as never, notices: [] }, { type: 'acceptDentalOrientation' });
const ui = (over: Partial<UiState>): UiState => ({ ...READY, mode: 'dental', dentalStage: 'review', ...over });

describe('dental Step 3 keys', () => {
  const press = (key: string, selection: number, over: Partial<UiState> = {}) => keyAction({ key, ctrl: false, shift: false, target: null, ui: ui({ selection, ...over }) });
  it('Delete removes the selected supports and the first Esc drops the selection', () => {
    expect(press('Delete', 2).command).toBe('edit.deleteSelection');
    expect(press('Escape', 2).command).toBe('edit.clearSelection');
  });
  it('with nothing selected Esc exits the flow and Delete does nothing', () => {
    expect(press('Escape', 0).command).toBe('dental.exit');
    expect(press('Delete', 0).command).toBeUndefined();
  });

  /* Step 3's tools are Support Edit Mode's, so they put down the same way Step 2's do: Esc, one level. */
  it('Esc puts the tool down before it will leave the flow', () => {
    expect(press('Escape', 0, { dentalToolArmed: true }).command).toBe('dental.toolDown');
    expect(press('Escape', 2, { dentalToolArmed: true }).command).toBe('edit.clearSelection');
  });
});

describe('dental Step 3 commands', () => {
  it('OK and Add another are offered only in Step 3, and only once the supports are built', () => {
    for (const id of ['dental.finish', 'dental.addAnother'] as const) {
      expect(resolve(id, ui({ dentalReviewReady: true, generating: false })).enabled).toBe(true);
      expect(resolve(id, ui({ dentalReviewReady: false })).enabled).toBe(false);
      expect(resolve(id, ui({ dentalReviewReady: true, generating: true })).enabled).toBe(false);
      expect(resolve(id, ui({ dentalStage: 'area' })).visible).toBe(false);
    }
    expect(resolve('dental.finish', ui({})).label).toBe('OK');
    expect(resolve('dental.addAnother', ui({})).label).toBe('Add another aligner');
  });
  it('after a failed or cancelled build OK says what to do, not to wait for a build that is not coming (audit 2026-11-02 #4)', () => {
    for (const id of ['dental.finish', 'dental.addAnother'] as const) {
      expect(resolve(id, ui({ dentalReviewReady: false, dentalBuildFailed: true })).disabledReason?.key).toBe('The supports could not be built. Change a setting to build them again, or press Back.');
      expect(resolve(id, ui({ dentalReviewReady: false })).disabledReason?.key).toBe('Wait until the supports are built.');
      expect(resolve(id, ui({ dentalReviewReady: true, dentalBuildFailed: false })).enabled).toBe(true);
    }
  });
  it('the Support Edit Mode tools are offered inside Step 3', () => {
    expect(resolve('edit.deleteSelection', ui({ selection: 1 })).visible).toBe(true);
    expect(resolve('edit.add', ui({ tool: 'add' })).visible).toBe(true);
    // Step 2 (B3) deletes selected tips with the same command; Step 1 has none.
    expect(resolve('edit.deleteSelection', ui({ dentalStage: 'area' })).visible).toBe(true);
    expect(resolve('edit.deleteSelection', ui({ dentalStage: 'aligner' })).visible).toBe(false);
  });
});

describe('dental status on a step change', () => {
  it('every step change replaces the status line with the new step\'s own, so an error of the last step does not follow', () => {
    const next = reduceSession(step3, { type: 'acceptDentalArea' });
    expect(sessionStatus(step3, next, { type: 'acceptDentalArea' })?.key).toMatch(/^Review the supports/);
    const back = reduceSession(next, { type: 'backDental' });
    expect(sessionStatus(next, back, { type: 'backDental' })?.key).toMatch(/^Paint where dental supports/);
    const again = reduceSession(next, { type: 'addAnotherDental', unitId: 'u1' });
    expect(sessionStatus(next, again, { type: 'addAnotherDental', unitId: 'u1' })?.key).toMatch(/^Drop an aligner STL/);
  });
});
