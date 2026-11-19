# Migration records

Dated notes from moving this app onto the vendored engine and the Babylon layers. The folder itself stays, because `glossary.md` in it is read by `src/glossary.test.ts` and `ui-spec.md` and the two release backlogs are living documents.

**3 documents, gathered into this one record on 2026-11-19.** Each is copied whole, nothing reconciled with later reality, under an anchor that is its old filename - so a reference anywhere in this repo, in an old commit message or in an audit log still finds it by that name.

| when | document | was |
|---|---|---|
| 2026-10-21 | [Babylon migration review — support core and editing behaviour](#2026-10-21-babylon-review) | `docs/migration/2026-10-21-babylon-review.md` |
| 2026-10-21 | [Heavy meshes in mixoDental — measurements and budgets](#2026-10-21-heavy-mesh-mixodental) | `docs/migration/2026-10-21-heavy-mesh-mixodental.md` |
| 2026-10-21 | [mixomesh performance audit — for mixoDental adoption](#2026-10-21-mixomesh-perf-audit) | `docs/migration/2026-10-21-mixomesh-perf-audit.md` |

---

<a id="2026-10-21-babylon-review"></a>

## 2026-10-21 — Babylon migration review — support core and editing behaviour

*Was `docs/migration/2026-10-21-babylon-review.md`.*

Read-only review at `e13ac3b` (App.tsx / ObjectViewport.tsx read from HEAD, not the working tree). Target: mixomesh (Babylon.js, maybe not React).

### 1. Framework coupling (core)

- `src/analysis/*`, `src/supports/*` (except tests), `src/state/project.ts`, `history.ts`: **no three/React/DOM imports**. Pure TS on `TriangleMesh`.
- `src/state/transform.ts:1-2` uses three `Euler/Matrix4/Quaternion/Vector3` only for compose/invert/apply of a TR matrix (`:17-23`), plus `transformFromObject(Object3D)` (`:71`) which is a viewport adapter. Replace with a ~60-line `math/transform.ts` (Euler XYZ → 3x3, apply, transpose-inverse); move `transformFromObject` to the viewport.
- `src/state/import.ts:1-2` uses `BufferGeometry` + `mergeVertices` (weld at 1e-4, `:24`), `Matrix4` bake (`:79`), `Object3D` traversal for glTF (`:47`). Import is app-side: keep a pure `weld(positions, indices?, eps)` + `bakeMatrix` in core; loaders stay per app (Babylon has its own STL/glTF loaders). `placeImportedUnits` (`:100`) is pure and portable.
- `src/workers/importWorker.ts:1` imports three's `STLLoader` — app-side, not core.
- Vite-specific: `new Worker(new URL('./x.ts', import.meta.url), {type:'module'})` at `analysisClient.ts:91`, `meshClient.ts:131`, `importClient.ts:38`. This pattern also works in webpack 5/esbuild, but make it injectable: clients take a `() => Worker` factory.
- Browser globals in core: `performance.now()` (`analysisWorker.ts:16`), `self` — fine in any worker. `crypto.randomUUID` is in App (`App.tsx:514`).
- Tests import three (`blenderParity.test.ts:2-3` builds the fixture with `BoxGeometry`) — replace with a literal box builder so the core test suite is three-free.

### 2. Data formats and coordinate conventions

- `TriangleMesh` = `Float32Array positions` + `Uint32Array indices` (`analysis/types.ts:1`). Units mm. **Y-up, plate y=0** (`supports/mesh.ts:12`). STL Z-up is converted at import: web = (x, z, −y) (`import.ts:86`).
- **Right-handed + CCW-outward assumptions** (each silently breaks if Babylon's left-handed default is used with the same arrays):
  - Face normal = (b−a)×(c−a), downward test `normalY<0` (`analysis/mesh.ts:38-48`), same in `supportCheck.ts:189`, `edgeAnchors.ts`, `autotree.ts:163`, `remesh.ts` vertex/edge normals (`:102,:133`).
  - Support builder winding (`supports/mesh.ts` MeshBuilder ~`:880-1060`) and the signed-volume flip that forces CCW-outward (`:852`, `:1061`).
  - `remesh.ts:34,690` maps Blender space ↔ web as (x,−z,y)/(x,z,−y): a proper rotation, valid only in right-handed web space.
  - `zonedAt` / `contactsInBrush` normal-facing tests (`zones.ts:22`, `selection.ts:19`) assume outward normals.
  - `transform.ts:20` Euler order 'XYZ' (three default), radians.
- **Recommendation: one adapter, no core changes.** Set `scene.useRightHandedSystem = true` in mixomesh's support scene/view, or else mirror Z at a single `toCore()/fromCore()` boundary (negate z of positions/normals **and** swap index 1↔2 per triangle; Euler: negate x,y rotations). Babylon also defaults to clockwise front faces in LH; with `useRightHandedSystem` the arrays render as-is. Babylon `Mesh.rotation` is YXZ order — do not feed `ModelTransform.rotation` into it; set `rotationQuaternion` from the core's matrix.
- Contacts: `SupportContact` position/normal in unit-local Y-up, normal points out of the model (`mesh.ts:13-25`). Auto ids encode position on a 0.01 mm grid (`placement.ts:349`) — persistence depends on this; keep it bit-exact.

### 3. Workers

- Protocols are plain discriminated unions (`meshProtocol.ts`, `analysisProtocol.ts`), structured-clone safe; results transfer `positions/indices` buffers (`meshWorker.ts:53`, `analysisWorker.ts:25`, request side `analysisClient.ts:86`). Mesh worker caches each unit's source by `sourceToken`, replies `need-source` after restart (`meshProtocol.ts:58`).
- Cancellation = coalescing (`dropped`) + `terminate()` restart for long jobs (`meshClient.ts:31-140`, `analysisClient.ts:113`). No cooperative abort; acceptable.
- Coupling: `MeshWorkerUnit extends PrintUnit` (`meshProtocol.ts:13`) — the protocol carries the app's scene model. For mixomesh, define a core `SupportJob {source, transform, settings, placement, manual, suppressed, deleted, zones}` and let `PrintUnit` satisfy it.
- Hosting in Babylon: workers are framework-free; only the factory URL changes.

### 4. Determinism and tests

Covered: placement rules and `composeContacts` id semantics (`placement.test.ts:127-179`), Blender parity by counts (`blenderParity.test.ts:16-24`: 100 contacts, 41649 triangles), `tipsOf` invariants (`mesh.test.ts:143`), selection, zones, export, raft. Missing goldens for a port: (a) exact contact id list + positions for 2–3 fixture meshes (mushroom, tilted plate, open mesh) at default settings; (b) support mesh vertex/index counts and component table (`part, contactId, start, count`) per fixture, preview and export; (c) `contactAtTriangle` for sampled triangles; (d) hash of `encodeStl` bytes. All float paths are deterministic (no `Math.random`; Blender hash `placement.ts:304`), so exact goldens are viable.

### 5. Structure quality

- Layering inversions: `analysis/placement.ts:1` imports `supports/remesh`; `supports/unitSupports.ts:4-5` and `export.ts:2` import `state/project` + `state/transform`; `selection.ts:1` imports `SceneCommand`. Core should not know the scene model.
- Sizes: `supports/mesh.ts` 1126 lines (contacts, columns, trees, braces, raft, labels, MeshBuilder, earClip, hull) and `remesh.ts` 1021 — split mesh.ts into `builder.ts`, `columns.ts`, `raftMesh.ts`, `label.ts`, `geom2d.ts`.
- Duplicated vector helpers in 7 files (`mesh.ts:1118-1126`, `placement.ts:358-364`, `edgeAnchors.ts:166-171`, `remesh.ts:1012-1018`, `autotree.ts:229-238`, `roof.ts:187`, `selection.ts:70`); `closestOnTriangle` twice (`autotree.ts:203`, `remesh.ts:902`). Extract `core/vec3.ts`.
- Dead/odd: orphan duplicate JSDoc line above `tipsOf` (`mesh.ts:345`); `PlacementSettings.sharpEdgeAngleDegrees` is validated (`placement.ts:135`) but `edgeAnchors` uses a fixed `SHARP_ANGLE` (`edgeAnchors.ts:21`) — the setting (fed from `scatterRidgeAngle`, `settings.ts:321`) has no effect on placement.

### 6. Editing behaviour in React components (HEAD)

| Behaviour | Where | Tangled with | Proposed home |
|---|---|---|---|
| Mode machine off/edit/zones, zones return target, undo floor | `App.tsx:79-89,101,431-462,118-121` | React state+refs | `editing/session.ts` |
| Tool, select style, brush mode/radius, zone kind/radius | `App.tsx:92-101` | React state | session state |
| Selection lifetime: clear on mode/unit change, prune on contacts change, delete clears | `App.tsx:124-126,575-584` | useEffect | session reducer events |
| Keys Tab/Esc/Enter/Delete/Backspace/G/R/Ctrl-Z/Y + input/BUTTON guards | `App.tsx:624-661` | DOM KeyboardEvent | `editing/keys.ts` |
| Stroke: left press on object starts, orbit disabled, ends on window pointerup/cancel/blur or `buttons&1==0` | `ObjectViewport.tsx:339-374` | r3f events, OrbitControls, window | `editing/stroke.ts` |
| Stamp spacing r/2 | `zones.ts:28` (pure, already) | — | keep |
| Pick: contact via shown mesh (`tipsOf` when tips view), structural parts pass through, click tolerance 4 px | `ObjectViewport.tsx:301,390-398,420-432,37` | three hit | `editing/pick.ts` |
| Right-click = erase within Erase radius; Delete = exact | `App.tsx:536-561`, `selection.ts:63` | dispatch | `editing/commands.ts` |
| Tips-only when camera y<0 or toggle | `ObjectViewport.tsx:262-270,541` | useFrame | `editing/view.ts` |
| Fit/Bottom framing | `ObjectViewport.tsx:233-258` | THREE.Box3/camera | `editing/view.ts` |
| Status-line choice | `App.tsx:443-449,491-492,550-553` etc. | inline strings | `editing/status.ts` |

Note: zone stroke wiring is not in HEAD's viewport (Task 3 in progress), only props (`ObjectViewport.tsx:61-66`).

Interface sketch (pure, no React/three/DOM):

```ts
// editing/session.ts
type Mode = 'off' | 'edit' | 'zones';
interface Session { mode: Mode; zonesReturn: 'off'|'edit'; undoFloor: number; tool: 'add'|'select';
  selectStyle: 'click'|'brush'; brushMode: BrushMode; brushRadius: number;
  zoneKind: 'paint'|'erase'; zoneRadius: number; selection: ReadonlySet<string> }
type SessionEvent = {type:'toggleEdit'; activeUnitId?: string; historyLength: number}
  | {type:'openZones'; from:'off'|'edit'; activeUnitId?: string; historyLength: number}
  | {type:'closeZones'} | {type:'activeUnitChanged'; id?: string} | {type:'contactsChanged'; contacts: readonly SupportContact[]}
  | {type:'toggleContact'; id: string} | {type:'paint'; ids: string[]; mode: BrushMode} | {type:'clearSelection'} | {type:'setTool'; ...};
function reduceSession(s: Session, e: SessionEvent): { session: Session; commands: SceneCommand[]; status?: Message };
// editing/keys.ts
interface KeyInput { key: string; mod: boolean; shift: boolean; targetTag?: string }
type Action = 'undo'|'redo'|'toggleEdit'|'closeZones'|'deleteSelection'|'clearSelection'|'deleteUnits'|'gizmoTranslate'|'gizmoRotate';
function keyAction(k: KeyInput, s: { mode: Mode; selectionSize: number }): { action: Action; preventDefault: boolean } | undefined;
// editing/stroke.ts
class Stroke { begin(button: number): boolean; move(buttons: number): 'sample'|'end'|'idle'; end(): void; get active(): boolean }
// editing/view.ts
function frameView(kind: 'fit'|'bottom', bounds: {min:Vector;max:Vector}, fovDeg: number, camera: Vector, target: Vector): { position: Vector; target: Vector };
function tipsView(toggle: boolean, cameraY: number): boolean;
// editing/pick.ts
function pickSupport(shown: GeneratedSupportMesh, triangle: number, alive: ReadonlySet<string>): string | undefined;
```

### 7. Specs as a UI spec

The two specs give rules, bar layout, colours `#7f0019` and `--blue #1d3461` (`support-selection-design.md:51`, `no-support-zones-design.md:36`) and lifetime rules, but lack: a state diagram (modes × tools × keys incl. guards), the full status-message/i18n key list with zh/ja, colour/opacity table for every overlay (preview add/remove/ring, see-through 'turning back', faint vs full zones, problem markers — currently `PREVIEW.*` constants in the viewport), click tolerance and brush-cursor spec, camera framing formula (1.15 margin, 1e-3 tilt), and pick precedence (support vs model, structural pass-through).

### 8. Proposed Task 5 (ordered, no behaviour change)

1. `editing/keys.ts` + table test of every key/mode/selection/guard row from `App.tsx:624-661`; App's listener calls it.
2. `editing/session.ts` reducer covering mode transitions, return target, undo floor, selection clear/prune/delete; tests for each lifetime rule; App holds it in `useReducer`.
3. `editing/view.ts` (`frameView`, `tipsView`) + numeric tests; `ViewCamera`/`PlateSide` call it.
4. `editing/stroke.ts` state machine + tests (begin non-left ignored, end on release/cancel/blur/no-button); used by Drag over and zones.
5. `editing/pick.ts` + `editing/status.ts` (message keys as data) + tests.
6. `math/transform.ts` replacing three in `state/transform.ts`; equality tests vs current output on random transforms.
7. Spec addendum: state diagram, i18n key list, overlay colour table.
Gate: `tsc`, `vitest`, build, browser smoke (select/Delete, zones, tips, Fit/Bottom). Later (pre-migration): `core/vec3.ts` dedupe, decouple core from `PrintUnit`, worker factory injection, golden fixtures, licence decision.

---

<a id="2026-10-21-heavy-mesh-mixodental"></a>

## 2026-10-21 — Heavy meshes in mixoDental — measurements and budgets

*Was `docs/migration/2026-10-21-heavy-mesh-mixodental.md`.*

Shared contract (budgets pattern, tiers, pre-parse refusal, memory model, progress UX): mixomesh
`docs/superpowers/specs/2026-10-21-heavy-mesh-handling.md` (branch `feat/heavy-mesh`). This note holds
the mixoDental side; the controller merges these numbers into the shared spec.

Fixtures: `npx vite-node scripts/make-heavy-meshes.ts` (bumpy closed spheres, binary STL, written to the
git-ignored `.playwright-mcp/heavy/`). Harness: `node scripts/measure-heavy.mjs [--runtime desktop]` (Vite
on 5202 + a private Chromium from the Playwright cache, real file input, renderer/GPU private bytes
sampled every 100 ms). Machine: Windows 11, 64 GB RAM, RTX 3090.

| Fixture | Runtime | Import | Longest main-thread block | Generate (place + preview) | Peak renderer | Peak GPU process | JS heap after |
|---|---|---|---|---|---|---|---|
| 2.0M binary STL (95 MiB) | web | 2.0 s | 56 ms | 42.9 s | 1.89 GB | 237 MB | 93 MB |
| 5.0M binary STL (238 MiB) | web | 3.7 s | 91 ms | 110 s | 4.13 GB | 260 MB | 151 MB |
| 10M binary STL (476 MiB) | web | refused before parsing, 245 ms | 0 | — | 122 MB | 206 MB | — |
| 10M binary STL | desktop (budget then 6M) | 10.0 s | 0 | page stopped responding at 210 s (placement 65 %) | 6.47 GB | 367 MB | — |

Import pipeline alone (Node, same code as the import worker): 10M welds in 2.4 s at 388 MB peak RSS;
three's STLLoader + `mergeVertices` took 16.7 s and 2.19 GB for the same file (same 4,995,958 vertices).

Budgets (`src/core/budget.ts`): **web and desktop both warn at 1.5M and refuse above 6M.** Import is cheap,
but Generate costs about 0.85 GB of renderer memory per million triangles, and 10M stopped the tab, so
the refusal line follows generation, not import. A desktop shell runs the same Chromium renderer, so it
gets the same numbers until placement memory drops. mixomesh (import and editing only) measured web
2.5M / 10M and desktop 6M / 24M.

Differences from the shared wording: the refusal omits "or use the desktop app" (mixoDental has none).

Guards added after review (Task 9 fix round 1): the plate may hold at most 6M triangles (`plate-full`
at import); placements, preview builds and exports start only while running heavy jobs plus their own
stay within 6M (`src/core/jobGate.ts`, shown as "Queued"); Generate is refused when what can run at
once × 850 MiB/M exceeds half of `navigator.deviceMemory`, only when it reports less than 8 GB (the
value is clamped at 8, so 8 or missing means unknown or large: the 6M gate alone applies).

---

<a id="2026-10-21-mixomesh-perf-audit"></a>

## 2026-10-21 — mixomesh performance audit — for mixoDental adoption

*Was `docs/migration/2026-10-21-mixomesh-perf-audit.md`.*

Date: 2026-10-21 · mixomesh HEAD `6bcfc75` (release 0.2.0) · mixoDental branch `feat/migration-prep` · Read-only; nothing in either repo changed (`git status` clean after the test run).

### Verdict

**PARTLY.** Adopt mixomesh's **WorkerTask/serveTask protocol** (it is real, small, well tested, and used by all 7 workers). **Do not** adopt mixomesh's large-mesh handling as a model, because it does not handle large meshes well. STL and 3MF parse on the main thread. STL stays unwelded (about 84 B/triangle on the CPU, the same again on the GPU). The 4x budget check runs only *after* the whole file is parsed. Picking uses Babylon's default per-triangle ray test, with no BVH or octree, and there is no LOD. The budget numbers are guesses, not measurements. `GeometryStore` is a revision counter plus a copy helper, not a single owned copy; ADR 0006 itself says Babylon still owns the vertex data. For a 10M-triangle print file, mixoDental' current design (worker parse, weld to an indexed mesh, three-mesh-bvh picking, structurally shared history) is already ahead in the areas that matter most. It has its own crash risk in the weld step.

### Test run

`node --import ./tests/register-hooks.mjs --test tests/*.test.mjs` in S:\ai\mixomesh (no installs; TMP pointed at the scratch dir): **767/767 pass, 11.9 s**. Log: `C:\Users\DCT\AppData\Local\Temp\claude\S--ai-mixodental\685e21c0-818c-4598-a157-0d5200c45358\scratchpad\mixomesh-audit\unit-tests.log`. WorkerTask has 17 unit tests: abort, timeout restart, crash, stale revision, serial, per-job and fallback. These are protocol tests with a fake worker. **None of the tests use a large mesh.** The largest fixtures are real-scan GLBs of about 1 MB (`tests/fixtures/real-scans/`).

### The 8 areas

| # | Area | Rating | Evidence (mixomesh) |
|---|---|---|---|
| 1 | Import path | **partial / broken for 10M** | **OBJ** goes to a worker (`src/core/assets/AssetImport.js:101-110`, `src/core/WorkerImport.js:25-30`). The worker fetches the blob URL itself and transfers the arrays back. **STL, 3MF, GLB/glTF** use `BABYLON.SceneLoader.LoadAssetContainerAsync` **on the main thread** (`AssetImport.js:109`). Babylon's binary STL loader reads the whole file and builds **unindexed** arrays: positions, normals and a 0..n index, 84 B/tri (`node_modules/@babylonjs/loaders/STL/stlFileLoader.js:142-184`). There is no weld. ASCII STL builds plain JS `number[]` with `push` (`stlFileLoader.js:188-228`), which is on-heap and very large. The whole file is hashed with `sha256Hex(await blob.arrayBuffer())` before parsing (`AssetImport.js:190-191`, `:293-296`). The Blob stays alive for re-instantiation (`setBlobUrl`, `:283-284`). Unit-scale/flip baking runs on the main thread, `bakeTransformIntoVertices` per mesh (`src/core/ImportNormalizer.js:157-204`). **3MF**: the whole model XML is read as one JS string (`src/core/ThreeMFLoader.js:157`, `modelFile.async('text')`), then SAX-parsed in 128 KB chunks with yields (`src/core/import/ThreeMFXml.js:105-108`). That is good, but triangles go into **Float64** builders with 7 fields per triangle, 56 B/tri, and the buffer doubles as it grows (`ThreeMFXml.js:11-24,80-81`). They are then copied into JS `number[]` per material group (`ThreeMFLoader.js:384`, `:439`). The final 3MF meshes are indexed. Estimated peak for a 10M-triangle binary STL (500 MB): Blob 500 MB + hash buffer 500 MB (transient) + loader buffer 500 MB + Babylon CPU arrays 840 MB + GPU about 840 MB, so **about 2–2.3 GB of JS-side memory and about 0.85 GB of VRAM, all on the UI thread**. |
| 2 | Workers | **works (protocol) / partial (coverage)** | `src/core/workers/WorkerTask.js:34-178`. Persistent or per-job workers, serial or parallel jobs, per-job timeout (`:89-92`), AbortSignal (`:93-101`, with an idle restart after abort at `:99`), stale-revision echo (`:136-138`), crash restart with `restarted` codes (`:155-164`). It is used by Base64, MeshValidate, MixoRefine, ObjParse, OpfsWrite, Boolean and StlEncode (grep `new WorkerTask`). Transferables are used correctly: callers copy and then transfer (`src/core/ValidateWorker.js:47-52`, `src/core/MixoRefinementWorker.js:41-48,84-88`, `src/core/print/StlWriter.js` around line 59-80, `src/core/BooleanWorker.js:29-34`). Results come back through `transferable()` (`serveTask.js:11-13`). **No worker keeps a long-lived mesh copy.** Validate and Boolean are persistent but stateless; refine is per-job (`MixoRefinementWorker.js:68-75`). Gaps: (a) **import of STL/3MF/GLB and repair do not run in workers**; repair is a classic-script WASM on the main thread, capped at 300k triangles (`src/core/repair/MeshRepair.js:17-27`). (b) `fallback` runs only when *creating* the worker fails, not on a crash or timeout (`WorkerTask.js:79-85`); callers handle that themselves. (c) **The OBJ worker falls back to a main-thread parse after its 120 s timeout** (`WorkerImport.js:19,44`, `AssetImport.js:105-107`). The files that time out are the huge ones, so the fallback then freezes the tab on exactly those files. (d) Abort only exists for Boolean and refine; import has no cancel. |
| 3 | GeometryStore | **partial (not one copy)** | `src/core/geometry/GeometryStore.js` is about 90 lines: a `Map` of revision numbers plus `extract()`, which makes a fresh `Float32Array.from`/`Uint32Array.from` copy each call (`:74-91`). Its header says "Babylon still owns the vertex data… Nothing is cached". ADR 0006 "Not now" lists *"Babylon ownership flip (the store becoming the source of truth…, freeing Babylon's CPU copies) — next project"* (`docs/adr/0006-workers-and-memory.md`). Real copies per mesh: Babylon CPU arrays + GPU buffers + one copy per worker job. There are also duplicates elsewhere: `_unshareVertexBuffers` copies (`ImportNormalizer.js:91-104`), the validation union buffer (`src/core/MeshValidator.js:230-260`), a wireframe overlay `mesh.clone` with `wireframe=true` (`src/core/scene/EdgeOverlay.js:37-55`; on WebGL, Babylon builds an extra line index buffer for this), and soft-deleted meshes held for undo (area 6). Non-indexed meshes get a 0..n index built with a per-element callback, `Uint32Array.from({length}, fn)` (`GeometryStore.js:78-80`). |
| 4 | Budgets | **partial; guessed** | `src/core/storage/capabilities.js:35-36`: WEB 1.5M, DESKTOP 6M. Boolean caps of 250k/1M are at `:39-40`. The justification comment (`:27-34`) is reasoning by analogy ("same reasoning as DEFAULT_BOOLEAN_TRIANGLE_CAP…"); **no measurement is cited, and no test or benchmark measures it.** Hard refusal is `assertTriangleCapacity` at 4x (`src/core/import/ImportLimits.js:52-57`), with the message "…has N triangles; the polygon handling limit for this runtime is M. Simplify or split the model before importing." For STL/OBJ/GLB it runs **after the full parse into a Babylon container** (`AssetImport.js:306-307`, `_assertContainerCapacity` `:239-246`), so peak memory is already spent before the refusal. 3MF checks during SAX parsing (`ThreeMFXml.js:80`), which is good, but only after the whole XML string is in memory. Above 1x there is only a warning toast (`AssetImport.js:248-257`). The HUD warns at 70% and 90% (`src/ui/MeshStats.js:42`), and hover picking turns off at 70% (`src/core/Hover.js:12`). **No memory estimate is made before import.** The only pre-check is file size ≤ 1 GB (`ImportLimits.js:8`, `:17-21`), although binary STL gives an exact triangle count for free: `(size-84)/50`. **There is no decimated display mode.** Auto-validation is skipped above 100k *vertices* (`MeshValidator.js:17`, `:613-615`); for unwelded STL that is only about 33k triangles. |
| 5 | Rendering | **missing (for heavy meshes)** | `new BABYLON.Engine(canvas, true, {stencil:true})` (`src/core/SceneManager.js:195`), or WebGPU (`:211-213`). No code anywhere uses `freezeWorldMatrix`, `doNotSyncBoundingInfo`, `material.freeze`, `freezeActiveMeshes`, octrees (`subdivide`/`createOrUpdateSubmeshesOctree`) or LOD (grep finds 0 hits). Uint32 indices are used implicitly; STL is unindexed. **Picking is Babylon's default per-triangle `scene.pick`** (`SceneManager.js:654`, `InputManager.js:306`). The app registers a non-camera `onPointerObservable` (`InputManager.js:159`). That makes Babylon's own `_checkForPicking()` true, so **Babylon also picks on every pointerdown and pointerup**, any button, orbit included (`node_modules/@babylonjs/core/Inputs/scene.inputManager.js:202-203,707-712,458-460`). The context menu picks twice more (`InputManager.js:578-579`). That is about 3 linear passes over 10M triangles per click. What does exist: adaptive hardware scaling (`src/core/scene/AdaptiveResolution.js`), the hover throttle and 70% cut-off, and selection-outline gating. |
| 6 | Undo/history | **partial** | Commands, not snapshots. `STACK_LIMIT = 200` (`src/core/HistoryManager.js:22`). Repair is not undoable (`src/core/repair/RepairSession.js:167`). **Delete and Boolean keep the whole Babylon mesh alive, disabled** (`src/core/commands/HierarchyCommands.js:215-240`, `BooleanCommands.js:136-176`). Nothing disposes it when a command drops off the stack (`HistoryManager.js:58`, no `dispose`). The GeometryStore comment confirms: "Deleted objects stay alive for undo… [project reset] is the only point where revisions can be released" (`GeometryStore.js:50-55`). So deleting a 10M-triangle mesh frees **nothing**: about 1.7 GB CPU+GPU stays held until New/Open. |
| 7 | Tests/benchmarks, desktop | **missing** | No perf tests and no large-mesh fixtures. `tests/scan-probe.mjs` reports timings on about 1 MB GLBs only. Electron: `electron/main.cjs:98-100` sets no `js-flags`, `--max-old-space-size` or GPU memory switches. The desktop 4x "budget" (24M triangles) runs on the same renderer heap as a Chrome tab. Typed arrays are off-heap, but 3MF `number[]` and ASCII STL arrays are on-heap and capped by V8's pointer-compression cage, about 4 GB. |
| 8 | Gaps/bugs (5M–10M STL) | **broken** | See the top risks below. |

### Top risks for a 10M-triangle print file (in mixomesh today)

1. **Main-thread binary STL parse plus unwelded storage**, about 2+ GB peak (area 1). On web the 4x limit is 6M, so a 10M file is refused only after it has been fully parsed, if the tab survives that long. On desktop (24M limit) it is accepted, with a multi-second UI freeze during parse and bake.
2. **3MF over about 500M characters of XML cannot load at all.** `modelFile.async('text')` hits V8's string limit (about 2^29 characters). A 10M-triangle 3MF model XML is about 0.7 GB, which throws `Invalid string length` (`ThreeMFLoader.js:157`). The Float64 and `number[]` buffers add about 1 GB more before Babylon even sees the mesh.
3. **Per-triangle picking about 3x per click**, plus Babylon's implicit pointerdown/up pick on orbit. That means visible stalls on every interaction.
4. **Soft delete retains the full mesh**, and repeated import/delete grows memory without bound until New/Open.
5. **OBJ worker timeout falls back to the main thread** for exactly the files that are too big (120 s, then freeze).
6. ASCII STL takes a JS-array path through Babylon's loader. That is several GB on-heap and an out-of-memory crash.
7. Embedding assets in a save: base64 of a 500 MB asset is a string of about 667M characters, above V8's limit (`ProjectSerializer.js:200-209`, `PersistenceManager.js:55` `JSON.stringify`). Autosave skips embedding unless the asset is a loose drop with no file handle (`ProjectSerializer.js:186-189`); in that case it re-encodes on every interval.

### mixoDental today — comparison

| Topic | mixoDental | vs mixomesh |
|---|---|---|
| STL parse | In a worker, buffer transferred (`src/workers/importClient.ts:151-153`, `importWorker.ts:216-218`) | **Better** (mixomesh: main thread) |
| Weld/indexed | Welds to an indexed `TriangleMesh` (`src/state/import.ts:21-34`). 10M tris becomes about 5M verts, about 180 MB | **Much better memory**, about 18 B/tri vs 84 |
| Weld cost | Worker peak: buffer + STLLoader positions/normals + `geometry.clone().rotateX` (`import.ts:86`) + position clone (`:23`) + three's `mergeVertices`, which builds a **string-keyed hash per vertex** (30M strings). Likely to **run out of memory or take minutes** at 10M; no timeout, cancel or size check | **Worse risk** at 10M (but it fails inside the worker, not the tab) |
| glTF | `GLTFLoader.parse` and the raw copy on the main thread (`App.tsx:375-382`), weld in the worker | Similar to mixomesh |
| Budget/refusal | None for import. Only the overlay refinement cap of 1.5M (`ObjectViewport.tsx:212`) | **Worse.** No pre-check, no message |
| Worker protocol | Three hand-rolled clients (import, analysis pool, mesh with replace-and-restart) | Worse uniformity; mixoDental has no timeouts. Cancellation by restart exists (`analysisClient.ts:47-52`, `meshClient.ts:103-113`) |
| Long-lived worker copy | Mesh worker keeps one source copy per unit on purpose, for its caches; the model is sent once per token (`meshClient.ts:84-100`, `meshWorker.ts:203`). The analysis worker gets a transferred copy per job (`analysisClient.ts:85-86`) | Deliberate; costs 1 extra copy. mixomesh has none, because it runs no long-lived geometry jobs |
| Picking | three-mesh-bvh `acceleratedRaycast` + `firstHitOnly` (`ObjectViewport.tsx:537,557,620-622`) | **Much better**. But `computeBoundsTree` runs synchronously on the main thread (`ObjectViewport.tsx:107-118`), about 1–3 s at 10M |
| History | Immutable snapshots with structural sharing, so meshes are shared, not copied (`src/state/history.ts:14-25`); limit 100 | **Better**. A deleted unit's mesh is freed when it leaves the 100-step window |
| Serialization | `sceneJsonReplacer` uses `Array.from` on typed arrays into JSON (`src/state/project.ts:167-171`). Used only in tests today; a trap if wired to save/autosave | Latent risk |
| Tests | Unit tests; no large-mesh benchmarks either | Equal (both missing) |

### Recommendations

**Adopt as-is**
- `WorkerTask` + `serveTask` + `transferable()` (port to TS). Rules: copy then transfer; per-job `timeoutMs`; `AbortSignal`; `restarted` and `stale` codes. Migrate `importClient` first, since it is closest to a plain job. Keep the mesh client's own replace/need-source logic on top of WorkerTask rather than forcing it in.
- The ADR 0006 rule "record revision before the job, compare after the await". mixoDental gets this almost for free through object identity of `unit.source`, and an explicit counter is fine too.
- The import caps style: `assertImportFileSize`, zip-safety checks, and one user-readable refusal message.

**Adopt but fix**
- Budgets: keep the *shape* (runtime tier, warn at 1x, refuse at 4x, HUD at 70/90%). Do **not** copy 1.5M/6M. mixoDental stores about 18 B/tri welded vs mixomesh's 84, plus a BVH and one mesh-worker copy. **Measure** peak heap and VRAM on 2/5/10M fixtures and derive the numbers from that. **Refuse before parsing**: binary STL count = `(byteLength-84)/50`; ASCII STL or glTF accessor counts give a cheap estimate.
- `GeometryStore`: take the idea (revisions + `extract` gives a transferable copy) and drop the Babylon coupling. In mixoDental the immutable `TriangleMesh` already is the store. Make it the **only** CPU copy: pass the same arrays to three.js `BufferAttribute`, then drop the CPU side after GPU upload if raycasting moves to the BVH.
- WorkerTask fallback: never fall back to a main-thread parse for jobs above a size threshold. mixomesh's OBJ timeout fallback shows why.

**Do not adopt**
- mixomesh's import pipeline (main-thread SceneLoader, unwelded STL, whole-file hash, post-parse refusal), its picking (per-triangle; keep three-mesh-bvh), and its soft-delete undo retention.

**Fix in mixoDental regardless (10M readiness)**
1. Replace `mergeVertices` with a typed-array spatial-hash weld: grid or sorted keys, no strings, in-place. Drop the extra `clone()` calls in `geometryToMesh` and `importStlUnit`, and parse STL straight into welded arrays.
2. Pre-parse triangle estimate and refusal message; a timeout and cancel on import.
3. Build the BVH off-thread: three-mesh-bvh `GenerateMeshBVHWorker`, or build it in the import worker and transfer it.
4. Keep `sceneJsonReplacer` away from real saves; use a binary format.
5. Add a perf fixture set (2M/5M/10M STL) and record import time, peak heap and VRAM. Neither repo has this today.
