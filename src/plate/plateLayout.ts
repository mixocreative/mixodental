import { arrangeOnPlate, boxFootprint, type PlateFootprint, type PlateSize } from '@mixo-geocore/editing/arrange';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { PrintUnit, SceneCommand } from '../state/project';

/*
 * Plate auto-arrange, app side (Round C, engine 53): which outline each case is packed by, which cases changed
 * since the plate was laid out, and the packing calls as scene commands. The packing itself is the engine's
 * (`editing/arrange.ts arrangeOnPlate`); this module only feeds it and reads its answer.
 */

/** The builds the app holds: the unit version each mesh was built from. */
type Builds = ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh }>;

const sameRotation = (a: PrintUnit, b: PrintUnit) => a.transform.rotation.every((value, axis) => value === b.transform.rotation[axis]);

/**
 * The build outline of every unit whose latest build still describes it: same supports and same turn (a move only
 * shifts the plate position, which the outline is relative to). Others are absent: `arrangeOnPlate` packs them by box.
 */
export function plateFootprints(units: readonly PrintUnit[], built: Builds): Map<string, PlateFootprint> {
  const out = new Map<string, PlateFootprint>();
  for (const unit of units) {
    const entry = built.get(unit.id);
    const footprint = entry?.mesh.footprint;
    if (!entry || !footprint?.length || entry.unit.supports !== unit.supports || !sameRotation(entry.unit, unit)) continue;
    out.set(unit.id, footprint);
  }
  return out;
}

/** A footprint as a key, to 0.1 mm (float noise between two builds of the same case is not a change). */
export function footprintKey(footprint: PlateFootprint): string {
  return footprint.map((loop) => loop.map(([x, z]) => `${Math.round(x * 10)},${Math.round(z * 10)}`).join(' ')).join('|');
}

/** Every unit's footprint key: its build outline, else its box (both relative to its plate position, so a move changes neither). */
export function footprintKeys(units: readonly PrintUnit[], footprints: ReadonlyMap<string, PlateFootprint>): Map<string, string> {
  return new Map(units.map((unit) => [unit.id, footprintKey(footprints.get(unit.id) ?? boxFootprint(unit))]));
}

/** The units whose footprint changed since `before` (an edit, a rebuild with other settings) or that are new on the plate. */
export function editedCases(before: ReadonlyMap<string, string>, now: ReadonlyMap<string, string>): string[] {
  return [...now].filter(([id, key]) => before.get(id) !== key).map(([id]) => id);
}

/** What one arrange did: the moves as one undoable command (absent: nothing moved), and the cases it could not place. */
export interface PlateArrangement {
  command?: SceneCommand;
  moved: string[];
  unplaced: string[];
  conflicts: string[];
}

const withMoves = (units: readonly PrintUnit[], commands: readonly SceneCommand[]): PrintUnit[] => units.map((unit) => {
  const move = commands.find((command) => command.type === 'transform/set' && command.unitId === unit.id);
  return move?.type === 'transform/set' ? { ...unit, transform: move.transform } : unit;
});

/**
 * "Arrange plate": every case packed afresh on `plate` (`full`), or, with `edited`, the incremental re-pack of
 * Round C: each edited case in turn with every other case frozen, so only an edited case that now overlaps moves.
 */
export function arrangePlateCases(units: readonly PrintUnit[], footprints: ReadonlyMap<string, PlateFootprint>, plate: PlateSize,
  edited?: readonly string[]): PlateArrangement {
  const runs = edited === undefined ? [{ full: true }] : edited.map((id) => ({ edited: id }));
  let current = units;
  const commands: SceneCommand[] = [];
  const moved = new Set<string>();
  const unplaced = new Set<string>();
  const conflicts = new Set<string>();
  for (const options of runs) {
    const result = arrangeOnPlate(current, footprints, plate, options);
    commands.push(...(result.commands as SceneCommand[]));
    current = withMoves(current, result.commands as SceneCommand[]);
    result.moved.forEach((id) => moved.add(id));
    result.unplaced.forEach((id) => unplaced.add(id));
    result.conflicts.forEach((id) => conflicts.add(id));
  }
  // One transform per case: a later run's move of the same case replaces the earlier one.
  const last = new Map<string, SceneCommand>();
  for (const command of commands) if (command.type === 'transform/set') last.set(command.unitId, command);
  return {
    ...(last.size > 0 ? { command: { type: 'batch', commands: [...last.values()] } } : {}),
    moved: [...moved], unplaced: [...unplaced], conflicts: [...conflicts],
  };
}
