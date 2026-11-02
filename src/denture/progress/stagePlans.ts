/*
 * The stages of the denture jobs that run long enough to want a staged bar (P8): Step 1's scan and the support
 * build. A stage is entered by a stage string the denture worker posts (`engine/dentureWorker.ts`, `buildDenture`);
 * `weight` is its share of the bar (the typical share of the job's time) and `typicalMs` the time the in-stage easing
 * is paced by. The engine itself posts one stage in a build (`samplingNormals`, the start of its single generate call)
 * and a tilt fraction in the scan; every other stage here is posted by the app's own worker code around the engine calls.
 */

export interface StageDef {
  /** Stable name of the stage (the `data-stage` attribute). */
  id: string;
  /** The worker stage string that enters this stage. */
  enteredBy: string;
  /** Words for the stage; the English text is the i18n key. */
  labelKey: string;
  /** Share of the bar; only the ratio between the stages of a plan matters. */
  weight: number;
  /** About how long the stage takes on a typical case (measured on a large local denture scan); paces the easing inside it. */
  typicalMs: number;
}

export interface StagePlan {
  id: 'scan' | 'build';
  stages: readonly StageDef[];
}

/** The stage strings the denture worker posts, one place so the worker, the plans and the tests agree. */
export const DENTURE_STAGE = {
  reading: 'Checking and orienting the denture',
  scanning: 'Scanning print angles',
  preparing: 'Preparing the model',
  placing: 'Placing tips',
  routing: 'Routing supports',
  finishing: 'Finishing the supports',
} as const;

/** Step 1: the upright frame, then the print-angle search (its fraction is tilts done / total). */
export const SCAN_PLAN: StagePlan = {
  id: 'scan',
  stages: [
    { id: 'reading', enteredBy: DENTURE_STAGE.reading, labelKey: 'Reading the scan', weight: 15, typicalMs: 1000 },
    { id: 'scanning', enteredBy: DENTURE_STAGE.scanning, labelKey: 'Finding the print angle', weight: 85, typicalMs: 4500 },
  ],
};

/** Step 2: one support build (the engine's generate call is one piece; see the README for the hook that would split it). */
export const BUILD_PLAN: StagePlan = {
  id: 'build',
  stages: [
    { id: 'preparing', enteredBy: DENTURE_STAGE.preparing, labelKey: 'Preparing the model', weight: 6, typicalMs: 1500 },
    { id: 'placing', enteredBy: DENTURE_STAGE.placing, labelKey: 'Placing tips', weight: 3, typicalMs: 500 },
    { id: 'routing', enteredBy: DENTURE_STAGE.routing, labelKey: 'Routing supports', weight: 86, typicalMs: 33000 },
    { id: 'finishing', enteredBy: DENTURE_STAGE.finishing, labelKey: 'Finishing the supports', weight: 5, typicalMs: 800 },
  ],
};

/** The plan of a job by its activity label key, or undefined for a job without a staged bar. */
const PLAN_BY_LABEL: Readonly<Record<string, StagePlan>> = {
  'Orienting {name}': SCAN_PLAN,
  'Building supports for {name}': BUILD_PLAN,
};

export const stagePlanOf = (labelKey: string): StagePlan | undefined => PLAN_BY_LABEL[labelKey];
