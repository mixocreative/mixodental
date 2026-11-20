# Orient as nodes - the owner's idea of 2026-11-20, read, judged and planned

**Status: everything on this page is PLANNED unless a line says "exists".** Nothing here was built or
run. Engine facts were opened in source on 2026-11-20 (geocore engine 70; paths starting `dental/`,
`denture/`, `surface/` or `supports/` are under `mixo-geocore/crates/geometry-core/src/`, with
`denture/` short for `dental/denture/`). Where I am guessing at the owner's meaning the line says
GUESS; where I did not trace something it says CANDIDATE.

Companion pages: `docs/NODE-PLAN.md` sections 1-2 (the three stages and the reference vocabulary this
page reuses word for word), `docs/TYPE-PIPELINE.md` (the type file, registration, parity P1).

---

## 0. What the owner is aiming for, in five lines

1. **Open the Orient box into small nodes that hand results to each other:** the front/back and
   top/bottom decision, a largest-flat-area finder, points, planes, directions, and "set as bottom".
2. **One shared set of reference nodes for Orient AND Zones,** so a ray can start from any point on any
   plane, face any other point, and be nudged up-down / left-right - free ray casting, no engine rebuild.
3. **Three frames with plain names:** the **Part frame** (the part's own sides; turns with the part),
   the **Start frame** (those same sides frozen where they stood before any tilt; stays with the
   scene), the **Plate frame** (how the part finally sits on the plate).
4. **An honest order:** Orient -> Zones -> Support settings -> Print angle. The angle is picked LAST,
   judged with the zones and supports already defined.
5. **The angle should be chosen on real support performance** - as far as build time allows; measure
   first whether the quick score and a full build agree. Throughout: today's denture and aligner must
   come out exactly as they do now from the default wiring.

---

## 1. What the owner means

Sections 1-5 answer the owner's first message (a-d). His later comments are answered in section 7
(shared nodes, the three frames), section 8 (tab order) and section 9 (what the angle is judged on).

### In plain words

Today stage 1 (Orient) is one sealed box: a scan goes in, an upright pose comes out, and the only
things you can touch are the print-angle search's start / end / step / margin. The owner wants the box
opened into a few small parts that hand their findings to each other:

```
 DETECTORS                 REFERENCES                      POSE
 "what is this shape?"  -> "named things on the part"  ->  "which way faces the plate"
 front/back + top side     frame, planes, points,          set as bottom (+ angle)
 largest flat base         directions                      = the START pose
                           (also usable in Zones)          -> Zones -> Supports -> Print angle
```

### a) to d), restated

**a) "The node that decides front or back with slices should be its own function and node, telling
the others the orientation."**
He remembers correctly that it is already a separate function. It is in fact TWO deciders in one file,
and "slices" is only one of them:

- **Front / back** comes from the arch FOOTPRINT, not slices: the open end of the U (the legs) is the
  back (`dental/arch_slices.rs` `arch_frame`, method step 2).
- **Top / bottom** (teeth side vs tissue side) comes from the SLICES: 11 cross-sections, each that
  looks like an "n" votes; the dome is the teeth side (`arch_slices.rs` `slice_vote`,
  `denture/up_decision.rs` `DENTURE_SLICES`).

Both are composed by `up_decision::decide` and applied in `orient_denture` (`denture/mod.rs:107`).
What is missing is not the function, it is the NODE: its result (a frame with named directions, plus
its confidence and votes) is not a visible, wirable thing. That is the request.

**b) "A node that finds the largest flat or near-flat area - one polygon or a group of neighbouring
polygons that add up to a large near-flat plane by total size, not polygon count. Its flat base and
its normal become outputs for others."**
Clear, and nothing like it exists (section 3, `flatRegion`). "Total size" = summed triangle AREA, so a
base scanned as 40,000 tiny triangles beats one big stray triangle. Outputs: the faces, a plane (centre
point + normal), the area.

**c) "Centre points, a point on a plane by XY percentage, the flat base's centre - every locational
thing defaults to its centre, maybe as a node. Then a ray cast or a set-as-bottom can look at them:
set a ray origin from a point on a plane, ask the ray to face another point, then turn it up-down or
left-right by an angle, 0 by default."**
Three requests in one sentence:

1. Every reference thing (box, plane, flat region) can be used as a POINT, and that point is its
   centre unless told otherwise. This is the existing Position node at 50 / 50 (`NODE-PLAN.md`
   section 2), extended to accept a wired plane.
2. A DIRECTION made by "from point A, look at point B". Already agreed as the second Direction form
   ("target Position - origin Position", `NODE-PLAN.md` section 2) but never built.
3. NEW: after looking at B, nudge the aim by two angles, up-down and left-right.

GUESS: "ray cast" here means a cast with a direction - today that is the parallel rays (stage 2). The
sight cast looks every way from a point and has no direction to aim, so only its ORIGIN can use this.

**d) "A set-as-bottom node: plug in the flat structure, use its normal plus an angle (default 0) as
the initial bottom."**
GUESS, fairly confident: "bottom" = the face that points at the build plate at the START of the
print-angle search - the pose the search leans away from - not a final, locked pose. "Initial" is his
word. So: flat region -> its normal, turned to face the plate -> optionally leaned by an angle -> that
is 0 degrees for the search.

### What is ambiguous

