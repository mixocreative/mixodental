import { describe, expect, it } from 'vitest';
import { CLICK_TOLERANCE } from '@mixo-geocore/editing/pick';
import { moveCommands, movePress, moveRelease, type TipPress } from './tipMove';
import type { PrintUnit } from '../state/project';

/**
 * THE MEANING OF A TIP DRAG, TESTED WITHOUT A VIEWPORT.
 *
 * This is the point of lifting it out of the renderers: three.js and Babylon each own listeners, a
 * camera lock and a raycast, and neither owns a rule. Every rule below would otherwise have been
 * written twice and checked only by a twenty-minute walk.
 */

const press = (over: Partial<TipPress> = {}): TipPress =>
  ({ hit: 'support', button: 'left', tool: 'select', selectStyle: 'click', active: true, contact: true, selected: true, ...over });

const point = (id: string) => ({ id, regionId: -1, position: [1, 2, 3], normal: [0, -1, 0], source: 'interior' });
const unit = (over: Partial<PrintUnit> = {}) =>
  ({ id: 'u-a', manual: [], deleted: [], contactSettings: {}, ...over } as unknown as PrintUnit);

describe('movePress', () => {
  it('arms a move on a selected tip of the active object, under Select and Click', () => {
    expect(movePress(press())).toBe(true);
  });

  /*
   * THE SELECTED-ONLY RULE, and it is the reason this gesture is safe to have at all: the whole body
   * of a support maps back to its contact, so an unselected tip under the press must stay an orbit.
   */
  it('refuses a tip nobody selected, so an orbit can still start on a pillar', () => {
    expect(movePress(press({ selected: false }))).toBe(false);
  });

  it('refuses everything that is not a left press on an active object s own contact', () => {
    expect(movePress(press({ hit: 'model' }))).toBe(false);
    expect(movePress(press({ button: 'right' }))).toBe(false);
    expect(movePress(press({ active: false }))).toBe(false);
    // Braces, raft and labels are support geometry with no contact behind them.
    expect(movePress(press({ contact: false }))).toBe(false);
  });

  it('leaves the left button to Drag over, whose stroke starts the same way', () => {
    expect(movePress(press({ selectStyle: 'brush' }))).toBe(false);
    expect(movePress(press({ tool: 'add' }))).toBe(false);
  });
});

describe('moveRelease', () => {
  /*
   * A MOVE AND A CLICK CAN NEVER BOTH HAPPEN FROM ONE PRESS. Two listeners hear one pointerup - the
   * ordinary click path and this gesture - and the only thing keeping them apart is this boundary,
   * which is the same four pixels `pickAction` already uses to tell a click from an orbit.
   */
  it('is a click up to the tolerance and a move past it', () => {
    expect(moveRelease({ travel: 0, onModel: true, cancelled: false })).toBe('click');
    expect(moveRelease({ travel: CLICK_TOLERANCE, onModel: true, cancelled: false })).toBe('click');
    expect(moveRelease({ travel: CLICK_TOLERANCE + 1, onModel: true, cancelled: false })).toBe('move');
  });

  /*
   * OFF THE MODEL CANCELS, where a rim anchor commits its last good point. The last valid point on
   * the way off a model is the silhouette edge - a grazing face, and the worst possible place to
   * stand a support - so a drag that leaves the surface must change nothing.
   */
  it('cancels a drag released off the model, rather than committing the silhouette edge', () => {
    expect(moveRelease({ travel: 40, onModel: false, cancelled: false })).toBe('cancel');
  });

  it('cancels when the gesture was cancelled, however far it travelled', () => {
    expect(moveRelease({ travel: 40, onModel: true, cancelled: true })).toBe('cancel');
    expect(moveRelease({ travel: 0, onModel: true, cancelled: true })).toBe('cancel');
  });
});

describe('moveCommands', () => {
  const to = { position: [9, 9, 9] as const, normal: [0, 1, 0] as const };

  /*
   * A MANUAL TIP KEEPS ITS ID, which is the entire reason `manual/move` exists rather than the
   * delete-and-add this app could already express: `contactSettings` is keyed by id, so the tip's own
   * settings travel with it and the whole move is one entry on the history.
   */
  it('moves a manual tip in place, keeping its id and so its own settings', () => {
    const subject = unit({ manual: [point('manual-1')], contactSettings: { 'manual-1': { neckDiameter: 0.9 } } } as unknown as Partial<PrintUnit>);

    const { commands, selectId } = moveCommands(subject, 'manual-1', { position: [...to.position], normal: [...to.normal] }, () => 'manual-NEW');

    expect(selectId).toBe('manual-1');
    expect(commands).toEqual([{ type: 'manual/move', unitId: 'u-a', pointId: 'manual-1', position: [9, 9, 9], normal: [0, 1, 0] }]);
  });

  /*
   * AN AUTOMATIC TIP CANNOT STAY AUTOMATIC: automatic tips are re-derived from the placement on every
   * regenerate, so a moved one has nowhere to live and the next build would put it back. It becomes a
   * manual tip at the new spot plus a deletion at the old one.
   */
  it('turns an automatic tip into a manual one at the new spot, and deletes the old', () => {
    const subject = unit();

    const { commands, selectId } = moveCommands(subject, 'auto-7', { position: [...to.position], normal: [...to.normal] }, () => 'manual-NEW');

    expect(selectId).toBe('manual-NEW');
    expect(commands.map((command) => command.type)).toEqual(['deletion/add', 'manual/add']);
    expect(commands[0]).toEqual({ type: 'deletion/add', unitId: 'u-a', pointIds: ['auto-7'] });
  });

  /*
   * AND ITS SETTINGS ARE RE-APPLIED UNDER THE NEW ID, because `deletion/add` drops the old id's entry
   * as it goes past. Without this, moving a support the operator had given its own pillar size would
   * silently hand it the defaults - a change nobody asked for, reported by nothing.
   */
  it('carries an automatic tip s own settings across to the new id', () => {
    const subject = unit({ contactSettings: { 'auto-7': { neckDiameter: 1.1 } } } as unknown as Partial<PrintUnit>);

    const { commands } = moveCommands(subject, 'auto-7', { position: [...to.position], normal: [...to.normal] }, () => 'manual-NEW');

    expect(commands.map((command) => command.type)).toEqual(['deletion/add', 'manual/add', 'contactSettings/set']);
    expect(commands.at(-1)).toEqual({ type: 'contactSettings/set', unitId: 'u-a', contactIds: ['manual-NEW'], patch: { neckDiameter: 1.1 } });
  });
});
