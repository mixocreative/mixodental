# The node plan — how a dev builds a new type from free nodes

**The acceptance test, which is the owner's and governs everything below:** the node set must rebuild
**today's denture and today's aligner, byte for byte**, from nodes alone. A vocabulary that cannot
reproduce what already ships cannot be trusted to express what does not yet exist. `gate:real` is the
judge, and the default program for each kind must come back "No differences".

Written 2026-11-20 from the owner's framing, a Fable read of both pipelines, and my own traces. Every
engine fact here was read in source; where a claim is unverified it says so.

---

## 1. THREE STAGES, and print tilt is not one of them

The owner's division, and the source agrees with its weighting:

| Stage | What it decides | Authoring today | Where the work is |
|---|---|---|---|
| **1. Rim and orientation** | the frame, the rim, the planes | **none** - all calibration | heavy in detection code, light in authoring |
| **2. Zones** | which faces may carry tips | R1b angle and socket depth only | **every new engine item** |
| **3. Support defaults** | which tips appear, and the supports under them | ~40 rules already live | nearly all live today |

### "Print tilt" is a bad name, and that is why it reads as ambiguous

The owner said he does not know what it is. The name is the problem: it sounds like a setting someone
chooses, and it is a **search result**. From the module's own header (`denture/tilt.rs:1-11`):

> *the denture print-angle search: tilts from upright (0) to the profile's range, leaning so the teeth
> side faces up by the tilt, each judged by the hard rules that apply to a denture and scored by the
> area that needs support.*

In plain words: **the denture is printed standing on the plate, teeth end down. The engine leans it
over, trying every angle from 0° (bolt upright) to 45° in 2° steps, and keeps the best one** -
rejecting any lean where a tip's neck hits the model (Crossing) or a pillar is too thin for its
height (Slender).

**"Best" is an ordered preference, and supported area is only the fourth term of it**
(`tilt.rs:16-19`): robust tilts first, then passing, then fewest failed rules; **within a tier**,
fewest boxed-in lowest points, then fewest lowest points outside the allowed area, then the smallest
overhang area, then the lowest print height, then the lower tilt. An earlier draft of this page said
it "keeps the lean that needs the least supported area", which is the fourth tie-break described as
the rule.

It matters because **the lean decides which faces are overhanging**, and overhanging faces are the
ones that need support. Tilt the part and a different set of faces needs tips.

So there are two things wearing one name, and the plan separates them:

- **Print angle** — the result. One number per case, shown in the facts ("8°, stable 0-44").
- **Print-angle search** — the solver that found it: a range, a step, a tie rule, a score.

**The search is a solver, not a stage.** It authors nothing: per candidate angle it re-runs stage 3's
placement against stage 2's masks and scores the result (`denture/tilt.rs:183-236`). Zones exist
before any tilt. So it leaves the chain and becomes a **readout** beside stage 3 - "picked 8°, from
0-44, because X" - because a zone edit moves the pick, and tips must not move for a reason that is
off screen. Its range, step and tie rule become solver settings under stage 3.

**A smell sits inside it, and it is smaller than I first said.** Only `Crossing` and `Slender` are
ever written (`tilt.rs:220, 224`), while `passes()` and `failed_count()` range over all four, so two
rules that were never assessed are counted as passed. That arithmetic is real. **But the concern Cup
stands for is not unguarded**: boxed-in lowest points are preferred against within the tier, as the
pick order above shows. I first reported this as "a tilt judged on half its rules", which overstated
it by reading the module header and not the pick. **CANDIDATE**, not confirmed: the header's
justification ("every prominent lowest point gets a tip") is still contradicted by the engine's own
`lows_unreached`, and nothing here was run.

**Stage 1 is locked on purpose.** Its numbers are calibration: clinical, but editing one voids the
type's validation record. It is shown, not offered. That is the third class from *WHO OWNS A NUMBER*.

---

## 2. THE REFERENCE VOCABULARY — the owner's location nodes, made safe

This is the part the owner specified, with one correction that the source forces.

### Frames and boxes

- **Frame** (`denture/canon.rs:25`) — `up`, `teeth`, `across`, and an origin. Every other reference is
  built on it. Its directions have NAMES: back, front, top, tissue, and the two across.
