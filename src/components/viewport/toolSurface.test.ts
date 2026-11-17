import { describe, expect, it } from 'vitest';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import { canvasCursor } from './style';
import { pointerOnTool, toolActsOnSurface } from './toolSurface';

/*
 * THE TEST THAT WOULD HAVE CAUGHT IT, and the reason it is written against the CURSOR rather than
 * against the predicate alone.
 *
 * `canvasCursor` was never wrong. It was handed `false` forever, because the viewport asked "is a
 * brush armed" where it meant "is the pointer on the surface the tool acts on". So a test of either
 * piece on its own passes while the pair is broken - which is the whole class of defect this app's
 * own audit doctrine calls a cross-boundary one. The assertion below is therefore the OPERATOR's:
 * over the model, in a mode whose tool acts on the model, the pointer must not be the camera's hand.
 */

const g = (gesture: Partial<Gesture> & { kind: Gesture['kind'] }) => gesture as Gesture;

/** Every mode whose tool reaches the surface, with the cursor an operator must see over the model. */
const ON_SURFACE: ReadonlyArray<readonly [string, Gesture]> = [
  ['rim define', g({ kind: 'dental-rim' })],
  ['Step 2 add', g({ kind: 'dental-area', edit: { kind: 'add' } } as never)],
  ['Support Edit add', g({ kind: 'dental-review', edit: { kind: 'add' } } as never)],
];

describe('the pointer says whether it holds a tool or the camera', () => {
  it.each(ON_SURFACE)('%s acts on the surface', (_name, gesture) => {
    expect(toolActsOnSurface(gesture)).toBe(true);
  });

  /*
   * THE REGRESSION, ASSERTED ACROSS THE SEAM IT ACTUALLY CROSSED.
   *
   * An earlier version of this test wrote `canvasCursor(gesture, true)` and passed on the broken
   * build, because `canvasCursor` was always right and the defect was the `false` handed to it. A
   * test that supplies the correct input by hand cannot see a fault in who supplies it. So the
   * cursor is read through `pointerOnTool`, the same way the viewport reads it, and the only thing
   * stated by hand is the fact an operator can see: the pointer is over the model.
   */
  it.each(ON_SURFACE)('%s never shows the camera hand while the pointer is on the model', (_name, gesture) => {
    expect(canvasCursor(gesture, pointerOnTool(gesture, { hover: true }))).not.toBe('grab');
  });

  it.each(ON_SURFACE)('%s DOES show the camera hand off the model, where a drag really does orbit', (_name, gesture) => {
    expect(canvasCursor(gesture, pointerOnTool(gesture, { hover: false }))).toBe('grab');
  });

  it('the drag-over circle owns the pointer even where the gesture would not', () => {
    const picking = g({ kind: 'pick' });
    expect(pointerOnTool(picking, { hover: true })).toBe(false);
    expect(pointerOnTool(picking, { hover: false, circleOver: true })).toBe(true);
  });

  it('rim define mode shows the rim cursor, with its hot spot at the point that will land', () => {
    const rim = g({ kind: 'dental-rim' });
    const cursor = canvasCursor(rim, pointerOnTool(rim, { hover: true }));
    // `12 12` on a 24px icon: the centre of the open square. A wrong hot spot places points off-target.
    expect(cursor).toContain(' 12 12,');
    expect(cursor.startsWith('url("data:image/svg+xml,')).toBe(true);
  });

  /*
   * The other side of the rule, so widening it later cannot quietly swallow the camera. A step with
   * no tool in hand must leave the surface to the camera.
   */
  it('a step with nothing in hand leaves the surface to the camera', () => {
    expect(toolActsOnSurface(g({ kind: 'dental-aligner' }))).toBe(false);
    expect(toolActsOnSurface(g({ kind: 'dental-area' }))).toBe(false);
    expect(toolActsOnSurface(g({ kind: 'dental-review' }))).toBe(false);
    expect(toolActsOnSurface(g({ kind: 'pick' }))).toBe(false);
    expect(toolActsOnSurface(g({ kind: 'none' }))).toBe(false);
  });

  it('still answers true for the brush modes it always answered true for', () => {
    expect(toolActsOnSurface(g({ kind: 'zones' }))).toBe(true);
    expect(toolActsOnSurface(g({ kind: 'drag' }))).toBe(true);
    expect(toolActsOnSurface(g({ kind: 'dental-area', brush: { kind: 'allow' } } as never))).toBe(true);
  });
});

/*
 * AND THE GUARD ON THE WIRING ITSELF, which is the only part a unit test can otherwise not reach.
 *
 * Everything above proves the rule and the cursor agree. None of it proves a RENDERER asks the rule
 * - and "the renderer asked the wrong question" is precisely what shipped. Both viewports computed
 * the pointer-over from whether a BRUSH was armed, so three modes answered false forever and the
 * defect was invisible to every test and to the parity walk, which compares the two renderers to
 * each other and found them equally wrong.
 *
 * Reading the source is the weakest kind of assertion and it is the right one here: the fault was a
 * value handed between a component and a pure function, and this is the seam. It fails if a renderer
 * stops asking, or goes back to asking about brushes.
 */
describe('both renderers ask the rule rather than guessing', () => {
  const SOURCES = import.meta.glob<string>(
    ['../UnitObject.tsx', '../BabylonObjectViewport.tsx', './UnitObject.tsx'],
    { query: '?raw', import: 'default', eager: true },
  );

  it('finds the viewport sources at all, so the checks below cannot pass vacuously', () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(0);
  });

  it.each(Object.entries(SOURCES))('%s computes the pointer-over through pointerOnTool', (_file, source) => {
    expect(source).toContain('pointerOnTool(');
  });

  it.each(Object.entries(SOURCES))('%s no longer decides it from an armed brush', (_file, source) => {
    // The exact shape that shipped: `hover && (zoneBrush || dentalBrush)`.
    expect(source).not.toMatch(/hover\s*&&\s*\(\s*zoneBrush\s*\|\|\s*dentalBrush\s*\)/);
  });
});
