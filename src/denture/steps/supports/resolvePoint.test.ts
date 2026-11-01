import { describe, expect, it } from 'vitest';
import { createSceneHistory, redoScene, undoScene, withSceneCommand } from '../../../state/history';
import { emptyScene, type PrintUnit } from '../../../state/project';
import { stepKind } from '../../../state/stepKind';
import { checksLandingFirst, isResolvable, resolvableIds, resolveCommand } from './resolvePoint';

const unit: PrintUnit = { id: 'u', name: 'd', source: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) },
  transform: { position: [0, 0, 0], rotation: [0, 0, 0] }, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {},
  denture: { policy: { kind: 'denture', profileId: 'reference-denture', lattice: true } } };

describe('resolvePoint', () => {
  it('resolves tips, lowest points and bare islands, not an island the engine refused (it faces sideways)', () => {
    const sideways = "island's lowest point faces sideways: 82 degrees from straight down (60 allowed), no tip can stand there";
    expect(isResolvable({ kind: 'tip', reason: 'x' })).toBe(true);
    expect(isResolvable({ kind: 'lowest', reason: 'x' })).toBe(true);
    expect(isResolvable({ kind: 'island', reason: 'no support from the plate reaches this island' })).toBe(true);
    expect(isResolvable({ kind: 'island', reason: sideways })).toBe(false);
    // A point with no tip yet (unplaced lowest point, bare island) goes on the list without the edit-path check.
    expect(checksLandingFirst({ id: 'denture-low-unreached-2' })).toBe(false);
    expect(checksLandingFirst({ id: 'island-7821' })).toBe(false);
    expect(checksLandingFirst({ id: 'denture-low-3' })).toBe(true);
    expect(checksLandingFirst({ id: 'denture-island-3' })).toBe(true);
    expect(resolvableIds([{ id: 'a', kind: 'tip', reason: 'x' }, { id: 'island-1', kind: 'island', reason: 'x' }, { id: 'island-2', kind: 'island', reason: sideways }, { id: 'b', kind: 'lowest', reason: 'x' }]))
      .toEqual(['a', 'island-1', 'b']);
  });

  it('resolves a bare island with the same undoable command', () => {
    let history = createSceneHistory({ ...emptyScene, units: [unit] });
    history = withSceneCommand(history, resolveCommand(unit, ['island-7821'])!);
    expect(history.present.units[0]!.denture!.policy.modelLandingAllow).toEqual(['island-7821']);
    history = undoScene(history);
    expect(history.present.units[0]!.denture!.policy.modelLandingAllow).toBeUndefined();
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
