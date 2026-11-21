import { describe, expect, it } from 'vitest';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { initialSession, reduceSession, startsEditing, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { emptyScene, identityTransform, type PrintScene, type PrintUnit, type SceneCommand } from '../state/project';
import { canUndo, createSceneHistory, undoScene, withSceneCommand, type SceneHistory } from '../state/history';
import { acceptCommands } from '../denture/steps/orient/acceptCommands';
import { defaultDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { DEFAULT_DENTURE_OPTIONS } from '../denture/settings/dentureOptions';
import { defaultDentalTuning } from '@mixo-geocore/host/dental/tuning';
import { backCommands, backEntersOrient, backLosesWork, backNeedsConfirm, discardManualCommands, exitCommands, exitNeedsConfirm, keepsManualArea, keptDentalWork, manualEditCounts, opensAtSupports, startsDentalStep } from './flow';
import { DENTURE_PROFILE_ID } from '../denture/jobKind';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u1', manual: [], deleted: [], contactSettings: {}, ...over }) as unknown as PrintUnit;

/*
 * W-01, FOUND BY AUDIT. Accepting an orientation built a fresh policy with `stamps: []` and a default
 * tuning unconditionally, so re-entering a unit and pressing Next threw away the painted support area
 * and the Step 3 tuning in silence - directly beneath a comment claiming the operator's own choices
 * are kept. `backNeedsConfirm` could not catch it: it reads `manual`, `deleted` and `contactSettings`,
 * never `dental.stamps`, so the guard was blind to a whole class of hand work.
 */
/*
 * STEP 1'S NEXT, AND WHOSE AREA WINS. This used to be "there is no proposal", which held only while a
 * hand-drawn rim implied a failed detection. Once a DETECTED rim could be redrawn, Done left a proposal
 * in hand, the test said no, and detection rebuilt the policy over the loop just drawn - dropping the
 * operator's paint with it, because the rebuild carries no stamps. The walk covered entry and Cancel
 * (`u9b`, `u9c`) and never Done then Next, so it stayed green.
 */
/*
 * THE DOOR OPEN TAKES, AND THE FIELD EACH KIND KEEPS ITS POLICY IN.
 *
 * Before 2026-11-20 this was `supports && dental`, guarded by `&& !isDentureJob(profile)`. The guard
 * read as protection for dentures and was dead: a denture writes `unit.denture` and never
 * `unit.dental`, so it failed the `dental` half anyway and ALWAYS took the orient door - which
 * re-scans, turns the model to the automatic pick, and takes the supports and the operator's chosen
 * print angle with it. The fourth case below is the one that was broken; it is the reason this is a
 * function with a test rather than an expression in `App.tsx`.
 */
describe('which door Open takes', () => {
  const built = { supports: {} as unknown as PrintUnit['supports'] };

  it('an aligner with an accepted policy opens on its supports', () => {
    expect(opensAtSupports(unit({ ...built, dental: {} as never }), 'reference-aligner')).toBe(true);
  });

  it('an aligner with supports but no accepted policy goes to orient', () => {
    expect(opensAtSupports(unit(built), 'reference-aligner')).toBe(false);
  });

  it('nothing built goes to orient, whichever kind', () => {
    expect(opensAtSupports(unit({ dental: {} as never }), 'reference-aligner')).toBe(false);
    expect(opensAtSupports(unit({ denture: {} as never }), DENTURE_PROFILE_ID)).toBe(false);
  });

  it('A BUILT DENTURE OPENS ON ITS SUPPORTS, reading `denture` and never `dental`', () => {
    const denture = unit({ ...built, denture: {} as never });
    expect(denture.dental).toBeUndefined();
    expect(opensAtSupports(denture, DENTURE_PROFILE_ID)).toBe(true);
  });

  it('a denture with supports but no accepted denture state goes to orient', () => {
    expect(opensAtSupports(unit(built), DENTURE_PROFILE_ID)).toBe(false);
  });

  /*
   * The kind decides WHICH field is read, so each kind's own field must not answer for the other -
   * otherwise the dead guard comes back wearing a different shape.
   */
  it('reads only the field that belongs to the kind', () => {
    expect(opensAtSupports(unit({ ...built, denture: {} as never }), 'reference-aligner')).toBe(false);
    expect(opensAtSupports(unit({ ...built, dental: {} as never }), DENTURE_PROFILE_ID)).toBe(false);
  });
});

describe('whether Step 1 goes on with the area the unit already has', () => {
  const manual = (over: Record<string, unknown> = {}) => unit({
    dental: { kind: 'legacy', origin: 'manual-area', profileId: 'p', stamps: [], rim: {} },
    ...over,
  } as unknown as Partial<PrintUnit>);

  it('goes straight on with a manual area of the current type, proposal or not', () => {
    expect(keepsManualArea(manual(), 'p')).toBe(true);
  });

  it('re-detects when the appliance type changed, because another type may find an area', () => {
    expect(keepsManualArea(manual(), 'other-profile')).toBe(false);
  });

  it('re-detects for a detected area, a unit with no policy, and with no type chosen', () => {
    const detected = unit({ dental: { kind: 'two-contour', profileId: 'p', stamps: [], tuning: {}, region: {}, rim: {} } } as unknown as Partial<PrintUnit>);
    expect(keepsManualArea(detected, 'p'), 'a detected area belongs to detection, which refreshes it').toBe(false);
    expect(keepsManualArea(unit(), 'p')).toBe(false);
    expect(keepsManualArea(manual(), undefined)).toBe(false);
  });
});

describe('what a re-accepted orientation carries over', () => {
  const painted = (over: Record<string, unknown> = {}) => unit({
    dental: { kind: 'two-contour', profileId: 'p', stamps: [{ at: 1 }], tuning: { density: 3 }, region: { contactFaces: [7] }, rim: {} },
    ...over,
  } as unknown as Partial<PrintUnit>);

  it('keeps the painted area and the tuning of a policy of the same kind and profile', () => {
    expect(keptDentalWork(painted(), 'p')).toEqual({ stamps: [{ at: 1 }], tuning: { density: 3 }, region: { contactFaces: [7] } });
  });

  /*
   * THE REGION COMES BACK WITH THE TUNING, and leaving it out was half a fix.
   *
   * A tuning number is not a setting read later -- it is the shape of the strip that was DRAWN for
   * it, and the two only mean anything together. Carried over a freshly detected region, the policy
   * disagrees with itself and a placement on it puts a tip NOWHERE: measured on case-001, nudging
   * Area width and then pressing Back and Next took the tip preview from 104 to zero, with the
   * stamps and the number both still stored and the preview reporting itself ready.
   */
  it('brings the region back with the tuning it was drawn for', () => {
    const kept = keptDentalWork(painted(), 'p');
    expect(kept?.region, 'the number and the area it drew are one answer, not two').toEqual({ contactFaces: [7] });
    expect(kept?.tuning).toEqual({ density: 3 });
  });

  it('carries nothing over when the appliance type changed', () => {
    // A different profile measures a different area, so marks made for the old one mean nothing.
    expect(keptDentalWork(painted(), 'other-profile')).toBeUndefined();
  });

  it('carries nothing over for a unit with no policy, or a policy of another kind', () => {
    expect(keptDentalWork(unit(), 'p')).toBeUndefined();
    expect(keptDentalWork(unit({ dental: { kind: 'manual-area', profileId: 'p' } } as unknown as Partial<PrintUnit>), 'p')).toBeUndefined();
  });

  /*
   * THE GAP THAT LET THIS THROUGH, pinned so it is not re-opened: the hand-work guard still does not
   * see painted stamps. That is correct for what it is FOR - Back out of Step 3 discards Step 3's
   * supports - but it is why the area needed keeping rather than confirming.
   */
  it('is not something backNeedsConfirm can see, which is why the area is kept rather than re-asked', () => {
    expect(backNeedsConfirm(painted())).toBe(false);
  });
});

describe('dental flow rules', () => {
  it('Back from Step 3 asks only when hand work would be discarded', () => {
    expect(backNeedsConfirm(unit())).toBe(false);
    expect(backNeedsConfirm(undefined)).toBe(false);
    expect(backNeedsConfirm(unit({ manual: [{ id: 'm' }] as never }))).toBe(true);
    expect(backNeedsConfirm(unit({ deleted: ['a'] }))).toBe(true);
    expect(backNeedsConfirm(unit({ contactSettings: { a: {} } }))).toBe(true);
    expect(manualEditCounts(unit({ manual: [{ id: 'm' }] as never, deleted: ['a', 'b'] }))).toEqual({ added: 1, removed: 2, customised: 0 });
  });
  it('a confirmed Back clears the hand work and nothing else', () => {
    expect(discardManualCommands(unit())).toEqual([]);
    expect(discardManualCommands(unit({ deleted: ['a'] }))).toEqual([{ type: 'supports/clear-manual', unitId: 'u1' }]);
  });
  it('Exit returns the aligner being worked on to a normal model: no supports, no dental policy', () => {
    const working = unit({ supports: { kind: 'live', data: {} }, dental: { kind: 'two-contour' } as never, deleted: ['a'] });
    expect(exitCommands(working)).toEqual([
      { type: 'supports/remove', unitId: 'u1' },
      { type: 'supports/clear-manual', unitId: 'u1' },
      { type: 'dental/clear', unitId: 'u1' },
    ]);
    // Step 2: a policy but no supports yet.
    expect(exitCommands(unit({ dental: { kind: 'two-contour' } as never }))).toEqual([{ type: 'dental/clear', unitId: 'u1' }]);
    // Step 1: nothing to clear.
    expect(exitCommands(unit())).toEqual([]);
  });
  /*
   * IT USED TO SPARE A FINISHED ALIGNER, and that test asserted the opposite of this one. The rule
   * changed on the owner's ruling of 2026-11-18: a done mark informs, it never blocks a redo. Sparing
   * meant the press did NOTHING on a model finished earlier and said nothing about why - and the
   * model whose print failed, or whose file was replaced, is exactly the one it is needed for. The
   * confirmation protects every unit now, by asking rather than by refusing.
   */
  it('Exit treats a finished aligner like any other: the done mark is not a lock', () => {
    const done = unit({ supports: { kind: 'live', data: {} }, dental: { kind: 'two-contour' } as never });
    expect(exitCommands(done)).toEqual([
      { type: 'supports/remove', unitId: 'u1' },
      { type: 'dental/clear', unitId: 'u1' },
    ]);
    expect(exitNeedsConfirm(done)).toBe(true);
    expect(exitCommands(undefined)).toEqual([]);
  });

  /*
   * THE GUARD THE CONTROL NEVER HAD. It was called Exit, read as navigation, removed built supports
   * and hand edits, and asked nothing - while Back out of Step 3, which discards strictly less, has
   * always asked. These cases are the rule: ask when there is work to lose, stay out of the way when
   * there is not.
   */
  it('Leaving the flow asks first exactly when it would destroy work', () => {
    expect(exitNeedsConfirm(unit())).toBe(false);
    expect(exitNeedsConfirm(undefined)).toBe(false);
    expect(exitNeedsConfirm(unit({ supports: { kind: 'live', data: {} } as never }))).toBe(true);
    expect(exitNeedsConfirm(unit({ deleted: ['a'] }))).toBe(true);
    expect(exitNeedsConfirm(unit({ manual: [{ id: 'm' }] as never }))).toBe(true);
    expect(exitNeedsConfirm(unit({ contactSettings: { a: {} } }))).toBe(true);
    // An area the operator painted themselves. `backNeedsConfirm` is blind to this (see W-01 above),
    // which is the whole reason this is a rule of its own rather than a call to that one.
    expect(exitNeedsConfirm(unit({ dental: { kind: 'legacy', origin: 'manual-area' } as never }))).toBe(true);
  });

  it('Leaving the flow also asks for Step 2 strokes and moved sliders (cia screen sweep, 2026-11-21)', () => {
    const profileId = 'reference-aligner';
    const start = defaultDentalTuning(profileId);
    const policy = (over: object) => unit({ dental: { kind: 'two-contour', profileId, stamps: [], tuning: start, ...over } as never });
    expect(exitNeedsConfirm(policy({}))).toBe(false);
    expect(exitNeedsConfirm(policy({ stamps: [{ kind: 'paint' }] }))).toBe(true);
    expect(exitNeedsConfirm(policy({ tuning: { ...start, density: start.density + 0.25 } }))).toBe(true);
    expect(exitNeedsConfirm(policy({ tuning: { ...start, stripWidthMm: start.stripWidthMm + 0.1 } }))).toBe(true);
  });

  it('Leaving the flow stays silent at Step 1, where the only cost is a redetect', () => {
    // A DETECTED policy and nothing else: `exitCommands` still clears it, and that is not worth a
    // dialog - the detector runs again in seconds, and a prompt on the commonest way out of the flow
    // is how an operator learns to dismiss prompts without reading them.
    const detected = unit({ dental: { kind: 'two-contour', profileId: 'p' } as never });
    expect(exitCommands(detected)).toEqual([{ type: 'dental/clear', unitId: 'u1' }]);
    expect(exitNeedsConfirm(detected)).toBe(false);
  });

  it('Leaving the flow asks about an aligner already finished too, because it will strip it', () => {
    const done = unit({ supports: { kind: 'live', data: {} } as never, deleted: ['a'] });
    expect(exitCommands(done)).toEqual([
      { type: 'supports/remove', unitId: 'u1' },
      { type: 'supports/clear-manual', unitId: 'u1' },
    ]);
    expect(exitNeedsConfirm(done)).toBe(true);
  });
});

/**
 * The denture flow as App runs it: each user action is a batch of scene commands and session events, and the undo
 * floor moves where App moves it (a mode entered from outside, a dental step begun). Returns what Undo can reach.
 */
function denturePlay(floorOnSteps: boolean) {
  let history: SceneHistory = createSceneHistory(emptyScene);
  let session: EditSession = initialSession;
  let floor: PrintScene | undefined;
  const act = (commands: SceneCommand[], ...events: SessionEvent[]) => {
    for (const command of commands) history = withSceneCommand(history, command);
    for (const event of events) {
      const next = reduceSession(session, event);
      if (startsEditing(session, next) || (floorOnSteps && startsDentalStep(session, next))) floor = history.present;
      session = next;
    }
  };
  const source: TriangleMesh = { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) };
  const denture: PrintUnit = { id: 'd1', name: 'D', source, transform: identityTransform, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {} };
  // Start screen: Denture supports, then the file (the import lands, Step 1 loads it).
  act([], { type: 'startDental', profile: DENTURE_PROFILE_ID });
  act([{ type: 'unit/add', unit: denture }, { type: 'selection/set', unitIds: ['d1'], activeUnitId: 'd1' }], { type: 'dentalLoading', unitId: 'd1' });
  // The scan's pick turns the denture; the dial turns it once more.
  act([{ type: 'transform/set', unitId: 'd1', transform: { position: [0, 0, 0], rotation: [0.2, 0, 0] } }], { type: 'dentureOriented' });
  act([{ type: 'transform/set', unitId: 'd1', transform: { position: [0, 0, 0], rotation: [0.3, 0, 0] } }]);
  // Next: the accepted pose, tips, settings and policy in one batch, then Step 2.
  const policy = defaultDenturePolicy(DENTURE_PROFILE_ID, false);
  act([{ type: 'batch', commands: acceptCommands(denture, { frame: { position: [0, 5, 0], rotation: [0.3, 0, 0] }, points: [], settings: {} as never, denture: { policy } }) }], { type: 'acceptDentalOrientation' });
  // Step 2: one denture setting change.
  act([{ type: 'denture/set', unitId: 'd1', denture: { policy, options: { ...DEFAULT_DENTURE_OPTIONS, modelLanding: 'any' } } }]);
  expect(session).toMatchObject({ mode: 'dental', dentalStage: 'review' });
  const undos: PrintScene[] = [];
  while (canUndo(history, floor) && undos.length < 10) {
    history = undoScene(history);
    undos.push(history.present);
  }
  return undos;
}

describe('undo inside the denture steps (audit 2026-11-02 #1)', () => {
  it('a step begins when the flow is entered, its stage changes, or Step 1 loads or finishes loading its object', () => {
    const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
    const started = run(initialSession, { type: 'startDental', profile: DENTURE_PROFILE_ID });
    expect(startsDentalStep(initialSession, started)).toBe(true);
    const loading = reduceSession(started, { type: 'dentalLoading', unitId: 'd1' });
    expect(startsDentalStep(started, loading)).toBe(true);
    const ready = reduceSession(loading, { type: 'dentureOriented' });
    expect(startsDentalStep(loading, ready)).toBe(true);
    const review = reduceSession(ready, { type: 'acceptDentalOrientation' });
    expect(startsDentalStep(ready, review)).toBe(true);
    // A tool change inside the step is not a new step; leaving the flow is not one either.
    expect(startsDentalStep(review, reduceSession(review, { type: 'setTool', tool: 'select' }))).toBe(false);
    expect(startsDentalStep(review, reduceSession(review, { type: 'exit' }))).toBe(false);
  });

  it('Undo in Step 2 takes back the Step 2 edit and stops: the accepted pose, the supports and the import stay', () => {
    const undos = denturePlay(true);
    expect(undos).toHaveLength(1);
    const unit = undos[0]!.units[0]!;
    expect(unit.supports).toBeDefined();
    expect(unit.denture?.options).toBeUndefined();
  });

  it('without the step floor, Undo in Step 2 removed the supports and then the imported denture itself', () => {
    const undos = denturePlay(false);
    expect(undos.some((scene) => scene.units[0] && !scene.units[0].supports)).toBe(true);
    expect(undos.at(-1)!.units).toHaveLength(0);
  });
});

/**
 * WHERE BACK OUT OF STEP 3 ACTUALLY GOES, which an increment got wrong and a walk check then
 * enshrined.
 *
 * An ALIGNER'S Back lands on Step 2, so its supports are not going anywhere and the dialog must not
 * say they are. Only a job with no area step - a denture - lands on the orient stage, and that is
 * the one where the owner's rule bites ("once support generated, orienting is not allowed and it
 * will remove all support"). This is cheap, it is pure, and it fails the moment the stage spine
 * changes under it; the browser walk could only ever have caught the sentence.
 */
describe('what Back out of Step 3 reaches, and therefore costs', () => {
  const built = (over: Partial<PrintUnit> = {}): PrintUnit => unit({
    supports: { kind: 'live', data: {} }, ...over,
  } as unknown as Partial<PrintUnit>);

  it('an aligner goes back to Step 2, so a build alone is not something Back loses', () => {
    expect(backEntersOrient('reference-aligner')).toBe(false);
    expect(backLosesWork(built(), 'reference-aligner')).toBe(false);
    expect(backCommands(built(), 'reference-aligner')).toEqual([]);
  });

  it('a denture goes back to the orient step, so the build goes with the hand work', () => {
    expect(backEntersOrient(DENTURE_PROFILE_ID)).toBe(true);
    expect(backLosesWork(built(), DENTURE_PROFILE_ID)).toBe(true);
    expect(backCommands(built(), DENTURE_PROFILE_ID).map((command) => command.type)).toEqual(['supports/remove']);
  });

  it('asks about hand work on either job, because Step 2 re-places the tips', () => {
    const handWork = built({ manual: [{ id: 'm' }] as never });

    expect(backLosesWork(handWork, 'reference-aligner')).toBe(true);
    expect(backCommands(handWork, 'reference-aligner').map((command) => command.type)).toEqual(['supports/clear-manual']);
  });
});
