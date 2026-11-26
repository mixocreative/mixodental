// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE_ID } from '@mixo-geocore/host/dental/alignerProfiles';
import { runAutoGen, type AutoGenEngine, type AutoGenHost, type AutoGenResult } from './pipeline';
import { emptyScene, identityTransform, reduceScene, type PrintScene, type PrintUnit, type SceneCommand } from '../state/project';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';

/**
 * EVERY WAY THE PIPELINE CAN STOP, WITHOUT A SCAN AND WITHOUT AN ENGINE.
 *
 * WHY THIS FILE EXISTS BESIDE `pipeline.real.test.ts`: that one is `describe.skip` when
 * `samples` is absent, which it is on a fresh clone and on CI - so the pipeline's ONLY
 * tests were skipped and the suite stayed green. A detector that examined nothing and printed the
 * same clean line either way is this project's own definition of a silent death, and the pipeline
 * is the piece that generates supports with nobody watching.
 *
 * It also covered only the DONE path. Nine stops decide what an operator is told when a model
 * cannot be generated, and not one of them had a test - while `AutoGenEngine` is an injected
 * interface, so every one of them is reachable in milliseconds.
 */

const mesh = {
  positions: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 0, 0, 10]),
  indices: new Uint32Array([0, 1, 2, 0, 1, 3]),
};

const unit = (over: Partial<PrintUnit> = {}): PrintUnit => ({
  id: 'a1', name: 'a.stl', source: mesh, transform: identityTransform,
  settings: {}, manual: [], deleted: [], zones: [], contactSettings: {}, ...over,
} as unknown as PrintUnit);

/*
 * A RIM AND A REGION THE REDUCER WILL ACCEPT. `cloneDentalPolicy` validates both against the mesh -
 * typed arrays, a visibility mask of `resolution ** 2`, one allowed-face byte per triangle, edge
 * lists in pairs - and it is right to: a policy is what the engine builds supports from. Stubbing
 * them loosely only moves the failure to the reducer, which is where this test first failed.
 */
const rim = {
  boundaryKind: 'lower-edge-loop',
  points: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
  openingDirection: [0, -1, 0], centroid: [0, 0, 0], tangent: [1, 0, 0], bitangent: [0, 0, 1],
  visibilityMask: new Uint8Array([1, 0, 1, 1]), visibilityResolution: 2,
  visibilityMin: [-1, -1], visibilityMax: [1, 1],
};

/** An engine answer with a rim, a pose and nothing to doubt. */
const oriented = (over: Partial<Extract<DentalOrientation, { kind: 'oriented' }>> = {}): DentalOrientation => ({
  kind: 'oriented',
  proposal: { kind: 'proposal', rim, diagnostics: { confidence: 1, floorOffsetRatio: 0.1, axialVarianceRatio: 0.1, crossCheck: 'agrees' } } as never,
  rotation: [0, 0, 0],
  opening: 'present', meshOk: true, matchesProfile: true, arch: 'ring',
  ...over,
});

// One allowed-face byte per triangle of `mesh` (two), and edge lists the validator will take.
const region = {
  kind: 'proposal',
  allowedFaces: new Uint8Array([1, 1]),
  outerEdges: new Uint32Array([0, 1, 1, 2, 2, 0]),
  outerRidgeEdges: new Uint32Array([]),
  outerConnectorEdges: new Uint32Array([]),
  openingEdges: new Uint32Array([0, 1, 1, 3, 3, 0]),
  diagnostics: { regionFaces: [1, 1], connectorLengths: [0, 0] },
} as never;
const placement = (points: number) => ({
  points: Array.from({ length: points }, (_, at) => ({ id: `p${at}`, regionId: 0, position: [0, 0, 0], normal: [0, 1, 0], source: 'interior' })),
  regions: [], contactPositions: new Float32Array(points * 3), contactNormals: new Float32Array(points * 3),
} as never);

/** The five jobs, each answering whatever this test needs; anything not overridden succeeds. */
const engineOf = (over: Partial<Record<keyof AutoGenEngine, unknown>> = {}): AutoGenEngine => ({
  dentalOrient: async () => oriented(),
  dentalTiltScan: async () => ({ kind: 'scan', rows: [{ rotation: [0, 0, 0], tiltDeg: 0 }], order: [0] }),
  dentalRegion: async () => region,
  dentalConfirmTilt: async () => ({ confirmed: 0 }),
  dentalPlace: async () => placement(3),
  ...over,
} as unknown as AutoGenEngine);

/** A host over a plain scene: the reducer is the commit, and nothing goes stale unless asked. */
function hostOf(engine: AutoGenEngine, start: PrintScene, live = true): AutoGenHost & { scene(): PrintScene } {
  let scene = start;
  return {
    engine,
    scene: () => scene,
    commit: (commands: readonly SceneCommand[]) => {
      for (const command of commands) scene = reduceScene(scene, command);
      return scene;
    },
    live: () => live,
  };
}

const start = reduceScene(emptyScene, { type: 'unit/add', unit: unit() });
const run = (over?: Partial<Record<keyof AutoGenEngine, unknown>>, live = true): Promise<AutoGenResult> =>
  runAutoGen('a1', DEFAULT_PROFILE_ID, hostOf(engineOf(over), start, live));

const stopOf = (result: AutoGenResult) => (result.kind === 'stopped' ? `${result.stop.at}/${result.stop.because}` : 'done');

