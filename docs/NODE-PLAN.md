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

In plain words: **the denture is printed standing on the plate, teeth end down. The engine then leans
it over, trying every angle from 0° (bolt upright) to 45° in 2° steps, and keeps the lean that needs
the least supported area** - rejecting any lean where a tip's neck hits the model (Crossing) or a
pillar is too thin for its height (Slender).

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

**And a defect sits inside it**, from that same header: *"the Cup and Gap rules never fail: every
prominent lowest point gets a tip."* Only `Crossing` and `Slender` are ever written
(`tilt.rs:220, 224`), while `passes()` reports "every rule passed" over all four. The justification is
also false in its own engine - `lows_unreached` exists precisely because a prominent lowest point can
fail to get a tip. A lean is called robust on half its criteria, and it reads identically either way.

**Stage 1 is locked on purpose.** Its numbers are calibration: clinical, but editing one voids the
type's validation record. It is shown, not offered. That is the third class from *WHO OWNS A NUMBER*.

---

## 2. THE REFERENCE VOCABULARY — the owner's location nodes, made safe

This is the part the owner specified, with one correction that the source forces.

### Frames and boxes

- **Frame** (`denture/canon.rs:25`) — `up`, `teeth`, `across`, and an origin. Every other reference is
  built on it. Its directions have NAMES: back, front, top, tissue, and the two across.
- **Tight box** — the part's extent **in the Frame**. This is the owner's "oriented bounding box", and
  it is the one to offer: it is fixed to the canonical frame, so the same scan imported differently
  gives the same answer (`denture/no_support.rs`, which says exactly that).
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
- **Rim centre plane** — the owner's term; it is the rim plane, whose point is the rim's own centre.

### Position — a point on a plane, by percentage

**Position** = a plane + **x and y as percentages of the part's extent along the two frame axes in
that plane**. 50/50 is the centre; 0 and 100 are the edges. That is the owner's "intuitively set
centre or close to each of the 4 edges", and percentages of the **frame extent** are what make it
import-independent rather than scan-size-dependent.

**Intersection** is also a Position: two planes and a box face, which is what the oral cavity ray's
origin actually is today (`oral_cavity_ray.rs:1-6`). It stays the DEFAULT for R2, because it is the
arithmetic the engine already does; the percentage form is the free version beside it.

> An earlier draft of mine claimed a percentage offset would break an invariant by sliding the origin
> off the symmetry plane. That was wrong: nothing else consumes the symmetry plane
> (`denture/symmetry_plane.rs`, `ruled_tips.rs:149-150`), and on an asymmetric partial the centroid is
> off the midline anyway, so an across-offset is a legitimate knob.

### Direction — the owner's "degree of rotation"

**Direction** = two named frame axes and an angle between them. That is literally the engine's own
arithmetic: `no_support_dir_at` is `normalize(back·cosθ + top·(−sinθ))`, with `R1_DEG = 45`
(`oral_cavity_ray.rs:43`). So "from back toward top, 45°" reproduces R1 exactly, and no gizmo, no
Euler angles and no world-space vector ever appear in the UI.

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

### Sources — each produces a face mask

| Source | Inputs | Engine unit |
|---|---|---|
| **Parallel cast** | Frame, from-axis, toward-axis, θ, pitch, ray cap | `denture/no_support.rs:21` |
| **Sight cast** | a Position | `denture/zones.rs:19` |
| **Band** | a curve or faces, distance along the surface (mm) | `denture/rim_graph.rs:112` |
| **Basin fill** | Frame, side, min depth | `denture/sockets.rs:100` |
| **Depth cast** | Frame, side, pitch | `denture/holes_axis.rs:83` |

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
- **Combine nodes** take two or more masks and produce one: **UNION**, **SUBTRACT**, **INTERSECT**.
  Their output is a mask like any other, so combines feed combines to any depth.
- **Output bindings** name the masks the engine's consumers read: `allowed`, `no_support`,
  `allowed_cavity`. Any node's output may be bound to any of them.

