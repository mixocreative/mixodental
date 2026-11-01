import { describe, expect, it } from 'vitest';
import { createSceneHistory, redoScene, undoScene, withSceneCommand } from '../../../state/history';
import { emptyScene, type PrintUnit } from '../../../state/project';
import { stepKind } from '../../../state/stepKind';
import { checksLandingFirst, isResolvable, resolvableIds, resolveCommand } from './resolvePoint';

const unit: PrintUnit = { id: 'u', name: 'd', source: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) },
  transform: { position: [0, 0, 0], rotation: [0, 0, 0] }, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {},
  denture: { policy: { kind: 'denture', profileId: 'reference-denture', lattice: true } } };

describe('resolvePoint', () => {
  it('resolves tips and lowest points, not bare islands', () => {
    expect(isResolvable({ id: 'denture-rim-44', kind: 'tip' })).toBe(true);
    expect(isResolvable({ id: 'denture-low-unreached-2', kind: 'lowest' })).toBe(true);
    expect(isResolvable({ id: 'island-7821', kind: 'island' })).toBe(false);
    expect(checksLandingFirst({ id: 'denture-low-unreached-2' })).toBe(false);
    expect(checksLandingFirst({ id: 'denture-low-3' })).toBe(true);
    expect(resolvableIds([{ id: 'a', kind: 'tip' }, { id: 'island-1', kind: 'island' }, { id: 'b', kind: 'lowest' }])).toEqual(['a', 'b']);
  });

  it('is one undoable step that adds the ids to the allow list, and redo puts it back', () => {
    let history = createSceneHistory({ ...emptyScene, units: [unit] });
    const resolve = resolveCommand(unit, ['denture-rim-44', 'denture-rim-44', 'denture-low-unreached-1'])!;
    history = withSceneCommand(history, resolve);
    expect(history.present.units[0]!.denture!.policy.modelLandingAllow).toEqual(['denture-rim-44', 'denture-low-unreached-1']);
    expect(stepKind(history.past.at(-1), history.present)).toBe('dentureChange');
    history = undoScene(history);
    expect(history.present.units[0]!.denture!.policy.modelLandingAllow).toBeUndefined();
    history = redoScene(history);
    expect(history.present.units[0]!.denture!.policy.modelLandingAllow).toEqual(['denture-rim-44', 'denture-low-unreached-1']);
  });

  it('adds nothing for an id already allowed or a unit that is no denture', () => {
    const allowed = { ...unit, denture: { policy: { ...unit.denture!.policy, modelLandingAllow: ['a'] } } };
    expect(resolveCommand(allowed, ['a'])).toBeUndefined();
    expect(resolveCommand({ ...unit, denture: undefined }, ['a'])).toBeUndefined();
  });
});
