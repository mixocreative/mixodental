import { useEffect, useMemo, useRef, useState } from 'react';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { createBrushScheduler, type Brush, type FrameTest } from '@mixo-geocore/editing/brushScheduler';
import { createDragOver } from '@mixo-geocore/editing/dragOver';
import { createHoverProbe } from '@mixo-geocore/editing/hoverProbe';
import { takesText } from '@mixo-geocore/editing/keys';
import { effectiveBrushMode } from '@mixo-geocore/editing/selection';
import { bodySegments, type BodySegments } from '@mixo-geocore/editing/screenBrush';
import type { Stroke } from '@mixo-geocore/editing/stroke';
import type { BrushMode } from '@mixo-geocore/editing/types';
import { geometryNow } from '@mixo-geocore/host/workers/geometryClient';

/*
 * Drag over, with NO RENDERER IN IT. Hit rules live in `editing/screenBrush`, pointer rules in
 * `editing/dragOver`, the frame loop in `editing/brushScheduler`; this hook is the part between
 * them and the DOM: the circle element, the pointer and Shift listeners, the hover probe, and the
 * resting point a rebuild has to ask about again.
 *
 * WHY IT IS SPLIT OUT rather than parameterised in place: `useScreenBrush` calls `useThree`, which
 * throws outside an r3f `<Canvas>`. Injection alone would not let the Babylon view call it -- the
 * hook had to come apart. What is left here needs exactly THREE things from a renderer, and that
 * is the measure of the seam: the canvas, a view over the support bodies, and a test for "is the
 * object under this point". Everything else was already renderer-free and is shared by both views
 * BY CONSTRUCTION, which is the only way two renderers stay identical.
 *
 * THE THREE INJECTED THINGS, and what each replaces:
 *
 *  - `canvas` -- was `gl.domElement`. The circle is appended beside it and the listeners hang off
 *    it. Nullable, because Babylon builds its scene in an effect and the first render has none.
 *  - `makeView(bodies)` -- was `screenBrushView(...)`: the clip matrix and eye of the SUPPORT
 *    GROUP, plus the visible models as occluders, for the Rust core's batched hit test.
 *  - `objectAt(at, radius)` -- was a raycast over the meshes marked `strokeStart`. A stroke starts
 *    only on the model or a support; a press on empty space orbits instead.
 */

/** Samples around the pointer (as shares of the circle's radius) that may reach a support: a support is thin. */
export const SUPPORT_REACH = [1, 0.5] as const;
export const AROUND_ANGLES = Array.from({ length: 8 }, (_, step) => (step * Math.PI * 2) / 8);

/** One brush frame's hit test over a set of support bodies, at the canvas size the pointer last saw. */
export interface BrushBodyView {
  resize(width: number, height: number): void;
  frame(): FrameTest | undefined;
}

/**
 * Dental Step 2 has tips but no support bodies: each tip stands as a short stub off the surface along its
 * normal (clear of the model it sits on), so Drag over finds it as it finds a support.
 */
function tipSegments(tips: readonly { id: string; position: readonly number[]; normal: readonly number[] }[]): BodySegments {
  const points = new Float32Array(tips.length * 6);
  tips.forEach((tip, k) => {
    for (let axis = 0; axis < 3; axis += 1) {
      points[k * 6 + axis] = tip.position[axis]! + tip.normal[axis]! * 0.15;
      points[k * 6 + 3 + axis] = tip.position[axis]! + tip.normal[axis]! * 0.5;
    }
  });
  return { ids: tips.map((tip) => tip.id), first: Uint32Array.from({ length: tips.length + 1 }, (_, k) => k), points };
}

/** Dev builds time each frame of hit tests (read with performance.getEntriesByName('mixo-brush-frame')). */
const measureBrushFrame = import.meta.env?.DEV ? (start: number) => void performance.measure('mixo-brush-frame', { start }) : undefined;

export interface BrushOverlayOptions {
  /** `mode` is the Select | Unselect switch; Shift flips it as the pointer reports it (`event.shiftKey`). */
  brush: Brush | undefined;
  supports: GeneratedSupportMesh | undefined;
  /** Without support bodies (dental Step 2): the tips to select. */
  tips?: readonly { id: string; position: readonly number[]; normal: readonly number[] }[] | undefined;
  selection: ReadonlySet<string>;
  stroke: Stroke;
  beginStroke: () => void;
  /** Whether Shift is down, as the latest pointer event or Shift key press saw it (the switch shows it). */
  onShift: (held: boolean) => void;
  onPaint: (ids: readonly string[], mode: BrushMode) => void;
  /** A press with the brush live while there are no support bodies to hit. */
  onNoBodies: () => void;
  /** The renderer's canvas; the circle sits beside it. Null until the view exists. */
  canvas: HTMLCanvasElement | null;
  /** The renderer's hit test over the bodies. Stable, or the listeners rebuild every render. */
  makeView: (bodies: BodySegments) => BrushBodyView;
  /** Whether the object is under this canvas point (its model, or a support the circle reaches). Stable. */
  objectAt: (at: readonly [number, number], radius: number) => boolean;
}