**Order is expressed by structure, not by position.** Subtraction does not commute, and in a graph
that shows as *which input feeds which side of the SUBTRACT* — visible, explicit, and impossible to
change by accident. Reordering is rewiring, and rewiring is the thing the operator can see.

**Today's denture is a small DAG**, and this is the default that must reproduce it byte for byte:

```
R1   = Parallel cast(back→top, 45°)
R1b  = Parallel cast(back→top, steep°)            # empty when steep is off
SIGHT= Sight cast(Intersection(rim plane, symmetry plane, back face))
BAND = Band(hole outlines, 5 mm)

no_support     = UNION(R1, R1b)
allowed_cavity = SIGHT                            # a wire, not a position
allowed        = UNION(SIGHT, BAND)
```

and the steep ray's own share, which now has its own layer, is `SUBTRACT(R1b, R1)` — a derived
readout, not a third zone.

**Why this is "maximum organized freedom" rather than a free-for-all:** the verb set is closed
(three combines), every source is measured in the canonical frame so results stay
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

**1. The sinks are named and required.** Six places in the engine read `allowed` and `no_support`
(and `rimRespectsNoSupport` reads `allowed_cavity`). Those names are the contract. Everything
upstream is free; a graph that leaves one unbound is **refused**, naming which. It must never fall
back to a default — a graph that silently reverted to today's behaviour would be the exact failure
this whole effort is about.

**2. Typed sockets make bad wiring impossible, not merely detectable.** There are few types: **mask**,
**Frame**, **Plane**, **Position**, **Direction**, **curve**. A Band takes a curve, not a mask; a
Sight cast takes a Position, not a Plane. Blender's lesson is that the connection you cannot make is
worth more than the error you would have read afterwards.

**3. Every graph is validated before a run, never during one.** A cycle, a dangling input, an unbound
sink: refused with the node named, before any engine time is spent. This is the rule benchwork
already follows — refuse before the minutes, not after them.

**4. Cost is visible and capped, because adding a node is not free in rays.** Each Parallel cast is up
to **1.5 million rays** (`denture/no_support.rs:18`), once per model per graph. So: a node that
reaches no sink is **not evaluated** and is drawn as not reaching one; the ray count and effective
pitch of every cast are shown on its node; and the number of casts is capped with the cap stated
rather than silently coarsening, which is today's behaviour and is itself a finding.

**Deleting a node that something reads is the interesting case.** Remove the Sight cast and
`allowed_cavity` has no source: the editor says which rule depends on it (`rimRespectsNoSupport`)
and refuses, rather than leaving a rule reading an empty mask and reporting a clean run.

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

**So the acceptance test splits in two:** the denture can be rebuilt from the stage 2 program as
described; the aligner needs its own stage 2 vocabulary before the same claim can be made. Anyone who
says otherwise has not read `dental/trim/mod.rs`.

---

## 5. WHAT MUST NEVER BE A NODE

- **Tip placement order** — the `Spacer` claims space in stream order, so moving a stream changes
  which tips exist. (Zone order is safe; this is not. They are different stages.)
- **The import-frame box, or any face named by index.**
- **Tolerances and wire constants** — weld, epsilons, strides, colours.
- **A category** — a category is code, a type is data. No JSON field supplies an algorithm.

---

## 6. ORDER OF WORK

1. **Show the composition that already exists.** R1b has its own layer now; the remaining rows of the
   default program should be visible as rows before any of them become editable. No engine change.
2. **Content-digest cache keys** — done, both of them.
3. **`register_profile` + schema** — schema is done, both sides; registration is not.
4. **The zone program**: `Analysis::of` takes it, the program joins the cache key, one JSON channel,
   and the review returns each row's mask and count. Default = the five rows above, proved by
   `gate:real` "No differences".
5. **Promote the ~38 policy constants**, one unit at a time, at today's values.
6. **The aligner's own stage 2 vocabulary**, once 3 and 4 have proved themselves on the denture.

**Cap the row count**: each added cast costs up to 1.5 million rays, once per model per program.