describe('the pipeline finishes', () => {
  it('lands the supports, and says how many tips it placed', async () => {
    const result = await run();

    expect(stopOf(result)).toBe('done');
    if (result.kind === 'done') expect(result.tips).toBe(3);
  });

  it('writes the policy, the placement and the starting label onto the model', async () => {
    const host = hostOf(engineOf(), start);
    await runAutoGen('a1', DEFAULT_PROFILE_ID, host);
    const finished = host.scene().units[0]!;

    expect(finished.dental?.kind).toBe('two-contour');
    expect(finished.placement?.points).toHaveLength(3);
    expect(finished.supports).toBeDefined();
  });
});

/**
 * EVERY STOP SAYS WHERE IT STOPPED, because the step is the only part an operator can act on. A
 * rejected orient reported as "supports failed" sends them to the wrong screen.
 */
describe('every way it can stop', () => {
  it('stops at ORIENT when the model has gone', async () => {
    expect(stopOf(await runAutoGen('ghost', DEFAULT_PROFILE_ID, hostOf(engineOf(), start)))).toBe('orient/gone');
  });

  it('stops at ORIENT when the check could not run, whether it rejected or answered nothing', async () => {
    expect(stopOf(await run({ dentalOrient: async () => { throw new Error('worker gone'); } }))).toBe('orient/failed');
    expect(stopOf(await run({ dentalOrient: async () => undefined }))).toBe('orient/failed');
  });

  it('stops at ORIENT with NO RIM, which is a drawing job rather than a queue job', async () => {
    expect(stopOf(await run({ dentalOrient: async () => ({ kind: 'failed', reason: 'no-cavity', meshOk: true }) }))).toBe('orient/no-rim');
  });

  /*
   * THE FRESH ANSWER IS JUDGED AGAIN HERE, not taken from the deck's. The card was eligible because
   * the deck's detection said Ready; this check is seconds old and may disagree, and a model whose
   * pose the engine cannot decide must not be generated on the strength of an older yes.
   */
  it('stops at ORIENT on every doubt the engine reports, even though the card was eligible', async () => {
    expect(stopOf(await run({ dentalOrient: async () => oriented({ rotation: undefined }) }))).toBe('orient/needs-attention');
    expect(stopOf(await run({ dentalOrient: async () => oriented({ matchesProfile: false }) }))).toBe('orient/needs-attention');
    expect(stopOf(await run({ dentalOrient: async () => oriented({ meshOk: false }) }))).toBe('orient/needs-attention');
    expect(stopOf(await run({ dentalOrient: async () => oriented({ opening: 'ambiguous' }) }))).toBe('orient/needs-attention');
  });

  it('stops at AREA when the detector could not run, and when it found none', async () => {
    expect(stopOf(await run({ dentalRegion: async () => { throw new Error('worker gone'); } }))).toBe('area/failed');
    expect(stopOf(await run({ dentalRegion: async () => undefined }))).toBe('area/failed');
    expect(stopOf(await run({ dentalRegion: async () => ({ kind: 'inconclusive', reason: 'no-area' }) }))).toBe('area/no-area');
  });

  it('stops at SUPPORTS when the placement could not run, and when it placed nothing', async () => {
    expect(stopOf(await run({ dentalPlace: async () => { throw new Error('worker gone'); } }))).toBe('supports/failed');
    expect(stopOf(await run({ dentalPlace: async () => placement(0) }))).toBe('supports/no-tips');
  });

  it('stops when the operator has walked away, at whatever step it next asks', async () => {
    expect(stopOf(await run({}, false))).toBe('orient/gone');
  });
});

/**
 * A SCAN THAT DOES NOT RUN IS NOT A FAILURE: the step screens show the step with no slider and go on
 * with the orientation they have, so stopping here would refuse models the editor accepts.
 */
describe('the print-angle check', () => {
  it('generates anyway when the scan could not run', async () => {
    expect(stopOf(await run({ dentalTiltScan: async () => { throw new Error('worker gone'); } }))).toBe('done');
    expect(stopOf(await run({ dentalTiltScan: async () => ({ kind: 'failed', reason: 'x' }) }))).toBe('done');
  });

  /*
   * ITS TWO BAD ANSWERS ARE NOT THE SAME ANSWER, and collapsing them is how the one place the app
   * learns its central claim failed for a model went quiet. A REJECTION is "the check could not
   * run"; a result with no `confirmed` is "it ran and NONE of the tried angles held".
   */
  it('tells a check that could not run from one where no angle held', async () => {
    const failed = await run({ dentalConfirmTilt: async () => { throw new Error('worker gone'); } });
    const noneHeld = await run({ dentalConfirmTilt: async () => ({}) });

    expect(failed.kind === 'done' && failed.angleCheck).toBe('failed');
    expect(noneHeld.kind === 'done' && noneHeld.angleCheck).toBe('none-held');
  });

  it('reports the angle it moved to, when the check settles on a different row', async () => {
    const moved = await run({
      dentalTiltScan: async () => ({ kind: 'scan', rows: [{ rotation: [0, 0, 0], tiltDeg: 0 }, { rotation: [0.2, 0, 0], tiltDeg: 12 }], order: [0, 1] }),
      dentalConfirmTilt: async () => ({ confirmed: 1 }),
    });

    expect(moved.kind === 'done' && moved.angleMovedDeg).toBe(12);
  });
});
