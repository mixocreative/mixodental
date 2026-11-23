import { describe, expect, it } from 'vitest';
import { resolve, type UiState } from '@mixo-geocore/editing/commands';
import { READY } from './uiFixture';
import '../editingMode';

/*
 * A denture's Flip buttons on Step 1 (plan C2). The case flip acts inside the Orient graph's upDecision node, so on a
 * type whose own Orient graph has none (the flat-base recipe, loadable since plan E1) a working-looking button would
 * do nothing. It is greyed with the reason instead.
 */
const step1 = (change: Partial<UiState>): UiState => ({
  ...READY, mode: 'dental', dentalStage: 'aligner', dentalKind: 'denture', dentalAlignerReady: true, dentalProposed: true, dentalTiltBusy: false, ...change,
});

describe('the denture Flip buttons', () => {
  it('work once the print angles are checked, and wait for them before', () => {
    for (const id of ['dental.denture.flipFront', 'dental.denture.flipTeeth'] as const) {
      expect(resolve(id, step1({})).enabled, id).toBe(true);
      const busy = resolve(id, step1({ dentalTiltBusy: true }));
      expect(busy.enabled, id).toBe(false);
      expect(busy.disabledReason?.key, id).toBe('Wait until the print angles are checked.');
    }
  });

  it('are greyed with the reason on a type with no front or teeth side, never silently dead', () => {
    for (const id of ['dental.denture.flipFront', 'dental.denture.flipTeeth'] as const) {
      const flat = resolve(id, step1({ dentalNoSides: true }));
      expect(flat.visible, id).toBe(true);
      expect(flat.enabled, id).toBe(false);
      expect(flat.disabledReason?.key, id).toMatch(/flat base/);
    }
  });

  it('are hidden off Step 1 and for an aligner', () => {
    expect(resolve('dental.denture.flipFront', step1({ dentalStage: 'area' })).visible).toBe(false);
    expect(resolve('dental.denture.flipFront', step1({ dentalKind: 'aligner' })).visible).toBe(false);
  });
});
