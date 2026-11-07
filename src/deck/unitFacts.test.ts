import { describe, expect, it } from 'vitest';
import type { DetectState } from '../items/detectState';
import type { PrintUnit } from '../state/project';
import { railStates } from './toolState';
import { unitFacts } from './unitFacts';

const unit = (over: Partial<PrintUnit> = {}) => ({ id: 'u', name: 'n', ...over } as PrintUnit);
const policy = {} as PrintUnit['dental'];
/*
 * REAL DRAFTS, open and closed. These used to be `{} as PrintUnit['rimDraft']` - an empty object
 * standing in for a rim - which is precisely why the suite could not see that one unclosed anchor
 * was opening the Area tool. A stand-in that cannot be wrong cannot catch anything.
 */
const anchor = { position: [0, 0, 0], normal: [0, 1, 0] } as unknown as NonNullable<PrintUnit['rimDraft']>['anchors'][number];
const openDraft = { anchors: [anchor], closed: false } as NonNullable<PrintUnit['rimDraft']>;
const closedDraft = { anchors: [anchor, anchor, anchor], closed: true } as NonNullable<PrintUnit['rimDraft']>;
const detected = (kind: DetectState['kind']) => (kind === 'oriented' ? { kind, turned: true } : { kind }) as DetectState;
const kinds = (u: PrintUnit, state?: DetectState) =>
  Object.fromEntries(railStates(unitFacts(u, state)).map(({ tool, state: got }) => [tool, got.kind]));

describe('what a unit presents to the rail', () => {
  it('reads a fresh import as nothing done', () => {
    expect(unitFacts(unit())).toEqual({ oriented: false, hasRim: false, areaAccepted: false });
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
