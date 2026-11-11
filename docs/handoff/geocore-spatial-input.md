# Handoff to mixo-geocore: spatial input as a second device, beside the pointer

**For:** `mixocreative/mixo-geocore` (vendored here at engine 63, commit `b5a71ab`).
**From:** mixoDental, 2026-11-11.
**Why:** the owner's call — the puck's commands belong in the engine so mixoMesh and mixoDental do
not each write them. This doc says which part of the puck belongs there and which part must not,
and why the line falls where it does.

## The owner is right, and geocore already set the pattern

`editing/ViewportPort.ts` opens with the rule:

> The only way `editing/` reaches a 3D view (D22). Each app implements it over its own renderer
> (Babylon in mixomesh, three.js in mixoDental); everything drawn (rings, ghost tips, overlays,
> highlights) stays in the app. Editing code works in plain data.

That is exactly the shape this needs, with the device in the renderer's place. geocore owns **what a
turn means**; the app owns **the device that turned**. `editing/` is already the shared interaction
layer and not a geometry library — it holds `gesture.ts`, `keys.ts`, `modes.ts`, `numberInput.ts`,
`pick.ts`, `dragOver.ts` and a typed command registry — and mixoMesh vendors exactly `editing/` and
`host/`, importing them from `EditBar.tsx`, `sessionStore.ts` and `supportData.ts`. So the sharing is
demonstrated, not hypothetical.

## What geocore does not have, which is the core of the ask

```ts
// host/core/vec3.ts
export type Vector = [number, number, number];     // and nothing else — there is no quaternion
```

```ts
// host/core/transform.ts
/** … rotation as Euler angles in radians, order 'XYZ' (world frame Y up, right-handed).
 *  The matrix is `T · R`, R = Rx · Ry · Rz. */
export interface Placement { position: Vector; rotation: Vector }
```

The puck sends a **unit quaternion**; the engine's rigid placement is **Euler XYZ in radians**. So a
quaternion-to-`Placement` conversion has to exist, and it is precisely the thing that must exist
**once**. Written twice it will differ, and the symptom is *"the model turns the wrong way about one
axis only"* — which reads like a sign error and is not one.

## The three layers, and where each belongs

| Layer | What it is | Home | Why there |
|---|---|---|---|
| **transport** | `navigator.bluetooth`, GATT, reconnect, the chooser's user gesture | **mixospatial** `web/src/puck.ts` | browser I/O. geocore has a *port* for the renderer and never touches three.js or Babylon; the symmetric rule is a port for the device and no `navigator.bluetooth` in the engine |
| **codec** | bytes → quaternion; the version rule; reject-and-surface | **mixospatial**, beside the firmware | if the packet layout changes, firmware + codec + fixtures change in **one commit in one repo**. Split them and `protocol/fixtures/` stops being a single source of truth, which is the whole reason it exists |
| **the command** | quaternion → `Placement`; re-zero; what "turn the model" *means*; the labels and the enabled state | **geocore** `host/core/` + `editing/` | both apps need the same answer and must not each derive it. This is the sharing the owner asked for |

**The transport is genuinely not the same in the two apps**, which is the strongest argument for the
line being here rather than one layer up: mixoDental is a browser tab, where Web Bluetooth is
Chromium-only and `requestDevice()` must be called from a click handler. mixoMesh is Electron 43,
where Web Bluetooth needs a `select-bluetooth-device` handler in the main process. Two transports,
one command — the same situation as Babylon against three.js, answered the same way.

## The ask, in three parts of very different size

### 1. A quaternion in `host/core` — small, pure, and the only part with maths in it

`host/core/quat.ts`: a `Quat` type, `multiply`, `conjugate`, `normalize`, `fromAxisAngle`, and
`toPlacementRotation(q): Vector` — the quaternion expressed in the Euler convention
`transform.ts` already documents. No WASM, no `crates/` change, testable in the existing suite.

