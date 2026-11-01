import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { createSceneHistory, undoScene, withSceneCommand } from '../state/history';
import { emptyScene, type PrintScene, type PrintUnit } from '../state/project';
import { arrangePlateCases, editedCases, footprintKey, footprintKeys, plateFootprints } from './plateLayout';

/** A 20 x 10 mm box on the plate (x, z extent), so its box footprint is known. */
const box: TriangleMesh = {
  positions: new Float32Array([-10, 0, -5, 10, 0, -5, 10, 5, -5, -10, 5, 5, 10, 0, 5, -10, 0, 5]),
  indices: new Uint32Array([0, 1, 2, 3, 4, 5]),
};
const unitAt = (id: string, x: number, z: number): PrintUnit => ({
  id, name: id, source: box, transform: { position: [x, 0, z], rotation: [0, 0, 0] }, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {},
});
const square = (half: number): Array<Array<[number, number]>> => [[[-half, -half], [half, -half], [half, half], [-half, half]]];
const meshWith = (footprint: Array<Array<[number, number]>>): GeneratedSupportMesh => ({ positions: new Float32Array(), indices: new Uint32Array(), parts: [], components: [], dropped: [], footprint });
const PLATE = { widthMm: 211.68, depthMm: 118.37 };
const positionOf = (scene: PrintScene, id: string) => scene.units.find((unit) => unit.id === id)!.transform.position;

describe('plate layout (Round C arrange, app side)', () => {
  it('packs by the build outline only while the build still describes the unit', () => {
    const unit = { ...unitAt('a', 0, 0), supports: { kind: 'x', data: {} } };
    const built = new Map([['a', { unit, mesh: meshWith(square(8)) }]]);
    expect(plateFootprints([unit], built).get('a')).toEqual(square(8));
    // Moved: the outline is relative to the plate position, so it still holds.
    expect(plateFootprints([{ ...unit, transform: { ...unit.transform, position: [30, 0, 0] } }], built).has('a')).toBe(true);
    // Turned, or new supports: the old outline no longer describes it.
    expect(plateFootprints([{ ...unit, transform: { ...unit.transform, rotation: [0, 1, 0] } }], built).has('a')).toBe(false);
    expect(plateFootprints([{ ...unit, supports: { kind: 'x', data: {} } }], built).has('a')).toBe(false);
  });

  it('keys footprints to 0.1 mm and finds the edited and the new cases', () => {
    expect(footprintKey(square(8))).toBe(footprintKey([[[-8.01, -8], [8, -7.99], [8, 8], [-8, 8]]]));
    expect(footprintKey(square(8))).not.toBe(footprintKey(square(9)));
    expect(editedCases(new Map([['a', 'k1'], ['b', 'k2']]), new Map([['a', 'k1'], ['b', 'k3'], ['c', 'k4']]))).toEqual(['b', 'c']);
    // A box footprint is relative to the unit's position: moving a case is not an edit.
    expect(footprintKeys([unitAt('a', 0, 0)], new Map()).get('a')).toBe(footprintKeys([unitAt('a', 50, 20)], new Map()).get('a'));
  });

  it('Arrange plate packs overlapping cases apart, inside the plate, as one undoable step', () => {
    const units = [unitAt('a', 0, 0), unitAt('b', 1, 1), unitAt('c', 2, 2)];
    const result = arrangePlateCases(units, new Map(units.map((unit) => [unit.id, square(12)])), PLATE);
    expect(result.unplaced).toEqual([]);
    expect(result.command?.type).toBe('batch');
    let history = createSceneHistory(emptyScene);
    for (const unit of units) history = withSceneCommand(history, { type: 'unit/add', unit });
    const arranged = withSceneCommand(history, result.command!);
    expect(arranged.past.length).toBe(history.past.length + 1);
    const spots = units.map((unit) => positionOf(arranged.present, unit.id));
    for (let i = 0; i < spots.length; i += 1) for (let j = i + 1; j < spots.length; j += 1) {
      const [a, b] = [spots[i]!, spots[j]!];
      // 24 mm squares, at least the 6 mm gap apart along one axis.
      expect(Math.max(Math.abs(a[0] - b[0]), Math.abs(a[2] - b[2]))).toBeGreaterThanOrEqual(24 + 6 - 1e-6);
    }
    for (const [x, , z] of spots) {
      expect(Math.abs(x) + 12).toBeLessThanOrEqual(PLATE.widthMm / 2 + 1e-6);
      expect(Math.abs(z) + 12).toBeLessThanOrEqual(PLATE.depthMm / 2 + 1e-6);
    }
    // Undo puts every case back where it stood.
    const undone = undoScene(arranged);
    for (const unit of units) expect(positionOf(undone.present, unit.id)).toEqual(unit.transform.position);
  });

  it('after an edit only the edited case moves, and only when it now overlaps', () => {
    const units = [unitAt('a', -30, 0), unitAt('b', 0, 0), unitAt('c', 60, 0)];
    const small = new Map(units.map((unit) => [unit.id, square(8)]));
    expect(arrangePlateCases(units, small, PLATE, ['b']).command).toBeUndefined();
    // b's supports grew: it now comes within the gap of a.
    const result = arrangePlateCases(units, new Map([...small, ['b', square(20)]]), PLATE, ['b']);
    expect(result.moved).toEqual(['b']);
    const commands = result.command?.type === 'batch' ? result.command.commands : [];
    expect(commands.map((command) => command.type === 'transform/set' && command.unitId)).toEqual(['b']);
  });

  it('reports a case too big for the plate as unplaced and leaves it where it is', () => {
    const result = arrangePlateCases([unitAt('a', 0, 0)], new Map([['a', square(200)]]), PLATE);
    expect(result.unplaced).toEqual(['a']);
    expect(result.command).toBeUndefined();
  });
});
