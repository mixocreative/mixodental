# Where the spatial puck lives, and what to tidy here — 2026-11-11

**UNAPPROVED.** A plan for the owner to amend or refuse. Nothing in it has been done. Written by the
lead with [Fable](#what-fable-said-and-where-it-was-wrong) consulted on the judgment calls, per the
standing rule; every number below was measured in this repo today, and the two places Fable's facts
were wrong are corrected in-line.

---

## The short version

1. **The puck is its own repo** — `mixospatial` — with the firmware and the browser half **together**
   in it, because they share a byte layout and must change in one commit.
2. **The contract is the product, not the client.** `PROTOCOL.md` plus a folder of golden packets
   that *both* test suites read. The TypeScript client is one dependency-free file; do not build
   geocore-style vendoring machinery for it.
3. **Nothing in mixodental moves** except the loose files at the root. Twelve top-level folders is
   not too many; the problem is that their names do not say what they hold, and a README table fixes
   that for nothing.
4. **Add a guard that fails when a tracked file appears at the repo root** that is not on a short
   allowlist. Thirteen review reports arrived at this root between 6 and 11 November because every
   review tool writes to the working directory. A rule in `CLAUDE.md` alone will not hold.
5. **The family rule: products, parts, tooling — and every repo is exactly one kind.** A product
   never takes code from another product; a part is created when the *second* consumer exists, not
   in anticipation.

---

## A — Where the puck lives

### The decision

One new repo, `mixospatial`, holding the firmware and the web client side by side.

**Why not inside mixodental.** The toolchains share nothing: Zephyr, west, CMake, device trees and a
flash-and-debug loop against a board, versus Vite and Vitest. Every gate this repo has — `tsc`,
1590 tests, the 186-check browser walk, the vendored-WASM parity suite — says nothing about C. And
mixodental is mid-flight: `main` is five commits ahead of the deployed build with a human-test
checklist pending. A hardware project in its own repo costs this one nothing.

**Why not two repos.** The firmware and the client share a byte layout. One person should not need
two commits in two repositories to add a field to a packet.

**Why not mixomesh.** Same product-takes-code-from-product problem as everything else; see D.

### The three things to settle on the bench before any of this structure matters

Fable raised these and they are the right order of work. None is a code question:

| Risk | Why it decides the project |
|---|---|
| **A CR2032 under BLE transmit peaks with a gyro running** | if the coin cell cannot hold it, the whole product changes shape (rechargeable, bigger cell, duty cycling). Measure first. |
| **Tap and double-tap from the IMU's own interrupt** | Zephyr's driver for the XIAO's IMU may not expose tap triggers, which would mean writing registers directly. That is the difference between a weekend and a fortnight. |
| **Yaw drift** | a 6-axis IMU has no heading reference, so yaw walks. The "set it flat and re-zero" button is not a convenience, it is the mitigation — and it should be in the first spike, not added later. |

*These three are from the auditor's and Fable's knowledge, not from a datasheet read today. Treat
them as the first bench session's agenda, not as facts.*

### The first consumer — settled by the owner, 2026-11-11

**The puck is a desktop accessory: PC and Mac only.** The owner's reasoning: dentists work in an
office and send the print from a PC. That answers the open question and removes most of the
objection below, which is recorded because the part of it that survives is a UI rule.

The original objection was that **Web Bluetooth is Chromium-only and absent on iOS**, while
mixodental's README promises it "runs in the browser on Windows, macOS, Linux, ChromeOS, tablets and
phones" — and last night's audit already filed two findings about that promise (MIXO-03, MIXO-04).
A desktop-only accessory makes that a non-issue on mobile, because the feature is simply not offered
there. **What survives is narrower and still real: on the desktop, Web Bluetooth is Chromium —
Chrome, Edge, Opera, Brave. Safari does not have it on macOS either, and Firefox does not have it at
all.** So "Mac" means "a Mac running Chrome", and macOS additionally asks the browser for Bluetooth
permission on first use.

**The rule that follows, and it is the whole of it:** the Connect button exists only when
`navigator.bluetooth` does, and where it is absent the panel says *why* in one sentence rather than
not being there. That is capability detection — exactly the thing MIXO-04 found this app has nowhere
— so this feature should be the first place it is done properly, not another place it is skipped.

Two smaller consequences of "desk, office, PC":

- **The interaction is set-it-down, pick-it-up.** That makes "set it flat and re-zero" the central
  gesture rather than a calibration afterthought, and it is what the demo page should open on.
- **The battery profile is minutes of use and long idle**, not continuous streaming. Auto-sleep on
  inactivity is therefore worth more than transmit efficiency, which is good news for the CR2032
  question in the bench agenda above.

Still true regardless: **wire the puck into nothing until it drives its own demo page**, and when it
is wired in, the client emits plain `[x, y, z, w]` numbers while the consuming app owns the three.js
— which keeps this repo's "three.js only in `src/components/`" boundary intact.

---

## B — The shape of `mixospatial`

```
mixospatial/
  README.md              the map, the pinned SDK version, how to flash, how to run the demo
  PROTOCOL.md            THE CONTRACT: service and characteristic UUIDs, packet layout, byte
                         order, units, axis convention, the version byte
  protocol/fixtures/     golden packets — hex in, expected values out — read by BOTH test suites
  firmware/
    CMakeLists.txt  prj.conf
    boards/              one .overlay + .conf per board, and nothing else board-specific
    src/                 main · orientation (pure C fusion) · tap · ble_service · power · led
    tests/               ztest on native_sim: the fusion and the packet packing, no board needed
  web/
    src/puck.ts          framework-free: connect, reconnect, parse, calibrate, events
    tests/               decodes protocol/fixtures — the contract test
    demo/                the three.js page, battery panel, recalibrate button
  hardware/
    enclosure/<board>/   source CAD + STEP + exported STL/3MF + print notes
    electronics/         pinout, BOM, the KY-016 wiring
  docs/decisions/        why a coin cell, why this IMU, why a quaternion
```

**Three details that are the whole design:**

- **`PROTOCOL.md` and `protocol/fixtures/` sit above both halves** and belong to neither. Last
  night's audit of this repo found exactly this class: the exported STL was proved only by our own
  reader, which shows the two halves agree and nothing more. A puck whose firmware and client are
  tested only against each other has the same hole. Golden packets that both suites read is the
  cheapest fix there is, and it has to exist from the first commit.
- **Two boards, one `src/` — and no `LED_ON`/`LED_OFF` macros.** The sketch's `#if defined` is
  solving a problem Zephyr already solved: each board's devicetree declares its LEDs
  `GPIO_ACTIVE_LOW` or `GPIO_ACTIVE_HIGH`, the application calls `gpio_pin_set_dt(&led, 1)`, and the
  polarity never reaches the code. The nRF54L15 overlay declares the external KY-016 on D0–D2 under
  the same aliases (`led-r`, `led-g`, `led-b`, `imu0`) that the XIAO's internal LED uses.
  `GPIO_OUTPUT_INACTIVE` gives the safe-off state before deep sleep on both. Use the platform's
  mechanism, not a parallel one.
- **The enclosure is per board**, because the KY-016 module changes the cavity. Keep the CAD source
  *and* the exported printable next to each other; commit the STLs directly, since a puck is small
  enough that LFS is not worth it; version by git tag, never by filename.

Two smaller calls: **send a quaternion, never Euler** (4 × int16 is 8 bytes and fits a default
notification, and it has no gimbal problem), and **use the standard Battery Service** rather than a
custom characteristic.

---

## C — What to tidy in mixodental

### Do not move any top-level folder

**212 files pin a literal path.** `docs/dental-reference/reference-aligner.stl` appears at 33 sites,
`../../scripts/test-support/*` at 50-odd, and `src/styles.css`, `dentalwork/fixtures/case-denture`
and `vendor/mixo-geocore/pkg-node/…` all appear in path literals and glob strings. Around 58 guard
tests read source text or enumerate files by path. Moving a top-level folder is a wide refactor that
would redden that suite in ways nobody can read, for no behaviour gained.

The names are the problem, not the layout:

| Folder | What it actually is |
|---|---|
| `scripts/` | **207 of its 284 tracked files are fixtures**, not scripts |
| `docs/` | 73 MB, because `docs/dental-reference/` holds test meshes |
| `artefacts/` | git-ignored, yet 12 files are tracked in it — deliberate, and invisible |
| `benchwork/` | one tracked file |

### Do this instead, in this order

1. **A repo map in `README.md`.** One row per top-level folder: what it holds, tracked or generated,
   who writes it, whether it is safe to delete. The "For developers" section has no map today, and
   the project already does exactly this for `src/components`, `src/items` and `src/deck`.
2. **Move the thirteen loose reports** into `docs/reviews/`, renamed to the convention that folder
   already uses (`YYYY-MM-DD-<tool>-<topic>.md`). That is the twelve EGM/goldfish/zoom-out reports
   (223 KB, arrived 6–7 November) **and `docs/reviews/2026-11-11-cia-audit.md`, which the auditor added to the pile
   last night**. Checked: the only live document that cites any of them is
   `docs/design/2026-11-07-import-and-items-flow.md` — one link. The rest cite each other, so they
   travel together. *(Fable said `docs/HANDOFF.md` and `src/items/README.md` cite them too; grep says
   they do not.)*
3. **A root-allowlist guard test.** It fails when a tracked file appears at the repo root that is not
   on a short list. Without it this comes back: thirteen reports arrived in six days because review
   tools write to the working directory, and a sentence in `CLAUDE.md` does not stop a tool.
   Add the sentence as well, naming `docs/reviews/YYYY-MM-DD-<name>.md` as the only home for review
   output.
4. **Ask about `Aligner.stl`** before touching it. It is untracked, 18,697,884 bytes — *exactly* the
   size of `docs/dental-reference/reference-aligner.stl` — with a **different sha256**. Same triangle
   count, different coordinates: the same mesh re-oriented or re-saved. It is 18.7 MB sitting in the
   working directory and `docs/SHIP-PLAN.md` says it is not a gate, but it is not obviously
   disposable either.

---

## D — The family, as it grows

`S:\ai` holds about 28 entries across at least three unrelated families (`mixo*`, `senmori*`,
`komorebi`/`kitra`), including loose files (`docker-compose.yml`, `openclaw.json`, three
`mixoweb-*.md`), debris (`mixomesh-hotfix`, `mixoweb-suite-logs`, `gate0-data`, `script`) and a model
store (`ollama_models`). **"So many folders" describes that, better than it describes this repo.**

**Do not move project folders.** Claude's project memory is keyed on the path and the skill junctions
hardcode `S:\ai\skills`. Write one index file instead — folder, kind, repo, consumes, consumed-by,
active/parked/dead — put each loose file in its owning project, and retire the `-hotfix` clone.

### The rule worth adopting

**Three kinds of repo, and every repo is exactly one kind.**

- **Products** — deployed to a user: `mixodental`, `mixomesh`, `mixosupports`, `mixo-ar`, the puck's
  demo.
- **Parts** — consumed as built: `mixo-geocore`, `mixo-app-style`, the puck's protocol and client.
- **Tooling** — the skills.

Two consequences: **a product never takes code from another product** (anything two products need
becomes a part first), and **a part is created when the second consumer exists, not in
anticipation**. The naming already nearly encodes this — no hyphen for products, `mixo-` for parts.
Make it the rule rather than a coincidence.

**The one thing to stop:** letting agent output count as documentation. A report is either cited by a
decision — in which case it is filed and dated — or it is deleted. That one habit produced the
thirteen root files here, the three loose files in `S:\ai`, and 223 KB of review prose nobody has
re-read.

---

## Open questions for the owner

1. **`Aligner.stl`** — same size as the reference aligner, different hash. Keep, replace the
   reference with it, or delete?
2. ~~**Who is the puck's first consumer?**~~ **Answered by the owner, 2026-11-11: the puck is a
   desktop accessory, PC and Mac only — dentists work in an office and send the print from a PC.**
   So mixodental is a fine first consumer, the mobile objection falls away, and what is left is the
   capability rule in A: the Connect button appears only where `navigator.bluetooth` does, and says
   why where it does not. Note for the day it is built: on the desktop that still means Chromium —
   a Mac user in Safari has no Web Bluetooth.
3. **Support generation lives in three places** — kept port-ready in mixodental, handed over by copy
   to `mixomesh/port/mixosupports`, and planned into mixomesh. By the rule in D that is
   product-to-product transfer, and one person now owns dental supports in three places. Either it
   becomes a part, or two of the three stop owning it. **This contradicts a recorded decision (the
   mixomesh port plan), so it is a question and not a finding** — but it is the biggest structural
   question in the family and it will only get more expensive.

---

## What Fable said, and where it was wrong

Fable was consulted with the measured facts and asked to attack the lead's candidate answer. It
agreed that the puck is its own repo and that mixodental's folders should not move, and it improved
the plan in four ways that are now the plan: the protocol rather than the client is the shared
artefact, the client is one file and needs no vendoring machinery, mixodental is a doubtful first
consumer because of Web Bluetooth, and the real clutter is `S:\ai` rather than this repo. The
devicetree-not-macros point was reached independently by both.

Two of its facts did not survive checking, and are corrected above: `docs/HANDOFF.md` and
`src/items/README.md` do **not** cite the root reports (only one design doc does), and its claim
about `Aligner.stl` needed the hashes to be run — they were, and it was right to say do not delete.
Its hardware risks are from memory and are listed as a bench agenda rather than as facts.