**The trap, written here so it is met before it is made:** `transform.ts` documents
`R = Rx · Ry · Rz`. A quaternion-to-Euler conversion that assumes the ZYX order most references use
is wrong, and it is *correct at rest and for small tilts* — so it passes a smoke test and fails on
the first real turn.

Component order is a second one: the puck's wire format is `x, y, z, w` (`w` last, matching
three.js), recorded in `mixospatial/PROTOCOL.md` §5. Pick an order in `quat.ts`, say which, and make
the fixtures cross it.

### 2. A device record and a port — mirroring `PointerRecord` and `ViewportPort`

`editing/SpatialPort.ts`, in plain data exactly as `PointerRecord` is:

```ts
export interface SpatialRecord {
  /** Unit quaternion, the app's own frame, w last. */
  quaternion: readonly [number, number, number, number];
  status: { still: boolean; uncalibrated: boolean; lowBattery: boolean };
  /** The device's own counter. A GAP means notifications were dropped. */
  seq: number;
  /** Milliseconds, any monotonic origin — as `PointerRecord.timeStamp`. */
  timeStamp: number;
}
```

geocore never sees a byte and never sees a GATT handle. **Carry `seq` through**: the puck's
`PROTOCOL.md` §8 requires that a discarded packet be *surfaced*, and `editing/status.ts` and
`editing/toast.ts` are where a count becomes something a person sees. A port that drops `seq` makes
that rule unimplementable in the layer that owns the words.

`status.uncalibrated` matters for the same reason: until the puck has a stored zero it reports a raw
frame, and the app has to say so rather than quietly show a plausible wrong orientation.

### 3. Rows in the command registry — **CORRECTED 2026-11-12, and this part of the ask is withdrawn**

**What this section claimed, and why it was wrong.** It asked for `spatial.connect`,
`spatial.rezero` and `spatial.disconnect` in `COMMAND_IDS`, on the grounds that *"both apps get
label, hint, role, enabled-reason and i18n key in one place"*. Two independent reviews of the
three-repo plan took that apart, and both were right:

- **"Both apps" is false, and nothing planned makes it true.** mixoMesh imports **17** `editing/`
  modules — `regenerate`, `addTip`, `shapeEdit`, `session`, `check`, `removal`, `stroke`,
  `selection`, `islandProblems`, `omittedProblem`, `screenBrush`, `selectionHighlight`, `pick`,
  `gesture`, `types`, `ViewportPort` — and **not `commands.ts`**, nor `keys.ts`, `modes.ts`,
  `status.ts` or `toast.ts`. It has its own UI state (`src/panels/supports/supportUi.ts`) and its own
  status words (`src/supports/live/statusText.ts`). The registry has exactly ONE consumer. A
  re-vendor is not an adoption: shipping it 64 does not make it call `resolve()`.
- **The field is `disabledReason`, not "enabled-reason"** (`editing/commands.ts:101`). Someone
  grepping this document for the name I used finds nothing. A new row also owes **six** required
  members — `role, label, hint, visible, enabled, disabledReason` — not the four I listed.
- **The input column was understated.** I wrote "a 4-field record + `UiState` in". `UiState` is not
  one field: it is **27 required fields** (`commands.ts:36-83`), of which a spatial row would read
  one or two. The row looked narrow because I shortened its input.
- **There is already a documented way to do this without touching core**, which I never named:
  `ExtraCommandIds` (`commands.ts:29`), `registerCommands()` (`:378`, with clash detection and a
  remover for tests), `commandIds()` merging both (`:396`), and `commandOf` falling through (`:401`).
  `UiState`'s own comment at `:35` says *"an app mode adds (optional) fields by augmenting it"*.
- **And the capability check is the transport wearing a plain-data coat.** `spatial.connect` IS the
  chooser's user gesture, which this document's own layer table assigns to the app: in a browser it
  must fire inside a click handler for `requestDevice()`, in Electron it needs a
  `select-bluetooth-device` round trip through the main process. One row, two press shapes. Worse,
  in Electron the capability is always true, so a shared "no Web Bluetooth here" sentence is a
  reason that can never be correct there — and because `disabledReason` is defined exactly when a
  visible command is not enabled, a permanently-false capability would make `spatial.connect`
  permanently visible-and-disabled in every app that renders the registry. That is a visibility
  policy, which is an app decision.

