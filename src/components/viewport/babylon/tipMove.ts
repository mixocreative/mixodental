import type { ArcRotateCamera } from '@babylonjs/core';
import { clickTool } from '@mixo-geocore/editing/pick';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { contactAtTriangle } from '@mixo-geocore/host/core/supports/meshQuery';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { movePress, moveRelease, type TipDrop } from '../../../supports/tipMove';
import { beginDrag } from '../dragSession';
import { modeOwnsClick } from '../clickOwner';
import { attachOrbit } from './orbit';
import type { SurfacePointer } from './surfacePointer';

/*
 * Dragging a selected support tip to a new spot, in the Babylon view. The twin of the three.js
 * wiring in `UnitObject.tsx`, and the fourth seam of the same shape in this folder: `editClicks.ts`
 * over `editing/pick`, `rimDraw.ts` over `rimTarget`, and this over `supports/tipMove.ts`.
 *
 * NOT ONE RULE OF ITS OWN. May this press begin a move, what did the release mean, what commands
 * does the move make - all three are `supports/tipMove.ts`'s, so the two renderers cannot drift
 * apart by one of them being changed. The endings and the camera are `../dragSession.ts`'s, shared
 * with the three.js tip and both rim drags. What is left here, and all that should ever be here, is
 * what this renderer knows: how to pick a support, and how to cast a ray at a model.
 *
 * THE DROP RULE IS NOT `pointer.hitAt`, and the difference is the whole of this adapter's care.
 * `hitAt` gives the nearest MODEL hit of any unit; a drop must land on the TIP'S OWN unit's model,
 * passing through another unit standing in front of it. three.js gets that for nothing by casting at
 * one mesh; a renderer with a candidate list has to filter for it, which is what `TipDrop`'s contract
 * says in `supports/tipMove.ts` and what the loop below does.
 *
 * AND THE RAY TAKES CLIENT COORDINATES, CONVERTED HERE. Every other pointer handler in this folder
 * reads `event.offsetX`, because it listens on the canvas and the pointer is over it. A drag listens
 * on the WINDOW - it has to, or a release over a panel is never heard - and `offsetX` is then
 * measured from whatever element the pointer happens to be over. The panel, that is, and the ray
 * would go somewhere the operator never pointed.
 */

export interface TipMoveUnit {
  id: string;
  /** The built supports, for `contactAtTriangle`: which contact does this triangle belong to. */
  supports?: GeneratedSupportMesh;
  /** The pressed object is the active one (`movePress` reads this). */
  active: boolean;
  /** That contact is in the session's selection - the condition a move turns on. */
  selected: (contactId: string) => boolean;
}

export interface TipMoveInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  pointer: SurfacePointer;
  gesture: () => Gesture;
  /** The session's live tool, because the canvas renders a step behind the DOM. */
  liveTool: () => Parameters<typeof clickTool>[0];
  unitFor: (unitId: string) => TipMoveUnit | undefined;
  onMoveTip: (unitId: string, pointId: string, position: Vector, normal: Vector) => void;
  onMoveTipCancelled: () => void;
}

