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
import { babylonPlacement } from './viewport/babylonTransform';
import { drawZones } from './viewport/babylon/zoneLayer';
import { attachZoneBrush } from './viewport/babylon/zoneBrush';
import { attachEditPreview } from './viewport/babylon/editPreview';
import { createSurfacePointer } from './viewport/babylon/surfacePointer';
import { createSelectionColours } from './viewport/babylon/selectionColours';
import { attachTransformGizmo, type TransformGizmo } from './viewport/babylon/transformGizmo';
import { gizmoShown } from './ObjectViewport';
import { resolveSettings, unitContacts } from '@mixo-geocore/host/supports/unitSupports';
import { releaseHandle } from './viewport/babylon/sessionHandles';
import { ZONE_OPACITY } from './viewport/style';
import { useViewportColours, type ViewportColours } from './viewport/sceneColours';
import { canvasCursor } from './viewport/style';
import type { ObjectViewportProps } from './viewport/types';

/*
 * The Babylon.js 3D view, reached by `?renderer=babylon` (src/ui/renderer.ts). The three.js view
 * in `ObjectViewport.tsx` is still the one the walk proves and the one a visitor gets.
 *
 * WHAT THIS DRAWS TODAY: the models, the built supports and the floor grid, lit and framed as
 * three.js frames them, orbitable, clickable to select. It acts on `scene`, `supportMeshes`,
 * `modelVisible`, `wireframe`, `gesture` and `onSelect`. The zone stamps, the dental layers, the
 * rim, the gizmo, the bubbles, the edit previews and the print-angle arc are NOT drawn -- that
 * list is the migration's to-do, and `src/components/viewport/README.md` carries it where a reader
 * will find it.
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

export default function BabylonObjectViewport(props: ObjectViewportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  // Read by the pointer handlers, which are attached once and must still see today's props.
  const propsRef = useRef(props);
  propsRef.current = props;
  /** Meshes this view has (or may have) loaded into the engine session, so they can be given back. */
  const loaded = useRef(new Set<TriangleMesh>());
  /** The node carrying each unit's transform, which is what the gizmo moves. */
  const unitNodes = useRef(new Map<string, TransformNode>());
  const gizmoRef = useRef<TransformGizmo | null>(null);
  const colours = useViewportColours();
  // Read by the pointer layers, which are attached once and must still see today's tokens.
  const coloursRef = useRef(colours);
  coloursRef.current = colours;
  const { scene: printScene, supportMeshes, modelVisible, wireframe } = props;
  const onSelect = props.onSelect;

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
    // KNOWN GAP, found by trying to paint a zone and watching the camera orbit instead: this view
    // has no pointer-to-editing path, so a brush gesture never reaches the editing code and the
    // camera keeps the drag for itself. In the three.js view a drag in zones mode paints and does
    // not orbit. Until the pointer path exists (layer 0 of the port plan), every drawing layer here
    // can be unit-tested and none can be SEEN, because nothing can put data in front of it.
    camera.attachControl(canvas, true);
    camera.panningSensibility = 100;
    camera.wheelDeltaPercentage = 0.02;

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
    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);

    return () => {
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
    const pointer = createSurfacePointer({ canvas, camera, units: () => propsRef.current.scene.units });
    const gesture = () => propsRef.current.gesture;
    const detach = [
      attachZoneBrush({
        canvas,
        camera,
        pointer,
        gesture,
        onZoneStroke: (unitId, stamps) => propsRef.current.onZoneStroke(unitId, stamps),
      }),
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
    const nodes = unitNodes.current;
    nodes.clear();
    // Zones read full in zones mode and faint elsewhere, exactly as the three.js view decides it.
    const zoneOpacity = ZONE_OPACITY[props.gesture.kind === 'zones' ? 'full' : 'faint'];
    for (const unit of printScene.units) {
      /*
       * ONE node per unit, carrying `unit.transform`, with the model, the supports and the zone
       * overlay hanging off it at local identity. This mirrors `UnitObject`, which puts one group
       * at `unit.transform` and draws everything inside it -- and it is what lets the gizmo move a
       * unit by moving a single node, with everything attached following for free rather than by
       * three separate pieces of code remembering to agree.
       */
      const node = new TransformNode(`${unit.id}-unit`, scene);
      const { position, rotationQuaternion } = babylonPlacement(unit.transform);
      node.position = position;
      node.rotationQuaternion = rotationQuaternion;
      nodes.set(unit.id, node);
      built.push(node);

      const mesh = new Mesh(unit.id, scene);
      mesh.parent = node;
      built.push(mesh);
      applyGeometry(mesh, unit.source);
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
      const supports = supportMeshes.get(unit.id);
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
        const highlight = createSelectionColours(supportMesh, supports);
        highlight.apply(
          printScene.selectedUnitIds.includes(unit.id) ? props.selection : new Set<string>(),
          printScene.selectedUnitIds.includes(unit.id) ? colours.support.selectedObject : colours.support.idle,
          colours.support.picked,
        );
      }

      // The no-support zones, painted see-through over the model (layer 1 of the port).
      if (unit.zones.length > 0) {
        disposers.push(drawZones(scene, {
          name: `${unit.id}-zones`,
          mesh: unit.source,
          zones: unit.zones,
          parent: node,
          colour: colours.preview.zone,
          opacity: zoneOpacity,
        }));
      }
    }
    return () => {
      for (const dispose of disposers) dispose();
      for (const thing of built) {
        if (thing instanceof Mesh) thing.material?.dispose();
        thing.dispose();
      }
      nodes.clear();
    };
  }, [printScene, supportMeshes, colours, modelVisible, wireframe, props.gesture.kind, props.selection]);

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

  return (
    <div className="babylon-viewport" data-ui="viewport-babylon">
      <canvas
        ref={canvasRef}
        data-ui="viewport-babylon-canvas"
        // The ONLY inline style here, and the same exception the three.js view holds: the cursor is
        // computed from the gesture at run time, so no class can hold it. Everything else that could
        // be a class IS one, in styles.css (docs/ui-styling.md rules 1 and 2).
        style={{ cursor: canvasCursor(props.gesture, false) }}
        onContextMenu={(event) => event.preventDefault()}
        onPointerDown={(event) => {
          const scene = sceneRef.current;
          if (!scene || event.button !== 0) return;
          const hit = scene.pick(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
          const unitId = hit?.hit ? (hit.pickedMesh?.name ?? null) : null;
          onSelect(unitId, event.shiftKey);
        }}
      />
    </div>
  );
}
