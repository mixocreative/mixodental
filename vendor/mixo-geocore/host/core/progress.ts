/**
 * Progress stages reported by the engine host. They are codes, not text: the app maps each one to a
 * translated string (mixomesh locale keys carry the same names), so shared code never holds English.
 */
/** The stage codes; each value is also the app's locale key for its text. */
export const PROGRESS_STAGE = {
  writingStl: 'supports.progress.writingStl',
  samplingNormals: 'supports.progress.samplingNormals',
  findingOverhangs: 'supports.progress.findingOverhangs',
  done: 'supports.progress.done',
} as const;

/**
 * The phases the engine reports while a support build (`generateSupports`) runs, in the order a first,
 * unrepaired build goes through them. The strings are the engine's (`supports::phase::Phase::name`), not
 * display text: the app maps each one to a stage of its own bar.
 *
 * - `preparing`: indexing the model, mapping its shadow and clear height.
 * - `routing`: planning each tip's neck and pillar path (counted: tips done of total).
 * - `placing`: checking each tip and building its column (counted).
 * - `bracing`: building the cross-braces between the columns.
 * - `raft`: building the raft and its label.
 * - `checking`: the repair's checks of a finished build, and the final clearance review.
 * - `judging`: the model's islands.
 * - `finishing`: ring coverage, the unresolved-tip report and the footprint.
 * - `writing`: packing the mesh and reports for the host.
 *
 * A repair round rebuilds the supports, so `routing` to `checking` can come again after `checking`;
 * the counts then start over. `judging`, `finishing` and `writing` come once, last.
 */
export const GENERATE_PHASES = ['preparing', 'routing', 'placing', 'bracing', 'raft', 'checking', 'judging', 'finishing', 'writing'] as const;

/** One of the `GENERATE_PHASES`. */
export type GeneratePhase = (typeof GENERATE_PHASES)[number];

/**
 * Called by `generateSupports` as the engine enters a phase and as it counts tips inside one.
 * `total` is 0 at a phase's entry (and in uncounted phases); in `routing` and `placing` it is the tip
 * count and `done` runs 0..total, reported about 64 times per phase. Never changes the result.
 */
export type GeneratePhaseCallback = (phase: GeneratePhase, done: number, total: number) => void;

/** One of the `PROGRESS_STAGE` codes. */
export type ProgressStage = (typeof PROGRESS_STAGE)[keyof typeof PROGRESS_STAGE];
