import { useEffect, useRef } from 'react';
// shortcut: the whole of @babylonjs/core, not deep per-module imports, until three.js is retired
// and the bundle is worth optimising. Deep imports need each shader registered by hand, and a
// missing one fails at runtime in the browser rather than at build time.
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  ImageProcessingConfiguration,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  TransformNode,
  Vector3,
  VertexData,
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { babylonPlacement } from './viewport/babylonTransform';
import { drawSurfaceStamps } from './viewport/babylon/surfaceStamps';
import { drawDentalFace, drawDentalRegionLines } from './viewport/babylon/dentalArea';
import { drawDentalRim, drawDentalRisks } from './viewport/babylon/dentalMarks';
import { drawTipMarkers } from './viewport/babylon/tipMarkers';
import { drawFaceTint } from './viewport/babylon/faceTint';
import { drawSupportBodies } from './viewport/babylon/supportBodies';
import { splitTipMarks, TIP_SCALE, type TipMarks } from './viewport/tipMarkSplit';
import { drawAddFlash, drawPlateOutline } from './viewport/babylon/sceneMarks';
import { drawDebugLayers, drawProblemMarks } from './viewport/babylon/checkMarks';
import { createDomAnchors, type DomAnchors } from './viewport/babylon/domAnchor';
import { angularSensibilityFor, attachDolly, attachOrbit, panningSensibilityFor } from './viewport/babylon/orbit';
import type { SurfacePath } from '../core/surfacePath/path';
import { drawPrintAngle } from './viewport/babylon/printAngle';
import { tokenCss } from '../ui/tokenColour';
import { AnchoredDom, type AnchoredItem } from './viewport/babylon/AnchoredDom';
import { bubblePointsFor } from './viewport/babylon/bubblePoints';
import { displayMesh } from '../state/meshExtras';
import { UnresolvedBubble, LandingMark } from './viewport/UnresolvedBubbles';
import { useCallback, useMemo, useState } from 'react';
import { tipsOf } from '@mixo-geocore/host/core/supports/meshQuery';
import { resolveSettings as resolveUnitSettings } from '@mixo-geocore/host/supports/unitSupports';
import { attachSurfaceBrush, type ActiveBrush } from './viewport/babylon/paintStroke';
import type { SurfaceStamp } from '@mixo-geocore/editing/surfaceBrush';
import { attachEditClicks } from './viewport/babylon/editClicks';
import { attachRimDraw } from './viewport/babylon/rimDraw';
import { drawRimDraft } from './viewport/babylon/rimLayer';
import { attachCameraViews, type CameraViews } from './viewport/babylon/cameraViews';
import { attachEditPreview } from './viewport/babylon/editPreview';
import { createSurfacePointer, type SurfacePointer } from './viewport/babylon/surfacePointer';
import { createSelectionColours, type SelectionColours } from './viewport/babylon/selectionColours';
import { attachTransformGizmo, type TransformGizmo } from './viewport/babylon/transformGizmo';
import { gizmoShown } from './ObjectViewport';
import { gestureMode } from '@mixo-geocore/editing/gesture';
import { brushPreview } from '@mixo-geocore/editing/selection';
import { createStroke } from '@mixo-geocore/editing/stroke';
import { useBrushOverlay } from './viewport/useBrushOverlay';
import { createBrushBodies } from './viewport/babylon/brushBodies';
import { resolveSettings, unitContacts } from '@mixo-geocore/host/supports/unitSupports';
import { releaseHandle } from './viewport/babylon/sessionHandles';
import { SEE_THROUGH, ZONE_OPACITY } from './viewport/style';
import { useViewportColours, type ViewportColours } from './viewport/sceneColours';
import { canvasCursor } from './viewport/style';
import { pointerOnTool } from './viewport/toolSurface';
import type { ObjectViewportProps } from './viewport/types';

/*
 * The Babylon.js 3D view, reached by `?renderer=babylon` (src/ui/renderer.ts). The three.js view
 * in `ObjectViewport.tsx` is still the one the walk proves and the one a visitor gets.
 *
 * WHAT THIS DRAWS TODAY: all of it. Every one of the 40 `ObjectViewportProps` is read -- the
 * models, the supports, the grid, the zone and dental layers, the rim, the gizmo, the bubbles, the
 * edit preview, the print angle, the clicks and both brushes. That COUNT is the honest measure of
 * the migration, not a list of layers: a layer can be drawn and still be unreachable because the
 * prop feeding it was never read. Two visuals remain as data without a drawing (the Drag over
 * ghost and Step 2's tip solid/ghost split), and the real finish line is `scripts/walk.mjs`, which
 * drives three.js and not this view. `src/components/viewport/README.md` carries both.
 *
 * There is deliberately no on-screen "preview" notice: a sentence here is a user-facing string and
 * would need the owner's wording in three languages (src/i18n.test.ts globs this folder) for
 * scaffolding that gets deleted when the last layer lands. The view is opt-in by URL instead, so
 * nobody arrives here without having asked for it.
 *
 * It takes the full `ObjectViewportProps` so App can swap one component for the other without
 * restructuring its props.
 */

const CAMERA = { position: new Vector3(70, 60, 90), fovDeg: 40, near: 0.5, far: 4000 } as const;

function modelColour(colours: ViewportColours, unitId: string, scene: ObjectViewportProps['scene']): string {
  if (scene.activeUnitId === unitId) return colours.model.active;
  return scene.selectedUnitIds.includes(unitId) ? colours.model.selected : colours.model.idle;
}

/** A core triangle mesh as Babylon vertex data. Typed arrays are passed through, never copied into
 *  plain arrays: a patient scan is millions of triangles and `Array.from` on it is the memory cliff. */
function applyGeometry(mesh: Mesh, source: TriangleMesh): void {
  const data = new VertexData();
  data.positions = source.positions;
  data.indices = source.indices;
  const normals = new Float32Array(source.positions.length);
  VertexData.ComputeNormals(source.positions, source.indices, normals);
  data.normals = normals;
  data.applyToMesh(mesh);
}

/*
 * An overlay that redraws on its OWN schedule, outside the units effect.
 *
 * It exists because of one measurement: Drag over changes its preview every frame, and the units
 * effect rebuilds every mesh in the scene. Anything that follows the brush must therefore be drawn
 * and disposed apart from it. `redraw` is set during render (so it reads today's values), called at
 * the end of the units effect (so a fresh scene is never a frame behind) and from the overlay's own
 * small effect, whose dependencies are only what IT draws from.
 */
