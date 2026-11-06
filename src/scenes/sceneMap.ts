/*
 * THE SCENES THIS APP HAS, AND WHICH ONES ARE SWITCHED ON.
 *
 * Three, and they were already three - the app has always had a full-screen start, a per-object flow
 * of steps, and a workspace. What it did not have was anywhere that said so. The start screens lived
 * as a `StartScreenId` in a component, the steps as a `DentalStage` in the session, and the
 * workspace as `mode: 'off'`, which is not a name. So "which scenes are there" could only be
 * answered by reading three unrelated files, and "turn that one off" had no single place to do it.
 *
 * This is that place. A scene is a WHOLE SCREEN the operator is looking at - not a mode, not a tool,
 * not a step. Steps belong to a scene; Support Edit Mode and no-support zones are modes of the
 * workspace, not scenes of their own.
 *
 * WHY IT IS DATA AND NOT PROSE. Switching a scene off has consequences that nobody can hold in their
 * head: close the workspace and the Export buttons in its right panel go with it, and so does the way
 * in for a saved project. A table can carry those consequences next to the flag, and a test can
 * refuse a flag that leaves the operator nowhere to go. A comment cannot do either.
 *
 * Pure - no React, no DOM.
 */

import type { EditMode } from '@mixo-geocore/editing/types';

/** The three scenes. */
export type SceneId = 'start' | 'object' | 'bench';

/** Every scene, in the order an operator meets them. */
export const SCENE_IDS: readonly SceneId[] = ['start', 'object', 'bench'];

/**
 * Whether a scene happens once per visit to the app, or once per object being supported.
 *
 * THIS IS THE FIELD THE PLANNED MULTI-OBJECT WORKFLOW CHANGES. Today `start` is a `run` scene: you
 * choose one task and one type, once, and everything after that is about one object at a time. When
 * the app grows to several imported files - preview them, choose per file what supports it gets and
 * whether to detect its orientation - `start` becomes an `object` scene and the loop widens by one.
 * Nothing else in this table has to move, which is the whole reason the field exists.
 */
export type SceneScope = 'run' | 'object';

/** Where control goes when a scene is switched off, and what goes dark with it. */
export interface SceneFallback {
  /** The scene the operator lands on instead. Must itself be enabled. */
  readonly goTo: SceneId;
  /** Why this is the right landing place. */
  readonly why: string;
  /** What is ONLY reachable in the switched-off scene, and is therefore unreachable too. */
  readonly carries: readonly string[];
  /** What still reaches the switched-off scene anyway, and must keep working. */
  readonly except: readonly string[];
}

/** One scene: what it is, what state puts you in it, and whether it is switched on. */
export interface SceneSpec {
  readonly id: SceneId;
  /** The name to use when talking about it. */
  readonly title: string;
  /** What the operator is doing there. */
  readonly purpose: string;
  /** What state puts you in it - the answer to "how do I know I am here". */
  readonly owns: string;
  readonly scope: SceneScope;
  /** Whether the operator passes through it more than once in a visit. */
  readonly repeats: boolean;
  /** Switched on. A scene that is off is never rendered and never navigated to. */
  readonly enabled: boolean;
  /** Required when `enabled` is false; absent when it is true. */
  readonly fallback?: SceneFallback;
  /**
   * The ways in that remain, for a scene the step flow no longer hands back to. Listing them is the
   * check against switching something off and finding out later that it was the only door to half
   * the app - which is exactly what nearly happened here; see README.
   */
  readonly doors?: readonly string[];
}

/**
 * THE MAP. All three scenes are on; what changed is the ROUTE between two of them - see `FLOW_END`.
 */
export const SCENES: Readonly<Record<SceneId, SceneSpec>> = Object.freeze({
  start: {
    id: 'start', title: 'Start', scope: 'run', repeats: false, enabled: true,
    purpose: 'Choosing what is going to get supports: the task, then the aligner type, then the file.',
    owns: 'A `StartScreenId` is set (`task`, `type` or `file`). It renders INSTEAD of the workspace, full screen.',
  },
  object: {
    id: 'object', title: 'Object', scope: 'object', repeats: true, enabled: true,
    purpose: 'One object, detected and then given supports: orientation and print angle (Step 1), the support area (Step 2), the supports themselves (Step 3). The rim drawing is a detour off Step 1, not a step.',
    owns: '`mode: ‘dental’`, and `dentalStage` says which step. Repeats per object: Add another aligner re-enters it.',
  },
  bench: {
    id: 'bench', title: 'Bench', scope: 'run', repeats: false, enabled: true,
    purpose: 'The workspace: the plate, the object list, the settings, the five export buttons. Its modes are resting, Support Edit Mode and no-support zones.',
    owns: '`mode` is `off`, `edit` or `zones` with no start screen up. `onBench()` is the resting one of the three.',
    doors: [
      'The start screen’s Any model key, for work with no flow at all.',
      'Opening a saved project, which restores a plate of finished work.',
    ],
  },
});

/**
 * WHERE THE STEP FLOW ENDS, and the thing the operator actually asked to change.
 *
 * `bench` was the old answer: OK at the end of Step 3 handed back the workspace, and the status line
 * then told the operator in as many words to go and press Export STL in its right panel. So the flow
 * ended by sending them somewhere else to finish.
 *
 * `export` is the new one: Step 3 writes the file itself and the flow has an end of its own.
 *
 * IT GOVERNS THE END OF THE LAST STEP AND NOTHING ELSE. `dental.exit` was routed through it too and
 * the walk caught that: Exit promises the aligner stays on the plate, which is a promise about the
 * workspace, so Exit still lands there whatever this says.
 *
 * THIS IS A ROUTE, NOT A SWITCH ON THE BENCH, and the difference matters. Switching the bench scene
 * off outright would also take away Support Edit Mode, no-support zones, the plate panel, Save
 * project and all five exports - a whole half of the app that has nothing to do with the dental
 * flow, reached from the start screen by Any model. The flow not ending there costs none of that.
 * `SceneSpec.doors` records the ways in that are left.
 */
export type FlowEnd = 'export' | 'bench';

/** Set to `'bench'` to hand the operator back the workspace at the end of Step 3, as it used to. */
export const FLOW_END: FlowEnd = 'export';

/** Whether the step flow ends at its own export rather than handing back the bench. */
export const flowEndsAtExport = (): boolean => FLOW_END === 'export';

/** Every scene that is switched on, in order. */
export const enabledScenes = (): readonly SceneSpec[] => SCENE_IDS.map((id) => SCENES[id]).filter((scene) => scene.enabled);

/** Whether a scene is switched on. The one question a call site should ask. */
export const sceneEnabled = (id: SceneId): boolean => SCENES[id].enabled;

/**
 * Where a scene's work ends up: itself when it is on, its fallback when it is off. Use this instead
 * of naming a destination at the call site, so one flag moves every route at once.
 */
export const sceneOrFallback = (id: SceneId): SceneId => (SCENES[id].enabled ? id : SCENES[id].fallback!.goTo);

/** Which scene the app is showing. A start screen wins: it covers the workspace. */
export function sceneOf(state: { readonly startScreen: string | null; readonly mode: EditMode }): SceneId {
  if (state.startScreen !== null) return 'start';
  return state.mode === 'dental' ? 'object' : 'bench';
}
