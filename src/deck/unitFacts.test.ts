import { describe, expect, it } from 'vitest';
import type { DetectState } from '../items/detectState';
import type { PrintUnit } from '../state/project';
import { railReason, railStates } from './toolState';
import { TOOL_ORDER } from '../state/tools';
import { unitFacts } from './unitFacts';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u', name: 'n', ...over } as PrintUnit);
const policy = {} as PrintUnit['dental'];
/** An ACCEPTED denture policy (`denture/set`), which is what marks the job kind on a unit. */
const denturePolicy = {} as PrintUnit['denture'];
/*
 * REAL DRAFTS, open and closed. These used to be `{} as PrintUnit['rimDraft']` - an empty object
 * standing in for a rim - which is precisely why the suite could not see that one unclosed anchor
 * was opening the Area tool. A stand-in that cannot be wrong cannot catch anything.
 */
const anchor = { position: [0, 0, 0], normal: [0, 1, 0] } as unknown as NonNullable<PrintUnit['rimDraft']>['anchors'][number];
const openDraft = { anchors: [anchor], closed: false } as NonNullable<PrintUnit['rimDraft']>;
const closedDraft = { anchors: [anchor, anchor, anchor], closed: true } as NonNullable<PrintUnit['rimDraft']>;
const detected = (kind: DetectState['kind']) => (kind === 'oriented' ? { kind, turned: true } : { kind }) as DetectState;
const kinds = (u: PrintUnit, state?: DetectState, denture = false) =>
  Object.fromEntries(railStates(unitFacts(u, state, denture)).map(({ tool, state: got }) => [tool, got.kind]));

describe('what a unit presents to the rail', () => {
  it('reads a fresh import as nothing done', () => {
    expect(unitFacts(unit())).toEqual({ tools: TOOL_ORDER, oriented: false, hasRim: false, areaAccepted: false });
  });

  /*
   * THE BLOCKER THIS TEST EXISTS FOR. Nothing in the app writes `revisions`, so reading `oriented`
   * from that record alone reported false for every unit the batch had just oriented - and the rail
   * told the operator to turn a model that was already upright.
   */
  it('counts a model the detector found a pose for as oriented', () => {
    expect(unitFacts(unit(), detected('oriented')).oriented).toBe(true);
    expect(kinds(unit(), detected('oriented')))
      .toEqual({ orient: 'ready', rim: 'ready', area: 'unavailable', supports: 'unavailable' });
  });

  it('does not count a detection that could not run at all', () => {
    // `failed` means the job produced nothing usable, so there is no mesh answer to build a rim on.
    expect(unitFacts(unit(), detected('failed')).oriented).toBe(false);
  });

  /*
   * A RIM MEANS A CLOSED RIM. `rim/set` is dispatched on every anchor, so testing the draft for
   * existence opened Area on a single point - and an area cannot be measured from one point.
   */
  it('does not call one unclosed anchor a rim', () => {
    expect(unitFacts(unit({ rimDraft: openDraft })).hasRim).toBe(false);
    expect(kinds(unit({ rimDraft: openDraft, revisions: { orient: 1 } })))
      .toEqual({ orient: 'ready', rim: 'ready', area: 'unavailable', supports: 'unavailable' });
  });

  it('counts a closed rim as a rim, and NOT as an accepted area', () => {
    expect(unitFacts(unit({ rimDraft: closedDraft }))).toMatchObject({ hasRim: true, areaAccepted: false });
  });

  it('counts an accepted policy as both a rim and an area, since the policy carries its rim', () => {
    expect(unitFacts(unit({ dental: policy }))).toMatchObject({ hasRim: true, areaAccepted: true });
  });

  it('counts a detection that found NO rim, which is the unit that needs the rim tool most', () => {
    // The flow hands over to rim drawing on exactly this answer, so greying Rim here would withhold
    // the one tool the operator is being sent to.
    expect(unitFacts(unit(), detected('no-rim')).oriented).toBe(true);
  });

  it('does not count a drawn rim as an accepted orientation, which is backwards', () => {
    // Rim drawing is entered when detection found no rim, so a drawn rim is evidence the detector
    // came back empty - not that a pose was accepted.
    expect(unitFacts(unit({ rimDraft: closedDraft })).oriented).toBe(false);
  });

  it('infers orienting from an accepted footprint, which the flow cannot reach without Orient', () => {
    expect(unitFacts(unit({ dental: policy })).oriented).toBe(true);
  });

  it('takes a recorded orientation on a unit with nothing else done', () => {
    expect(unitFacts(unit({ revisions: { orient: 1 } })).oriented).toBe(true);
  });

  it('opens the rail for a project saved before revisions existed', () => {
    expect(kinds(unit({ dental: policy })))
      .toEqual({ orient: 'ready', rim: 'ready', area: 'ready', supports: 'ready' });
  });
});

