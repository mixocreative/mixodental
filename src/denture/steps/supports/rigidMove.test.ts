import { describe, expect, it } from 'vitest';
import type { PrintUnit } from '../../../state/project';
import { isRigidPlateMove, keepsBuild, keptBuild, turnsAboutVertical } from './rigidMove';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u', name: 'U', source: {}, transform: { position: [0, 3, 0], rotation: [0.3, 0.2, 0.1] }, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {},
  denture: { policy: {} }, supports: { kind: 'live', data: {} }, ...over }) as unknown as PrintUnit;

describe('isRigidPlateMove', () => {
  it('a slide over the plate is one', () => {
    const before = unit();
    expect(isRigidPlateMove(before, { ...before, transform: { position: [40, 3, -12], rotation: [...before.transform.rotation] } })).toBe(true);
  });
  it('a lift or sink is not', () => {
    const before = unit();
    expect(isRigidPlateMove(before, { ...before, transform: { position: [0, 4, 0], rotation: [...before.transform.rotation] } })).toBe(false);
  });
  it('any other change to the unit is not', () => {
    const before = unit();
    expect(isRigidPlateMove(before, { ...before, transform: { position: [5, 3, 0], rotation: [...before.transform.rotation] }, settings: { raftEnabled: false } })).toBe(false);
    expect(isRigidPlateMove(before, { ...before, transform: { position: [5, 3, 0], rotation: [...before.transform.rotation] }, deleted: ['a'] })).toBe(false);
  });
  it('writing out the default ID label is not a change to the build; another label is', () => {
    const before = unit({ settings: { labelText: '' } as never });
    const same = { ...before, settings: { labelText: 'X' } } as PrintUnit;
    expect(keepsBuild(before, same)).toBe(true);
    expect(keepsBuild(before, { ...before, settings: { labelText: 'AB' } } as PrintUnit)).toBe(false);
    expect(keepsBuild(before, { ...before, settings: { labelText: 'X', raftEnabled: false } } as PrintUnit)).toBe(false);
  });
  it('a unit without built supports or a denture policy is not', () => {
    const bare = unit({ supports: undefined as never });
    expect(isRigidPlateMove(bare, { ...bare, transform: { position: [5, 3, 0], rotation: [...bare.transform.rotation] } })).toBe(false);
  });
  it('a tilt is not, a turn about the vertical is', () => {
    expect(turnsAboutVertical([0, 0, 0], [0, 0.7, 0])).toBe(true);
    expect(turnsAboutVertical([0.4, 0, 0], [0.4, 0, 0])).toBe(true);
    expect(turnsAboutVertical([0, 0, 0], [0.2, 0, 0])).toBe(false);
    // Euler (rx, ry, rz) turned about world Y: R_y(t) * R(before); compare through the matrix, not the angles.
    const before = unit();
    expect(isRigidPlateMove(before, { ...before, transform: { position: [0, 3, 0], rotation: [0.3, 0.2, 0.2] } })).toBe(false);
  });
});

describe('keptBuild', () => {
  const before = unit();
  const slid = { ...before, transform: { position: [9, 3, 9], rotation: [...before.transform.rotation] } } as PrintUnit;
  it('hands the finished build to the moved unit', () => {
    const mesh = { tris: 1 };
    expect(keptBuild(before, slid, { unit: before, mesh })).toEqual({ unit: slid, mesh });
  });
  it('builds again when no finished build is held for the previous unit, or the change is not a slide', () => {
    expect(keptBuild(before, slid, undefined)).toBeUndefined();
    expect(keptBuild(before, slid, { unit: slid, mesh: 1 })).toBeUndefined();
    expect(keptBuild(undefined, slid, { unit: before, mesh: 1 })).toBeUndefined();
    expect(keptBuild(before, { ...slid, deleted: ['a'] }, { unit: before, mesh: 1 })).toBeUndefined();
  });
});