- **Tight box** — and the name is the engine's, not mine: `denture/obb.rs` IS the tight box, a
  vertex-cloud PCA box, and the review calls it that. This is the owner's "oriented bounding box" and
  it is the one to offer. **The default Sight cast origin binds to it literally** (`Obb`,
  `oral_cavity_ray.rs:51-53`), not to a redefined "extent in the Frame": the two are probably the same
  box geometrically, but probably is not byte for byte, and the gate hashes outputs.
- **The import-frame box is NOT offered.** It would hand back the import-orientation dependence the
  engine deliberately removed. This is the one item of the owner's sketch that is refused, and the
  refusal is the reason the rest can be trusted.
- **The PCA box** (`denture/obb.rs`) exists but its axes are ordered by variance with arbitrary signs,
  so **a face may never be named by index**. R2 already picks its face by best match to a frame
  direction (`oral_cavity_ray.rs:51`). Faces are named by frame direction, always.

### Planes — the owner's "6 sides plus 3 centre planes"

From the tight box, nine planes, each named by frame direction:

- **6 faces**: back, front, top, tissue, across-minus, across-plus.
- **3 centre planes**: the mid-plane normal to each frame axis.

Plus the **derived planes**, which are detection results, not box geometry:

- **Rim plane** (`denture/rim_plane.rs:25`) — fitted to the rim.
- **Symmetry plane** (`denture/symmetry_plane.rs:20`) — the vertex centroid plus `across`.
  **It is NOT the box's across centre plane**, which is mid-extent. R2 uses the centroid one, and on
  an asymmetric partial the two are different planes. Offering both without saying so would let a dev
  pick the wrong one and see a plausible result.
- **Rim centre plane** — the owner's term; it is the rim plane, whose point is the rim's own centre.

### Position — a point on a plane, by percentage

**Position** = a plane + **x and y as percentages of the part's extent along the two frame axes in
that plane**. 50/50 is the centre; 0 and 100 are the edges. That is the owner's "intuitively set
centre or close to each of the 4 edges", and percentages of the **frame extent** are what make it
import-independent rather than scan-size-dependent.

**Intersection** is also a Position: two planes and a box face, which is what the oral cavity ray's
origin actually is today (`oral_cavity_ray.rs:1-6`). It stays the DEFAULT for R2, because it is the
arithmetic the engine already does; the percentage form is the free version beside it.

**Two limits, stated rather than discovered later.** The percentage form **cannot reproduce today's
R2 origin** — that origin is an intersection, so the default binds to Intersection and the percentage
form is for new types. And Intersection carries **three fallbacks** (`oral_cavity_ray.rs:55, 59, 67`:
no rim plane, near-parallel planes, a line grazing the face), each of which moves the origin today;
a generic node that drops them is not the same node. On the **rim plane**, which is tilted, the frame
axes must be projected onto it and the percentages measured against the **rim's own extent**, because
that is what "edges" means there.

> An earlier draft of mine claimed a percentage offset would break an invariant by sliding the origin
> off the symmetry plane. That was wrong: nothing else consumes the symmetry plane
> (`denture/symmetry_plane.rs`, `ruled_tips.rs:149-150`), and on an asymmetric partial the centroid is
> off the midline anyway, so an across-offset is a legitimate knob.

### Direction — the owner's "degree of rotation"

**Direction** = two named frame axes and an angle between them. That is literally the engine's own
arithmetic: `no_support_dir_at` is `normalize(back·cosθ + top·(−sinθ))`, with `R1_DEG = 45`
(`oral_cavity_ray.rs:43`). So **"from back toward TISSUE, 45°"** reproduces R1 exactly, and no gizmo,
no Euler angles and no world-space vector ever appear in the UI.

> **The sign is the trap, and I got it wrong twice before it was caught.** The `top` term is
> NEGATIVE, so R1 leans toward `−top`, the tissue side — not toward the teeth. "back→top" is the
> mirror ray and would have failed the acceptance test on the first run while looking perfectly
> reasonable on the page. A Direction node must name the axis it actually travels toward.

A second form, free and equivalent: **Direction = target Position − origin Position**, reusing the
same Position node at both ends.

