import { useCallback, useEffect, useRef, useState } from 'react';
import type { PrintUnit } from '../state/project';
import type { AnalysisClient } from '../workers/analysisClient';
import { detectStateOf, type DetectState } from './detectState';
import { isDentureJob } from '../denture/jobKind';
import { codedJobError } from '../workers/jobErrors';

/**
 * HOW LONG ONE ROW'S ORIENTATION CHECK MAY TAKE before the worker is stopped and the row says so.
 *
 * TWO MINUTES, AND THE POOL'S TEN IS WHY THIS NUMBER EXISTS. Ten minutes is the right ceiling for
 * what it was written for - a placement or a support check on a big model, where finishing late
 * beats failing - but this queue drains ONE ROW AT A TIME, so a single stalled orient holds every
 * row behind it for the full ten minutes with the screen honestly reporting "Waiting its turn…"
 * (gap register W-03). Two minutes is generous against the measurement: `orient_dental` on the
 * reference aligner is seconds, and a 1.5M-triangle full-arch scan - the engine's own per-model
 * budget - is well inside a minute on this workstation. A row that passes two minutes is stuck, not
 * slow, and the honest thing is to hand it back to the operator and move on to the next row.
 */
const ORIENT_TIMEOUT_MS = 2 * 60_000;

/**
 * THE BATCH: one orientation detection per row, each as soon as THAT ROW has been told what it is.
 *
 * ONE AT A TIME, awaited in order. `AnalysisClient` already holds a `TriangleGate` that would queue
 * these by triangle budget — a cleverer rule, since two small models may run together where two large
 * ones may not. Running them sequentially here anyway buys something the gate cannot: a row's
 * `running` state is TRUE when it says so. Submitting all of them at once would light every row with
 * "Checking the orientation…" while most sat in a queue, which is a lie told N times. A dental case
 * is a handful of models, so the throughput given up is small and the honesty is worth it.
 *
 * The gate stays underneath as the memory guarantee; this is about what the deck SAYS.
 *
 * Each row keeps its OWN result. Upper and lower arches in one drop orient differently, so a single
 * answer imposed on the list would be wrong for half of it.
 */
