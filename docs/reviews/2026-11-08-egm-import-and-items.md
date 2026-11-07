# EGM Code Review — import, Items page, and the release mechanism

**Target:** commits `83a4998~1..c4bb62f` on `main` (12 commits, 36 files, +1520/−159)
**Reviewers:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (4 parallel lenses, deduplicated)
**Synthesizer verification:** every 🔴 below was re-traced against the code by the synthesizer, not taken on a reviewer's word.

**Counts:** 6 🔴 Blocker · 18 🟡 Major · 14 🟢 Nit

**Verdict: NOT READY.** Four blockers are behavioural and all four live in the release mechanism and the Items page — the two things this change exists to add. One is a permanent per-unit worker loop; one makes a finished unit's supports vanish irreversibly in the *ordinary single-aligner flow*, not just in a deck. Separately, the step's headline memory claim is not achieved, and the gate is substantially weaker than its numbers imply: the single most important new pipeline in the change (worker verdict → unit → row sentence) survives deleting its joining line with all 1352 tests still green.

A note on the gate evidence, which held up: `tsc 0`, `vitest 1352`, `build 0` are consistent with what we read. Two caveats. `walk 157 of 158` has a machine-dependent denominator (Nit 30). `walk:locales ALL PASS 39 checks` is true and says nothing about this release — the locale pass never visits the Items page (Major 23).

---

## Prioritized Findings

### 🔴 BLOCKER 1 — Every released unit enters a permanent 600 ms re-check loop

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness` (found independently, identical mechanism) — **verified by synthesizer**
* **Affected Scope:** `S:/ai/mixodental/src/App.tsx:639`, with `:584`, `:601`, `:650`

```ts
// App.tsx:639 — the staleness test
return unit.supports && entry && buildSettled(unit) && (entry.unit !== unit || entry.mesh !== currentBuild(unit, built.get(unit.id)));
```
```ts
// App.tsx:584 — runCheck narrows a released build to undefined
const mesh = hasGeometry(current) ? current : undefined;
```
```ts
// App.tsx:601 — and stores that undefined on the problems entry
setProblems((current) => new Map(current).set(unit.id, { unit, mesh, items }));
```

**Discrepancy.** The two sides of line 639 can never agree once a build is released. `currentBuild(unit, built.get(unit.id))` is `latest?.unit === unit ? latest.mesh : undefined` (`vendor/mixo-geocore/host/supports/unitSupports.ts:69`); `releaseBuild` deliberately preserves the `unit` reference (`releasedBuild.ts:58`), so it returns the **truthy `KeptBuild`**. Meanwhile `runCheck` forces `entry.mesh` to `undefined`. So `undefined !== KeptBuild` is permanently true, `buildSettled(unit)` is true (a released build counts as settled, `:333`), and `unit.supports` is set. The unit is permanently `stale` → the effect schedules `runCheck` after 600 ms → `runCheck` calls `setProblems` with a **new Map** → `problems` is in the effect's own dependency list (`:650`) → the effect re-fires and schedules again. `joinRun` deletes its entry on settle, so each cycle dispatches a **new analysis-worker `check:<id>` job over the full source mesh**.

Before this change the loop converged because both sides became `undefined` together. The release path is precisely what breaks the fixed point.

**Consequence.** On a case of eight, seven finished units each dispatch a worker check every 600 ms for the rest of the session, plus a render loop — the exact opposite of the step's stated purpose. `listedProblems` (`:620-633`) is also stuck in the `uncovered(...)` branch, so `outOfDate` is permanently true.

**Second site, same defect** — `S:/ai/mixodental/src/components/useFixSpot.ts:81`:
```ts
if (!entry || entry.unit !== unit || entry.mesh !== currentBuild(unit, built.get(unit.id))) return;
```
Here the mismatch never resolves, so a pending Fix re-check never clears: `setRechecking(undefined)` is unreachable and the finding stays marked "Re-checking…" forever.

**Recommendation.** Make the two sides agree. Either store the released build as the `problems` mesh (`mesh: current`), or apply the same narrowing on line 639 (`entry.mesh !== (hasGeometry(m) ? m : undefined)`). Better: record on the `problems` entry *which build entry* was checked (`built.get(id)` — the `UnitBuild`, whose identity release does not change) rather than the mesh. Add a test that a released unit does not re-enter `stale`. Note that fixing this and Major 7 are coupled — see Major 7.

---

### 🔴 BLOCKER 2 — Release is irreversible: a released build is never rebuilt, and reports itself as settled

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (3 of 4) — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:534`, `:333`, `:368`, `:378`; `src/plate/releasedBuild.ts:67-70`

```ts
// releasedBuild.ts:67-70 — the promised invariant
/**
 * Release every build whose unit is finished, keeping the one named by `keep` — the unit being looked
 * at, which still needs its geometry drawn. Returns the same map when nothing changed.
 */
```
```ts
// App.tsx:534 — the rebuild effect refuses an unchanged unit
if (previous && previous.unit === unit && previous.index === index) return;
```

**Discrepancy.** "The unit being looked at has its geometry" is enforced only at release time, and there is no restore path. Releasing does not change the `PrintUnit` object, so (a) `requested.current` still matches and the build effect returns early — no rebuild is ever requested; and (b) `buildSettled` is true, so `building()` is false (`:368`) — no spinner, no status, no "building" state. The sequence *finish unit 1 → inspect unit 2 → return to unit 1* leaves unit 1 permanently geometry-less **while it is the active, inspected unit**: `activeMesh` is `undefined` (`:378`), its supports are absent from `supportMeshes` (`:342-345`), `dentalRimGap` reads `'unavailable'` (`:379-383`), `runCheck` takes the "no current build" path so the check can never report clean (`:584`), and `denture.resolveAll` silently no-ops.

The commit acknowledges that releasing stops a finished unit's supports being drawn ("a visible change rather than a no-op") but not that it is **irreversible**. For a flow whose premise is "inspect one row out of eight", returning to row 3 is the common case, and the only escape is editing the unit (which makes a new object) or re-importing.

**Recommendation.** Make a released build not count as settled, so selecting the unit re-requests its build (with a visible "rebuilding supports" state); or make `keep` reactive in both directions. Then test "select a released unit → its build is requested again". If irreversibility is in fact the intent, the doc comment must stop claiming an invariant the code does not maintain, and the deck must gate re-opening a released row.

---

### 🔴 BLOCKER 3 — Deselecting releases the unit you are *currently reviewing*, in the ordinary one-aligner flow

