// Copyright (c) Mixo Creative.

import { dentalPlacementJobOf, orientationOf, resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import { landPlacements } from '@mixo-geocore/editing/landing';
import { tiltLabel } from '@mixo-geocore/host/dental/dentalTilt';
import {
  acceptCommands, acceptedPolicy, alignerSettings, confirmOrder, dentalLabelCommands,
  orientOutcome, settledPolicy, tiltScanSettings, turnCommands,
} from '../dental/stages';
import { detectStateOf } from '../items/detectState';
import type { AnalysisClient } from '../workers/analysisClient';
import type { PrintScene, PrintUnit, SceneCommand } from '../state/project';
import type { TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentalOrientation } from '@mixo-geocore/host/dental/dentalOrient';

/**
 * ONE ALIGNER THROUGH THE WHOLE DENTAL FLOW, WITH NOBODY WATCHING - no React, no screens, no refs.
 *
 * WHAT THIS IS FOR (owner's ruling 2, `docs/design/2026-11-18-card-deck-plan.md`): the deck's
 * Auto-gen must leave a model in STEP 3'S OWN STATE, so Support Edit Mode works on it unchanged and
 * nothing in the editor can tell who got it there. That is a statement about the END state, and the
 * only way to be sure of it is to take the same steps in the same order with the same decisions.
 *
 * WHICH IS WHY EVERY DECISION HERE IS A CALL INTO `src/dental/stages.ts`. Not one rule is restated:
 * the settings a new aligner starts with, what a detected area becomes, what the tilt scan is asked
 * to try, which angles the confirm tries, whether the kept area comes back, the starting label -
 * each is the function `useDentalFlow` calls on the screens. The danger in an auto-gen queue was
 * never where the code sits; it was two implementations of one decision drifting, and the symptom
 * would be **auto-gen quietly making different supports from the editor, for the same model.** So
 * there is one implementation and this file is its second caller.
 *
 * WHAT IT DOES OWN. The ORDER of the steps, the stop conditions, and the fact that a stop says where
 * it stopped. `useDentalFlow` owns the interactive version of the same order - stale checks against
 * a moving screen, a tilt the operator picked by hand, a rim they drew - and those are genuinely its
 * own. The queue that drives this lives in `useAutoGen.ts`; this file never touches React so it can
 * be run under Node against a real scan.
 *
 * NOTHING HERE DECIDES WHETHER A MODEL *MAY* BE GENERATED. That is `eligibility.ts`, and the queue
 * asks it first. This file asks the engine's answer one more time all the same (step 1 below),
 * because the eligibility verdict was made from the DECK's detection and this one is fresh - and a
 * model that became doubtful in between must not be generated on the strength of an old yes.
 */

/** Where the pipeline got to. The card shows it, so each one names something the operator can act on. */
export type AutoGenStop =
  /** The unit left the scene, or the card was cancelled, between two steps. */
  | { readonly at: 'orient'; readonly because: 'gone' }
  /** The orientation check could not run or came back unusable. */
  | { readonly at: 'orient'; readonly because: 'failed' }
  /** Detection found no rim: a drawing job, not a queue job. */
  | { readonly at: 'orient'; readonly because: 'no-rim' }
  /** The fresh answer carries a doubt (`src/items/detectState.ts`): a human settles it. */
  | { readonly at: 'orient'; readonly because: 'needs-attention' }
  /** A rim but no support area. The flow's answer is for the operator to paint one. */
  | { readonly at: 'area'; readonly because: 'no-area' }
  /** The area detector could not run. */
  | { readonly at: 'area'; readonly because: 'failed' }
  /** The placement produced no safe tip. Nothing is written: the model is left as it was. */
  | { readonly at: 'supports'; readonly because: 'no-tips' }
  /** The placement could not run, or the model moved while it ran. */
  | { readonly at: 'supports'; readonly because: 'failed' };

export type AutoGenResult =
  | {
    readonly kind: 'done';
    readonly tips: number;
    /**
     * Step 1's own proposal, carried out so the card can be OPENED AT STEP 3 without re-orienting.
     *
     * That is owner's ruling 2 made possible rather than merely stated: opening a generated card at
     * Step 1 would re-run detection and, since the re-orient rule, delete the supports the queue
     * just built. Handing the proposal back lets the caller walk the editor's OWN event path -
     * `dentalLoading`, `dentalOriented`, `acceptDentalOrientation`, `acceptDentalArea` - with a real
     * proposal and no second detection, so Step 3 opens in exactly the state the screens leave it in.
     */
    readonly proposal: Extract<DentalOrientation, { kind: 'oriented' }>['proposal'];
    /** The print angle the confirm settled on, when it moved off the scan's own pick. */
    readonly angleMovedDeg?: number;
    /** `none-held`: no tried angle's build held, and the pick stands. `failed`: the check could not run. */
    readonly angleCheck?: 'none-held' | 'failed';
  }
  | { readonly kind: 'stopped'; readonly stop: AutoGenStop };

/**
 * The engine calls, taken as a slice of the app's own client rather than as a fresh interface.
 *
 * THAT IS DELIBERATE: a hand-written interface here would be a second declaration of the same five
 * jobs, free to drift from the client the screens use - and the drift would show up as the pipeline
 * passing a worker argument the UI stopped passing. `Pick` cannot drift.
 */
export type AutoGenEngine = Pick<AnalysisClient, 'dentalOrient' | 'dentalTiltScan' | 'dentalRegion' | 'dentalConfirmTilt' | 'dentalPlace'>;

/**
 * What the pipeline needs from whoever is driving it.
 *
 * `commit` APPLIES AND ANSWERS, which is the shape that lets this run in both places. Each step
 * reads the unit as it stands AFTER the last one - the tilt scan needs the oriented frame, the
 * placement needs the accepted policy - so a fire-and-forget dispatch would have the pipeline
 * computing from a scene that has not caught up. In the app this is `dispatch` followed by
 * `sceneRef.current` (which the flow already relies on being current); under Node it is
 * `reduceScene`.
 *
 * `live` is asked after every await. A queue the operator cancelled, or a card whose file they
 * deleted, must stop between steps rather than write its answer into a scene that has moved on -
 * the same job the flow's sequence tokens do, asked in the one way a non-React caller can.
 */
export interface AutoGenHost {
  readonly engine: AutoGenEngine;
  scene(): PrintScene;
  commit(commands: readonly SceneCommand[]): PrintScene;
  live(unitId: string): boolean;
}

const stop = (at: AutoGenStop['at'], because: string): AutoGenResult =>
  ({ kind: 'stopped', stop: { at, because } as AutoGenStop });

const unitOf = (scene: PrintScene, unitId: string): PrintUnit | undefined =>
  scene.units.find((candidate) => candidate.id === unitId);

/**
 * Run `unitId` through Steps 1 to 3 for the aligner type `profile`, committing each step's result as
 * it goes, and leave it in the state Step 3 would have left it in.
 *
 * THE TURNS ALL HAPPEN BEFORE THE SUPPORTS, and that is not merely tidy: since 2026-11-18 a re-orient
 * DELETES the supports already built (`transform/set` in `src/state/project.ts`), so a pipeline that
 * placed tips and then turned the model would hand the operator an empty card and no reason why.
 * The order below is the flow's own, and this is one more reason not to depart from it.
 */
export async function runAutoGen(unitId: string, profile: string, host: AutoGenHost): Promise<AutoGenResult> {
  const started = unitOf(host.scene(), unitId);
  if (!started) return stop('orient', 'gone');
  const name = started.name;

  // 1. Step 1: orient. The answer is judged by the same function the deck's rows are judged by.
  const answer = await host.engine.dentalOrient(`auto-orient:${unitId}`, started.source, profile, { key: 'Orienting {name}', vars: { name } });
  if (!host.live(unitId)) return stop('orient', 'gone');
  const outcome = orientOutcome(started, host.scene().units, answer);
  if (outcome.kind === 'failed') return stop('orient', 'failed');
  if (outcome.kind === 'rim-needed') return stop('orient', 'no-rim');
  if (detectStateOf(answer).kind !== 'oriented') return stop('orient', 'needs-attention');
  let scene = outcome.commands.length > 0 ? host.commit(outcome.commands) : host.scene();
  const oriented = unitOf(scene, unitId);
  if (!oriented) return stop('orient', 'gone');

  /*
   * 2. Step 1's print-angle scan, and the pose it picks.
   *
   * A SCAN THAT DOES NOT RUN IS NOT A FAILURE. The flow's own answer to a failed scan is to show the
   * step with no slider and go on with the orientation it has, so the model is still generated - at
   * the pose Step 1 found. Stopping here would refuse models the screens accept.
   */
  const scan = await host.engine.dentalTiltScan(`auto-tilt:${unitId}`, oriented.source, profile,
    tiltScanSettings(oriented, profile), { key: 'Scanning print angles on {name}', vars: { name } });
  if (!host.live(unitId)) return stop('orient', 'gone');
  const scanned: Extract<TiltScan, { kind: 'scan' }> | undefined = scan?.kind === 'scan' ? scan : undefined;
  const picked = scanned?.order[0];
  if (scanned && picked !== undefined) scene = host.commit(turnCommands(scene.units, oriented, scanned.rows[picked]!.rotation));

  // 3. Step 1 Next: the support area.
  const atArea = unitOf(scene, unitId);
  if (!atArea) return stop('orient', 'gone');
  const region = await host.engine.dentalRegion(`auto-region:${unitId}`, atArea.source, profile,
    { key: 'Detecting dental support area on {name}', vars: { name } });
  if (!host.live(unitId)) return stop('orient', 'gone');
  if (!region) return stop('area', 'failed');
  /*
   * NO AREA IS A PAINTING JOB. `manualAreaCommands` is the flow's answer and it opens Step 2 EMPTY
   * for the operator to paint - so the queue has nothing to generate and must not pretend otherwise.
   * Writing the empty policy here would leave a card that looks answered and builds nothing.
   */
  if (region.kind !== 'proposal') return stop('area', 'no-area');
  const policy = acceptedPolicy(atArea, profile, outcome.proposal.rim, region);
  const { settings } = alignerSettings(atArea, profile);

  /*
   * 4. The print-angle confirm: the automatic pick is built for real before it is accepted.
   *
   * THREE OUTCOMES, THREE ANSWERS, as the flow has had since audit MIXO-02. `confirmed` is the index
   * of the first tried angle whose build holds; `undefined` means none of them did and the pick
   * stands, which the card must say rather than report a clean generate.
   */
  let angleMovedDeg: number | undefined;
  let angleCheck: 'none-held' | 'failed' | undefined;
  if (scanned && picked !== undefined) {
    const order = confirmOrder(scanned.order, scanned.order.indexOf(picked));
    const checked = await host.engine.dentalConfirmTilt(`auto-confirm:${unitId}`,
      { mesh: atArea.source, dental: policy, settings, labelText: 'A' },
      order.map((index) => scanned.rows[index]!.rotation),
      { key: 'Checking the print angle of {name}', vars: { name } },
    ).catch(() => undefined);
    if (!host.live(unitId)) return stop('orient', 'gone');
    const confirmed = checked?.confirmed;
    if (checked === undefined) angleCheck = 'failed';
    else if (confirmed === undefined) angleCheck = 'none-held';
    else if (order[confirmed] !== picked) {
      const index = order[confirmed]!;
      angleMovedDeg = Number(tiltLabel(scanned.rows[index]!.tiltDeg));
      scene = host.commit(turnCommands(scene.units, unitOf(scene, unitId) ?? atArea, scanned.rows[index]!.rotation));
    }
  }

  // 5. Accept the area, with the type's presets ahead of it where they are owed.
  const toAccept = unitOf(scene, unitId);
  if (!toAccept) return stop('orient', 'gone');
  scene = host.commit(acceptCommands(toAccept, profile, settledPolicy(toAccept, profile, policy, angleMovedDeg)));

  // 6. Step 3's Generate: place the tips, land them, and write the starting label.
  const placing = unitOf(scene, unitId);
  if (!placing) return stop('orient', 'gone');
  const job = dentalPlacementJobOf(placing);
  if (!job) return stop('supports', 'failed');
  const placement = await host.engine.dentalPlace(`auto-place:${unitId}`, job,
    { key: 'Placing dental contacts on {name}', vars: { name } }).catch(() => undefined);
  if (!host.live(unitId)) return stop('orient', 'gone');
  if (!placement) return stop('supports', 'failed');
  if (placement.points.length === 0) return stop('supports', 'no-tips');
  const { commands, landed, again } = landPlacements(scene.units, [{
    unitId, orientation: orientationOf(placing), settings: resolveSettings(placing.settings), result: placement,
  }]);
  if (again.length > 0 || landed.length === 0) return stop('supports', 'failed');
  /*
   * THE LABEL IS WRITTEN FROM THE PRE-LANDING UNIT AND AFTER THE LANDING, which is the order App's
   * Step 3 uses and the order `dentalLabelCommands` documents a trap about: it spreads the unit's
   * WHOLE settings object back, so a unit read after the landing would overwrite anything the
   * landing changed. `placing` is the same unit the landing was computed from.
   */
  host.commit([...commands, ...dentalLabelCommands(placing)]);
  return {
    kind: 'done', tips: placement.points.length, proposal: outcome.proposal,
    ...(angleMovedDeg === undefined ? {} : { angleMovedDeg }),
    ...(angleCheck === undefined ? {} : { angleCheck }),
  };
}
