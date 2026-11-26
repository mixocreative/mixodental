# The reviewer overhaul: one place to test, compare and save pipelines

**Status: BUILT 2026-11-25** (owner: "Yes, build it", with Fable's ten picks). Steps 1-14 in 15 commits,
`bcd7ebb8` to the docs commit; each checked in the running workbench on a local denture folder, then the full local
gate. Written the same day from the owner's request, Fable's design and the lead's check of its claims against the
code. Lines marked UNVERIFIED were read about, not measured.

**Where the build differs from this plan, and why** (each also in the commit that made it):
- **Step 10 - every save is bundled**, not only the newest and one fallback. A save is about 2.5 KB, and replacing the
  eager glob touches every engine realm that registers types - this plan's own named risk. `discoverTypes` still
  OFFERS only the newest with one fallback. `typesReady.test.ts` fails once the type files pass 1 MB: that is when to
  build the newest-plus-one module.
- **`typeDraft.mjs` is "a type file to the editors and back"** (`editsOfType`, `typeOfEdits`, `runPrint`), not a
  base/draft state object: the page keeps its editors as they were (edits against the built-in), so the tested rules
  are the ones it really uses. The step-3 state functions it never called were removed rather than kept dead.
- **Copy and duplicate work on every selected node** (Shift-click, Shift-drag), or with their inputs as a wired group,
  on the Zones AND the Orient canvas - `nodeClip.mjs` is the one rule set (2026-11-26; on the 25th it was one node,
  Zones only). A selected node that may not be copied is named and left out, not dropped silently.
- **The older paths are retired** (2026-11-26; on the 25th they stayed for review folders): a batch's output folder
  still opens to be LOOKED AT, but its Apply and Save now open its scans - the files the run read, where they still
  are - as a scan session, with the editors' values carried over as a draft of the type the run used (or the
  built-in). `/rerun`, `/save-type` and `saveType.mjs` are gone; every run is the whole-file `/run`, every save the
  dated `/save-draft`. The check that a finished run applied its graphs moved with them (`rerunReport.mjs`
  `notApplied`, now on the session's runs). The Type strip ticks Apply and Save from the session (`stripMarks`).
- **Fable's end-to-end review of the built state** (2026-11-26, 15 findings, each checked against the code before it
  was fixed): Save refuses a built-in's id or a name another type has BEFORE writing (`typeSaves.mjs` clashRefusal -
  the app would have refused one of the two, and the page said both load), and a written save the app refuses keeps
  the edits; Stop is its own state (`stopped`) and no longer restarts on opening the scan; a review folder's edits
  move onto the BUILT-IN (they are edits against it; carried onto a saved type they wiped its pinned rules) and an
  existing kept draft is asked about, never replaced; a kept draft records the save it was made from, so Save refuses
  it once a newer save exists; drafts are kept as edits are made, and before an import or a review folder replaces
  the session; Discard also drops the applied draft; New type opens the built-in; the compare says when the other run
  failed; a refused cache clear forgets nothing; the run check moved to the server, so a run that ignored its graph is
  never cached or counted as proof. Found while testing them: a scan whose file name had a space never ran (typelab
  and the server spawned vite-node through a shell, which split the path) - all three now start vite-node's own entry
  with no shell; the type list was read once, so a save deleted by hand stayed listed - the server watches types/.
