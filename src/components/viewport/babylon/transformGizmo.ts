import { GizmoManager, type ArcRotateCamera, type Scene, type TransformNode } from '@babylonjs/core';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { transformFromMesh } from '../babylonTransform';

/*
 * Moving and turning a unit. This is the one place Babylon is plainly less work than three.js: the
 * three.js view drives `TransformControls` from `three-stdlib` and restyles it in 254 lines
 * (`gizmoStyle.ts`); Babylon ships `GizmoManager`.
 *
 * IT MOVES A NODE, NOT A MESH. Each unit has one `TransformNode` carrying `unit.transform`, with
 * its model, its supports and its zone overlay parented to it -- the same arrangement `UnitObject`
 * makes with a group. So a drag moves everything attached, and no second piece of code has to
 * remember to follow.
 *
 * THE COMMIT IS ONE CALL PER DRAG, on release, not per frame. `onTransform` puts a step on the
 * history, and a step per pointer move would make a single nudge impossible to undo.
 *
 * The camera stands down for the duration, as it does for a brush stroke: without that, dragging a
 * gizmo handle also orbits the scene, and the handle runs away from the pointer.
 */

export type GizmoKind = 'translate' | 'rotate' | undefined;

export interface TransformGizmoInput {
  canvas: HTMLCanvasElement;
  camera: ArcRotateCamera;
  /** One call per finished drag, with the unit the gizmo was on. */
  onCommit: (unitId: string, transform: ModelTransform) => void;
}

export interface TransformGizmo {
  /** Puts the gizmo on a unit's node, or takes it off when the kind or the node is undefined. */
  show(unitId: string | undefined, node: TransformNode | undefined, kind: GizmoKind): void;
  dispose(): void;
}

export function attachTransformGizmo(scene: Scene, input: TransformGizmoInput): TransformGizmo {
  const manager = new GizmoManager(scene);
  // The app decides what the gizmo is on, from its own selection: letting Babylon attach on click
  // would fight the app's picking and put the gizmo on things that are not the active unit.
  manager.usePointerToAttachGizmos = false;

  let on: { unitId: string; node: TransformNode } | undefined;
  const wired = new Set<object>();

  const wire = (gizmo: { onDragStartObservable: { add(cb: () => void): unknown }; onDragEndObservable: { add(cb: () => void): unknown } } | null | undefined) => {
    if (!gizmo || wired.has(gizmo)) return;
    wired.add(gizmo);
    gizmo.onDragStartObservable.add(() => input.camera.detachControl());
    gizmo.onDragEndObservable.add(() => {
      input.camera.attachControl(input.canvas, true);
      if (on) input.onCommit(on.unitId, transformFromMesh(on.node));
    });
  };

  return {
    show(unitId, node, kind) {
      if (!unitId || !node || !kind) {
        manager.attachToNode(null);
        manager.positionGizmoEnabled = false;
        manager.rotationGizmoEnabled = false;
        on = undefined;
        return;
      }
      manager.positionGizmoEnabled = kind === 'translate';
      manager.rotationGizmoEnabled = kind === 'rotate';
      // Wired AFTER enabling, because a gizmo is only built when its flag goes true.
      wire(manager.gizmos.positionGizmo);
      wire(manager.gizmos.rotationGizmo);
      manager.attachToNode(node);
      on = { unitId, node };
    },
    dispose() {
      on = undefined;
      wired.clear();
      manager.dispose();
    },
  };
}