/*
 * THE DENTURE PATH, which had no test at all until this block - although three lines of
 * `unitFacts.ts` exist solely because of it. The recorded fault: a denture that was oriented and
 * supported showed Area and Supports greyed, under the line "The area is measured from the rim, so
 * draw the rim first." on a job that never draws a rim and has no area step.
 *
 * `isDenture` appears in TWO facts, so each assertion below names which one it defends. Delete
 * either branch and something here must go red, or this block is decoration.
 *
 * It lives here and NOT in `toolState.test.ts` on purpose: that file works on a `ToolFacts` object
 * directly and has no denture knowledge by design - the job kind is resolved in `unitFacts`. Saying
 * so keeps the gap from being "fixed" in the file that cannot see it.
 */
describe('a denture is a different job, and the rail does not offer steps it lacks', () => {
  it('has a chain of two: there is no rim and no area to wait for', () => {
    // This REPLACED a worse answer. The facts used to claim a rim and an area were present, so the
    // rail would list all four and not instruct about the two it should never have offered. Now the
    // chain itself is short, so the question does not arise and the facts can say what is true.
    expect(unitFacts(unit({ denture: denturePolicy })))
      .toMatchObject({ tools: ['orient', 'supports'], oriented: true, hasRim: false, areaAccepted: false });
  });

  it('draws two buttons, not four with two of them meaningless', () => {
    expect(kinds(unit({ denture: denturePolicy }))).toEqual({ orient: 'ready', supports: 'ready' });
  });

  it('makes Supports wait on the ORIENTATION, which is what is above it in this chain', () => {
    // The old hand-written prerequisite said Supports waits for an accepted AREA, which a denture
    // never has - so the facts had to fake one. Derived from the chain, it waits for the right thing.
    expect(kinds(unit(), undefined, true)).toEqual({ orient: 'ready', supports: 'unavailable' });
    expect(railReason(unitFacts(unit(), undefined, true)))
      .toEqual({ key: 'Turn the model the right way up first.' });
  });

  it('says nothing once oriented, where it used to instruct about a rim', () => {
    expect(railReason(unitFacts(unit({ denture: denturePolicy })))).toBeUndefined();
  });

  /*
   * THE PRE-ACCEPTANCE WINDOW, which the earlier fix did not reach. `unit.denture` is written by
   * `denture/set` on ACCEPTANCE, so a denture that has been dropped and oriented but not accepted has
   * none - and reading only the unit treated it as an aligner for that whole window, telling the
   * operator to draw a rim on it. The run's profile knows the purpose from the start, so it is passed
   * in; this is the test that would have caught the gap.
   */
  it('is a denture from the drop, not from the acceptance', () => {
    expect(kinds(unit(), detected('oriented'), true)).toEqual({ orient: 'ready', supports: 'ready' });
    expect(railReason(unitFacts(unit(), detected('oriented'), true))).toBeUndefined();
  });

  it('is still waiting on Orient before it has an accepted policy', () => {
    // The guard against over-correcting: `unit.denture` is set on acceptance, so a freshly imported
    // denture has none and must read as nothing done. If this ever passes with `denture` undefined,
    // the job kind is being inferred from something earlier than acceptance.
    expect(unitFacts(unit())).toMatchObject({ oriented: false, hasRim: false, areaAccepted: false });
  });
});

describe('the one busy state the deck can honestly report', () => {
  it('is Orient, while its detection is running', () => {
    expect(unitFacts(unit(), detected('running')).runningTool).toBe('orient');
    expect(kinds(unit(), detected('running'))?.orient).toBe('busy');
  });

  it('is absent once the detection has answered', () => {
    expect(unitFacts(unit(), detected('oriented'))).not.toHaveProperty('busy');
    expect(unitFacts(unit())).not.toHaveProperty('busy');
  });

});

describe('staleness comes from the revisions and nothing else', () => {
  it('is quiet on a unit with no record', () => {
    expect(unitFacts(unit({ dental: policy }))).not.toHaveProperty('stale');
  });

  it('reports the tools a re-orient left behind', () => {
    const saved = unit({ dental: policy, revisions: { orient: 9, rim: 2, area: 3, supports: 4 } });
    expect(unitFacts(saved).stale).toEqual(['rim', 'area', 'supports']);
    expect(kinds(saved)).toEqual({ orient: 'ready', rim: 'stale', area: 'stale', supports: 'stale' });
  });
});
