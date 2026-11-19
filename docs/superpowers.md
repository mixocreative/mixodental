# Plans and specs from the superpowers workflow

Paired plans and specifications from October 2026, when the engine and the support flow were built. Kept for archaeology on a decision; superseded by `docs/SHIP-PLAN.md` for anything current.

**21 documents, gathered into this one record on 2026-11-19.** Each is copied whole, nothing reconciled with later reality, under an anchor that is its old filename - so a reference anywhere in this repo, in an old commit message or in an audit log still finds it by that name.

| when | document | was |
|---|---|---|
| 2026-10-20 | [Object Mode Viewport Import Implementation Plan](#2026-10-20-object-mode-viewport-import) | `docs/superpowers/plans/2026-10-20-object-mode-viewport-import.md` |
| 2026-10-20 | [Object Mode and Viewport Import Design](#2026-10-20-object-mode-viewport-import-design) | `docs/superpowers/specs/2026-10-20-object-mode-viewport-import-design.md` |
| 2026-10-20 | [Resin Supports Core Implementation Plan](#2026-10-20-resin-supports-core-implementation) | `docs/superpowers/plans/2026-10-20-resin-supports-core-implementation.md` |
| 2026-10-20 | [Resin Supports v1 Design](#2026-10-20-resin-supports-v1-design) | `docs/superpowers/specs/2026-10-20-resin-supports-v1-design.md` |
| 2026-10-20 | [Web Resin Support Parity Implementation Plan](#2026-10-20-web-resin-support-parity) | `docs/superpowers/plans/2026-10-20-web-resin-support-parity.md` |
| 2026-10-20 | [Web Resin Support Parity Design](#2026-10-20-web-resin-support-parity-design) | `docs/superpowers/specs/2026-10-20-web-resin-support-parity-design.md` |
| 2026-10-21 | [Release 2: Bug Sweep and Migration Prep — Implementation Plan](#2026-10-21-migration-prep) | `docs/superpowers/plans/2026-10-21-migration-prep.md` |
| 2026-10-21 | [Release 2 — bug sweep and migration prep (design)](#2026-10-21-migration-prep-design) | `docs/superpowers/specs/2026-10-21-migration-prep-design.md` |
| 2026-10-21 | [No-support Zones Implementation Plan](#2026-10-21-no-support-zones) | `docs/superpowers/plans/2026-10-21-no-support-zones.md` |
| 2026-10-21 | [No-support zones — design](#2026-10-21-no-support-zones-design) | `docs/superpowers/specs/2026-10-21-no-support-zones-design.md` |
| 2026-10-21 | [Support editing UI spec (for re-implementation in mixomesh / Babylon.js)](#2026-10-21-support-editing-ui-spec) | `docs/superpowers/specs/2026-10-21-support-editing-ui-spec.md` |
| 2026-10-21 | [Support Selection (Step 1) Implementation Plan](#2026-10-21-support-selection) | `docs/superpowers/plans/2026-10-21-support-selection.md` |
| 2026-10-21 | [Support selection in Support Edit Mode — design](#2026-10-21-support-selection-design) | `docs/superpowers/specs/2026-10-21-support-selection-design.md` |
| 2026-10-23 | [Reusable Surface Brush Implementation Plan](#2026-10-23-reusable-surface-brush) | `docs/superpowers/plans/2026-10-23-reusable-surface-brush.md` |
| 2026-10-23 | [Reusable surface brush design](#2026-10-23-surface-brush-design) | `docs/superpowers/specs/2026-10-23-surface-brush-design.md` |
| 2026-10-24 | [Dental support rework: geometry, orientation, and three-step review](#2026-10-24-dental-rework) | `docs/superpowers/plans/2026-10-24-dental-rework.md` |
| 2026-10-25 | [Dental contour contacts implementation plan](#plans-2026-10-25-dental-contour-contacts) | `docs/superpowers/plans/2026-10-25-dental-contour-contacts.md` |
| 2026-10-25 | [Dental contour contact design](#specs-2026-10-25-dental-contour-contacts) | `docs/superpowers/specs/2026-10-25-dental-contour-contacts.md` |
| 2026-10-26 | [Support ship gates implementation plan](#2026-10-26-support-ship-gates) | `docs/superpowers/plans/2026-10-26-support-ship-gates.md` |
| 2026-10-26 | [Generic and dental support ship gates](#2026-10-26-support-ship-gates-design) | `docs/superpowers/specs/2026-10-26-support-ship-gates-design.md` |
| 2026-10-27 | [UI-independent WASM Geometry Migration Implementation Plan](#2026-10-27-wasm-geometry-migration) | `docs/superpowers/plans/2026-10-27-wasm-geometry-migration.md` |

---

<a id="2026-10-20-object-mode-viewport-import"></a>

## 2026-10-20 — Object Mode Viewport Import Implementation Plan

*Was `docs/superpowers/plans/2026-10-20-object-mode-viewport-import.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add whole-viewport model import and Blender-like move/rotate gizmo controls to the support editor.

**Architecture:** Keep source geometry immutable and introduce a serializable `ModelTransform` state. The scene renders that transform through a selected model group, uses Drei TransformControls for interaction, and derives worker input through a pure transformed-mesh helper.

**Tech Stack:** React, TypeScript, Three.js, React Three Fiber, Drei, Vitest.

---

#### Task 1: Transform state and analysis input

**Files:**
- Create: `src/state/transform.ts`, `src/state/transform.test.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing tests**

```ts
expect(applyTransform(source, { position: [4, 2, 0], rotation: [0, Math.PI / 2, 0] }).positions).not.toEqual(source.positions);
expect(source.positions).toEqual(originalPositions);
expect(transformFromObject(object3d)).toEqual({ position: [1, 2, 3], rotation: [0, 0.5, 0] });
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/state/transform.test.ts`
Expected: FAIL because `transform.ts` does not exist.

- [ ] **Step 3: Implement pure transform helpers**

```ts
export interface ModelTransform { position: [number, number, number]; rotation: [number, number, number] }
export const identityTransform: ModelTransform = { position: [0, 0, 0], rotation: [0, 0, 0] };
export function applyTransform(mesh: TriangleMesh, transform: ModelTransform): TriangleMesh { /* Matrix4 clone */ }
export function transformFromObject(object: Object3D): ModelTransform { /* serialize position/rotation */ }
```

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- src/state/transform.test.ts && npm run build`
Expected: PASS.

#### Task 2: Viewport import and object-mode scene

**Files:**
- Create: `src/components/ObjectViewport.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

- [ ] **Step 1: Write failing interaction helper tests**

```ts
expect(acceptModelFile(new File(['x'], 'sample.stl'))).toBe(true);
expect(acceptModelFile(new File(['x'], 'sample.obj'))).toBe(false);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/components/ObjectViewport.test.ts`
Expected: FAIL because `ObjectViewport` helpers do not exist.

- [ ] **Step 3: Implement viewport drop and selection**

```tsx
<section onDrop={dropImport} onDragOver={allowDrop} className={isDragging ? 'viewport viewport--dropping' : 'viewport'}>
  <Canvas><ObjectViewport selected={selected} transform={transform} onTransform={setTransform} /></Canvas>
</section>
```

Accepted files call the existing importer directly, select the model after import, and show an overlay only while a file is dragged over the full viewport.

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm test -- src/components/ObjectViewport.test.ts && npm run build`
Expected: PASS.

#### Task 3: Gizmo modes and deployed verification

**Files:**
- Modify: `src/components/ObjectViewport.tsx`, `src/App.tsx`, `src/styles.css`, `docs/HANDOFF.md`

- [ ] **Step 1: Add move/rotate toolbar controls**

```tsx
<button aria-pressed={mode === 'translate'} onClick={() => setMode('translate')}>Move</button>
<button aria-pressed={mode === 'rotate'} onClick={() => setMode('rotate')}>Rotate</button>
<TransformControls mode={mode} object={selectedGroup.current} onDraggingChanged={setGizmoDragging} onObjectChange={captureTransform} />
```

- [ ] **Step 2: Disable orbit while the gizmo drags**

```tsx
<OrbitControls enabled={!gizmoDragging} />
```

- [ ] **Step 3: Transform analysis input and mark stale supports**

```ts
const transformed = applyTransform(sourceTriangleMesh, modelTransform);
worker.postMessage({ jobId, mesh: transformed, settings }, transferBuffers);
```

- [ ] **Step 4: Run verification, commit, push, and check Pages**

Run: `npm test && npm run build && git push origin main`
Expected: all tests pass, production build succeeds, and the Pages workflow succeeds.

---

<a id="2026-10-20-object-mode-viewport-import-design"></a>

## 2026-10-20 — Object Mode and Viewport Import Design

*Was `docs/superpowers/specs/2026-10-20-object-mode-viewport-import-design.md`.*

### Goal

Make imported meshes behave like selected Blender objects: users can drop supported 3D files directly anywhere in the viewport, then select, translate, and rotate the model with an on-canvas gizmo.

### Interaction

- The viewport is the primary drop zone. A drag overlay provides visible feedback and accepts STL, GLB, and GLTF files.
- A successful import positions the mesh above the build plate, selects it, and enters Object Mode without replacing derived support state until the user regenerates.
- Clicking the visible model selects it. The selected model receives a high-contrast outline and a compact Object Mode status badge.
- A toolbar offers Select, Move, and Rotate. Move and Rotate attach a Drei `TransformControls` gizmo to the selected model.
- While the gizmo is dragging, camera orbit is disabled. On drag completion, the model transform is serialized in project state and geometry-dependent support regeneration is marked stale.

### Boundaries

This increment supports exactly one selected imported model. Source vertex data remains immutable; its transform is stored separately and applied to rendering, analysis, support preview, baking, and export. Existing manual support state is retained; users explicitly regenerate automatic contacts after a transform.

### Verification

Tests cover transform reducer behavior and that a transformed placement request receives transformed positions without mutating source positions. A build verifies the React integration. Manual browser verification covers drop anywhere over the viewport, immediate selection, move/rotate gizmo behavior, and preserved camera orbit outside a gizmo drag.

### Handoff

Future multi-model selection, transform snapping, numeric transform panels, scale gizmos, and hierarchy/outliner behaviors remain separate work. Do not add inactive controls for them.

---

<a id="2026-10-20-resin-supports-core-implementation"></a>

## 2026-10-20 — Resin Supports Core Implementation Plan

*Was `docs/superpowers/plans/2026-10-20-resin-supports-core-implementation.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the local-first resin support editor core to GitHub Pages.

**Architecture:** A React/R3F viewport renders immutable imported meshes and derived support layers. Pure mesh-analysis functions run inside a transferable-buffer worker; the app combines worker points with persistent manual edits and produces deterministic procedural support, raft, brace, and STL export geometry.

**Tech Stack:** TypeScript, Vite, React, Three.js, React Three Fiber, Drei, Vitest.

---

#### Task 1: Toolchain and typed analysis domain

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `src/analysis/types.ts`, `src/analysis/mesh.ts`, `src/analysis/mesh.test.ts`

- [ ] **Step 1: Write failing mesh-analysis tests**

```ts
expect(classifyDownwardFaces(simpleOverhang, 45)).toEqual([true, false]);
expect(partitionRegions(simpleOverhang, [true, false])).toHaveLength(1);
expect(labelForIndex(26)).toBe('AA');
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/analysis/mesh.test.ts`
Expected: failure because the analysis module does not exist.

- [ ] **Step 3: Implement minimal pure mesh helpers**

```ts
export function classifyDownwardFaces(mesh: TriangleMesh, angle: number): boolean[] { /* normal threshold */ }
export function partitionRegions(mesh: TriangleMesh, downward: boolean[]): Region[] { /* shared-edge flood fill */ }
export function labelForIndex(index: number): string { /* A..Z, AA */ }
```

- [ ] **Step 4: Run the focused suite and commit**

Run: `npm test -- src/analysis/mesh.test.ts`
Expected: PASS.

#### Task 2: Deterministic placement worker

**Files:**
- Create: `src/analysis/placement.ts`, `src/analysis/placement.test.ts`, `src/workers/supportWorker.ts`
- Modify: `src/analysis/types.ts`

- [ ] **Step 1: Write failing placement tests**

```ts
expect(generatePlacement(mesh, settings)).toEqual(generatePlacement(mesh, settings));
expect(result.points.some((point) => point.source === 'physical-boundary')).toBe(true);
expect(uniqueByDistance(result.points, settings.spacing * 0.35)).toBe(true);
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/analysis/placement.test.ts`
Expected: failure because `generatePlacement` does not exist.

- [ ] **Step 3: Implement region sampling and reinforcement**

```ts
export function generatePlacement(mesh: TriangleMesh, settings: PlacementSettings): PlacementResult {
  // seeded region candidates, boundary/ridge extraction, inward inset and spatial dedupe
}
self.onmessage = ({ data }) => postMessage({ jobId: data.jobId, result: generatePlacement(data.mesh, data.settings) });
```

- [ ] **Step 4: Run focused suite and commit**

Run: `npm test -- src/analysis/placement.test.ts`
Expected: PASS.

#### Task 3: Derived geometry and export

**Files:**
- Create: `src/geometry/supports.ts`, `src/geometry/supports.test.ts`, `src/geometry/stl.ts`, `src/geometry/stl.test.ts`

- [ ] **Step 1: Write failing geometry/export tests**

```ts
expect(buildSupportGeometry([point], settings).position.count).toBeGreaterThan(0);
expect(buildRaft([point], raft).position.count).toBeGreaterThan(0);
expect(encodeBinaryStl(geometry, 'test').size).toBeGreaterThan(84);
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/geometry`
Expected: failure because geometry modules do not exist.

- [ ] **Step 3: Implement procedural geometry and STL encoding**

```ts
export function buildSupportGeometry(points: SupportPoint[], settings: SupportDimensions): BufferGeometry { /* tip, neck, pillar, base */ }
export function buildRaft(points: SupportPoint[], settings: RaftSettings): BufferGeometry { /* footprint slab/rim */ }
export function encodeBinaryStl(geometry: BufferGeometry, name: string): Blob { /* transformed triangles */ }
```

- [ ] **Step 4: Run focused suite and commit**

Run: `npm test -- src/geometry`
Expected: PASS.

#### Task 4: Interactive React workspace

**Files:**
- Create: `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/state/project.ts`, `src/components/Viewport.tsx`, `src/components/Controls.tsx`, `src/components/StatusBar.tsx`

- [ ] **Step 1: Write failing state tests**

```ts
expect(reduceProject(initialProject, { type: 'manual/add', point }).manualPoints).toHaveLength(1);
expect(reduceProject(withAuto, { type: 'auto/suppress', id }).suppressedAutomaticIds).toContain(id);
```

- [ ] **Step 2: Run RED**

Run: `npm test -- src/state/project.test.ts`
Expected: failure because the reducer does not exist.

- [ ] **Step 3: Implement the local workspace**

```tsx
<Canvas><BuildPlate /><ImportedModel /><SupportPreview /><OrbitControls /></Canvas>
<Controls onImport={importLocalFile} onGenerate={requestWorkerPlacement} onExport={downloadStl} />
```

The controls must mutate real settings, worker jobs must keep prior points until replacement arrives, and click/drag edit mode must add/remove/move derived contacts while preserving source geometry.

- [ ] **Step 4: Run tests, build, and commit**

Run: `npm test && npm run build`
Expected: all tests pass and `dist/` exists.

#### Task 5: GitHub Pages, documentation, and release verification

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`, `docs/ARCHITECTURE.md`, `docs/VERIFICATION.md`, `public/.nojekyll`
- Modify: `docs/HANDOFF.md`

- [ ] **Step 1: Write deployment configuration**

```yaml
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
```

- [ ] **Step 2: Document local processing and known limits**

The README must state that model files stay in-browser, explain local setup, and identify GitHub Pages deployment. Architecture and verification documents must list implemented features and deferred work without calling deferred capabilities complete.

- [ ] **Step 3: Verify and publish**

Run: `npm test && npm run build && git status --short && git push origin main`
Expected: tests/build pass, committed source is pushed, and the Pages workflow runs.

---

<a id="2026-10-20-resin-supports-v1-design"></a>

## 2026-10-20 — Resin Supports v1 Design

*Was `docs/superpowers/specs/2026-10-20-resin-supports-v1-design.md`.*

### Scope

This repository will contain a static, privacy-first resin-print support editor for GitHub Pages. Version 1 delivers the usable core workflow: import a mesh, orient it over a virtual build plate, generate deterministic SLA supports, edit them, create a raft and pillar bracing, bake derived geometry, and download STL files. All processing stays in the browser.

### Product boundaries

The imported source model is immutable. The project stores mesh-derived support points, manual additions, automatic-point suppressions, raft and brace settings, and baked output separately. Removing or resetting supports can never change the source mesh.

The v1 interface is a dark, desktop-first workspace with a Three.js viewport, left workflow/actions sidebar, right settings sidebar, and a persistent status bar. Sections are collapsible; advanced placement is initially collapsed. The application uses millimetres, reports warnings locally, and remains interactive while support contacts regenerate.

### Architecture

#### Client app

Vite, React, TypeScript, Three.js, React Three Fiber, and Drei supply the static application and viewport. STL and GLB/GLTF files are read from the drop target with browser File APIs only. A model's geometry and transform are maintained as source data; render options such as visibility, x-ray, wireframe, and camera projection remain view state.

#### Mesh-analysis worker

The main thread transfers position and index typed-array buffers to a Web Worker. It returns serializable point records and analysis diagnostics. It classifies downward triangles from the overhang setting, partitions edge-adjacent qualifying faces into connected regions, samples candidates over region area with deterministic seeded spacing, and adds lowest-point island candidates when enabled.

For edge reinforcement, the worker identifies region boundary edges (qualifying face bordering a non-qualifying face or mesh opening) and sharp shared edges inside each downward region. It samples by the same support spacing, offsets candidates inward toward the correct downward surface, and deduplicates with interior contacts. Worker job IDs prevent stale output from replacing a newer setting revision.

#### Derived support geometry

The live viewport uses instanced meshes for tips, necks, pillars, and feet. Manual points and automatic suppressions are applied after a worker result, so they survive automatic regeneration. A support edit mode uses raycasts for add, erase, and move. Raft and bracing are procedural derived meshes. Baking builds exportable triangle meshes while preserving original source geometry.

#### Export and validation

The app exports combined model-plus-derived geometry as binary STL and offers support-only STL. Export validates loaded content, non-empty geometry, raft-dependent features, and detectable non-manifold warnings, without preventing exports that remain technically possible.

### State model

Serializable project state separates `models`, `supportSettings`, `automaticPoints`, `manualPoints`, `suppressedAutomaticIds`, `raft`, `bracing`, `view`, `history`, and `bake` metadata. Automatic points carry stable IDs, region IDs, contact position/normal, source kind (`interior`, `physical-boundary`, `sharp-ridge`, or `island`), and enabled state. Undo/redo records state transitions rather than mutating source meshes.

### Testing

Vitest tests precede implementation. Coverage includes downward classification, region partitioning, deterministic scattering, physical boundary/sharp ridge extraction, inset placement, deduplication, manual persistence, raft/bracing generation, label sequencing helper, and an import-to-bake-to-STL integration path. Fixtures include simple and continuous overhangs, sharp boundaries/ridges, isolated islands, multi-model input, and a non-manifold warning case.

### Delivery files

- Static Vite/React application and local-only privacy notice.
- GitHub Pages action, project-site Vite base configuration, and `.nojekyll` output handling.
- README (local setup/deployment/privacy), architecture document, verification report, and handoff notes.

### Deferred work register

The following are intentionally outside v1 and must not appear as inactive or simulated controls: tree support routing/merge safety, roof and cage structures, printable raft labels, 3MF, multi-model support units and per-model export, IndexedDB projects, advanced collision/non-manifold repair, and the extended fixture collection.

### Risks and mitigations

- Exact watertight boolean union is expensive in browsers. V1 produces printable overlapping STL-derived geometry and clearly warns where manifold union is unavailable.
- Complex meshes may require longer analysis. The worker keeps current supports visible during recomputation and returns progress/error status.
- A GitHub Pages project requires the repository name at deployment time. Vite reads a build-time base-path value rather than hard-coding an unverified repository path.

---

<a id="2026-10-20-web-resin-support-parity"></a>

## 2026-10-20 — Web Resin Support Parity Implementation Plan

*Was `docs/superpowers/plans/2026-10-20-web-resin-support-parity.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Blender Resin UV support-tab parity in the browser for multiple models, excluding only Bake Supports and hidden original/proxy copies.

**Architecture:** Replace the singleton point-support UI with a serializable `PrintScene` containing independently selectable `PrintUnit`s. A unit owns source geometry and a derived support mesh under one viewport transform parent; pure placement and mesh-generation modules create deterministic geometry that is shared by viewport and export. Commands are the sole mutation interface and provide undo/redo.

**Tech Stack:** TypeScript, React 18, Three.js, React Three Fiber/Drei, Vite, Vitest, browser Web Workers.

---

### Required task closure

At the end of **every task**: run the stated verification, inspect `git diff --check`, update `docs/HANDOFF.md` with exact evidence and one next step, then commit only the files completed by that task. Never add `dist/` or `node_modules/`.

#### Task 1: Establish the multi-object state contract and history

**Files:**
- Create: `src/state/project.ts`, `src/state/project.test.ts`, `src/state/history.ts`, `src/state/history.test.ts`
- Modify: `src/analysis/types.ts`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing scene-reducer tests**

```ts
it('keeps generated supports parented to their source print unit state', () => {
  const scene = reduceScene(emptyScene, addUnit(unitA));
  expect(scene.units[0]).toMatchObject({ id: 'unit-a', source: unitA.source, supports: undefined });
});
it('removes only derived supports and preserves the source model', () => {
  const next = reduceScene(sceneWithSupports, { type: 'supports/remove', unitId: 'unit-a' });
  expect(next.units[0].source).toEqual(sceneWithSupports.units[0].source);
  expect(next.units[0].supports).toBeUndefined();
});
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/state/project.test.ts src/state/history.test.ts`
Expected: FAIL because the scene and history modules do not exist.

- [x] **Step 3: Define serializable scene records and commands**

```ts
export interface PrintUnit { id: string; name: string; source: TriangleMesh; transform: ModelTransform; settings: SupportSettings; placement?: PlacementResult; manual: SupportPoint[]; suppressed: string[]; supports?: SupportMesh; }
export interface PrintScene { units: PrintUnit[]; selectedUnitIds: string[]; activeUnitId?: string; }
export type SceneCommand = { type: 'unit/add'; unit: PrintUnit } | { type: 'supports/remove'; unitId: string } | /* remaining mutations */ never;
export function reduceScene(scene: PrintScene, command: SceneCommand): PrintScene { /* immutable reducer */ }
```

Create a history controller whose undo/redo entries contain serializable `PrintScene` snapshots and never Three.js objects.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/state/project.test.ts src/state/history.test.ts && git diff --check`
Expected: PASS and no whitespace errors. Update the handoff with result, commit `feat: add print scene state and history`.

#### Task 2: Model the complete live support settings and presets

**Files:**
- Create: `src/supports/settings.ts`, `src/supports/settings.test.ts`
- Modify: `src/analysis/types.ts`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing settings tests**

```ts
expect(applyPreset('LIGHT').touchDiameter).toBeGreaterThan(0);
expect(updateSetting(applyPreset('HEAVY'), 'pillarDiameter', 2).preset).toBe('CUSTOM');
expect(defaultSupportSettings).toHaveProperty('roofMode');
expect(defaultSupportSettings).toHaveProperty('labelEnabled');
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/supports/settings.test.ts`
Expected: FAIL because settings/preset helpers do not exist.

- [x] **Step 3: Implement Blender-aligned setting groups**

Define typed settings for contact (`touchDiameter`, `touchDepth`, `neckDiameter`, `neckLength`, `maxNeckAngle`), pillar/base, bracing, raft, roof/cage, labels, preview/resolution, and automatic placement/tree fields. Transcribe Light/Middle/Heavy preset values from `S:/ai/mixo3dtool/mixo3d/properties.py`; omit only Bake and proxy settings.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/supports/settings.test.ts && git diff --check`
Expected: PASS. Update handoff with property coverage and commit `feat: add live support settings and presets`.

#### Task 3: Preserve placement edits and generate tree topology

**Files:**
- Create: `src/supports/tree.ts`, `src/supports/tree.test.ts`
- Modify: `src/analysis/placement.ts`, `src/analysis/placement.test.ts`, `src/analysis/types.ts`, `src/workers/supportWorker.ts`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing placement composition tests**

```ts
expect(composeContacts(auto, [manual], ['auto-0'])).toEqual([manual]);
expect(buildTreeTopology(contacts, { mergeDistance: 5, branchDescent: 3 })).toContainEqual(expect.objectContaining({ kind: 'branch' }));
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/analysis/placement.test.ts src/supports/tree.test.ts`
Expected: FAIL because contact composition and tree topology are absent.

- [x] **Step 3: Implement per-unit placement result composition**

Keep automatic contacts deterministic, merge manual contacts, honor suppressed automatic IDs after every regeneration, and generate deterministic tree junction/branch records only when tree mode is enabled. Extend the worker request with a unit identifier and generation revision so stale responses are rejected.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/analysis/placement.test.ts src/supports/tree.test.ts && git diff --check`
Expected: PASS. Update handoff with deterministic fixture counts and commit `feat: preserve support edits and add tree topology`.

#### Task 4: Build print-ready live support geometry

**Files:**
- Create: `src/supports/mesh.ts`, `src/supports/mesh.test.ts`
- Modify: `src/analysis/types.ts`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing mesh tests**

```ts
const mesh = buildSupportMesh([contact], settings);
expect(mesh.indices.length).toBeGreaterThan(0);
expect(bounds(mesh).min[1]).toBeCloseTo(0);
expect(bounds(mesh).max[1]).toBeGreaterThan(contact.position[1]);
expect(buildSupportMesh(treeContacts, { ...settings, treeEnabled: true }).parts).toContain('tree-branch');
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/supports/mesh.test.ts`
Expected: FAIL because no generated support mesh exists.

- [x] **Step 3: Implement pure indexed mesh builders**

Create reusable tube/cone/frustum primitives and compose exact setting-controlled geometry for contact tip, angled neck, pillar, base, brace, raft, roof/cage, label, and tree branch. Honor `resolution`, `lowPolyMode`, and `previewMode`; export mode must always request full geometry.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/supports/mesh.test.ts && git diff --check`
Expected: PASS. Update handoff with dimensions/topology fixtures and commit `feat: generate live support meshes`.

#### Task 5: Convert import and viewport to print units

**Files:**
- Modify: `src/App.tsx`, `src/components/ObjectViewport.tsx`, `src/components/ObjectViewport.test.ts`, `src/state/transform.ts`, `src/state/transform.test.ts`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing transform-parenting tests**

```ts
expect(unitWorldTransform(unit, supportVertex)).toEqual(unitWorldTransform(unit, modelVertex));
expect(importGltfUnits(gltfFixture)).toHaveLength(2);
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/components/ObjectViewport.test.ts src/state/transform.test.ts`
Expected: FAIL because the viewport is singleton-model based.

- [x] **Step 3: Render each unit under one parent group**

Import every GLTF mesh as a separate print unit and every STL as one unit. Render model and generated support mesh beneath the same `THREE.Group`; selection/picking activates a unit. A transform command must update the unit parent only, moving model and supports together.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/components/ObjectViewport.test.ts src/state/transform.test.ts && git diff --check`
Expected: PASS. Update handoff with multi-mesh import evidence and commit `feat: render multi-object print units`.

#### Task 6: Wire live support generation and editing UI

**Files:**
- Modify: `src/App.tsx`, `src/components/ObjectViewport.tsx`, `src/styles.css`, `docs/HANDOFF.md`
- Test: `src/state/project.test.ts`, `src/supports/settings.test.ts`

- [x] **Step 1: Write failing command/UI-state tests**

```ts
expect(reduceScene(scene, { type: 'supports/clear-manual', unitId: 'unit-a' }).units[0].manual).toEqual([]);
expect(reduceScene(scene, { type: 'history/undo' })).toEqual(previousScene);
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/state/project.test.ts src/supports/settings.test.ts`
Expected: FAIL until UI-dispatched command behavior is present.

- [x] **Step 3: Replace prototype controls with support-tab parity controls**

Expose Generate, Remove, Clear Manual Edits, support edit mode, Undo/Redo, preset controls, all setting groups, and active-unit/multi-selection controls. Manual add/remove must dispatch scene commands; remove clicks suppress automatic contacts or delete manual contacts. Do not render Bake controls or create source copies.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/state/project.test.ts src/supports/settings.test.ts && git diff --check`
Expected: PASS. Update handoff with manual interaction verification and commit `feat: add live support editing controls`.

#### Task 7: Export units separately or as a whole scene

**Files:**
- Create: `src/supports/export.ts`, `src/supports/export.test.ts`
- Modify: `src/App.tsx`, `docs/HANDOFF.md`

- [x] **Step 1: Write failing export composition tests**

```ts
expect(buildExportScene(scene, { kind: 'active-printable' }).children).toHaveLength(2);
expect(buildExportScene(scene, { kind: 'active-supports' }).children).toHaveLength(1);
expect(buildExportJobs(scene, { kind: 'separate-printable' })).toHaveLength(scene.units.length);
expect(buildExportScene(scene, { kind: 'whole-printable' }).children.length).toBeGreaterThan(scene.units.length);
```

- [x] **Step 2: Run RED**

Run: `npm test -- src/supports/export.test.ts`
Expected: FAIL because export supports only the singleton prototype.

- [x] **Step 3: Implement transform-correct STL export**

Use the same generated support mesh rendered in the viewport. Provide active printable, active supports-only, separate printable units, separate supports-only units, and whole-scene printable download modes. Generate stable, collision-free filenames and never mutate a source mesh during export.

- [x] **Step 4: Run GREEN and close task**

Run: `npm test -- src/supports/export.test.ts && git diff --check`
Expected: PASS. Update handoff with exported mesh counts and commit `feat: export support units separately or together`.

#### Task 8: Validate Blender parity and complete the handoff

**Files:**
- Create: `docs/BLENDER_PARITY.md`, `docs/VERIFICATION.md`
- Modify: `docs/HANDOFF.md`

- [x] **Step 1: Write the failing parity checklist assertions**

Document fixture expectations for every `SLA Supports` panel feature: generation, presets, all setting groups, manual editing, remove/regenerate, multi-unit transforms, history, and every export mode. Mark Bake and proxy/original-copy operations as intentionally excluded.

- [x] **Step 2: Run full verification**

Run: `npm test && npm run build && git diff --check && git status --short`
Expected: all tests and TypeScript/build checks pass; only user-owned ignored/untracked artifacts remain.

- [x] **Step 3: Perform browser smoke verification**

Load two STL files and a multi-mesh GLTF; generate supports for each; transform a unit; add and remove manual contacts; undo/redo each action; remove/regenerate; and exercise every export mode. Record exact observed results in `docs/VERIFICATION.md`.

- [x] **Step 4: Close task**

Update `docs/HANDOFF.md` with the requirement-by-requirement evidence and an explicit final-state summary. Commit `docs: verify web resin support parity`.

---

<a id="2026-10-20-web-resin-support-parity-design"></a>

## 2026-10-20 — Web Resin Support Parity Design

*Was `docs/superpowers/specs/2026-10-20-web-resin-support-parity-design.md`.*

### Goal

Rebuild the browser Resin Support editor so it delivers the live Resin UV support workflow from `S:/ai/mixo3dtool/mixo3d`, including multi-object editing, support generation and manual editing, procedural support geometry, undo/redo, and print export. Blender remains the behavioral reference.

### Explicit exclusions

- Bake Supports.
- Hidden original-model copies and proxy objects.
- Blender collections, datablocks, and other Blender-only persistence mechanisms.
- Vertex-for-vertex Geometry Nodes equivalence.

### User workflow

Each imported mesh is a **print unit**. A print unit retains its original model mesh and owns one derived, live support group. The model and its support group share the same parent transform, so moving or rotating the unit moves both together. No duplicate original is made.

The user can select one or more units, configure preset or custom support settings, generate supports, add/remove manual supports, clear manual edits, remove supports, or regenerate them. Removing supports deletes only the derived group and leaves the model untouched. Regeneration reuses the unit's settings, manual additions, and suppressed automatic contacts.

### Data model

`PrintScene` owns ordered `PrintUnit` records. Each unit contains immutable imported geometry, a model transform, support settings, a generated placement result, manual additions, suppressed automatic-contact IDs, and the generated support mesh. Three.js objects are derived from this serializable state and are never kept in undo history.

`SupportSettings` represents Blender-aligned contact, neck, pillar, foot, brace, raft, roof/cage, tree, letter-label, automatic-placement, quality, and export controls. Light, Middle, Heavy, and Custom presets map to concrete values. Editing an individual preset-backed property changes the preset state to Custom.

### Geometry and placement

Placement runs in a worker per print unit. It derives automatic contacts from downward faces, physical boundaries, sharp ridges, and unsupported islands; merges those contacts with manual additions; and removes contacts suppressed by manual edits. Tree mode computes branch joins from generated contacts according to its merge distance and vertical drop parameters.

The mesh generator is pure and deterministic. It turns placement plus settings into indexed triangles for tip, neck, pillar, foot, brace, raft, roof/cage, labels, and tree branches. The viewport and STL encoder consume that same output, preventing preview/export divergence.

### Interaction and history

The viewport renders one parent group per print unit. Picking resolves the unit and support component before dispatching a command. Commands cover import, selection, transform, settings changes, support generation, manual add/remove, clear edits, remove supports, and bulk actions. Undo/redo stores serializable before/after scene snapshots or reversible command payloads; worker results are accepted only for the matching generation request.

### Export

Export has four modes: active unit model plus supports, active unit supports only, each unit as separate output, and all units as one output. All outputs use the generated indexed support mesh and the current parent transform. The source model is never mutated.

### Verification

Tests are written before each implementation change. Unit tests cover setting/preset semantics, placement persistence, support-mesh dimensions and topology, tree and raft generation, history reversibility, transform parenting, and each export composition. Fixture comparisons against Blender establish placement counts, support dimensions, and bounding boxes rather than exact vertex identity. `npm test` and `npm run build` are required at every completed implementation milestone.

### Continuity protocol

After every task, `docs/HANDOFF.md` records the completed requirement, changed files, exact commands and results, Git state, decisions, risks, and one unambiguous next step. A successor starts by reading this design, the active plan, the handoff, and `git status --short`.

---

<a id="2026-10-21-migration-prep"></a>

## 2026-10-21 — Release 2: Bug Sweep and Migration Prep — Implementation Plan

*Was `docs/superpowers/plans/2026-10-21-migration-prep.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fix every known bug and restructure support generation + editing into portable, licence-clean, heavy-mesh-safe layers ready for the mixomesh (Babylon.js) migration, with no unintended behaviour change.

**Architecture:** Golden tests pin today's exact outputs first. Then pure layers are carved out: `src/core/` (support core), `src/editing/` (editing rules), `src/workers/` (mixomesh `WorkerTask` contract). React/three become thin. GPL-derived code is rewritten against the goldens. Heavy meshes get mixomesh-aligned budgets and tiers.

**Tech Stack:** TypeScript, Vitest, React 18 + R3F (view only), Web Workers.

**Spec:** `docs/superpowers/specs/2026-10-21-migration-prep-design.md`

### Global Constraints

- No behaviour change except listed bug fixes; goldens (Task 1) must stay byte/number-identical through Tasks 4–10 unless a task says it changes them (only Task 2 does, for non-default ridge angles).
- `src/core/**` and `src/editing/**`: no imports of react, three, @react-three, DOM globals, `import.meta`, i18n, or `src/state/*` app types. Enforce with a test that scans imports (added in Task 4, extended later).
- Coordinate conventions: Y-up, millimetres, right-handed, CCW outward triangles, Euler XYZ.
- Budgets (mixomesh `capabilities.js`): web 1_500_000, desktop 6_000_000 triangles; hard refusal above 4× budget.
- UI strings EN + zh-Hant + ja; mixo-app-style rules; app's current button size.
- Commits local; push only at the end (owner authorized deploy for this release).

### Review Focus

1. A refactor silently changing contact ids/positions or support triangles — goldens catch it (Task 1).
2. Worker cancel/timeout/crash leaving the UI stuck in "Building supports" — Task 8 tests + browser check.
3. Heavy import crashing the tab instead of refusing — Task 9 browser check with synthetic 10M mesh.
4. Clean-room rewrite changing results on edge cases (ties in kd-tree nearest, BVH hit order) — Task 10 goldens on several fixtures.
5. Babylon adapter docs wrong about winding/handedness — Task 11 numeric test of the mirror adapter.

---

#### Task 1: Golden fixtures

**Files:** Create `src/goldens/` (fixtures + `goldens.test.ts`), `scripts/update-goldens.ts` (writes JSON snapshots; never run in CI).
- [ ] Fixtures: cube-with-overhang (existing test mesh), knot.stl (`.playwright-mcp/knot.stl` copied to `src/goldens/fixtures/`, or a smaller deterministic generated torus-knot if > 2 MB), a thin-wall slab.
- [ ] For each fixture × {default settings, tree supports, roof mode}: snapshot placement points (id, position, normal, source) rounded to 1e-6, support mesh component table (part, contactId, start, count) and a hash (FNV-1a over positions rounded to 1e-5 + indices), export STL byte hash, support check problems, `contactAtTriangle` for 20 seeded triangles.
- [ ] Snapshots stored as JSON in `src/goldens/__snapshots__/`; test compares exactly. Run time < 30 s total.
- [ ] Commit `test: exact golden fixtures for placement, support mesh, export and check`.

#### Task 2: Ridge angle bug

**Files:** `src/analysis/edgeAnchors.ts:21`, its test.
- [ ] Failing test: with `sharpEdgeAngleDegrees` 30 vs 60, the anchor sets differ as the add-on's ridge compare would (edge signed angle vs setting); default 45 unchanged.
- [ ] Use the setting instead of `SHARP_ANGLE`. Update only goldens whose settings use a non-default ridge angle (none by default) — default goldens must not change.
- [ ] Commit `fix: Ridge angle setting drives sharp-edge anchors (add-on parity)`.

#### Task 3: Deferred bug sweep

**Files:** as listed per item (see `docs/migration/release-2-backlog.md`).
- [ ] `buildVertexGrid` guard for non-finite bounds and `cellSize <= 0` (fall back to brute force) + import validation rejecting non-finite vertex coordinates with a clear message.
- [ ] ZoneLayer: memo refinement + grid per `unit.source` (not per mount).
- [ ] "removed" count: count only deleted/suppressed ids that currently hide something.
- [ ] Enter guard: also skip `[role=button]`, `a`, and any element with `tabindex` that handles Enter.
- [ ] Drag over select strokes: interpolate samples like zones (`stampsAlong`) so fast drags don't skip supports.
- [ ] Brush prop turning off mid-stroke ends the stroke and re-enables orbit immediately.
- [ ] Hover body not drawn over already-selected supports.
- [ ] `requestView` memoised; Fit view near-vertical keeps a defined up axis.
- [ ] `useGeometry` memo-then-dispose StrictMode-safe (build in effect like SupportBodies).
- [ ] runCheck single map; App.tsx `Math.hypot` hit filter → squared distance.
- [ ] Tests where the item has logic; commit per group.

#### Task 4: `src/core` skeleton, vec3 and conventions

**Files:** Create `src/core/vec3.ts`, `src/core/conventions.ts`, `src/core/README.md`, `src/core/imports.test.ts` (scans `src/core/**` and `src/editing/**` imports; fails on forbidden ones).
- [ ] `vec3.ts`: add/subtract/scale/dot/cross/length/lengthSq/distance/distanceSq/normalize on `Vector` tuples; replace the 7 duplicated helper sets (babylon-review §5) — goldens unchanged.
- [ ] `conventions.ts`: constants + doc (UP = [0,1,0], UNITS = 'mm', HANDEDNESS = 'right', WINDING = 'ccw-outward', EULER_ORDER = 'XYZ').
- [ ] Move pure modules that already qualify into `src/core/` with re-export shims at old paths only if needed for a short transition (prefer updating imports): `analysis/*` (placement, supportCheck, remesh, edgeAnchors, types), `supports/{mesh,settings,zones,selection,overlayMesh,autotree,…}` — whichever have no app-type imports; leave `unitSupports.ts` (app glue) outside.
- [ ] Commit `refactor: src/core pure support core with shared vec3 and conventions`.

#### Task 5: Editing rules — keys, session, status (was zones-plan Task 5)

**Files:** Create `src/editing/{types,keys,session,status}.ts` + tests; modify `src/App.tsx`, `src/components/ObjectViewport.tsx` (import types).
- [ ] `keyAction(input) → KeyAction` (tagged union incl. preventDefault) with a table test of every current row; App listener uses it.
- [ ] `reduceSession(state, event)` for modes off/edit/zones + return target, tools, styles, brush/zone kinds and radii, selection toggle/paint/prune/clear, active-object change; tests per lifetime rule. Undo floor stays in App, set from session transitions.
- [ ] `editStatus(session) → { key, vars }` (message keys as data); tests.
- [ ] Browser smoke (5199; stop after). Commit `refactor: editing keys, session and status as framework-free modules`.

#### Task 6: Editing rules — stroke, view, pick (was zones-plan Task 6)

**Files:** Create `src/editing/{stroke,view,pick}.ts` + tests; modify `ObjectViewport.tsx`.
- [ ] `createStroke()` state machine shared by Drag over and zone painting (incl. interpolation hook); `frameView(...)`, `belowPlate(y)`; `pickAction(...)` table.
- [ ] Browser smoke. Commit `refactor: stroke, view and pick rules as framework-free modules`.

#### Task 7: Transform math without three + UI spec (was zones-plan Task 7)

**Files:** Create `src/core/transform.ts` (+ test vs current three output on 50 seeded transforms, 1e-9); modify `src/state/transform.ts`, `src/state/import.ts` (weld without three); create `docs/superpowers/specs/2026-10-21-support-editing-ui-spec.md`.
- [ ] No three import left outside the view layer (`src/components/**`, loaders allowed: glTF/STL parsing may keep three loaders in `src/state/import.ts` only if isolated behind a pure `TriangleMesh` result — note it in the spec).
- [ ] UI spec: state diagram, key table, pick table, status keys + 3 languages, colour/opacity table, cursor/tolerance, camera numbers, conventions + Babylon adapter.
- [ ] Commit `refactor: transform math without three; support editing UI spec`.

#### Task 8: Core jobs off `PrintUnit` + WorkerTask-contract runner

**Files:** Create `src/core/jobs.ts` (`SupportJob`, `PlacementJob`, `CheckJob` — plain inputs: TriangleMesh, settings, contacts inputs incl. manual/suppressed/deleted/zones, labelText, transform), `src/workers/WorkerTask.ts` (port of mixomesh `src/core/workers/WorkerTask.js` contract: `new WorkerTask({ create, mode, concurrency, timeoutMs, fallback, name })`, `run(payload, { transfer, signal, timeoutMs, onProgress, revision })`; worker side `serveTask(handler)`), tests (abort, timeout, crash restart, revision mismatch rejected, fallback when `create` is null) mirroring mixomesh's WorkerTask tests; modify mesh/analysis/import clients and workers to use it and to receive `SupportJob` instead of `PrintUnit`; `unitSupports.ts` becomes the only `PrintUnit → SupportJob` adapter.
- [ ] Worker creation via injected factories (`create: () => new Worker(new URL(...), { type: 'module' })` lives only in one app-level file).
- [ ] No long-lived per-worker model copies: the job carries the mesh (transferred copy) or a token for a cache with explicit eviction on unit removal and a total-bytes cap; document which.
- [ ] Goldens unchanged; browser check (generate, edit, export; cancel by regenerating mid-build).
- [ ] Commit `refactor: support core jobs and mixomesh WorkerTask contract`.

#### Task 9: Heavy meshes

**Files:** Create `src/core/budget.ts` (tiers, memory estimate, `assertTriangleCapacity` mirroring mixomesh wording), `src/core/decimate.ts` (pure vertex-clustering simplification for the display copy, deterministic, tested), `scripts/make-heavy-meshes.ts` (writes synthetic 2M/5M/10M-triangle STLs to `.playwright-mcp/heavy/`, git-ignored); modify import, App, viewport.
- [ ] Budgets web 1.5M / desktop 6M (desktop = Electron-like env flag, default web); refuse > 4× with message; tiers: full < 300k; large ≤ budget (tips-only preview default, no overlay refinement, status note); heavy > budget (display uses `decimate` to ≤ budget/2, picking/zones on display copy mapped back? — NO: in heavy tier editing tools are disabled with a clear message; generation/export use full mesh in workers).
- [ ] Before import: estimate bytes (positions+indices × copies) and refuse cleanly if over a cap (use `performance.memory` / `navigator.deviceMemory` when present, else a conservative 1 GB).
- [ ] UX: invoke the `impeccable` skill (harden) to design messages/states; strings EN/zh-Hant/ja.
- [ ] Browser: 2M, 5M, 10M synthetic in Chrome — record heap (DevTools `performance.memory`), import time, generate time; none crashes; 10M refused or heavy-tier with message. Write numbers to the shared spec.
- [ ] Shared spec in mixomesh: `S:\ai\mixomesh\docs\superpowers\specs\2026-10-21-heavy-mesh-handling.md` (budgets, tiers, copies rule, UX wording, measured numbers); link from `docs/migration/`. Commit in mixomesh locally (push needs owner OK).
- [ ] Commit `feat: heavy-mesh budgets, tiers and safe refusal (mixomesh-aligned)`.

#### Task 10: Clean-room replacements for GPL-derived code

**Files:** Replace `src/analysis/blenderBvh.ts` (or its `src/core` successor), `kdtree.ts`, the Blender hash, and any Blender-behaviour remesh parts named in babylon-review §5, with independent implementations written from algorithm descriptions only (no reading of the old file bodies while writing; interfaces may be kept).
- [ ] Goldens must stay identical. If a part cannot match exactly (e.g. tie-break order baked into outputs), STOP and report to the controller with the diff — the owner decides.
- [ ] Licence note in `src/core/README.md`; remove GPL notices that no longer apply; keep OpenVDB attribution if still used.
- [ ] Commit `refactor: independent BVH, kd-tree and hash (licence-clean core)`.

#### Task 11: Babylon adapter notes + migration README + cia audit

**Files:** `src/core/README.md` (module map, public API, conventions, budgets, worker contract), `docs/migration/README.md` (how mixomesh consumes `src/core`, `src/editing`, worker jobs; Babylon render recipe per feature: support mesh, picking by faceId → contactAtTriangle, selection bodies, tips-only via tipsOf, zone layer via vertex colours, rings, cursor, camera), a pure `src/core/handedness.ts` (`toLeftHanded(mesh)` mirror Z + flip winding; `fromLeftHanded`) with tests (round trip identity; normals flip correctly).
- [ ] Run the `cia` skill audit over the release (unhappy paths, nothing dies silently, heavy-mesh journeys); fix Critical/Important findings in this task.
- [ ] Commit `docs: migration README, Babylon adapter; cia fixes`.

#### Task 12: NN/g usability set (owner-approved 2026-10-21)

**Files:** `src/i18n.ts` (+ glossary), `src/components/*`, `src/App.tsx` (thin wiring only; logic in `src/editing/`), `docs/migration/ui-spec.md`.
- [ ] Glossary: one term per concept for en / zh-Hant / ja (`docs/migration/glossary.md`) and a test that every i18n key uses the glossary terms (no synonyms like brush/paint outside zones).
- [ ] Error messages say what happened and what to do next (import fail, too large, worker timeout, export fail, check failed); test each message key exists in all 3 languages.
- [ ] Hover hints (`title` + accessible description) on every tool button and setting; Ridge angle and Overhang angle hints explain lower/higher.
- [ ] Forgiving number fields: accept "2mm", "2 mm", "2,5", clamp to limits instead of rejecting; pure parser in `src/editing/numberInput.ts` with tests.
- [ ] Check supports results: "Show me" frames the camera on the problem spot (reuse view framing from Task 6).
- [ ] Destructive actions (Clear all zones, Clear manual edits, Clear selection with >0) run immediately and show a toast "… · Undo" (mixo-app-style, 6 s, aria-live) instead of confirm dialogs; Undo restores in one step.
- [ ] Viewport tool hit areas ≥ 24 px.
- [ ] Final review checks all 10 NN/g heuristics against the UI spec.

---

<a id="2026-10-21-migration-prep-design"></a>

## 2026-10-21 — Release 2 — bug sweep and migration prep (design)

*Was `docs/superpowers/specs/2026-10-21-migration-prep-design.md`.*

Date: 2026-10-21. Owner: "fix them all, all bugs, and make them modular enough to be cleanly
prepared for migration" to mixomesh (Babylon.js). Owner delegated choices ("your pick for best
maintenance"): workers match mixomesh's `WorkerTask` contract; the shared heavy-mesh spec lives in
mixomesh docs, linked from here.

Inputs: `docs/migration/2026-10-21-babylon-review.md` (file:line map), `docs/migration/release-2-backlog.md`.

### Goals

1. **No behaviour change unless it fixes a bug**, proven by exact golden tests written first.
2. **Every known bug fixed** (backlog + ridge angle).
3. **Portable layers:**
   - `src/core/` — pure TS support core: vec3, transforms, conventions, placement, support mesh,
     check, zones, selection. No React, three, DOM, Vite, i18n, or app types (`PrintUnit`).
   - `src/editing/` — pure editing rules: session reducer, keys, stroke, pick, view framing, status
     keys.
   - `src/workers/` — job runner with the mixomesh `WorkerTask` contract (factory injection,
     progress, AbortSignal, timeout, revision echo, failure isolation, fallback), hosting the core.
   - React/three — thin view over the above.
4. **Licence-clean core:** GPL-derived code (`blenderBvh.ts`, `kdtree.ts`, Blender hash, any
   Blender-behaviour remesh parts) replaced by independent implementations with goldens unchanged;
   if exact parity proves impossible for a part, stop and ask the owner.
5. **Heavy meshes handled** with mixomesh-aligned budgets: web 1.5M / desktop 6M triangles; hard
   refusal above 4× budget with a clear message; tiers: full (< 300k), large (300k–budget: tips-only
   preview default, no overlay refinement), heavy (> budget: simplified display copy, export full,
   warning). One model copy per process at most; no long-lived per-worker copies. Memory estimate
   before import; refuse cleanly instead of crashing.
6. **Coordinate conventions in one module** (Y-up, mm, right-handed, CCW outward, Euler XYZ) with a
   documented Babylon adapter (`useRightHandedSystem` or one mirror at the boundary).
7. **UI spec for re-implementation** (state diagram, key/pick tables, status keys EN/zh-Hant/ja,
   colour/opacity table, numbers).
8. Heavy-mesh UX designed with the `impeccable` skill (harden); end-of-release `cia` audit.

### Out of scope

Actual Babylon port; add-on changes; new features.

---

<a id="2026-10-21-no-support-zones"></a>

## 2026-10-21 — No-support Zones Implementation Plan

*Was `docs/superpowers/plans/2026-10-21-no-support-zones.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per object, paint surface zones where automatic supports must not grow; auto contacts inside disappear, manual ones stay.

**Architecture:** Zones are an ordered list of sphere stamps on `PrintUnit` (object-local), evaluated by a pure `zonedAt` in a new `src/supports/zones.ts`. `unitContacts` filters automatic contacts through it, so workers, export, preview and the check all follow. A new `EditMode` value `'zones'` drives a blue-framed mode in App; the viewport reuses the Drag over stroke code to emit stamps and draws a see-through blue layer from per-vertex colours on an overlay mesh.

**Tech Stack:** React 18, @react-three/fiber + drei, three.js, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-21-no-support-zones-design.md`

### Global Constraints

- UI words: zones use **Paint / Erase / Brush size / zones** only; never "Select"/"Drag over" (selection words). EN + zh-Hant + ja for every new string (zh: 免支撐區, 塗刷區域, 塗刷, 擦除, 筆刷大小, 清除全部區域, 正在塗刷免支撐區; ja: サポート禁止エリア, エリアを塗る, 塗る, 消す, ブラシサイズ, すべてのエリアを消去, サポート禁止エリアを塗装中). UI says object/物件/オブジェクト.
- Zone colour `--blue` `#1d3461` (already in `src/styles.css`); see-through on the surface; Erase ring grey `PREVIEW.ring`.
- mixo-app-style: one primary per view (Done), destructive = `.danger` outline (Clear / Clear all zones), pressed segment = ink fill, plain words, no key held while dragging, no right-drag; buttons keep the app's current size.
- Brush size 0.5–10 mm, step 0.5, default 2 mm (view state).
- Manual supports are never hidden by zones. Zones never re-run placement.
- Commits local only; push only when the owner says.

### Review Focus

1. Thin wall: painting one face must not hide contacts on the opposite face. Pinned in Task 1 (`zonedAt` normal test).
2. Erase after paint over the same spot restores the auto supports; order matters. Pinned in Task 1.
3. Undo of a stroke removes exactly that stroke's stamps (one undo step). Pinned in Task 1 (one `zones/add` per stroke) and Task 3 browser check.
4. Moving/rotating the object after painting keeps zones on the same surface (object-local). Pinned in Task 3 browser check.
5. Stroke released over a panel / window blur ends the stroke and commits once. Pinned in Task 3 browser check (stroke code reused from Drag over).

---

#### Task 1: Zone model and contact filter

**Files:**
- Create: `src/supports/zones.ts`, `src/supports/zones.test.ts`
- Modify: `src/state/project.ts` (PrintUnit, SceneCommand, reducer, normalizeUnit), `src/state/import.ts:127`, `src/supports/unitSupports.ts:25-29`, test fixtures listing `deleted: []` (`state/history.test.ts`, `state/project.test.ts`, `supports/export.test.ts`, `supports/unitSupports.test.ts`)

**Interfaces:**
- Produces:
  - `type ZoneStamp = { center: Vector; radius: number; normal: Vector; kind: 'paint' | 'erase' }`
  - `zonedAt(zones: readonly ZoneStamp[], point: Vector, normal?: Vector): boolean` — last covering stamp decides; covering = `distance <= radius` and (when `normal` given) `dot(normal, stamp.normal) > 0`
  - `nextStamp(last: Vector | undefined, point: Vector, radius: number): boolean` — true when `last` is undefined or `distance(last, point) >= radius / 2`
  - `PrintUnit.zones: ZoneStamp[]`; commands `{ type: 'zones/add'; unitId: string; stamps: ZoneStamp[] }` (appends; empty `stamps` = no-op, same scene) and `{ type: 'zones/clear'; unitId: string }` (no-op when already empty)

- [ ] **Step 1: Write the failing tests** in `zones.test.ts`: no stamps → false; one paint stamp covers inside/boundary, not outside; same spot with opposite normal `[0,1,0]` vs stamp normal `[0,-1,0]` → false; paint then erase same spot → false, erase then paint → true; without `normal` argument the side test is skipped; `nextStamp(undefined, p, 2)` true, distance 0.9 false, 1.0 true. In `unitSupports.test.ts`: a unit with an auto contact inside a paint stamp and a manual contact inside it → only the manual contact remains. In `project.test.ts`: `zones/add` appends in order; `zones/add` with `[]` returns the same scene object; `zones/clear` empties; `normalizeUnit` turns a missing `zones` into `[]`; `supports/clear-manual` keeps zones.
- [ ] **Step 2: Run** `npx vitest run src/supports/zones.test.ts src/supports/unitSupports.test.ts src/state/project.test.ts` — Expected: FAIL (module/fields missing).
- [ ] **Step 3: Implement** `zones.ts`; PrintUnit field, commands, reducer cases, `zones: cloneJsonValue(unit.zones ?? [])` in normalizeUnit, `zones: []` in import and fixtures. In `unitContacts`, after composing, drop contacts that are not manual (`!id.startsWith('manual-')` — consistent with the existing `tree` flag) and `zonedAt(unit.zones, position, normal)`.
- [ ] **Step 4: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 5: Commit** `git commit -m "feat: no-support zone stamps hide automatic supports"`.

---

#### Task 2: Zones mode in App

**Files:**
- Modify: `src/App.tsx`, `src/components/ObjectViewport.tsx` (types + props pass-through only), `src/i18n.ts`, `src/styles.css`

**Interfaces:**
- Consumes: Task 1 commands and `ZoneStamp`.
- Produces:
  - `EditMode = 'off' | 'edit' | 'zones'` (exported from ObjectViewport.tsx)
  - new `ObjectViewportProps`: `zoneBrush?: { radius: number; kind: 'paint' | 'erase' }` (set only in zones mode), `showZones: 'off' | 'faint' | 'full'`, `onZoneStroke: (unitId: string, stamps: ZoneStamp[]) => void`

- [ ] **Step 1: State and handlers:** `zoneKind` (`'paint'` default), `zoneRadius` (2), `zonesReturn: 'off' | 'edit'` (where Done goes back to). `openZones()` (needs active unit; sets the undo floor like `toggleEditMode`; remembers return), `closeZones()`. `onZoneStroke` dispatches one `zones/add` for the active unit only (ignore others, ignore empty). `clearZones(unitId)` dispatches `zones/clear`. Status lines: entering ("Paint where supports must not grow; drag on the model.") and after a stroke ("Zone painted: automatic supports inside are hidden." / for erase "Zone erased."), i18n.
- [ ] **Step 2: Left panel section** "No-support zones" between "Edit supports" and "Supports for …": `{n} zones` muted count for the active object (plural via `plural`), **Paint zones** (disabled without active object), **Clear** (`.danger`, disabled when active object has no zones), help line per spec.
- [ ] **Step 3: Viewport chrome in zones mode:** `viewport--zones` class: frame + badge in `--blue` instead of red (badge text "Painting no-support zones" + object name); bar: segmented `Paint | Erase`, range `Brush size` with `{n} mm`, `Clear all zones` (`.danger`), `Done` (primary). Support Edit Mode bar gains `Edit no-support zones →` (plain button) calling `openZones()` with return `'edit'`. Keys: Esc/Enter (not on a button) in zones mode → `closeZones()`; Tab does nothing in zones mode. Selection/edit tools unaffected. `showZones` = `'full'` in zones mode, `'faint'` in edit mode, else `'off'`.
- [ ] **Step 4: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass (i18n test included).
- [ ] **Step 5: Commit** `git commit -m "feat: No-support zones mode and panel"`.

---

#### Task 3: Painting and the blue layer in the viewport

**Files:**
- Modify: `src/components/ObjectViewport.tsx`

**Interfaces:**
- Consumes: Task 2 props; `zonedAt`, `nextStamp`, `ZoneStamp` (Task 1).
- Produces: `ZoneLayer({ geometry, zones, opacity }: { geometry: THREE.BufferGeometry; zones: readonly ZoneStamp[]; opacity: number })` — overlay mesh sharing the model's `position`/`normal`/index, with its own RGBA `color` attribute (blue where `zonedAt(zones, vertex, vertexNormal)`, alpha 0 elsewhere), `vertexColors`, `transparent`, `depthWrite={false}`, polygon offset, `raycast` disabled. Disposes only its own attributes (never the shared ones — same rule as `SupportBodies`).

- [ ] **Step 1: Stroke:** in zones mode (`zoneBrush` set, editing), reuse `startStroke`/`endStroke`/window listeners and the cursor effect. Collect stamps for the current stroke in a ref: on press and on each move with the button held, `if (nextStamp(lastCenter, point, radius))` push `{ center: point, radius, normal: faceNormal (local, normalised), kind }`. On stroke end (pointerup/pointercancel/blur/no-button move/unmount) call `onZoneStroke(unit.id, stamps)` once if non-empty, then clear. Supports and other objects take no pointer events in zones mode (support mesh handlers off; presses on supports must reach the model — set the support mesh `raycast` to a no-op in zones mode). Ring: `EditPreview` with `zoneBrush.radius`, blue `#1d3461` for paint, `PREVIEW.ring` for erase.
- [ ] **Step 2: Layer:** `ZoneLayer` on the model with `zones = unit.zones + current stroke stamps` (so paint shows live during the stroke; recompute per added stamp is fine — vertex count × stamp count; if it is slow on the 76k-triangle knot, apply only the newly added stamp to the existing colour array during a stroke and recompute fully when `unit.zones` changes). Opacity 0.55 in `'full'`, 0.25 in `'faint'`, not mounted when `'off'` or no zones.
- [ ] **Step 3: Browser check** (`npx vite --port 5199 --strictPort` in background; stop it and its node process after): knot.stl, Generate, Paint zones → paint a stripe on the underside: blue layer follows, on release the supports in the stripe vanish (count drops in the footer); Erase over half → those return; Ctrl+Z → last stroke undone in one step; Move the object (Transform → Move, drag gizmo) → zones stay on the same surface; drag released over the right panel → stroke commits once and orbit works after; Edit Mode shows the faint layer; "Edit no-support zones →" and Done round-trip. Screenshots `.playwright-mcp/zones-*.png`.
- [ ] **Step 4: Run** `npx tsc --noEmit -p . && npx vitest run && npm run build` — Expected: clean, all pass, build succeeds.
- [ ] **Step 5: Commit** `git commit -m "feat: paint no-support zones with a live blue layer"`.

---

#### Task 4: Check supports label and wrap-up

**Files:**
- Modify: `src/App.tsx` (runCheck / problem list), `src/i18n.ts`, `docs/superpowers/specs/2026-10-21-no-support-zones-design.md` only if behaviour deviated

**Interfaces:**
- Consumes: `zonedAt(zones, point)` without normal (problem positions are object-local, no normal).

- [ ] **Step 1:** `UnitProblem` gains `inZone: boolean`, set in `runCheck` via `zonedAt(unit.zones, problem.position)`. Problem list shows `· in a no-support zone` (muted, i18n: zh 「· 位於免支撐區」, ja 「· サポート禁止エリア内」) after the kind. Fix still opens Edit Mode.
- [ ] **Step 2: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 3: Browser check:** paint a zone over an island-prone area of knot.stl, Check for unsupported spots → item shows the zone label. Screenshot `.playwright-mcp/zones-check.png`.
- [ ] **Step 4: Commit** `git commit -m "feat: support check marks spots inside no-support zones"`.

---

#### Task 5: Editing rules out of App (keys, session, status)

Owner: mixomesh (Babylon.js) will re-implement this UI, so behaviour must live in framework-free modules with React as a thin layer. Source: `.superpowers/sdd/2026-10-21-no-support-zones/babylon-review.md` §6 and §8 (file:line map of every rule). No behaviour change.

**Files:**
- Create: `src/editing/keys.ts`, `src/editing/session.ts`, `src/editing/status.ts` (+ `*.test.ts` each)
- Modify: `src/App.tsx` (consume them)

**Interfaces:**
- `keys.ts`: `keyAction(input: { key: string; ctrl: boolean; shift: boolean; targetTag: string; mode: EditMode; hasSelection: boolean }): KeyAction` where `KeyAction` is a tagged union (`undo`, `redo`, `toggleEdit`, `deleteSelection`, `clearSelection`, `leaveMode`, `deleteObjects`, `gizmo`, `none`) plus whether to `preventDefault`. Table test covering every current row of App's key handler (mode × key × guard).
- `session.ts`: `EditSession` state (`mode`, `zonesReturn`, `tool`, `selectStyle`, `brushMode`, `brushRadius`, `zoneKind`, `zoneRadius`, `selection`) + `reduceSession(state, event)` for mode enter/leave/return, tool changes, selection toggle/paint/prune/clear, active-object change; tests for each lifetime rule (clear on mode change and object change, prune keeps identity). The undo floor stays in App (it is history), set from the session's transitions.
- `status.ts`: message keys as data — `editStatus(session): { key: string; vars?: Record<string, unknown> }` for entering/switching tools and modes; tests.
- No module imports React, three, DOM or i18n; `EditMode`/tool types move to `src/editing/types.ts` and ObjectViewport imports them from there.

- [ ] **Step 1:** Write the table/unit tests first (RED), then extract; App's listener and state call the modules.
- [ ] **Step 2: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 3: Browser smoke** (5199; stop after): Tab/Esc/Enter/Delete/Backspace behave as before in off/edit/zones; select + Delete; zones round-trip.
- [ ] **Step 4: Commit** `git commit -m "refactor: editing keys, session and status as framework-free modules"`.

---

#### Task 6: Viewport rules out of ObjectViewport (stroke, view, pick)

**Files:**
- Create: `src/editing/stroke.ts`, `src/editing/view.ts`, `src/editing/pick.ts` (+ tests)
- Modify: `src/components/ObjectViewport.tsx`

**Interfaces:**
- `stroke.ts`: a tiny state machine `createStroke()` → `{ begin(button): boolean; move(buttonsHeld: boolean): 'sample' | 'end' | 'idle'; end(): boolean }` used by BOTH Drag over select and zone painting (one path); the R3F layer only wires DOM/window events and OrbitControls to it. Tests: non-left begin ignored, end on release/cancel/blur/no-button move, end idempotent.
- `view.ts`: `frameView(bounds: { center: Vector; radius: number }, fovDeg: number, kind: 'bottom' | 'fit', current?: { position: Vector; target: Vector }): { position: Vector; target: Vector }` and `belowPlate(cameraY: number): boolean`; numeric tests (bottom = straight below with the 1e-3 offset; fit keeps direction; zero-direction fallback (70,60,90)).
- `pick.ts`: which action a pointer event means, as data — `pickAction({ tool, selectStyle, mode, button, ctrl, meta, hit: 'support' | 'model' | 'none', contactId? })` → `add | erase | removeContact | toggle | strokeStart | miss | none`; table tests mirroring current behaviour.
- No React/three/DOM imports in these modules.

- [ ] **Step 1:** Tests first (RED), then extract and wire.
- [ ] **Step 2: Run** `npx tsc --noEmit -p . && npx vitest run && npm run build`.
- [ ] **Step 3: Browser smoke:** Drag over select + Delete, click select, right-click remove, zone paint/erase, Tips only, Fit view, Bottom view.
- [ ] **Step 4: Commit** `git commit -m "refactor: stroke, view and pick rules as framework-free modules"`.

---

#### Task 7: Transform math without three, and the UI spec addendum

**Files:**
- Create: `src/math/transform.ts` (+ test); `docs/superpowers/specs/2026-10-21-support-editing-ui-spec.md`
- Modify: `src/state/transform.ts` (use `src/math/transform.ts`; no three import)

- [ ] **Step 1:** `math/transform.ts`: Euler XYZ → matrix, apply to points/directions, inverse — exactly what `state/transform.ts` uses three for today. Test: equality (1e-9) against the current three-based output on 50 seeded random transforms (write the test before swapping).
- [ ] **Step 2:** UI spec for a Babylon re-implementation: mode/tool state diagram (from `session.ts`), key table (from `keys.ts`), pick table (from `pick.ts`), status message keys + EN/zh-Hant/ja, colour/opacity table (selection red solid/see-through, unselect grey, zone blue full/faint, ring colours, frame colours), brush cursor + click tolerance, camera framing numbers, coordinate conventions (Y-up, mm, right-handed, CCW outward; Babylon needs `useRightHandedSystem` or one mirror adapter; Euler XYZ).
- [ ] **Step 3: Run** `npx tsc --noEmit -p . && npx vitest run && npm run build`.
- [ ] **Step 4: Commit** `git commit -m "refactor: transform math without three; support editing UI spec"`.

---

<a id="2026-10-21-no-support-zones-design"></a>

## 2026-10-21 — No-support zones — design

*Was `docs/superpowers/specs/2026-10-21-no-support-zones-design.md`.*

Date: 2026-10-21. Owner-approved flow (session 015Ni9eJEgk682CcmgrgzSM4).

### Goal

Per object, paint areas of the model surface where automatic supports must not grow. Painting
works before or after Generate; auto supports inside a zone disappear; manual supports always stay.

### Kept apart from selection (owner)

| | No-support zones | Select supports |
|---|---|---|
| Acts on | the object's surface | the supports |
| Kept | saved with the object, through regeneration | temporary |
| Words | Paint, Erase, Brush size, zones | Select, Drag over, Size |
| Look | blue frame and badge, blue layer on the surface | red frame, red supports |
| Place | its own mode | Support Edit Mode |

### Flow and UI

- Left panel, a section **No-support zones** between "Edit supports" and "Supports for …":
  "Painted" or "None" (muted, never a count: one stroke is many stamps) · **Paint zones** · **Clear** (`.danger` outline, disabled when none).
  Help line: "Paint where supports must not grow. Manual supports stay."
- **Paint zones** enters zones mode for the active object (needs an active object, like Edit Mode).
  Viewport: blue hairline frame, blue badge "Painting no-support zones · {object}", bar top right:
  `[ Paint | Erase ]  Brush size ●── 2 mm  [ Clear all zones ]  [ Done ]`.
  Brush size 0.5–10 mm, step 0.5, default 2 (view state). Clear all zones = `.danger` outline;
  Done = the mode's one primary. Esc / Enter (not on a button) leave the mode, as Edit Mode does.
- Support Edit Mode bar gets a plain link-style button **Edit no-support zones →** that switches
  straight to zones mode (and zones mode's Done returns to where the user came from: Edit Mode if
  entered from there, else off).
- Painting: a drag that starts on the active object's model paints (or erases); a drag on empty
  space rotates. A blue ring lies on the surface under the pointer (grey for Erase) with the brush
  cursor. Supports are drawn but take no pointer events in zones mode.
- The blue layer (`--blue` `#1d3461`, see-through) shows on the model in zones mode and, fainter, in
  Support Edit Mode. Hidden otherwise; the panel count says zones exist.
- One stroke = one undo step. Auto supports inside the new zone disappear when the stroke ends
  (the support mesh rebuilds as for any edit). Erase brings them back.

### Data

- `PrintUnit.zones: ZoneStamp[]`, ordered. `ZoneStamp = { center: Vector; radius: number;
  normal: Vector; kind: 'paint' | 'erase' }`, all in object-local space (moves/rotates with the
  object). Old saves load with `zones: []`.
- A point with surface normal `n` is **zoned** when the last stamp covering it is a paint stamp.
  A stamp covers the point when `distance(point, center) <= radius` and `dot(n, stamp.normal) > 0`
  (same side of the surface: a stroke on one face of a thin wall never zones the far face).
- `unitContacts` drops automatic contacts whose position+normal is zoned. Manual contacts are never
  dropped. Placement itself is unchanged (zones only hide), so changing zones never re-runs
  placement.
- Stamps along a stroke: a new stamp when the pointer has moved at least half the brush radius
  from the last stamp of the stroke (first press always stamps).
- **Clear** / **Clear all zones** remove every stamp of that object (one undo step). "Clear manual
  edits" does not touch zones.

### Check supports

Islands and overhangs whose position is zoned are still listed, labelled
"in a no-support zone" so the user knows why they lack supports.

### Out of scope

"Must support here" painting, smart fill, clipping plane, add-on support for zones.

---

<a id="2026-10-21-support-editing-ui-spec"></a>

## 2026-10-21 — Support editing UI spec (for re-implementation in mixomesh / Babylon.js)

*Was `docs/superpowers/specs/2026-10-21-support-editing-ui-spec.md`.*

Date: 2026-10-21. Source of truth: the framework-free modules in `src/editing/` and `src/core/`.
Every table below is taken from them; when this spec and the code disagree, the code (and its
tests) win. Numbers are millimetres, pixels or radians as stated.

| Rule | Module | Tests |
|---|---|---|
| Mode / tool / selection state | `src/editing/session.ts` | `session.test.ts` |
| Left-panel mode buttons (enter / exit) | `src/editing/modeButtons.ts` | `modeButtons.test.ts` |
| Keyboard | `src/editing/keys.ts` | `keys.test.ts` (row table) |
| Pointer clicks | `src/editing/pick.ts` | `pick.test.ts` (row table) |
| Brush strokes | `src/editing/stroke.ts` | `stroke.test.ts` |
| Drag over step queue | `src/editing/strokeQueue.ts` | `strokeQueue.test.ts` |
| Status line | `src/editing/status.ts` | `status.test.ts` |
| Camera framing | `src/editing/view.ts` | `view.test.ts`, `components/viewParity.test.ts` |
| Selection rules | `src/editing/selection.ts` | `selection.test.ts` |
| Number fields | `src/editing/numberInput.ts` | `numberInput.test.ts` |
| Error messages | `src/editing/errors.ts` | `errors.test.ts`, `i18n.test.ts`, `importErrors.test.ts` |
| Undo toasts | `src/editing/toast.ts` | `toast.test.ts` |
| Glossary | `src/glossary.ts`, `docs/migration/glossary.md` | `glossary.test.ts` |
| Hover hints | `src/components/hint.ts` | `hints.test.ts` |
| Placement math | `src/core/transform.ts` | `core/transform.test.ts`, `state/transformParity.test.ts` |
| Conventions | `src/core/conventions.ts` | — |

### 1. State diagram

Session state (`EditSession`): `mode` (`off` | `edit` | `zones`), `zonesReturn` (`off` | `edit`),
`activeUnitId`, `tool` (`add` | `select`), `selectStyle` (`click` | `brush` = "Drag over"),
`brushMode` (`select` | `unselect`), `brushRadius` (Drag over circle radius in screen px, default 24, slider 8–80 step 4),
`zoneKind` (`paint` | `erase`), `zoneRadius` (mm, default 2, slider 0.5–10 step 0.5),
`selection` (contact ids). Never in undo history.

```
             toggleEdit (Tab, Edit supports)          openZones(from: edit)
   ┌──────┐  needs an active object   ┌──────┐  ─────────────────────────▶ ┌───────┐
   │ off  │ ────────────────────────▶ │ edit │                             │ zones │
   │      │ ◀──────────────────────── │      │ ◀───────────────────────── │       │
   └──────┘  toggleEdit / Esc / Enter └──────┘  closeZones (Done, Esc,     └───────┘
      ▲  │                                         Enter) when zonesReturn=edit │
      │  └──── openZones(from: off) (Paint zones), needs an active object ─────▶│
      └──────────── closeZones when zonesReturn=off ─────────────────────────────┘
   leave (import, Remove supports, a check's Fix) and "active object gone" → off from any mode.
   toggleEdit is ignored in zones (zones leaves through Done/Esc/Enter or its Exit button only).
```

Left-panel mode buttons (`editModeButton`, `zonesButton`): each mode's entry button turns into that
mode's exit in the same spot and size while the mode is on: pressed (`aria-pressed="true"`, ink fill +
paper text like any pressed toggle), never red, so the red **Done** `Esc` in the viewport bar stays the one
primary. Clicking an Exit button sends the same event as Done, return rules included.

| Mode | Edit supports button | No-support zones button |
|---|---|---|
| off | **Enter Support Edit Mode** (toggleEdit; needs an editable active object) | **Paint zones** (openZones from off; same need) |
| edit | **Exit Support Edit Mode**, pressed (toggleEdit → off) | **Paint zones** (openZones from edit) |
| zones | Enter Support Edit Mode, disabled | **Exit no-support zones**, pressed (closeZones → zonesReturn, like Done) |

Terms: en Exit Support Edit Mode / Exit no-support zones; zh-Hant 離開支撐編輯模式 / 離開免支撐區;
ja サポート編集モードを終了 / サポート禁止エリアの塗装を終了. Hints are the existing Done hints. Paint zones
and Clear stack full width (like the Edit supports button), so the Exit label stays on one line at 1366 px
in all three languages and the button keeps its size.

Lifetime rules:
- The selection empties on every mode change and whenever the active object changes.
- Ids whose contact no longer exists (undo, regeneration) drop out (`contactsChanged`); identity kept when none drop.
- Toggle (Click) and paint (Drag over) change the selection only in `edit`.
- Tool settings (tool, style, radii, kinds) survive mode and object changes.
- **Undo floor:** entering a mode from `off` records the history length; inside a mode Undo stops there (`startsEditing`). Moving edit → zones → edit keeps the first floor. The host owns history.
- Delete selection: exactly the selected live supports go in one undo step (manual contacts removed, automatic ones recorded as deleted); the selection clears; the tool stays.
- Clear selection (button, or Esc with a selection) runs at once and offers Undo on a toast; Undo puts exactly those ids back (`restoreSelection`, minus supports deleted since).
- Another object clicked while a mode is on: refused with `busyStatus` (object selection unchanged).

### 2. Key table (`keyAction`, first match wins)

`ctrl` = Ctrl or Cmd. Keys typed into INPUT / TEXTAREA / SELECT are ignored entirely.
"Enter acts on target" = focused BUTTON, A, SUMMARY, `role="button"` or any `tabindex` (then Enter is that element's, not Done).

| # | Key | Mode | Guard | Action | preventDefault |
|---|---|---|---|---|---|
| 1 | Ctrl+Z | any | — | undo (stops at the floor in a mode) | yes |
| 2 | Ctrl+Shift+Z | any | — | redo | yes |
| 3 | Ctrl+Y | any | — | redo | yes |
| 4 | Tab | off, edit | — | toggleEdit | yes |
| 5 | Tab | zones | — | none (swallowed) | yes |
| 6 | Esc, Enter | zones | Enter not on a control | leaveMode (closeZones) | yes |
| 7 | Delete, Backspace | edit | selection > 0 | deleteSelection | yes |
| 8 | Esc | edit | selection > 0 | clearSelection (with an Undo toast) | yes |
| 9 | Esc, Enter | edit | Enter not on a control | leaveMode (toggleEdit → off) | yes |
| 10 | Delete | off | — | deleteObjects | no |
| 11 | G | off | (also with Ctrl) | gizmo Move | no |
| 12 | R | off | (also with Ctrl) | gizmo Rotate | no |
| — | anything else | | | none | no |

Backspace never deletes objects; Delete/Backspace without a selection does nothing in edit; G/R do nothing in a mode.

### 3. Pick table (`pickAction`, `missAction`)

The host raycasts the nearest hit per object (supports drawn as tips only in the tips view are
picked as tips). A click whose pointer travel exceeds **4 px** (`CLICK_TOLERANCE`) is an orbit
drag: `pass`. `pass` = this hit does not take the click; the next hit behind (support → model)
gets it, or none. "contact" = the support triangle belongs to a contact's support (braces, raft,
labels do not → `pass`).

Model hit:

| Mode | Active object | Button | Tool / style | Ctrl | Action |
|---|---|---|---|---|---|
| off | any | left | — | — | select (additive with Shift) |
| off | any | right | — | — | none |
| zones | any | any | — | — | none (the zone brush owns the model; inactive objects are not pickable) |
| edit | no | any | — | — | select (plain; host refuses with busyStatus) |
| edit | yes | right | any | — | erase within Erase radius |
| edit | yes | left | select / click | any | miss |
| edit | yes | left | select / Drag over | any | none (the stroke owns the button) |
| edit | yes | left | add | no | add contact at the point (surface normal) |
| edit | yes | left | add | yes | erase within Erase radius |

Support hit (only `edit` on the active object takes it; otherwise `pass`):

| Button | Tool / style | Ctrl | contact | Action |
|---|---|---|---|---|
| left | add | no | — | pass (to the model: add) |
| left | add | yes | yes | removeContact (erase around that contact) |
| left | select / click | any | yes | toggle selection |
| left | select / Drag over | any | — | pass |
| right | any | any | yes | removeContact |
| any | any | any | no | pass |

No hit (`missAction`): in `edit`/`zones` → miss (status says what to click; nothing in Drag over, where a stroke may start anywhere); in `off` a left click clears the object selection; the release of a gizmo drag is ignored.

Remove radius (setting `eraseRadius`, default 1.5 mm; formerly labelled "Erase radius"): every contact within it of the picked point goes; the hover preview highlights exactly those.

### 4. Strokes (`createStroke`)

- Zones: starts on a **left** press on the active object's model. Drag over: starts on a **left** press anywhere on the canvas (model, support, empty plate under the supports; HUD buttons are outside the canvas). The host turns the camera orbit off for the stroke; right and middle drags still orbit.
- Ends on window pointerup, pointercancel, window blur, a pointer move with no left button held, the brush going away (tool/mode/object change), or unmount. `onEnd` runs once.
- A zone stroke is one undo step, committed at the end (on the active object only, and only if still in zones).
- What a zone removes: an automatic contact inside a zone (its position and normal, same-side rule; `core/jobs` `jobContacts`), and an automatic support that **lands** on the model inside a zone. The support build decides the landing case (`buildSupportMesh` with `zones` in plate space, `core/supports/mesh.ts`): in its own column loop, with the same target, re-sampled normals and ray the geometry uses (`core/supports/landing.ts`), it skips an automatic column whose landing point and landed-on, upward surface normal fall in a zone (same-side rule; erase stamps after it clear it again), and an Auto Tree whose junction landing (`treeLanding`) falls in one drops all its branches (CIA-05, closed). A tips-only preview casts the landing for the test alone, so it drops the same contacts. The build returns those contact ids as `dropped`; `unitContacts(unit, built)` subtracts the ids the unit's latest build reported, so counts, selection, checks and the export plan follow the built mesh. Manual supports always stay. Accepted trade-off: after an edit the counts follow when the worker returns the mesh; until then the unit's count and the footer counts show the last build's numbers dimmed (`aria-busy`), and the build shows in the job activity list; a failed build ends the wait (its error is in the status line). Checks and the export plan use a build's `dropped` only when that build was made from the unit as it is now (otherwise the check counts every contact and the export keeps the supports part), and a check against one build is never joined by a check against another. The export builds at full resolution and decides its own landings; it lands on the same remesh as the preview, except in a Low Poly Mode preview (exact model), where a contact right at a zone edge can differ. Zone drops lower the automatic count like any zone drop; the "removed" count stays Delete/Remove edits only.
- While painting zones the view shows tips only (`tipsShown(..., zones = true)`): the contact tips and the landing tips (`tipsOf` keeps a landing pillar's last Connection Length when its tip is built into the tube), so the user paints over exactly what is visible and the blue layer is not hidden by pillars. The Tips only button shows pressed and `aria-disabled` (still focusable, a click does nothing; hint: "While painting no-support zones only the contact tips show, so the surface stays visible."); the tips state is not changed, so leaving zones restores the previous view. With the camera above the plate the zones bar shows the note "Supports attach underneath: turn the view (Bottom view) to paint where they are."
- Gap fill (hook `samples(point, fill)`):
  - Drag over (screen space, in the host): pointer moves are queued (`editing/strokeQueue`) and each animation frame sweeps the circle along each step since the previous point (a capsule per step, exact, no spacing). Release and cancel do not cut the queue: it drains over the following frames until the last step is painted. Each step keeps the brush mode and circle radius it was made with (switching Select → Unselect, or Circle size, mid-queue changes only later steps); each stroke has its own painted set, so a new stroke (say Unselect) still changes ids the previous stroke's queued steps are painting, and a frame tests against the selection plus what its earlier steps hit; a support-mesh rebuild mid-stroke keeps the queue and restarts its steps on the new supports (ids already painted are skipped); the brush going away (tool, mode or object change) or the supports being removed drops it. A hover preview (the circle outside a stroke) is tested over frames the same way and also keeps the brush mode and circle radius it started with: switching Select ↔ Unselect or Circle size while a hover is still being tested finishes that preview in the old mode and size until the pointer moves, as queued steps do.
  - Zones (`zoneFill`): a stamp once the brush moved ≥ r/2 from the last stamp, with the same gap fill; filled stamps share the current hit's normal.
- Drag over is screen space (`editing/screenBrush`): a circle of `brushRadius` px follows the pointer. Each support's body is reduced to axis segments per part (`bodySegments`: top ring centre → bottom ring centre of tip, neck, pillar, foot...; braces/raft/labels skipped), projected with the camera × object matrix (`projectBodies`, cached until the camera, object or canvas size changes; a segment reaching behind the camera is cut at clip w = 0.01, one wholly behind is skipped). A support is hit when one of its projected segments comes within the radius of the swept path (`closestOnSegments`), and a part under the circle is visible: the closest point of every part under the circle first, then (for a stretch of 6 px or more) the ends and middle of each part's stretch under the circle, each a ray from the camera to the 3D point (perspective-correct, `perspectiveParam`, within the clipped range) that hits no visible model nearer than 0.5 mm in front of it (`hiddenByModel`, `HIDE_TOLERANCE`). Rays go straight to each visible model's BVH (`raycastFirst`, ray in model space) and are cached per part and spot (`cachedVisibility`, t to 1/8) until the projection changes, so a stroke casts each once; ids already painted in the stroke are not tested again. Pointer moves only queue work: each animation frame runs hit tests for `frameBudget(render ms)` (8 ms when rendering fills a 60 Hz frame, what is left of it when rendering is cheap, a quarter of the render time when frames are long anyway, at most 100 ms; `brushHitsFrom` slices), commits the frame's hits to the selection once per brush mode (`editing/strokeQueue`), and carries the rest to the next frame, also after the release, so a stroke always completes; during a stroke there is no separate hover pass (the painted ids are the preview). Measured at 5,143 supports (knot, 0.75 mm spacing, headless Chromium with software GL): hit-test work per frame p95 ≤ 9.2 ms, max 9.8 ms, none over 16 ms, at circle radius 24 and 80 px. Only models occlude; supports never hide each other. Only ids the stroke would change are tested (`want`: unselected for Select, selected for Unselect). The hover preview and the paint use the same `brushHits`. In the tips view only the tips are bodies.

### 5. Status message keys (en / zh-Hant / ja)

From `editing/status.ts` and the App handlers. Translations live in `src/i18n.ts`.

| en | zh-Hant | ja |
|---|---|---|
| Support Edit Mode: click the model to add, right-click a support to remove. | 支撐編輯模式：點擊模型新增，右鍵點擊支撐移除。 | サポート編集モード：モデルをクリックで追加、サポートを右クリックで削除。 |
| Support Edit Mode: click supports to select them, right-click a support to remove. | 支撐編輯模式：點擊支撐即可選取，右鍵點擊支撐移除。 | サポート編集モード：サポートをクリックで選択、サポートを右クリックで削除。 |
| Support Edit Mode: drag the circle over supports to select them. Supports hidden behind the model are skipped. | 支撐編輯模式：拖曳圓圈經過支撐即可選取。被模型擋住的支撐不會選到。 | サポート編集モード：円をサポートの上でなぞって選択。モデルに隠れたサポートは選ばれません。 |
| Paint where supports must not grow; drag on the model. | 在不要長出支撐的地方塗刷：在模型上拖曳。 | サポートを付けたくない場所を塗ります：モデル上をドラッグします。 |
| Select an object to edit its supports. | 請選取一個物件來編輯它的支撐。 | サポートを編集するオブジェクトを選択してください。 |
| Select an object first. | 請先選取一個物件。 | 先にオブジェクトを選択してください。 |
| Support edits kept. | 已保留支撐編輯。 | サポートの編集を保持しました。 |
| No-support zones kept. | 已保留免支撐區。 | サポート禁止エリアを保持しました。 |
| Nothing under the cursor: click the model to add, right-click a support to remove. | 游標下沒有物件：點擊模型新增，右鍵點擊支撐移除。 | カーソルの下に何もありません：モデルをクリックで追加、サポートを右クリックで削除。 |
| No support here: click a support to select it. | 這裡沒有支撐：點擊支撐即可選取。 | ここにサポートはありません：サポートをクリックすると選択できます。 |
| Finish painting zones first: press Esc or Done. | 請先完成塗刷免支撐區：按 Esc 或「完成」。 | 先にエリアの塗装を終了してください：Esc か「完了」を押します。 |
| Finish editing supports first: press Esc or Done. | 請先完成支撐編輯：按 Esc 或「完成」。 | 先にサポート編集を終了してください：Esc か「完了」を押します。 |
| Zone painted: automatic supports inside are hidden. | 已塗刷區域：區域內的自動支撐已隱藏。 | エリアを塗りました：中の自動サポートは非表示になります。 |
| Zone erased. | 已擦除區域。 | エリアを消しました。 |
| No-support zones cleared. | 已清除免支撐區。 | サポート禁止エリアを消去しました。 |
| Support added. | 已新增支撐。 | サポートを追加しました。 |
| Support added on a top face: it grows from below. | 已在朝上的面新增支撐：支撐會從下方長上來。 | 上向きの面にサポートを追加しました：下から伸びます。 |
| No support here: right-click a support, or the model within {radius} mm of one. | 這裡沒有支撐：請右鍵點擊支撐，或點擊距離支撐 {radius} mm 內的模型。 | ここにサポートはありません：サポートを右クリックするか、サポートから {radius} mm 以内のモデルをクリックしてください。 |
| Removed 1 support; removals persist through regeneration. / Removed {n} supports; … | 已移除 1 個支撐；重新產生後仍會保持移除。 / 已移除 {n} 個支撐；… | サポートを 1 本削除しました。再生成しても削除されたままです。 / サポートを {n} 本削除しました。… |
| Deleted 1 support. / Deleted {n} supports. | 已刪除 1 個支撐。 / 已刪除 {n} 個支撐。 | 1 個のサポートを削除しました。 / {n} 個のサポートを削除しました。 |

When each shows (`sessionStatus`): entering `edit` or changing the tool message → the tool line
(Add / Click / Drag over); entering `zones` → the zones line; leaving `edit` by toggle →
"Support edits kept."; leaving `zones` to `off` → "No-support zones kept."; a toggle/open without
an active object → the "Select an object…" lines; a forced exit (`leave`, object gone) and no-ops
→ nothing (the host says why). Plurals: `{n}` keys pick the "1 …" form for n = 1.

Note for the glossary (Task 12): ja counts supports with both 本 and 個.

### 6. Colours and opacity

| Element | Colour | Opacity / drawing |
|---|---|---|
| Brand red (`--red`): primary buttons, edit frame + badge in Support Edit Mode | `#7f0019` | solid; frame 1 px border |
| Blue (`--blue`): zones edit frame, Regenerate button | `#1d3461` | solid |
| Hover preview: add tip (ghost cone, pillar diameter × neck length) | `#b59f78` (kraft) | 0.55, no depth write |
| Hover ring (Erase radius) neutral | `#3b3631` | 0.85, drawn on top (no depth test), torus tube max(0.03, r·0.025) |
| Hover ring when the click would remove | `#7f0019` | 0.85, on top |
| Contacts a remove click would take (spheres, max(0.25, pillar·0.45)) | `#7f0019` | 0.9, on top |
| Selected supports (whole body: tip, pillar, foot) | per-vertex colour `#a8243c` on the support mesh itself (stands in for `#7f0019` + emissive 0.35); base vertices = the support colour | 1 (solid); only changed supports' vertex ranges are rewritten and uploaded (`editing/selectionPaint`) |
| Click hover over an unselected support | `#7f0019` | 0.45 see-through |
| Drag over → Select preview (unselected under brush) | `#7f0019` | 0.45 see-through |
| Drag over → Unselect preview (selected under brush, "turning back") | `#3b3631` | 0.45 see-through, taken off the solid red |
| Drag over circle (DOM, `.brush-circle`) | Select `--red`, Unselect `--ink` border 1.5 px | fill 8 % |
| Zone brush ring | Paint `#1d3461`, Erase `#3b3631` | 0.85 |
| No-support zone layer | `#1d3461` | 0.7 in zones (`full`), 0.3 in Support Edit Mode (`faint`), per-vertex alpha, polygon offset −2 |
| Check marker: island | `#b3261e` | 0.55, on top, radius min(2.5, 0.7 + √area / 10) |
| Check marker: uncovered overhang | `#d97706` | 0.55, on top |
| Model: active / selected / other | `#f6f3ec` (+ emissive `#7f0019` 0.06) / `#e6e1d7` / `#cdc8bf` | flat shading, roughness 0.85 |
| Supports: selected object / other | `#b59f78` / `#c8b896` | roughness 0.9 |
| Background, grid cell / section | `#e9e6df`, `#d3cdc2` / `#b9b1a3` | 5 mm cells, 25 mm sections |

### 7. Cursor and tolerances

- Click tolerance: 4 px pointer travel (`CLICK_TOLERANCE`).
- Select supports → **Click | Drag over** is a pair of big tool buttons (`.tool-choice`, `role="group"`, `aria-pressed`), shown only while Select supports is the tool: 40 px tall, a 19 px icon left of the label (`ToolIcons.tsx`: an arrow pointer for Click, the Drag over cursor's brush for Drag over; drawn for the app, no icon library), 13 px / 500 text, pressed = ink fill + paper text, unpressed = surface + `--line` hairline, 2 px radius, hover = sunken, focus-visible = 1 px ink outline offset 2 px, no red. Labels and hints are the existing i18n keys. While Drag over is on, **Circle size** sits directly under the Drag over button (`.tool-stack` / `.tool-option`, hidden in Click): label and value ("{n} px", 8–80 step 4, default 24, kept for the session) on one line, the slider under them, 11.5 px. While the slider moves, the circle shows at the centre of the view (`.brush-circle--preview`, Select red / Unselect ink) and disappears 800 ms after release (pointer up, key up, blur). Terms: en Circle size, zh-Hant 圓圈大小, ja 円のサイズ (never "brush": that word is for zones). At 1366 px the bar is two tidy rows in en / zh-Hant / ja: tools and options on the first, the key hints, Edit no-support zones and Done on the second.
- Support Edit Mode canvas cursor: crosshair (Add supports); arrow in Select supports → Click (`.viewport--pick`); in Drag over, over the canvas, a 24 × 24 brush icon, hot spot (3, 21), red tip `#7f0019`, plus the screen circle. Zones over the active object: the brush icon with a blue `#1d3461` (Paint) or grey `#3b3631` (Erase) tip; crosshair fallback.
- Zone radius: 0.5–10 mm, step 0.5, default 2. Drag over circle radius: 8–80 px, step 4, default 24 (screen px: the same feel at any zoom, and defined over empty space where there is no depth).
- Zone overlay refinement: edges ≤ 1 mm, at most 1 500 000 triangles; vertex grid cell 2 mm.

### 8. Camera numbers (`editing/view.ts`)

- Start camera: position (70, 60, 90), target (0, 0, 0), vertical FOV 40°, near 0.5, far 4000.
- Framed bounds: the bounding sphere of the selected objects' world box (every object when none is selected), radius at least 1 mm.
- Distance `d = max(r, 1) / sin(fov/2) × 1.15`.
- Bottom view: camera at `(cx, cy − d, cz + d·1e-3)` looking at the centre (a hair off vertical keeps the up axis defined; front of the plate at the bottom).
- Fit view: same direction as now (target → camera), unit length; camera at centre + dir·d. Camera on its target → the start direction (70, 60, 90). Near-vertical (horizontal share < 1e-3) → `(0, y, |y|·1e-3)`.
- Show me (check findings, also Fix): `spotView` frames the spot like Fit view, from the current direction, treating it as a sphere of radius max(5 mm, √area).
- Tips view (`TipsState`, `tipsShown` / `tipsCamera` / `tipsToggle`): state `{ manual: boolean | null, below }`, `null` = follow the camera. Shown = `manual ?? (below || largeModel)` (a large-tier model on the plate keeps tips on above the plate too). The camera crossing the plate (y < 0 ↔ y ≥ 0, either way) resets `manual` to `null`, so going below turns tips on by itself. The Tips only button is never disabled: a click sets `manual = !shown`, so tips can be switched off below the plate (and stay off through Fit view, which keeps the angle) until the camera crosses the plate again. Button pressed = shown. Hint when shown: "Only contact tips show. Turns on by itself below the plate; click to switch off. Export stays full."; otherwise "Show only the contact tips: no pillars, braces or raft. Turns on by itself below the plate. Export stays full."

### 9. Conventions and the Babylon adapter

`src/core/conventions.ts`: +Y up, millimetres, right-handed, counter-clockwise outward triangles,
Euler `XYZ` in radians. Placement matrix `T · Rx · Ry · Rz` (`core/transform.ts`), column-major
(element `[col·4 + row]`), points use the projective divide, directions use the linear part and
are normalised. Placements are rigid only, no scale: directions through the linear part are right
only for rotations (a scaled matrix would need the inverse transpose for normals), so a host that
scales objects must bake the scale into the mesh first. These match three.js exactly (bit for bit on 50 seeded transforms,
`state/transformParity.test.ts`).

Babylon.js is left-handed by default. Two options, pick one per app:
1. `scene.useRightHandedSystem = true` — use our positions, indices and matrices as they are.
   Babylon's `Matrix` is also column-major in memory (`m[12..14]` translation), so
   `Matrix.FromArray(placementMatrix(p))` works. Rotation: build from our matrix, not from
   `rotation` Euler (Babylon's `rotation` applies Y, X, Z; ours is X, Y, Z).
2. Keep Babylon left-handed and mirror once at the boundary (`src/core/handedness.ts`): negate
   Z of every position and normal, keep the indices (the mirror already reverses the winding,
   which is what Babylon's default CounterClockWise side orientation expects in a left-handed
   scene; swapping indices too turns meshes inside out), and convert placements with
   `S · M · S` (S = diag(1, 1, −1, 1)). Never mix the two. mixomesh uses this option; see
   `docs/migration/README.md`.

Picking in Babylon must reproduce: nearest hit first, `pass` falls through to the next hit
(supports → model behind), click tolerance 4 px, and tips-view picking against the tips mesh.

### 10. three.js boundary

`src/threeBoundary.test.ts` fails when a non-test module outside `src/components/` imports
three.js (or @react-three, three-mesh-bvh, three-stdlib), and when a listed exception no longer
does. The three exceptions (`LOADER_EXCEPTIONS` in that test):

| Module | Why |
|---|---|
| `src/state/import.ts` | walks the GLTFLoader scene graph (`gltfRawMeshes`) and takes BufferGeometry inputs in tests (`geometryToMesh`); the weld itself is typed-array (`src/core/import`) |
| `src/workers/prepareImport.ts` | builds the pick index (three-mesh-bvh on a BufferGeometry) in the import worker |
| `src/App.tsx` | parses glTF with GLTFLoader on the main thread before the import worker welds it |

The typed-array weld and the import worker (lane B, Task 9) are done: STL is read and welded
without three (`src/core/import/stl.ts`, `weld.ts`). `src/goldens/fixtures.ts` reaches three only
through `state/import`.

Everything else, including `src/state/transform.ts`, `src/core/**` and `src/editing/**`, is
three-free (`src/core/imports.test.ts` enforces core/editing).

### 11. Feedback, errors and forgiveness (Task 12)

**Undo toasts** (`editing/toast.ts`, `components/UndoToast.tsx`). Clear all zones, Clear manual edits
and Clear selection (with a selection) run at once — no confirm dialog — and show
"<what was cleared> · Undo" for 6 s (`UNDO_TOAST_MS`) in an always-present polite live region
(`role="status"`, `aria-live="polite"`), bottom centre of the viewport (top on tablets while a
mode's bar is at the bottom). The countdown pauses while hovered or focused. Undo restores in one
step: a history clear undoes that history step; a selection clear puts the ids back. The toast
closes as soon as its Undo would undo something else (`toastAlive`: the scene moved on, or the
mode / object changed, or something was selected again, for a selection). The status line is a polite live region too (`role="status"`). Style: surface background, 1 px `--line-strong`
hairline, 2 px radius, no shadow, 12 px text, Undo as a plain button (≥ 24 px tall).

| Action | Toast (en) | zh-Hant | ja |
|---|---|---|---|
| Clear all zones | No-support zones cleared. | 已清除免支撐區。 | サポート禁止エリアを消去しました。 |
| Clear manual edits | Manual edits cleared; automatic contacts restored. | (existing key) | (existing key) |
| Clear selection | Selection of {n} supports cleared. | 已取消選取 {n} 個支撐。 | サポート {n} 本の選択を解除しました。 |

**Error messages** (`editing/errors.ts`): every failure says what happened, then what to do next.
Errors carry a code (`CodedError`; the import module's English messages, the worker crash and
timeouts are recognised by `errorCode`) so the line is translated; the raw message is shown only
inside the generic message of an unknown error. Codes (`ERROR_CODES`, `editing/errors.ts`):
`non-finite`, `no-mesh` (also a well-formed STL with no triangles), `file-type`, `bad-stl` (a
damaged STL: truncated, or its size does not match its triangles), `too-large` and
`out-of-memory` (with `{n}` and `{limit}`: the import budget refusals of `core/budget.ts`),
`plate-full` (with `{n}` and `{limit}`: the plate would pass the refusal limit), `timeout`,
`worker-stopped` (a crashed, restarted or unavailable worker; a crashed worker is replaced on the
next request, so the next step is to retry, never to reload the page, which would lose the
unsaved scene), `unknown`; jobs (`ERROR_CONTEXTS`): import, place, build, check, export. Worker
failures reach these codes through `workers/jobErrors.ts` (`codedJobError`). Example: "Export failed ({error}). Nothing
was saved; try again, or export one object at a time."

**Forgiving number fields** (`editing/numberInput.ts`): full-width input is folded (NFKC); "2", "2.5", "2mm", "2 mm", "2,5" (decimal
comma), "45°", "30 %" are read as numbers; values outside a setting's limits are clamped, never
rejected; text that is not a number leaves the value as it was. A value inside the limits applies
as it is typed; blur or Enter applies the clamped value and tidies the text; Esc puts back the value the field had on focus or was last entered with Enter;
Arrow Up / Down step by the field's step.

**Hover hints**: every tool button, slider and setting has a hint shown on hover (`title`) and read
as its accessible description (`aria-description`); setting option buttons sit in a
`role="group"` that carries the setting's hint. Overhang angle and Ridge angle say what lower and
higher values do.

**Hit areas**: every viewport tool control is at least 24 px tall (sliders 24 px; buttons ≥ 28 px).

---

<a id="2026-10-21-support-selection"></a>

## 2026-10-21 — Support Selection (Step 1) Implementation Plan

*Was `docs/superpowers/plans/2026-10-21-support-selection.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In Support Edit Mode, select supports by click or brush, then Delete exactly those (one undo step), with clear red feedback and no key+drag.

**Architecture:** Exact deletions get their own per-object list (`deleted`) composed alongside today's radius markers. Selection is App view state (a `Set` of contact IDs of the active object) driven by pure helpers in `src/supports/selection.ts`; the viewport reports clicks and brush strokes, and draws selected/preview support bodies from the shared support geometry (the `SupportHighlight` approach already in `ObjectViewport.tsx`).

**Tech Stack:** React 18, @react-three/fiber + drei, three-mesh-bvh, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-21-support-selection-design.md`

### Global Constraints

- Plain words on every control; EN, zh-Hant and ja strings in `src/i18n.ts` for every new UI string (UI says object / 物件 / オブジェクト, never unit).
- No key held while dragging; no right-drag. Shift/Ctrl+click, Delete key, Esc are optional shortcuts only.
- Selected colour `#7f0019` solid; previews the same red see-through (`PREVIEW.remove` in `ObjectViewport.tsx`).
- Brush size: 0.5–10 mm, step 0.5, default 2 mm; view state, never written to support settings.
- Styling with existing tokens/classes in `src/styles.css` (mixo-app-style); no new colours beyond the above.
- Right-click a support keeps today's radius removal; `suppressed` semantics unchanged (add-on parity).
- Commits are local; never push without the owner saying so.

### Review Focus

1. A brush stroke released outside the canvas (pointer up over a panel) — stroke must end and camera rotation must work again. Pinned in Task 5, Step 4.
2. Undo right after Delete — supports come back, selection stays empty, no stale red. Pinned in Task 3, Step 1 (`pruneSelection`) and Task 5, Step 4.
3. Adding a manual support next to a deleted auto one — it must stay visible. Pinned in Task 1, Step 1.
4. Spacing change after deleting — each deleted spot hides at most one auto contact. Pinned in Task 1, Step 1.
5. Brush stroke starting on a non-active object, or on another object's supports — must rotate, not paint. Pinned in Task 5, Step 4.
6. Brushing one side of a thin wall — tips on the far side must not be selected. Pinned in Task 2, Step 1 (`facing`).

---

#### Task 1: Exact deletions in the scene model

**Files:**
- Modify: `src/analysis/placement.ts:86-103` (`composeContacts`)
- Modify: `src/state/project.ts` (PrintUnit, SceneCommand, reducer, clone at ~172)
- Modify: `src/state/import.ts:126`
- Modify: `src/supports/unitSupports.ts:24-28`
- Modify: `src/App.tsx:403` (Clear manual edits condition), `src/App.tsx:572-576` (counts)
- Test: `src/analysis/placement.test.ts`, `src/state/project.test.ts`

**Interfaces:**
- Produces: `PrintUnit.deleted: string[]`; command `{ type: 'deletion/add'; unitId: string; pointIds: string[] }`;
  `composeContacts(auto, manual, suppressed, eraseRadius = 0, deleted: readonly string[] = [], matchRadius = 0): SupportPoint[]`.

- [ ] **Step 1: Write the failing tests** in `placement.test.ts`, new `describe('exact deletions')` using the existing `point(x, id)` helper shape:

```ts
it('hides exactly the deleted automatic contact, never its neighbours or manual ones', () => {
  const auto = [point(0), point(1), point(3)];
  const manual = [{ ...point(0.5, 'manual-a') }];
  expect(composeContacts(auto, manual, [], 1.5, ['auto-0_100_0'], 1).map((p) => p.id))
    .toEqual(['auto-100_100_0', 'auto-300_100_0', 'manual-a']);
});
it('after spots move, hides only the single nearest automatic contact within the match radius', () => {
  const moved = [point(0.3), point(0.6), point(3)];
  expect(composeContacts(moved, [], [], 0, ['auto-0_100_0'], 1).map((p) => p.id))
    .toEqual(['auto-60_100_0', 'auto-300_100_0']);
  expect(composeContacts([point(2)], [], [], 0, ['auto-0_100_0'], 1).map((p) => p.id)).toEqual(['auto-200_100_0']);
});
```

and in `project.test.ts`:

```ts
it('records exact deletions once and clears them with manual edits', () => {
  // start from the existing fixture scene with unit-a
  const deleted = reduceScene(scene, { type: 'deletion/add', unitId: 'unit-a', pointIds: ['auto-a', 'auto-b', 'auto-a'] });
  expect(deleted.units[0]!.deleted).toEqual(['auto-a', 'auto-b']);
  expect(reduceScene(deleted, { type: 'supports/clear-manual', unitId: 'unit-a' }).units[0]!.deleted).toEqual([]);
});
```

- [ ] **Step 2: Run** `npx vitest run src/analysis/placement.test.ts src/state/project.test.ts` — Expected: FAIL (`deleted` unknown / wrong ids).

- [ ] **Step 3: Implement.** `composeContacts`: after today's filter, for each `deleted` id: if an auto contact has that id, drop it; otherwise use `positionFromId(id)` and drop the nearest remaining auto contact with distance `< matchRadius` (none if farther). Manual contacts are never dropped by `deleted`. Update the doc comment. Reducer: `deletion/add` appends unseen ids; `supports/clear-manual` also sets `deleted: []`; clone copies `deleted`; import sets `deleted: []`. `unitContacts` passes `unit.deleted` and `settings.scatterSpacing / 2`. App: Clear manual edits enabled when `deleted.length` too; counts become `auto = unitContacts(activeUnit).filter((c) => !c.id.startsWith('manual-')).length`, `removed = suppressed.length + deleted.length`.

- [ ] **Step 4: Run** `npx vitest run && npx tsc --noEmit -p .` — Expected: all pass, TSC clean.

- [ ] **Step 5: Commit** `git commit -m "feat: exact support deletions that never take neighbours"` (files above).

---

#### Task 2: Selection helpers

**Files:**
- Create: `src/supports/selection.ts`
- Test: `src/supports/selection.test.ts`

**Interfaces:**
- Consumes: `SupportContact` (`src/supports/mesh.ts`), `PrintUnit`, `SceneCommand` (Task 1's `deletion/add`).
- Produces:
  - `type BrushMode = 'select' | 'unselect'`
  - `contactsInBrush(contacts: readonly SupportContact[], center: Vector, radius: number, facing?: Vector): string[]` — `facing` is the unit-local direction from the surface toward the camera; when given, contacts whose normal has `dot(normal, facing) <= 0` are skipped, so the brush never reaches through a thin wall to the far side (research: PrusaSlicer's sphere brush painting hidden faces is a known complaint)
  - `paintSelection(selected: ReadonlySet<string>, ids: readonly string[], mode: BrushMode): ReadonlySet<string>` (returns the same Set when nothing changes, so React skips renders)
  - `toggleSelection(selected: ReadonlySet<string>, id: string): ReadonlySet<string>`
  - `pruneSelection(selected: ReadonlySet<string>, contacts: readonly SupportContact[]): ReadonlySet<string>` (same Set when nothing dropped)
  - `deleteCommands(unit: PrintUnit, ids: readonly string[]): SceneCommand[]` — `manual/remove` per manual id, one `deletion/add` with all other ids; `[]` for no ids.

- [ ] **Step 1: Write the failing tests**: `contactsInBrush` returns ids with distance `<= radius` (boundary included); with `facing` `[0,-1,0]`, a contact at the same spot with normal `[0,1,0]` (far side of a wall) is skipped and one with normal `[0,-1,0]` is kept; `paintSelection` select adds / unselect removes / unchanged returns identical reference (`toBe`); `toggleSelection` adds then removes; `pruneSelection` drops missing ids and keeps identity when none missing; `deleteCommands` on a unit with manual `manual-a` and ids `['manual-a','auto-x','auto-y']` equals `[{ type: 'manual/remove', unitId, pointId: 'manual-a' }, { type: 'deletion/add', unitId, pointIds: ['auto-x','auto-y'] }]`.
- [ ] **Step 2: Run** `npx vitest run src/supports/selection.test.ts` — Expected: FAIL (module missing).
- [ ] **Step 3: Implement** the five functions in `src/supports/selection.ts`.
- [ ] **Step 4: Run** `npx vitest run src/supports/selection.test.ts` — Expected: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: support selection helpers"`.

---

#### Task 3: Edit Mode tools, selection state and Delete in App

**Files:**
- Modify: `src/App.tsx` (state near line 89, handlers 456-500, key handler ~540-565, edit bar ~710-720, ObjectViewport props ~684)
- Modify: `src/components/ObjectViewport.tsx` (props interface only, wiring in Task 4/5)
- Modify: `src/i18n.ts`, `src/styles.css`

**Interfaces:**
- Consumes: Task 2 helpers.
- Produces (new `ObjectViewportProps`, replacing `tapRemoves`):
  - `editTool: 'add' | 'select'`
  - `brush?: { radius: number; mode: BrushMode }` — present only when Select → Brush is on
  - `selection: ReadonlySet<string>` — contact ids of the active object
  - `onToggleContact: (unitId: string, contactId: string) => void`
  - `onPaint: (unitId: string, center: Vector, facing: Vector, mode: BrushMode) => void` — `center` in unit-local space; `facing` = unit-local unit vector from `center` toward the camera

- [ ] **Step 1: Write the failing test** in `selection.test.ts`: `pruneSelection(new Set(['auto-x']), [])` is empty — models "undo after Delete leaves no stale selection" (Review Focus 2). Run it — Expected: PASS already if Task 2 is right; keep it as the regression pin.
- [ ] **Step 2: Implement App state**: `editTool` (default `'add'`), `selectStyle: 'click' | 'brush'` (default `'click'`), `brushMode` (default `'select'`), `brushRadius` (default 2), `selection` (`ReadonlySet<string>`, default empty). Remove `tapRemoves` and its props/buttons. Effects: clear selection when edit mode turns off or `activeUnitId` changes; `setSelection((s) => pruneSelection(s, unitContacts(activeUnit)))` whenever the active unit's contacts change. Handlers: `onToggleContact` → `toggleSelection`; `onPaint` → `paintSelection(s, contactsInBrush(unitContacts(unit), center, brushRadius, facing), mode)`; `deleteSelected` → one `batch` of `deleteCommands(activeUnit, [...selection])`, empty the selection, status `'Deleted 1 support.' / 'Deleted {n} supports.'`.
- [ ] **Step 3: Keys**: in edit mode `Delete`/`Backspace` with a selection → `deleteSelected`; `Escape` with a selection → clear selection, else today's leave-edit behaviour (`Enter` unchanged).
- [ ] **Step 4: Edit bar** (spec layout): segmented `Add supports | Select supports`; when Select: segmented `Click | Brush`; when Brush: segmented `Select | Unselect` and a range input `Brush size` (0.5–10, step 0.5) with the mm value; when selection non-empty: `{n} selected` + `Delete` (primary) + `Clear selection`. Badge text: Add → existing; Select/Click → `Click to select`; Select/Brush → `Brush: drag on the model to select`. Add i18n strings (EN/zh-Hant/ja) for every new label, status and badge text. Wrap the bar onto two rows with existing flex rules (narrow layout already moves it to the bottom).
- [ ] **Step 5: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 6: Commit** `git commit -m "feat: Edit Mode select tool, selection and Delete"`.

---

#### Task 4: Click select and red bodies in the viewport

**Files:**
- Modify: `src/components/ObjectViewport.tsx` (`UnitObject`, `SupportHighlight`, `EditPreview`)

**Interfaces:**
- Consumes: Task 3 props.
- Produces: `SupportBodies({ supports, geometry, ids, opacity }: { supports: GeneratedSupportMesh; geometry: THREE.BufferGeometry; ids: readonly string[]; opacity: number })` — generalises today's `SupportHighlight` (solid when `opacity === 1`, see-through otherwise, `depthWrite={false}` when see-through).

- [ ] **Step 1: Refactor** `SupportHighlight` into `SupportBodies`; today's remove hover keeps using it (ids from the Erase radius, opacity 1).
- [ ] **Step 2: Select tool, Click style**: left click on a support of the active object → `onToggleContact` (stopPropagation); click on the model → status hint only (no add). Hover on a support → `SupportBodies` see-through for that one id. Selected ids → `SupportBodies` solid, always drawn while editing. Add tool unchanged; right-click removal unchanged in both tools. The tips view (`tipsOf`) keeps working because picking uses the shown mesh.
- [ ] **Step 3: Browser check** (`npx vite --port 5199`, fresh browser context; import `.playwright-mcp/knot.stl`, Generate, Edit Mode → Select supports): click 3 supports → 3 solid red, count "3 selected"; click one again → 2; Delete → gone, Ctrl+Z → back with no red. Expected: as described; screenshot to `.playwright-mcp/sel-click.png`.
- [ ] **Step 4: Commit** `git commit -m "feat: click to select supports, selected bodies in red"`.

---

#### Task 5: Brush select

**Files:**
- Modify: `src/components/ObjectViewport.tsx` (`UnitObject`, `ObjectViewport`, `EditPreview`)
- Modify: `src/styles.css` (brush cursor)

**Interfaces:**
- Consumes: Task 3 `brush`, `onPaint`; Task 4 `SupportBodies`; `contactsInBrush` (Task 2) for the preview.

- [ ] **Step 1: Ring and preview**: with `brush` set, hovering the active object's model or supports sets hover `{ point, normal }` (unit-local); `EditPreview` draws the ring at `brush.radius` (red `PREVIEW.remove` for select, `PREVIEW.ring` grey for unselect, no cone); `SupportBodies` see-through for `contactsInBrush(contacts, point, radius, facing)` (facing = camera position in unit-local space minus point, normalised). The viewport section gets class `viewport--brush` while the pointer is over the active object (from hover state via a callback prop or CSS on canvas), whose `cursor` is a brush-icon SVG data URI with a crosshair fallback.
- [ ] **Step 2: Stroke**: `onPointerDown` (left button) on the active object's model or support mesh while `brush` is set → stopPropagation, `controls.enabled = false` (controls from `useThree((s) => s.controls)`), `onPaint(unit.id, localPoint, facing, brush.mode)`; `onPointerMove` while painting → `onPaint` again; a `window` `pointerup` listener ends the stroke and sets `controls.enabled = true`. Clicks during brush style do not toggle or add. Pointer down elsewhere (empty space, other objects) does nothing special, so OrbitControls rotates.
- [ ] **Step 3: Verify listener order**: r3f's canvas listeners are registered before drei OrbitControls mounts, so disabling controls in the mesh `onPointerDown` must stop that drag's rotation. Browser check: brush on, drag across the model — camera must not move. If it does rotate, disable controls on hover-enter of the active object instead (re-enable on hover-leave when not painting) and re-check.
- [ ] **Step 4: Browser check of the Review Focus pins**: (a) drag from the model, release over the right panel → stroke ends, then dragging empty space rotates; (b) drag starting on a non-active object → rotates, no selection change; (c) paint, Delete, Ctrl+Z → supports back, no red; (d) Unselect brush over painted area → those turn back. Expected: all four as described; screenshots `.playwright-mcp/sel-brush-*.png`.
- [ ] **Step 5: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 6: Commit** `git commit -m "feat: brush select supports in Edit Mode"`.

---

#### Task 6: Fit view button and wrap-up

**Files:**
- Modify: `src/components/ObjectViewport.tsx` (`BottomCamera` → `ViewCamera`)
- Modify: `src/App.tsx` (`.viewport-view` group), `src/i18n.ts`
- Modify: `docs/HANDOFF.md` (if it lists features), memory `handoff.md`

**Interfaces:**
- Produces: prop `viewRequest?: { kind: 'bottom' | 'fit'; seq: number }` replacing `bottomView`; `fit` frames the same unit ids at the current viewing direction (camera stays on its side of the target, distance from the bounding sphere as `BottomCamera` computes it).

- [ ] **Step 1: Implement** `ViewCamera` handling both kinds; App sends `{ kind: 'fit' }` from a new `Fit view` button (title: `Frame the selection from the current angle`) placed between `Tips only` and `Bottom view`; i18n EN/zh-Hant/ja.
- [ ] **Step 2: Browser check**: zoom in until the model fills the viewport, press Fit view → whole selection visible, same angle. Bottom view still works.
- [ ] **Step 3: Run** `npx tsc --noEmit -p . && npx vitest run && npm run build` — Expected: clean, all pass, build succeeds.
- [ ] **Step 4: Commit** `git commit -m "feat: Fit view button"`; update memory handoff.

---

#### Task 7: Style pass against mixo-app-style

Owner asked the UI follow the skill (`~/.claude/skills/mixo-app-style/SKILL.md`, commit bbf53ee, section "3D viewport tools and modes" and "Colour roles").

**Files:**
- Modify: `src/styles.css`, `src/App.tsx` (class names only), `src/components/ObjectViewport.tsx` (mark colours only if off)

- [ ] **Step 1: Audit** every control added or moved on this branch (Edit Mode bar, badge, frame, `.viewport-view` group, Tips only/Bottom view/Fit view, Delete/Clear/Done, Size slider) against the skill: red only for the one primary per view, pressed toggle and chosen segment = ink fill, destructive = `.danger` outline, 22px rows, 11.5px text, 2px radius, no shadows, words not icons. Write the findings list into the task report.
- [ ] **Step 2: Fix** each finding with existing tokens (`tokens.css` values only; add a token only if the skill has it).
- [ ] **Step 3: Browser check** at 1440px, 1000px and 600px widths in Edit Mode (both tools, Drag over on, 3 selected): nothing overlaps or clips in en, zh-Hant, ja. Screenshots `.playwright-mcp/style-*.png`.
- [ ] **Step 4: Run** `npx tsc --noEmit -p . && npx vitest run` — Expected: clean, all pass.
- [ ] **Step 5: Commit** `git commit -m "style: Edit Mode and view controls follow mixo-app-style"`.

---

<a id="2026-10-21-support-selection-design"></a>

## 2026-10-21 — Support selection in Support Edit Mode — design

*Was `docs/superpowers/specs/2026-10-21-support-selection-design.md`.*

Date: 2026-10-21. Owner decisions from the 2026-10-21 session (015Ni9eJEgk682CcmgrgzSM4).

### Problem

Removing supports one click at a time is slow and error-prone:

- Right-click a support removes every contact within Erase radius (1.5 mm default, spacing 2 mm),
  so one click often removes 2–3 supports. Blender parity (`remove_manual_near`).
- A removal marker keeps hiding every contact within Erase radius of the removed spot on every
  compose, manual ones included: a support added next to a removed one silently disappears.

### Goal

Select first, act second. Selecting never changes the scene; Delete is a separate button.
Step 1 (this spec): select (click or brush), Delete, Clear. Step 2 (later spec): an Adjust panel
that overrides a few settings for the selection only.

### Rules (owner)

1. Plain-language UI for lay users. Words on buttons, no Blender-style mode icons.
2. Never require a key held while dragging. Shift/Ctrl+click, Delete key and Esc are optional
   shortcuts; every action also has a visible button.
3. No right-drag for anything.
4. Where a drag starts decides what it does: on the active object's model or supports with the
   brush on, it paints; on empty space, it rotates the camera as always.

### Edit Mode bar

```
[ Add supports | Select supports ]   (Select:) [ Click | Drag over ]  (Drag over:) [ Select | Unselect ]  Size ●── 2 mm
{n} selected  [ Delete ] [ Clear selection ]                                                          [ Done ]
```

- **Add supports**: click the model to add (today's default). Replaces today's Add/Remove toggle;
  the touch-only "tap removes" mode goes away (touch users select and press Delete).
- **Select supports → Click**: click a support to select it, click again to unselect. Clicking
  more supports adds them; no Shift needed. Shift/Ctrl+click behave the same.
- **Select supports → Drag over**: drag from the model sweeps a selection ring over supports. *Select* adds what the brush touches;
  *Unselect* removes it. The brush reaches only supports on the side facing the camera, never
  through a thin wall to the far side (PrusaSlicer's sphere brush painting hidden faces is a known
  complaint). Size slider 0.5–10 mm, step 0.5, default 2 mm (view state, not a
  support setting, so the add-on's Erase radius is untouched).
- **{n} selected / Delete / Clear selection** show only while something is selected and work in
  every tool. Delete is a `.danger` outline; Done is the mode's one primary (mixo-app-style).
- Right-click a support keeps today's behaviour (removes within Erase radius) in every tool.

### Feedback

- Selected supports: the whole body (tip, neck, pillar) solid red `#7f0019`. In the tips view only
  the tip, since only tips are drawn.
- Drag over on, pointer over the active object: a ring on the surface sized to the brush follows the
  pointer (red for Select, grey for Unselect), the supports inside it preview in see-through red,
  and the cursor shows a brush icon. Over empty space: normal cursor, no ring (a drag rotates).
- Click style: the support under the pointer previews see-through red.
- The Edit Mode badge names the tool: "Click supports to select" / "Drag over supports to select".
- The count updates live while painting.

### Deleting exactly

- Delete removes exactly the selected supports: manual ones from the manual list, automatic ones
  into a new per-object `deleted` list. One undo step per Delete. The selection empties; the tool
  stays as it was (cleaning is usually several areas in a row).
- A `deleted` entry hides the automatic contact with that ID. After a regeneration that moved the
  spots (ID gone), it hides the single nearest automatic contact within half the support spacing,
  so a deleted support stays deleted without taking neighbours. It never hides manual contacts.
- Today's radius `suppressed` markers stay as they are (right-click parity with the add-on).
- Clear manual edits also clears `deleted`.

### Selection lifetime

Selection is view state of the active object in Edit Mode (not in history). It empties on leaving
Edit Mode, on changing the active object and after Delete; IDs that no longer exist (undo,
regeneration) drop out. Esc clears the selection first, and leaves Edit Mode when nothing is
selected.

### Camera

No view cube (owner: lay users). A **Fit view** button joins **Tips only** and **Bottom view** at
the viewport's top right: it frames the selected objects from the current angle, for when the model
fills the screen and there is no empty space to drag.

### Naming (owner, 2026-10-21)

Selection never says "brush" or "paint": those words belong to the later **No-support zones**
mode (its own blue-framed mode for painting the surface, separate spec). Selection words:
Add supports / Select supports, Click / Drag over, Select / Unselect, Size
(zh-Hant 新增支撐 / 選取支撐, 點選 / 拖曳選取, 選取 / 取消選取, 範圍;
ja サポート追加 / サポート選択, クリック / なぞって選択, 選択 / 選択解除, 範囲).

### Out of scope

Adjust panel (step 2), box select, clipping slider, add-on changes.

---

<a id="2026-10-23-reusable-surface-brush"></a>

## 2026-10-23 — Reusable Surface Brush Implementation Plan

*Was `docs/superpowers/plans/2026-10-23-reusable-surface-brush.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse model-surface painting and overlays for zones and dental permits without sharing their business rules.

**Architecture:** A neutral surface-stamp helper copies unit-local hits into ordered strokes. Zone and dental modes retain separate stamp kinds, reducers, colors, and generation policies; the shared UI receives a profile rather than a scene command.

**Tech Stack:** TypeScript, React, React Three Fiber, Vitest.

---

#### Task 1: Pure shared stamp helper

**Files:** Create `src/editing/surfaceBrush.ts`; create `src/editing/surfaceBrush.test.ts`.

- [ ] Write a failing test:

```ts
expect(appendSurfaceStamps('allow', 2, [{ point: [1, 2, 3], normal: [0, -1, 0] }]))
  .toEqual([{ center: [1, 2, 3], normal: [0, -1, 0], radius: 2, kind: 'allow' }]);
```

- [ ] Run `npm test -- --run src/editing/surfaceBrush.test.ts`; expect an import failure.
- [ ] Implement `SurfaceHit`, generic `SurfaceStamp<K>`, and `appendSurfaceStamps<K>(kind, radius, hits)`. Reject a non-positive radius; copy arrays so a pointer buffer cannot mutate persisted data.
- [ ] Re-run the test; expect pass. Commit `feat(editing): add reusable surface stamp contract`.

#### Task 2: Reuse the contract in zones without behavior change

**Files:** Modify `src/core/supports/zones.ts`; modify `src/supports/zones.test.ts`.

- [ ] Write a failing test asserting a `paint` stroke converted by `appendSurfaceStamps` gives the same `zonedAt` answer as a literal `ZoneStamp`.
- [ ] Run `npm test -- --run src/supports/zones.test.ts`; expect failure until the generic type is accepted.
- [ ] Accept `SurfaceStamp<'paint' | 'erase'>` where `ZoneStamp` is consumed, without changing the ordered last-stamp-wins evaluator.
- [ ] Re-run focused zones and stamp tests; expect pass. Commit `refactor(zones): use shared surface stamp contract`.

#### Task 3: Dental profile uses the same contract, not zone commands

**Files:** Modify `src/core/analysis/dentalPolicy.ts`; modify `src/state/project.ts`; modify `src/state/project.test.ts`.

- [ ] Write a failing reducer test that a dental `allow` stroke appends to `unit.dental.stamps` while `unit.zones` remains unchanged.
- [ ] Run `npm test -- --run src/state/project.test.ts`; expect failure if the generic stamp type does not assign to dental stamps.
- [ ] Type `DentalAllowStamp` as a specialized surface stamp and preserve `dental/stamps/add` as the only dental writer.
- [ ] Re-run the focused test; expect pass. Commit `refactor(dental): share surface stamp contract`.

#### Task 4: Profiled UI extraction at the dental-flow stage

**Files:** Create `src/components/SurfaceBrushBar.tsx`; modify `src/components/ZonesBar.tsx`; modify `src/App.tsx`; modify `src/components/viewport/supportLayers.tsx`.

- [ ] Write a component test that the zone profile renders Paint, Erase, brush size, Clear, and Done; add a dental profile test that renders Paint, Erase, brush size, and Continue.
- [ ] Run the component test; expect an import failure for `SurfaceBrushBar`.
- [ ] Implement a profile prop with labels, tool values, optional Clear action, completion action, and surface colour. Retain the existing Mixo compact bar, blue zone content mark, and orbit-on-empty-space behavior. Dental's profile emits only dental events.
- [ ] Re-run focused UI tests and then `npm test; npm run build`; expect all pass. Commit `feat(dental): reuse surface brush UI`.

#### Task 5: Verification and trail

**Files:** Modify `C:/Users/DCT/.claude/orchestrate/dental-auto-generate/trail/handoff.md`; modify `C:/Users/DCT/.claude/orchestrate/dental-auto-generate/trail/decisions.tsv`.

- [ ] Run `npm test; npm run build; git diff --check`; expect no regression.
- [ ] Record commit SHAs, test totals, build result, screenshot/performance evidence, and the local-only release status. Do not commit or upload `Aligner.stl`.

---

<a id="2026-10-23-surface-brush-design"></a>

## 2026-10-23 — Reusable surface brush design

*Was `docs/superpowers/specs/2026-10-23-surface-brush-design.md`.*

### Purpose

Reuse the no-support-zone surface painting machinery for the dental permitted-area step without
merging their opposite policies. This supports the approved dental sequence: orient, approve or
adjust the permitted area with Paint/Erase, then generate.

### Boundary

`editing/surfaceBrush` will own only viewport mechanics: model-surface ray hits, stroke sampling,
unit-local stamp creation, hover ring state, and incremental overlay invalidation. Its input is a
small profile:

- brush labels and the two tool values;
- radius and active tool;
- a hit-to-unit-local conversion supplied by the viewport;
- `commit(stamps)` and `clear()` supplied by the owning mode;
- overlay colour/material supplied by the owning mode.

The module will not decide what a stamp means, determine eligibility, or create supports.

### Consumers

No-support zones retain `paint | erase` stamps and `zones/add`; their overlay remains the existing
deep-blue denied-surface mark. Dental retains `allow | erase` stamps and `dental/stamps/add`; its
overlay uses one distinct permitted-surface colour and a glowing lower-boundary line. Both stamps
remain ordered, unit-local, undoable scene data.

### UI

The common compact Mixo tool bar contains Paint / Erase, brush size, Undo, optional Clear, and
Done. It uses the existing mode frame and badge. Dental's one red primary action is Done/Continue;
surface colour is content rather than a second UI accent. The existing zone bar becomes a thin
profile of this shared bar rather than a duplicated interaction implementation.

### Safety and tests

Each mode accepts a stroke only when it begins on the active model; empty-space drag remains orbit.
Changing mode cancels pending stroke work and preview. Tests cover shared stroke conversion,
unit-local coordinates after a model transform, ordered erase semantics, zone regression, and a
dental profile that cannot write a zone command.

### Rollout

First extract the pure interaction and overlay interfaces without changing zone behaviour. Then
switch zones to the profile. Finally add the dental profile and three-stage dental UI. Existing
zone tests and the full suite must remain green at each local commit.

---

<a id="2026-10-24-dental-rework"></a>

## 2026-10-24 — Dental support rework: geometry, orientation, and three-step review

*Was `docs/superpowers/plans/2026-10-24-dental-rework.md`.*

Status: **implementation authorized on 2026-10-24; follow phase gates**. The shipped baseline was `main` at `02dbbf2` (verify HEAD before work). This report supersedes the prior release-ready assessment: passing synthetic tests and a browser walk did not prove anatomical placement quality.

### Operator intent and retained evidence

The STL is an aligner shell. Supports may attach only to the approved **inner/lower, plate-facing surface**, never to tooth/exterior/occlusal faces above the opening. The lower surface should be broadly covered, including regions missed by a simple overhang ray. A green mask is a review of that actual permission, not a decorative approximation.

Cloud-accessible owner-approved reference copies are in `docs/dental-reference/` (see its README). The original, unredacted evidence is still in the private local folder `C:\Users\DCT\.claude\orchestrate\dental-auto-generate\artifacts\reported-defects-2026-10-24\`. This table names the private originals:

| File | Reported failure / reference |
| --- | --- |
| `01-wrong-exterior-contact-side.png` | Support attached to the upper/exterior region, circled in red. |
| `02-wrong-exterior-contact-occlusal.png` | Another exterior/tooth-side contact, circled in red. |
| `03-mask-spill-and-missing-area.png` | Green permission spills onto teeth and leaves holes in the desired inner/lower area. |
| `04-annotated-desired-bottom-area.png` | Blue annotation indicates the intended broad inner U-shaped permission region. |
| `05-intended-pose-tilt-reference.png` | New side-view sketch: the intended printing pose is deliberately tilted rather than opening-straight-down. |
| `06-human-traced-nonplanar-inner-outer-trim.png` | Human-highlighted paired trim contours. Their height varies around the arch and rises near the posterior ends; they are not a single flat ring. |
| `reference-aligner-original-pose.stl` | Original correctly oriented sample, copied under a neutral filename. SHA-256 `78DABB0775E24F115A740BCEE7214D2C0253300487B9999906E6834CAA1DCABD`. |

The owner later explicitly approved publishing a neutral-named, neutral-header **patient-specific** STL and redacted reference screenshots to the public repository for cloud work. Only the prepared copies in `docs/dental-reference/` are authorized; the original STL with identifying header/filename and the unredacted screenshot remain private. Do not expose original identifiers in code, logs, PRs, or additional uploads.

### Current implementation and diagnosis boundaries

Read `src/core/analysis/dental.ts`, `dentalPolicy.ts`, `src/supports/jobRunner.ts`, `src/components/useRegenerate.ts`, `src/supports/landing.ts`, `src/components/DentalBar.tsx`, `src/editing/session.ts`, `src/editing/commands.ts`, and `src/App.tsx` before changing behavior.

- Orientation currently uses the least-variance PCA axis, compares area in two 14% terminal bands, then picks the lower-material end as the opening. The selected opening controls both rotation and the opening-ray gate. This is a heuristic, not proof that an anatomical inner surface was found. A wrong opening direction can make a later visibility check faithfully select the wrong side.
- A `lower-edge-loop` certifies that two sharp terminal loops were found; it does **not** certify which surface is inside. The 96×96 `visibilityMask` is formed from projected mesh depth wherever any surface is visible, not an independently segmented trim footprint. The exact raycaster accepts the first hit from its chosen opening side. Its predicate can therefore be precise yet wrong when the chosen side or footprint is wrong.
- Both green vertices and candidate contacts call `dentalSupportAllowedAt`, but they use different samples (vertices versus triangle/interior contacts), and support landing/building happens later. Shared code is not enough to establish a pixel-perfect mask or final-tip safety invariant. Do not assert a single root cause from screenshots alone: reproduce and log the world/local transform, selected axis and rim, mask, candidate contact, landed tip, and final mesh contact for each reported failure.
- UI currently combines “Use detected orientation” with advancing to the area stage, has “Keep manual orientation” as a separate advance action, and shows Done in both stages. The requested flow separates “rotate for me” from “Next”. There is currently no tips-only intermediate stage.

#### Read-only orientation probe, 2026-10-24

The reproducible local diagnostic `scripts/probe-dental-orientation.ts` imports the retained reference through the app's STL parser and uses the current `proposeDentalOrientation`. With seed `20261024`, **12/12** arbitrary Euler rotations returned a proposal; the maximum difference between the rotated original opening vector and the detected one was below `0.000001°`. Thus the current *opening-axis detector is rotation-equivariant on this one sample*. This does not prove the axis is anatomically correct or that it generalizes to a different STL.

The reference's detected opening vector is approximately `[0.0371, -0.6889, -0.7239]`, **46.46°** from plate-down. This is consistent with the operator's explanation that the supplied pose includes an intentional tilt. The existing `rotationToPlateDown` removes it. A provisional arch-front estimate from the projected full-mesh footprint (PCA sagittal axis, signed by central bridge occupancy at the two ends) was also rotation-equivariant on 12/12 poses, below `0.000001°` numerical difference. For this mesh its central bridge occupancy was `138` versus `13` cells; its inferred front direction makes **2.78°** with the opposite of the reference's downhill-in-arch direction. Those numbers justify an experimental calibrated-tilt path, **not** a claim that all aligners share one ideal print angle.

Critical correction: the current `lower-edge-loop` returned for this 67.5 × 50.2 mm projected shell has 29 points spanning only **0.83 × 0.35 mm**. That is a tiny local feature, not the full trim boundary or “largest edge.” The detector's `boundaryKind` flag and confidence must not authorize support placement on this evidence. This is a likely contributor to the mask defect, pending contact-level reproduction. Do not reuse this loop as the front/trim reference.

The operator's sixth image clarifies the intended geometric object: two *paired, non-planar* trim contours around the U-shaped shell, with posterior ends rising relative to the front. This supports—but does not alone prove—the hypothesis that the present sharp-loop finder misses the full trim. `traceLowerFeatureLoop` admits only locally sharp edges (60° threshold), complete degree-2 graph cycles, then loops whose **mean** depth falls in a narrow terminal band, and chooses the smallest mean-radius pair. A height-varying trim can fail one or more of those assumptions, while a tiny unrelated closed feature can pass. An image cannot establish which exact filter rejected the real trim; instrument edge continuity, depth range, rejected components, and loop extents before changing code.

### Feasibility decision

This is realistic **without AI and entirely in the browser**, for a clearly defined class of aligner shells. The newly measured practical path is: retain the working opening-axis detector as a candidate, infer a signed front axis from the whole U-shaped footprint, align both axes to a canonical frame, then apply a calibrated tilt preset (about **46.5° on this reference**) with manual adjustment. A one-axis rotation alone leaves yaw/front ambiguous; “hard-coded tilt” must be around the detected side-to-side axis, in the correct sign, not a fixed world X rotation. A confidence failure falls back to manual pose rather than guessing. A fixed angle is a convenience preset, not the mathematically unique or clinically optimal pose for every STL.

The support-region problem is separate. Geometry must still identify a credible full trim boundary and classify the inner surface; the tiny loop currently selected is inadequate. The system may refuse low-confidence models and offer manual rotation/painting, but painting must not authorize tooth/exterior contacts. It cannot guarantee a unique correct anatomical answer for every arbitrary STL: symmetric or malformed shells can be ambiguous; holes, scans, attachments, and unusual trim lines can defeat any single heuristic. The product contract is “automatic proposal with confidence and safe refusal,” not “always knows.” No server or trained model is required; expensive geometry belongs in a cancellable Web Worker.

Published geometry-based dental model registration uses PCA only as an initial reference frame and then adds anatomical/shape cues; this supports the multi-cue approach, not a guarantee for aligners: [automatic dental arch reference frame](https://pmc.ncbi.nlm.nih.gov/articles/PMC5559304/), [automated dental landmark recognition](https://pmc.ncbi.nlm.nih.gov/articles/PMC8789266/). These papers study related dental models, not this app's sample; the app must establish its own empirical accuracy.

### Target workflow (proposed for user review)

1. **Step 1 — Orientation / 牙套方向.** Entry action is **牙套支撐生產**. Keep the imported pose visible and show the rotation gizmo. Two workflow buttons: **Auto orientation / 自動調整方向** and **Next / 下一步**. Auto orientation only changes the pose: identify opening and front, align a canonical arch frame, apply the validated tilt preset, then leave the gizmo available for manual adjustment. It must not advance, approve an area, create tips, or generate supports. The preset starts near the reference's 46.5° but remains adjustable; do not silently enforce one angle on different arches. Next uses the current (possibly manual) pose and advances. No “Done/完成” here. Esc/Back cancels or returns according to the existing editor convention, separately from the two primary workflow buttons. If either opening or front is inconclusive, retain the pose, explain briefly, and allow manual rotation + Next only after a safety check can establish an opening (otherwise block automatic generation).
2. **Step 2 — Support area / 支撐區域.** On entry, show the proposed permission overlay and a clear boundary; generate and show **tips only** (small contact markers, no pillars/raft/branches). Explain: “Support area is marked. Press Next to continue, or paint to adjust.” Provide large **Add area / 增加** and **Remove area / 移除** brush buttons. Say “Drag on the model to paint; drag empty space to rotate the view.” Keep tips synchronized with mask/brush edits, with cancellation or debounce; uncertain/unsafe contacts must never appear as valid tips. Show tip count and warning for uncovered/unsafe area. Next freezes or snapshots the accepted policy and proceeds; no “Done/完成” here. Reuse the existing generic surface-brush core, not a second painting engine.
3. **Step 3 — Generate/review.** After Next, build the full dental supports from the **same validated tip set** and accepted policy, then show final result with a final action/exit. A failure stays in the review flow and does not silently fall back to ordinary Generate. Back from this stage should preserve edits and allow correction. Exact last-step button wording is a UI implementation detail, but only this stage may say Done/完成.

The user's wording could also mean full support construction starts immediately on entering step 3 rather than requiring an extra Generate press. Default to immediate build on Step 2 Next, with a final review/Done at Step 3; confirm in the design review before implementation if that nuance matters.

### Implementation sequence and gates

#### 0. Reproduction and ground truth — required before changing heuristics

- [ ] Record exact imported pose and orientation-proposal metrics for the retained sample, plus fixed random SO(3) rotations (at least 100 seeded poses). Preserve the original pose as the **correct reference**, not as a training shortcut. Compare recovered opening direction against transformed reference and check that auto rotation makes it plate-down without an unwanted flip.
- [ ] Annotate representative mesh surface patches as “allowed inner,” “forbidden exterior/tooth,” or “uncertain.” Compare current mask and final support tips against those labels. The six owner-approved reference images are in Git; keep any *new* patient identifiers or unredacted source assets private. Source-control only non-identifying numeric assertions for further fixtures.
- [ ] Save a minimal local repro with detector axis/sign, rim-loop geometry, mask counts, candidate and landed contacts, and screenshots. Determine whether the circled pieces are actual support tips touching exterior surface, stray support bodies crossing it, stale output after rotation, or a combination. No geometry fix is accepted until this is separated.

#### 1. Orientation proposal: preserve opening recovery, add signed front and calibrated tilt

- [ ] Keep current opening detection initially; prove its anatomical sign on `docs/dental-reference/reference-aligner.stl` and distinct similar aligners. The 12-pose equivariance probe is a baseline, not a correctness gate. Only revise terminal-area scoring if cross-model evidence exposes a failure. If needed, evaluate both signs using cavity depth/visibility and arch continuity rather than trusting a 14% terminal-band ratio alone.
- [ ] Derive a **signed front axis** from the full arch footprint, not the 0.83 mm local loop: project onto the plane perpendicular to opening, find transverse/sagittal axes, distinguish the central incisor bridge from separated posterior arms by occupancy/continuity, and report a confidence/margin. Test missing molars, asymmetric and partial arches; abstain on ambiguous fronts.
- [ ] Establish a canonical pose from both opening and front axes, then apply an explicit configurable tilt preset. Calibrate the initial preset against the correctly posed reference (measured opening-down difference **46.46°**), but validate angle and sign on several independent similarly prepared STLs before treating it as default. Check residual 3D rotation to each known intended pose, not merely the opening vector. Use the same result after random rotations; do not replace the user's manually adjusted pose unless Auto orientation is pressed.
- [ ] Keep calculations in unit-local coordinates; test transform composition, Z-up import, left/right yaw, and signed tilt direction. Return diagnostic evidence and `inconclusive` when opening or front evidence is weak. Never silently rotate a low-confidence model.
- [ ] Run at least 100 seeded scrambled poses on the owner-approved reference and distinct similar aligners, plus synthetic symmetry, flipped normals, holes, and non-aligner negatives. Gate: zero wrong-side/180° front flips in the evaluated corpus; abstentions are acceptable and reported. Measure opening error, front error, and full-pose error separately. Do not claim universality or a fixed best print angle from one STL.

#### 2. Segment the true inner/lower support region, not just a 2D projection

- [ ] Build a mesh-surface region linked to the validated opening/trim, using topology or geodesic connectivity plus local side/normal/depth tests. Use the true trim edge or a reliably reconstructed boundary; a 2D visibility raster may accelerate queries but cannot be the sole definition of the inner surface. Reject leakage across thin shell walls or holes.
- [ ] Before using any “proven” `lower-edge-loop`, check global extent, perimeter, coverage around the arch, and nested-loop relationship. The current sample's 0.83 × 0.35 mm loop must fail this check. Find the actual full trim or refuse automatic supports; a stable opening axis does not waive this gate.
- [ ] Treat the trim as **paired 3D curves with varying height**, not a horizontal slice. On the reference sample, log why the human-traced inner and outer contours fail the current 60°/degree-2/mean-terminal-band filters; evaluate continuity along the arch and plausible local inner–outer spacing without forcing all vertices into one axial band. Reject a tiny closed feature even if it is the lowest or sharpest. Compare recovered 3D curves against image `06` from multiple views and require operator sign-off.
- [ ] Make the mask and contact placement query **one face/point-level permission model**. If the renderer uses vertex colors, explicitly handle triangles that straddle the boundary, or render an exact per-face/fragment overlay; do not infer safety from a green vertex alone. Manual Add may fill missed *inner* areas but must never override the anatomical exterior gate; Remove always vetoes.
- [ ] Gate every final transformed/landed contact after snapping/offsets and before mesh build/export. The tips-only preview and full supports must consume the same accepted contacts. If a support body intersects teeth outside its allowed contact, classify and report separately; do not conflate body collision with tip placement.
- [ ] Local annotated-sample gate: **zero forbidden exterior/tooth final tips** and **zero green mask pixels/faces on the marked forbidden patches**. Desired inner area should be broadly covered with no unexplained holes; record per-patch coverage/false-positive counts and require human visual sign-off, not only a global percentage. Test brush edits, rotation after detection, undo/redo, save/load, and regeneration. Fail closed if safe region cannot be established.

#### 3. Three-stage UI and tip preview

- [ ] Change `EditSession` state/events and command IDs in `src/editing/session.ts`, `src/editing/commands.ts`, `src/App.tsx`, `src/components/DentalBar.tsx`; keep orientation action and Next separate; add area→tips/full-build transition and Back/cancel behavior. Ensure gizmo is in rotate mode at Step 1, disabled/appropriate in paint mode, and ordinary Generate remains unchanged.
- [ ] Reuse `SurfaceBrushBar`/surface-brush semantics; enlarge Add/Remove hit targets and improve prompts. Apply Mixo app style tokens/base styles unchanged for any new UI. Update EN, zh-Hant, JA copy; use **牙套支撐生產** for the entry label. Number Steps 1/2/3; no non-final 完成.
- [ ] Add cancellable/debounced tips-only worker preview at Step 2; show loading/error/empty states and no full support mesh until Next. Stage 3 builds from the reviewed tips, not a divergent fresh placement pass. Preserve project history and avoid stale async results when changing model, pose, brush, or step.
- [ ] Browser walk with the reference sample: import, Step 1 untouched Next, Auto orientation without advance, manual rotation + Next, Step 2 Add/Remove/orbit with tips only, Step 3 full build, Back/undo, export. Check all three locales, keyboard/Esc, and existing non-dental path.

#### 4. Release gate and handoff

- [ ] Run focused tests, `npm test`, `npm run build`, `git diff --check`, and browser performance on the large owner-approved reference. Measure detection, mask, tips preview, and full mesh separately; keep the UI responsive and bound/cancel work. Re-run randomized rotations and forbidden-tip assertions after UI integration.
- [ ] Independent review of math and final-contact safety; compare all four retained screenshots and the original-pose sample to the new output. Have the operator visually approve the anatomical boundary. A green test suite alone is not release approval.
- [ ] Commit implementation in small verified units and update the handoff after each gate. The owner approved pushing the reference assets and implementation; push only verified checkpoints with honest gate status, and do not present partial work as release-ready.

### Token-economy assignment for future implementation

Probe local Ollama availability first. Give local Ollama bounded mechanical work (code inventory, i18n strings, fixture/test boilerplate, repetitive UI wiring) with exact file/output constraints; use the cheapest compatible subagent only if local Ollama is unsuitable. The main agent owns geometry design, safety invariants, ambiguous-case decisions, review, and verification of every delegated change. Never delegate clinical/anatomical correctness judgment to an unverified model answer. Use only the owner-approved neutral copies in `docs/dental-reference/` for cloud testing; original unredacted private assets remain excluded.

### Resume contract

Cloud execution note: the owner-approved reference STL and six images are now in `docs/dental-reference/`, so a cloud worker can reproduce the sample. The redacted annotated image is slightly re-rendered, not pixel-exact; measure against the STL and retain human visual review. Different similar STLs are still needed before claiming the orientation/tilt rule generalizes. Do not mark those gates complete from the one reference alone.

Successor: read this plan, `docs/dental-reference/README.md`, `docs/dental-rework-handoff.md`, the reference files, `scripts/probe-dental-orientation.ts`, and current `git status`, then start at the first unchecked gate. On this machine, also read the private original handoff at `C:\Users\DCT\.claude\orchestrate\dental-auto-generate\docs\dental-rework-handoff.md`. Distinguish **observed** findings from hypotheses. Record each completed gate, commands/results, commit, remaining risk, and exactly one next action in the repo handoff. If credits end, leave working tree and evidence recoverable; do not report a gate complete without its test and visual evidence.

---

<a id="plans-2026-10-25-dental-contour-contacts"></a>

## 2026-10-25 — Dental contour contacts implementation plan

*Was `docs/superpowers/plans/2026-10-25-dental-contour-contacts.md`.*

**Goal:** Replace broad dental face-fill supports with reviewed, exterior-side, near-contour contact bands; support two-contour and true outer-only models without guessing on ambiguous meshes.

**Architecture:** Split geometry detection, optional face-region diagnosis, band construction, and placement into pure units. The worker and UI consume one recomputed proposal; generation revalidates source-face permissions. Roll out behind fail-closed checks on the feature branch.

**Stack:** TypeScript, Vitest, Vite, React, Three.js, existing indexed STL pipeline.

Documentation checkpoint 2026-10-25: `dentalwork/plain-language.md` and `dentalwork/technical-algorithm.md` explain that the broad between-loop face cut labels contour sides but does not grant contacts. The current candidate strip starts at exact mesh-edge loops and follows adjacent faces on the `otherSide`. Both documents preserve the earlier ray, smooth-patch, and broad-area approaches with failure evidence, so future work can reassess them without confusing them with the live mask.

### Task 0: establish exact contour-face incidence (completed checkpoint)

Files: `src/core/analysis/dentalContourEvidence.ts`, `.test.ts`.

The tests were red while the module was absent, then green. This pure topology helper checks one simple closed mesh-edge loop and returns the two exact source face IDs per contour edge. It grants **no** contact permission. On the reference it verifies all 2,665 outer and 339 opening edges after a pose scramble. This is the evidence needed to design and test the exterior-side choice in Task 3, not a shortcut around that gate.

### Task 1: freeze current behavior and isolate detection (completed checkpoint)

Files: `src/core/analysis/dentalRegion.ts`, new `src/core/analysis/dentalContours.ts`, their tests, `dentalwork/technical-algorithm.md`.

1. Added a test for exact existing outer/opening edge identities, rotation invariance, and non-aligner abstention. It failed with the missing module before implementation.
2. Moved graph/context/contour extraction into `dentalContours.ts`; left `classifyFaces` diagnostic in `dentalRegion.ts`. Preserved current public behavior. Focused tests, full `npm test` (106 files / 1,191 tests), and `npm run build` passed.
3. Document the module contract and commit a checkpoint. Do not call the old broad mask safe.

### Task 2: classify central-opening state

Files: `src/core/analysis/dentalContours.ts`, `.test.ts`, new fixtures under `src/core/analysis/fixtures/` if synthetic.

1. Test `present` on reference, `ambiguous` on resolution disagreement/failed mesh-loop lift, and `absent` on a clean synthetic no-hole shell with stable occupancy. Confirm that a missing lifted loop is **not** classified absent.
2. Implement occupancy evidence independent of loop lifting and emit `present | absent | ambiguous`. Keep `outer-only` disabled for production until a real no-hole aligner is reviewed.
3. Run focused/full tests and record reference metrics.

Checkpoint: `inspectDentalCentralOpening` now reports `present`, `absent`, or `ambiguous`. The reference remains a stable 339-edge `present` loop. A closed synthetic cube returns `absent` at both raster resolutions; a broken mesh returns `ambiguous`. The production contour proposal still abstains on absence, so no outer-only contacts are enabled. Focused tests, 1,194 full tests, and build passed. Remaining Task 2 evidence: an actual no-hole aligner, multi-hole and resolution-disagreement cases, and safe outer-only policy wiring.

Owner clarified the shape requirement: a simple U-shaped aligner with no enclosed projected central hole should still use its detected outer trim ridge. The central opening contour is optional **only after absence is proved** at multiple resolutions; an ambiguous/missing lifted contour remains an abstention. Do not interpret a generic solid cube as proof of a usable outer-only dental model. Preserve the same contour-local contact and support-path safety gates for both variants.

### Task 3: certify exterior-side strips

Files: new `src/core/analysis/dentalContactBand.ts` and `.test.ts`; `dentalwork/technical-algorithm.md`, `dentalwork/plain-language.md`.

1. Add labeled reference faces: forbidden tooth/cavity and permitted exterior-adjacent examples. Add rotated-pose and pathological winding/branch cases. Test that all forbidden labels fail, crest is excluded, and uncertain side abstains.
2. Implement bounded mesh-geodesic distance from contour edges on each side, explicit cavity/exterior side choice, local setback/width parameters, and exact per-face permission. Validate 3D side continuity; never expand by 2D distance alone.
3. Produce a GLB review artifact separating blue/green/red contours, each candidate band, cavity exclusion, and tip markers. Obtain operator review before enabling the bands.

Diagnostic sub-checkpoint: a pure 3D face-adjacency/geodesic function now proposes **both** sides of both contours, not yet the safe side. The standalone GLB shows the four strips in violet/amber/cyan/magenta alongside old gold supports. Reference counts at 0.2–1.2 mm are 6,450 / 10,988 / 2,543 / 2,188 faces respectively; a scrambled copy preserves the outer-other mask. This is visual evidence only. Remaining Task 3: label forbidden and permitted reference faces, choose the non-fitting side from anatomy, test support-contact positions and secondary landings, and validate against another STL when supplied.

Next diagnostic checkpoint: `sampleDiagnosticContourContacts` orders each exact mesh-edge loop and proposes 2 mm-arclength samples on caller-supplied bands. The reference GLB now shows 109 lime outer / 45 pink inner provisional positions on the `otherSide` alternatives; zero samples were skipped at a 1.5 mm centroid-search limit. These are not generated contacts, and nearest-centroid selection does not prove geodesic locality, approach clearance, or layer-island safety. Rotation/source-face tests and visual renders passed. Before Task 4, replace or validate the spatial nearest-face choice with local surface connectivity, label forbidden examples, and test support-body paths. Do not infer non-fitting anatomy from `otherSide` naming.

Local-connectivity follow-up: the sampler now blocks contour edges in a source-face adjacency graph and searches each incident side separately under a 3D centroid-path budget. A synthetic disconnected surface that previously stole a contact is rejected; the sole reference retained exactly the same 109/45 marker geometry (byte-identical review GLB) and the scrambled-pose test stayed green. This resolves the *cross-component nearest-point* flaw, not anatomy or collision safety. Remaining Task 3: labeled permitted/forbidden source faces, independently reviewed exterior-side selection, and support-body/path/island tests; independent STLs are still unavailable.

### Task 4: switch placement and policy safely

Checkpoint 2026-10-25: the two-contour placement path uses recomputed exact source-face contour samples and narrow `contactFaces`; old saved policies fail closed. Brush permission and preview are confined to that mask. The final builder now independently recomputes the footprint, compares it with the saved policy, and drops any automatic primary tip that does not match a current exact-face sample; manual supports remain. The secondary-landing gate operates only after this validation. One-reference browser walk passed Step 1–3 and showed 87 final supports before the final-build guard; the direct GLB command after the guard still generates 90 tips with 5 omissions. **Not closed:** full body crossings and early-layer island gates are untested, the safe anatomical side is not independently labeled, and no-hole outer-only remains disabled.

Collision diagnostic update: exact triangle-triangle BVH comparison of the current final support mesh against the one saved reference found **107 pillar/model intersection pairs from two automatic supports, 78 pairs outside the narrow contact band**, in addition to 3,579 neck/model pairs. This falsifies the assumption that primary-tip and secondary-landing checks alone ensure body clearance. The probe is in `scripts/dental-region-review/crossings-probe.ts`; it does not change production output. Before release, add a source-space body-path gate and re-run the collision probe, distinguishing intentional neck penetration from forbidden shafts. Do not silently drop manual supports.

Subsequent narrow body-clearance checkpoint: `dentalBodyClearance.ts` now tests built automatic pillar triangles against source-model triangles, including coplanar overlap; `jobRunner.ts` omits crossing automatic IDs, rebuilds, and fails closed to manual-only if the rebuilt layout still crosses. Synthetic and one-reference tests pass; independent BVH comparison finds zero forbidden automatic-pillar intersections on the filtered reference. Browser walk passes **34 checks** with **83 final automatic supports and seven omissions** on this fixture. This does not yet check brace/tree/roof paths or early-layer islands. The broader modular architecture and typed, overridable defaults are documented in [`dentalwork/support-module-boundaries.md`](../dentalwork/support-module-boundaries.md); extraction should be incremental and parity-tested, not a rewrite of the working generator.

Rim-coverage follow-up: the owner requires baseline spaced support along both detected trim rims even without an island signal, except where no safe/reachable contact exists. A new final-mesh arclength test exposed a 25 mm unsupported central-opening arc at the prior 5 mm sampling. The current 2 mm inner default yields an 8 mm maximum on the one reference, with 30/45 inner candidates retained and zero pillar crossings; outer 3 mm sampling retains all 72. This is a one-fixture improvement, not a global coverage proof. The next policy gate must measure retained circular gaps on every model, seek safe local alternatives without widening the cavity-facing mask, and report unresolved gaps for manual review rather than silently generating an apparently complete result. `dentalwork` docs call the detected curves **trim rims** and the narrow permitted band **aligner contact strip**.

Safe-resampling implementation constraint (2026-10-26): `useDentalPreview` currently runs `filterDentalPlacement` in `analysisWorker`, showing proposed tips without a support mesh; `runSupportJob` later validates the recomputed default primary sample set, secondary landings, and built pillar crossings. Therefore adding shifted-phase contacts only inside `runSupportJob` would make Step 2 omit tips that appear in Step 3, and passing shifted contacts as manual would bypass the dental gates. The phase-0 diagnostic found 19 local face candidates in five 6–8 mm opening-rim gaps on the raw reference, but none is yet a safe support. Implement repair in this order: (a) recompute and identify shifted candidates on exact approved strip faces with deterministic arclength/face provenance; (b) make the same worker preview list these as visibly provisional, never as certified contacts; (c) permit only provenance-matching alternate primaries through the existing final-build secondary-landing and body-clearance gates, with a bounded build/recheck; (d) reconcile Step 2 and final retained IDs, display omitted/unresolved gaps, and disable final acceptance while the latest geometry/setting version is still checking. The painted strip and provisional tip positions can update immediately; final-safe status is asynchronous. A setting or brush edit invalidates both results. Do not claim the current preview is final-safe or add ungated contacts to eliminate a warning. First measure the centred browser representation and budget the extra build latency before production wiring.

Files: `src/core/analysis/dentalPolicy.ts`, `src/supports/jobRunner.ts`, `src/workers/analysisWorker.ts`, associated tests.

1. Write failing tests showing broad between-loop faces produce zero contacts, eligible band faces produce contacts, forged/stale proposals fail, and secondary landings outside a band drop.
2. Replace `allowedFaces` as the production gate with certified band faces and preserve ordered erase/allow stamps **within** that band. Sample contacts along contour arclength and move them to exact faces in the certified strip; do not require downward normals alone. Reject non-downward contacts unless the approach/body path and layer-island checks pass. Recompute and compare the band on placement. Disable the old broad policy rather than silently migrating it.
3. Run focused/full tests and build; compare Step 2 proposed and Step 3 retained source contact IDs.

### Task 5: operator flow and validation

Checkpoint 2026-10-25: the standalone GLB now colors the live narrow mask teal, keeps four diagnostic side strips and separate old 2 mm markers, and includes gold supports generated by the app. The CLI reports the narrow count separately from the broad diagnostic face counts. Browser walk passed 32 checks; tests passed 110 files / 1,201 tests and build passed. Still need anatomical/operator review of the new GLB, independent with-hole and no-hole meshes, body-clearance and island tests, and diameter calibration; do not merge/release on this checkpoint.

Files: `src/App.tsx`, `src/components/DentalBar.tsx`, viewport overlay and tests; `scripts/dental-region-review/cli.ts`, `dentalwork/run-review.bat`.

1. Write UI tests for contour-band wording and visualization; no broad green cavity paint. Keep Step 1 Auto orientation/Next, Step 2 tips with Add/Remove and viewport-rotation hint, Step 3 final generation.
2. Extend the standalone GLB command to show the distinct detector methods and proposed strips. Run it on reference and scrambled reference.
3. Run `npm test`, `npm run build`, browser walk, and visual review. Add independent with-hole and no-hole patient meshes when supplied. Check layer islands, body crossings, latency/cancellation, and physical-print settings. Merge/release only after these gates; otherwise leave a clear branch checkpoint and handoff.

The standalone batch uses the live narrow-contact code for the sole available reference and reports omitted tips. Its teal overlay marks the current narrow candidate footprint, but this exporter checkpoint is not Task 5 acceptance or dental certification.

Step 2 tuning checkpoint 2026-10-26: the live brush bar now has bounded strip width and support-density sliders plus advanced rim setback. The values persist in each accepted dental policy and cause a debounced worker recomputation of the exact non-cavity-side face mask and proposed tips; Step 2 hides stale tips and disables Next during retuning. The builder revalidates the tuned mask and uses tuned spacing for final rim warnings. The browser walk passed all 38 checks after exercising all three controls (13,176→13,815→10,856 mask faces; 117→130 proposed tips after density), with 112 final supports and an unresolved 9.1 mm opening-rim gap. This is one-STL UX/parity evidence, not proof that arbitrary expanded strips avoid upper tooth surfaces. The phase-0 gap candidates remain diagnostic, and broader body/island/no-hole/independent-model gates above still prevent release.

### Handoff after every checkpoint

Update `docs/dental-rework-handoff.md` and the private orchestration handoff with commit, files, red/green commands, exact observations, open safety risks, and one next action. Push only tested branch checkpoints. Main model owns anatomy and release judgment; use local Ollama only for bounded mechanical work, then verify every result.

---

<a id="specs-2026-10-25-dental-contour-contacts"></a>

## 2026-10-25 — Dental contour contact design

*Was `docs/superpowers/specs/2026-10-25-dental-contour-contacts.md`.*

Status: approved product direction, geometry and clinical validation pending. The current `codex/dental-rework` implementation still places tips across a broad face mask. This design replaces that permission rule; it does not claim that every resin/printer combination can use the same contacts.

### Operator rule

For a directly printed aligner, propose automatic support contacts in a narrow band on the **non-fitting side** of a validated lower trim ridge. Do not put a contact on the sharp crest itself, across the broad tooth-fitting cavity, or above the intended lower contour. If the mesh has a validated central opening, its rim may provide a second contact band. A model without that opening uses only the outer band. Show the exact proposed tips for review before building support bodies. The operator can erase tips or allow more within the certified bands; painting cannot override a failed geometric gate.

The band width and crest setback are process parameters to tune against actual print/fit results. They are not universal clinical numbers. Support density must also satisfy layer-island and mechanical stability checks. If a narrow band cannot carry a printable result, ask for a manual choice instead of silently expanding into the cavity.

### Detector contracts

Input: one indexed, consistently wound, manifold triangle mesh in unit-local coordinates. Preserve source face and edge IDs through orientation and export. Output is `proposal` or `inconclusive(reason)`; a proposal contains the opening axis, outer contour roles (strong ridge sections and weaker graph connectors), optional central-opening contour, contour confidence/evidence, and a face-local contact band. The old between-curves face mask is diagnostic only and may be computed independently. It must not grant contact permission.

Separate operations in dedicated dental files:

1. `orientation`: infer cavity axis and arch front; abstain on ambiguous sign. Keep the current reference-pose calibration separate from shape inference.
2. `outerContour`: find two long strong-ridge chains, join their ends along the weaker sharp-edge graph, and validate one simple closed mesh-edge cycle. Record each role separately. Do not assume the ridge is planar or a topological mesh boundary.
3. `centralOpening`: classify `present(loop)`, `absent(evidence)`, or `ambiguous(reason)`. Confirm projected occupancy at two resolutions. `absent` requires stable evidence that no enclosed central opening exists; a failed loop lift, multiple holes, or resolution disagreement is `ambiguous`, never `absent`.
4. `contactBand`: inspect both mesh-face sides of each contour. Identify the fitting cavity using opening direction, face normals, connected surface context, and the available inner contour. Trace a bounded geodesic strip on the opposite side; exclude the crest and all tooth-facing/cavity faces. For the central-opening rim, determine its own exterior-side strip, not an assumed shared side. If the side cannot be separated reliably, return `inconclusive`. A side assignment based only on normal sign or a 2D projected band is insufficient.
5. `placement`: distribute candidate contacts by **3D contour arclength**, then move each onto a certified non-fitting-side strip with an exact source-face ID. A downward-facing normal is useful evidence, but it cannot be a universal requirement: an edge-adjacent strip can be near vertical. For non-downward faces, require an explicit collision-free approach path and layer-island/stability check; otherwise omit that contact. Apply spacing, painted removals, and secondary-landing face checks. Preview shows final eligible tip locations and any omitted/unsafe count.

Classify a proposal as `two-contour` only with both validated loops and bands; `outer-only` only with stable absence evidence and a validated outer band. Otherwise abstain. Saved policy must be recomputed and compared to the current mesh before use. A stale policy is not grandfathered into permission.

### Verification gates

- Reference STL: preserve expected outer 2,665-edge loop and 339-edge central loop; random rotations must preserve edge and face identities. Label forbidden tooth/cavity faces and allowed external near-ridge faces; assert **every** proposed tip and secondary landing is on an allowed face.
- Review GLB: show strong ridge blue, connectors green, central opening red, candidate contact bands in distinct colors, excluded cavity neutral, and final tips separately. A diagnostic face-between-loops overlay remains available but is not called support permission.
- Different aligner STL with an opening: run the same checks. Until available, cross-patient correctness is unverified.
- No-hole aligner STL: prove stable `absent` classification and outer-only contacts. Synthetic fixtures can test control flow, but cannot validate anatomy.
- Browser: Step 1 orientation, Step 2 band/tip preview and paint, Step 3 support build. Preview and built source contact IDs must agree after declared omissions. Budget computation time and allow cancellation.
- Physical print/fit review: clinician/lab must validate contact marks, fit, removal, and process settings. Software tests do not establish clinical suitability.

### Reversibility

Keep this work on `codex/dental-rework`. A failed detector gives no automatic dental contacts, not the old broad mask. Preserve the old face-region function for diagnostics and potential future non-dental use, isolated from production permission. Do not merge or describe as ready while independent meshes, annotated forbidden faces, and support-body review remain outstanding.

---

<a id="2026-10-26-support-ship-gates"></a>

## 2026-10-26 — Support ship gates implementation plan

*Was `docs/superpowers/plans/2026-10-26-support-ship-gates.md`.*

> **For agentic workers:** Use `executing-plans` task by task. Write a failing behavioral test before each production change, verify focused and caller tests, then commit and update both dental explanation documents and the handoff. The current branch is `codex/dental-rework`; push only tested checkpoints and do not merge/release on one patient STL.

**Goal:** Make generic and dental support generation modular, performance-bounded, and honest about collisions and unsupported islands, with one preview/export safety path. “Ready to ship” means the software is ready for release after all code, end-to-end, performance, and safety gates pass—not merely that a branch was pushed. Separate patient/print validation is required for a general clinical reliability claim.

**Architecture:** Pure geometry reports in `src/core/analysis` and `src/core/supports`; mode-specific repair policy in `src/supports`; UI only renders report status. Preserve the existing support shapes. Use an event-based mesh connectivity sweep, not a full live layer raster.

**Tech Stack:** TypeScript, Vitest, Vite, Web Workers, Three.js/BVH diagnostics, Playwright browser walk.

---

### Task 1 — Exact topology-birth primitive

**Files:** create `src/core/analysis/topologyBirths.ts` and `.test.ts`; update `dentalwork/technical-algorithm.md` and `plain-language.md`.

- [x] Write a failing test for one detached raised tetrahedron, an equal-height bottom plateau, a lower-connected slope, and two minima joining only at a higher saddle. Assert birth height and source vertex/plateau identity, not a particular union-find parent.
- [x] Run `npx vitest run src/core/analysis/topologyBirths.test.ts`; verify assertion failures from the initial stub.
- [x] Build indexed vertex-edge CSR adjacency from triangle indices. Sweep sorted used vertices by Y; activate an equal-height bucket, union edges within it, and report each plateau root with no strictly lower active neighbor as a birth. Return `inconclusive` for non-finite coordinates, invalid indices, an empty mesh, duplicate faces, or an edge used more than twice. Complexity target: O(V log V + E α(V)), memory O(V+E). Focused red/green tests include malformed topology.
- [x] Re-run focused tests and a reference timing/memory probe. Compare with the current minima heuristic but do not delete it yet. Three validated runs observed 202–214 ms / 56 births for 186,976 vertices. The legacy no-contact check emitted one clustered island warning in 145 ms; its cap/cluster/normal rules make this a diagnostic contrast, not a count discrepancy to “fix.”
- [x] Commit the pure primitive once green (`30e52db`, pushed to `codex/dental-rework`).

### Task 2 — Built-support path report

**Files:** create `src/core/supports/supportPath.ts` and `.test.ts`; modify `mesh.ts`/`meshBuilder.ts` tagging only where attribution is missing.

- [x] Red/green tests for the pure path reducer: anchored descending links resolve births; unverified, too-high, unanchored-cycle, and invalid endpoints do not. Manual-only provenance is retained, while an all-automatic alternative wins. Seven focused tests pass. Geometry attribution remains open.
- [ ] Red adapter tests: a nearby detached tip and a crossing body do not yield `verified` links, and a tree with no plate path does not resolve a birth. A manual path is reported without removal.
- [ ] Construct a graph of tagged built support components using plate contact, actual tip/model reach, and geometric joins. No proximity-only edge is accepted. Attach each topology birth to a source face and a support contact at/below its height; return `resolved`, `unresolved`, or `inconclusive` with provenance. Depends on Task 3's intentional-contact/body-clearance classifier; a bare `verified: true` passed to the pure reducer is not enough.
- [ ] Run focused tests and the one-reference + generic golden suites; cache reusable model topology, not decisions after a settings/paint change. Commit.

### Task 3 — Classify intentional contact reach versus body collision

**Files:** modify `src/core/supports/mesh.ts`, `meshQuery.ts`, `bodyIntersection.ts`, `src/core/supports/dentalBodyClearance.ts`; add synthetic tests.

- [ ] Red tests for both ends of a two-leaf Tree: a tiny approved contact reach is exempt, a branch through an unrelated wall is not. Test default round/tapered and shaped-tip settings, secondary landing, trunk, brace, generic roof/cage, and manual support attribution.
- [x] Record primary and secondary model-contact intent on tree curves (including both leaves of a joined two-leaf branch) and carry the metadata to built components. Preserve its points under plate-to-unit frame conversion. Focused tests were red then green; no collision exemption or geometry change yet.
- [x] Add generic exact face/triangle hit evidence, continuing after a locally approved hit; add a conservative exact-source-face/distance/depth predicate. Bind uniquely matched dental contact source faces into Tree metadata, and apply the predicate only to dental Tree branches. Synthetic harmless-tip/second-wall tests were red then green; the one-reference rim-coverage test still requires Tree fallback. No full generic policy or adjacent-face permission yet.
- [x] Permit one indexed edge-adjacent face of the same smooth sheet, requiring both source and hit face normals to agree with the contact intent. Red/green tests distinguish it from a close separate wall and reversed source winding. Built primary-end adjacent-face acceptance is now covered on both ends of a round two-leaf Tree.
- [x] Include tagged shaped-tip Tree necks in the structural collision gate. A red square-tip wall-crossing test exposed their previous exclusion; the bounded contact exception now applies to those necks while unrelated walls still fail and the safe secondary landing passes.
- [x] Add exact primary-face provenance to ordinary pillar neck components without changing vertex/index output. A red regression showed contact metadata alone misclassified those necks as Tree parts; explicit `structureKind: 'tree'` now marks only split Tree necks. This is attribution only, not pillar-neck safety enforcement.
- [ ] Validate a built two-leaf Tree (round and shaped tips, both primary ends and secondary landing) against intended same-surface adjacent faces and a nearby separate wall. Avoid a blanket “neck is safe” exemption; trunks/braces/roof/cage have no contact exception. Preserve mesh geometry byte-for-byte where only tags change.
- [ ] Re-run independent BVH crossing probe; document any Tree fallback still needed. Commit.

### Task 4 — Shared full-build safety runner and mode policies

**Files:** extract from `src/supports/jobRunner.ts` into `genericSupportPolicy.ts` and `dentalSupportPolicy.ts`; modify `src/core/jobs.ts`, worker protocols, `src/supports/unitSupports.ts`, and export path as necessary.

- [ ] Red tests that generic and dental preview/export agree on retained support IDs and safety status even when display is tips-only or low-poly. No manual support is silently deleted. Stale, timed-out, or inconclusive analysis cannot be exported as “safe.”
- [ ] Red tests for generation-time pillar/brace/tree path preflight: a blocked automatic pillar can move only to a permitted nearby landing; a blocked brace/branch is rerouted or omitted within a bounded candidate budget. Reuse one model spatial index, avoid full mesh rebuild per trial, and retain the independent exact final-mesh check.
  - Partial route adapter: red/green tests prove `buildSupportMesh` exposes copied neck, pillar, foot, Tree and Brace centre-lines before meshing without changing geometry. Splitting the wide foot from the narrow shaft avoids a falsely inflated collision envelope. A pre-build column callback can omit an automatic column as a whole and records it, while never deleting a manual column. Preflight can mark short contact-adjacent spans inconclusive and still find a farther wall. Only guarded dental opt-in calls the column decision; Tree/Brace decision, alternative route supply, and default Generate integration remain open.
  - Partial opt-in caller: `columnPathScreen.ts` tests definite shaft/foot block versus deferred neck/contact/ambiguous hits. An intentional secondary landing passes its printed `landingReach` to `uncertainEndMm`; a farther wall still blocks. Dental `runSupportJob(..., { pathPreflight: true })` reuses the cached index and can omit only definite automatic columns. Normal Generate defaults off pending the Task 4 benchmark; generic exact gate, Tree/Brace preflight, and bounded permitted relocation remain open.
- [ ] Extract a generic `modelCollisionIndex.ts` from `bodyIntersection.ts`: test indexed and unindexed exact-hit parity, a second wall after an approved hit, reuse of one index for multiple part checks, and rejection of a stale index from another model. Preserve existing first-conflict behavior and measure index construction/query cost.
- [ ] Add a generic path preflight over the cached index with a conservative radius envelope. Test clear, blocked, intended bounded tip reach, malformed frame/geometry, and cancellation; return `inconclusive` where a cheap check cannot decide. It must never set final `safe` status.
  - Partial standalone primitive: `pathPreflight.ts` now has red/green clear/blocked/near/contact/invalid/cancel tests. It has not been wired to the builder or benchmarked; the checked item stays open. Its contact-face option abstains on an intended hit rather than certifying bounded depth; that narrower proof remains in final built-geometry classification.
- [ ] Add a generic bounded candidate runner separate from dental placement rules. Test permission rejection, deterministic candidate order, attempt cap, manual no-move, and no whole-mesh rebuild per trial. Wire dental trim-strip candidates and generic zone candidates separately.
  - Partial pure selector: red/green tests now cover permission, order, cap, manual immobility, ambiguous original, and cancellation. No actual path/builder caller or mode-specific alternatives yet; checkbox stays open.
- [ ] Benchmark the generic preflight against the current final-only path on the saved aligner and a synthetic high-collision generic model. Record index build, query and total Generate time, rebuild count, memory, and retained IDs. Keep preflight only with zero false-safe final results and a measured collision-heavy benefit without material clean-case regression.
  - One warm saved-aligner pair: opt-in 5.35 s, baseline 5.42 s, both 38,344 faces and identical retained IDs; four opt-in early omissions were already in baseline `dropped`. This is correctness evidence for one fixture, **not** a demonstrated performance benefit. Need repeated order-swapped runs, a collision-heavy generic fixture, and memory/rebuild counts before default enablement.
  - Dependency: ordinary Generate currently has no shared exact final safety decision. Implement the next full-resolution generic policy gate first; otherwise “final-only versus preflight” has no valid generic safety baseline to benchmark.
- [ ] Build full-resolution geometry for the shared safety decision, then derive display meshes. Generic policy reports/repairs automatic conflicts without changing dental anatomy; dental policy only searches its accepted contact strip and keeps unresolved gaps/islands explicit. Bound repair attempts and cancellation.
  - Current `runSupportJob` has dental-only exact body/structure fallbacks. The new column-decision seam is not a generic safety gate; add the generic final check and explicit unresolved status before enabling generic pre-build omission or export claims. Treat contact-adjacent neck preflight hits as ambiguous unless the built contact intent certifies them.
- [ ] Run direct worker/export parity tests, full `npm test`, build, and browser walks of ordinary Generate plus dental Steps 1–3. Commit.

### Task 5 — Dental coverage and outer-only aligners

**Files:** `src/core/analysis/dentalContours.ts`, `dentalContactFootprint.ts`, `dentalGapAlternates.ts`, `dentalPolicy.ts`, `src/supports/jobRunner.ts`, Step 2/3 UI, save/load tests, `dentalwork/*`.

- [ ] Red tests on a real owner-provided no-central-opening U-shaped aligner: certify **absence** of an opening at both image resolutions while retaining a full outer 3D trim rim; do not convert an ambiguous or malformed central hole into “absent.” Use outer-only placement and the same side, landing, body, and path gates. Until this fixture exists, the mode must abstain rather than guess.
- [ ] Red preview/final parity tests for bounded gap-alternate selection. Recompute exact phase-zero source face, position, normal and paint permission in both Step 2 and final build; show provisional versus built IDs separately. Admit an alternate only after secondary landing, complete body, and path checks. Leave an unresolved rim-gap warning when no candidate passes.
- [ ] Preserve Step 1 orientation/manual gizmo and Step 2 paint/tips-only flow. Verify tuning invalidates stale proposals, and Step 3 cannot accept a stale or inconclusive safety result. All generic right-panel controls must remain non-contradictory in dental mode.
- [ ] Run scrambled poses, save/load, brush/undo, GLB overlay/edge review, browser walk and full suite. Commit each independently verified subtask.

### Task 6 — UI, performance, and release evidence

**Files:** `src/components/ProblemList.tsx`, `DentalBar.tsx`, locales, `scripts/walk.mjs`, `dentalwork/*`, handoff.

- [ ] Show topology-birth/path status distinctly from the old local-minimum/overhang advisory. Dental unresolved events outside the strip require manual review; no cavity-side auto tips. Explain tree/brace fallback and manual collision diagnostics without implying clinical certainty.
- [ ] On the 18.7 MB saved STL, measure topology, body check, repair, and full build separately; add a budget/cancellation regression. Verify all three locales, paint edits, orientation edits, undo/redo, save/load, export and zero forbidden labeled contacts. Run `npm test`, `npm run build`, `git diff --check`, browser walk, and independent BVH/GLB review.
- [ ] Request a second with-hole and real no-hole patient mesh and physical print review before a general dental reliability claim. If unavailable, push the verified code branch with these validation gates explicitly open; do not market as clinically validated.

### Task 7 — Submission gate

- [ ] Audit every requirement against current code, tests, browser output, generated STL/GLB and the owner reference screenshots. Run the generic and dental workflows from a clean branch state and verify no branch-only fixture shortcut.
- [ ] Obtain independent anatomical/print review on at least a second with-hole model, a real no-hole model, and the target printer/material before any claim of general dental print safety. This is a separate post-code validation gate, not a condition for pushing reviewed source to GitHub.
- [ ] When code gates are evidenced, run fresh `npm test`, build, type check, browser walks, performance probe, independent collision probe, and diff check. Commit and push the feature branch; submit a reviewable PR if ready. Do not call the software release-ready until every applicable software gate passes; do not merge/deploy without separate approval. Update the handoff with remaining real-world validation explicitly flagged.

### Resume rule

Read `docs/superpowers/specs/2026-10-26-support-ship-gates-design.md`, this plan, `dentalwork/support-module-boundaries.md`, current `git status`, and the last entry in `docs/dental-rework-handoff.md`. Resume the first unchecked checkbox. Record exact test command, result, changed files, commit SHA, known risk, and one next action after each task. Existing files or branch status, not narrative memory, are authoritative.

---

<a id="2026-10-26-support-ship-gates-design"></a>

## 2026-10-26 — Generic and dental support ship gates

*Was `docs/superpowers/specs/2026-10-26-support-ship-gates-design.md`.*

Status: owner requested a full modular, shippable generic and dental implementation on 2026-10-26. The latest clarification makes “ship” mean release-ready software, not merely code pushed to GitHub. This design preserves the existing support shapes and makes safety reports explicit. It extends the approved dental rework plan; passing software gates on the single saved aligner must not be described as clinical validation.

### Scope and ownership

`core/analysis/placement.ts` and the `dental*` contour modules propose contacts. `core/supports/mesh.ts` builds tagged tips, shafts, trees, braces, raft, and optional generic roof/cage. A generic analysis layer inspects the **full-resolution built mesh** in the same millimetre frame as the model. Generic and dental policy modules decide what to omit, request again, warn about, or refuse; neither geometry report knows about aligner anatomy. The job runner is the one preview/export policy path. Tips-only and low-poly display are views of a full safety decision, never a substitute safety calculation.

### Body-clearance report

The existing `bodyIntersection.ts` is the reusable exact-triangle search. Give every intentional model-contact reach explicit tagged provenance, including both ends of a joined two-leaf tree, before exempting it. A tiny neck adjacent to an approved primary or secondary landing may intersect the intended local face; a shaft, brace, tree trunk, tree branch away from that reach, roof/cage part, or a neck crossing a different wall is a defect. Report component, owner ID if present, and hit classification. Never silently delete a manual support. Automatic generic and dental repair may drop or reroute only within their respective permission rules, rebuild, and recheck. If no safe full mesh results, present a failure and block unsafe export; do not fall back to an apparently complete support set.

### Event-based island report (not per-layer slicing)

The present `checkSupports` “island” is a local-minimum/near-contact heuristic, not a topology or slicer result. Keep it as a fast advisory until replaced in the UI. Build a welded, validated model-edge graph once per geometry/pose. Sweep unique vertex heights from plate upward; union active neighboring vertices and equal-height plateaus. Record a birth only when a connected sublevel component appears without a lower neighbor. Track its merge height and representative source face/point. This lower-star/0D-connectivity sweep is roughly sorting plus near-linear union-find, independent of the number of print layers. It is an efficient **screen** for new model components, not an exact physical-layer proof: topology defects, unmerged coincident faces, and sub-layer features yield `inconclusive`, never an unearned pass.

An event is resolved only by a built support path to the raft/plate with a contact at or below the birth region, or by validated existing model-to-plate connectivity. Contact proximity alone is insufficient. The pure `resolveBirthPaths` graph reducer now accepts only caller-verified descending links, finds plate-reachable births, and records paths that depend on manual supports. It cannot verify a caller's `verified` claim itself and is not wired to Generate/export. The next adapter must derive graph links from tagged built components and actual intersections/joins; a detached tree or crossing body cannot resolve an event. Dental auto-repair may propose another contact only on the accepted non-cavity-facing aligner strip and must pass all final landing/body/path checks. If an island cannot be reached without touching the tooth-fitting cavity, keep it unresolved for manual pose/support review. Generic projects may use their own zones and placement rules. Full layer slicing remains an optional offline diagnostic for ambiguous cases, not a live-slider dependency.

### Performance and lifecycle

Run analysis in a cancellable worker after Step 2 acceptance or ordinary Generate. Cache mesh adjacency and body spatial index by source geometry plus pose; invalidate them on geometry/pose change. During generation, preflight each proposed pillar route and each brace/tree segment against the cached index, moving only automatic contacts within their mode's permitted region and a bounded candidate budget. This avoids rebuilding every full support mesh for obvious failed candidates; it does not replace a final exact triangle check of tapered tips, junctions, diameters, and the complete built mesh. A paint/spacing/diameter edit invalidates the support-body and path result. A timeout returns `inconclusive`, never “passed.” Show provisional Step 2 tips separately from final-safe built supports. Export recomputes full-resolution geometry through the same policy and refuses a stale or failed safety result. Report timings and peak memory on the retained 18.7 MB STL and one generic fixture.

The preflight is a **generic geometry service**, not a dental rule: one immutable model collision index serves pillar, Tree, and Brace path queries in the same millimetre frame. A query returns `clear`, `blocked` with candidate model-face evidence, or `inconclusive`; it never grants final safety. A separate bounded candidate runner takes proposed paths, mode-supplied alternative positions and permission predicates, and a maximum trial count. Dental supplies trim-rim/strip candidates; generic mode supplies its own placement and zone candidates. Manual supports are reported, never moved or deleted automatically. Build selected parts once, then run the existing exact triangle report over the complete full-resolution mesh. Recheck after any local change; reject or warn if the final result remains blocked or inconclusive.

Compare against today's final-only path on the saved aligner and a synthetic high-collision generic model: index-build time, per-route query time, number of full rebuilds, total Generate latency, peak memory, and final retained support IDs. Accept the preflight only if it has no false-safe final result and a measured benefit in the collision-heavy case without a material regression on the clean case. Keep the final exact pass even if the preflight benchmark wins.

### Software acceptance, not clinical certification

Test disconnected birth, a component merging later, an equal-height plateau, a birth resolved by a true support path, a nearby but disconnected tip, intentional contact penetration, wrong-wall neck, crossing tree/brace/shaft, manual-support diagnostic, roof/cage generic clearance, no-hole dental abstention, preview/export equivalence, cancellation, and save/load. Run `npm test`, build, full browser walks in all three locales, and independent BVH/visual probes. Require zero known forbidden dental upper/cavity contacts in the labeled reference. A second with-hole and a real no-hole patient aligner plus printer/material-specific physical testing remain required before claiming general dental print reliability.

---

<a id="2026-10-27-wasm-geometry-migration"></a>

## 2026-10-27 — UI-independent WASM Geometry Migration Implementation Plan

*Was `docs/superpowers/plans/2026-10-27-wasm-geometry-migration.md`.*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Keep the main agent responsible for architecture/safety; use local Ollama only for checkable mechanical inventory or formatting after a live probe.

**Goal:** Move every product-controlled 3D calculation for generic and dental support generation and automatic orientation into one Rust/WASM core reusable by this editor and Babylon.js, then finish the existing ship gates and push a verified result.

Owner scope confirmation, 2026-10-27: both automatic contact placement and final support-mesh generation must run in Rust/WASM for generic and dental modes. TypeScript may orchestrate requests but may not retain either geometry algorithm in production.

**Architecture:** A pure Rust core is wrapped by a small WASM ABI. Browser workers and Node diagnostics call coarse geometry operations with versioned settings and typed arrays. TypeScript remains a thin host/UI/render adapter, and old TS geometry is deleted after each parity gate.

**Tech Stack:** Rust 1.99.1 with `wasm32-unknown-unknown`, Cargo, wasm-bindgen/wasm-pack, TypeScript 5.7, Vite 6, Vitest 3, Playwright browser walk. Rust version is pinned after [official 1.99.1 release](https://blog.rust-lang.org/releases/); verify wasm-bindgen/wasm-pack versions and hashes at installation.

**Design:** [`dentalwork/wasm-geometry-design.md`](../dentalwork/wasm-geometry-design.md). **Existing safety plan:** [`2026-10-26-support-ship-gates.md`](#2026-10-26-support-ship-gates). Both apply; this plan does not waive any generic/dental safety gate.

---

### Rules for every task

- Before source browsing run `graphify query "<task concept>"`; after any code edit run `graphify update .`. Preserve user/untracked files.
- Write a failing behavior test, run it red, implement the smallest passing change, run it green, then run relevant TS/Rust/Node/browser checks. Commit and push a recoverable checkpoint only after verification. Record exact command, output, commit and next action in `docs/dental-rework-handoff.md`.
- Compare one whole operation at a time with the old TS reference. IDs, contact attribution, enabled structures, omissions, preview/export results and collision statuses are part of parity. Any approved difference gets a fixture, rationale, and operator-visible consequence. Do not quietly widen tolerances.
- A module is migrated only after the production caller uses Rust/WASM, the Node review tool uses that same Rust source, and the old production TS algorithm is deleted. A wrapper around a still-TS algorithm is not completion.
- On cancellation, worker crash, out-of-budget input or ambiguous safety verdict, publish no partial support mesh. Manual supports must never be silently deleted.

### Ownership map

| New owner | Existing code to migrate or narrow | Proof |
|---|---|---|
| `crates/geometry-core/src/{mesh,math,spatial,transform}.rs` | `src/core/{vec3,transform,handedness,decimate,import}`, `src/state/{transform,import}`, `src/workers/prepareImport` | Mesh/import/transform/BVH parity and memory bounds |
| `crates/geometry-core/src/{generic,dental}.rs` with focused submodules | `src/core/analysis/*`, dental logic in `src/supports/jobRunner.ts` | Random rotations, rim/mask/contact fixtures, generic placement |
| `crates/geometry-core/src/{supports,clearance,islands}.rs` with focused submodules | `src/core/supports/*`, `src/supports/{landing,dentalLandingSide,dentalPrimaryFace,supportFrame}` | All parts and exact collision/island reports |
| `crates/geometry-wasm/src/lib.rs` | Versioned, coarse typed-array ABI | Browser and Node package tests |
| `src/workers/geometryClient.ts` plus narrow worker adapters | `analysisWorker`, `meshWorker`, `importWorker`, `projectWorker`, `jobRunner` | No divergent preview/export path |
| `src/components/viewport/geometry.ts` and renderer adapters | `src/editing/screenBrush.ts`, `src/components/viewport/{useScreenBrush,dentalFaceOverlay,geometry}` | WASM-owned hit/projection/overlay, UI still responsive |
| `scripts/dental-region-review/*` | Existing direct TS detector/builder imports | Same Rust core and GLB colors/results |

The Rust source must be split further by responsibility as each phase lands; this map is ownership, not permission to create giant modules.

### Phase 0 — lock baseline and bootstrap

#### Task 0.1: Produce complete geometry-call inventory

**Files:** Create `dentalwork/wasm-geometry-inventory.md`; inspect all non-test `src/core`, `src/supports`, `src/editing`, `src/state`, `src/components/viewport`, workers and `scripts/dental-region-review`.

- [ ] Enumerate each exported 3D calculation, production caller, Node caller and intended Rust operation. Classify render-only host API calls separately; record why each retained JS call is not geometry policy.
- [ ] Add a checkable import/AST rule that fails when a new production TS geometric algorithm appears outside the explicit adapter list. Initially report-only; enforce after cutover.
- [ ] Run current `npm test`, `npm run build`, `npm run walk` with the saved dental fixture, plus raw/centred `scripts/dental-region-review` probes; record full commands/results and deterministic output hashes in the inventory. Existing browser/CLI count difference (100 centred versus 102 raw) must remain explained, not averaged away.

#### Task 0.2: Pin and build Rust native plus browser/Node WASM

**Files:** Create `rust-toolchain.toml`, root `Cargo.toml`, `crates/geometry-core/Cargo.toml`, `crates/geometry-core/src/lib.rs`, `crates/geometry-wasm/Cargo.toml`, `crates/geometry-wasm/src/lib.rs`; modify `package.json`, `.gitignore`, CI workflow.

- [x] Install a verified Rust 1.99.1 toolchain and `wasm32-unknown-unknown` target without changing other installed toolchains. Pin the selected wasm-bindgen/wasm-pack version from its official release and lockfile; record checksums. Rust binaries were present at `C:\Users\DCT\.cargo\bin` but absent from PATH; the default 1.89 toolchain was not changed. `wasm-pack` 0.15.0 and `wasm-bindgen` 0.2.129 are pinned in lockfiles.
- [ ] Red test a versioned `engine_version()` export in native Rust, browser worker and Node; make it return one shared schema version. Reject a host/core version mismatch before any mesh is loaded.
- [ ] Build release browser and Node packages from the same Rust revision. Add `npm run wasm:build`, `npm run wasm:test`, `cargo test --workspace`, and CI steps. Production build must fail if the generated WASM package is stale or missing; no silent TS fallback.
- [ ] Commit and push only after native/Node/browser smoke, TS tests and `npm run build` pass. Update handoff and `graphify update .`.

#### Task 0.3: Mesh-session ABI and failure behavior

**Files:** Add focused Rust mesh/session/ABI modules under both crates; add `src/workers/geometryClient.ts`, tests next to the client and under each crate.

- [ ] Red-test a `load_mesh(positions: Float32Array, indices: Uint32Array) -> handle` call, `mesh_bounds(handle)`, and `release_mesh(handle)`. Test invalid lengths, nonfinite coordinates, stale handles, double release, repeated load/release, memory cap and a worker crash. No per-triangle JS/WASM calls.
- [ ] Implement typed result/error codes and revision tagging; transfer input buffers once per worker operation. Benchmark copy/heap cost on the saved STL and a heavy synthetic mesh.
- [ ] Add cancellation test: kill/restart the worker during a long operation; assert no stale preview/export result and no retained mesh handle.

### Phase 1 — shared mesh and editor geometry

#### Task 1.1: Import/mesh representation

**Files:** Rust mesh/import/weld/decimate modules; narrow `src/workers/{importWorker,projectWorker,prepareImport}.ts`, `src/state/import.ts`.

Progress: the import worker's bounding-box centering, glTF raw-mesh transform/weld, chunk-fed binary and ASCII STL decode/rotation/weld, and heavy-tier display decimation are now Rust/WASM calls. Decimation has synthetic and saved-STL byte parity, direct browser WASM smoke, and a real heavy-tier browser-worker job on a 1,506,848-triangle synthetic grid. The old TypeScript decimator and its tests live only under `scripts/test-support/`; no production caller remains. ASCII STL has native tests, Node byte-parity fixtures, and an actual browser-worker import check. Non-worker import helpers and the pick BVH remain TypeScript. The task is not complete. The saved-STL centering copy-cost probe is a Node microbenchmark, not an end-to-end performance gate.

- [ ] Port binary/ASCII STL parse, vertex weld, finite validation, centering and display decimation. Match existing unit placement and original mesh IDs; keep GLTF container decoding in JS but pass raw arrays to Rust for geometry processing.
- [ ] Native, Node and browser parity tests cover malformed STL, handedness, high triangle counts, imported GLTF and saved-project reload. Delete production TS geometry only after these pass.

#### Task 1.2: Spatial/transform/brush contract

**Files:** Rust math/transform/BVH/raycast/brush modules; narrow `src/core/{vec3,transform,handedness}.ts`, `src/state/transform.ts`, `src/editing/screenBrush.ts`, viewport overlay/geometry modules.

- [ ] Port model ↔ plate and host-handedness transforms, normals, nearest/ray hits, face picking, overlay vertices and screen-brush projection. Preserve camera controls and GPU buffer creation as host adapters; pass matrices and strokes to Rust in batches.
- [ ] Test paint/add/remove against visible and occluded faces, near-plane cases, translated/rotated models and Babylon left-handed frames. Verify 60 Hz input remains responsive on the reference mesh; measure worker scheduling and WASM heap.

### Phase 2 — automatic analysis and dental intent

#### Task 2.1: Generic analysis, placement and zones

**Files:** Rust generic analysis/placement/zones modules; replace production use of `src/core/analysis/{mesh,placement,edgeAnchors,legacyRidges,nearestPoint,mergeByDistance,vertexNormals,random,supportCheck}.ts` and `src/core/supports/{zones,overlayMesh}.ts`.

- [ ] Port downward-face classification, remesh/minima/edge contacts, deterministic IDs, no-support zones and check diagnostics with native/browsers tests for every preset and manual edit. Preserve license notices and parity tie rules from `src/core/README.md`.
- [ ] Remove old production modules only when generic Generate, saved-project reload, preview and export all call WASM and golden tests pass.

#### Task 2.2: Dental orientation and trim geometry

**Files:** Rust dental orientation/contour/region/contact modules; replace `src/core/analysis/dental*.ts` and dental geometry in `src/supports/jobRunner.ts`.

- [ ] Port candidate trim-rim and central-opening detection, front/side axis and tilt selection, confidence/ambiguity, curved edge connection, face permission and contact-strip tuning. Do not encode a single reference STL angle.
- [ ] Run deterministic random rotations of the saved aligner; compare to intended orientation up to legitimate arch symmetry, and retain manual Step 1 correction on uncertain cases. Require independent patient and no-central-opening fixtures before claiming general reliability.
- [ ] Port Step 2 live strip width/offset/density mask and manual paint permission; compare blue/yellow/green outer trim rim, red opening rim and painted contact strip GLB from the shared Rust output. The cavity and top crowns remain unpainted by default.

### Phase 3 — all support geometry and safety

#### Task 3.1: Contact/route and every mesh part

**Files:** Rust support settings/landing/route/mesh modules; replace `src/core/supports/{mesh,meshBuilder,landing,autotree,roof,raft,raftGeometry,remesh,settings,supportRoute,supportPath}.ts` as algorithms; narrow `src/supports/{jobRunner,landing,supportFrame}.ts`.

- [ ] Port tips, necks, feet, pillars, Tree trunks/branches, Braces, Roof, Cage, raft and label geometry and attribution. Dental Roof/Cage remain off by policy; dental Tree/Braces remain on by default unless unsafe. Generic presets remain functional.
- [ ] For each part, red-test geometry and manual/automatic attribution, port, compare native/Node/browser output, then delete that TS algorithm. Compare contact IDs, omitted counts, triangle/component classes and preview/export on saved reference plus generic fixtures.

#### Task 3.2: Shared collision, islands and bounded repair

**Files:** Rust spatial clearance/island/route-selection modules; replace `src/core/supports/{bodyIntersection,modelCollisionIndex,pathPreflight,columnPathScreen,candidateSelection,dentalBodyClearance,contactReach,triangleIntersection}.ts` and untracked `genericBodyClearance.ts` reference behavior.

- [ ] During candidate/build selection, test full-width shafts/feet/Tree/Braces against the model and attempt deterministic bounded alternative landings/routes within mode permission. Retain exact final-mesh check because route preflight alone is provisional.
- [ ] Distinguish intended, bounded tip/neck reach from crossing an unrelated wall; classify `clear`, `blocked`, `inconclusive` and record component/contact ID. Manual parts cannot be silently deleted. Collision checks must be reused by generic and dental modes, including generic Roof/Cage.
- [ ] Add early-layer connectivity/island evidence using a bounded topology/slice method justified by benchmark; reinforce only inside approved dental contact strip. Report unresolved island and rim gaps, never expand permission from a heatmap.
- [ ] Red/green synthetic two-wall, branch, brace, roof/cage and cavity fixtures; run saved STL before/after memory/time and exact final crossing probes. Reject a regression, not just a crash.

### Phase 4 — one core everywhere; remove old runtime

#### Task 4.1: Workers, export, diagnostics and Babylon contract

**Files:** Narrow all four workers, `src/supports/export.ts`, `scripts/dental-region-review/*`, `dentalwork/run-review.bat`; add a small host-neutral package/contract for Babylon.

- [ ] Make browser preview, full Generate and STL export use the same accepted WASM result/revision. Node GLB diagnostic must call the same Rust algorithms and still color distinct rim methods, mask and actual contacts.
- [ ] Build a minimal Babylon adapter smoke test that loads the Node/browser package, hands in a left-handed mesh, requests a transform and support result, and confirms the returned right-handed core result transforms back correctly. No Babylon UI is needed for this contract proof.
- [ ] Delete remaining production TS geometry implementations and enforce a static import/AST audit. List each retained JS 3D API call with evidence that it only manages camera/render/GPU or serialized bytes.

#### Task 4.2: Release gate and push

**Files:** Update `dentalwork/{technical-algorithm,plain-language,support-module-boundaries,README}.md`, this plan, handoff, tests, CI/notice files as required.

- [ ] Run `cargo test --workspace`, browser/Node WASM parity, `npm test`, `npm run build`, `npm run walk`, saved-STL random-orientation/GLB checks, generic collision-heavy fixture, no-opening and independent aligner fixtures when obtained, plus memory/leak/performance runs. Inspect actual logs and rendered GLBs; do not infer broad safety from one fixture.
- [ ] Verify Step 1/2/3 UI, settings persistence, paint, rim coverage warnings, exact collision/island statuses and preview/export parity. Audit third-party license notices for retained Rust algorithm sources.
- [ ] Review every requirement in the design and existing `2026-10-26-support-ship-gates.md` against authoritative evidence. If independent fixtures or print review are missing, label that gate unverified and do not claim clinical reliability. Commit/push only a verified ship-ready code state; if not ready, push a clearly marked development checkpoint and keep the goal active.

### Current status and next exact action

The Rust toolchain, browser/Node WASM packages, version gate, mesh store, and several import kernels are in place. Open boxes above remain full-phase gates, not assertions that no partial work exists. Two untracked generic-clearance TypeScript reference files are not wired to Generate. **Next:** finish Task 0.1's exported-symbol inventory and baseline capture; then migrate non-worker import geometry and the pick index under Task 1.1. Orientation, contact placement, safety, and final support meshes still run in TypeScript. Update `docs/dental-rework-handoff.md` after each checkpoint.
