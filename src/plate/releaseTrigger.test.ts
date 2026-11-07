import { describe, expect, it } from 'vitest';

/*
 * A TRIPWIRE, not a test of behaviour. `releaseFinished` is built and tested (releasedBuild.test.ts)
 * and deliberately NOT CALLED: turning it on while every unit is still drawn released geometry that
 * was still in use, and a finished aligner's supports vanished from the plate. That shipped in
 * c4bb62f and was switched off in 1639433.
 *
 * TWO THINGS MUST LAND IN THE SAME CHANGE as the first caller, both found by code review. Neither is
 * fixed in advance, because writing a fix for a trigger that does not exist is how the premise got
 * wrong the first time — step 11 was built on the job deck's "one inspect page at a time" while no
 * deck existed. So instead this fails the moment a caller appears, and says what it owes:
 *
 *   1. `problems` holds the FULL MESH per checked unit (`setProblems(… { unit, mesh, items })`),
 *      pruned only when the unit leaves the scene — and export is what makes a unit finished. While
 *      that entry points at the mesh, releasing the build frees NOTHING. The problems entry must be
 *      released in the same step, or step 11's whole justification is still unmet.
 *
 *   2. A released unit must be REBUILDABLE. `requested.current` refuses to rebuild an unchanged unit
 *      and `buildSettled` reports it settled, so re-opening a released row shows no supports, no
 *      spinner and no clean check — for ever. Its `requested` entry has to be cleared on re-open.
 *
 * When both are done: add the caller, satisfy this file's expectations, and delete it.
 */

const APP = import.meta.glob<string>('../App.tsx', { query: '?raw', import: 'default', eager: true });
const SOURCES = import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true });

/** Call sites, not the import and not this file: `releaseFinished(` with an argument list. */
const callers = Object.entries(SOURCES)
  .filter(([path]) => !path.includes('releaseTrigger.test') && !path.includes('releasedBuild'))
  .filter(([, text]) => /releaseFinished\s*\(/.test(text))
  .map(([path]) => path);

describe('the geometry release trigger', () => {
  it('reads a real App.tsx, so the checks below are not vacuous', () => {
    // Without this, a broken glob would make every assertion here pass by accident - which is the
    // fault this session found three times in its own new tests.
    expect(Object.keys(APP)).toHaveLength(1);
    expect(Object.values(APP)[0]!.length).toBeGreaterThan(10000);
  });

  it('is still OFF, and the two fixes above are owed before it goes on', () => {
    expect(callers, 'releaseFinished has a caller: see this file for what must land with it').toEqual([]);
  });

  it('has not had its two debts quietly paid by something else', () => {
    const app = Object.values(APP)[0]!;
    // If either of these stops being true, the note in App.tsx is stale and this tripwire is lying.
    expect(app, 'problems no longer stores a mesh - re-read this file').toContain('{ unit, mesh, items }');
    expect(app, 'requested.current is gone - re-read this file').toContain('requested.current');
  });
});