**So: parts 1 and 2 of this ask stand. Part 3 is withdrawn.** `host/core/quat.ts` and
`editing/SpatialPort.ts` are jobs with narrow outputs and belong in geocore. The three command rows
and the capability fact stay in **mixoDental**, registered through `registerCommands()`, until and
unless mixoMesh adopts `commands.ts` — and that adoption is its own piece of work with its own cost,
which no plan has priced.

The capability check itself is still owed, and the audit's point stands: a control that exists
nowhere is what made a browser with no WebGL2 render a blank page (MIXO-04). It just belongs in the
app, beside the check that now lives in `src/main.tsx`.

## The one design question inside this, with a recommendation

**Does the puck turn the camera, or the selected object?**

Recommended: **the selected object, falling back to the camera when nothing is selected.** The
puck's gesture is pick-it-up-and-turn-it, and that is what a person does to an object in their hand,
not to a room. The fallback keeps it useful with an empty selection, which is the state the app opens
in. If it turns out to feel wrong on real hardware, it becomes a `spatial.drive` toggle — one more
registry row, not a redesign. The owner's call either way.

## What is deliberately not asked for

- **No BLE in geocore.** Not the transport, not reconnect, not permission handling.
- **No new WASM and no `crates/` change.** All three parts are TypeScript in `host/` and `editing/`.
- **Nothing yet.** The puck's three bench answers come first (`mixospatial/docs/decisions/`): the
  CR2032 under BLE load, whether the IMU's tap interrupt survives a hand-held puck, and the drift of
  raw orientation over minutes. A port designed around an interrupt that does not work on a
  hand-held device is a port designed twice. The value of this doc today is that the boundary is
  settled before either side is written.

## The constraint found while checking this: the two apps are 51 engine versions apart

**Both apps pin their copy properly.** An earlier revision of this doc claimed mixoMesh had no
stamp; that was wrong, and it is corrected here rather than quietly dropped so nobody re-derives it.
mixoMesh's layout simply differs — the engine must be served by Vite, so it sits in
`public/vendor/mixo-geocore/` with the stamp, while the TypeScript sits in
`vendor/mixo-geocore/{host,editing}`. Looking only at the latter is what produced the wrong claim.

| | stamp | engine | commit |
|---|---|---|---|
| mixoDental | `vendor/mixo-geocore/SOURCE.json`, 110 files hashed | **63** | `b5a71ab` |
| mixoMesh | `public/vendor/mixo-geocore/SOURCE.json`, 97 files hashed | **12** | `6cc5385` |

Both verify. `node scripts/vendor-geometry.mjs --check` in mixoMesh exits 0:
*"mixo-geocore engine 12 (6cc5385) verified in public/vendor/mixo-geocore and vendor/mixo-geocore."*

**What actually follows is a schedule, not a defect.** Of the 94 `host/` + `editing/` files the two
apps have in common, **20 differ**, and mixoDental carries 16 the other does not. So `editing/` is a
layer both apps *vendor*, not a layer both apps are *level on*.

For this ask that means: a new `editing/SpatialPort` lands in geocore at 63 or later. **mixoDental
picks it up on its next vendor; mixoMesh picks it up only when it re-vendors across 51 ABI
versions**, which is its own project and not a side effect of this one.

And the §3 correction above sharpens this rather than softening it: the gap is not the only reason
mixoMesh would not share the command rows — **it does not import the registry at all**, so levelling
the engine would not hand it those rows either. Write the port for geocore, expect mixoDental to be
its only consumer for now, and do not size the work as though both apps light up together.

The one cheerful part: because both stamps exist and both carry `engineVersion`, measuring that gap
is reading two files. No new mechanism is needed to see it — only the habit of looking.