* **Reviewer Lens:** `egm-codebase-details` — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:357-359`, `:977`; `src/state/project.ts:146-148`; `src/dental/editingMode.ts:319-322`

```ts
// App.tsx:357-359 — keep is the CURRENT selection, which is legitimately undefined
useEffect(() => {
  setBuilt((current) => releaseFinished(current, session.dentalFinished, scene.activeUnitId));
}, [session.dentalFinished, scene.activeUnitId]);
```
```ts
// editingMode.ts:319-322 — export finishes the unit WITHOUT leaving review
case 'exportedDental':
  // The stage does NOT move: the operator is still on Step 3 and may Add another or Exit from it.
  return state.mode === 'dental' && state.dentalStage === 'review'
    ? { ...state, dentalFinished: finished(state, event.unitId) }
```

**Discrepancy.** This is the reachable-today instance of Blocker 2, and it needs no deck at all. `exportedDental` adds the unit to `dentalFinished` while the operator **stays on Step 3 reviewing it**. `scene.activeUnitId` becomes `undefined` on a plain left-click on empty space — `App.tsx:977` `if (unitId === null) return dispatch({ type: 'selection/set', unitIds: [] });` → `project.ts:146-148` `withoutActiveUnit(scene)`, driven by `vendor/mixo-geocore/editing/pick.ts:79`. The effect then runs with `keep === undefined`, and `releaseFinished` releases **every** finished unit including the one on screen. `heldBuilds`/`supportMeshes` drop it, `UnitObject` gets `supports === undefined`, `useGeometry` disposes — the supports vanish from the plate, permanently, per Blocker 2. `finishDental` has the same exposure via `withMode(..., 'off')`, which preserves `dentalFinished` (`vendor/mixo-geocore/editing/session.ts:107`).

**Consequence.** Export your one aligner, click the background to deselect, and its supports disappear for the session. The commit's acknowledgement covers *switching to another unit*; it does not cover *deselecting*, where there is no other unit to look at and nothing to free for.

**Recommendation.** `keep` must be the *last* unit looked at, not the current selection: `scene.activeUnitId ?? lastActiveRef.current`. Additionally gate the effect on a non-empty `keep` and on `session.dentalStage !== 'review'`.

---

### 🔴 BLOCKER 4 — An all-refused drop lands on a blank Items page with no way out

* **Reviewer Lens:** `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (3 of 4) — **verified by synthesizer**
* **Affected Scope:** `src/App.tsx:1467`, `:1328-1333`, `:1319`; `src/items/ItemsPage.tsx:36-71`

```tsx
// App.tsx:1467 — switches to 'items' unconditionally
onFiles={(files) => { void importFiles(files).then(() => setStartScreen('items')); }}
```
```ts
// App.tsx:1328-1333 — the only automatic escape, guarded on a non-zero previous count
if (lastUnitCount.current > 0 && unitCount === 0) {
  send({ type: 'exit' });
  setStartScreen('drop');
}
```

**Discrepancy.** `importFiles` swallows its own failures (`:854-860`), so the `.then` always runs. If every dropped file was refused, `imported.length === 0` returns early after `badFile(...)` and **no unit is added** — but the screen still switches to `'items'`. `ItemsPage` renders no Back control, installs no `onKeyDown`, and renders no primary when `next` is `undefined`; the automatic escape at `:1328` does not fire because the count was 0 all along. The operator is left on a blank page whose only working control is the language select. The refusal message is clobbered too: `:1319` rewrites the status to `START_HINT['items']` as soon as `startScreen` changes, so the one sentence naming the bad file is gone.

This also contradicts commit `198e5e3`'s claim that "every Back or Escape returns to Drop" — on this page neither does. Even in the success case the page is a dead end: `'items'` is set at exactly one place (`:1467`) and `startItem` does `setStartScreen(null)` (`:1311`/`:1314`) with nothing anywhere setting it back.

**Recommendation.** Only switch to `'items'` when the import actually added units (have `importFiles` resolve with what it added), and give `ItemsPage` the same `start-back` control and Escape handler every other start surface has.

---

### 🔴 BLOCKER 5 — zh-Hant uses Japanese character forms, violating the Taiwan-wording rule

* **Reviewer Lens:** all four reviewers (unanimous) — **verified by synthesizer**
* **Affected Scope:** `src/locales/zh-Hant.ts:719-720`, `:723`

```ts
'Has one open edge loop.': '有 1 個開放邊縁。',
'Has {n} open edge loops.': '有 {n} 個開放邊縁。',
...
'Some faces point inwards.': '部分網格面朝内。',
```

**Discrepancy.** `縁` (U+7E01) is the Japanese *shinjitai*; Traditional Chinese is `緣`. `内` (U+5185) is the Japanese/simplified form; Traditional is `內`. The file is otherwise consistent against itself: `邊緣` appears at `:86`, `:188`, `:439`, `:470` and 30+ more; `內` at `:71`, `:148`, `:154`, `:337`. These three lines are the **only** occurrences of `縁` and bare `内` in the whole dictionary. Lines `:721-722` of the same new block even use the correct `邊` (`'有 1 個多面共用邊。'`), so the block disagrees with itself about "edge". The likely cause is a copy across from `ja.ts:714`, where `縁` is correct.

No guard catches it: `src/i18n.test.ts:132` blocklists whole mainland *words* (`MAINLAND = ['文件', '默認', …]`), never character forms, and `walk:locales`'s 39 checks never read these strings (Major 23).

**Recommendation.** `開放邊緣` and `部分網格面朝內`. Then add a character-form check beside the `MAINLAND` list rejecting `縁|内|緑|沢|増` in `zh-Hant.ts` — this class of defect will recur every time a string is copied from `ja.ts`.

---

### 🔴 BLOCKER 6 — `src/items/README.md` says the shipped page does not exist (hard rule violation)

* **Reviewer Lens:** all four reviewers (unanimous) — **verified by synthesizer**
* **Affected Scope:** `src/items/README.md:107-111`, `:3-4`; `docs/ui-styling.md:429-458`

```md
## Not here yet

The page, the row component, its `data-ui` names and the three-language sentences — §8 steps 6a and
7b. Storing the verdict was the other half of 7b and is done.
```

**Discrepancy.** All four of those things landed in this change (`ItemsPage.tsx`, `rowText.ts`, the `items-*` names, 20 keys in ja + zh-Hant). The README was touched in this same diff without updating the section. It also never mentions `ItemsPage.tsx`, `rowText.ts`, `itemSummary.ts` or `nextItem.ts` — the four files that are now most of the directory — and `:3-4` still says the module decides "what that row says — and nothing else yet". This violates the project rule "each module has docs + tests **and the README map is updated**", and it is the single most misleading artefact in the change: a fresh reader concludes `src/items/` is a classifier only and goes looking for the page elsewhere, or builds a second one.

Two companion violations of the same rule family:
* The five new `data-ui` names (`items-row-<id>`, `items-preview-<id>`, `items-verdict-<id>`, `items-remove-<id>`, `items-start`) are **not** in the data-ui table — `docs/ui-styling.md:429` is still `| Start | start-denture |`. `docs/designer-guide.md:78` makes this mandatory: "Every element you add or touch gets a class and a stable `data-ui="name"` … **Add the name to the data-ui table in `docs/ui-styling.md`**". Neither Items nor Drop appears in `designer-guide.md` at all. Not caught by CI: `src/ui/uiStylingDoc.test.ts:49` only checks the doc *contains* the literal `'data-ui'`.
* `releasedBuild.ts` and `startDrop.ts` are new modules in `src/plate/` and `src/components/`, neither of which has a README, and neither module is named in any `.md`.

