import { describe, expect, it } from 'vitest';
import { commandIds, resolve, type UiState } from '@mixo-geocore/editing/commands';
import { canvasGesture, gesture } from '@mixo-geocore/editing/gesture';
import { keyAction } from '@mixo-geocore/editing/keys';
import { initialSession, reduceSession, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { READY } from './uiFixture';

const run = (state: EditSession, ...events: SessionEvent[]) => events.reduce(reduceSession, state);
const area = run(initialSession, { type: 'startDental', profile: 'p' }, { type: 'dentalLoading', unitId: 'u1' },
  { type: 'dentalOriented', proposal: {} as never, notices: [] }, { type: 'acceptDentalOrientation' });
const ui = (over: Partial<UiState>): UiState => ({ ...READY, mode: 'dental', dentalStage: 'area', ...over });

describe('dental Step 2 tools (B3)', () => {
  /*
    * A STEP OPENS ON SELECT, the way a drawing program opens on the arrow. Select is the one tool that
    * changes nothing until the operator asks it to, so it is the safe place to rest - and because it is
    * a tool like any other, there is no empty hand anywhere in the flow and nothing to "put down".
    */
  it('opens Step 2 on Select, the tool that changes nothing until it is asked to', () => {
    expect(area).toMatchObject({ dentalStage: 'area', tool: 'select' });
    expect(gesture(area)).toMatchObject({ kind: 'dental-area', brush: undefined });
    // Select, click style: a click picks the nearest tip; it marks nothing.
    expect(canvasGesture(gesture(area))).toEqual({ kind: 'pick' });
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
    expect(paint).toMatchObject({ tool: 'paint' });
    /*
     * NOT A TOGGLE, deliberately. P/E/A/S run this same path, so a toggle would make "press A to put Add
     * in hand" depend on what was in hand before - the walk caught exactly that, pressing `a` before
     * setting Click reach and having the field taken away. A pressed segment that unpresses on a second
     * press is also a checkbox in a radio button's clothes, and a double-click would empty the hand.
     */
    expect(run(paint, { type: 'setDentalTool', tool: 'paint' })).toMatchObject({ tool: 'paint' });
    expect(run(paint, { type: 'setDentalTool', tool: 'paint' }, { type: 'setDentalTool', tool: 'paint' })).toMatchObject({ tool: 'paint' });
    expect(run(paint, { type: 'setDentalTool', tool: 'erase' })).toMatchObject({ tool: 'erase' });
  });

  it('puts a brush down by picking Select up, which is the only way and needs no key of its own', () => {
    const paint = run(area, { type: 'setDentalTool', tool: 'paint' });
    expect(gesture(paint)).toMatchObject({ kind: 'dental-area', brush: { kind: 'allow' }, edit: undefined });
    const back = run(paint, { type: 'setDentalTool', tool: 'select' });
    expect(back).toMatchObject({ tool: 'select' });
    expect(gesture(back)).toMatchObject({ kind: 'dental-area', brush: undefined });
    // No command is left that empties the hand: Select is on the switch, so Esc's twin is already there.
    expect(commandIds()).not.toContain('dental.toolDown');
  });

  it('Add is forced to add in Step 2, even with Remove left on', () => {
    const remove = run(area, { type: 'setDentalTool', tool: 'add' }, { type: 'setAddAction', action: 'remove' });
    expect(canvasGesture(gesture(remove))).toEqual({ kind: 'add', remove: false });
  });

  it('Step 2 selects tips; Step 3 always starts on Select, whatever Step 2 left on', () => {
    const picked = run(area, { type: 'setTool', tool: 'select' }, { type: 'toggleContact', id: 'a' });
    expect([...picked.selection]).toEqual(['a']);
    // EVERY step opens on the tool that changes nothing, so a brush never carries across a step edge.
    expect(run(area, { type: 'acceptDentalArea' })).toMatchObject({ dentalStage: 'review', tool: 'select', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'erase' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'select', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'select' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'select', addAction: 'add' });
    expect(run(area, { type: 'setTool', tool: 'add' }, { type: 'setAddAction', action: 'remove' }, { type: 'acceptDentalArea' })).toMatchObject({ tool: 'select', addAction: 'add' });
    // Back into Step 2 rests on Select too.
    expect(run(area, { type: 'setTool', tool: 'select' }, { type: 'acceptDentalArea' }, { type: 'backDental' })).toMatchObject({ dentalStage: 'area', tool: 'select' });
  });

  it('no other mode starts on Paint or Erase', () => {
    // Step 2 rests on Select, which every mode can hold, so leaving carries it out unchanged.
    expect(run(area, { type: 'exit' }).tool).toBe('select');
    // A brush is Step 2's alone: leaving on one falls back to Add, which the generic modes do have.
    expect(run(area, { type: 'setDentalTool', tool: 'paint' }, { type: 'exit' }).tool).toBe('add');
    expect(run(area, { type: 'setDentalTool', tool: 'erase' }, { type: 'exit' }).tool).toBe('add');
  });

  it('the four tool commands are live only in Step 2 and pressed with their tool', () => {
    for (const [tool, id] of [['paint', 'dental.tool.paint'], ['erase', 'dental.tool.erase'], ['add', 'dental.tool.add'], ['select', 'dental.tool.select']] as const) {
      expect(commandIds()).toContain(id);
      expect(resolve(id, ui({ tool })).enabled).toBe(true);
      // The tool named IS the tool in hand: there is no armed flag beside it any more.
      expect(resolve(id, ui({ tool })).pressed).toBe(true);
      expect(resolve(id, ui({ tool: tool === 'paint' ? 'erase' : 'paint' })).pressed).toBe(false);
      // None of the four is SHOWN in Step 3, which has its own switch. Select alone is still ENABLED
      // there, because Esc in Step 3 runs it to go back to Select and `keyAction` drops a disabled one.
      expect(resolve(id, ui({ dentalStage: 'review' })).visible).toBe(false);
      expect(resolve(id, ui({ dentalStage: 'review' })).enabled).toBe(tool === 'select');
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
    expect(press('Escape', { selection: 2, tool: 'select' })).toBe('edit.clearSelection');
    /*
     * ONE LEVEL PER PRESS: the selection, then back to Select, then the flow. The middle rung used to
     * empty the hand; now it picks up the tool that changes nothing, which is where the step opened.
     */
    expect(press('Escape', { selection: 2, tool: 'paint' })).toBe('edit.clearSelection');
    expect(press('Escape', { selection: 0, tool: 'paint' })).toBe('dental.tool.select');
    expect(press('Escape', { selection: 0, tool: 'add' })).toBe('dental.tool.select');
    expect(press('Escape', { selection: 0, tool: 'select' })).toBe('dental.exit');
    expect(press('Delete', { selection: 0 })).toBeUndefined();
  });
});