- **Fable's sign-off round** (same night, on the fixed code): an id already used in the OTHER category is refused too
  (the app keeps one id per type across both); "would hide a newer save" counts only saves the app loads, so a save it
  refused can be fixed and saved again; the carry dialog's Cancel opens the built-in's kept edits and runs nothing; a
  blank New type keeps no draft; a page removes only the drafts it knows (another tab's survive); a cache clear that
  failed part-way forgets the results; a run past its time limit is stopped as a whole tree on Windows.
- **The whole journey, walked once in the browser after the sign-off** (2026-11-26, the denture test scans): import,
  Duplicate, rename, an edit, Apply and its run, a dated Save, reload, Restore naming the saved value, compare, a
  badge-only second save, rollback by deleting the newest file by hand, and the list following the folder. One gap
  found and fixed: Save showed nothing while it worked (half a minute on a freshly started server) - it now says
  "Saving..." at once and is greyed until the answer.
- **The review-folder bridge on every folder in typelab/output, in a real browser** (2026-11-26, 42 folders, a
  Playwright probe: start the workbench on the folder, press Apply, record the page, stop the run): 36 open as
  sessions on their category's built-in, 6 that only ever ran a `-sup` reference are refused in words. It found two
  gaps, fixed: the page's default type id `workbench.denture` (left from the retired folder Apply) made an untouched
  folder keep a renamed draft, an aligner's too - there is no default id now and a carry with none takes the
  built-in's id, name and badge; and Apply on an untouched built-in said "read-only" before "nothing changed".
- **Measured**: one scan with one type is about 35 s and about 88 MB of kept run; switching back is instant.
- **Restore marks** name the saved value ("Restore to 30° (saved in Parity denture)"); the node default is not also
  printed on the mark - the canvas mark says where the value was saved.

Companion pages: `docs/WORKBENCH-TABS-PLAN.md` (the five tabs), `docs/TYPE-PIPELINE.md` (the type file),
`types/README.md`, `typelab/README.md`.

---

## 1. What the owner asked for

> "reviewer app should be able to do so independently by testing node workflow with given files or folder ... the
> reviewer should auto read from node file, have all nodes and setup ready for each cat and type, user can switch from
> one type to another to test out different pipeline node setup on same files ... create new, add to it, edit, or
> remove existing ... restore value goes to what saved previous setup were, but not the node's default"
> - and - "nodes and types can be duplicated, renamed, or types and nodes be copied across".

In one paragraph: the reviewer is where pipelines are tested. You open it, give it scans, and it runs them itself
(the batch `.bat` stays for big unattended runs). Every type of every category is loaded with its whole node setup.
The same scans stay on screen while you switch type, so you see what each pipeline does to the same files. Any type
can be opened, edited, duplicated or renamed; nodes can be added, removed, duplicated and copied between types.
Restore puts a value back to what the opened type saved. Save adds a dated file and never overwrites.

### Where the design narrows the request, and why

| Point | Why |
|---|---|
| A small local server stays, started by one launcher (`review.bat` / `npm run review`) | A web page cannot read a folder of scans or run a 23 s support build on its own. "No bat" means no BATCH step first. |
| The full run stays in a server process, not in the browser | The engine has a browser build, but a run is `reviewCase.ts` plus about 1,500 lines of layer writers on the file system; the support build is most of the 23 s, so moving it buys little (UNVERIFIED split). |
| Scans x types never run automatically | 10 scans x 4 types is about 15 minutes. The case on screen runs first; the rest on "Run all". |
| An aligner type edits numbers only | The aligner pipeline is locked in code (`nodeGraph.mjs` `alignerGraph`); its chain shows read-only. All-nodes-editable is true for dentures. |
| Renaming a type's id is "duplicate under a new id" | Projects store the id; changing it in place would break them silently. |

## 2. The journey

**The author, in the reviewer**

1. **Open.** The launcher starts the server on a fixed port and opens the page. It reads every category's built-in
   type and the newest save of each saved type. A type file that cannot load is listed with its reason. The stage
   shows one card: choose a folder, choose files, or paste a path.
2. **Import.** The category is asked once, never guessed from the scan. The case list fills at once, every row
   "not run". Scans are read where they are; nothing is copied.
3. **Pick a type.** The case on screen runs first; the stage says "Running case 1 with Soft denture" with seconds and
   Stop, then shows the result. Other cases run on "Run all", each with its own chip. Results go to a git-ignored
   cache.
4. **Switch type.** Same scans, same camera. A cached result shows at once, otherwise the open case runs. A banner on
   the stage always names the scan, the type, and whether the picture is current, a preview, or from before your edits.
5. **Edit.** The type becomes a draft (a dot in the picker). The banner says "Showing the run before your edits".
   Zones, belt widths and the print angle preview live (about 5-8 s); Apply runs the open case. The draft is saved to
   a git-ignored file on every edit, so a reload or a restart keeps it.
6. **Compare.** Pin a second type; one key flips the stage between the two results at the same camera. The facts
   show both columns with differences marked; cases whose facts differ get a dot.
7. **Restore.** Every changed value has a mark: "Restore to 12 (saved in Soft denture). Node default: 10".
8. **Duplicate, rename, copy** (section 3e).
9. **Save.** Allowed once the draft as it stands has run on at least one scan (the strip says "run on 1 of N").
   Writes `types/<category>/<id>.<YYYYMMDD-HHMMSS>.type.json`. Refused if a newer save of that type exists than the
   one you opened. Shows the path, whether the app will load it, and the git commands. It does not commit or push.
10. **Commit and push** by hand, after the local gate.

**The operator, in the app.** The type picker lists the newest save of each type. A broken newest save falls back
to the one before it, and the files page says so. Nothing else changes for them.

**Rollback and retire, in the files.** Delete the newest file of a type to roll back; delete all its files to retire
it. Git keeps the history.

## 3. How it works

**a. What runs where**

| Part | Where |
|---|---|
| Stage, canvases, draft editing, restore, compare | The page, as pure tested modules; `viewer.html` only draws |
| The type list (built-ins, newest saves, refusals) | One script the server runs at start and after each save |
| Full runs and live previews | Server child processes, as today, through a queue of 2 at a time (memory first) |

**b. One way to run a type.** Today the page sends pieces (pose, placement, graphs, rules) and the server rebuilds a
draft from the built-in (`typeInForce.ts:67-96`), which is why a saved type cannot be opened. New: the page holds the
whole type file as the draft and sends it whole; the server runs typelab with `--type` on it - a path that already
exists (`MIXO_TYPE_FILE`, `typeInForce.ts:61`). Previews use the same file.

**c. What the page keeps**

- **Scans:** path and a fingerprint of the bytes (`scanPrint` exists).
- **Types:** for each id, `base` (as loaded, never changed) and `draft`.
- **Results:** by scan fingerprint + type fingerprint + engine version, each pointing at a one-case run folder. The
  type fingerprint leaves out name, badge and proof, so a rename keeps its results. Undoing an edit finds the old
  result again at once.
- **Cache size** is shown with a Clear button: `typelab/output/` already holds about 3.3 GB.

**d. Restore.** `defaultParam` (`nodeGraph.mjs:448`) already takes a standard graph as an argument. Passing the
opened type's saved graph gives the owner's rule: the same node (id and kind) in the saved type, else the kind's
default, labelled "node default". Profile numbers and rules restore to `base`.

**e. Duplicate, rename, copy**

| Action | What it does | Refused when |
|---|---|---|
| Duplicate type | New id, starting from the source's saved setup; `basedOn` names the source | The id or display name is taken |
| Rename name or badge | A new save of the same id | The name matches another type |
| Rename id | Offered as "Duplicate under a new id"; the old id keeps loading, and the status says projects still use it | Never done in place |
| Duplicate nodes | One node or a selected group; copies get new ids, wires kept | Fixed kinds ("found on an earlier tab"), the locked aligner graph |
| Copy nodes to another type | One node or a wired group, same category and same tab; wires to nodes not copied arrive empty and are named | Other category or tab, fixed kinds, kinds the palette does not offer |

**f. Saves.** One pure module, `src/dentalTypes/typeSaves.mjs`, used by the app and the server: read
`<id>.<stamp>`, pick the newest per id, fall back with a note, refuse an id that ends like a stamp. The app stops
bundling every save: it loads the newest and one fallback per type. `types/` holds no type file yet, so nothing
needs migrating.

**g. Kept, changed, retired**

| Kept | Changed | Retired |
|---|---|---|
| The batch run and both `.bat` files, the graph libraries, the canvases, the previews, the five tabs | The type strip's state moves from browser storage to the draft file; `/rerun` becomes a queue | Drafts rebuilt from pieces; the single `/out/` folder; Save that overwrites; the random port |

`viewer.html` (3,067 lines) is named debt and is not rewritten here: new logic lands in pure modules, the page draws.

## 4. The screen

Left to right: case list, stage, facts. The header holds category, type picker and compare. The five tabs and their
canvases stay below the stage.

| Control | `data-ui` |
|---|---|
| Choose folder, choose files, path | `import-folder`, `import-files`, `import-path` |
| Category, type picker, one type | `category-pick`, `type-pick`, `type-entry-<id>` |
| New, duplicate, rename | `type-new`, `type-duplicate`, `type-rename` |
| Compare with, flip | `compare-pick`, `compare-flip` |
| Stage banner | `stage-state` |
| Apply, run all, stop | `run-apply`, `run-all`, `run-stop` |
| A case's status | `case-chip-<n>` |
| Restore one value, restore a tab | `restore-<key>`, `restore-tab` |
| Duplicate, copy, paste nodes | `node-duplicate`, `node-copy`, `node-copy-group`, `node-paste` (Zones); `orient-node-*` the same on 1 Orient (2026-11-26) |
| Save, discard | `type-save`, `type-discard` |
| Cache size, clear | `cache-size`, `cache-clear` |

| State | What the stage shows |
|---|---|
| Empty | The import card |
| Importing | The case list filling, a count; "No STL files in that folder" when none |
| Not run | "Not run with this type" and Run |
| Running | Case k of n, seconds, Stop |
| Done | Banner: scan, type, current |
| Before your edits | Banner says so, with Apply |
| Preview | Preview layers marked "preview; pillars come with Apply" |
| Failed | The reason in plain words, the log's last lines, Retry |
| Refused | The node or value named, linked to its tab |
| Compare | Both type names in the banner, the shown one in bold |

## 5. Build order

Each row is one reviewable commit with the test that proves it. No row changes how the app decides, so no typelab
round is needed. Row 4 is the hinge: if a whole-file run is not bit-equal to today's piecemeal run, everything after
it waits. Row 10 changes which file the app loads and gets the full gate with the walk.

| # | Commit | Proving test |
|---|---|---|
| 1 | `typeSaves.mjs`: dated names, newest per id, fallback | Pure tests, including an id that ends like a stamp |
| 2 | The type list script and `GET /types` | Tests on in-memory files: built-ins, newest saves, refusals |
| 3 | `typeDraft.mjs`: base and draft, set, restore, fingerprint | Pure tests; a value restores to the saved one, not the node default |
| 4 | A run takes the whole draft file | Parity: the piecemeal run and the whole-file run give the same type text |
| 5 | Import: folder, files, path | Server test: only `.stl`; refused when the server is open to the network |
| 6 | Result cache and run queue, the open case first | Key and invalidation tests |
| 7 | **The type picker drives the stage - the owner's core loop works from here** | Walk: import, switch type, the banner and facts change |
| 8 | Drafts on disk, fixed port, restore marks from saved values | Walk: a reload keeps the edits |
| 9 | Save adds a dated file, refuses to shadow a newer save | Server rule tests |
| 10 | The app loads the newest save per type, falls back with a note | `shippedTypes` / `typesReady` tests; full local gate |
| 11 | Compare: flip and the facts' differences | Pure difference test; walk |
| 12 | Duplicate and rename a type | Pure tests for `basedOn` and the refusals |
| 13 | Duplicate nodes and copy them across types | Graph tests: new ids, empty wires named, fixed and cross-category refused |
| 14 | Docs, the folder README's map, retire the dead paths | `viewerScript.test.ts`, the bundle test |

## 6. Decisions for the owner

| # | Decision | Recommendation | Why |
|---|---|---|---|
| 1 | Run the engine in the browser | Not now | The build is most of the time; the port is large |
| 2 | How scans come in | Folder dialog and path first; dropped files later | Patient scans are read in place, never copied |
| 3 | Run every scan with every type | No: the open case, plus "Run all" | Switching stays quick, memory stays low |
| 4 | Runs at once | 2 | Memory first; raise after measuring |
| 5 | Where drafts live | A git-ignored file per type on the server | Survives restarts and browser clearing |
| 6 | Compare | Flip at one camera | One model in memory; differences show in place |
| 7 | Renaming an id | Duplicate, then retire on the files | Projects store the id |
| 8 | Projects and a newer save of their type | Unchanged for now, decided separately | Pinning a project to a save is an app change |
| 9 | Built-in types in the picker | Shown read-only, "Duplicate to edit" | They are code, not files |
| 10 | Editing when the server is open to the network | Off | Import can list folders on this machine |

## 7. Risks, and what was not verified

- The 23 s per case and its split come from the docs, not a measurement; memory with two runs at once is unmeasured.
- A lazy load of type files must still register types in every engine worker; today's test guards the entry points,
  not that. Row 10 is built alone and walked.
- How the canvases handle selecting several nodes was not read (`ZoneEditor.tsx`); row 13 starts by reading it.
- The cache grows fast; the size readout ships with the cache (row 6).
- Left out on purpose: side-by-side split view, showing the raw scan before its first run, uploading dropped files,
  migrating old-style files (none exist).
