// Copyright (c) Mixo Creative.

import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { autoGenEligibility } from './eligibility';
import { keepsManualArea } from '../dental/flow';
import { runAutoGen, type AutoGenResult, type AutoGenStop } from './pipeline';
import type { DetectState } from '../items/detectState';
import type { AnalysisClient } from '../workers/analysisClient';
import { reduceScene } from '../state/project';
import type { PrintScene, SceneCommand } from '../state/project';
import type { SupportRecipe } from '../recipes/supportRecipe';

/**
 * THE DECK'S AUTO-GEN QUEUE: the React layer, and the only one of the three that has any.
 *
 * `eligibility.ts` says whether a card may go, `pipeline.ts` takes one through Steps 1 to 3, and
 * this drives them - which card is running, which are waiting, what each one ended as, and the
 * Auto-gen all press. Owner's ruling 3 put the seam exactly here so the middle layer could be run
 * under Node against a real scan; everything in this file is the part that genuinely needs a
 * component tree.
 *
 * ONE AT A TIME, AND NOT AS A POLICY CHOICE. The analysis worker serves one job at a time (its
 * client queues the rest), so two pipelines in flight would interleave five jobs each and finish no
 * sooner - while doubling the resident meshes and the chance of an out-of-memory tab, which is the
 * failure this app's deck budget exists to warn about. Strictly one also makes "which card is
 * running" a fact rather than a guess.
 *
 * NOTHING IS WRITTEN FOR A CARD THAT STOPPED. Every stop leaves the unit as it was found, so a card
 * that could not be generated is exactly as openable as before - the operator presses Open and does
 * it themselves. The card says where it stopped, because a queue that goes quiet on three of thirty
 * is the silent death this project's first law is about.
 */

/** What one card is doing, or what became of it. */
export type AutoGenCard =
  /** Pressed, waiting for the card ahead of it. */
  | { readonly kind: 'queued' }
  /**
   * Running now, and the card says only that.
   *
   * NO PER-STEP LABEL, deliberately. The pipeline reports no progress and inventing one here would
   * mean the card claiming "orienting" through all five jobs. The real step is already on screen:
   * every job carries its own activity line ("Orienting X", "Placing dental contacts on X") into the
   * app's background-work readout, which is where a running job's detail belongs.
   */
  | { readonly kind: 'running' }
  /** Supports built. `angleCheck` carries the print-angle check's bad news, which must not be swallowed. */
  | {
    readonly kind: 'done'; readonly tips: number;
    readonly angleMovedDeg?: number;
    readonly angleCheck?: 'none-held' | 'failed';
    /**
     * The recipe this run actually built with.
     *
     * KEPT RATHER THAN LOOKED UP, because the default can change afterwards: a card that reported
     * the CURRENT default would relabel itself the moment the operator set a new one, telling them
     * that supports already on the plate were built with something they have never used.
     */
    readonly recipeName: string;
  }
  /** Stopped, with the unit untouched. */
  | { readonly kind: 'stopped'; readonly stop: AutoGenStop };

interface Host {
  analysis: () => AnalysisClient;
  dispatch: (command: SceneCommand) => void;
  /** The scene as the queue must read it: current inside a promise, where state would be stale. */
  sceneRef: MutableRefObject<PrintScene>;
  /** `unitId` -> dental profile. A card nobody has named is not eligible, and the key is absent. */
  purposes: ReadonlyMap<string, string>;
  /** Each row's own orientation result: the gate reads this and nothing else. */
  detected: ReadonlyMap<string, DetectState>;
  /** The deck is at its model cap or memory allowance (`src/items/deckBudget.ts`). */
  atCap: boolean;
  /**
   * What this card is set to build with (`src/recipes/`), or `'missing'`.
   *
   * `'missing'` IS NOT SOFTENED into the default anywhere on the way here or after it: a selection
   * that cannot be resolved means the operator's instruction is unknown, and generating anyway
   * gives them supports they did not choose on a model they are about to print.
   */
  resolveRecipe: (unitId: string) => SupportRecipe | 'missing';
}

