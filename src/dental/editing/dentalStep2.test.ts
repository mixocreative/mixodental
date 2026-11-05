import { describe, expect, it } from 'vitest';
import { commandIds, resolve, type UiState } from '@mixo-geocore/editing/commands';
import { canvasGesture, gesture } from '@mixo-geocore/editing/gesture';
import { keyAction } from '@mixo-geocore/editing/keys';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { READY } from './uiFixture';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const area = run(initialSession, { type: 'enterDental' }, { type: 'chooseDentalProfile', id: 'p' }, { type: 'dentalLoading', unitId: 'u1' },
  { type: 'dentalOriented', proposal: {} as never, notices: [] }, { type: 'acceptDentalOrientation' });
const ui = (over: Partial<UiState>): UiState => ({ ...READY, mode: 'dental', dentalStage: 'area', ...over });

describe('dental Step 2 tools (B3)', () => {
  /*
    * A STEP OPENS WITH NO TOOL IN HAND, the way a drawing program does: the model is inert and a drag
    * turns the view until the operator picks one. `tool` still names which tool WOULD be picked, so the
    * dock can show a sensible default, but nothing is armed until `setDentalTool` says so.
    */
  it('opens Step 2 with no tool in hand, so the model is inert until one is picked', () => {
    expect(area).toMatchObject({ dentalStage: 'area', dentalToolArmed: false });
    expect(gesture(area)).toMatchObject({ kind: 'dental-area', brush: undefined, edit: undefined });
    // Nothing for the canvas to do with a press: it falls through and the view turns.
    expect(canvasGesture(gesture(area))).toMatchObject({ kind: 'dental-area', brush: undefined, edit: undefined });
  });

  it('arms the tool the operator picks, and each one maps to its canvas gesture', () => {
    const paint = run(area, { type: 'setDentalTool', tool: 'paint' });
    expect(gesture(paint)).toMatchObject({ kind: 'dental-area', brush: { kind: 'allow', radius: 2 }, edit: undefined });
    expect(gesture(run(area, { type: 'setDentalTool', tool: 'erase' }))).toMatchObject({ kind: 'dental-area', brush: { kind: 'erase', radius: 2 } });
    const add = run(area, { type: 'setDentalTool', tool: 'add' });
    expect(gesture(add)).toMatchObject({ kind: 'dental-area', brush: undefined, edit: { kind: 'add', remove: false } });
    expect(canvasGesture(gesture(add))).toEqual({ kind: 'add', remove: false });
    const select = run(area, { type: 'setDentalTool', tool: 'select' }, { type: 'setSelectStyle', style: 'brush' });
    expect(canvasGesture(gesture(select))).toMatchObject({ kind: 'drag' });
    // Paint and Erase paint: the canvas keeps the area gesture.
    expect(canvasGesture(gesture(paint)).kind).toBe('dental-area');
  });

  /*
   * GOING BACK GOES OUT ONE LEVEL. The rungs, from the inside out: the tool in hand goes down, then the
   * step, then the flow. Before this one Esc anywhere left the whole flow, which is a long way to travel
   * for the key a drawing program uses to put the brush down.
   */
  it('picking a tool only ever ARMS it, however many times the same one is picked', () => {
    const paint = run(area, { type: 'setDentalTool', tool: 'paint' });
    expect(paint).toMatchObject({ tool: 'paint', dentalToolArmed: true });
    /*
     * NOT A TOGGLE, deliberately. P/E/A/S run this same path, so a toggle would make "press A to put Add
     * in hand" depend on what was in hand before - the walk caught exactly that, pressing `a` before
     * setting Click reach and having the field taken away. A pressed segment that unpresses on a second
     * press is also a checkbox in a radio button's clothes, and a double-click would empty the hand.
     */
    expect(run(paint, { type: 'setDentalTool', tool: 'paint' })).toMatchObject({ tool: 'paint', dentalToolArmed: true });
    expect(run(paint, { type: 'setDentalTool', tool: 'paint' }, { type: 'setDentalTool', tool: 'paint' })).toMatchObject({ dentalToolArmed: true });
    expect(run(paint, { type: 'setDentalTool', tool: 'erase' })).toMatchObject({ tool: 'erase', dentalToolArmed: true });
  });

  it('puts the tool down on its own event, which is the only way back to an empty hand', () => {
    const paint = run(area, { type: 'setDentalTool', tool: 'paint' });
    const down = run(paint, { type: 'dropDentalTool' });
    // The tool is still NAMED - the switch knows which one would come back - but nothing is in hand.
    expect(down).toMatchObject({ tool: 'paint', dentalToolArmed: false });
    expect(gesture(down)).toMatchObject({ kind: 'dental-area', brush: undefined, edit: undefined });
    expect(run(down, { type: 'setDentalTool', tool: 'paint' })).toMatchObject({ tool: 'paint', dentalToolArmed: true });
    // Nothing in hand: the event is inert rather than a new object for React to re-render on.
    expect(run(area, { type: 'dropDentalTool' })).toBe(area);
  });

  it('stops advertising Esc on Put it down while a selection would take the press', () => {
    expect(resolve('dental.toolDown', ui({ dentalToolArmed: true })).shortcut).toBe('Esc');
    expect(resolve('dental.toolDown', ui({ dentalToolArmed: true, selection: 2 })).shortcut).toBeUndefined();
    // And the press itself goes to the rung above: the selection, then the tool.
    const press = (over: Partial<UiState>) => keyAction({ key: 'Escape', ctrl: false, shift: false, target: null, ui: ui(over) }).command;
    expect(press({ dentalToolArmed: true, selection: 2 })).toBe('edit.clearSelection');
    expect(press({ dentalToolArmed: true, selection: 0 })).toBe('dental.toolDown');
  });

  it('offers Put it down only while a tool IS in hand, in the steps that have tools', () => {
    expect(resolve('dental.toolDown', ui({ dentalToolArmed: true })).visible).toBe(true);
    expect(resolve('dental.toolDown', ui({ dentalToolArmed: true })).enabled).toBe(true);
    expect(resolve('dental.toolDown', ui({})).visible).toBe(false);
    expect(resolve('dental.toolDown', ui({ dentalStage: 'review', dentalToolArmed: true })).visible).toBe(true);
    for (const dentalStage of ['type', 'aligner', 'rim'] as const) {
      expect(resolve('dental.toolDown', ui({ dentalStage, dentalToolArmed: true })).visible, dentalStage).toBe(false);
    }
  });

  it('Add is forced to add in Step 2, even with Remove left on', () => {
    const remove = run(area, { type: 'setDentalTool', tool: 'add' }, { type: 'setAddAction', action: 'remove' });
    expect(canvasGesture(gesture(remove))).toEqual({ kind: 'add', remove: false });
  });

  it('Step 2 selects tips; Step 3 always starts on Add, whatever Step 2 left on', () => {
    const picked = run(area, { type: 'setTool', tool: 'select' }, { type: 'toggleContact', id: 'a' });
    expect([...picked.selection]).toEqual(['a']);
    expect(run(area, { type: 'acceptDentalArea' })).toMatchObject({ dentalStage: 'review', tool: 'add', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'erase' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'add', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'select' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'add', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'add' }, { type: 'setAddAction', action: 'remove' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'add', addAction: 'add' });
    // Back into Step 2 offers Paint again, and again with nothing in hand.
    expect(run(area, { type: 'setTool', tool: 'select' }, { type: 'acceptDentalArea' }, { type: 'backDental' })).toMatchObject({ dentalStage: 'area', tool: 'paint', dentalToolArmed: false });
  });

  it('no other mode starts on Paint or Erase', () => {
    expect(run(area, { type: 'exit' }).tool).toBe('add');
    expect(run(area, { type: 'setTool', tool: 'select' }, { type: 'exit' }).tool).toBe('select');
  });

  it('the four tool commands are live only in Step 2 and pressed with their tool', () => {
    for (const [tool, id] of [['paint', 'dental.tool.paint'], ['erase', 'dental.tool.erase'], ['add', 'dental.tool.add'], ['select', 'dental.tool.select']] as const) {
      expect(commandIds()).toContain(id);
      expect(resolve(id, ui({ tool })).enabled).toBe(true);
      // Pressed means IN HAND, not merely named: a step opens with a default tool and none armed.
      expect(resolve(id, ui({ tool })).pressed).toBe(false);
      expect(resolve(id, ui({ tool, dentalToolArmed: true })).pressed).toBe(true);
      expect(resolve(id, ui({ tool: tool === 'paint' ? 'erase' : 'paint', dentalToolArmed: true })).pressed).toBe(false);
      expect(resolve(id, ui({ dentalStage: 'review' })).visible).toBe(false);
      expect(resolve(id, ui({ dentalStage: 'review' })).enabled).toBe(false);
      expect(resolve(id, ui({ heavy: 1_600_000 })).enabled).toBe(false);
    }
  });

  it('P, E, A and S switch the tools in Step 2 only; Delete and Esc act on a selection there', () => {
    const press = (key: string, over: Partial<UiState> = {}, ctrl = false) => keyAction({ key, ctrl, shift: false, target: null, ui: ui(over) }).command;
    expect([press('p'), press('e'), press('a'), press('s')]).toEqual(['dental.tool.paint', 'dental.tool.erase', 'dental.tool.add', 'dental.tool.select']);
    expect(press('P')).toBe('dental.tool.paint');
    expect(press('p', {}, true)).toBeUndefined();
    expect(press('p', { dentalStage: 'review' })).toBeUndefined();
    expect(press('Delete', { selection: 2 })).toBe('edit.deleteSelection');
    expect(press('Backspace', { selection: 2 })).toBe('edit.deleteSelection');
    expect(press('Escape', { selection: 2 })).toBe('edit.clearSelection');
    // Esc out of a tool, then out of the flow: a selection first, then the tool in hand, then the flow.
    expect(press('Escape', { selection: 2, dentalToolArmed: true })).toBe('edit.clearSelection');
    expect(press('Escape', { selection: 0, dentalToolArmed: true })).toBe('dental.toolDown');
    expect(press('Escape', { selection: 0 })).toBe('dental.exit');
    expect(press('Delete', { selection: 0 })).toBeUndefined();
  });
});
