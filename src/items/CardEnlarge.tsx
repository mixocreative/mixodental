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
export function CardEnlarge({ unit, shot, onClose }: {
  readonly unit: PrintUnit;
  /** The cached still, so the box is never empty while the model uploads. */
  readonly shot: string | undefined;
  readonly onClose: () => void;
}) {
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
