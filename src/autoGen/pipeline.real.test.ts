// Copyright (c) Mixo Creative.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { filterDentalPlacement } from '@mixo-geocore/host/dental/placement';
import { orientDentalAligner } from '@mixo-geocore/host/dental/dentalOrient';
import { proposeDentalSupportRegion } from '@mixo-geocore/host/dental/dentalRegion';
import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';
import { scanDentalTilts } from '@mixo-geocore/host/dental/dentalTilt';
import { DEFAULT_PROFILE_ID } from '@mixo-geocore/host/dental/alignerProfiles';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { RECIPE_KEYS, recipeFrom, type SupportRecipe } from '../recipes/supportRecipe';
import { confirmPick } from '../dental/confirmTilt';
import { useNodeEngine, parseStl } from '../../scripts/node-engine';
import { emptyScene, identityTransform, reduceScene, type PrintScene, type PrintUnit, type SceneCommand } from '../state/project';
import { runAutoGen, type AutoGenEngine, type AutoGenHost } from './pipeline';

/**
 * THE AUTO-GEN PIPELINE ON A REAL ALIGNER SCAN, UNDER NODE.
 *
 * WHAT THIS PROVES and what it does not, said plainly, because the difference is the whole point.
 *
 * It proves the pipeline RUNS: a real customer scan goes in, and what comes out is a unit in Step
 * 3's own state - a two-contour policy, a placement, supports, and the starting label - built by the
 * same five engine calls the analysis worker makes, in the same order, with every decision taken by
 * `src/dental/stages.ts`. It also proves the run is DETERMINISTIC, which is what makes a card
 * reproducible and a regression in any stage visible as a changed tip count.
 *
 * It does NOT by itself prove parity with the editor, and no node test can: the editor's path is a
 * React hook driving screens. Parity is held by CONSTRUCTION - both paths call `stages.ts`, which is
 * why that file exists - and the end-to-end proof is the walk check that drops the same aligner
 * twice, walks one through the steps and auto-gens the other. That check lives in `scripts/walk.mjs`
 * where a browser is; this file is the half that can run in milliseconds on every commit.
 *
 * SKIPPED WHEN THE SCAN IS ABSENT. `samples` is git-ignored customer data.
 */

/*
 * `AUTOGEN_SCAN` POINTS THIS AT ANOTHER SCAN, and it earned its place the night it was added: the
 * queue failed in the BROWSER on `docs/dental-reference/reference-aligner.stl` while passing here on
 * case-001, and running this file against that exact scan is what proved the pipeline and the data
 * were both fine - which left the React host, where the bug was. One line, and it turned a guess
 * into a fork.
 */
const SCAN = resolve(process.env.AUTOGEN_SCAN ?? 'samples/case-001/aligner.stl');
const PROFILE = DEFAULT_PROFILE_ID;

/**
 * The five jobs, called exactly as `src/workers/analysisWorker.ts` calls them.
 *
 * THAT IS THE PARITY THIS FILE CAN CARRY: not a reimplementation of the worker but the same host
 * functions with the same arguments, so a change to what the worker does to a job shows up here as a
 * difference rather than as two codebases agreeing with themselves. The empty seed in `dentalPlace`
 * is the worker's own two-contour branch - a two-contour placement is filtered from nothing, never
 * from a scatter run.
 */
/**
 * The settings the LAST confirm was judged with.
 *
 * Recorded because the one defect this feature can have that nobody would notice for weeks is the
 * card naming one recipe while the supports were built from another: the scan and the confirm read
 * the resolved settings, and the placement job reads `unit.settings`, so the two can disagree in
 * silence and both look plausible on screen. There is no other way to see what the confirm was told.
 */
let judgedWith: LiveSupportSettings | undefined;

const nodeAnalysis: AutoGenEngine = {
  dentalOrient: async (_key, mesh, profile) => orientDentalAligner(mesh, profile),
  dentalTiltScan: async (_key, mesh, profile, settings) => scanDentalTilts(mesh, profile, settings, () => {}),
  dentalRegion: async (_key, mesh, profile) => proposeDentalSupportRegion(mesh, defaultDentalTuning(profile), profile),
  dentalConfirmTilt: async (_key, job, rotations) => { judgedWith = job.settings; return confirmPick(job, rotations); },
  dentalPlace: async (_key, job) => filterDentalPlacement(job, {
    points: [], regions: [], contactPositions: new Float32Array(), contactNormals: new Float32Array(),
  }),
};

/** The host under Node: `reduceScene` is the commit, and nothing ever goes stale because nothing moves. */
function nodeHost(start: PrintScene): AutoGenHost & { scene(): PrintScene } {
  let scene = start;
  return {
    engine: nodeAnalysis,
    scene: () => scene,
    commit: (commands: readonly SceneCommand[]) => {
      for (const command of commands) scene = reduceScene(scene, command);
      return scene;
    },
    live: () => true,
  };
}

