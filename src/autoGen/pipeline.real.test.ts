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
 * SKIPPED WHEN THE SCAN IS ABSENT. `dentalwork/fixtures` is git-ignored customer data.
 */

const SCAN = resolve(process.env.AUTOGEN_SCAN ?? 'dentalwork/fixtures/case-001/aligner.stl');
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
const nodeAnalysis: AutoGenEngine = {
  dentalOrient: async (_key, mesh, profile) => orientDentalAligner(mesh, profile),
  dentalTiltScan: async (_key, mesh, profile, settings) => scanDentalTilts(mesh, profile, settings, () => {}),
  dentalRegion: async (_key, mesh, profile) => proposeDentalSupportRegion(mesh, defaultDentalTuning(profile), profile),
  dentalConfirmTilt: async (_key, job, rotations) => confirmPick(job, rotations),
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

  const run = async () => {
    const host = nodeHost(start);
    const result = await runAutoGen('a1', PROFILE, host);
    return { result, unit: host.scene().units.find((candidate) => candidate.id === 'a1')! };
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
});
