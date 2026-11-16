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
  Vector3,
  VertexData,
} from '@babylonjs/core';
import { GridMaterial } from '@babylonjs/materials/grid';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { generationTransform } from '@mixo-geocore/host/supports/unitSupports';
import { babylonPlacement } from './viewport/babylonTransform';
import { drawZones } from './viewport/babylon/zoneLayer';
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
  const colours = useViewportColours();
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
      scene.dispose();
      engine.dispose();
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
    const built: Mesh[] = [];
    const disposers: Array<() => void> = [];
    // Zones read full in zones mode and faint elsewhere, exactly as the three.js view decides it.
    const zoneOpacity = ZONE_OPACITY[props.gesture.kind === 'zones' ? 'full' : 'faint'];
    for (const unit of printScene.units) {
      const mesh = new Mesh(unit.id, scene);
      built.push(mesh);
      applyGeometry(mesh, unit.source);
      const { position, rotationQuaternion } = babylonPlacement(unit.transform);
      mesh.position = position;
      mesh.rotationQuaternion = rotationQuaternion;
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
       * THE TRAP, and it is not obvious: supports are drawn under `generationTransform(unit)`, the
       * transform they were GENERATED at, not the unit's current one. Move a unit after generating
       * and the supports stay in the old frame until they are rebuilt, which is what the three.js
       * view does and what the engine's caches are keyed on. Using `unit.transform` here would
       * silently re-seat every support on the model the moment the operator nudged it, and the
       * picture would look plausible while being a lie about where the printed supports will be.
       */
      const supports = supportMeshes.get(unit.id);
      if (supports && supports.indices.length > 0) {
        const supportMesh = new Mesh(`${unit.id}-supports`, scene);
        built.push(supportMesh);
        applyGeometry(supportMesh, supports);
        const frame = babylonPlacement(generationTransform(unit));
        supportMesh.position = frame.position;
        supportMesh.rotationQuaternion = frame.rotationQuaternion;
        const supportMaterial = new PBRMaterial(`${unit.id}-supports-material`, scene);
        supportMaterial.albedoColor = Color3.FromHexString(
          printScene.selectedUnitIds.includes(unit.id) ? colours.support.selectedObject : colours.support.idle,
        );
        supportMaterial.metallic = 0;
        supportMaterial.roughness = 1;
        supportMesh.material = supportMaterial;
        supportMesh.isPickable = false;
      }

      // The no-support zones, painted see-through over the model (layer 1 of the port).
      if (unit.zones.length > 0) {
        disposers.push(drawZones(scene, {
          name: `${unit.id}-zones`,
          mesh: unit.source,
          zones: unit.zones,
          transform: unit.transform,
          colour: colours.preview.zone,
          opacity: zoneOpacity,
        }));
      }
    }
    return () => {
      for (const dispose of disposers) dispose();
      for (const mesh of built) {
        mesh.material?.dispose();
        mesh.dispose();
      }
    };
  }, [printScene, supportMeshes, colours, modelVisible, wireframe, props.gesture.kind]);

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
