// Copyright (c) Mixo Creative.

import { useEffect, useRef, useState } from 'react';
import { closeLiveCard, openLiveCard, turnLiveCard } from '../components/viewport/liveCardView';
import { displayMesh } from '../state/meshExtras';
import { t } from '../i18n';
import { ProgressIndicator } from '../progress/Progress';
import { THUMB_SIZE } from './thumbnail';
import type { PrintUnit } from '../state/project';

/**
 * A CARD'S PICTURE: the still, and the live model over it while this is the card being looked at.
 *
 * Owner, 2026-11-18: *"the model thumnal is a 3d live render 3d space, not an image, it should
 * allow user to rotate the 3d model."* Both surfaces exist at once and only one is visible:
 *
 *   the `<img>`     the cached still (`useThumbnails`), which every card shows at rest. Tens of KB,
 *                   no GPU, no context - which is what lets sixty cards sit on a screen.
 *   the `<canvas>`  a plain 2D surface that the deck's single renderer copies frames into while
 *                   this card is live. Same model, same angle, SAME PIXELS: `orbit.ts` is tested on
 *                   the angle (no turn applied returns the still's own camera position exactly), and
 *                   both surfaces are drawn at the card's CSS size times the device ratio, so the
 *                   handover neither moves nor sharpens. It claimed "invisible" while the still was
 *                   160px upscaled into a 206px frame, which made going live a visible sharpening -
 *                   and gave away that the resting picture had been blurred all along.
 *
 * WHICH CARD IS LIVE IS NOT DECIDED HERE. One model may be live at a time and the page owns that
 * choice, so this component is told. Two cards each believing they are live would upload two models
 * and the second would silently win, which is the kind of fault that only shows on a slow machine.
 *
 * A DWELL, NOT A HOVER. Going live on the first pixel of a pointer crossing the deck would upload a
 * model for every card the pointer passes over on its way somewhere else. 150 ms means the operator
 * stopped at this one.
 */
