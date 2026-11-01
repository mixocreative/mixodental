import { describe, expect, it } from 'vitest';
import type { PrintUnit } from '../../../state/project';
import { dentureJobOf } from './dentureBuildJob';

const unit: PrintUnit = { id: 'u', name: 'd', source: { positions: new Float32Array(9), indices: new Uint32Array([0, 1, 2]) },
  transform: { position: [1, 9, 2], rotation: [0.2, 0, 0] }, settings: { labelText: '' }, manual: [], deleted: ['p1'], zones: [], contactSettings: {},
  supports: { kind: 'live', data: { transform: { position: [1, 4, 2], rotation: [0.2, 0, 0] }, plate: -5 } },
  denture: { policy: { kind: 'denture', profileId: 'reference-denture', lattice: true, modelLandingAllow: ['denture-low-0'] } } };

describe('dentureJobOf', () => {
  it('builds from the stored frame, plate, policy and hand work', () => {
    const job = dentureJobOf(unit, 'export', { lowOutsideAllowed: 0 }, 7)!;
    expect(job.frame).toEqual({ position: [1, 4, 2], rotation: [0.2, 0, 0] });
    expect(job.plateY).toBe(-5);
    expect(job.policy.modelLandingAllow).toEqual(['denture-low-0']);
    expect(job.hand.deleted).toEqual(['p1']);
    expect(job.rules).toEqual({ lowOutsideAllowed: 0 });
    expect(job.labelText).toBe('X');
    expect(job.mode).toBe('export');
    expect(job.revision).toBe(7);
  });

  it('has no job for a unit that is not an accepted denture', () => {
    expect(dentureJobOf({ ...unit, denture: undefined }, 'preview', {})).toBeUndefined();
    expect(dentureJobOf({ ...unit, supports: undefined }, 'preview', {})).toBeUndefined();
  });
});