/**
 * A circle of `brush.radius` px follows the pointer over the canvas; supports of the active object
 * whose body it passes over, and that are not hidden behind a model there, are previewed and,
 * while the left button is held, painted. A stroke starts only on the model or a support (a press
 * on empty space orbits, and shows no circle); right and middle drags always orbit.
 */
export function useBrushOverlay(options: BrushOverlayOptions): { brushed: readonly string[]; over: boolean } {
  const [brushed, setBrushed] = useState<readonly string[]>([]);
  /** The circle is showing: the pointer is over the canvas with the brush live. */
  const [over, setOver] = useState(false);
  const wanted = Boolean(options.brush);
  const { canvas, makeView, objectAt } = options;
  const bodies = useMemo<BodySegments | undefined>(
    () => (!wanted ? undefined : options.supports ? bodySegments(geometryNow()!, options.supports) : options.tips ? tipSegments(options.tips) : undefined),
    [wanted, options.supports, options.tips]);
  const view = useMemo(() => bodies && makeView(bodies), [bodies, makeView]);
  /** Shows the hover again with the brush as it is now (set while the pointer listeners are attached). */
  const refreshHover = useRef<() => void>(() => undefined);
  /** Where the pointer rests over the canvas, outside a stroke: a rebuild of the listeners (new supports) asks about it again. */
  const resting = useRef<readonly [number, number] | undefined>(undefined);
  /** The latest `shiftKey` seen on a pointer event or a Shift key press: refreshed by each, never held across them. */
  const shift = useRef(false);
  const live = useRef({ options, view });
  live.current = { options, view };
  // Outlives the support mesh: a rebuild mid-stroke keeps the queued samples.
  const [{ scheduler, dragOver }] = useState(() => {
    const scheduler = createBrushScheduler({
      frame: () => live.current.view?.frame(),
      isSelected: (id) => live.current.options.selection.has(id),
      commit: (ids, mode) => live.current.options.onPaint(ids, mode),
      preview: setBrushed,
      now: () => performance.now(),
      requestFrame: (run) => requestAnimationFrame(run),
      cancelFrame: (handle) => cancelAnimationFrame(handle),
      ...(measureBrushFrame ? { measure: measureBrushFrame } : {}),
    });
    return { scheduler, dragOver: createDragOver(options.stroke, scheduler, () => live.current.options.beginStroke()) };
  });
  // Select ↔ Unselect (the switch, or Shift) with the pointer at rest: the circle and the preview redo at once.
  const mode = options.brush?.mode;
  useEffect(() => refreshHover.current(), [mode]);
  // The brush going off (tool or mode changed): a re-enabled one starts with no resting spot and no Shift.
  useEffect(() => {
    if (!wanted) return;
    const { onShift } = live.current.options;
    return () => {
      resting.current = undefined;
      shift.current = false;
      onShift(false);
    };
  }, [wanted]);
  useEffect(() => {
    scheduler.setSupports(bodies?.ids.length);
  }, [scheduler, bodies]);
  useEffect(() => () => scheduler.setSupports(undefined), [scheduler]);
  // No bodies drawn (the first build still running, or none left): the brush has nothing to hit, so the host may say why.
  const waiting = wanted && (bodies?.ids.length ?? 0) === 0;
  useEffect(() => {
    if (!waiting || !canvas) return;
    const press = () => live.current.options.onNoBodies();
    canvas.addEventListener('pointerdown', press, { capture: true });
    return () => canvas.removeEventListener('pointerdown', press, { capture: true });
  }, [waiting, canvas]);
  useEffect(() => {
    if (!view || !canvas) return;
    const host = canvas.parentElement ?? canvas;
    const circle = document.createElement('div');
    circle.className = 'brush-circle';
    circle.hidden = true;
    host.appendChild(circle);
    /** The pointer's canvas point; the hit test takes the canvas size it saw before any rule runs. */
    const locate = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      view.resize(rect.width, rect.height);
      return [event.clientX - rect.left, event.clientY - rect.top] as const;
    };
    /** The brush as the pointer's Shift makes it; one object reused, so a move allocates nothing. */
    const shifted: Brush = { radius: 0, mode: 'select' };
    const shiftedBrush = (brush: Brush): Brush => {
      shifted.radius = brush.radius;
      shifted.mode = effectiveBrushMode(brush.mode, shift.current);
      return shifted;
    };
    /** A stroke keeps the Shift it started with (its circle too); the next event after it sees the real one. */
    const seeShift = (held: boolean) => {
      if (options.stroke.active) return;
      shift.current = held;
      live.current.options.onShift(held);
    };
    const show = ([x, y]: readonly [number, number], brush: Brush) => {
      setOver(true);
      circle.hidden = false;
      circle.dataset.mode = brush.mode;
      circle.style.width = circle.style.height = `${brush.radius * 2}px`;
      circle.style.transform = `translate(${x - brush.radius}px, ${y - brush.radius}px)`;
    };
    const hide = () => {
      setOver(false);
      circle.hidden = true;
    };
    /** The latest hover move, shown again when a frame's rays change what is under the pointer. */
    let hover: readonly [number, number] | undefined = resting.current;
    // The rays run once a frame for the latest pointer, not on every move; the circle follows the
    // pointer meanwhile with the last answer, and a changed answer shows or hides it at the frame.
    const probe = createHoverProbe({
      test: objectAt,
      requestFrame: (run) => requestAnimationFrame(run),
      cancelFrame: (handle) => cancelAnimationFrame(handle),
      onAnswer: (onObject) => {
        const { brush: base } = live.current.options;
        if (!hover || !base || options.stroke.active) return;
        const brush = shiftedBrush(base);
        if (dragOver.move(hover, { held: false, onCanvas: true, onObject }, brush)) show(hover, brush);
        else hide();
      },
    });
    refreshHover.current = () => {
      const { brush: base } = live.current.options;
      if (!base || options.stroke.active) return;
      const brush = shiftedBrush(base);
      circle.dataset.mode = brush.mode;
      if (!hover) return;
      if (dragOver.move(hover, { held: false, onCanvas: true, onObject: probe.answer }, brush)) show(hover, brush);
      else hide();
    };
    const move = (event: PointerEvent) => {
      const { brush: base } = live.current.options;
      if (!base) return;
      seeShift(event.shiftKey);
      const brush = shiftedBrush(base);
      const at = locate(event);
      const held = (event.buttons & 1) !== 0;
      const onCanvas = event.target === canvas;
      // The rays are asked for only when the answer matters: a stroke runs on, and an orbit shows nothing.
      const ask = onCanvas && !held && !options.stroke.active;
      if (ask) {
        hover = at;
        probe.ask(at, brush.radius);
      } else {
        hover = undefined;
        probe.reset();
      }
      resting.current = hover;
      if (dragOver.move(at, { held, onCanvas, onObject: (ask && probe.answer) || options.stroke.active }, brush)) show(at, brush);
      else hide();
    };
    const down = (event: PointerEvent) => {
      const { brush: base } = live.current.options;
      if (!base) return;
      options.stroke.end();
      seeShift(event.shiftKey);
      const brush = shiftedBrush(base);
      const at = locate(event);
      if (dragOver.down(event.button, at, brush, event.button === 0 && objectAt(at, brush.radius))) show(at, brush);
    };
    // Shift pressed or released with the pointer at rest: the circle and the preview redo. A key in a text field is not the brush's.
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Shift' || takesText(event.target as HTMLElement | null)) return;
      seeShift(event.shiftKey);
      refreshHover.current();
    };
    const leave = () => {
      hover = undefined;
      resting.current = undefined;
      probe.reset();
      if (!dragOver.leave()) hide();
    };
    // The supports were rebuilt under a resting pointer: the circle is new and hidden, so ask again where it rests.
    const { brush: current } = live.current.options;
    if (hover && current) probe.ask(hover, current.radius);
    // Capture on the canvas: runs before the orbit controls (listening on its parent) see the press.
    canvas.addEventListener('pointerdown', down, { capture: true });
    canvas.addEventListener('pointerleave', leave);
    window.addEventListener('pointermove', move);
    window.addEventListener('keydown', key);
    window.addEventListener('keyup', key);
    return () => {
      canvas.removeEventListener('pointerdown', down, { capture: true });
      canvas.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', key);
      window.removeEventListener('keyup', key);
      probe.reset();
      refreshHover.current = () => undefined;
      circle.remove();
      setOver(false);
    };
  }, [view, canvas, objectAt, dragOver, options.stroke]);
  return { brushed: bodies ? brushed : [], over };
}