---

## 3. STAGE 2 — zones as an ordered program

**The owner's central point, and he is right:** a zone is not one decision. It is several rays
producing allowed and forbidden areas that overlap and cancel, and **the order of combination is the
design**. Today that order is five fixed statements (`denture/ruled_tips.rs:151-163`), and the
composition is **pure per-face boolean algebra** - union, difference, a tap - with no statefulness.
The statefulness that was cited for weeks as the reason order could not be data (the `Spacer`
claiming space in stream order) is in **placement**, a later stage. That was a conflation, mine and
Fable's, and the owner caught it.

### Are the engine's functions already node-shaped? Mostly yes — and that is the point

The owner: *"I assume the functions are already modules, so stacking them with nodes each should be
just as clean, and that could be even more clean as nodes?"* Both halves hold, with one correction.

**The leaves are already nodes in all but name:**

    no_support_faces(prepared, canon, dir) -> Vec<bool>     // frame + a direction -> one mask
    allowed_faces(prepared, origin)        -> Vec<bool>     // one point           -> one mask

One job each, and the output is narrower than the input — which is this repo's own test for a clean
module. That is why a node graph is a re-wiring rather than a rewrite: **the leaves need no change at
all**, only an evaluator above them.

**And it IS cleaner than today, for a reason that can be pointed at.** Today the composition is
inline inside `Analysis::of`, a constructor that builds about thirty fields in one expression
(`ruled_tips.rs:151-163` for the zones, then one `Self { … }` for the rest). The precedence is then
**re-derived in six consumers**, two of which contradict each other. As a graph, the composition
becomes data in ONE place and the consumers read named outputs. Strictly more modular than what is
there now, not merely different.

**The correction: the work is not in the leaves, it is in the two things above them.**

1. **`Analysis::of` computes everything eagerly.** A graph needs "evaluate what is wired", so the
   constructor must be split from the units. The units are clean; the orchestrator is not.
2. **Six consumers hold behaviour that is not in any module.** Re-deriving precedence per consumer is
   logic living in call sites. Nodes force it into one place, which is the real cleanliness gain and
   also the real work.

Two leaves are also not uniformly shaped: Depth cast returns a **depth map**, not a mask, and Holes
converts a map into faces. That is a second socket type, not a flaw — but it means "every unit is a
mask node" is not quite true, and an editor that assumed it would offer a wire the engine cannot
carry.

### Sources — each produces a face mask

| Source | Inputs | Engine unit |
|---|---|---|
| **Parallel cast** | Frame, from-axis, toward-axis, θ, pitch, ray cap | `denture/no_support.rs:21` |
| **Sight cast** | a Position | `denture/zones.rs:19` |
| **Band** | seed faces, distance along the surface (mm) | `denture/rim_graph.rs:112` |
| **Depth cast** | Frame, side, pitch | `denture/holes_axis.rs:83` |
| **Holes** | a depth map, min area (mm²) | `denture/holes_axis.rs:166` |
| **Basin fill** | a depth map, min depth, tunnel (mm²) | `denture/sockets.rs:100` |

**Depth cast does not produce a mask.** It returns a depth map (`holes_axis.rs:83-93`), so it cannot
feed a combine directly: **Holes** sits between it and Band, and Basin fill reads a depth map too.
That is a socket type of its own - a map is not a mask - and an editor that let the two connect would
be promising a wire the engine cannot carry.

### The program is a GRAPH, not a row list

An earlier draft of this section had a flat ordered list of rows accumulating into two fixed masks.
The owner's correction: *"different nodes can compound before the final result, and there can be
multiple nodes, and can be reordered."* He is right, and the list is the weaker model for two reasons:

1. **A list can only accumulate into targets that already exist.** Compounding means an intermediate
   result - `(ray A ∪ ray B) − (ray C ∩ band)` - that is itself a mask, feeding a further combine.
   A list cannot name one without inventing a slot for it; a graph gets it for free.
2. **A list's taps are positional, and that is fragile.** "The state after row 3" changes meaning the
   moment someone inserts a row. In a graph, `allowed_cavity` is simply *the output of the Sight cast
   node* — a wire, not a position — so reordering cannot silently redefine it. The tap problem I
   raised against the list model does not exist in the graph model.

