// Copyright (c) Mixo Creative.

import { useEffect, useRef } from 'react';
import { CardShot } from './CardShot';
import { t } from '../i18n';
import type { PrintUnit } from '../state/project';

/**
 * ONE MODEL, FULL SIZE, TO LOOK AT. Owner's ruling 7, 2026-11-18: *"when user inspect model preview
 * maybe a button to enlarge 3d view in isolation for preview is possible?"*
 *
 * A LOOK, NEVER AN EDITOR, and that boundary is the whole of why this file is nine lines of markup.
 * The moment it grew a tool it would be a second Support Edit Mode - a second place where supports
 * can be changed, drifting from the real one. There is nothing to press in here but Close.
 *
 * IT IS A `CardShot` AT A BIGGER SIZE, and that is not a shortcut either. The deck has ONE renderer
 * (`components/viewport/deckRig.ts`) and one live card at a time; `CardShot` is the component that
 * owns a live card's pointer drag, its keyboard turn, its dwell and its no-WebGL fallback, and
 * `paint()` already sizes the frame from the canvas's own box. So "bigger" is a CSS rule, and the
 * behaviour cannot drift from the deck's because it IS the deck's. Ruling 7 called this nearly free;
 * this is what that meant.
 *
 * THE CARD BEHIND GIVES UP THE RENDERER FIRST. `ItemsPage` clears the live card as it opens this,
 * because two components each believing they are live would upload two models and the second would
 * silently win - a fault that only shows on a slow machine.
 */
export function CardEnlarge({ unit, shot, onClose, onOpen }: {
  readonly unit: PrintUnit;
  /** The cached still, so the box is never empty while the model uploads. */
  readonly shot: string | undefined;
  readonly onClose: () => void;
  /**
   * Take this model into the flow, from here.
   *
   * WITHOUT IT THIS WAS A DEAD END. The overlay is where you decide whether a model is right -
   * owner's ruling 7 calls it the safe way to answer "is this right?" BEFORE opening it - and
   * having answered, the only way on was to close it, find the card again and press a second key.
   * Owner, 2026-11-19: *"The overlay canvas needs a button to go to the edit mode so user can
   * orient or edit support."* It is the card's own Open: the same handler, so where it lands - Step
   * 1, or Step 3 for a model that already has supports - is decided in one place.
   */
  readonly onOpen: () => void;
}) {
  /* A MODEL WITH SUPPORTS SAYS SO, because it is going somewhere else: Step 3, not Step 1. */
  const built = unit.supports !== undefined && unit.dental?.kind === 'two-contour';
  const root = useRef<HTMLDivElement>(null);

  /*
   * THE OVERLAY TAKES THE KEYBOARD, which the deck itself had to learn the hard way: Esc on a React
   * `onKeyDown` only fires from INSIDE the element, and arriving by a mouse press leaves focus
   * wherever it was. Without this the one way out would be the pointer.
   */
  useEffect(() => { root.current?.focus(); }, []);

  return <div ref={root} className="card-enlarge" data-ui="card-enlarge" tabIndex={-1}
    role="dialog" aria-modal="true" aria-label={unit.name}
    onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
    onClick={onClose}
  >
    {/*
      A PRESS ON THE BACKDROP CLOSES IT, which is what every overlay in this app does and what a
      reader tries first. `stopPropagation` on the inner box is what keeps a drag on the MODEL from
      closing the thing it is turning - the drag ends with a pointerup on the backdrop often enough
      that without it the overlay would close on half the drags.
    */}
    <div className="card-enlarge-sheet" onClick={(event) => event.stopPropagation()}>
      <div className="card-enlarge-head">
        <span className="card-enlarge-name" title={unit.name}>{unit.name}</span>
        {/* A WORD, NOT A GLYPH: there is no close icon in `src/ui/assets/icons`, and inventing one
            to avoid a label would put a new drawing in the set for a single use. */}
        {/*
          THE WAY ON IS THE PRIMARY KEY HERE, and Close steps back to being the way out. A reader who
          has looked and is satisfied wants the editor; one who is not just presses Escape.
        */}
        <button type="button" className="primary card-enlarge-open" data-ui="card-enlarge-open"
          title={built ? t('Open Step 3 to add, move or remove its supports.') : t('Orient it and place its supports by hand.')}
          onClick={onOpen}>{built ? t('Edit supports') : t('Open this model')}</button>
        <button type="button" className="card-enlarge-close" data-ui="card-enlarge-close"
          onClick={onClose}>{t('Close')}</button>
      </div>
      {/*
        `live` IS FORCED AND THE RELEASE IS A NO-OP: this box holds the renderer for as long as it is
        open, so there is no dwell to wait out and nothing to hand back until it closes.
      */}
      <CardShot unit={unit} shot={shot} live onLive={() => {}} onRelease={() => {}} />
      <p className="card-enlarge-hint">{t('Drag to turn this model.')}</p>
    </div>
  </div>;
}