| Question | My reading | Confidence |
|---|---|---|
| Is "front/back from slices" the up decision? | Yes: `up_decision::decide`, which is footprint (front/back) + slices (top/bottom). | high |
| Is the flat base for dentures, aligners, or new categories? | Mainly NEW kinds. A denture has no flat base (it stands on its legs); an aligner's "flat" is its trim plane, already found another way (`dental/trim/plane.rs`). The node is still useful on both as a readout. | medium - question 1 |
| Is d) the plate-contact face? | It is the face TURNED TOWARD the plate. Supports and lift still go under it; it does not mean "printed flat on the plate with no supports". | medium - question 5 |
| "Up-down / left-right" relative to what? | Relative to the part's frame (top and across), never the screen or the file axes. | medium - decided, noted under section 6 |

---

## 2. Do I agree

**Yes, with one structural correction and three limits.** The owner's instinct is sound: stage 1 today
hides a real chain of separable decisions, and the reference vocabulary he already agreed for stage 2
is exactly what stage 1 should PRODUCE. The theory makes the Orient tab more logical, not just more
flexible.

### The correction: today one arrow does two jobs, and the idea only works once they are two

In the denture engine a single vector, `up0`, means two different things at once:

- **Anatomy:** it is the back-to-front axis of the arch. Stage 2 measures everything from it: "back"
  is literally `-up` (`denture/oral_cavity_ray.rs` `back_of`), and the zone analysis is built from
  `frame.up0` (`denture/tilt.rs:175`).
- **Pose:** it is the plate normal at tilt 0 (`denture/pose.rs` `plate_up`).

For a denture those happen to be the same line (it prints standing on its legs). The moment a
"set as bottom" node may choose a different bottom, they must be TWO outputs, or re-aiming the bottom
would silently redefine "back" and move every stage 2 ray. So the Orient graph has two named outputs:

- **`frame`** - anatomy: up / top / across with their names (back, front, top, tissue, across). Stage 2
  reads only this. **This is the owner's Part frame** ("object planes").
- **`pose`** - which direction faces away from the plate at search angle 0, and which way the search
  leans. The print-angle search reads only this. **This is what fixes the owner's Start frame**
  ("global planes"): the part's sides as they stand in this pose, before any tilt.

Default: `pose` is taken straight from `frame`, which is exactly today. The owner's later
object / global distinction (section 7) is this same split, arrived at from the other side - which is
good evidence it is the right one.

### What it buys

- **New kinds without an engine rebuild, at the orientation level.** "Largest flat base -> bottom" is
  a complete Orient recipe for any part that has a base. Today that needs new Rust.
- **One vocabulary, two stages.** A point or direction made in Orient can aim a stage 2 ray. Less to
  learn, and the review can draw every reference on the 3D view.
- **The decision becomes visible.** Votes, confidence, the chosen region and its area show on the node
  that made them, instead of in a facts panel far from the cause.

### What it costs, said plainly

- **Calibration risk.** `NODE-PLAN.md` section 1 says stage 1 is "locked on purpose": its numbers are
  clinical calibration and editing one voids the type's validation record. This idea unlocks the
  WIRING. That is acceptable only because a type file must be re-proved after any change (owner
  ruling 4 in `TYPE-PIPELINE.md`) - but it means an Orient edit always costs a full proof run.
- **It does not make a new CATEGORY.** Orientation is one of three stages. A splint still needs its own
  stage 2 and placement code. `NODE-PLAN.md` section 5 stands: a category is code.
- **Zone directions need the anatomy frame.** A part with no arch has no "back" or "tissue". For such a
  part the frame must come from somewhere else (the tight box plus the flat base), and its axis names
  are then only labels. Stage 2 for such parts is out of scope here.

### What must NOT become a node

- **The hard print checks.** Crossing and Slender per angle, the boxed-in count, the robust band and
  the pick order (`denture/tilt.rs` header). Set-as-bottom chooses where the search STARTS; it never
  switches a check off, and a chosen bottom that fails is reported as failed.
- **The safety engine** that judges built supports, and tip placement order (`NODE-PLAN.md` section 5).
- **The detectors' internal thresholds** (slice gap 2 mm, min clarity 0.25, end band 25% ...). They were
  measured on real scans. The node shows them; it does not offer them. The upright rule's profile
  fields stay where they are today, in the profile.
- **The import axes.** No node may output "file X/Y/Z" or a box face by index (`NODE-PLAN.md` section 2).
- **Refusal reasons.** "no-legs", "both-ends-split", "too-few-vertices" stay hard stops. A graph cannot
  wire around a detector that said "I cannot tell".

---

## 3. The node vocabulary - made in Orient, shared with Zones

Socket types. `position` and `mask` exist in `nodeGraph.mjs` `TYPES`; the rest are new:

| Type | What it carries |
|---|---|
| `frame` | origin + up / top / across (unit, right-handed), plus `decided` and `confidence`. Always the Part frame. |
| `direction` | one unit vector, stored in the part's own (mesh) coordinates |
| `position` | one point, mm (exists) |
| `plane` | a point + a unit normal + the extent of what it was fitted to (for percentages) |
| `mask` | one true/false per face (exists; a "face set" is a mask) |
| `pose` | `up` (faces away from the plate at search angle 0) + `lean` (the side that rises as the angle grows). It defines the Start frame. |