So: **a directed acyclic graph of mask expressions.**

- **Source nodes** produce a mask: Parallel cast, Sight cast, Band, Basin fill, Depth cast.
- **Combine nodes** take masks and produce one: **UNION**, **SUBTRACT**, **INTERSECT**, **NOT**.
  Their output is a mask like any other, so combines feed combines to any depth. **SUBTRACT names
  which input is the minuend**, because it does not commute and "which side" is the whole point.
  **NOT is forced by the engine, not added for symmetry:** low admission tests `!no_support`
  (`ruled_tips.rs:191`), which is why undefined faces are admitted there, and the undefined layer is
  itself a complement. Without NOT the default graph cannot state what the engine already does.
- **Output bindings** name the masks the engine's consumers read: `allowed`, `no_support`,
  `allowed_cavity`. Any node's output may be bound to any of them.

**Order is expressed by structure, not by position.** Subtraction does not commute, and in a graph
that shows as *which input feeds which side of the SUBTRACT* — visible, explicit, and impossible to
change by accident. Reordering is rewiring, and rewiring is the thing the operator can see.

**Today's denture is a small DAG**, and this is the default that must reproduce it byte for byte:

```
R1    = Parallel cast(back→tissue, 45°)            # NOT back→top: the top term is negative
R1b   = Parallel cast(back→tissue, steep°)         # empty when steep is off
SIGHT = Sight cast(Intersection(rim plane, symmetry plane, Obb back face))
MAP   = Depth cast(teeth axis, tissue side, pitch) # a DEPTH MAP, not a mask
HOLES = Holes(MAP, min area mm2)                   # map -> faces
BAND  = Band(seeds = HOLES faces, 5 mm)            # seeds are faces OR a curve's vertices

no_support     = UNION(R1, R1b)
allowed_cavity = SIGHT                            # a wire, not a position
allowed        = UNION(SIGHT, BAND)
rim            = Rim curve(...)                   # a CURVE, not a mask: the rim-line stream reads it
hole_band      = BAND                             # placement samples this RAW, not through `allowed`
rim_band       = Band(rim line, rim band mm)      # built at ruled_tips.rs:126-143
low_rim_band   = Band(rim line, low band mm)
sockets        = SUBTRACT(Basin fill(...), allowed)   # the cancel, made explicit
```

and the steep ray's own share, which now has its own layer, is `SUBTRACT(R1b, R1)` — a derived
readout, not a third zone.

**Why this is "maximum organized freedom" rather than a free-for-all:** the verb set is closed
(four combines), every source is measured in the canonical frame so results stay
import-independent, every node's output can be drawn as a layer with a face count, and the default
graph reproduces today exactly. Freedom is in the wiring; the vocabulary stays small enough to
reason about.

**What the engine must carry** is therefore a small expression graph, not a list: nodes with ids,
each an op plus its inputs, and the output bindings. It joins the cache key as a whole — a different
graph is a different result, which is the same rule as a different profile.

### Free editing — add and remove any node, like Blender

The owner: *"not only reordering, user can add or remove nodes freely, just like Blender."* That is
the model. A dev adds a second forbidding ray, deletes the hole band, wires a new compound — nothing
is fixed but the four things below, and each is a consequence of the engine, not a UI preference.

**1. The REQUIRED OUTPUTS are named, and there are EIGHT.**

> **SUPERSEDED 2026-11-23 by plan D1 (docs/WORKBENCH-TABS-PLAN.md section 9):** `allowed`, `no_support` and
> `allowed_cavity` are now ONE output, `zone`, stacked from Mark support / Mark no-support nodes. The engine derives
> the three masks below from it, so what placement reads is unchanged; the graph has six outputs. A graph saved with
> the three old ones still runs in the engine and is upgraded into a stack by the editor. The rest of this section
> is the reasoning that led there and stays as written.

> **What a required output is, in one line:** a name the engine reads. Placement never looks at your
> graph - it asks for a mask *by name*, the way a render only ever looks at Blender's Material Output
> however much is wired behind it. Your graph may contain any nodes in any arrangement, and it must
> end by filling these eight names, because these are the only things anything downstream reads.

