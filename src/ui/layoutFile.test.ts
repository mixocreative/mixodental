import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * src/styles/layout.css is the designer's file: the whole layout of the 3D view, and the only place to change
 * it. That only stays true if the layout stays in it. These tests fail when a measurement or a placement leaks
 * back into the general stylesheet, which is how the app got here in the first place - a panel at a time, each
 * carrying coordinates of its own.
 */

const LAYOUT = new TextDecoder().decode(readFileSync('src/styles/layout.css'));
const STYLES = new TextDecoder().decode(readFileSync('src/styles.css'));
const THEME = new TextDecoder().decode(readFileSync('src/styles/theme.css'));

/** The declarations a designer edits. */
const KNOBS = ['--dock-gap', '--dock-left', '--dock-right', '--dock-columns', '--dock-rows',
  '--dock-title-column', '--dock-widgets-column', '--dock-scene-column', '--dock-controls-column',
  '--status-inset-left', '--status-inset-right'];

describe('src/styles/layout.css', () => {
  it('declares every layout knob', () => {
    expect(KNOBS.filter((knob) => !new RegExp(`^\\s*${knob}\\s*:`, 'm').test(LAYOUT))).toEqual([]);
  });

  // Declared in two files, the second one silently wins and the designer's file stops being the truth.
  it('is the only file that declares them', () => {
    const leaked = KNOBS.filter((knob) => new RegExp(`^\\s*${knob}\\s*:`, 'm').test(STYLES) || new RegExp(`^\\s*${knob}\\s*:`, 'm').test(THEME));
    expect(leaked).toEqual([]);
  });

  // Each thing in the view names a COLUMN, never a side or an offset: that is what makes moving one a number.
  it('places every docked part by column, not by coordinates', () => {
    for (const knob of ['--dock-title-column', '--dock-widgets-column', '--dock-scene-column', '--dock-controls-column']) {
      expect(LAYOUT, `${knob} is declared but nothing is placed by it`).toContain(`grid-column: var(${knob})`);
    }
  });

  it('keeps the 3D view\'s layout out of the general stylesheet', () => {
    expect(STYLES).not.toContain('--dock-');
    expect(STYLES).not.toMatch(/\.workspace--dental\s+\.viewport\s*\{[^}]*display:\s*grid/);
  });
});