Every `direction`, `position` and `plane` also carries a **frame tag**, `space: part | start | plate`
(section 7). Everything in this section is `part` unless a line says otherwise. The tag is separate
from the `frame` VALUE type above: one is a thing you wire, the other says what a thing is attached to.

### Detectors

| Node | In | Out | Parameters (default) | Engine |
|---|---|---|---|---|
| **Arch shape** `archFrame` | - | `frame` (not yet signed) | profile `upright` fields, shown not edited | exists: `denture/upright.rs` `arch_frame` |
| **Front/back and top** `upDecision` | `frame` | `frame` (signed); readouts: votes, confidence, flipped | slices 11 (fixed) | exists: `denture/up_decision.rs` `decide` + the two flips in `denture/mod.rs:115-123` |
| **Trim frame** `trimFrame` (aligner) | - | `frame`, `plane` (trim) | profile thresholds, shown | exists: `dental/orient.rs` `propose_orientation`; ONE locked node, as `NODE-PLAN.md` section 4 already rules |
| **Largest flat area** `flatRegion` | optional `mask` (search only inside it) | `mask` (its faces), `plane` (area-weighted centroid + normal); readouts: area mm2, protrusion mm | tolerance 5 deg; min area 20 mm2; rank 1 (1 = largest, 2 = next ...) | **NEW** |
| **Box-and-base frame** `boxFrame` | `plane` | `frame` | - | **NEW**, small: up = the plane's normal turned inward, top = the tight box's long axis made square to it. For parts with no arch. |

**`flatRegion`, precisely.** Faces joined across shared edges into regions, each region scored by
summed triangle area, the largest returned.

- Adjacency and per-face area and normal already exist: `denture/area_regions.rs` `FaceFacts`. The
  flood fill there (`Regions::of`) is the pattern to copy; it joins by a given mask, this joins by angle.
- **The trap, named here so it is met before it is made:** if a face joins when it is within 5 degrees
  of its NEIGHBOUR, the region walks all the way round a cylinder, 5 degrees at a time, and a round
  part reports one enormous "flat" area. A face must be within the tolerance of the REGION's normal
  (seeded from the starting face, then the running area-weighted mean), not of the face next to it.
- Deterministic: seeds are tried largest face first, ties by lowest index; regions are ordered by area,
  ties by smallest face index. No hash-map iteration order anywhere.
- **Protrusion** = how far any vertex of the part pokes out past the plane on its outward side, mm.
  A flat floor at the bottom of a cavity is large and flat and is NOT a base: its protrusion is large.
  The node reports it; Set as bottom refuses over a limit (below).
- What exists that is NOT this: `dental/trim/plane.rs` and `denture/rim_plane.rs` fit a plane through
  given points; `dental/orient.rs` `least_variance_axis` is the whole part's flattest axis. None finds a region.

### References (one set, offered on both the Orient and the Zones canvas)

