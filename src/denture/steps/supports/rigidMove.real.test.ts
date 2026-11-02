import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { defaultDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { arrangeCommands } from '@mixo-geocore/editing/arrange';
import { nodeEngine, parseStl } from '../../../../scripts/node-engine';
import { identityTransform, reduceScene, emptyScene, type PrintScene, type PrintUnit } from '../../../state/project';
import { buildDenture, liftedFrame, orientAndScan, scanSettingsOf } from '../../engine/dentureCore';
import { exportFiles } from '../../engine/dentureExport';
import { dentureSupportSettings } from '../../settings/dentureSupportSettings';
import { acceptCommands } from '../orient/acceptCommands';
import { dentureJobOf } from './dentureBuildJob';
import { isRigidPlateMove } from './rigidMove';

/*
 * The proof behind keep-and-move (P7b item 2). On the real denture scan #1 (dentalwork/fixtures/case-denture, read
 * in place, git-ignored customer data; skipped when absent) the two ways of arriving at the supports after OK's
 * move are compared: the rebuild the app used to run, and the build it keeps and moves with the denture.
 * They must match to 1e-5 mm in positions and exactly in counts, and so must the exported file.
 */
const DIR = resolve('dentalwork/fixtures/case-denture');
const SCAN = existsSync(DIR) ? readdirSync(DIR).filter((name) => name.toLowerCase().endsWith('.stl') && !name.includes('-sup')).sort()[1] : undefined;

/** XYZ Euler of Ry(turn) * R(rotation), so the turn is about the plate's vertical in the world. */
function turnedAboutVertical(rotation: readonly number[], turn: number): [number, number, number] {
  const [x, y, z] = rotation as [number, number, number];
  const [a, b, c, d, e, f] = [Math.cos(x), Math.sin(x), Math.cos(y), Math.sin(y), Math.cos(z), Math.sin(z)];
  const r = [[c * e, -c * f, d], [b * d * e + a * f, -b * d * f + a * e, -b * c], [-a * d * e + b * f, a * d * f + b * e, a * c]] as number[][];
  const [ct, st] = [Math.cos(turn), Math.sin(turn)];
  const m = [0, 1, 2].map((col) => [ct * r[0]![col]! + st * r[2]![col]!, r[1]![col]!, -st * r[0]![col]! + ct * r[2]![col]!]);
  // m is column-wise: m[col][row]
  const at = (row: number, col: number) => m[col]![row]!;
  const yy = Math.asin(Math.max(-1, Math.min(1, at(0, 2))));
  return Math.abs(at(0, 2)) < 0.9999999 ? [Math.atan2(-at(1, 2), at(2, 2)), yy, Math.atan2(-at(0, 1), at(0, 0))] : [Math.atan2(at(2, 1), at(1, 1)), yy, 0];
}

describe.skipIf(!SCAN)('keep-and-move equals rebuild-after-move (real denture scan #1)', () => {
  it('supports, raft and the exported file are the same either way', () => {
    const bytes = readFileSync(join(DIR, SCAN!));
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    nodeEngine.center_positions_in_place(mesh.positions);
    const settings = dentureSupportSettings('reference-denture');
    const { scan } = orientAndScan(mesh, 'reference-denture', scanSettingsOf(settings, undefined));
    if (scan.kind !== 'scan') throw new Error('scan failed');
    const frame = liftedFrame(mesh, scan.rows[0]!.rotation as Vector, settings.liftHeight, [5, -5]);
    const policy = defaultDenturePolicy('reference-denture', settings.trussEnabled);

    // The scene as Step 2 holds it: the unit added, the accepted pose, the supports' generation frame.
    const unit: PrintUnit = { id: 'd1', name: 'D', source: mesh, transform: identityTransform, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {} };
    let scene: PrintScene = reduceScene(emptyScene, { type: 'unit/add', unit });
    scene = reduceScene(scene, { type: 'selection/set', unitIds: ['d1'], activeUnitId: 'd1' });
    for (const command of acceptCommands(unit, { frame, points: [], settings, denture: { policy } })) scene = reduceScene(scene, command);
    const before = scene.units[0]!;
    expect(resolveSettings(before.settings).raftEnabled).toBeDefined();

    // OK's move: the plate arrangement (a slide), and a turn about the vertical on top of it.
    const slid = arrangeCommands([{ ...before, transform: { ...before.transform, position: [before.transform.position[0] + 30, before.transform.position[1], before.transform.position[2] - 17] } }], ['d1']);
    let moved = scene;
    for (const command of slid) moved = reduceScene(moved, command);
    moved = reduceScene(moved, { type: 'transform/set', unitId: 'd1', transform: { position: [before.transform.position[0] + 41, before.transform.position[1], before.transform.position[2] - 9], rotation: turnedAboutVertical(before.transform.rotation, 0.9) } });
    const after = moved.units[0]!;
    expect(after.transform).not.toEqual(before.transform);
    expect(isRigidPlateMove(before, after)).toBe(true);

    for (const mode of ['preview', 'export'] as const) {
      const jobBefore = dentureJobOf(before, mode, {})!;
      const jobAfter = dentureJobOf(after, mode, {})!;
      // The job a rebuild would send is the job already built.
      expect(jobAfter).toEqual(jobBefore);
      const kept = buildDenture(jobBefore);
      const rebuilt = buildDenture(jobAfter);
      expect(rebuilt.indices.length).toBe(kept.indices.length);
      expect(rebuilt.positions.length).toBe(kept.positions.length);
      expect(rebuilt.components.length).toBe(kept.components.length);
      expect(Array.from(rebuilt.indices)).toEqual(Array.from(kept.indices));
      let worst = 0;
      for (let i = 0; i < kept.positions.length; i += 1) worst = Math.max(worst, Math.abs(kept.positions[i]! - rebuilt.positions[i]!));
      expect(worst).toBeLessThan(1e-5);
      expect(kept.indices.length).toBeGreaterThan(0);
    }

    // The exported file builds its own supports from the unit as it stands: same triangles, same bytes of supports.
    const plan = [{ fileName: 'plate.stl', parts: [{ unitId: 'd1', content: 'model' as const }, { unitId: 'd1', content: 'supports' as const }] }];
    const exportOf = (unitNow: PrintUnit) => exportFiles([{ unitId: 'd1', transform: unitNow.transform, denture: dentureJobOf(unitNow, 'export', {})! }], plan, 1);
    const [keptFile, rebuiltFile] = [exportOf(before), exportOf(after)];
    const triangles = (buffer: ArrayBuffer) => (buffer.byteLength - 84) / 50;
    expect(triangles(rebuiltFile.files[0]!.buffer)).toBe(triangles(keptFile.files[0]!.buffer));
    expect(rebuiltFile.units).toEqual(keptFile.units);
  }, 600_000);
});
