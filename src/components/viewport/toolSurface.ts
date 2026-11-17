import type { Gesture } from '@mixo-geocore/editing/gesture';

/*
 * ONE JOB: does the ACTIVE TOOL act on the model's surface?
 *
 * The cursor is how an operator knows whether the pointer is holding a tool or the camera, and the
 * viewport answers that with one boolean - "is the pointer over the thing the tool acts on". That
 * boolean was computed as `hover && (zoneBrush || dentalBrush)`, which is not the question: it asks
 * whether a BRUSH is armed. Every mode that acts on the surface WITHOUT a brush therefore answered
 * false forever, and `canvasCursor` fell through to its off-model branch every single time:
 *
 *   - rim define mode showed the grab HAND over the model instead of the rim crosshair, so the
 *     pointer hid the very point it was about to place. The owner found this by using it
 *     (2026-11-17); the cursor had never rendered once since it was written.
 *   - Step 2's Add and Support Edit Mode's Add showed the hand where a crosshair was intended.
 *
 * Both renderers had it, which is why the parity walk never caught it: they agreed, and they were
 * both wrong. Nor could a screenshot catch it - a CSS cursor never appears in one. `npm run look`
 * COMPOSITED the rim cursor from its own SVG file to put it in front of eyes, which proved the file
 * exists and proved nothing about the app. A picture of a thing drawn by the test is not evidence
 * about the thing.
 *
 * So the rule lives here, pure, and is tested per gesture rather than discovered in use.
 */

/**
 * Whether a press on the MODEL would act on the model, rather than move the camera.
 *
 * Not "is a brush armed": a tool with no brush still owns the surface. The one gesture deliberately
 * excluded is `add` on its own, whose cursor is a crosshair wherever it sits, so the answer cannot
 * change what it draws.
 */
export function toolActsOnSurface(gesture: Gesture): boolean {
  return actsOnSurface(gesture);
}

/**
 * THE WHOLE ANSWER the viewport needs, so the two renderers cannot each get it half right.
 *
 * `circleOver` is the drag-over circle, which owns the pointer whenever it is over bodies regardless
 * of the gesture; `hover` is a surface point under the pointer. Taking both here is what makes this
 * testable as a PAIR with `canvasCursor` - the defect was never in either piece alone, it was in the
 * value handed between them, and a test of each half passes while the operator sees the wrong hand.
 */
export function pointerOnTool(gesture: Gesture, over: { hover: boolean; circleOver?: boolean }): boolean {
  return Boolean(over.circleOver) || (over.hover && actsOnSurface(gesture));
}

function actsOnSurface(gesture: Gesture): boolean {
  switch (gesture.kind) {
    // Painting and erasing zones: the brush is the tool and the surface is its canvas.
    case 'zones': return true;
    // Drag over: the circle selects what it passes over.
    case 'drag': return true;
    /*
     * Rim define mode. EVERY press does something to the drawing - grab a handle, insert one on the
     * line, add one at the end - so the surface is the tool's the whole time it is open.
     */
    case 'dental-rim': return true;
    // Step 3 / Support Edit Mode: only the Add tool reaches the surface; Select works on supports.
    case 'dental-review': return gesture.edit?.kind === 'add';
    // Step 2: paint, erase, add and drag-select all act on the surface; the bare step does not.
    case 'dental-area': return Boolean(gesture.brush) || gesture.edit?.kind === 'add' || gesture.edit?.kind === 'drag';
    default: return false;
  }
}
