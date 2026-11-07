import { useEffect, useRef, useState } from 'react';
import type { PrintUnit } from '../state/project';
import type { AnalysisClient } from '../workers/analysisClient';
import { detectStateOf, type DetectState } from './detectState';

/**
 * THE BATCH: one orientation detection per row, after the purpose is chosen (plan §0b step 3).
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
export function useBatchDetect({ units, profile, analysis, unitName }: {
  units: readonly PrintUnit[];
  /** The purpose pressed for this batch. No detection runs without it: the worker needs the profile. */
  profile: string | undefined;
  analysis: () => AnalysisClient;
  unitName: (id: string) => string;
}) {
  const [states, setStates] = useState<ReadonlyMap<string, DetectState>>(new Map());
  /** Units a job has already been queued for, so a re-render never submits twice. */
  const started = useRef(new Set<string>());
  /**
   * THE QUEUE, and it is a queue because the first version LOST WORK. That one returned early while a
   * loop was running — so units arriving in a LATER render were marked started and then never
   * processed. The units of one drop land across two renders (the scene updates, then the page
   * opens), and the walk caught it precisely: three rows dropped, two results.
   *
   * Newcomers now join the queue and the running loop drains them.
   */
  const queue = useRef<PrintUnit[]>([]);
  const running = useRef(false);

  useEffect(() => {
    if (!profile) return;
    const pending = units.filter((unit) => !started.current.has(unit.id));
    if (pending.length === 0) return;
    for (const unit of pending) started.current.add(unit.id);
    queue.current.push(...pending);
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
        const unit = queue.current.shift()!;
        setStates((current) => new Map(current).set(unit.id, { kind: 'running' }));
        // A failure here belongs to THIS ROW and not to the batch: the next row still runs. Same
        // rule as the drop loop, where one bad file refuses only itself.
        //
        // (Written without apostrophes on purpose: `i18n.test.ts` scrapes single-quoted literals out
        // of UI files, and a pair of them in prose reads as a string it then demands a translation
        // for. This module became a UI file when its folder was globbed into that guard.)
        const result = await analysis()
          .dentalOrient(`batch-orient:${unit.id}`, unit.source, profile, { key: 'Checking {name}', vars: { name: unitName(unit.id) } })
          .catch(() => undefined);
        setStates((current) => new Map(current).set(unit.id, detectStateOf(result)));
      }
      running.current = false;
    })();
  }, [units, profile, analysis, unitName]);

  return states;
}
