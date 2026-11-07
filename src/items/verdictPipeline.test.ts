import { describe, expect, it } from 'vitest';
import { diagnose_mesh, repair_mesh } from '../../vendor/mixo-geocore/pkg-node/mixo_geometry_wasm.js';
import { diagnoseImported } from '../workers/prepareImport';
import { placeImportedUnits } from '../state/import';
import { reduceScene, emptyScene, serializeScene, deserializeScene } from '../state/project';
import { verdictOfDiagnosis } from './rowState';
import { rowSentence } from './rowText';
import { translateMessage } from '../i18n';

/*
 * THE CHAIN, JOINED. Every link of the verdict pipeline had a test and the chain had none: deleting
 * the one line in `placeImportedUnits` that carries the verdict onto the unit left all 1352 tests
 * green. A feature whose removal no test notices is a feature with no test, however many tests its
 * parts have.
 *
 * This runs the real engine, the real unit construction, a real save and reload, and ends at the
 * words an operator reads. It fails if ANY link is cut.
 */

const engine = { diagnose_mesh, repair_mesh };
const mesh = (positions: number[], indices: number[]) =>
  ({ positions: new Float32Array(positions), indices: new Uint32Array(indices) });

/** A closed tetrahedron: watertight, nothing wrong with it. */
const SOUND = mesh([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3]);
/** Three triangles sharing one edge: the non-manifold case 8 of the 18 real scans land in. */
const DEFECTIVE = mesh([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, -1, 0], [0, 1, 2, 0, 1, 3, 0, 1, 4]);

const place = (name: string, source: typeof SOUND) => {
  const diagnosis = diagnoseImported(source, engine);
  return placeImportedUnits([{ name, mesh: source, diagnosis }], [], { lift: 0, createId: () => `unit-${name}` });
};

describe('engine → worker → unit → save → row, end to end', () => {
  it('carries a sound mesh all the way to "Ready to print."', () => {
    const [unit] = place('sound', SOUND);

    // The link the mutation test proved was untested: the unit must actually carry it.
    expect(unit!.diagnosis).toBeDefined();
    const said = rowSentence(verdictOfDiagnosis(unit!.diagnosis!));
    expect(translateMessage(said!)).toBe('Ready to print.');
  });

  /*
   * THIS FIXTURE HAS BOTH DEFECTS, and that is worth knowing rather than engineering around. A fan of
   * three triangles sharing one edge is non-manifold AND has open outer edges - the engine reports 6
   * boundary loops and a non-manifold count. `verdictOfDiagnosis` tests `boundaryLoops > 0` BEFORE
   * the non-manifold case, so the row says holes and says nothing about the shared edges.
   *
   * That ordering is deliberate and, on the measured corpus, never bites: step 5 found ZERO open rims
   * across 18 real scans, so a scan that is not watertight is non-manifold and nothing else. A file
   * with both would be told half the truth, which is a real limit of a one-sentence row and is
   * recorded here rather than hidden by picking a tidier fixture.
   */
  it('carries a defective mesh to a sentence that names a defect and offers no repair', () => {
    const [unit] = place('defective', DEFECTIVE);

    expect(unit!.diagnosis!.watertight).toBe(false);
    // Both facts reach the unit, even though the row states only the first.
    expect(unit!.diagnosis!.boundaryLoops).toBeGreaterThan(0);
    expect(unit!.diagnosis!.nonManifoldEdges).toBeGreaterThan(0);

    const said = translateMessage(rowSentence(verdictOfDiagnosis(unit!.diagnosis!))!);
    expect(said).toMatch(/open edge loops/);
    expect(said).toContain('It can still be printed, but check the result.');
    // And it never offers a repair this release cannot do.
    expect(said).not.toMatch(/repair|fix/i);
  });

  it('survives a save and reload, and still says the same thing', () => {
    const [unit] = place('defective', DEFECTIVE);
    const scene = reduceScene(emptyScene, { type: 'unit/add', unit: unit! });
    const reopened = deserializeScene(serializeScene(scene));

    const before = translateMessage(rowSentence(verdictOfDiagnosis(scene.units[0]!.diagnosis!))!);
    const after = translateMessage(rowSentence(verdictOfDiagnosis(reopened.units[0]!.diagnosis!))!);
    expect(after).toBe(before);
  });

  /*
   * THE STALENESS GATE, end to end. A verdict is dropped when it no longer describes the mesh it is
   * attached to - the check that will make repair safe to write. Here the unit keeps the defective
   * verdict but is given the sound mesh, which has a different triangle count.
   */
  it('drops a verdict that no longer matches its mesh, so no row can state a stale fact', () => {
    const [defective] = place('defective', DEFECTIVE);
    const swapped = { ...defective!, source: SOUND };
    const scene = reduceScene(emptyScene, { type: 'unit/add', unit: swapped });

    expect(scene.units[0]).not.toHaveProperty('diagnosis');
  });
});
