import { CLICK_TOLERANCE, clickTool, missAction, pickAction, type PickInput } from '@mixo-geocore/editing/pick';
import { gestureMode, type Gesture } from '@mixo-geocore/editing/gesture';
import type { EditMode } from '@mixo-geocore/editing/types';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { contactAtTriangle } from '@mixo-geocore/host/core/supports/meshQuery';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { modeOwnsClick } from '../clickOwner';
import type { SurfacePointer } from './surfacePointer';

/*
 * What a click on the 3D view does: add a support, erase one, remove the one under the pointer,
 * toggle its selection, select the object, or tell the operator what to click instead.
 *
 * THE RULE THIS MODULE IS WRITTEN TO. The owner's requirement is that the two renderers behave
 * IDENTICALLY, and the way to get that is not to match behaviour but to share it: `pickAction` in
 * geocore decides what every click means, and this module only ADAPTS the input -- what was hit,
 * which button, which modifiers, how far the pointer travelled. The three.js view's handlers are
 * adapters over the same function. Reimplementing any of its rules here would make the two agree
 * only until someone changed one of them.
 *
 * TRAVEL IS LOAD-BEARING, not a detail. `CLICK_TOLERANCE` (4 px) is what separates a click from an
 * orbit drag that happened to start on the model. r3f hands this over as `event.delta`; here it is
 * measured from the press. Without it, every view turn that began on a model would also act as a
 * click on it.
 *
 * SOME MODES TAKE THE CLICK WHOLE, and leaving that out cost a walk. Rim define mode and the dental
 * area brush own every click while they are on; `modeOwnsClick` is the shared rule and both views
 * ask it. Without it, every click that placed a rim anchor here ALSO added a support -- fifteen of
 * them, which grew the unit's bounds fourfold, which made the camera fit frame the supports rather
 * than the model, which made the walk's canvas-fraction clicks miss it. One missing guard, five
 * failing checks, none of them about the thing that was wrong.
 *
 * A SUPPORT HIT THAT BELONGS TO NO CONTACT FALLS THROUGH. Braces, the raft and labels are support
 * geometry owned by no contact, and three lets the pick continue BEHIND them -- r3f gets that from
 * event propagation. Babylon's nearest-hit pick does not, so the candidate list is walked in order
 * and a `pass` moves to the next one. Swallow it instead and clicking a brace stops selecting the
 * model, which is a behaviour change nobody would attribute to the renderer.
 */

export interface EditClickUnit {
  id: string;
  supports?: GeneratedSupportMesh;
  /** The hit object is the active one (`pickAction` reads this). */
  active: boolean;
}

export interface EditClicksInput {
  canvas: HTMLCanvasElement;
  pointer: SurfacePointer;
  gesture: () => Gesture;
  mode: () => EditMode;
  /** The session's live tool, because the canvas renders a step behind the DOM. */
  liveTool: () => Parameters<typeof clickTool>[0];
  unitFor: (unitId: string) => EditClickUnit | undefined;
  /** Whether a gizmo drag is in progress, which suppresses a miss. */
  gizmoDragging: () => boolean;
  /** Dental Step 2 is on (`dentalArea`), which changes what two of the actions mean. */
  stepTwo: () => boolean;
  onPickTip: (unitId: string, point: Vector) => void;
  onSelect: (unitId: string | null, additive: boolean) => void;
  onAddContact: (unitId: string, point: Vector, normal: Vector) => void;
  onErase: (unitId: string, point: Vector) => void;
  onRemoveContact: (unitId: string, contactId: string) => void;
  onToggleContact: (unitId: string, contactId: string) => void;
  onEditMiss: () => void;
}

/** Attaches the click handling and returns its detacher. */
export function attachEditClicks(input: EditClicksInput): () => void {
  const { canvas, pointer } = input;
  let press: { x: number; y: number; button: number } | undefined;

  const onDown = (event: PointerEvent) => {
    press = { x: event.clientX, y: event.clientY, button: event.button };
  };

  const act = (event: PointerEvent, right: boolean) => {
    const start = press;
    press = undefined;
    const travel = start ? Math.hypot(event.clientX - start.x, event.clientY - start.y) : 0;
    const gesture = input.gesture();
    // Rim define mode and the dental area brush own the click: none of the readings below applies.
    if (modeOwnsClick(gesture.kind)) return;
    const mode = input.mode();
    const tool = clickTool(input.liveTool(), {
      tool: gesture.kind === 'add' ? 'add' : 'select',
      brush: gesture.kind === 'drag',
      remove: gesture.kind === 'add' && gesture.remove,
    });

    for (const candidate of pointer.hitAll(event.offsetX, event.offsetY)) {
      const unit = input.unitFor(candidate.unitId);
      if (!unit) continue;
      const contactId = candidate.kind === 'support' && unit.supports
        ? contactAtTriangle(unit.supports, candidate.triangle)
        : undefined;
      const action = pickAction({
        hit: candidate.kind,
        button: right ? 'right' : 'left',
        ctrl: event.ctrlKey || event.metaKey,
        shift: event.shiftKey,
        travel,
        mode,
        ...tool,
        active: unit.active,
        contact: Boolean(contactId),
      } satisfies PickInput);

      // `pass` means this hit does not take the click; whatever is behind it gets a turn.
      if (action.type === 'pass') continue;
      const stepTwo = input.stepTwo();
      /*
       * TWO ACTIONS MEAN SOMETHING ELSE IN DENTAL STEP 2, and both rules come from `UnitObject`:
       *
       *  - a `miss` on the model while the Select tool is in hand picks the TIP nearest the click,
       *    within Click reach. That is the whole of Step 2's "Select -> Click";
       *  - `erase` does nothing at all, because Step 2 removes only through a selection and
       *    Delete. Letting it through would delete a support with a right-click in a step whose
       *    rules say it cannot be done that way.
       */
      if (stepTwo && action.type === 'miss' && candidate.kind === 'model' && input.gesture().kind === 'pick') {
        return input.onPickTip(unit.id, candidate.world.point);
      }
      if (stepTwo && action.type === 'erase') return;
      if (action.type === 'none') return;
      if (action.type === 'select') return input.onSelect(unit.id, action.additive);
      if (action.type === 'miss') return input.onEditMiss();
      if (action.type === 'add') return input.onAddContact(unit.id, candidate.world.point, candidate.world.normal);
      if (action.type === 'erase') return input.onErase(unit.id, candidate.world.point);
      if (!contactId) return;
      if (action.type === 'toggle') return input.onToggleContact(unit.id, contactId);
      if (action.type === 'removeContact') return input.onRemoveContact(unit.id, contactId);
      return;
    }

    // Nothing was hit at all. `missAction` decides whether that deselects or explains.
    if (travel > CLICK_TOLERANCE) return;
    const miss = missAction({
      mode: gestureMode(gesture),
      button: right ? 'right' : event.button === 1 ? 'middle' : 'left',
      gizmoDragging: input.gizmoDragging(),
    });
    if (miss.type === 'miss') input.onEditMiss();
    else if (miss.type === 'deselect') input.onSelect(null, false);
  };

  const onUp = (event: PointerEvent) => {
    if (event.button !== 0) return;
    act(event, false);
  };
  const onContext = (event: MouseEvent) => {
    event.preventDefault();
    act(event as PointerEvent, true);
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('contextmenu', onContext);
  return () => {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('contextmenu', onContext);
  };
}