| Node | In | Out | Parameters (default) | Engine |
|---|---|---|---|---|
| **Named plane** `plane` | `frame` | `plane` | which: 6 box faces, 3 centre planes, rim, symmetry (`NODE-PLAN.md` section 2); attached to: part (default) / start - start is offered in Zones and later, never in Orient (section 7) | pieces exist: `denture/obb.rs`, `rim_plane.rs`, `symmetry_plane.rs`; **NEW** as a node |
| **Centre** `centre` | - | `position` | of: tight box / vertex centroid | exists: `Obb::centre`, `Canon::origin` |
| **Point on plane** `planePoint` | optional `plane`, `frame` | `position` | plane (rim) when nothing is wired; x 50%, y 50% | the kind exists in `nodeGraph.mjs` and is refused by the engine today (`zone_graph.rs`); evaluation is **NEW** |
| **Crossing** `intersection` | - | `position` | rim x symmetry x back face | exists: `oral_cavity_ray.rs` `origin` |
| **Axis direction** (a cast's own fields) | `frame` | `direction` | from, toward, degrees | exists: `zone_graph.rs` `axis()` + `no_support_dir_at` |
| **Look at** `lookAt` | `position` from, `position` to, `frame` | `direction` | up-down 0 deg, left-right 0 deg | **NEW** |
| **Normal of** `normalOf` | `plane` | `direction` | flip: no | **NEW**, one line |

**"Every locational thing defaults to its centre"** is met without a new node: `planePoint` at 50 / 50
IS the centre of whatever plane is wired into it, and a flat region's `plane` carries the region's own
extent, so 0-100% runs edge to edge of the REGION. `centre` covers the two things that are not planes.
On a tilted plane the percentages follow the rule already written in `NODE-PLAN.md` section 2 (frame
axes projected onto the plane, measured against the plane's own extent).

**`lookAt`, precisely.** `d = normalize(to - from)`. Then two turns, both measured against the PART
frame so the result never depends on how the scan was imported or how the view is orbited. The output's
frame tag is the most scene-bound of its two points (plate over start over part):

- `side = normalize(top x d)`; `lift = d x side` (the part of "top" square to the aim).
- **up-down** turns `d` toward `lift` (positive = toward the frame's top side);
  **left-right** turns `d` toward `side`. Up-down is applied first.
- Refused at run, with the node named, when `from` and `to` are the same point (under 0.01 mm). When
  the aim is parallel to `top`, `side` falls back to the frame's `across`.
- The sign is the trap `NODE-PLAN.md` already paid for twice (back -> top vs back -> tissue). The node's
  help text must say which way positive goes, and the Rust test must pin it with a worked number.

### Pose

| Node | In | Out | Parameters (default) | Engine |
|---|---|---|---|---|
| **Upright from frame** `uprightPose` | `frame` | `pose` | - | exists: this is today. `up = frame.up0`, `lean = frame.teeth` (`denture/pose.rs`) |
| **Set as bottom** `setBottom` | `plane` or `direction` (the bottom's outward normal), optional `direction` lean-toward, `frame` | `pose` | angle 0 deg; max protrusion 0.5 mm | **NEW** |
| **Print-angle search** (today's Orient card; moves to tab 4, section 8) | `pose` | the picked angle | start, end, step, margin - per type already | exists: `denture/tilt.rs`; reading a `pose` instead of the frame is **NEW** plumbing only |

**`setBottom`, precisely.** `up = -normal` (the base's outward normal points at the plate, so "up" is
its opposite). `lean` = the wired lean-toward direction, else the frame's `top`, made square to `up`.
Then the angle: `up` is turned toward `lean` by `angle` degrees and `lean` follows - the same rotation
`plate_up` does. Refused: a wired `plane` whose protrusion exceeds the limit (the part would be inside
the plate); a lean direction parallel to `up`; **any input tagged `start` or `plate`** - this node is
what CREATES the start pose, so it can only be told about the part (section 7).

**The start pose, pinned down.** The Start frame is captured at the `pose` this stage outputs: after
Set as bottom and its own angle, and BEFORE the search's start angle (`tiltStartDeg`). That is the
owner's "the original orientation as is, before adjusting start degree tilt". Trap in the names: the
Start frame is NOT the pose at the type's start angle; a type that starts its search at 10 degrees
still has its Start frame at 0.

**How it combines with the search.** The search is unchanged: it tries start, start + step ... end,
each angle leaning `up` toward `lean` (`plate_up(frame, tilt)` becomes `plate_up(pose, tilt)`), every
angle judged by the same hard rules. So:

- Set as bottom's **angle** moves where 0 is. With the default lean it overlaps with the type's
  **start** angle, and that is stated rather than hidden: angle 10 + start 0 scans the same poses as
  angle 0 + start 10. The angle earns its place only when the lean-toward input is wired to something
  the search does not lean along (a sideways roll).
- **"Use exactly this bottom"** needs no new switch: start 0, end 0. `check_pose`
  (`denture/profile.rs`) already accepts it and the scan then holds one pose - which is still judged,
  and may still fail.

### Orient outputs (one output node, like Zone output)

`frame` (required, type `frame`) and `pose` (required, type `pose`). The rim curve stays where it is: a
fixed stage 1 result that stage 2 reads (`rimCurve`, `fixed: true` in `nodeGraph.mjs`).

**The default denture Orient graph - today, node for node:**

```
ARCH  = Arch shape()                      # upright.rs arch_frame
UP    = Front/back and top(ARCH)          # up_decision.rs decide + the two flips
POSE  = Upright from frame(UP)            # pose.rs
frame = UP
pose  = POSE
```

**A flat-based part (the owner's b + d), for contrast:**

```
FLAT  = Largest flat area(5 deg, rank 1)
FR    = Box-and-base frame(FLAT.plane)
POSE  = Set as bottom(FLAT.plane, angle 0)
frame = FR
pose  = POSE
```

---

## 4. How it fits what exists

**The evaluator.** `denture/zone_graph.rs` already has everything structural: the JSON shape
(`{nodes: [{id, kind, params, inputs}], outputs}`), a `validate` that walks only the nodes an output
reaches and refuses by node name, cycle detection, a `set_override` that validates BEFORE it accepts,
and a digest. Its node results are all masks (`HashMap<String, Vec<bool>>`); Orient values are small
(vectors), so the Orient evaluator is a sibling module `denture/orient_graph.rs` with its own value
enum (frame / direction / position / plane / mask / pose), reusing `Node`, `Graph`, `num`, `text` and
`axis`. One graph shape, two evaluators. Do NOT widen the zone evaluator's map into an enum to share
it: that touches the proven stage 2 path for no gain, and the two run at different times (Orient once
per mesh; zones once per mesh and frame).

**References across stages.** The reference kinds are shared: the same node may be placed in either
graph, subject to the frame-tag table in section 7. To reuse a result instead of computing it twice,
stage 2 nodes read Orient results BY NAME (the Orient graph's node ids), never by a wire across tabs: the zone graph gets a `ref` node kind (`{kind: "ref", params: {node:
"FLAT"}}`) whose socket type is the Orient node's output type. That keeps two graphs with one visible
seam, and it is what lets a point made in Orient aim a stage 2 ray.

**The host model.** `nodeGraph.mjs` gains the new `TYPES`, the Orient `KINDS`, their groups and plain
words (its test already fails a kind without them), and an Orient `FIXED` list mirroring what the
engine refuses: nothing is drawn as a field that the engine would accept and ignore.

**The canvas.** Stage 1 becomes a canvas using the SAME React Flow component as Zones
(`nodeEditor/ZoneEditor.tsx`), fed the Orient kinds and an "Orient output" node with two sockets. The
print-angle search card keeps its fields exactly as proved today, but lives on tab 4 once the owner
rules on question 3 (section 8); until then it stays where it is. The 3D view draws each reference when its node is selected: a plane as a
quad, a point as a dot, a direction as an arrow, a flat region as a tinted face set.

**The type file.** `src/dentalTypes/typeFile.ts` gains an optional `orientGraph` beside `zoneGraph`.
Absent means the category's default graph, so every existing type file stays valid under schema 1 -
the same ruling as `tiltStartDeg`. One writer, sorted keys, exactly as the zone graph (the "one graph,
two digests" trap in `TYPE-PIPELINE.md` section 4a applies unchanged).

**Validation at set.** `set_orient_graph(json) -> digest`, validating first and keeping the previous
graph on refusal, as `set_zone_graph` does. It inherits the zone graph's known weakness: ONE global
slot (`TYPE-PIPELINE.md` AS BUILT box). Do not add a second global slot and stop there - the end state
is E3, where both graphs are registered WITH the profile and chosen by the type's id.

**The cache key - the part most likely to be got wrong.** `orientation_of`
(`denture/model_cache.rs:79`) caches by mesh + profile digest. An Orient graph changes the result
without changing either, so the graph's digest MUST join that key, and the analysis key beside it
(`key_of`). That file has two key builders and has already once had only one of them updated (its own
comment says so). The proof is a test: same mesh, two graphs, two different cached frames.

**Parity - the default graph is today, proved as P1 was.** Before anything is editable: every local
scan reviewed with no graph set and with the default graph set through `set_orient_graph`, whole
reviews compared, excluding only the digest and wall-clock fields. Dentures 6 of 6 must be IDENTICAL.
Then `gate:real` "No differences". Byte-identity is realistic here because the default graph calls the
same three functions in the same order; any difference is a wiring bug, not float noise.

**The aligner.** One locked `trimFrame` node plus its own pose (`dental/pose.rs` `target_frame`: tilt,
heading, roll), shown as a readout. A free aligner Orient graph is not planned (`NODE-PLAN.md` section 4).

---

## 5. Build order

Each unit is small enough to gate on its own. "Free" = can be built with no owner input. U1-U4 are
pure Rust: no wasm, no host, no scan needed.

| # | Unit | Where | Proof | Owner input |
|---|---|---|---|---|
| **U1** | `flat_regions(mesh, tolerance_deg, min_area) -> Vec<FlatRegion {faces, centroid, normal, area_mm2}>` + `protrusion_mm` | geocore, new `surface/flat_regions.rs` (not under `denture/`: it is not dental) | Rust: a cube gives 6 regions of equal area; a subdivided face is still ONE region with the same area (area, not count); a cylinder's side is NOT one region (the trap above); a rotated copy gives the same regions; a floor inside a cup reports its protrusion | free |
| **U2** | `look_at(from, to, frame, up_down, left_right)` and `set_bottom(normal, lean, angle) -> pose` | geocore, pure | Rust: 0 / 0 is exactly `normalize(to - from)`; +10 up-down raises the dot with `top` by a worked number; same-point and parallel cases refuse; `set_bottom` at angle 0 gives `up == -normal`, and fed the denture frame's own up and teeth it reproduces `plate_up` bit for bit | free |
| **U3** | The pose split: the tilt search and `pose.rs` read a `pose` (up, lean) instead of `ArchFrame`; the default is built from the frame | geocore | every existing Rust test unchanged and green; `gate:real` "No differences" once vendored | free (a refactor, no behaviour) |
| **U4** | `orient_graph.rs`: value enum with the frame tag (`part` / `start` / `plate`), `default_graph`, `evaluate`, `validate`, `set_orient_graph`, digest into BOTH cache keys; the same tag check added to `zone_graph.rs` `validate` | geocore | Rust: default graph == `orient_denture` on the test shells, field for field; each refusal by name, including a `start` input into Set as bottom and a `plate` input into a zone; two graphs give two cached frames | free |
| **U5** | wasm + host: `set_orient_graph`, per-node results in the review (points, planes, directions, region face sets), `--orient-graph` in the batch | geocore `geometry-wasm` and `host/`, then vendor | parity run: dentures 6 of 6 IDENTICAL with the default graph set; a bad graph exits 2 with the node named and writes nothing | free to build; **vendoring a new engine needs the owner's push approval**, as engine 70 did |
| **U6** | Orient canvas: kinds, words and the FIXED mirror in `nodeGraph.mjs`; the stage 1 tab as a canvas; 3D overlays; `orientGraph` in the type file | mixodental | `nodeGraph.test.ts` (words, groups, FIXED); a filtered walk of the review page; on a real scan, swap to "Largest flat area -> Set as bottom" and see the pose change and the region tinted | **needs ruling 1** (which kinds get it) and a look at the UI by the owner |
| **U7** | Zones use the shared references: the reference kinds on the Zones canvas, the `ref` node, `planePoint` evaluated, a `direction` input on Parallel rays; a start-attached reference accepted and read at the start pose | geocore + mixodental | a wired direction equal to back -> tissue 45 gives R1's mask exactly; a `planePoint` sight cast runs and its origin is drawn where the percentages say; the same ray wired once part-attached and once start-attached gives the SAME mask (section 7) | free, but after U6 is accepted; how start is shown **needs ruling 2** |
| **U8** | A first non-arch recipe end to end (flat base -> bottom -> search) on a real model the owner supplies | both | a review folder the owner looks at | **needs ruling 1 and a sample file** |
| **U9** | Tab "4 Print angle": the search fields, per-angle table, pick and confirm move out of Orient (section 8) | mixodental, UI only | a filtered walk; a zone edit visibly moves the pick on tab 4 | **needs ruling 3** |
| **M1** | Measure quick pick vs full-build pick on every denture scan (section 9) | a script, about 4.3 h unattended | the table of section 9's four answers | free to run; **the result needs ruling 4** |

Order: U1 and U2 in parallel, then U3, U4, U5, then stop for the owner before U6. U1-U4 change no
behaviour for any shipped type. U9 and M1 depend on nothing above and can go first.

Debt this plan does NOT take, written down: a per-type engine slot for the graphs (E3, already
planned); a free aligner Orient; flat regions on a smoothed copy (the node reads the scan's own
triangles, so a noisy scanned base may need a larger tolerance - to be measured in U8, not guessed
now); and the start- and plate-attached NODES themselves (level plane, toward the plate, the print
box) - the first build makes the tag and its refusals only, because no graph consumes them yet
(section 7).

---

## 6. Questions for the owner

1. **Which printed items is the flat base for, first?**
   Recommend: **a new kind with a real base (a model or a tray), with the denture and aligner keeping
   today's orientation unchanged.** A denture has no flat base and its upright rule is measured on your
   scans; rewiring it gains nothing and voids its proof. The new nodes still show on both as readouts.

2. **In the Zones tab, do you expect a "global" (Start-frame) ray to stay fixed to the scene while the
   search leans the part - a different zone at every angle?** This is the one place I think the
   expectation and the engine differ, so it is said plainly (section 7): zones are decided ONCE, with
   the part standing at its start pose, and there the Start frame and the Part frame are the same
   thing. A start-attached ray in Zones therefore gives exactly the mask its part-attached twin gives.
   Recommend: **no - zones stay decided once.** That is also your own order ("define all support
   areas, then pick the tilt"). In Zones the choice is shown as one list labelled "part (= start
   here)", not two that look different and are not. Zones re-cast at every angle are possible, not
   circular, and cost up to 23 times the rays; if you want them, that is a measured project of its own.

3. **Should the print-angle search leave the Orient tab and become its own last tab, "4 Print angle"?**
   Recommend: **yes** (section 8). The search is already computed after zones and support rules; only
   the tab order says otherwise. Orient keeps the frame, the references and "which face is the bottom".

4. **Should the print angle be chosen from full support builds instead of the quick score?**
   Recommend: **not yet - measure first, one overnight run** (section 9). A full build at every angle
   is about 43 minutes per case. If the measurement shows the quick pick is often not the best build,
   build "quick score for all angles, full build for the best 3" - about 4 minutes more per case.

5. **Does "set as bottom" mean "turn this face toward the plate, then support it as usual", or "print
   this face directly on the plate, no supports under it"?**
   Recommend: **turn it toward the plate, supports and lift as usual.** That reuses every safety check
   unchanged. Printing flat on the plate is a different mode (no lift, no tips under the base) and
   should be its own later switch, not an accident of this node.

Four things I decided without asking - say so if any is wrong:

- The Start frame is taken at angle 0 of the search, after Set as bottom and before the type's start
  angle, as you described. A type that starts at 10 degrees still has its Start frame at 0.
- A type keeps the print-angle search after Set as bottom; "use exactly this bottom" is start = end,
  so the chosen pose is still judged by the hard rules instead of being trusted.
- The look-at node's up-down / left-right angles are measured against the PART, never the screen (a
  screen angle changes when you orbit the view).
- The detectors' inner numbers are shown, not editable (they were measured on your scans).

---

## 7. One vocabulary for Orient AND Zones - and the three frames

Owner, 2026-11-20: *"those nodes can be used in zone tab because it helps freedom of ray casting, and
for planes, there's at least 2 types, the global one (all sides before auto tilt), or the oriented one
(tilted)."* Agreed. The point / plane / direction / flat-region nodes of section 3 are ONE set of node
kinds; `nodeGraph.mjs` lists each once with `stage: 'reference'` and both canvases offer it. A flat
region is directly useful in Zones as a mask (allow or forbid tips on the base), and `lookAt` is what
gives the rays their freedom.

> **THREE FRAMES, named by the owner's clarification (2026-11-20, "rename these things with better
> terms").** The owner: object planes are "the initial front back up down left right of the initial
> position before the object is tilted ... so it follows no matter how it moved"; global planes "do not
> follow ... stay as scene global ... simply take the original orientation as is before adjusting start
> degree tilt". Named for what each is attached to:
>
> | Name | Attached to | At the start pose | When the search leans the part | Was called |
> |---|---|---|---|---|
> | **Part frame** | the part itself: its own front, back, top, bottom, left, right, found once by Orient (tight box + initial orientation) | = Start frame | turns WITH the part | the owner's "object planes"; this doc's first "global" |
> | **Start frame** | the scene: the part's sides exactly where they stood at the start pose, frozen there | = Part frame | stays still | the owner's "global planes" |
> | **Plate frame** | the print plate as the part FINALLY sits on it: the picked angle plus anything the operator then does (the angle dial, a turn or move on the plate) | - | does not exist yet | this doc's first "oriented" |

**How the three relate - worth one careful read, because two of them are closer than the names
suggest.** There are really two things a reference can be glued to: the part, or the scene. The
Start frame and the Plate frame are BOTH glued to the scene; they differ in WHEN they are known:

- The **Start frame** is known the moment Orient finishes, and it has a value at every angle the
  search tries. While the search leans the part, the start frame's "toward the plate" IS toward the
  plate, at every candidate angle - the plate does not move, the part does.
- The **Plate frame** is known only after the pick, and it also follows whatever the operator does
  afterwards. The Start frame deliberately does not (the owner: it "does not take into account if the
  object itself is being rotated on the actual print plate").

So during the automatic search the Start frame is the plate's own axes, named by the part's sides as
they stood at the start. They part company only once a person moves the part on the plate.

**How the Start frame is computed - it already exists in the engine.** Seen from the part, a
scene-fixed direction turns backwards as the part leans. That is exactly `print_axes(frame, tilt)`
(`denture/pose.rs`): its rows are the start frame's across, front (`plate_up`) and top, expressed in
the part's coordinates at that tilt. So nothing new is computed; the Start frame is the `pose` output
of section 3 plus the candidate angle. It is captured at search angle 0 - after Set as bottom, before
the type's start angle (`tiltStartDeg`), as the owner said.

**What a Start-frame reference is FOR - a use the Part frame cannot serve.** Anything judged once per
candidate angle that must stay level with the scene while the part leans:

- "straight down to the plate" at each angle - what makes a face an overhang, where a pillar goes,
  where resin drains. This is how the search already works: each angle's `up` is the start frame's
  front axis (`denture/tilt.rs` `row_with`, `plate_up`);
- a level plane at a height ("no tips above 30 mm at any angle");
- a direction fixed in the machine, such as the side the film peels from.

A part-attached reference cannot say any of these: it leans with the part. What a Start-frame reference
does NOT do is change a zone as the part leans - see the table and question 2.

**Who may read which - the validator's table.** Every `direction`, `position` and `plane` socket
carries the tag `space: part | start | plate` (a `mask` is per face and has none). A node's output
takes the most scene-bound tag among its inputs (plate over start over part).

| Reader | `part` | `start` | `plate` | Why |
|---|---|---|---|---|
| **Orient graph** (it produces the start pose) | yes | **refused** | **refused** | It cannot be told about a pose it has not made yet. |
| **Zones graph** (decided once per model, at the start pose) | yes | yes - read AT the start pose, where it equals the Part frame | **refused** | A zone needs no angle; the angle is picked using the zones. |
| **Per-angle scoring and placement** (tab 3 and 4; engine code today, no graph yet) | yes | yes - re-expressed at each candidate angle | **refused** | The final placement is not known while angles are still being tried. |
| **After the pick** (pillar landing, export, readouts; no graph yet) | yes | yes | yes | Everything is known. |

**The Zones row, verified in source, not assumed:**

- The zone analysis is built ONCE per model, from the upright frame: `Prepared::of` calls
  `analysis_of(&tips, profile, frame.up0, steep_deg)` (`denture/tilt.rs:175`), before any angle is tried.
- The search then scores EVERY angle with those same zones: `row_with` calls
  `place_ruled_with(&self.tips, analysis, profile, &[], up, ...)` with only `up` changing
  (`denture/tilt.rs:186-192`).
- So a zone that read a **plate**-frame reference would need the picked angle, and the angle is picked
  using the zones: a circle. Refused.
- A zone that read a **start**-frame reference is not circular - but because zones are decided once,
  at the start pose, it is read there, where Start and Part coincide. **The same ray wired
  part-attached and start-attached gives the same mask.** The canvas must say so on the node ("= part
  frame here: zones are decided before any tilt"), or the two choices look different and are not -
  the "accepted and ignored" outcome this project refuses everywhere else. Re-casting zones at every
  angle would make the difference real; each cast is up to 1.5 million rays, paid 23 times at 0-44 by
  2, and the analysis cache is keyed without an angle. Not planned; question 2.

**Refused by TYPE, in three layers, one rule, a test on each.** The canvas refuses the connection (its
check already asks the model's socket types); `nodeGraph.mjs` `validate` names it; the engine's
`validate` refuses it at set, with the reason: *"SIGHT: origin is attached to the plate - a zone is
decided before the print angle, so it cannot depend on it"*, *"BOTTOM: normal is attached to the
start pose - Set as bottom is what creates that pose"*.

**What the first build makes.** Only the tag and these refusals. No graph consumes a start- or
plate-attached reference in a way that differs from a part-attached one yet (the per-angle and
after-pick rows are engine code), so the scene-attached nodes - toward the plate, a level plane, the
print box, and a conversion "as it stands on the plate" - wait for the first real consumer. Until
then the only place the owner can PICK "start" is the Named plane node in Zones, with the note above.

---

## 8. Why the print angle looks finished before the zones - and the fix

Owner: *"the auto tilt orientation should be selected accounting for all supports, so why can the auto
tilt tab be completed before support zones are set up?"*

He is right, and the engine agrees with him: it is the TAB ORDER that is wrong, not the computation.
The angle is never picked before the zones - `Prepared::of` builds the zones first and every angle is
scored with them (section 7) and with the support rules. Edit a zone or a rule and the pick can move.
`NODE-PLAN.md` section 1 already says the search "is a solver, not a stage" and belongs after stage 3;
the review page put its fields on the Orient card because that is where the profile numbers were.

The honest order, which the tabs should show:

```
1 Orient            ->  2 Zones          ->  3 Support settings  ->  4 Print angle
frame, rim, planes,     where tips may       tips, pillars,          try each angle with 2 + 3,
references, bottom      stand                rules                   judge, confirm, pick
(nothing here depends on the angle)                                  -> generate
```

**Recommendation: yes, a fourth tab "4 Print angle".** It holds start / end / step / margin (moved,
not changed - they stay the same profile fields in the type file), the table of every angle with its
score and which rule failed, the pick and why, and the confirm-build result. **Orient keeps**
everything that is true whatever the angle: the detectors, the Part frame, the rim, the references,
and the `pose` output - which face is the bottom at angle 0, which is the Start frame. That is also
the clean seam for sections 2 and 7: Orient makes the Part frame and the Start frame, tabs 2 and 3
are written against them, and tab 4 is where the Plate frame comes into being.

Cost: UI only, no engine change. Pages to update in the same commit when built: `NODE-PLAN.md` 5b,
`TYPE-PIPELINE.md` section 5, `REVIEWER-UI.md`.

---

## 9. Is the print angle really chosen on "all support performance"? Not quite - the real picture

Owner: *"suppose we define all support areas, and supports generated, and auto tilt picked from the
best tilt?"* and *"the tilt is based on all support performance? i don't know, fable should think
about it in reality."* The first sentence is option A or B below: it is the right goal, and the only
question is how many angles can afford a real build.

**What happens today (as read).** For each angle the engine does a QUICK version of the support work,
not a full build (`denture/tilt.rs` header and `row_with`):

- it really places the tips, by the type's rules and zones, at that angle - the zones fixed to the
  part (decided once), "down" taken from the Start frame at that angle (section 7);
- it fails the angle if too many tip necks run into the model (Crossing) or a pillar would be too
  thin for its height (Slender);
- within the survivors it prefers: fewest lowest points no support can reach (boxed in), fewest lowest
  points outside the allowed area, smallest overhang area, lowest print height, lower angle.

Then the host does a real build to CONFIRM: the pick, and at most two more in pick order, stopping at
the first that holds - not blocked, no island left unserved, no rim gap (`src/dental/confirmTilt.ts`
`confirmPick`, `CONFIRM_RETRIES = 2`). CANDIDATE: that confirm is typed for the aligner
(`two-contour`), and `scripts/dental-region-review/build.ts` `pickPrintAngle` is the aligner review; I
did not trace whether the denture path confirms at all. Worth settling before anything is built on it.

So: tips, yes, every angle. Pillars, routing, braces and the safety verdict, only at the confirmed
angle. And the confirm is a pass/fail gate that stops early - it never asks whether the second-best
angle would have BUILT better than a first one that merely passed.

**What a full build knows that the quick score does not:** tips left out because no pillar could be
routed; islands left unserved; pillars forced to land on the model instead of the plate; real
crossings after the neck is routed round the model (the quick test is a straight-neck guess, and its
own comment says it is not the build's check); braces and trees; support volume and pillar count; the
safety verdict.

**The three options, with numbers.** 23 angles (0-44 by 2); a full build is about 111 s per angle
(measured 2026-11-20 on one case, by the coordinator); the quick scan is seconds.

| Option | Cost per case | Verdict |
|---|---|---|
| A. Full build at every angle | 23 x 111 s = about 43 min; six dentures = about 4.3 h per gate run | No. It makes the workbench loop and `gate:real` unusable. |
| B. Coarse to fine: quick score all, full-build the best N, re-rank by build results | N = 3: about 5.5 min, of which one build is needed anyway, so about +3.7 min. N = 5: about 9 min | The right shape IF the quick pick is often wrong. |
| C. Today: quick pick, confirm until one holds | 1 build usually, 3 at worst | Right if the quick pick is usually the best build. |

For B, two details matter. The N candidates must be DIFFERENT poses (8, 10 and 12 degrees build nearly
the same): take the best of each separate dip in the score, at least 2 steps apart, from the robust
tier only. And the re-rank order must be safety first: blocked, then tips left out, then islands
unserved, then pillars on the model, then support volume, then height.

**Recommendation: do not build B on a belief. Measure once (M1), then decide by a written rule.**

M1, one overnight run, no engine change: for each local denture scan (the 6 used by P1, 3 of them in
`dentalwork/fixtures/case-denture`), full-build EVERY angle and record per angle: verdict, tips left
out, islands unserved, pillars on the model, support volume, pillar count, build seconds. About 4.3 h.
It answers:

1. On how many of 6 is the quick pick also the best full build?
2. When it is not, where does the best build sit in the quick order (2nd? 9th?) - that sets N.
3. How much better is it - one fewer left-out tip, or 2% less resin?
4. Which recorded number explains the miss?

Decision rule, proposed: quick pick is best (or within one left-out tip and 5% volume) on 5 of 6 or
more -> keep C, only show the confirm on tab 4. Best build is inside the quick top 3 -> build B with
N = 3, in the workbench proof run first, the app later as a background "a better angle exists" offer
(a 4-minute wait is fine for proving a type, poor for an operator). Best build is outside the top 3 ->
do not buy builds; add the number from answer 4 to the quick score, which is cheaper every run.