const describeReal = existsSync(SCAN) ? describe : describe.skip;

describeReal('the auto-gen pipeline on a real aligner', () => {
  useNodeEngine();
  const bytes = readFileSync(SCAN);
  // The same hand-off the other real-scan tests use: a Buffer's bytes as a plain ArrayBuffer.
  const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, 'aligner.stl');
  const unit: PrintUnit = {
    id: 'a1', name: 'aligner.stl', source: mesh, transform: identityTransform,
    settings: {}, manual: [], deleted: [], zones: [], contactSettings: {},
  } as unknown as PrintUnit;
  const start = reduceScene(reduceScene(emptyScene, { type: 'unit/add', unit }), { type: 'selection/set', unitIds: ['a1'], activeUnitId: 'a1' });

  const run = async (recipe?: SupportRecipe) => {
    judgedWith = undefined;
    const host = nodeHost(start);
    const result = await runAutoGen('a1', PROFILE, host, recipe);
    // Read out explicitly: the compiler cannot see that the engine stub above assigns it.
    // Cast: the compiler cannot see that the awaited engine stub assigns this.
    const judged = judgedWith as LiveSupportSettings | undefined;
    return { result, unit: host.scene().units.find((candidate) => candidate.id === 'a1')!, judgedWith: judged };
  };

  it('leaves the model in the state Step 3 would have left it in', async () => {
    const { result, unit: finished } = await run();

    expect(result.kind, JSON.stringify(result)).toBe('done');
    if (result.kind !== 'done') return;
    expect(result.tips).toBeGreaterThan(0);
    // Every field Support Edit Mode reads, which is the whole of owner's ruling 2.
    expect(finished.dental?.kind).toBe('two-contour');
    expect(finished.placement?.points.length).toBe(result.tips);
    expect(finished.supports).toBeDefined();
    // The label Step 3 starts an aligner with, written from the pre-landing unit.
    expect(resolveSettings(finished.settings).labelText).toBe('X');
    // The hand work is empty because nobody has done any: a fresh card, not a cleared one.
    expect(finished.manual).toEqual([]);
  }, 600_000);

  it('gives the same answer twice, so a card is reproducible and a drift is visible', async () => {
    const [first, second] = [await run(), await run()];

    expect(first.result).toEqual(second.result);
    expect(first.unit.placement?.points.length).toBe(second.unit.placement?.points.length);
    // The positions, not only the count: a stage that moved every tip by a millimetre would pass a count.
    expect(Array.from(first.unit.placement!.contactPositions)).toEqual(Array.from(second.unit.placement!.contactPositions));
  }, 1_200_000);

  /*
   * THE CARD MUST NOT NAME ONE RECIPE WHILE THE SUPPORTS CAME FROM ANOTHER.
   *
   * Three readers have to agree: the print-angle scan, the confirm, and the placement job - and the
   * placement job reads `unit.settings`, which is written at ACCEPT time by `presetCommands`. That
   * function used to resolve the type's numbers itself, so with a recipe chosen the first two would
   * have judged the recipe while the supports were built from type defaults. Both look plausible.
   *
   * This asserts the agreement on a real scan, and then that a DIFFERENT recipe moves both - a test
   * that only checked one run would pass against a pipeline that ignored recipes entirely.
   */
  it('builds with the recipe it was given, in every reader of the settings', async () => {
    const thin = recipeFrom('thin', 'Thin', { ...defaultSupportSettings, pillarDiameter: 1.1 }, { treeEnabled: false, bracesEnabled: false });
    const run1 = await run(thin);

    expect(run1.result.kind, JSON.stringify(run1.result)).toBe('done');
    expect(run1.judgedWith?.pillarDiameter).toBe(1.1);
    // What the confirm judged IS what the unit ends up carrying, which is what the supports are
    // built from. Compared over the RECIPE's own keys, because `labelText` is deliberately not one
    // of them: it is per-unit and it is written after the landing, so the two differ there and must.
    const finished = resolveSettings(run1.unit.settings);
    for (const key of RECIPE_KEYS) expect(run1.judgedWith?.[key], key).toEqual(finished[key]);
    expect(finished.labelText).toBe('X');
  }, 900_000);

  it('moves with the recipe, so a test of one run cannot pass a pipeline that ignores them', async () => {
    const thick = recipeFrom('thick', 'Thick', { ...defaultSupportSettings, pillarDiameter: 2.9 }, { treeEnabled: false, bracesEnabled: false });
    const run2 = await run(thick);

    expect(run2.judgedWith?.pillarDiameter).toBe(2.9);
    expect(resolveSettings(run2.unit.settings).pillarDiameter).toBe(2.9);
  }, 900_000);
});