Placement reads
`allowed`, `no_support` and `allowed_cavity` — and also `hole_band` (`ruled_tips.rs:452, 573`),
`rim_band` (`:444, 578`), `low_rim_band` (`:193`), the socket mask (`:468`) and **`rim` itself — a
curve, not a mask** (`:534-568`, the rim-line stream's source) — **directly, not through
`allowed`**. Eight required outputs, not three. Leave those unfilled and rewiring BAND changes `allowed` while the hole stream
still samples the raw band: the graph would then misreport what the rewire did, which is worse than
refusing it. A graph that leaves any required output unfilled is **refused**, naming which. It must never fall
back to a default — a graph that silently reverted to today's behaviour would be the exact failure
this whole effort is about.

**2. One hidden edge must be made visible or it becomes a cycle.** The socket cancel reads the
FINAL `allowed` (`ruled_tips.rs:113-115`, `sockets.rs:107-112`). So wiring Basin fill into `allowed`
would create a cycle that today's code hides by ordering. Expose the raw basins
(`sockets.rs:122`) and make the cancel an explicit `SUBTRACT(basins, allowed)` bound to a `sockets`
output — then the cycle is a cycle the validator can refuse, instead of an ordering nobody can see.

**2. Typed sockets make bad wiring impossible, not merely detectable.** There are few types: **mask**,
**depth map**, **Frame**, **Plane**, **Position**, **Direction**, **curve** (renamed `rim` on 2026-11-22, see
ORIENT-NODES section 10 build step 3; an ON-MESH polyline, since band
seeds are mesh vertices). **Band takes seeds: faces OR a curve's vertices** - the hole band seeds from
faces, the rim bands from the rim curve. A Depth cast returns a map, which only Holes and Basin fill
accept, so it cannot feed a combine; a
Sight cast takes a Position, not a Plane. Blender's lesson is that the connection you cannot make is
worth more than the error you would have read afterwards.

**3. Every graph is validated before a run, never during one.** A cycle, a dangling input, an unbound
a required output with nothing feeding it: refused with the node named, before any engine time is spent. This is the rule typelab
already follows — refuse before the minutes, not after them.

**4. Cost is visible and capped, because adding a node is not free in rays.** Each Parallel cast is up
to **1.5 million rays** (`denture/no_support.rs:18`), once per model per graph. So: a node that
reaches no required output is **not evaluated** and is drawn as not reaching one; the ray count and effective
pitch of every cast are shown on its node; and the number of casts is capped with the cap stated
rather than silently coarsening, which is today's behaviour and is itself a finding.

**Deleting a node that something reads is the interesting case.** Remove the Sight cast and
`allowed_cavity` has no source: the editor says which rule depends on it (`rimRespectsNoSupport`)
and refuses, rather than leaving a rule reading an empty mask and reporting a clean run.

**But refusal is the wrong tool for three hazards, and they are all VALID graphs**, so validation
never fires on them:

1. **An empty `no_support` reads as permission.** Low and island admission tests `!no_support`
   (`ruled_tips.rs:191`), so deleting every forbidding cast admits low points over the whole model,
   undefined faces included.
2. **An empty `allowed` does not stop tips.** The rim, rim-band and hole streams ignore it by design
   (`ruled_tips.rs:572-581`), so emptying it still yields those tips.
3. **Absence that depends on the scan.** A perfectly good graph can find no rim, no rim plane or no
   holes on one case. Today those are silent fallbacks (`oral_cavity_ray.rs:55, 59, 67`;
   `ruled_tips.rs:128, 137`; `holes_axis.rs:189-190`), which the default graph must KEEP to stay
   byte-identical — and which a free graph must surface as **"cannot tell", with the case flagged**.

So the rule is not refusal alone: **a required output filled by a zero-face mask warns with its count**, and a
node that could not decide says so per case. "Validate before the run" covers structure; it cannot
cover a graph that is structurally fine and empty in fact.

**And the cost cap is incomplete.** It covers Parallel casts. A **Sight cast is four rays per face
with up to 64 steps** (`zones.rs:24-28, 43`), which on a dense scan can exceed the 1.5M figure and is
**not capped at all**. The per-cast coarsening (`no_support.rs:38`) must stay in the default for byte
identity, so the cap work is: state it, show it, and extend it to sight.

### The honest caveat, written down rather than left

**There is no single final zone today.** Six consumers re-derive precedence from the raw masks, and
**two of them contradict each other** - verified:

- `denture/model_landing.rs:47` treats an allowed-and-no-support face as **allowed**, and its comment
  says "as everywhere in the denture rules";
- `denture/tilt.rs:210` counts a tip on that same face as **unwanted**.

They also disagree about undefined faces: a low point is admitted there in mode 1, an area tip is
denied. **An ordered program does not fix this** - it makes it visible. The end state is one verdict
per face with per-stream bindings, which touches placement and is scoped separately.

---

## 4. CAN IT REBUILD THE ALIGNER? — the honest answer

**Not with the stage 2 vocabulary alone, and this is the plan's weakest point.** The aligner is a
different chain: orient by trim (plane, U ends, back, closed side, cross-check), then contours, face
cut, strip, policy, tilt. **No casts, no depth maps, no mask combines.** Its only live per-call
channel is three tuning values - position, width, density - and its policy and tilt scan take no rules
at all.

So the vocabulary is shared at the **Reference** level (Frame, Box, Planes, Position, Direction are
the same nodes) and diverges at stage 2. To rebuild the aligner, four node types are needed that the
denture does not use:

- **Sharp chain** — the trim edges that define the U.
- **Connector route** — how the contour crosses a gap.
- **Strip** — the band along the contour where tips may stand.
- **Tilt rule** — its own pose scoring.

And one prerequisite: **`register_profile`**, because ~35 aligner thresholds are profile fields with
no rules channel.

**So the acceptance test splits in two, and the aligner half must be stated honestly rather than
implied:**

- **Denture:** rebuilt from the default graph through the new evaluator. A real reconstruction.
- **Aligner:** a **locked chain of nodes mapped one-to-one onto the existing units**, with values
  supplied through `register_profile`. It passes the gate because **the same code runs** — that is
  the claim, and it is weaker than the denture's. Calling it anything more would be a claim the
  engine does not support.

Even the Reference level is shared only as concepts: **no aligner module uses `Canon` or `Obb`**, its
frame is built with "no mass, no centroid" (`dental/trim/mod.rs:14`), its strip is a signed
centroid-walk distance field rather than an edge-grown band, and its opening is a two-resolution
raster. Free aligner zones could only ever PRUNE, because its tips are sampled along the contour
rather than selected from a mask.

Node types it needs that the denture does not: **Trim frame, Opening, Face cut, Strip (a threshold on
a signed field), Contour sampler**. Five, not four. Anyone who says otherwise has not read
`dental/trim/mod.rs`.

---

## 5. WHAT MUST NEVER BE A NODE

- **Tip placement order** — the `Spacer` claims space in stream order, so moving a stream changes
  which tips exist. (Zone order is safe; this is not. They are different stages.)
- **The import-frame box, or any face named by index.**
- **Tolerances and wire constants** — weld, epsilons, strides, colours.
- **A category** — a category is code, a type is data. No JSON field supplies an algorithm.

---

## 5b. WHAT EXISTS NOW (2026-11-20)

The editor is built and in the folder review (`typelab/viewer.html`), under the 3D
view, as **three stage tabs**:

- **1 Orient** - the orientation steps and the **print-angle search** node: start 0° (upright, teeth
  end down), end 45°, step 2°, tie margin 2°, and what the case picked, with a figure of the plate and
  the lean. Read-only: these are profile fields, so they wait for `register_profile`.
- **2 Zones** - a **React Flow canvas** (`nodeEditor/ZoneEditor.tsx`, built into
  `built/node-editor.js` by `npm run review:editor`): drag nodes, draw a wire socket to socket,
  delete with Backspace or Delete, pan, zoom, minimap. The eight outputs the engine reads are ONE
  **Zone output** node with a socket each, like Blender's Material Output. Every rule lives in
  `nodeGraph.mjs` (pure, tested); the canvas only maps gestures onto it, and its connection check asks
  the model's socket types, so a wrong wire cannot be drawn.
- **Plain words everywhere** (owner, 2026-11-20: "what is tissue, what is band, what is basin fill").
  Each node shows a plain title and one sentence (`KIND_WORDS`: "Parallel rays", "Grow a strip" (was "Strip around"),
  "Find sockets"); every setting has a label and help (`PARAM_WORDS`); anything that is not a number
  is a **dropdown** of the values the engine accepts, with each direction explained ("tissue side -
  the side that rests on the gums"); each output socket says what the engine does with it
  (`OUTPUT_WORDS`: "Allowed area - the ONLY faces where area tips may stand"). The engine keys stay
  as the stored values, so nobody has to know them. `nodeGraph.test.ts` fails if a node, setting or
  output ships without its words, or a text setting ships without a dropdown.
- **3 Support settings** - the thirteen typelab rules (`typelab/rules.mjs`), each on the node that reads it, with a plain label and unit.

The old typelab panel is folded in: its rule list is hidden (it still holds the values), and
**Apply and run again** sits beside the stage tabs.

**An edited graph RUNS (engine 69).** Apply sends the canvas to `serve.mjs`, which writes
`zone-graph.json` into the new folder and passes `--zone-graph` to the batch; the engine validates it
at `set_zone_graph`, refuses a bad one with the problem named (exit 2, nothing written), and the
graph's digest joins the analysis cache key and `summary.json` (`zoneGraph`). The status line says
two facts every time: what the canvas holds, and which graph made the review on screen. The
no-support layer names the edited graph's digest instead of "45° rays", because the rays are
whatever was wired.

Measured on case-001, 2026-11-20: adding one front-to-tissue 30° parallel cast unioned into
No-support moved **514,225 undefined faces to 490,958**.

**What v1 refuses, by name, at set** - every edit the engine would otherwise accept and IGNORE.
Fable checked each on-screen sentence against the engine on 2026-11-20 and found seven that ran
"clean" and changed nothing; each is now refused by the engine (`zone_graph.rs` `fixed_params`,
`FIXED_OUTPUTS`) and drawn as **fixed** on the canvas, never as a field:

- rewiring **Hole strip**, Rim line, Rim strip, Low rim strip or Sockets - placement reads the
  engine's own masks for these, not the graph's;
- **ray spacing** on a parallel cast (0.1 mm), every **Depth map** setting, the **smallest hole**
  (0.5 mm²), the cavity origin's **planes and side**;
- a **Grow a strip** (was "Strip around") of any width but 5 mm, or seeded by anything but Find holes;
- Point on a plane, and Find sockets (its depth comes from the rule "socket depth").

Free: parallel casts (direction and angle), rays from the planes' crossing, and Either / Remove /
Both / Invert into **No-support**, **Allowed** and **Seen by the cavity rays**. The model's `FIXED`
mirrors the engine's list, and both sides have a test that fails when an ignored edit is accepted.

## 6. ORDER OF WORK

1. **Show the composition that already exists.** R1b has its own layer now; the rest of the default
   graph should be visible before any of it becomes editable. **This is NOT free of engine work**:
   the sight-alone mask has no getter (`geometry-wasm/src/denture.rs:282-294`), and
   `allowed − hole_band` is not the same thing, so either one getter is added or four of the five
   nodes are shown and the fifth is marked as not exposed.
2. **Content-digest cache keys** — done, both of them.
3. **`register_profile` + schema** — schema is done, both sides; registration is not. The full plan, and why it is the bridge from the workbench to the app rather than something the workbench replaces, is `docs/TYPE-PIPELINE.md`.
4. **The zone graph** - DONE for v1 (engine 69, see 5b for what it still refuses): `Analysis::of` takes it, the graph joins the cache key, and the review returns
   each node's mask and count. It must carry: **the channel decision** (five entry points, the tilt
   scan and the live tilt among them), **all eight required outputs plus the explicit socket edge**, **NOT**,
   and the vendor and wasm rebuild. Default = the graph above, proved by `gate:real` "No differences".
5. **Promote the ~38 policy constants**, one unit at a time, at today's values.
6. **The aligner's own stage 2 vocabulary**, once 3 and 4 have proved themselves on the denture.

**Cap the row count**: each added cast costs up to 1.5 million rays, once per model per program.