export function CardShot({ unit, shot, busy, live, onLive, onRelease }: {
  readonly unit: PrintUnit;
  /**
   * Work is running ON THIS CARD, with its fraction when the job reports one. The overlay sits over
   * the picture because that is where the operator is already looking, and it is the SAME surface
   * auto-gen will drive - a card that is being checked and a card that is being generated are the
   * same state to the person waiting.
   *
   * `fraction` is undefined while a job reports no progress, and the bar is then honestly
   * indeterminate rather than inventing a number that moves.
   */
  readonly busy?: { readonly label: string; readonly fraction?: number };
  /** The cached still, or undefined before it has been drawn - or on a device with no WebGL. */
  readonly shot: string | undefined;
  readonly live: boolean;
  /** This card wants the renderer. The page decides, and may refuse by simply not setting `live`. */
  readonly onLive: () => void;
  readonly onRelease: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  /*
   * THE PICTURE CANNOT BE TURNED HERE, and the card has to stop promising that it can. Without
   * this, a device with no WebGL - or a model with no extent - showed a focusable control whose
   * tooltip said "Drag to turn this model" and which did nothing at all when dragged.
   */
  const [unavailable, setUnavailable] = useState(false);
  const dwell = useRef<number>(0);
  /** Where the last pointer sample was, so a drag is measured as a delta rather than a position. */
  const dragging = useRef<{ x: number; y: number } | undefined>(undefined);

  /*
   * `onRelease` IS HELD IN A REF, NOT LISTED AS A DEPENDENCY, AND THAT IS NOT A SHORTCUT.
   *
   * It arrives as a fresh arrow from `ItemsPage` on every render, so listing it re-ran this effect
   * whenever anything on the deck changed - and the cleanup DISPOSES the geometry while the body
   * re-uploads it and resets the turn to zero. Two real cases, both found by review before anybody
   * had to live with them: a press that selects the card re-rendered it, so the model snapped back
   * to the still's angle as the button came up, on the first drag of every card; and the detect
   * batch re-rendered rows for seconds, disposing and re-uploading a 374k mesh under the pointer.
   *
   * The effect must run for `live` and for the model, and for nothing else. `onRelease` is called
   * only on the open-failure branch below, which is exactly what a ref is for.
   */
  const releaseRef = useRef(onRelease);
  releaseRef.current = onRelease;

  useEffect(() => {
    if (!live || !canvas.current) return undefined;
    const opened = openLiveCard(canvas.current, displayMesh(unit.source), unit.transform);
    // No WebGL, or a model with no extent: the still stays and nothing claims to be live.
    if (!opened) {
      setUnavailable(true);
      releaseRef.current();
    }
    return () => closeLiveCard();
    // `unit.transform` by identity: the scene replaces it on every write, so a model the flow just
    // turned re-opens at its new pose rather than keeping the pose it went live at.
  }, [live, unit.source, unit.transform]);

  useEffect(() => () => window.clearTimeout(dwell.current), []);

  const release = () => {
    window.clearTimeout(dwell.current);
    dragging.current = undefined;
    if (live) onRelease();
  };

  return <span className={`shot${live ? ' shot--live' : ''}`} data-ui={`items-shot-${unit.id}`}
    /*
     * FOCUSABLE, because a picture you can turn is a control. Keyboard focus goes live immediately -
     * a Tab is already a deliberate arrival, so there is nothing to wait out.
     */
    tabIndex={0}
    role="img"
    aria-label={unit.name}
    title={unavailable ? t('This browser could not start WebGL2 3D graphics, which mixoDental needs to show and prepare models. Try Chrome or Edge on a desktop computer.') : t('Drag to turn this model.')}
    onFocus={onLive}
    onBlur={release}
    onPointerEnter={() => { window.clearTimeout(dwell.current); dwell.current = window.setTimeout(onLive, 150); }}
    onPointerLeave={release}
    onPointerDown={(event) => {
      /*
       * THE PRIMARY BUTTON ONLY. A right-click took pointer capture for button 2 and the context
       * menu then swallowed the `pointerup`, so the drag never ended: afterwards the model turned
       * on a bare hover with no button down. `src/components/viewport/babylon/orbit.ts` filters the
       * same way for the same reason.
       */
      if (event.button !== 0) return;
      // A press is a deliberate arrival too, so it does not wait out the dwell.
      window.clearTimeout(dwell.current);
      if (!live) onLive();
      dragging.current = { x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    /*
     * A CANCELLED POINTER ENDS THE DRAG TOO. The browser cancels on a native image drag, a system
     * gesture or a lost capture, and `pointerup` never comes - leaving the same stuck-drag as the
     * right-click above.
     */
    onPointerCancel={() => { dragging.current = undefined; }}
    onPointerMove={(event) => {
      const from = dragging.current;
      if (!from) return;
      dragging.current = { x: event.clientX, y: event.clientY };
      turnLiveCard(event.clientX - from.x, event.clientY - from.y);
    }}
    onPointerUp={(event) => {
      dragging.current = undefined;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }}
    onKeyDown={(event) => {
      /*
       * ONLY WHEN THIS CARD IS THE LIVE ONE. `turnLiveCard` acts on a module singleton, so a card
       * that merely has FOCUS would otherwise turn whichever card the pointer happens to be
       * dwelling on - the focus ring on one card, the model moving on another.
       */
      if (!live) return;
      // The same turn from the keyboard, so the picture is not a pointer-only control.
      const step = event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40 : 0;
      const tilt = event.key === 'ArrowUp' ? -40 : event.key === 'ArrowDown' ? 40 : 0;
      if (step === 0 && tilt === 0) return;
      event.preventDefault();
      turnLiveCard(step, tilt);
    }}
  >
    {/*
      The still is HIDDEN rather than unmounted while live, so the browser keeps it decoded and the
      card does not flash white on the way back out.
    */}
    {shot ? <img src={shot} alt="" width={THUMB_SIZE} height={THUMB_SIZE} draggable={false} /> : null}
    <canvas ref={canvas} data-ui={`items-live-${unit.id}`} aria-hidden="true" />
    {busy ? <span className="shot-busy" data-ui={`items-busy-${unit.id}`}>
      <span className="shot-busy-label">{busy.label}</span>
      <ProgressIndicator type="step" label={busy.label} fraction={busy.fraction} />
    </span> : null}
  </span>;
}