export function useBatchDetect({ units, purposes, analysis, unitName }: {
  units: readonly PrintUnit[];
  /**
   * WHAT EACH FILE IS (`unitId` -> dental profile). A unit with no entry has not been answered and
   * is NOT detected: `dentalOrient` takes the profile as an argument, so there is nothing to run
   * against until its own answer exists, and anything run before it would be run against a guess.
   *
   * It is per FILE rather than per case (owner, 2026-11-18: *"each file has a category and type,
   * but it ask me what i am making for all files, which is wrong"*). An upper aligner, a lower
   * aligner and a denture base can arrive in one drop, so one answer imposed on the batch would be
   * wrong for part of it - the same reason each row already keeps its own RESULT.
   */
  purposes: ReadonlyMap<string, string>;
  analysis: () => AnalysisClient;
  unitName: (id: string) => string;
}) {
  const [states, setStates] = useState<ReadonlyMap<string, DetectState>>(new Map());
  /** Units a job has already been queued for, so a re-render never submits twice. */
  const started = useRef(new Set<string>());
  const [retries, setRetries] = useState(0);
  /**
   * THE QUEUE, and it is a queue because the first version LOST WORK. That one returned early while a
   * loop was running — so units arriving in a LATER render were marked started and then never
   * processed. The units of one drop land across two renders (the scene updates, then the page
   * opens), and the walk caught it precisely: three rows dropped, two results.
   *
   * Newcomers now join the queue and the running loop drains them.
   */
  /*
   * EACH QUEUED ROW CARRIES THE PURPOSE IT WAS QUEUED UNDER (found by audit, W-04).
   *
   * The loop used to read `profile` from the effect run that STARTED it, and a later effect that
   * only pushes returns early - so a second drop with a different purpose was drained under the
   * first one's profile. Reading a live ref instead would be wrong in the opposite direction: a row
   * queued under Aligner would then be detected under Denture because the operator changed purpose
   * while it waited. The purpose is per RUN (design doc §2), so it belongs to the entry.
   */
  const queue = useRef<{ unit: PrintUnit; profile: string }[]>([]);
  const running = useRef(false);

  useEffect(() => {
    /*
     * Only units that have been answered. An unanswered one is not "pending": it is not a job yet,
     * and marking it started would mean never queueing it once its answer arrives.
     *
     * AND NOT DENTURES. This batch is `orientDentalAligner`, which hands the profile straight to the
     * engine's `orient_dental` - and that rejects a denture profile outright (`UNKNOWN_PROFILE`), so
     * every denture row came back `failed` with an error toast. It is not a regression: a whole case
     * answered "Denture" has always failed this way, because `batchProfile` could be a denture
     * profile too. It was invisible while the purpose was one answer for a whole drop and the denture
     * path was walked through its own flow; a per-row category made it one click away.
     *
     * A denture is oriented by its OWN step (`src/denture/steps/orient`), on open. So the honest
     * thing is not to run, and to let the row say it needs the operator - which is what it does.
     * Making the batch per-purpose is step 1 of `docs/design.md#2026-11-17-flow-map` §12.
     */
    const pending = units.filter((unit) => !started.current.has(unit.id)
      && purposes.has(unit.id) && !isDentureJob(purposes.get(unit.id)));
    if (pending.length === 0) return;
    for (const unit of pending) started.current.add(unit.id);
    queue.current.push(...pending.map((unit) => ({ unit, profile: purposes.get(unit.id)! })));
    setStates((current) => {
      const next = new Map(current);
      for (const unit of pending) next.set(unit.id, { kind: 'waiting' });
      return next;
    });
    // A loop is already draining: it will reach what was just pushed.
    if (running.current) return;

    running.current = true;
    void (async () => {
      while (queue.current.length > 0) {
        const { unit, profile: queuedProfile } = queue.current.shift()!;
        setStates((current) => new Map(current).set(unit.id, { kind: 'running' }));
        // A failure here belongs to THIS ROW and not to the batch: the next row still runs. Same
        // rule as the drop loop, where one bad file refuses only itself.
        //
        // (Written without apostrophes on purpose: `i18n.test.ts` scrapes single-quoted literals out
        // of UI files, and a pair of them in prose reads as a string it then demands a translation
        // for. This module became a UI file when its folder was globbed into that guard.)
        let timedOut = false;
        const result = await analysis()
          .dentalOrient(`batch-orient:${unit.id}`, unit.source, queuedProfile, { key: 'Checking {name}', vars: { name: unitName(unit.id) } }, ORIENT_TIMEOUT_MS)
          .catch((error: unknown) => {
            /*
             * THE REASON IS KEPT NOW. This was `.catch(() => undefined)`, so a job the worker killed
             * for running past its deadline and a job that failed on its first instruction drew the
             * same line - and the operator's next move is not the same: Retry on a model that timed
             * out will time out again.
             */
            timedOut = (codedJobError(error) as { code?: string } | undefined)?.code === 'timeout';
            return undefined;
          });
        setStates((current) => new Map(current).set(unit.id,
          timedOut ? { kind: 'failed', because: 'timeout' } : detectStateOf(result)));
      }
      running.current = false;
    })();
  }, [units, purposes, analysis, unitName, retries]);

  /*
   * A FAILED ROW CAN BE TRIED AGAIN, and until now it could not.
   *
   * `started` only ever grows, so a row whose detection failed was never queued a second time: the
   * only way back was to open it and let the flow re-run orientation in-step, which the row itself
   * never said. Fable called this the single most important gap in the flow map, and it is - under
   * review-by-exception these are the rows that ARE the human's job.
   *
   * The tick is what makes it work: the effect wakes on `units` changing, and a retry changes no
   * unit. Forgetting the id without it would leave the row pending until the next drop.
   */
  const retry = useCallback((unitId: string) => {
    started.current.delete(unitId);
    /*
     * THE OLD VERDICT GOES WITH IT. Forgetting only that the row had STARTED left its previous
     * answer on screen until a new one arrived - and for a row re-answered from aligner to denture
     * no new one ever arrives, because the batch does not run dentures at all. The row would have
     * gone on reading "Needs rim" about an object whose rail has no Rim button, which is the exact
     * defect this screen keeps being rebuilt to remove.
     */
    setStates((current) => {
      if (!current.has(unitId)) return current;
      const next = new Map(current);
      next.delete(unitId);
      return next;
    });
    setRetries((count) => count + 1);
  }, []);

  return { states, retry };
}