/** Attaches tip dragging and returns its detacher. */
export function attachTipMove(input: TipMoveInput): () => void {
  const { canvas, camera, pointer } = input;
  let drag: { unitId: string; pointId: string } | undefined;
  let press: { x: number; y: number; travel: number } | undefined;
  /** Where the tip would land, in WORLD space, or undefined while the pointer is off its model. */
  let target: TipDrop | undefined;
  let endDrag: (() => void) | undefined;

  /*
   * The nearest hit on this unit's own model: not its supports, not another unit standing in front.
   *
   * IT ASKS FOR EVERY CANDIDATE TO USE ONE, and that is worth knowing on a full plate: `hitAll` picks
   * every unit's model and supports, where three.js casts at the one mesh it already holds. It is the
   * price of the frame rule living in `surfacePointer` (the ray has to be converted per unit), and a
   * drag is one gesture at a time rather than a per-frame cost.
   */
  const modelHit = (event: PointerEvent, unitId: string) => {
    const rect = canvas.getBoundingClientRect();
    return pointer
      .hitAll(event.clientX - rect.left, event.clientY - rect.top)
      .find((candidate) => candidate.kind === 'model' && candidate.unitId === unitId);
  };

  const track = (event: PointerEvent) => {
    if (!drag || !press) return;
    press.travel = Math.max(press.travel, Math.hypot(event.clientX - press.x, event.clientY - press.y));
    const hit = modelHit(event, drag.unitId);
    target = hit ? { position: hit.world.point, normal: hit.world.normal } : undefined;
  };

  const finish = (cancelled: boolean) => () => {
    if (!drag) return;
    const { unitId, pointId } = drag;
    const release = moveRelease({ travel: press?.travel ?? 0, onModel: target !== undefined, cancelled });
    drag = undefined;
    press = undefined;
    endDrag = undefined;
    const landed = target;
    target = undefined;
    // `click` is deliberately nothing: `editClicks` acts on the same release and toggles the
    // selection, which is what a press and release on a tip has always meant.
    if (release === 'move' && landed) input.onMoveTip(unitId, pointId, landed.position, landed.normal);
    // A cancel is always a real drag that came to nothing - `moveRelease` has already called a press
    // that never travelled a `click` - so it is the case worth telling the operator about.
    if (release === 'cancel') input.onMoveTipCancelled();
  };

  const onDown = (event: PointerEvent) => {
    if (drag) return;
    const gesture = input.gesture();
    // Rim define mode and the dental area brush own every click while they are on, and a press that
    // began a tip move under them would be the same leak `editClicks` guards against.
    if (modeOwnsClick(gesture.kind)) return;
    const tool = clickTool(input.liveTool(), {
      tool: gesture.kind === 'add' ? 'add' : 'select',
      brush: gesture.kind === 'drag',
      remove: gesture.kind === 'add' && gesture.remove,
    });
    const rect = canvas.getBoundingClientRect();
    /*
     * THE NEAREST HIT DECIDES, and only it - where `editClicks` walks the whole candidate list.
     * A support stands in FRONT of the model it grows from, so a press that could begin a move has a
     * support as its nearest hit; anything else means the press was not on one. There is nothing for
     * a second candidate to answer, and letting a press reach THROUGH the thing in front of it to
     * drag something behind would be a gesture no operator aimed.
     */
    const [candidate] = pointer.hitAll(event.clientX - rect.left, event.clientY - rect.top);
    if (!candidate || candidate.kind !== 'support') return;
    const unit = input.unitFor(candidate.unitId);
    if (!unit?.supports) return;
    const contactId = contactAtTriangle(unit.supports, candidate.triangle);
    // A brace, the raft or a label: support geometry owned by no contact. It cannot be dragged, and
    // `editClicks` lets the click behind it have its turn.
    if (!contactId) return;
    const armed = movePress({
      hit: 'support',
      button: event.button === 0 ? 'left' : 'right',
      ...tool,
      active: unit.active,
      contact: true,
      // The candidate list is nearest-first and this is its head, so taking it IS the report: nothing
      // of the model stands in front of this support. three.js reports the same thing by comparing
      // r3f's intersection list, because there a press reaches everything underneath it.
      nearest: true,
      selected: unit.selected(contactId),
    });
    if (!armed) return;
    press = { x: event.clientX, y: event.clientY, travel: 0 };
    target = undefined;
    drag = { unitId: unit.id, pointId: contactId };
    endDrag = beginDrag({
      lock: () => camera.detachControl(),
      unlock: () => attachOrbit(camera, canvas),
      release: finish(false),
      cancel: finish(true),
      move: track,
    });
  };

  canvas.addEventListener('pointerdown', onDown);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    // Silent, and it hands the camera back: a teardown is not the operator deciding what the drag meant.
    endDrag?.();
  };
}