**Recommendation.** Replace "Not here yet" with the module map (one line per file), rewrite `:3-4` to say the directory owns the page, state what genuinely remains (repair's four states), add the five names to `docs/ui-styling.md`, and add `src/items/README.md` to the README map at `docs/ui-styling.md:458`.

---

## 🟡 Major

### 7 — The memory claim the step exists for is defeated: `problems` holds the full mesh per unit

* **Lens:** `egm-design`, `egm-implementation-readiness`
* **Scope:** `src/App.tsx:487`, `:601`, `:507-512`

```ts
const [problems, setProblems] = useState<ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh | undefined; items: UnitProblem[] }>>(new Map());
```

`runCheck` is called by **export** (`useExport.ts:58`), and export is what makes a unit finished — so **by construction every finished unit has a `problems` entry holding its full mesh**. Entries are pruned only when the unit leaves the scene (`:507-512`). Releasing `built` frees the `built` reference only; the mesh stays reachable from React state. The commit claim "A case of eight would otherwise carry eight support meshes for the whole session; now it carries one" is therefore **not established**.

This is coupled to Blocker 1: today the accidental re-check loop happens to overwrite the entry with `undefined`, so the retention is masked. Fix the loop alone and the retention becomes permanent. **Both must be addressed together** — storing the checked *build entry* identity rather than the mesh on the `problems` entry fixes both at once.

**Answering the memory question directly:** nothing would catch release stopping to free. `buildBytes` (`releasedBuild.ts:88`) measures only the object handed to it, and `releasedBuild.test.ts:108-119` sums over the `built` map alone — any other retained reference is invisible to it.

**Cleared, for the record:** three.js *is* disposed (`src/components/viewport/geometry.ts:31` `return () => next.geometry.dispose();`; `sessionMesh.ts:23-27` releases on dispose; `displays` in meshExtras is a WeakMap). `builtRef.current = built` (`:328-329`) is a mirror of the same map, not a second retention. No worker-side copy is retained (`forgetUnit`, `:498-513`). `problems` is the one remaining holder.

### 8 — The release condition is not maintained: `built` is missing from the effect's dependencies

* **Lens:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness`, `egm-comprehension` (all four)
* **Scope:** `src/App.tsx:351-359`

```
 * Declarative, not hung off a particular press. … every such hook is a path that can be missed, and
 * two of them are two chances to miss it. The condition is simply "finished, and not the one being
 * looked at", so it is written as that condition.
```

The effect depends only on `[session.dentalFinished, scene.activeUnitId]`. It is a one-shot reaction to two inputs, not a maintained condition. Any build that *arrives after* those last changed re-holds full geometry for a finished, non-active unit — `setBuilt((current) => new Map(current).set(unit.id, { unit, mesh }))` at `:545` and `:555` — and the effect never re-runs to release it. That path is live: a plate re-arrange, an undo, or any transform produces a new `PrintUnit`, making `previous.unit !== unit` at `:534` and scheduling a build. `usePlateArrange`'s incremental re-pack (`usePlateArrange.ts:54-68`) dispatches move commands for edited cases, which is exactly such a path. After one re-pack, a case of eight can be holding eight full support meshes again with no condition left that will release them. So the comment's "a path that can be missed" is what this design *is*, not what it avoids.

**Recommendation.** Add `built` to the deps — safe precisely because `releaseFinished` is reference-equal on a no-op, so `setBuilt` bails and there is no feedback edge — or release at the point a build lands.

### 9 — FALSE CLAIM: "the largest thing the app holds per unit" / "makes a deck of N affordable"

* **Lens:** `egm-codebase-details`
* **Scope:** `src/plate/releasedBuild.ts:9-16`

```
 * A generated support mesh is the largest thing the app holds per unit: positions, indices, parts and
 * components. …
 * THIS IS WHAT MAKES A DECK OF N ROWS AFFORDABLE.
```

The project's own measurement contradicts the premise: `docs/design/2026-11-07-import-and-items-flow.md:1039` — "12.2 MB × N for the models alone, before supports. A cap of 8 is ~100 MB held". `unit.source` is never released; nothing in this change touches it, `src/state/project.ts:323` keeps cloning it, and undo history holds earlier scenes too. So a deck of 8 still holds ~100 MB of models. No measurement of support-mesh bytes per unit exists anywhere in the repo, so "the largest thing held per unit" is asserted, not measured — and against 12.2 MB it is very likely false. The test offered as proof measures its own 16.8 KB fixture (`releasedBuild.test.ts:42`).

**Recommendation.** State what is actually freed ("the support build, the only thing the deck adds per finished unit"), or measure a real support mesh and quote the number. Do not claim the deck is affordable until the model copies are addressed.

### 10 — FALSE CLAIM: "the five reachable row states". Only three can reach a row

* **Lens:** `egm-codebase-details`, `egm-comprehension`
* **Scope:** `src/items/rowText.ts:71-72`, `:9-10`; `src/items/ItemsPage.tsx:49`

```ts
/** Whether this release can show the row at all — the five reachable states (§8 step 9). */
export const rowIsReachable = (row: RowState): boolean => rowSentence(row) !== undefined;
```

The only production consumer of a row state is `ItemsPage.tsx:49` `unit.diagnosis ? rowSentence(verdictOfDiagnosis(unit.diagnosis)) : undefined`, and `verdictOfDiagnosis` can return only `clean | holes | malformed`. `verdictOfRefusal`, `verdictOfRepair` and `offersRepair` have **no caller outside tests** (grepped all of `src/`: only `rowState.ts`, `rowState.test.ts`, `rowText.test.ts`, `README.md`). Structurally they cannot be reached: a row is rendered per `PrintUnit`, and a file that fails to parse or is refused by a capacity guard never becomes a unit (`App.tsx:797-800` collects it into `refused` and reports it on the status line).

So `'Could not be read.'`, `'Too many triangles for the plate.'`, `'Too large to hold in memory.'` and `'Too big for the plate.'` are **four strings translated into two languages for rows that cannot exist** — precisely what commit `b3d013a` says it refused to do for the four repair states ("giving them sentences would mean translating four strings into three languages for rows that cannot exist"). The same commit's reasoning is thus applied to one set and violated for another.

**Recommendation.** Either wire the refusal path into the page (a row per *dropped file*, not per unit — which is what the design doc's `items-row-<importId>` assumes), or say plainly that three states are reachable today, that the refusal sentences are pre-work, and name where a refusal *is* reported.

### 11 — `malformed` asserts inward faces without consulting `windingConsistent`

* **Lens:** `egm-design`
* **Scope:** `src/items/rowText.ts:50-57`; `src/items/rowState.ts:58`

```ts
return row.nonManifoldEdges > 0
  ? { key: 'Has one edge shared by more than two faces.', … }
  : { key: 'Some faces point inwards.', then: { key: CHECK_IT } };
```

`RowState['malformed']` carries `windingConsistent` (`rowState.ts:58`) and **no one reads it**; the else-branch is an unguarded claim about the cause. `RepairReport.watertight` is "Closed, manifold and consistently wound" (`vendor/mixo-geocore/host/core/repairMesh.ts:56-57`), and `ImportDiagnosis` deliberately drops `nonManifoldVertices`. So a mesh that is closed, consistently wound, and non-manifold only at a **vertex** (the classic bowtie) arrives as `watertight:false, boundaryLoops:0, nonManifoldEdges:0, windingConsistent:true`, and the row tells the operator "Some faces point inwards." about a file whose winding is fine — the same class of absurd sentence `b3d013a` claims to have eliminated. The state machine carries the discriminating field and the text ignores it: the mapping is total but **misleading**, which is the hole in it.

The engine's exact `closed`/`watertight` semantics for vertex-only non-manifoldness is **UNVERIFIED** (the Rust source is not vendored). The code-level defect is not.

**Recommendation.** Branch on `windingConsistent` and add a third sentence, or carry `nonManifoldVertices` into the verdict, rather than inferring winding from an edge count of zero.

### 12 — FALSE CLAIM (partly): the four narrowings. Three are sound; `useFixSpot` is not

* **Lens:** `egm-codebase-details`, `egm-design`, `egm-implementation-readiness` (converging)
* **Scope:** `src/components/useFixSpot.ts:81`

**Three of the four claims verified TRUE, field by field** — `plateLayout.ts:28-37` reads `footprint` only; `usePlateArrange.ts:44`/`:57` forwards without reading; `useExport.ts` touches the map only at `:45`/`:84`, both passing through to `planExport`/`unitContacts`, whose own parameters are `BuiltSupports` (`vendor/.../unitSupports.ts:73`, `:88`). `KeptBuild` is a superset of `BuiltSupports`, and release preserves `footprint`/`dropped`/`droppedByZones` **by reference**. Also TRUE: "`UnitBuild` was already generic" (`unitSupports.ts:59`). These are real seams, not cosmetic type changes, and each carries a comment stating *why* it was narrowed — the clearest work in the change.

**The fourth is the error.** `useFixSpot.ts:81`'s comment says the parameter is "compared by identity only … so a released build is a valid entry". Identity comparison against a *released* value is exactly what is not valid: it compares a `problems` entry's full mesh against a possibly-released build, so the recheck silently bails and "Re-checking…" never resolves (Blocker 1, second site). The safety argument is incomplete precisely where it is stated most confidently.

### 13 — FALSE CLAIM: `releasedBuild.ts`'s header asserts a consumer map the same commit retracts

* **Lens:** `egm-design`
* **Scope:** `src/plate/releasedBuild.ts:24-25`

```
 * `BuiltSupports`, — one compares identity, and the fifth, `src/viewport/types.ts`, does not exist.
 * The single real geometry reader is the active unit's mesh in `App.tsx`.
```

The commit message for this very change states the opposite: "my own claim was wrong too, and the compiler said so: I said activeMesh was the only real geometry reader. The union named FIVE, including supportMeshes". And the file that "does not exist" exists under a different path and is a genuine full-geometry consumer — `src/components/viewport/types.ts:23` `supportMeshes: ReadonlyMap<string, GeneratedSupportMesh>;`. A module header that confidently states a false consumer map is worse than none: the next reader narrowing a parameter will trust it. The corrected list is the most useful artefact of this step and currently exists only in a commit message.

**Recommendation.** Replace lines 18-29 with the corrected list: `activeMesh`, `supportMeshes`, `problems`, and the two identity comparisons.

### 14 — `takesOne: false` is not an arity option: it flips the drop out of the dental path and refuses it outright

* **Lens:** all four reviewers
* **Scope:** `src/App.tsx:721-744`, `:823`, `:1463`

```ts
const dentalDrop = acceptsDentalDrop(sessionRef.current) && (options?.takesOne ?? true);
```

The JSDoc claims only that "`takesOne` overrides the Step 1 rule that a drop is ONE aligner." But `dentalDrop` gates five further behaviours in the same function: `replacesPlate` (`:729`), whether a bad file reaches `dentalBadFile` (`:733`), **whether the import is refused outright** (`:736` `const refusal = dentalDrop ? undefined : importRefusal(sessionRef.current.mode);`, and `importRefusal` returns a refusal for any mode other than `'off'` — `vendor/mixo-geocore/editing/status.ts:92`), whether `dentalLoading` is sent (`:744`), and `:823` `if (!dentalDrop) send({ type: 'leave' })` — which **leaves the open mode**.

So with `takesOne: false` while a dental session is live, the drop imports **nothing**: it only pulses the panel and prints "Finish editing supports first". The stated "mid-loop" case the option exists for is not fixed; it is refused. It is currently masked only because the Items page is unreachable mid-loop (Blocker 4 / Major 15). The name says arity; the flag means "this is not a dental drop".

**Recommendation.** Rename to what it switches (`dentalDrop: false`), and separate the slice from the dental-drop decision: `const dentalDrop = acceptsDentalDrop(...) && takesOne; const refusal = acceptsDentalDrop(...) ? undefined : importRefusal(mode);`.

### 15 — The five-file fix is applied at one of the two `importFiles` call sites

* **Lens:** `egm-design`
* **Scope:** `src/App.tsx:1463` vs `:1467`

`:1463` passes `{ takesOne: false }`; `:1467` (the StartScreen path, which handles `dropAction`'s `'many'`) passes nothing and so takes the Step-1 default, slicing to one file at `:742`. The StartScreen `'many'` action therefore still becomes a one-file import whenever `acceptsDentalDrop` is true (`src/dental/editingMode.ts:353-355`) at the moment of the drop — the exact regression commit `f6fece5` says it ended. Reachability of "start screen open while stage is `aligner`" is **UNVERIFIED**, but the asymmetry is a latent hole: the option exists to make the rule explicit and one of the two callers forgets it.

### 16 — The verdict→row pipeline is tested link by link and never joined: deleting the carry-over breaks nothing

* **Lens:** `egm-implementation-readiness`
* **Scope:** `src/state/import.ts:112`

```ts
...(item.diagnosis ? { diagnosis: item.diagnosis } : {}),
```

**Mutation: delete this line entirely. All 1352 tests still pass.** `src/state/import.test.ts` does not mention `diagnosis` at all (grepped); `project.test.ts` hand-builds `{ ...unitA, diagnosis: verdict }`; `ItemsPage.test.tsx` hand-builds `unit('u-a','upper.stl', verdict())`; `rowState`/`rowText` are pure fixtures; and walk m2–m5 assert rows, names, size and count but **never the verdict sentence** (`Grep "items-verdict|\.verdict" scripts/walk.mjs` → nothing). The row would silently say nothing about mesh health forever and the gate would be green. This is the most important new pipeline in the change and it has no joining test.

**Recommendation.** One test over `placeImportedUnits` asserting the diagnosis reaches the unit *and* that `diagnosis.triangles === unit.source.indices.length / 3` — that identity is the premise of the staleness gate and is currently assumed, not asserted. Plus one walk assertion on `.items-row .verdict` text.

### 17 — `takesOne` has no test and no walk check at all

* **Lens:** `egm-implementation-readiness`
* **Scope:** `src/App.tsx:728`, `:1463`

`Grep takesOne` across `*.{ts,tsx,mjs}` returns four hits, **all in `src/App.tsx`** — zero in any test, zero in the walk. The flag the whole "a five-file drop must not collapse to one file" argument rests on is entirely unexercised, and per Major 14 its real behaviour is not what its doc says. Walk m2 does not cover it: `:1467` passes no options, and on the Drop page `acceptsDentalDrop` is false anyway, so the slice never engages there.

### 18 — The load gate is shape-deep, and both it and its docs overstate what it catches

* **Lens:** `egm-design`, `egm-comprehension`
* **Scope:** `src/state/project.ts:355-360`; `src/items/README.md:103-105`; `src/state/diagnosis.ts:28-31`

```ts
// THE STALENESS CHECK, and the reason `triangles` is in the verdict at all: a verdict describing a
// different mesh than the one it is attached to is worse than none, because the row states it as
// fact. Dropped, not thrown on, for the same reason as the rest of this gate.
if (found.triangles !== source.indices.length / 3) return {};
```

**Answering the owner's direct question first: no, a valid verdict is not wrongly dropped.** Verified: the verdict is computed on `item.mesh` at full resolution (`importWorker.ts:65`) and `placeImportedUnits` sets `source = item.mesh` (`import.ts:93`), never the decimated `display`. The `triangles` gate does **not** spuriously drop verdicts for heavy meshes. The destructure-before-spread fix at `project.ts:320`/`:338` is correct and its comment's reasoning is right. Validation-on-load is the right layer and dropping rather than throwing is well argued. `project.test.ts:370` and `:387` are genuine positive controls.

Three real gaps:
* **It is a triangle-*count* comparison, not a staleness check.** A repair that fixes winding only — `windingConsistent`, exactly the `malformed` sub-case `rowText.ts:48-57` exists for — preserves the count exactly, so the stale verdict passes the gate and the row keeps saying "Some faces point inwards." about a mesh that no longer does. Both the README ("it is what will make repair safe to write") and `diagnosis.ts:28-31` ("compare the verdict against the mesh it is attached to and drop a mismatch") overstate this. The step-9 author will trust the gate and not replace `PrintUnit.diagnosis` on repair.
* **The only non-shape check is a value the file's author also controls.** A hand-edited project writing `watertight: true` plus the correct triangle count gets a believed `clean` verdict and the row says "Ready to print." about a mesh the engine never diagnosed. Nothing re-diagnoses on load. Tolerable while the verdict only renders, but nothing records "never gate on a loaded verdict" — and step 9's repair is planned to act on it.
* **The invariant lives only in this `if`.** `ImportDiagnosis` is structurally seven independent numbers and booleans; nothing stops a future caller constructing one with a mismatched count. This project has already been bitten twice by counts that lived only in prose (commit `25a3520`).

**Recommendation.** Say what the gate does and does not catch, in all three places. Record the pairing as a constructor (`diagnosisFor(mesh, report)`) so the only way to obtain an `ImportDiagnosis` is through it, and note at the read site that a loaded verdict is self-reported.

### 19 — A second drop handler on the Items page, diverging from the module written to prevent exactly that

* **Lens:** `egm-design`, `egm-comprehension`
* **Scope:** `src/items/ItemsPage.tsx:38-42`

```tsx
onDrop={(event) => {
  event.preventDefault();
  const models = [...event.dataTransfer.files].filter(isModelFile);
  if (models.length > 0) onFiles(models);
}}>
```

`src/components/startDrop.ts` was created precisely so "deciding what a drop MEANS" lives in one tested place, and `ChooserScreen = Exclude<StartScreenId, 'items'>` is justified at `StartScreen.tsx:21-25` as keeping "`dropAction`'s screen argument honest, since the Items page has no drop behaviour of its own". It has drop behaviour, written inline, and it diverges: a `.mixodental` project file wins over models in `dropAction` (`startDrop.ts:50-51`) and is **silently discarded** here; and a drop of non-models produces no `onUnsupported` message at all — the user gets nothing, not even an error. That is the same silent-discard class this change exists to end.

**Recommendation.** Move the accept rule (`isModelFile`) down into a leaf both can import and give `ItemsPage` the same `onProjectFile`/`onUnsupported` callbacks. Note that calling `dropAction` directly would deepen an existing backwards edge — `ItemsPage.tsx:9` already imports `isModelFile` from `../components/startDrop`, which drags component-layer drop policy into `src/items/` and works against the mixomesh extraction.

### 20 — `isModelFile`'s doc comment is false twice, and a `.glb` is silently discarded

* **Lens:** `egm-comprehension`
* **Scope:** `src/components/startDrop.ts:37-38`

```ts
/** The models this app accepts. Binary STL only, as the file input's `accept` says. */
export const isModelFile = (file: File): boolean => /\.stl$/i.test(file.name);
```

Not binary only: the test is extension-based and ASCII STLs pass and import fine (`walk.mjs:1085-1086` drops three ASCII `cubeStl()` files on this handler and asserts three rows). Not "the models this app accepts": `acceptModelFile` (`ObjectViewport.tsx:20-22`) is `/\.(stl|glb|gltf)$/i`, and `App.tsx:1473`'s own input advertises `accept=".stl,.glb,.gltf"`. Two predicates, near-identical names, different sets, neither comment mentioning the other. Live consequence: a `.glb` dropped on the Drop page is reported unsupported, and a `.glb` dropped on the Items page is silently discarded (Major 19).

### 21 — The Items page's `finished`-dependent code and its tests are unreachable

* **Lens:** `egm-implementation-readiness`, `egm-comprehension`
* **Scope:** `src/items/nextItem.ts:5-25`, `:36-41`; `src/items/ItemsPage.tsx:33`, `:66-68`

`'items'` is set at exactly one place (`App.tsx:1467`) and `startItem` clears it with nothing setting it back, so `finished` is always `[]` in the shipped path. Consequently `items-row--done`, `'1 item left'`/`'0 items left'`, the dropped primary and the Items-page drop are all unreachable. `nextItem`'s third parameter `justDone` is always `undefined` at its only production call site (`ItemsPage.tsx:33`), and its 20-line header documents "a *Next item* press is three ordinary calls in this order" for a press no UI offers. `ItemsPage.test.tsx:64-75` and the `finished` arms of `nextItem.test.ts` are green tests of code no operator can reach. `App.tsx:1315`'s `addAnotherDental` review branch is dead for the same reason.

Commit `1c43174` withdraws the per-item loop as superseded, so the gap is known — the finding is that the shipped modules still document the loop as working. One honest sentence closes it: "nothing returns to this page today; `justDone` is for the loop when it exists."

### 22 — `sizeSummary` recomputes `meshBounds` per row on every render, contradicting its own doc

* **Lens:** `egm-design`, `egm-codebase-details`
* **Scope:** `src/items/itemSummary.ts:21-25`; `src/items/ItemsPage.tsx:53-55`

```ts
export function sizeSummary(mesh: TriangleMesh): Message {
  const bounds = meshBounds(mesh);
```

The module's rationale at `:15-17` — "the bounding box comes from `meshBounds`, which `placeImportedUnits` already calls for every unit it places. Nothing is computed here that the import did not compute" — is about *availability*, not reuse. The bounds are never stored: `src/state/import.ts:77` computes them locally and discards them. So this is a fresh full pass over the positions of up to 8 models at 12.2 MB, unmemoised, on the main thread, repeated on every re-render of the page (`finished` changing, language change, any parent render). The memory argument against thumbnails was honoured; the CPU cost of its replacement was not measured, and the doc says the cost isn't there.

**Recommendation.** Persist the bounds on the unit at import (already computed there) or memoise per mesh in a WeakMap, as `meshExtras` does.

### 23 — The i18n guard does not look at the Items page, and `walk:locales` never visits it

* **Lens:** `egm-codebase-details`, `egm-implementation-readiness`
* **Scope:** `src/i18n.test.ts:21`; `src/items/rowText.test.ts:84`; `scripts/walk.mjs` locale pass

Three independent gaps around the same twenty strings:
* `UI_FILES` in `i18n.test.ts:21` does not include `./items/ItemsPage.tsx`, and the globs above it auto-include only `./denture/**` and `./dental/**`. None of the page's six plain literals (`'Your files'`, `'Remove'`, `'Take this file off the list.'`, `'1 item left'`, `'{n} items left'`, `'Start with the first item'`) is scraped. They are all present in both dictionaries today (verified by hand), but commit `b3d013a` gets the division of labour wrong: plain literals are exactly what the guard would have caught, and it is not looking at the file. **Fix: add `'./items/ItemsPage.tsx'` to `UI_FILES`, or glob `./items/*.tsx`.**
* `rowText.test.ts:84` `expect([...keys].filter((key) => !(key in dictionary)), lang).toEqual([]);` checks **key presence only**. A value that is the English string, the empty string, or carries the wrong placeholder (`'開いた縁が {count} 個あります。'`) passes. This is the only guard on eleven keys × two languages. **Fix: assert each value is non-empty, differs from the key, and that its `{...}` placeholder set equals the English one.**
* The `walk:locales` pass goes Drop → file screen → Any model. None of the twenty new keys — the whole Items page plus the new Drop footer — is read in any language by any of the 39 checks. So "walk:locales ALL PASS 39 checks" is true and says nothing about this release's strings.

### 24 — `LIMIT_TEXT` names the wrong cause, and both translators faithfully translated the error

* **Lens:** `egm-comprehension`
* **Scope:** `src/items/rowText.ts:29-33`; `src/locales/zh-Hant.ts:726`, `:728`; `src/locales/ja.ts:723`

```ts
const LIMIT_TEXT: Record<CapacityLimit, string> = {
  triangles: 'Too many triangles for the plate.',
  memory: 'Too large to hold in memory.',
  plate: 'Too big for the plate.',
};
```

Against `vendor/mixo-geocore/host/core/budget.ts`: `triangles` is `assertTriangleCapacity` (`:67`), the *editor/runtime* refusal limit — nothing to do with the plate, and its own message says "Simplify or split the model." `plate` is `assertPlateCapacity` (`:128`), "more triangles **on the plate** than the refusal limit" — a triangle **total**, not a size. "Too big for the plate" reads as physical dimensions, and both translators read it that way: `zh-Hant.ts:728 '尺寸超出底板範圍'` ("dimensions exceed the plate area") and `ja.ts:723 'サイズがプレートを超えています'` ("the size exceeds the plate") are both factually wrong, as is `zh-Hant.ts:726 '三角面數超出底板限制'`. An operator would scale or re-orient a model that was refused for triangle count. All three also state a fact with no action, where the engine's own messages carry one.

Impact is bounded by Major 10 (unreachable today), which is why this is Major and not a Blocker — but it must be fixed *before* the refusal path is wired, not after.

---

## 🟢 Nits

**25 — `bodyCount` is persisted, validated, and never read.** `src/state/diagnosis.ts:45` documents it as the fragment detector ("a plate of fragments reports many"); `verdictOfDiagnosis` (`rowState.ts:80-84`) never consults it. A file of 525 welded-apart shells — the README's own measurement at `src/items/README.md:34-35` — reports `clean` → "Ready to print." Either give it a state or drop it from the verdict.

**26 — `'1 triangles'`, pinned by two tests.** `src/items/itemSummary.ts:31-32` `({ key: '{n} triangles', vars: { n: mesh.indices.length / 3 } })` has no singular and no `toLocaleString`, while `App.tsx:1631` does both for the same quantity (`2,412,345 triangles` in the footer vs `2412345 triangles` on the row). The sibling module in this same change does plurals properly (`rowText.ts:42-44`). The defect is frozen by `itemSummary.test.ts:17` and `ItemsPage.test.tsx:44`, so fixing it will read as a test regression. Use `{ key: '1 triangle', other: '{n} triangles', vars: { n } }`.

**27 — `rowText.test.ts:49` truthiness stands in for the strings.** `for (const text of limits) expect(text).toBeTruthy();` with `:48` asserting only `new Set(limits).size === 3` — **swapping the `memory` and `plate` sentences passes.** Assert the three expected strings.

**28 — `startDrop.test.ts:39` asserts only `kind`, so the filtering is untested.** `expect(act(['notes.txt', 'a.stl', 'b.stl'])).toMatchObject({ kind: 'many' });` — mutating `startDrop.ts:54` to `return { kind: 'many', files };` fails nothing, and `notes.txt` would then reach `importFiles`. Use `toEqual` with the expected two files by name. Also untested: two project files in one drop (which wins), and duplicate names. Zero files, mixed extensions and unsupported type *are* covered (`:36-37`).

**29 — Walk s3/s4/s8 restate their own wait and cannot fail.** `scripts/walk.mjs` does `await onScreen('drop')` — which is `page.waitForSelector('.start-task')` — then `check('s3 …', await page.locator('.start-task').isVisible())`. The predicate is a restatement of the preceding await. These were `check(..., true)` before, so the commit's "rewritten to assert the new truth instead of being loosened" overstates it for s3/s4/s8: the attribution improved, the assertive power did not. (s7 and s10 *are* genuinely stronger — they add `.dental-drop` count 0 and `unitsOnPlate() === 1`.) Assert what the previous screen must no longer be true of, as s7 does.

**30 — Walk m4's name promises per-row behaviour its body never exercises.** `scripts/walk.mjs:1095-1097` reads `.locator('.items-row .preview').first()` only, so "each row carries its own size" is unproven — and with three identical cubes it would be indistinguishable anyway. The regex `/\d+ × \d+ × \d+ mm/` never asserts the triangle count, so `triangleSummary` is unasserted anywhere in the walk, contradicting the commit's "each row's own size **with the count**". Mutation that passes: return row 1's size for every row. (m2, m3 and m5 are accurate and genuinely strong.)

**31 — The walk's denominator is now machine-dependent.** `scripts/walk.mjs:911-917` skips `g` entirely when `pendingAtSwitch === 0`, so a quiet machine reports a different count than a loaded one, and "157 of 158" cannot both be true and include `g` in the denominator. `d1` acquired the same shape. **Splitting `g` did not weaken it** — `g-pre` still fails loudly, `g` still asserts hash equality, and the vacuous-pass fix is real; the residue is that "ALL PASS (N checks)" no longer pins N, so a check that stops being emitted is indistinguishable from a clean run. Print an expected-check-count assertion.

**32 — `data-ui`: the claim holds, the test does not.** Claimed: "keyed to the UNIT, never the index, **and a test rejects any index-shaped name**." The claim is true — grepping all `src/**/*.tsx` for index-interpolated `data-ui` finds none, and the five new names are unit-keyed and unique. The test is `ItemsPage.test.tsx:34` `expect(html).not.toMatch(/data-ui="items-[a-z]+-\d"/)`, which rejects names ending in a single digit; the fixtures use ids `u-a`, `u-b`, `a`, `b`, `c`, so **the regex never fires either way**, and a real unit id ending in a digit would trip it. It would catch `items-row-${index}` and miss `items-row-row${index}`. Separately, the names are unique but not *pinnable*: `ItemsPage.tsx:50` keys on `unit.id`, which is `unit-${crypto.randomUUID()}` (`App.tsx:818`) — a name no check or doc can state, only discover.

**33 — `ItemsPage`'s name cell has no `data-ui`.** `src/items/ItemsPage.tsx:51` `<span className="name" title={unit.name}>{unit.name}</span>` — every sibling cell is named and walk m3 selects by those, but the file name, the one cell an operator identifies a row by, is selectable only by class.

**34 — `StartScreen`'s JSDoc describes the screen this change deleted.** `src/components/StartScreen.tsx:28-32`: "choose the task, then the aligner type, then the file. A file dropped on the first or second screen is held until the type is chosen". `ChooserScreen` is `'drop' | 'file'` (`:26`), and `:69` in the same file says `// THE TYPE SCREEN IS GONE (plan §8 7c)`. The first doc a reader hits contradicts the body 40 lines later. (Raised as a Blocker by `egm-comprehension`; downgraded here because it is a doc defect with no behavioural consequence, unlike Blocker 6 which violates an explicit project rule.)

**35 — `'hold'` survives the screen that could ask, leaving a dead-but-live state.** `src/components/StartScreen.tsx:88-91`: `setHeld(action.file)` then `screen === 'drop' ? onStart(...)`. On `screen === 'file'` with `chosen === undefined` the file is stored in `held` and nothing consumes it; `held` is cleared only by `go('drop')` (`:63`), which this path does not call. If the screen survives the `onStart` (e.g. the aligner is refused as too heavy, `App.tsx:834-837`), pressing the Aligner card re-starts the file the operator was just told to replace (`:75` `if (held) onStart(id, held)`). Neither reviewer could construct a live route into `screen === 'file'` with `chosen` unset, so this is **UNVERIFIED as a live defect** — the dead-but-live state is not. Also: `dropAction` should return `'start'` for `screen: 'drop'` so the tested rule is the executed rule; `startDrop.test.ts` currently asserts a `'hold'` the app does not honour.

**36 — `heldBuilds` allocates a fresh wrapper per entry.** `src/App.tsx:342` `out.set(id, { unit: entry.unit, mesh: entry.mesh })`. `built.get(id)` used to return a stable entry object; `heldBuilds.get(id)` returns a new one whenever any unit's build lands. Nothing downstream appears to memoise on `UnitBuild` identity, so this is allocation only — but it is new identity-instability in a hot path. Answering the question directly: **`heldBuilds` is not recomputed too often** — it depends on `built` alone, which is necessary. Reuse `entry` behind the `hasGeometry` guard.

**37 — Assertions that cannot fail.** `rowState.test.ts:67` `expect(verdictOfDiagnosis(measured).state).not.toBe('clean');` is implied by `:66`'s `toBe('malformed')`. `itemSummary.test.ts:25-27`'s `not.toContain('-')` / `not.toContain('Infinity')` are implied by the exact-equality assertion above them. `rowText.test.ts:60` `expect(ROW_STATES.length - reachable.length).toBe(4);` is arithmetic over `:58`'s exact 5-element `toEqual` and a 9-constant literal. Harmless, but they inflate the count without adding a catchable mutation.

**38 — Two stale comments and one vestigial function.** `scripts/walk.mjs:1126` leaves a stale doc comment sitting directly above the one that replaced it, asserting the opposite ("Back from Step 1 lands on the start screen's aligner type"). Two walk check *names* still describe the deleted screen: `'s1 the app opens on the task screen'` and `'s14 a non-STL dropped on the task screen is refused'` — a reader triaging a red s1 is sent to a screen that does not exist. `src/items/rowState.ts:64` `/** The state names, for a catalogue page that must show every one of them. */` names a consumer that does not exist (`src/kit/Catalogue.tsx` does not import `ROW_STATES`). `rowState.ts:99-100` `offersRepair` reads as live policy in a release where no press exists. `StartScreen.tsx:72` `const back = (): ChooserScreen => 'drop';` is a zero-argument function returning a constant.

**39 — `--small-size` duplicated as a fallback literal.** `src/styles.css:1537`, `:1540`, `:1543` use `var(--small-size, 11.5px)`. Commit `b01bbe4` spent a paragraph establishing that 11.5px *is* `--small-size`; the fallback re-states the literal the token exists to own.

**40 — `diagnosisField`'s non-object branch is untested and partly redundant.** `src/state/project.ts:351` `if (value === null || typeof value !== 'object' || Array.isArray(value)) return {};` — `project.test.ts:359-370` covers only object-shaped malformations, and deleting `|| Array.isArray(value)` changes nothing observable (an array fails the `flags` check anyway). Add cases for `null`, `[]`, `'x'`.

**41 — UNVERIFIED: the staleness gate trusts that the engine's `triangles` equals `indices.length / 3`.** `src/state/project.ts:360` compares a WASM-reported count (`prepareImport.ts:87`, decoded at `vendor/.../repairMesh.ts:236`) against a host-computed one. The Rust source is not vendored, so neither reviewer could confirm `diagnose_mesh` reports the *input* face count rather than a count after discarding degenerate or duplicate faces. If it ever differs, a perfectly valid verdict is dropped on every project reload, silently — and the affected population is exactly the defective one. `diagnoseImported.test.ts:29` pins `triangles === 4` for a clean tetrahedron only; the non-manifold fixture at `:57-64` never checks `triangles`. Cheap insurance: add `expect(found.triangles).toBe(3)` there plus one fixture with a collapsed triangle.

**42 — Minor locale wording.** `zh-Hant.ts:716` `'從清單中移除此檔案'` drops the full stop its English key carries, where neighbours `:718-728` all keep `。`. `ja.ts:707` `'ファイルを1つずつ処理してください。'` uses an unspaced ASCII `1` where every other new ja string spaces the numeral (`残り 1 件`, `三角形 {n} 枚`). `ja.ts:713` `'Ready to print.': 'プリント準備完了。'` keeps the 準備 framing that `b3d013a` explicitly rejected for zh ("reads as a progress state… rather than a verdict about the file", hence `可列印`); if that objection was real it applies here too (`印刷可能。`). `rowText.ts:42-43`'s "open edge loop" is CAD jargon where a dental technician reads "hole".

---

## Verified Sound — do not re-spend review effort here

These were checked by two or more lenses and found correct:

* **`dropAction`, every branch** — zero files, mixed extensions, project-file-wins, case-insensitive `.stl`; `models.length > 1` cannot collide with the single path.
* **`nextItem` / `itemsLeft`** — no off-by-one; empty and all-done both return `undefined`; both draw from one shared predicate, so the "3 left vs where the press goes" drift is genuinely impossible.
* **`takesOne` does stop the one-file slice** (`.slice(0, dentalDrop ? 1 : undefined)`), and `send()` mutates `sessionRef.current` synchronously, so `startItem`'s documented three-call order really does work.
* **`releaseBuild`** — idempotent, and the key-omission reasoning for `footprint`/`droppedByZones` is right. `releaseFinished` is genuinely identity-preserving on a no-op (`:76-84`), which is the property that makes the Major 8 fix safe. `hasGeometry` keyed on `'positions' in mesh` rather than a flag is the right call.
* **Three of the four narrowings are real seams**, each with a comment stating why — see Major 12. `UnitBuild` was already generic.
* **three.js resources are disposed**, not merely dereferenced (`viewport/geometry.ts:31`, `sessionMesh.ts:23-27`); `displays` is a WeakMap; `builtRef` is a mirror, not a second retention; no worker-side copy is retained.
* **`verdictOfDiagnosis` is a true partition** (`watertight`, then `boundaryLoops`, then else), and `watertight` really is closed-and-manifold-and-wound, so the "clean ≠ no holes" reasoning holds.
* **A valid verdict is not wrongly dropped by the load gate** — the verdict is computed on the full-resolution `item.mesh`, which is what `source` becomes; the decimated `display` never reaches it. `diagnosis` survives JSON save/load, nothing in `src/` ever replaces `unit.source`, and the destructure-before-spread ordering at `project.ts:320` really is required.
* **`src/items/` holds no App state** — every input is a prop (`ItemsPage.tsx:22-34`), which keeps the mixomesh extraction viable (one backwards edge to watch: Major 19).
* **Japanese glyph coverage is intact.** Two reviewers independently enumerated every new kanji and katakana (追加始最初残件外準備完了縁個複数面共有部内側向可能結果確認読込三角形多配置大超処理対象選何作 + kana + 、。·×) against `src/assets/fonts/japanese-subset.txt`: **all present. No `npm run fonts` is owed.**
* **All twenty new keys are in both `ja.ts` and `zh-Hant.ts` with matching placeholders.** Note `src/locales/en.ts` does not exist — English is the key itself via `?? key` — so "all three dictionaries" means two files plus the keys.
* **Prose is ranged left.** No `text-align: center` on any run of words in the new CSS; `.items-page` (`styles.css:1535-1555`) and `.screen-heading` (`:1422 text-align: left`) are clean.
* **No third-party slicer name and no scan filename is added by this change.** Every file name the diff introduces is synthetic (`one.stl`, `a.stl`, `upper.stl`, `cube`).
* **The `g`/`g-pre` split is a genuine fix**, as is the `translator()` both-quote-styles fix and the `?? key` silent-fallback diagnosis. The `onTypeScreen` → `backToDrop`/`enterAlignerAgain` retarget fixes a real weakness: `.start-screen .choice-keys` is matched by the Drop page too, so the old wait was satisfied by the preceding page.

---

## Pre-existing rule violations (NOT owned by this change)

Surfaced because the constraints are repo-wide; this change does not touch these files.

* **Third-party slicer product names:** `dentalwork/batch-review/viewer.html:149` — `<span class="peel-key owner">owner (Chitubox)</span>`; `PrusaSlicer` at `docs/superpowers/specs/2026-10-21-support-selection-design.md:42` and `docs/superpowers/plans/2026-10-21-support-selection.md:96`.
* **A named scan file**, against "content hashes only": `dentalwork/batch-review/reviewCase.test.ts:117` — `resolve('dentalwork/fixtures/case-002/aligner002.stl')`.

---

## Smallest set that would change the verdict

1. Make `entry.mesh` and `currentBuild(...)` agree at `App.tsx:639` — store the checked *build entry* identity, not the mesh — which closes Blocker 1, its `useFixSpot` twin, and Major 7's retention together. Add a test that a released unit does not re-enter `stale`.
2. Make a released build not count as settled, so re-selecting re-requests its build (Blocker 2).
3. `keep = scene.activeUnitId ?? lastActiveRef.current`, and gate the effect on a non-empty `keep` (Blocker 3).
4. Switch to `'items'` only when units were added, and give `ItemsPage` a Back and an Escape (Blocker 4).
5. `邊縁` → `邊緣`, `面朝内` → `面朝內`, plus a character-form guard (Blocker 5).
6. Rewrite `src/items/README.md`'s "Not here yet" as the module map; add the five `data-ui` names to `docs/ui-styling.md` (Blocker 6).
7. Add `built` to the release effect's deps (Major 8).
8. One `placeImportedUnits` test for the diagnosis carry-over, one walk assertion on `.items-row .verdict`, and one end-to-end test of `takesOne: false` (Majors 16, 17).