export function useAutoGen({ analysis, dispatch, sceneRef, purposes, detected, atCap, resolveRecipe }: Host) {
  const [cards, setCards] = useState<ReadonlyMap<string, AutoGenCard>>(new Map());
  /*
   * THE ANSWER IS READ WHEN THE CARD'S TURN COMES, not when the queue was started.
   *
   * `drain` runs across many awaits and would otherwise hold the `purposes` map it closed over. On a
   * case of thirty that is minutes, and re-answering a card in the middle of them is an ordinary
   * thing to do - so a card could be generated for the type the operator had just changed AWAY from,
   * which is the one defect this queue must never have.
   */
  const purposesRef = useRef(purposes);
  purposesRef.current = purposes;
  /** Read at each card's turn, for the same reason as the answer above. */
  const recipeRef = useRef(resolveRecipe);
  recipeRef.current = resolveRecipe;
  /** The ids still to run, in the order they were pressed. Held in a ref: the drain loop reads it between awaits. */
  const pending = useRef<string[]>([]);
  /**
   * WHICH UNIT IS RUNNING, and SEPARATELY whether a drain loop is alive. These were one variable and
   * that was a defect: `cancel` cleared it to stop the queue, so a fresh press opened a SECOND drain
   * while the first was still awaiting a worker - and when the first woke it cleared the marker
   * again, erasing the second drain's claim, so a third could start and two pipelines could run on
   * one unit with separate scene copies. One variable answering two questions cannot answer either
   * reliably.
   */
  const running = useRef<string | undefined>(undefined);
  const draining = useRef(false);
  /** Bumped by `cancel`, so a pipeline mid-flight stops at its next step instead of writing its answer. */
  const generation = useRef(0);

  const put = useCallback((unitId: string, card: AutoGenCard | undefined) => {
    setCards((current) => {
      const next = new Map(current);
      if (card) next.set(unitId, card);
      else next.delete(unitId);
      return next;
    });
  }, []);

  /**
   * Drain the queue, one card at a time, until it is empty.
   *
   * `live` IS THE WHOLE OF THE STALENESS MODEL HERE, and it is asked by the pipeline after every
   * await. Three things make a card stale: the operator cancelled (the generation moved), the unit
   * left the plate, or the file was replaced. All three mean the answer in flight belongs to a scene
   * that no longer exists, and writing it would be the worst kind of defect this queue can have -
   * supports attached to the wrong model.
   */
  const drain = useCallback(async () => {
    if (draining.current) return;
    draining.current = true;
    const mine = generation.current;
    try {
    while (pending.current.length > 0 && generation.current === mine) {
      const unitId = pending.current.shift()!;
      const profile = purposesRef.current.get(unitId);
      const unit = sceneRef.current.units.find((candidate) => candidate.id === unitId);
      if (!unit || !profile) { put(unitId, undefined); continue; }
      /*
       * THE RECIPE IS RESOLVED AT THIS CARD'S TURN, like its type - a case of thirty is minutes, and
       * a recipe deleted in another tab halfway through must stop THIS card rather than build it
       * with something else.
       */
      const recipe = recipeRef.current(unitId);
      if (recipe === 'missing') { put(unitId, { kind: 'stopped', stop: { at: 'recipe', because: 'missing' } }); continue; }
      running.current = unitId;
      put(unitId, { kind: 'running' });
      /*
       * THE PIPELINE'S VIEW OF THE SCENE IS KEPT HERE, REDUCED LOCALLY, and the first version of this
       * got it wrong in the one way App.tsx already warns about twice.
       *
       * `sceneRef.current = scene` happens during RENDER. `dispatch` goes through a reducer, so the
       * render has NOT happened when the next line runs - `sceneRef.current` is one render behind a
       * dispatch. Reading it back as "the scene after this commit" therefore returned the scene
       * BEFORE it, so every step after the first computed from a stale unit: the accepted policy was
       * invisible to the placement step, `dentalPlacementJobOf` answered undefined, and the card said
       * "Generating supports failed" on a model the same pipeline finishes in 12 s under Node. Found
       * by pressing the key and watching the card, not by reasoning - `startItem` and
       * `useImportFiles` both carry this warning and I walked into it anyway.
       *
       * So the host applies each batch to its OWN copy with the same reducer the app uses, and hands
       * that back. The dispatches still land in order, so the real scene ends in the same state; this
       * copy exists only so the NEXT step reads what the last one wrote.
       */
      let working = sceneRef.current;
      let result: AutoGenResult;
      try {
        result = await runAutoGen(unitId, profile, {
          engine: analysis(),
          scene: () => working,
          commit: (commands) => {
            const batch: SceneCommand = { type: 'batch', commands: [...commands] };
            dispatch(batch);
            working = reduceScene(working, batch);
            return working;
          },
          /*
           * `live` READS THE REAL SCENE, not the copy: the question is whether the operator has taken
           * this unit away, and only the app's own scene can answer that. A render behind is fine
           * here - the next step asks again.
           */
          live: (id) => generation.current === mine && sceneRef.current.units.some((candidate) => candidate.id === id),
        }, recipe);
      } catch {
        // A throw from the worker client is a stop like any other: the card says so and the queue goes on.
        result = { kind: 'stopped', stop: { at: 'supports', because: 'failed' } };
      }
      running.current = undefined;
      if (generation.current !== mine) return;
      put(unitId, result.kind === 'done'
        ? {
          kind: 'done', tips: result.tips, recipeName: recipe.name,
          ...(result.angleMovedDeg === undefined ? {} : { angleMovedDeg: result.angleMovedDeg }),
          ...(result.angleCheck === undefined ? {} : { angleCheck: result.angleCheck }),
        }
        : { kind: 'stopped', stop: result.stop });
      }
    } finally {
      /*
       * THE LOOP OWNS THE CLEAN-UP, including when it abandons mid-queue. A cancel that happened
       * while this was awaiting left any work pressed AFTER it in `pending`, and nothing would have
       * drained that - the new press was refused by this drain's own claim. So the last act of a
       * stale drain is to let the next one in.
       */
      draining.current = false;
      running.current = undefined;
      if (generation.current !== mine && pending.current.length > 0) void drain();
    }
  }, [analysis, dispatch, put, sceneRef]);

  /**
   * The gate, for one card. The two work facts come from the UNIT rather than from this hook's
   * state, because they survive a reload and this hook's maps do not: a card generated in a previous
   * sitting still carries its supports.
   */
  const eligible = useCallback((unitId: string) => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === unitId);
    const profile = purposes.get(unitId);
    return autoGenEligibility({
      answered: profile !== undefined,
      detect: detected.get(unitId),
      atCap,
      /*
       * `sceneRef` IS A RENDER BEHIND, so a card whose run has just landed would still read
       * un-built for one render - a window in which a second press would re-run it and, being a
       * re-orient, delete what it had just made. This sitting's own answer closes it.
       */
      built: unit?.supports !== undefined || cards.get(unitId)?.kind === 'done',
      ownArea: unit !== undefined && keepsManualArea(unit, profile),
    });
  }, [atCap, cards, detected, purposes, sceneRef]);

  const start = useCallback((unitId: string) => {
    if (!eligible(unitId).ready || pending.current.includes(unitId) || running.current === unitId) return;
    pending.current.push(unitId);
    put(unitId, { kind: 'queued' });
    void drain();
  }, [drain, eligible, put]);

  /**
   * Auto-gen all: every card that may go, in the order they are on the plate.
   *
   * IT TAKES THE IDS RATHER THAN READING THE SCENE, because the deck shows the cards in its own
   * order (needs-you first) and the operator means "these, as I see them". Cards that may not go are
   * silently left out - they already say why on their own face, and a second explanation per card in
   * a case of thirty is noise.
   */
  const startAll = useCallback((unitIds: readonly string[]) => {
    for (const unitId of unitIds) start(unitId);
  }, [start]);

  /** Stop: the running pipeline abandons at its next step, the queue empties, finished cards keep their answer. */
  const cancel = useCallback(() => {
    generation.current += 1;
    const dropped = pending.current;
    pending.current = [];
    running.current = undefined;
    setCards((current) => {
      const next = new Map(current);
      for (const unitId of dropped) next.delete(unitId);
      for (const [unitId, card] of current) if (card.kind === 'running') next.delete(unitId);
      return next;
    });
  }, []);

  return {
    cards,
    /** Whether anything is running or waiting: the footer's Auto-gen all becomes Stop. */
    busy: cards.size > 0 && [...cards.values()].some((card) => card.kind === 'queued' || card.kind === 'running'),
    eligible,
    start,
    startAll,
    cancel,
    /**
     * This sitting's finished run for a card, so an Open can carry its print-angle news into Step 3.
     *
     * READ OUT OF `cards`, which already holds it. A second map beside it was two records of one
     * run that could disagree - and a finished card is told apart by its UNIT having supports
     * anyway, which survives a reload where neither map does.
     */
    finished: (unitId: string) => {
      const card = cards.get(unitId);
      return card?.kind === 'done' ? card : undefined;
    },
  };
}