function useOverlaySlot(): { drawn: { current: (() => void) | undefined }; redraw: { current: () => void } } {
  const drawn = useRef<(() => void) | undefined>(undefined);
  const redraw = useRef(() => {});
  useEffect(() => () => {
    drawn.current?.();
    drawn.current = undefined;
  }, []);
  return { drawn, redraw };
}

export default function BabylonObjectViewport(props: ObjectViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /*
   * The canvas as STATE as well as a ref. The effects here are attached once and read the ref, but
   * `useBrushOverlay` is a hook outside this component and takes the element as an input: a ref
   * never re-renders, so the brush would be handed null for the life of the view.
   */
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const setCanvas = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    setCanvasEl(node);
  }, []);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  // Read by the pointer handlers, which are attached once and must still see today's props.
  const propsRef = useRef(props);
  propsRef.current = props;
  /** Meshes this view has (or may have) loaded into the engine session, so they can be given back. */
  const loaded = useRef(new Set<TriangleMesh>());
  /** The node carrying each unit's transform, which is what the gizmo moves. */
  const unitNodes = useRef(new Map<string, TransformNode>());
  /*
   * The support geometry actually DRAWN per unit, which in tips view is the tip subset and not the
   * whole build. The pointer answers from this rather than from `supportMeshes`, because what the
   * three.js view picks is whatever mesh is on screen -- it raycasts the drawn objects -- and a
   * pointer that answered from the full build would let a click land on a strut nobody can see.
   */
  const drawnSupports = useRef(new Map<string, GeneratedSupportMesh>());
  /** Per-unit selection highlights, recoloured without rebuilding the meshes (see the apply effect). */
  const highlights = useRef(new Map<string, SelectionColours>());
  /** Recolours every highlight for the selection as it is now. Set with the brush, below. */
  const paintHighlights = useRef(() => {});
  const gizmoRef = useRef<TransformGizmo | null>(null);
  const camerasRef = useRef<CameraViews | null>(null);
  const anchorsRef = useRef<DomAnchors | null>(null);
  const pointerRef = useRef<SurfacePointer | null>(null);
  /** The rim as it is being dragged, so the drawn line follows the pointer mid-gesture. */
  const [rimDrag, setRimDrag] = useState<SurfacePath | undefined>(undefined);
  /*
   * Whether the pointer sits on the model while rim define mode is open - for the CURSOR only.
   * `useBrushOverlay`'s `over` cannot answer it: that flag means "the brush circle is showing", and
   * rim mode has no brush, so this view showed the camera's grab hand over the model (the three.js
   * view had the same fault, from the same question; `viewport/toolSurface.ts` holds the rule now).
   */
  const [rimHover, setRimHover] = useState(false);
  /** The surface stamps of the stroke still under the pointer, so the paint appears as it is laid. */
  const [livePaint, setLivePaint] = useState<{ unitId: string; stamps: readonly SurfaceStamp<string>[] } | undefined>(undefined);
  /** Where DOM anchored to 3D points is mounted: an overlay the size of the canvas. */
  const overlayRef = useRef<HTMLDivElement | null>(null);
  // The scene is built in an effect, so the first render has no overlay or anchors yet. This flips
  // once they exist, which is what lets the anchored DOM mount at all.
  const [sceneReady, setSceneReady] = useState(false);
  const colours = useViewportColours();
  // Read by the pointer layers, which are attached once and must still see today's tokens.
  const coloursRef = useRef(colours);
  coloursRef.current = colours;
  const { scene: printScene, supportMeshes, modelVisible, wireframe } = props;

  // The engine, scene, camera and lights: built once, disposed once. Nothing in here depends on the
  // props, so a scene change never rebuilds the renderer.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    // THE ONE SETTING THAT MUST NOT CHANGE: right-handed, so this scene, the three.js scene, the
    // core and the Rust engine all share one frame. Left-handed would need every position, normal
    // and matrix mirrored in Z at this boundary (src/core/handedness.ts).
    scene.useRightHandedSystem = true;
    // r3f's <Canvas> turns ACES tone mapping on by default and Babylon has none by default, which
    // is why the first Babylon draft rendered the model as a flat white silhouette: the same three
    // lights that look right through ACES blow out without it. Matching the other view's exposure
    // is not a style choice here, it is the difference between "same app" and "different app".
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;

    const camera = new ArcRotateCamera('view', 0, 0, 1, Vector3.Zero(), scene);
    camera.setPosition(CAMERA.position.clone());
    camera.fov = (CAMERA.fovDeg * Math.PI) / 180;
    camera.minZ = CAMERA.near;
    camera.maxZ = CAMERA.far;
    /*
     * The orbit is attached HERE and taken away by whichever gesture owns the pointer -- the
     * surface brush, Drag over, a rim drag -- each of which gives it back however its gesture ends.
     * That handover is the whole reason a drag paints instead of turning the view: three gets it
     * from r3f's event order, and here it is explicit.
     */
    attachOrbit(camera, canvas);
    /*
     * HOW THE VIEW MOVES IS `orbit.ts`'s, and every number there is drei's OrbitControls read out of
     * its source. Turning, panning and zooming are the gestures an operator makes a thousand times
     * a day; a view that turns seven times too far per pixel (Babylon's default) still works, still
     * looks right in a screenshot, and feels like a different app the moment anyone uses it.
     */
    camera.inertia = 0;
    camera.panningInertia = 0;
    const matchOrbitSpeed = () => {
      const perRadian = angularSensibilityFor(canvas.clientHeight);
      camera.angularSensibilityX = perRadian;
      camera.angularSensibilityY = perRadian;
    };
    matchOrbitSpeed();
    /*
     * The panning sensibility is a DISTANCE-dependent number here because three's pan is: it moves
     * the world by as much as a pixel covers at the target's depth, so a close model pans slowly
     * and a distant one quickly. Babylon takes one fixed number, so it is recomputed each frame --
     * the camera's radius is the only input that changes.
     */
    const matchPanSpeed = scene.onBeforeRenderObservable.add(() => {
      camera.panningSensibility = panningSensibilityFor(camera.radius, camera.fov, canvas.clientHeight);
    });
    /*
     * The wheel and the middle-drag dolly are `orbit.ts`'s too. Babylon's own wheel input is removed
     * first so the two cannot both answer; it is keyed by simple name, which is how it is reached.
     */
    const wheelInput = camera.inputs.attached['mousewheel'];
    if (wheelInput) camera.inputs.remove(wheelInput);
    const detachDolly = attachDolly(camera, canvas);

    new HemisphericLight('sky', new Vector3(0, 1, 0), scene).intensity = 1.3;
    const key = new DirectionalLight('key', new Vector3(-40, -80, -30).normalize(), scene);
    key.intensity = 1.4;
    const fill = new DirectionalLight('fill', new Vector3(50, -30, 40).normalize(), scene);
    fill.intensity = 0.45;

    /*
     * The floor. The three.js view uses drei's infinite shader grid; this is a large ground with
     * Babylon's GridMaterial, matched on the numbers that are visible rather than on the
     * implementation: a line every 5mm (`gridRatio`) and a heavier one every 25mm, which is
     * `majorUnitFrequency` 5 because 25 / 5 = 5.
     *
     * Not culled on the back face, because the app has a Bottom view that looks up at the plate
     * from underneath, and a one-sided floor would vanish exactly when the operator is checking
     * what touches it.
     *
     * shortcut: 1000mm square and no distance fade, where drei's grid is infinite and fades at
     * 400mm. At the framed camera the edge is well outside the view; revisit if a plate or a scene
     * ever gets big enough to show it.
     */
    const floor = MeshBuilder.CreateGround('floor', { width: 1000, height: 1000 }, scene);
    const grid = new GridMaterial('floor-grid', scene);
    grid.gridRatio = 5;
    grid.majorUnitFrequency = 5;
    grid.backFaceCulling = false;
    floor.material = grid;
    floor.isPickable = false;

    sceneRef.current = scene;
    cameraRef.current = camera;
    engine.runRenderLoop(() => scene.render());
    const onResize = () => {
      engine.resize();
      matchOrbitSpeed();
    };
    window.addEventListener('resize', onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);

    return () => {
      detachDolly();
      scene.onBeforeRenderObservable.remove(matchPanSpeed);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      engine.stopRenderLoop();
      sceneRef.current = null;
      cameraRef.current = null;
      scene.dispose();
      engine.dispose();
    };
  }, []);

  /*
   * The zone brush (layer 0): the pointer path from a press on the canvas to one stroke on the
   * history. Attached once, because tearing pointer handlers down and rebuilding them on every
   * prop change is how a drag in flight loses its own pointerup.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;
    const scene = sceneRef.current;
    if (!scene) return;
    // One pointer for every layer that asks what is under the cursor, so the frame conversion it
    // holds cannot come to differ between them.
    const pointer = createSurfacePointer({
      canvas,
      camera,
      // `PrintUnit.supports` is the stored descriptor; the geometry a click can land on is what the
      // units effect DREW (`drawnSupports`), which in tips view is only the tips.
      units: () => propsRef.current.scene.units.map((unit) => ({
        id: unit.id,
        // The mesh that is DRAWN, which for a heavy import is its simplified copy: the pointer must
        // answer about the surface on screen, as three's raycast does by construction.
        source: displayMesh(unit.source),
        transform: unit.transform,
        ...(drawnSupports.current.get(unit.id) ? { supports: drawnSupports.current.get(unit.id)! } : {}),
      })),
    });
    pointerRef.current = pointer;
    const gesture = () => propsRef.current.gesture;
    const detach = [
      attachSurfaceBrush({
        canvas,
        camera,
        pointer,
        /*
         * Which brush is in hand, and where its stroke goes. Zones and the dental area are the
         * same gesture on the same canvas, and the kinds stay in their own domain's vocabulary --
         * `paint`/`erase` for a zone, `allow`/`erase` for dental -- exactly as the three.js view
         * keeps them.
         */
        brush: (): ActiveBrush | undefined => {
          const current = propsRef.current.gesture;
          if (current.kind === 'zones') {
            return {
              radius: current.brush.radius,
              kind: current.brush.kind,
              commit: (unitId, stamps) => propsRef.current.onZoneStroke(unitId, stamps as never),
            };
          }
          if (current.kind === 'dental-area' && current.brush) {
            const { radius, kind } = current.brush;
            return { radius, kind, commit: (unitId, stamps) => propsRef.current.onDentalStroke(unitId, stamps as never) };
          }
          return undefined;
        },
        onLive: (unitId, stamps) => setLivePaint(unitId && stamps.length > 0 ? { unitId, stamps } : undefined),
      }),
      (() => {
        const anchors = createDomAnchors(scene, pointer.port);
        anchorsRef.current = anchors;
        setSceneReady(true);
        return () => {
          setSceneReady(false);
          anchorsRef.current = null;
          anchors.dispose();
        };
      })(),
      (() => {
        const views = attachCameraViews(scene, {
          camera,
          canvas,
          nodeFor: (unitId) => unitNodes.current.get(unitId),
          onBelowPlate: (value) => propsRef.current.onBelowPlate(value),
        });
        camerasRef.current = views;
        return () => {
          camerasRef.current = null;
          views.dispose();
        };
      })(),
      (() => {
        const gizmo = attachTransformGizmo(scene, {
          canvas,
          camera,
          onCommit: (unitId, transform) => propsRef.current.onTransform(unitId, transform),
        });
        gizmoRef.current = gizmo;
        return () => {
          gizmoRef.current = null;
          gizmo.dispose();
        };
      })(),
      /*
       * What a click MEANS is decided by geocore's `pickAction`, the same function the three.js
       * view's handlers adapt to. Sharing the decision is what makes the two views behave
       * identically; matching them by hand would hold only until one of them changed.
       */
      /*
       * Rim define mode takes the pointer whole while it is on: the target UNDER THE PRESS decides
       * what happens, and `rimTapAt` / `rimTargetAt` make that decision for both renderers.
       */
      attachRimDraw({
        canvas,
        camera,
        pointer,
        drawing: () => propsRef.current.gesture.kind === 'dental-rim',
        draft: () => {
          const active = propsRef.current.scene.units.find((unit) => unit.id === propsRef.current.scene.activeUnitId);
          return active ? { unitId: active.id, path: active.rimDraft } : undefined;
        },
        onRimPoint: (unitId, point, normal) => propsRef.current.onRimPoint(unitId, point, normal),
        onRimPath: (unitId, path) => propsRef.current.onRimPath(unitId, path),
        onRimSelect: (at) => propsRef.current.onRimSelect(at),
        onDragPath: setRimDrag,
        onHover: setRimHover,
      }),
      attachEditClicks({
        canvas,
        pointer,
        gesture,
        mode: () => gestureMode(propsRef.current.gesture),
        liveTool: () => propsRef.current.liveTool?.(),
        unitFor: (unitId) => {
          const unit = propsRef.current.scene.units.find((u) => u.id === unitId);
          if (!unit) return undefined;
          const supports = propsRef.current.supportMeshes.get(unitId);
          return { id: unit.id, active: propsRef.current.scene.activeUnitId === unit.id, ...(supports ? { supports } : {}) };
        },
        gizmoDragging: () => false,
        stepTwo: () => propsRef.current.dentalArea === true,
        onPickTip: (unitId, point) => propsRef.current.onPickTip(unitId, point),
        onSelect: (unitId, additive) => propsRef.current.onSelect(unitId, additive),
        onAddContact: (unitId, point, normal) => propsRef.current.onAddContact(unitId, point, normal),
        onErase: (unitId, point) => propsRef.current.onErase(unitId, point),
        onRemoveContact: (unitId, contactId) => propsRef.current.onRemoveContact(unitId, contactId),
        onToggleContact: (unitId, contactId) => propsRef.current.onToggleContact(unitId, contactId),
        onEditMiss: () => propsRef.current.onEditMiss(),
      }),
      attachEditPreview(scene, {
        canvas,
        pointer,
        gesture,
        colours: () => coloursRef.current.preview,
        settingsFor: (unitId) => {
          const unit = propsRef.current.scene.units.find((u) => u.id === unitId);
          return unit ? resolveSettings(unit.settings) : undefined;
        },
        contactsFor: (unitId) => {
          const unit = propsRef.current.scene.units.find((u) => u.id === unitId);
          return unit ? unitContacts(unit, propsRef.current.supportMeshes.get(unitId)) : [];
        },
      }),
    ];
    return () => { for (const off of detach) off(); };
  }, []);

  /*
   * Engine session handles are given back when a unit leaves and when the view does. Without this
   * every model ever imported stays loaded in the engine for the rest of the session, and these
   * are patient scans.
   */
  useEffect(() => {
    const here = new Set(printScene.units.map((unit) => unit.source));
    for (const mesh of loaded.current) {
      if (!here.has(mesh)) {
        releaseHandle(mesh);
        loaded.current.delete(mesh);
      }
    }
    for (const mesh of here) loaded.current.add(mesh);
  }, [printScene.units]);

  useEffect(() => {
    const held = loaded.current;
    return () => {
      for (const mesh of held) releaseHandle(mesh);
      held.clear();
    };
  }, []);


  // The lights and background take their colours from the same CSS tokens as the DOM, re-read
  // whenever a token changes, so a theme switch recolours this scene exactly as it does the other.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.clearColor = Color4.FromHexString(`${colours.scene.background}ff`);
    const sky = scene.getLightByName('sky') as HemisphericLight | null;
    if (sky) {
      sky.diffuse = Color3.FromHexString(colours.scene.lightSky);
      sky.groundColor = Color3.FromHexString(colours.scene.lightGround);
    }
    const grid = scene.getMaterialByName('floor-grid') as GridMaterial | null;
    if (grid) {
      // `mainColor` is the floor between the lines, so it is the scene background: the grid has to
      // sit ON the background, not on a second surface a shade away from it.
      grid.mainColor = Color3.FromHexString(colours.scene.background);
      grid.lineColor = Color3.FromHexString(colours.scene.gridSection);
      // The minor lines are the lighter token; GridMaterial has one line colour and a visibility
      // for the minors, so the ratio is what carries the difference the two tokens describe.
      grid.minorUnitVisibility = 0.45;
    }
  }, [colours]);

  // One mesh per unit and one for its built supports, rebuilt when either changes. Disposed on the
  // way out, because a Babylon mesh holds GPU buffers that no garbage collector frees.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const built: Array<Mesh | TransformNode> = [];
    const disposers: Array<() => void> = [];
    // The build plate, when a printer is chosen. Scene-level: it belongs to no unit.
    if (props.plate) disposers.push(drawPlateOutline(scene, 'plate-outline', props.plate, colours.preview.plate));
    const nodes = unitNodes.current;
    nodes.clear();
    drawnSupports.current.clear();
    highlights.current.clear();
    for (const unit of printScene.units) {
      /*
       * ONE node per unit, carrying `unit.transform`, with the model, the supports and the zone
       * overlay hanging off it at local identity. This mirrors `UnitObject`, which puts one group
       * at `unit.transform` and draws everything inside it -- and it is what lets the gizmo move a
       * unit by moving a single node, with everything attached following for free rather than by
       * three separate pieces of code remembering to agree.
       */
      const shown = displayMesh(unit.source);
      /*
       * The surface overlays are built against the SOURCE mesh's triangles, so they only fit a unit
       * that is drawn at full detail. `UnitObject` gates every one of them on `shown === unit.source`
       * for exactly that reason, and so does this: an overlay stretched over a simplified copy is a
       * drawing that says something the model does not.
       */
      const overlaysFit = shown === unit.source;
      const node = new TransformNode(`${unit.id}-unit`, scene);
      const { position, rotationQuaternion } = babylonPlacement(unit.transform);
      node.position = position;
      node.rotationQuaternion = rotationQuaternion;
      nodes.set(unit.id, node);
      built.push(node);

      const mesh = new Mesh(unit.id, scene);
      mesh.parent = node;
      built.push(mesh);
      /*
       * THE DISPLAY COPY, NOT THE SOURCE, and the two must be the same mesh here as in the other
       * view. A heavy import gets a simplified copy and `UnitObject` both DRAWS and PICKS that one;
       * this view drew and picked the full mesh, so a click at the same screen point landed on a
       * different triangle. The walk said so from the dental flow: at the same spot, 0.38/0.47,
       * three reported "Support added." and this view reported "This spot faces up" -- one surface,
       * two answers, because they were not the same surface.
       */
      applyGeometry(mesh, shown);
      // PBR, not StandardMaterial: the three.js view draws with MeshStandardMaterial, whose
      // metalness/roughness response Babylon's StandardMaterial does not share. Its defaults are
      // metalness 0 and roughness 1, so those are the numbers to match, not ones chosen by eye.
      const material = new PBRMaterial(`${unit.id}-material`, scene);
      material.albedoColor = Color3.FromHexString(modelColour(colours, unit.id, printScene));
      material.metallic = 0;
      material.roughness = 1;
      material.wireframe = wireframe;
      // SETTLED, and worth keeping because the wrong answer was convincing. An earlier draft of
      // this view showed about 1,100 dark speckles inside the model's silhouette, and the obvious
      // suspect was winding: Babylon inverts its culling convention when `useRightHandedSystem` is
      // true, so an inverted mesh was a very plausible story. It was not that. The speckles were
      // StandardMaterial lit without tone mapping blowing out and clipping; switching to PBR at
      // MeshStandardMaterial's defaults and turning ACES on removed them, and the canvas now
      // measures ZERO pixels below luminance 90. The winding is fine, culling stays ON, and
      // nothing here needs `sideOrientation`.
      mesh.material = material;
      mesh.isVisible = modelVisible;

      /*
       * The built supports for this unit, when there are any.
       *
       * They sit at `unit.transform`, the SAME transform as the model, because that is what the
       * three.js view does: `UnitObject` puts one group at `unit.transform` and draws the model and
       * `SupportBodies` inside it, and `SupportBodies` applies no transform of its own. The support
       * geometry is unit-local, so it is rigidly attached and travels with the model.
       *
       * An earlier version of this used `generationTransform(unit)` and argued for it at length.
       * That was wrong. `generationTransform` is DATA -- the frame the supports were generated in,
       * which things like `UnresolvedBubbles` are given so they can reason about it -- and it is
       * not where the bodies are drawn. Using it left the supports behind whenever a model moved.
       */
      /*
       * TIPS ONLY: the bodies come off and only the contact tips are drawn, which is how an
       * operator checks a crowded model. `tipsOf` is geocore's and returns the tip geometry as a
       * mesh of its own, so the two views show the same subset rather than two similar ones.
       */
      const built0 = supportMeshes.get(unit.id);
      const supports = built0 && props.tipsView ? tipsOf(built0) : built0;
      if (supports) drawnSupports.current.set(unit.id, supports);
      if (supports && supports.indices.length > 0) {
        const supportMesh = new Mesh(`${unit.id}-supports`, scene);
        supportMesh.parent = node;
        built.push(supportMesh);
        applyGeometry(supportMesh, supports);
        const supportMaterial = new PBRMaterial(`${unit.id}-supports-material`, scene);
        supportMaterial.metallic = 0;
        supportMaterial.roughness = 1;
        supportMesh.material = supportMaterial;
        supportMesh.isPickable = false;
        /*
         * The selection highlight recolours this one mesh's vertices rather than drawing a second
         * mesh of the selected bodies. The material's albedo stays WHITE here, because a PBR
         * albedo multiplies the vertex colour: tint it as well and every support comes out the
         * product of two colours, which looks like the selection tone is wrong.
         */
        supportMaterial.albedoColor = Color3.White();
        /*
         * The handle is kept and the colouring is done by `paintHighlights` (declared below with
         * the brush, and called at the end of this effect so a fresh mesh is never drawn white for
         * a frame). Applying it HERE from `props.selection` was what forced this effect to depend
         * on the selection -- and Drag over changes its preview every frame, so that would have
         * meant rebuilding every mesh in the scene on every frame of a stroke.
         */
        highlights.current.set(unit.id, createSelectionColours(supportMesh, supports));
      }

      /*
       * The denture's add-on parts, tinted on the model's own faces. Drawn from a mask and a
       * colour, which is why it can be drawn here at all: the prop used to carry an r3f element.
       */
      if (overlaysFit && props.unitTint?.unitId === unit.id) {
        disposers.push(drawFaceTint(scene, {
          name: `${unit.id}-unit-tint`,
          mesh: unit.source,
          mask: props.unitTint.mask,
          parent: node,
          colour: props.unitTint.colour,
        }));
      }


      /*
       * The dental support area being painted in Step 2. Same module as the zones, because it IS
       * the same job -- brush stamps on a surface -- with a different vocabulary: `allow` fills
       * where a zone's `paint` does. Opacity 0.7 is `UnitObject`'s own number for these layers.
       */
      /*
       * THE ACCEPTED POLICY FIRST, THEN THE PREVIEW, which is `UnitObject`'s own `areaPolicy`. This
       * view read only the preview, so once Step 1 handed a policy over and the preview went away,
       * every area layer vanished with it -- the drawing was saved and invisible.
       */
      const area = unit.dental ?? (props.dentalAreaPreview?.unitId === unit.id ? props.dentalAreaPreview.policy : undefined);
      /*
       * A two-contour policy carries a DETECTED region, so it gets the face tint and the exact trim
       * lines; the brush stamps on top are the same surface-stamp layer the zones use. Any other
       * policy kind -- a hand-drawn rim is always one, because a drawn loop claims no detection it
       * did not earn -- has its stamps and the rim outline.
       */
      if (overlaysFit && area?.kind === 'two-contour') {
        disposers.push(drawDentalFace(scene, {
          name: `${unit.id}-dental-face`,
          mesh: unit.source,
          parent: node,
          policy: area,
          colour: colours.preview.areaPermitted,
          opacity: 0.7,
        }));
        disposers.push(drawDentalRegionLines(scene, {
          name: `${unit.id}-dental-lines`,
          mesh: unit.source,
          parent: node,
          policy: area,
          outerColour: colours.preview.ring,
          openingColour: colours.preview.areaEdge,
        }));
        // The rim wears the EDGE colour, never the area fill: in Step 2 the operator paints the
        // area in that fill, and a boundary wearing it would vanish into their first stroke.
        disposers.push(drawDentalRim(scene, {
          name: `${unit.id}-dental-rim`,
          parent: node,
          rim: area.rim,
          colour: colours.preview.areaEdge,
        }));
      } else if (overlaysFit && area) {
        /*
         * THE RIM THE OPERATOR DREW, and the check that caught its absence is `u5j`: it measures the
         * edge colour on the canvas, and this view showed zero pixels of it. three draws
         * `DentalRimOutline` on exactly this branch, in the same edge colour, for the same reason --
         * a rim that cannot be seen in Step 2 means rim define mode only moved the dead end one
         * screen later.
         */
        disposers.push(drawDentalRim(scene, {
          name: `${unit.id}-dental-rim`,
          parent: node,
          rim: area.rim,
          colour: colours.preview.areaEdge,
        }));
      }

      /*
       * Step 2's reviewed contacts, drawn as cone markers without building any support body.
       *
       * The solid/ghost split is NOT done: three draws three sets -- plain, selected (solid red at
       * a larger scale) and the drag-over ghost -- and this draws only the plain one, because the
       * other two need the tip selection plumbed through and that is a prop this view does not take
       * yet. Scale 0.42 is three's number for the plain set.
       */
      /*
       * The rim being drawn. Mid-drag the path comes from the drag rather than the unit, so the
       * line follows the pointer; the unit's own draft only catches up when the drag is dropped.
       */
      const drawnRim = rimDrag ?? unit.rimDraft;
      if (drawnRim && propsRef.current.scene.activeUnitId === unit.id) {
        const gestureNow = props.gesture;
        disposers.push(drawRimDraft(scene, {
          name: `${unit.id}-rim-draft`,
          parent: node,
          path: drawnRim,
          ...(gestureNow.kind === 'dental-rim' && gestureNow.selected !== undefined ? { selected: gestureNow.selected } : {}),
          colour: colours.preview.remove,
        }));
      }

      // The print angle, on the plate beside the model, with its reading as real DOM.
      const anchors = anchorsRef.current;
      const overlay = overlayRef.current;
      if (props.printAngle?.unitId === unit.id && anchors && overlay) {
        disposers.push(drawPrintAngle({
          name: `${unit.id}-print-angle`,
          scene,
          parent: node,
          anchors,
          host: overlay,
          bounds: node.getHierarchyBoundingVectors(true),
          deg: props.printAngle.deg,
          colour: tokenCss('--angle-mark'),
        }));
      }

      // Support-check findings on this unit, and Step 1's evidence layers.
      const found = props.problems.filter((problem) => problem.unitId === unit.id);
      if (found.length > 0) {
        disposers.push(drawProblemMarks(scene, {
          name: `${unit.id}-problems`,
          parent: node,
          problems: found,
          colours: colours.preview,
          opacity: 0.55,
        }));
      }
      if (props.debugLayers?.unitId === unit.id && props.debugLayers.layers.length > 0) {
        disposers.push(drawDebugLayers(scene, {
          name: `${unit.id}-debug`,
          parent: node,
          layers: props.debugLayers.layers,
        }));
      }

      // The ring that opens where a support was just added.
      if (props.added?.unitId === unit.id) {
        disposers.push(drawAddFlash(scene, {
          name: `${unit.id}-add-flash`,
          parent: node,
          at: props.added,
          radius: resolveUnitSettings(unit.settings).pillarDiameter,
          colour: colours.preview.remove,
        }));
      }

      // Overhang low points outside the permitted area. Display only: supports and export ignore it.
      const risks = props.dentalRisks?.unitId === unit.id ? props.dentalRisks.risks : undefined;
      if (overlaysFit && risks && risks.length > 0) {
        disposers.push(drawDentalRisks(scene, {
          name: `${unit.id}-dental-risks`,
          mesh: unit.source,
          parent: node,
          risks,
          colour: colours.preview.riskOutside,
          opacity: 0.85,
        }));
      }
    }
    paintHighlights.current();
    paintLayer.redraw.current();
    ghost.redraw.current();
    tipLayer.redraw.current();
    return () => {
      paintLayer.drawn.current?.();
      paintLayer.drawn.current = undefined;
      ghost.drawn.current?.();
      ghost.drawn.current = undefined;
      tipLayer.drawn.current?.();
      tipLayer.drawn.current = undefined;
      for (const dispose of disposers) dispose();
      for (const thing of built) {
        if (thing instanceof Mesh) thing.material?.dispose();
        thing.dispose();
      }
      nodes.clear();
      drawnSupports.current.clear();
      highlights.current.clear();
    };
    // `props.selection` is deliberately NOT a dependency: the highlight is recoloured in place by
    // the effect below, and a stroke's preview changes it every frame.
  }, [printScene, supportMeshes, colours, modelVisible, wireframe, props.gesture.kind, props.dentalAreaPreview, props.dentalRisks, props.dentalTips, props.tipsView, props.added, props.plate, props.problems, props.debugLayers, props.printAngle, props.unitTint, rimDrag]);

  /*
   * Fit / Bottom / side, and "Show me". Keyed on `seq` exactly as the three.js view is: a REPEATED
   * request carries a new seq, which is what lets pressing Fit twice frame twice.
   *
   * DECLARED AFTER THE UNITS EFFECT, FOR THE SECOND TIME IN THIS FILE AND THE SAME REASON. Effects
   * run in declaration order, and framing reads the node map the units effect fills. Declared
   * earlier, the fit that arrives WITH a freshly imported model found no node and did nothing: the
   * camera stayed where it was and the model sat tiny in the middle of the view. It looked like a
   * camera bug and was an ordering bug, and it cost the Babylon walk five rim checks -- the walk
   * aims at canvas fractions, so a model framed three times too small is a model the clicks miss.
   *
   * Proved by measurement, not by reading: with Fit pressed by hand the two views' models cover
   * exactly the same canvas cells, to the resolution of the probe. The arithmetic was never wrong.
   */
  useEffect(() => {
    const views = camerasRef.current;
    const request = props.viewRequest;
    if (!views || !request) return;
    const ids = printScene.selectedUnitIds.length > 0 ? printScene.selectedUnitIds : printScene.units.map((unit) => unit.id);
    views.frame(request, ids);
    // Keyed on `seq` ALONE, as three is. Adding the units here would re-frame whenever they
    // changed -- a camera that jumps when supports are generated -- and the ordering above is what
    // makes the first fit land, not a wider dependency.
  }, [props.viewRequest?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const views = camerasRef.current;
    if (!views || !props.focus) return;
    views.focus(props.focus);
  }, [props.focus?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * Which unit the gizmo is on, and in which mode. DECLARED AFTER THE UNITS EFFECT ON PURPOSE:
   * effects run in declaration order, and this one reads the node map that effect fills. Put it
   * earlier and on first load it finds an empty map, so the gizmo does not appear until some
   * unrelated re-render happens to run it again -- which is exactly how it behaved before.
   *
   * Which unit the gizmo is on, and in which mode. `gizmoShown` is the three.js view's own rule,
   * exported and renderer-free, so the two views cannot come to disagree about when a gizmo is
   * offered -- which is the sort of difference an operator reads as the app being in a different
   * state than it is.
   */
  useEffect(() => {
    const gizmo = gizmoRef.current;
    if (!gizmo) return;
    const kind = gizmoShown(props.gesture, props.gizmoMode, props.rotationGizmo === true);
    const activeId = printScene.activeUnitId ?? undefined;
    gizmo.show(activeId, activeId ? unitNodes.current.get(activeId) : undefined, kind);
  }, [props.gesture, props.gizmoMode, props.rotationGizmo, printScene.activeUnitId, printScene.units]);

  /*
   * DRAG OVER: the circle that selects supports by sweeping them. The rules, the circle element and
   * every pointer listener are `useBrushOverlay`'s and shared with the three.js view; what this
   * supplies is the three things only a renderer can answer (`brushBodies.ts`) and the same inputs
   * `UnitObject` computes for its own call -- so the two views cannot drift apart on what a sweep
   * selects, only on what it looks like.
   */
  const activeUnit = printScene.units.find((unit) => unit.id === printScene.activeUnitId);
  const brushEditing = gestureMode(props.gesture) !== 'off' && activeUnit !== undefined;
  const dragBrush = brushEditing && props.gesture.kind === 'drag' ? props.gesture.brush : undefined;
  /** The switch's OWN mode: `useBrushOverlay` adds Shift from the pointer, as the other view does. */
  const switchMode = brushEditing && props.gesture.kind === 'drag' ? props.gesture.base : undefined;
  const brushRadius = dragBrush?.radius;
  const switchBrush = useMemo(
    () => (brushRadius !== undefined && switchMode ? { radius: brushRadius, mode: switchMode } : undefined),
    [brushRadius, switchMode]);
  /*
   * WHICH BODIES THE CIRCLE SWEEPS, copied from `UnitObject` rather than reasoned out again: the
   * tips alone in tips view, nothing at all while a surface is being painted or in dental Step 2
   * (where the tips below stand in for bodies that do not exist yet).
   */
  const activeBuilt = activeUnit ? supportMeshes.get(activeUnit.id) : undefined;
  const brushSupports = useMemo(() => {
    if (props.gesture.kind === 'dental-area' || props.dentalArea === true) return undefined;
    return activeBuilt && props.tipsView ? tipsOf(activeBuilt) : activeBuilt;
  }, [activeBuilt, props.tipsView, props.gesture.kind, props.dentalArea]);
  const brushTips = props.dentalArea === true && activeUnit && props.dentalTips?.unitId === activeUnit.id
    ? props.dentalTips.points
    : undefined;
  /*
   * A stroke owns the left button from the press until it ends ANYWHERE -- the release is heard on
   * the window, because a drag that ends off the canvas still has to end, and the orbit has to come
   * back however it ends or the viewport silently stops turning.
   */
  const brushStrokeEnded = useRef(() => {});
  const [brushStroke] = useState(() => createStroke(() => brushStrokeEnded.current()));
  const releaseBrush = useCallback(() => void brushStroke.end(), [brushStroke]);
  brushStrokeEnded.current = () => {
    window.removeEventListener('pointerup', releaseBrush);
    window.removeEventListener('pointercancel', releaseBrush);
    window.removeEventListener('blur', releaseBrush);
    const canvas = canvasRef.current;
    if (cameraRef.current && canvas) attachOrbit(cameraRef.current, canvas);
  };
  useEffect(() => () => void brushStroke.end(), [brushStroke]);
  // The brush going away mid-stroke (the tool or the mode changed) ends it at once, so the orbit is
  // back without waiting for a release -- `UnitObject` does the same, for the same reason.
  useEffect(() => {
    if (!switchBrush) brushStroke.end();
  }, [switchBrush, brushStroke]);
  const [brushBodies] = useState(() => createBrushBodies({
    camera: () => cameraRef.current,
    pointer: () => pointerRef.current,
    // The DRAWN mesh again: three's occluders are the meshes on screen, found by walking the scene.
    units: () => propsRef.current.scene.units.flatMap((unit) => {
      const node = unitNodes.current.get(unit.id);
      return node ? [{ id: unit.id, source: displayMesh(unit.source), node }] : [];
    }),
    brushed: () => {
      const id = propsRef.current.scene.activeUnitId;
      const unit = id ? propsRef.current.scene.units.find((candidate) => candidate.id === id) : undefined;
      const node = unit ? unitNodes.current.get(unit.id) : undefined;
      return unit && node ? { id: unit.id, source: displayMesh(unit.source), node } : undefined;
    },
    modelVisible: () => propsRef.current.modelVisible,
  }));
  const { brushed, over: brushOver } = useBrushOverlay({
    brush: switchBrush,
    supports: brushSupports,
    tips: brushTips,
    selection: props.selection,
    stroke: brushStroke,
    beginStroke: () => {
      cameraRef.current?.detachControl();
      window.addEventListener('pointerup', releaseBrush);
      window.addEventListener('pointercancel', releaseBrush);
      window.addEventListener('blur', releaseBrush);
    },
    onShift: (held) => propsRef.current.onShift(held),
    onPaint: (ids, mode) => {
      const id = propsRef.current.scene.activeUnitId;
      if (id) propsRef.current.onPaint(id, ids, mode);
    },
    onNoBodies: () => propsRef.current.onNoBodies(),
    canvas: canvasEl,
    makeView: brushBodies.makeView,
    objectAt: brushBodies.objectAt,
  });
  /*
   * What the sweep shows BEFORE it commits. `brushPreview` is geocore's, so both views agree about
   * which supports read as selected mid-stroke. Its `ghost` set -- the see-through bodies the circle
   * would change -- is NOT drawn here: that needs a second, see-through pass over the support
   * bodies, which is the same missing piece as the tip solid/ghost split, and it is listed as such
   * in `src/components/viewport/README.md`.
   */
  const preview = useMemo(() => brushPreview(props.selection, brushed, dragBrush?.mode), [props.selection, brushed, dragBrush?.mode]);
  paintHighlights.current = () => {
    for (const unit of printScene.units) {
      const highlight = highlights.current.get(unit.id);
      if (!highlight) continue;
      const mine = printScene.selectedUnitIds.includes(unit.id);
      highlight.apply(
        mine ? preview.solid : new Set<string>(),
        mine ? colours.support.selectedObject : colours.support.idle,
        colours.support.picked,
      );
    }
  };
  // Recolouring only, never rebuilding: this is what lets a stroke preview at frame rate.
  useEffect(() => paintHighlights.current(), [preview.solid, printScene.selectedUnitIds, printScene.units, colours]);

  /*
   * THE SURFACE PAINT -- the no-support zones and the dental support area -- INCLUDING THE STROKE
   * STILL UNDER THE POINTER.
   *
   * It is drawn here rather than in the units effect because it changes at stroke rate, and that
   * effect rebuilds every mesh in the scene. `UnitObject` keeps the in-flight stamps in state and
   * draws `[...unit.zones, ...stroke]`; this keeps them in `livePaint` and does the same, so the
   * paint appears UNDER the pointer in both views instead of arriving at the release in one.
   */
  const paintLayer = useOverlaySlot();
  paintLayer.redraw.current = () => {
    paintLayer.drawn.current?.();
    paintLayer.drawn.current = undefined;
    const scene = sceneRef.current;
    if (!scene) return;
    const drawn: Array<() => void> = [];
    // Zones read full in zones mode and faint elsewhere, exactly as the three.js view decides it.
    const zoneOpacity = ZONE_OPACITY[props.gesture.kind === 'zones' ? 'full' : 'faint'];
    for (const unit of printScene.units) {
      const node = unitNodes.current.get(unit.id);
      // The same gate the units effect applies: these overlays are built against the SOURCE mesh's
      // triangles, so they only fit a unit drawn at full detail.
      if (!node || displayMesh(unit.source) !== unit.source) continue;
      const live = livePaint?.unitId === unit.id ? livePaint.stamps : undefined;
      const zoneKind = props.gesture.kind === 'zones';
      const zones = live && zoneKind ? [...unit.zones, ...live as typeof unit.zones] : unit.zones;
      if (zones.length > 0) {
        drawn.push(drawSurfaceStamps(scene, {
          name: `${unit.id}-zones`,
          mesh: unit.source,
          parent: node,
          stamps: zones,
          filledKind: 'paint',
          colour: colours.preview.zone,
          opacity: zoneOpacity,
        }));
      }
      const policy = unit.dental ?? (props.dentalAreaPreview?.unitId === unit.id ? props.dentalAreaPreview.policy : undefined);
      const area = policy ? (live && !zoneKind ? [...policy.stamps, ...live as typeof policy.stamps] : policy.stamps) : [];
      if (area.length > 0) {
        drawn.push(drawSurfaceStamps(scene, {
          name: `${unit.id}-dental-area`,
          mesh: unit.source,
          parent: node,
          stamps: area,
          filledKind: 'allow',
          colour: colours.preview.areaPermitted,
          opacity: 0.7,
        }));
      }
    }
    paintLayer.drawn.current = () => { for (const dispose of drawn) dispose(); };
  };
  useEffect(() => paintLayer.redraw.current(), [livePaint, printScene.units, props.gesture.kind, props.dentalAreaPreview, colours]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * DRAG OVER'S GHOST: the whole bodies of the supports the circle would change, see-through, red
   * where a sweep would select and grey where it would unselect. `UnitObject` draws it with the
   * same set and the same tone, from the same `brushPreview`.
   *
   * It is off while a surface is being painted, exactly as three has it: in zones or dental-area
   * mode the operator is working on the model, and support bodies lit up under the brush would be
   * answering a question nobody asked.
   */
  const surfacePainting = props.gesture.kind === 'zones' || props.gesture.kind === 'dental-area';
  const ghost = useOverlaySlot();
  ghost.redraw.current = () => {
    ghost.drawn.current?.();
    ghost.drawn.current = undefined;
    const scene = sceneRef.current;
    const id = printScene.activeUnitId;
    const node = id ? unitNodes.current.get(id) : undefined;
    const supports = id ? drawnSupports.current.get(id) : undefined;
    if (!scene || !node || !supports || !brushEditing || surfacePainting || preview.ghost.length === 0) return;
    ghost.drawn.current = drawSupportBodies(scene, {
      name: `${id}-brush-ghost`,
      supports,
      parent: node,
      ids: preview.ghost,
      opacity: SEE_THROUGH,
      colour: colours.preview[preview.ghostTone],
    });
  };
  useEffect(() => ghost.redraw.current(), [preview.ghost, preview.ghostTone, brushEditing, surfacePainting, printScene.activeUnitId, colours]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * STEP 2'S TIP MARKERS, in their three states. The split is `splitTipMarks`, renderer-free, so
   * the two views put the same cones in the same states; only the drawing differs. Solid wins over
   * ghost, and that order is the rule rather than a detail -- see the module.
   */
  const tipMarks = useMemo((): TipMarks | undefined => (props.dentalArea === true
    ? { solid: preview.solid, ghost: preview.ghost, ghostTone: preview.ghostTone }
    : undefined), [props.dentalArea, preview]);
  const tipLayer = useOverlaySlot();
  tipLayer.redraw.current = () => {
    tipLayer.drawn.current?.();
    tipLayer.drawn.current = undefined;
    const scene = sceneRef.current;
    const shown = props.dentalTips;
    const node = shown ? unitNodes.current.get(shown.unitId) : undefined;
    if (!scene || !shown || !node || shown.points.length === 0) return;
    const sets = splitTipMarks(shown.points, tipMarks);
    const drawn = [
      drawTipMarkers(scene, { name: `${shown.unitId}-dental-tips`, parent: node, points: sets.plain, colour: colours.preview.supportTip, scale: TIP_SCALE.plain }),
      drawTipMarkers(scene, { name: `${shown.unitId}-dental-tips-solid`, parent: node, points: sets.solid, colour: colours.preview.remove, scale: TIP_SCALE.marked }),
      drawTipMarkers(scene, { name: `${shown.unitId}-dental-tips-ghost`, parent: node, points: sets.ghost, colour: colours.preview[tipMarks?.ghostTone ?? 'remove'], scale: TIP_SCALE.marked }),
    ];
    tipLayer.drawn.current = () => { for (const dispose of drawn) dispose(); };
  };
  useEffect(() => tipLayer.redraw.current(), [props.dentalTips, tipMarks, colours]); // eslint-disable-line react-hooks/exhaustive-deps

  /*
   * The unresolved points and model-landed supports, as the SAME React components the three.js
   * view mounts -- one bubble, not two that resemble each other. Only the positioning differs.
   */
  const anchored = useMemo((): AnchoredItem[] => {
    if (!sceneReady) return [];
    const out: AnchoredItem[] = [];
    for (const unit of printScene.units) {
      const { unresolved, landed } = bubblePointsFor(unit, supportMeshes.get(unit.id));
      const resolve = props.bubbleResolve?.unitId === unit.id ? props.bubbleResolve : undefined;
      for (const item of unresolved) {
        out.push({
          key: `${unit.id}:${item.key}`,
          className: 'unresolved-anchor',
          at: () => pointerRef.current?.toWorld(unit.id, item.at),
          node: <UnresolvedBubble point={item.point} {...(resolve?.resolvable(item.point) ? { onResolve: resolve.onResolve } : {})} />,
        });
      }
      for (const item of landed) {
        out.push({
          key: `${unit.id}:${item.key}`,
          className: 'landing-anchor',
          at: () => pointerRef.current?.toWorld(unit.id, item.at),
          node: <LandingMark landed={item.entry} />,
        });
      }
    }
    return out;
  }, [sceneReady, printScene.units, supportMeshes, props.bubbleResolve]);

  return (
    <div className="babylon-viewport" data-ui="viewport-babylon">
      {/* DOM anchored to points in the scene (the angle reading, the bubbles) lives here, over the
          canvas: real text in the page, so it takes the app's fonts and can be read aloud. */}
      <div ref={overlayRef} className="babylon-overlay" data-ui="viewport-babylon-overlay" />
      <AnchoredDom host={overlayRef.current} anchors={anchorsRef.current} items={anchored} />
      <canvas
        ref={setCanvas}
        data-ui="viewport-babylon-canvas"
        // The ONLY inline style here, and the same exception the three.js view holds: the cursor is
        // computed from the gesture at run time, so no class can hold it. Everything else that could
        // be a class IS one, in styles.css (docs/ui-styling.md rules 1 and 2).
        style={{ cursor: canvasCursor(props.gesture, pointerOnTool(props.gesture, { hover: rimHover, circleOver: brushOver })) }}
        onContextMenu={(event) => event.preventDefault()}
      />
    </div>
  );
}
