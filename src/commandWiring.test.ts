import { describe, expect, it } from 'vitest';
import { commandIds, resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import { READY } from './dental/editing/uiFixture';
import './dental/editingMode';

/**
 * EVERY REGISTRY COMMAND REACHES A HANDLER. A command row in the registry is only half of a control: the
 * row makes the key appear, carry its label, its hint, its cap and its disabled reason - and a dock will
 * render it, and the keyboard will bind it, whether or not anything in `App.runCommand` acts on it. The
 * gap is silent. A press just does nothing.
 *
 * It bit on `dental.toolDown`: the command resolved, the key bound, the button drew, Esc reached it, and
 * the switch had no case, so the tool stayed in hand. Unit tests all passed (they ask the registry and
 * the reducer, neither of which is the switch); only the walk caught it, two minutes of browser per run.
 * This file is that walk check, in milliseconds.
 */
const SOURCES = import.meta.glob<string>(['./App.tsx'], { query: '?raw', import: 'default', eager: true });

/**
 * Commands with no case in `App.runCommand`, each with the reason. The list only ever shrinks: a new
 * command that needs a line here needs a reason, and a command wired up later leaves.
 */
/*
 * EMPTY, and that is the state to keep it in. It held the five `dental.rim.*` commands while rim define
 * mode was built ahead of the engine that finishes it; engine 61 and `drawnRim.ts` closed the last one.
 * A new entry here needs a reason that says what is missing, not that the work is unfinished.
 */
const UNWIRED: Partial<Record<CommandId, string>> = {
  // Rim define mode's drawing is not built yet: there is no viewport overlay to place or move an anchor
  // on, and no geocore call to turn a drawn loop into a rim (docs/handoff/geocore-rim-from-points.md).
  // The dock and its refusals are real; these five are the part still waiting on the engine.
};

describe('command wiring', () => {
  /** Every `case 'some.id':` label in App's command switch. Ids carry dots and hyphens (`export.active-printable`). */
  const cases = (() => {
    const code = Object.values(SOURCES)[0]!;
    expect(code).toContain('const runCommand');
    return new Set([...code.matchAll(/case '([a-z][\w.-]*)':/g)].map((match) => match[1]!));
  })();

  it('acts on every command the registry offers', () => {
    const missing = commandIds().filter((id) => !cases.has(id) && !(id in UNWIRED));
    expect(missing, 'add a case in App.runCommand, or a reason in UNWIRED').toEqual([]);
  });

  it('keeps no stale excuse: every unwired command is still a command, and still unwired', () => {
    const ids = new Set<string>(commandIds());
    for (const id of Object.keys(UNWIRED)) {
      expect(ids.has(id), `${id} is in UNWIRED but is not a command any more`).toBe(true);
      expect(cases.has(id), `${id} is wired now - take it out of UNWIRED`).toBe(false);
    }
  });

  it('switches on ids that exist: no case for a command the registry dropped', () => {
    const ids = new Set<string>(commandIds());
    // App switches on its own non-command strings too (modes, step names); only ids shaped like a
    // command - a dotted name whose first part is a known command's - are checked.
    const prefixes = new Set(commandIds().map((id) => id.split('.')[0]!));
    const strays = [...cases].filter((label) => label.includes('.') && prefixes.has(label.split('.')[0]!) && !ids.has(label));
    expect(strays, 'App has a case for a command id the registry no longer offers').toEqual([]);
  });

  /*
   * A command a dock renders must either DO something or say why it does not. An unwired command that is
   * visible AND enabled is a dead live button: the operator presses it and nothing happens, with no word
   * about why. Place and Adjust are the known pair - they are live, and their press is the gap the engine
   * handoff is about - so they are named here rather than waved through by a `continue`.
   */
  it('leaves no unwired command both visible and enabled, except the two the handoff names', () => {
    const drawing: UiState = { ...READY, mode: 'dental', dentalStage: 'rim', dentalRimAnchors: 4 };
    const live = (Object.keys(UNWIRED) as CommandId[]).filter((id) => {
      const command = resolve(id, drawing);
      return command.visible && command.enabled;
    });
    /*
     * EMPTY, and it has to stay empty: nothing the operator can press is left without a handler. The two
     * entries still in UNWIRED - Adjust and Done - are both OFF, and the loop below makes them say why.
     * An unwired command that was live would be a key that looks ready and does nothing.
     */
    expect(live.sort()).toEqual([]);
    // And the ones that are off say why, in words, not as a grey key with a silent tooltip.
    for (const id of Object.keys(UNWIRED) as CommandId[]) {
      const command = resolve(id, drawing);
      if (!command.visible || command.enabled) continue;
      expect(command.disabledReason?.key, `${id} is off with no reason`).toBeTruthy();
    }
  });
});
