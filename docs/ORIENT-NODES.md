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
3. **Two frames with plain names:** the **object frame** (the part's own sides, decided once before
   any tilt; goes with the part wherever it leans) and the **global frame** (the scene's fixed
   directions - down is toward the plate - whatever the tilt). All zone rays are cast in the object
   frame, once; a tilt never recasts them.
4. **An honest order:** Orient -> Zones -> Support settings -> Print angle. The angle is picked LAST,
   judged with the zones and supports already defined.
5. **The angle should be chosen on real support performance** - as far as build time allows; measure
   first whether the quick score and a full build agree. Throughout: today's denture and aligner must
   come out exactly as they do now from the default wiring.

---

## 1. What the owner means

Sections 1-5 answer the owner's first message (a-d). His later comments are answered in section 7
(shared nodes, the two frames), section 8 (tab order) and section 9 (what the angle is judged on).

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
| Is d) the plate-contact face? | It is the face TURNED TOWARD the plate. Supports and lift still go under it; it does not mean "printed flat on the plate with no supports". | medium - question 4 |
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
  reads only this. **This is the owner's object frame.**
- **`pose`** - which direction faces away from the plate at search angle 0, and which way the search
  leans. The print-angle search reads only this. **This is the bridge to the owner's global frame:**
  it says how the part stands on the plate at tilt 0.

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
| `frame` | origin + up / top / across (unit, right-handed), plus `decided` and `confidence`. Always the object frame. |
| `direction` | one unit vector, stored in the part's own (mesh) coordinates |
| `position` | one point, mm (exists) |
| `plane` | a point + a unit normal + the extent of what it was fitted to (for percentages) |
| `mask` | one true/false per face (exists; a "face set" is a mask) |
| `pose` | `up` (faces away from the plate at search angle 0) + `lean` (the side that rises as the angle grows). It says how the object frame sits in the global frame at tilt 0. |

Every `direction`, `position` and `plane` also carries a **frame tag**, `space: object | global`
(section 7). Everything in this section is `object`. The tag is separate from the `frame` VALUE type
above: one is a thing you wire, the other says what a thing is attached to.

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
| **Named plane** `plane` | `frame` | `plane` | which: 6 box faces, 3 centre planes, rim, symmetry (`NODE-PLAN.md` section 2) | pieces exist: `denture/obb.rs`, `rim_plane.rs`, `symmetry_plane.rs`; **NEW** as a node |
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

**`lookAt`, precisely.** `d = normalize(to - from)`. Then two turns, both measured against the OBJECT
frame so the result never depends on how the scan was imported or how the view is orbited. Both points
are object references here, so the result is one too (a global point would make it global, section 7):

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
the plate); a lean direction parallel to `up`; **any `global` input** - this node decides where tilt
0 is, so it can only be told about the part (section 7).

**Tilt 0, pinned down.** Tilt 0 is the `pose` this stage outputs: after Set as bottom and its own
angle, and BEFORE the search's start angle (`tiltStartDeg`). The start angle is not part of Orient at
all: it is only the first lean the search tries. A type that starts its search at 10 degrees has the
same object frame, the same zones and the same tilt 0 as one that starts at 0.

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
fixed stage 1 result that stage 2 reads (kind `rim`, socket `rim`, `fixed: true` in `nodeGraph.mjs`; called
`rimCurve` / `curve` before 2026-11-22).

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
rules on question 2 (section 8); until then it stays where it is. The 3D view draws each reference when its node is selected: a plane as a
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
| **U4** | `orient_graph.rs`: value enum with the frame tag (`object` / `global`), `default_graph`, `evaluate`, `validate`, `set_orient_graph`, digest into BOTH cache keys; the same tag check added to `zone_graph.rs` `validate` | geocore | Rust: default graph == `orient_denture` on the test shells, field for field; each refusal by name, including a `global` input into Set as bottom and into a zone; two graphs give two cached frames | free |
| **U5** | wasm + host: `set_orient_graph`, per-node results in the review (points, planes, directions, region face sets), `--orient-graph` in the batch | geocore `geometry-wasm` and `host/`, then vendor | parity run: dentures 6 of 6 IDENTICAL with the default graph set; a bad graph exits 2 with the node named and writes nothing | free to build; **vendoring a new engine needs the owner's push approval**, as engine 70 did |
| **U6** | Orient canvas: kinds, words and the FIXED mirror in `nodeGraph.mjs`; the stage 1 tab as a canvas; 3D overlays; `orientGraph` in the type file | mixodental | `nodeGraph.test.ts` (words, groups, FIXED); a filtered walk of the review page; on a real scan, swap to "Largest flat area -> Set as bottom" and see the pose change and the region tinted | **needs ruling 1** (which kinds get it) and a look at the UI by the owner |
| **U7** | Zones use the shared references: the reference kinds on the Zones canvas, the `ref` node, `planePoint` evaluated, a `direction` input on Parallel rays | geocore + mixodental | a wired direction equal to back -> tissue 45 gives R1's mask exactly; a `planePoint` sight cast runs and its origin is drawn where the percentages say; the canvas will not draw a global wire into a zone | free, but after U6 is accepted |
| **U8** | A first non-arch recipe end to end (flat base -> bottom -> search) on a real model the owner supplies | both | a review folder the owner looks at | **needs ruling 1 and a sample file** |
| **U9** | Tab "4 Print angle": the search fields, per-angle table, pick and confirm move out of Orient (section 8) | mixodental, UI only | a filtered walk; a zone edit visibly moves the pick on tab 4 | **needs ruling 2** |
| **M1** | Measure quick pick vs full-build pick on every denture scan (section 9) | a script, about 4.3 h unattended | the table of section 9's four answers | done 2026-11-21; ruling 3 answered (fewer tips left out beats less resin): **keep C** |

Order: U1 and U2 in parallel, then U3, U4, U5, then stop for the owner before U6. U1-U4 change no
behaviour for any shipped type. U9 and M1 depend on nothing above and can go first.

Debt this plan does NOT take, written down: a per-type engine slot for the graphs (E3, already
planned); a free aligner Orient; flat regions on a smoothed copy (the node reads the scan's own
triangles, so a noisy scanned base may need a larger tolerance - to be measured in U8, not guessed
now); and the GLOBAL nodes themselves (toward the plate, a level plane, the print box) - the first
build makes the tag and its refusal only, because nothing that has an angle is a graph yet (section 7).

---

## 6. Questions for the owner

1. **Which printed items is the flat base for, first?**
   Recommend: **a new kind with a real base (a model or a tray), with the denture and aligner keeping
   today's orientation unchanged.** A denture has no flat base and its upright rule is measured on your
   scans; rewiring it gains nothing and voids its proof. The new nodes still show on both as readouts.

2. **Should the print-angle search leave the Orient tab and become its own last tab, "4 Print angle"?**
   Recommend: **yes** (section 8). The search is already computed after zones and support rules; only
   the tab order says otherwise. Orient keeps the frame, the references and "which face is the bottom".

3. **Should the print angle be chosen from full support builds instead of the quick score?**
   Recommend: **not yet - measure first, one overnight run** (section 9). A full build at every angle
   is about 43 minutes per case. If the measurement shows the quick pick is often not the best build,
   build "quick score for all angles, full build for the best 3" - about 4 minutes more per case.

4. **Does "set as bottom" mean "turn this face toward the plate, then support it as usual", or "print
   this face directly on the plate, no supports under it"?**
   Recommend: **turn it toward the plate, supports and lift as usual.** That reuses every safety check
   unchanged. Printing flat on the plate is a different mode (no lift, no tips under the base) and
   should be its own later switch, not an accident of this node.

Five things I decided without asking - say so if any is wrong:

- Two frames, your words: object and global. The object frame is fixed before the start angle; the
  start angle is only the first lean the search tries (section 7).
- The Zones tab offers object references only. A global reference there is refused, with the reason,
  because a zone is decided before any angle - this is your own "won't need recast" (section 7).
- A type keeps the print-angle search after Set as bottom; "use exactly this bottom" is start = end,
  so the chosen pose is still judged by the hard rules instead of being trusted.
- The look-at node's up-down / left-right angles are measured against the PART, never the screen (a
  screen angle changes when you orbit the view).
- The detectors' inner numbers are shown, not editable (they were measured on your scans).

---

## 7. One vocabulary for Orient AND Zones - and the two frames

**The owner's question, answered first: the object planes are fixed BEFORE the start angle - at tilt
0, from the original tight box and the up / front decision - and the start angle is only the first
lean the search tries; it turns the part and its object planes together, so it never changes them.**

Owner, 2026-11-20: *"those nodes can be used in zone tab because it helps freedom of ray casting"*,
and, after two rounds on the names: *"maybe we don't need 3 different setup, just 2, global no matter
tilt, or object, before tilt start even set, just the original tight box with up down front back
decided."* Agreed on both. The point / plane / direction / flat-region nodes of section 3 are ONE set
of node kinds; `nodeGraph.mjs` lists each once with `stage: 'reference'` and both canvases offer it.

> **TWO FRAMES. The owner's words are kept as the names.**
>
> | | **Object frame** | **Global frame** |
> |---|---|---|
> | What it is | The part's own sides: front, back, top, bottom, left, right, decided once from the original tight box and the up / front decision. | The scene's fixed directions: down is toward the plate, up is away from it, and the level directions around it. |
> | Glued to | the part | the plate and the machine |
> | When the part leans or is moved | it goes WITH the part, so nothing drawn on the part ever changes | it stays still; the part turns inside it |
> | When it is known | as soon as Orient finishes, before any angle | always - but WHERE it lies on the part depends on the angle being looked at |
> | Example | "the part's back face", "the rim plane", "the largest flat area", "a point 50 / 50 on the tissue side" | "straight down to the plate", "a level plane 30 mm above the plate" |
>
> At tilt 0 the two line up: the part's front points away from the plate, and so on. From then on the
> object frame leans with the part and the global frame does not. That is the whole difference.

**Is two enough? Yes, and it is better than the three this page had for a day.** The earlier "Start
frame" and "Plate frame" were the SAME scene directions, looked at at two moments: before the search
and after the pick. A moment is not a frame. What the three-frame version was really protecting is
one rule, and it survives as a property of the READER, not as a third name:

> **A global reference can only be used by something that knows an angle.**

The search knows one (the candidate it is trying). Everything after the pick knows one (the final
pose - including whatever the operator did on the plate, which is just the part moving in the global
frame). Orient and Zones know none: they run before any angle exists. So:

| Reader | `object` | `global` | Why |
|---|---|---|---|
| **Orient graph** | yes | **refused** | No angle exists yet; Orient is what decides where tilt 0 is. |
| **Zones graph** | yes | **refused** | Zones are decided once, before any angle. |
| **Per-angle scoring and placement** (tabs 3 and 4; engine code today, no graph yet) | yes | yes, at the angle being tried | It has an angle. |
| **After the pick** (pillar landing, export, readouts; no graph yet) | yes | yes, at the final pose | It has an angle. |

**The owner's guess is right, and it is the reason the Zones row is so simple.** *"All the ray cast
should have been done with the object planes, so ... won't need recast since once it is done tilt
won't change any."* Verified in source:

- The zone analysis is built ONCE per model, in the object frame: `Prepared::of` calls
  `analysis_of(&tips, profile, frame.up0, steep_deg)` (`denture/tilt.rs:175`), before any angle is tried.
- The search then scores EVERY angle with those same zones: `row_with` calls
  `place_ruled_with(&self.tips, analysis, profile, &[], up, ...)` with only `up` changing
  (`denture/tilt.rs:186-192`). A zone is a set of faces; faces lean with the part; no recast.
- A zone that read a global reference would need an angle. Give it the PICKED angle and it is a
  circle (the angle is picked using the zones); give it every candidate angle and each cast - up to
  1.5 million rays - is paid 23 times, with a cache that is keyed without an angle. Refused instead.

**What the global frame is FOR - what the object frame cannot say.** Anything that must stay level
with the machine while the part leans: "straight down to the plate" (what makes a face an overhang,
where a pillar goes, where resin drains), a level plane at a height, the side the film peels from.
The engine already works this way: each angle's `up` is the global up, expressed on the part at that
angle (`denture/pose.rs` `plate_up` and `print_axes`). So the global frame needs no new arithmetic,
only a name and a type.

**The socket tag and the refusal.** Every `direction`, `position` and `plane` socket carries
`space: object | global` (a `mask` is per face and has none). A node's output is `global` if the node
is a global node or ANY of its inputs is global. Every input in the Orient graph and the zone graph
accepts `object` only. Refused in three layers, one rule, a test on each: the canvas will not draw the
wire (its check already asks the model's socket types); `nodeGraph.mjs` `validate` names it; the
engine's `validate` refuses it at set, with the reason - *"SIGHT: origin is a global reference - a
zone is decided before any print angle, so it can only use the part's own (object) references"*.

**Which nodes live where.**

- **Object - everything in section 3:** the detectors and their `frame`, Named plane, Centre, Point on
  plane, Crossing, Largest flat area and its plane, Look at, Normal of, and every input of Set as bottom.
- **Global - none built yet:** "toward the plate", "level plane at a height", "the print box" (the
  part's extent as it sits on the plate). They wait for the first reader that has an angle and is a
  graph; today those readers are engine code. The first build makes the tag and the refusal only.
- **The one bridge:** the `pose` output of Orient says how the object frame sits in the global frame
  at tilt 0. It is the only thing that mentions both, and it is not a reference anyone can wire into
  a zone.

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
everything that is true whatever the angle: the detectors, the object frame, the rim, the references,
and the `pose` output - which face is the bottom at tilt 0. That is also the clean seam for sections
2 and 7: tabs 1 and 2 work in the object frame only, and the global frame is first needed where an
angle exists - tab 3's placement at each angle, and tab 4.

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
  part (object frame, decided once), "down" being the global down at that angle (section 7);
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

M1, one overnight run, no engine change: for each local denture scan (planned as the 6 used by P1; three of
them turned out to be `-sup` reference files, so the results below cover the 3 bare scans), full-build EVERY angle and record per angle: verdict, tips left
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

### M1, results - the three bare denture scans (run of 2026-11-21)

`scripts/tilt-measure.ts`: every angle 0-44 by 2 fully built (named by index, never by file). Of the six
STL files in `dentalwork/fixtures/case-denture`, **three are bare scans and three are `-sup` files** - the
same scans supported by another dental program, which this repo keeps as REFERENCE ONLY
(`dentalwork/fixtures/README.md`, "Support contact files"). Only the bare scans are cases. Numbered 1-3 as the
script now counts them (they were 2, 4, 6 when the `-sup` files were still swept). Every column comes from the
every-angle run of 2026-11-21; the pick column was re-run the same day with the shipped engine (geocore
5319c86, `--pick`) and matched to the tip. The raw per-angle rows were session-local and are not kept: this
table is the record, and `npx vite-node --script scripts/tilt-measure.ts` regenerates them in about an hour.

| Scan | Quick pick | Left out at the pick | Quick top 3, left out | Resin at the pick vs the leanest angle with none left out |
|---|---|---|---|---|
| 1 | 8 deg | **0** (168 placed) | 0 / 0 / 0 | +2.5 % (leanest 10 deg, quick 4th) |
| 2 | 0 deg | **0** (99 placed) | 0 / 0 / 0 | +8.7 % (leanest 4 deg, quick 3rd) |
| 3 | 18 deg | **0** (76 placed) | 0 / 0 / 0 | +10.6 % (leanest 22 deg, quick 8th) |

**The quick pick is sound on tips and loose on resin**, print heights within 0.7 mm of the pick's. Against the
decision rule above (written for six scans; read here as "on every scan"): the quick pick is the best full
build on TIPS on all three - none left out, nor in its top 3 - and within 5 % resin on one of three (scan 1),
over on two (8.7 and 10.6 %), on resin only.

**Ruling 3** (owner, 2026-11-21) answers what that leaves open - section 6, question 3, whether a leaner full-
build angle should beat the quick pick: **fewer tips left out beats less resin**. So **option C stays** (the
quick score picks the angle) and no resin term goes into the quick score. It rests on the three bare scans
above, not on the removed runs below.

**CORRECTION, 2026-11-21 (owner: "you are supporting a denture that already has support from my other
dental software, you have been using wrong cases to test").** The first runs measured all six files, and
the `-sup` files' "small separate pieces" - 210 to 555 of them, the other program's supports - were read
as parts of the denture. Everything built on that was wrong and has been removed from this section: the
measurements of those "pieces", a second every-angle run that split left-out tips between body and pieces,
two proposed fixes (reading every part in the angle score; routing rules for the pieces) and the rule
experiments that followed (pillar spacing, helper reach, branch cap, model landing, the neck experiments). None of it reached the app; the
one engine change made for it (a denture pillar-spacing cap) and a diagnostic commit were taken out of
geocore before any push. **Standing owner rulings from this day:** ruling 3 above, and two given during the
removed work that stand on their own: **never lower the clearance between supports and the denture** (it
fuses them), and **support structures may fuse or combine into a tree** - the generic 2 mm outline pillar spacing is not a safety
rule (`supports/parts/outline.rs`), to revisit on a real case that needs it.

`scripts/tilt-measure.ts` now skips `-sup` files, so a sweep of a fixtures folder cannot measure them again.

## 10. Rim detection as shared nodes - one node set, two presets (owner, 2026-11-21; refined by Fable)

Owner: "make node by breaking down into reusable steps, and they may share some node", then: a node that tells
the rim search from which point and at what angle to look; the rim tab hands a STANDARD rim to the Support zones
tab, with supports on the rim line by default, an inner/outer band and shift, profile defaults, a rim edit mode,
and zones built from the rim. Fable's verdict: one graph, one socket vocabulary, two presets (aligner, denture).
"Same nodes, different settings" holds for half the steps; where the ALGORITHM differs, two node kinds sit behind
one socket type, both in the same node set. Every migrated step reproduces today's results exactly
(`npm run gate:real`, real scans, `-sup` files excluded).

### Today (geocore engine 70)

- **Aligner** (`dental/orient.rs` -> `dental/rim.rs`): the robust trim plane gives the opening direction; vertices
  are projected on it; a sharp-edge graph (unwelded, two-face edges, abs(dot)) gives closed loops; the innermost
  loop at the lower end is the rim; fallback = the last 2.5 % cap ring; the rim is rasterised to the visibility
  footprint; Step 2's position / width / density shape a signed strip from it (`footprint.rs`).
- **Denture** (`dental/denture/`): arch frame (`upright.rs`) + front/back decision (`up_decision.rs`); in that frame
  the lowest outer-shell vertex per angular bin is a rim point, neighbours joined by the cheapest sharp-preferring
  path (`rim_lowpoints.rs`, `rim_graph.rs`, a continuous dihedral cost - it does not read `hard_edges.rs`); open
  gaps cut the rim; `rim_plane.rs` fits the plane; `rim_tips.rs` places rim tips.

### The node set and the two presets

| Node | Out | Aligner preset | Denture preset | One kind + settings? |
|---|---|---|---|---|
| Frame source | `frame` | trim plane | arch frame + front/back decision | upstream, different detectors |
| `lookFrom` - from which point, at what angle | `position` + `direction` | down from the trim plane | the tissue side | **yes** |
| Rim finder | `rim` | `rimLoopSharp`, fallback `rimCapRing` | `rimLowPoints` | no - two (three) kinds, one socket |
| `rimDrawn` (rim edit mode) | `rim` | yes | yes (new; free it from the aligner profile) | **yes** |
| `fitPlane` | `rimPlane` | yes | yes | **yes** (step 1: `dental/plane_fit.rs`) |
| Band | `mask` | signed strip (position, width, density) | even band | no - two kinds, each labelled |
| `rimTips` | tips | - | yes | denture today |
| `rimSide` - inner / outer zone | `mask` | new | new | **yes**, new for both, off by default |

**The standard `rim`:** polylines, each with a `closed` flag; points at the finder's own precision plus mesh vertex
ids where they exist (nothing rounded on the way, so bit-equality survives); a SOURCE flag (detected, fallback,
drawn - a drawn or fallback rim never authorises automatic supports today, and must not start to). The aligner's
visibility mask is a separate output of its finder, not part of `rim`.

**Inner / outer:** decided by sign against the rim plane and the fitting direction, never by "inside the loop" (an
open U encloses nothing). Inner = the side facing the fitting surface (aligner cavity, denture tissue), outer = the
visible outside - one meaning for both kinds.

### Plane names - one name per plane, everywhere (code, docs, UI, three languages)

| Name | What it is | From | Rim-derived |
|---|---|---|---|
| **Rim plane** | the plane fitted through the final rim line | the rim | **yes** |
| **Trim plane** | aligner: the first estimate through the detected trim edges, which aims the rim search | trim edges, before the rim | no |
| **Arch plane** | the flattest plane of the whole part | all vertices | no |
| **Symmetry plane** | splits left from right | the arch frame | no |
| **Box face** (top/bottom/front/back/left/right), **Box centre plane** (3) | from the tight box | the box | no |
| **Rim crossing** (renamed from "intersection") | rim plane x symmetry plane x back face | the rim plane | **yes** |

Retired: "middle plane", "upright plane", "upright arch plane", "bottom plane" (the UI string "Bottom plane" too).
Not "median plane": in anatomy that is the left/right midline, our symmetry plane.

**On the rim tab, every rim-derived node is greyed out and disabled** with the reason ("Needs the rim. Available
from the Support zones tab"); the engine also refuses a rim-derived wire into `lookFrom` through a separate socket
type (`rimPlane` is not a `plane`), so the greying is not the only guard against the cycle.

**Every plane in the UI** (owner, 2026-11-21): a plain explanation (what it is, what it is computed from) in all
three languages; its own colour, the same on the node's chip and in the 3D view; drawn when its node is selected or
highlighted, hidden otherwise - except the important ones, always shown: the plane the current tab's result rests
on (rim tab: the trim plane for an aligner, the arch plane for a denture; Support zones tab: the rim plane).
Colours come from the app's style tokens (`mixo-app-style`), one token per plane name.

### Handover to the Support zones tab - what the next tab reuses

The rim tab's results reach the Support zones tab as **fixed inputs**: computed once on the rim tab, shown read-only
in the zones palette's "From the rim tab" group (today's "From Orient" group in `nodeGraph.mjs`, which already
carries the `rim` node), and recomputed only when the rim tab changes - so the zones tab never re-detects a rim.

| Handed over | Socket | What the zones tab does with it |
|---|---|---|
| **Rim** (the line, with its `closed` and source flags) | `rim` | strips around it (`band`), inner / outer zones (`rimSide`) |
| **Rim plane** | `rimPlane` | references: points on it, the rim crossing, directions square to it |
| **Rim area** (the support area the rim tab set: the rim line by default, widened by its inner / outer band and shifted) | `mask` | start from it as a support zone, or subtract from it / add to it |
| **Rim crossing** | `position` | a point to aim rays from |
| The frame and the planes that do not depend on the rim (trim, arch, symmetry, box) | `frame`, `plane` | the same references as on the rim tab |
| **Pose** (up + lean at tilt 0, section 3) | `pose` | not used by zones; handed on to the print-angle tab (section 8), which reads it |
| **Visibility mask** (aligner only, the rim finder's raster) | `mask` | the aligner's footprint (`footprint.rs`) reads it; a separate output, never part of `rim` |

**Rim area, named producer (Fable's end-to-end review, 2026-11-22):** the rim tab owns one node that makes it -
the aligner's signed strip (position / width / density) or the denture's rim band. The denture has two rim strips
today (2 mm `RIMBAND` and the low 5 mm `LOWRIMBAND`); **the rim area is the 2 mm one**, the low band stays a
separate fixed input until an owner ruling says otherwise. The host socket is `rim` (`nodeGraph.mjs`, renamed
from `curve` in build step 3).

What is greyed out on the rim tab (the rim plane, the rim crossing, anything built from the rim) is exactly what
becomes available here - one rule, seen from both sides.

### Build order - each step proven before the next

1. **Shared plane fit** (`dental/plane_fit.rs`) - landing: bit-equal to the old rim fit on 200 point clouds and on
   the refusal cases; `gate:real` must show no change. The four other copies of the covariance loop (orient, trim,
   arch frame, tight box) call the shared `covariance_about` since geocore b50dc99, each keeping its own mean and
   eigenvector pick; `gate:real`: no differences on the 13 scans.
2. **Plane names**: the rename above in code, docs and UI strings (ja / zh-Hant), before any node exposes a name.
3. **Typed evaluator**, engine and host in parity (`zone_graph.rs` evaluates mask-only kinds and refuses the rest;
   `nodeGraph.mjs` refuses unknown kinds). Proof: the default graphs evaluate identically; `gate:real` no change.
   **DONE 2026-11-22** (mixodental 6596e66, geocore ac4029b): the parity list is down to its one by-design entry,
   the socket is `rim`, and `gate:real` showed no differences. The rim-area producer was always step 7's (below).
   **Started 2026-11-22:** `dentalwork/batch-review/zoneGraphParity.test.ts` sends one corpus of graphs through both
   validators (host `validate`, engine `setZoneGraph`). They agree except two listed disagreements - the engine
   does not type-check inputs (the typed evaluator's first job); and, BY DESIGN, the host lets a graph be authored
   ahead of the engine (the rim strip on a free output), which the engine refuses with its reason. The host's missing
   0-180 tilt check, a third, is closed (the editor now refuses it as the engine does). A new disagreement, or a listed one that goes away, fails the test (proven by breaking it). The
   typed evaluator's job is to empty that list. Also found: the engine's default graph names four outputs (RIM,
   RIMBAND, LOWRIMBAND, SOCK) it does not contain, and checks only nodes reachable from its free outputs.
   **Step 3, made implementable (EGM readiness review, 2026-11-22):**
   - **Types it introduces:** exactly today's host set - `mask`, `depthMap`, `position`, `rim` - as a typed value
     in the engine evaluator. The types the later nodes need arrive WITH those steps: `direction` / `frame` with
     `lookFrom` (step 6), `rimPlane` / `plane` with `fitPlane` (step 7), `pose` with the print-angle tab; the
     object/global `space` tag stays deferred (section 7, U4). Per-kind inputs and outputs: the host `KINDS` table
     in `nodeGraph.mjs` is the reference; `zoneGraphParity.test.ts` holds the engine to it.
   - **Exit condition:** the parity test's first listed disagreement (the engine did not type-check inputs) is
     GONE - the engine now refuses a non-face input or free output at validation (geocore `zone_graph.rs`
     `MASK_KINDS`, 2026-11-22). The second stays, pinned BY DESIGN with its reason (the host authors ahead of the
     engine). So the target is one entry, not zero.
   - **Scope:** the engine has five fixed outputs (`hole_band` -> BAND, `rim` -> RIM, `rim_band` -> RIMBAND,
     `low_rim_band` -> LOWRIMBAND, `sockets` -> SOCK); the last four name nodes its own default graph does not
     contain, because those values are computed elsewhere in stage 1. Step 3 does NOT add them; step 4 does, as
     locked nodes (added by step 4.2 - unreachable, so still computed elsewhere). The engine's reachable-only check (it evaluates what the free outputs need) stays: it is how a
     graph authored ahead of the engine can still run its runnable part.
   - **`curve` becomes `rim`: DONE 2026-11-22.** The socket type and the node kind are both `rim` now. Measured
     first: the engine never reads the kind (it only checks that the `rim` output is bound to RIM, `FIXED_OUTPUTS`),
     so the rename is host-only and needed no engine change; geocore's own test fixture was renamed to match. A
     saved graph that says `rimCurve` is read as `rim` by `upgradeGraph` (`nodeGraph.mjs` `OLD_KINDS`) - on the
     viewer's load and in the type-file check (`typeInForce.ts`) - and `nodeGraph.test.ts` proves an old default
     graph loads valid and default again. The alias is removed only with a type-file version bump.
   - **The proof, precisely:** the graphs are the denture default graph and the parity corpus; identical means the
     engine's per-output masks are bit-equal (the zone digest unchanged) and `npm run gate:real` prints
     "No differences" for all 13 scans.
   - **The rim-area producer** is a node kind `rimArea` (aligner: the signed strip from position / width / density;
     denture: the 2 mm rim band), built in step 7. Until then the rim area is what today's code makes (the
     aligner footprint, the denture's fixed RIMBAND).
4. **Kind-neutral graph**: move `zone_graph.rs` out of `denture/`; an aligner default graph that wraps today's code
   as locked nodes. Proof: `gate:real`.
   **Step 4, made implementable (Fable, 2026-11-22; the trap claims checked against the code):**
   - **Do NOT move the whole file.** It is built from denture parts (six `use super::` lines, Sources, canon,
     prepared); a whole move only puts denture code under a neutral name. Cut instead: the generic part - `Node`,
     `Graph`, `num` / `text`, `parse` - goes to `dental/graph.rs`; the evaluator stays in `denture/`. Nothing denture
     crosses that cut. The override store crosses it twice (`validate`, `default_graph`).
   - **A locked node already has a precedent:** `FIXED_OUTPUTS` pins an output name to a node id, refuses any edit,
     and the value keeps coming from today's code (the graph never dispatches it). The aligner graph starts that way:
     declared, pinned, never evaluated. Evaluating it by calling the existing function needs a typed value (outputs
     are four `Vec<bool>` today) - that is step 5's.
   - **Aligner outputs it names** (what the code produces and reads downstream): the trim frame, `rim` (points,
     boundary kind, opening direction, front), the visibility mask, `allowed` (`Region.allowed_faces`), the rim area
     (`Region.contact_faces`), the contacts.
   - **Order, each provable alone:** (1) extract `dental/graph.rs` - `cargo test`, denture digest unchanged,
     `gate:real` (**DONE 2026-11-22**, geocore c5d073d: `Node`, `Graph`, `num` / `text`, `parse` moved, re-exported
     from `zone_graph`; geocore 680 Rust tests + 86 host files, `gate:real` no differences, app gate 1981 tests,
     walk ALL PASS 199 + 2); (2) add RIM, RIMBAND, LOWRIMBAND, BASINS, SOCK to the engine's denture default as unreachable nodes -
     masks bit-equal, `gate:real` (**DONE 2026-11-22**, geocore 027bc4d: appended, unreachable; two new
     Rust tests - every output names a node the graph contains, and the engine default has the host's ids, kinds
     and wires - each shown to fail without RIM); (3) one override slot PER KIND, then the aligner default graph with locked
     validation - a Rust test that it validates, that every edit is refused naming the node, and that the digest
     stays "default" (**DONE 2026-11-22**, geocore 25708a3 `dental/aligner_graph.rs`: six locked nodes - TRIM `trimPlane`,
     RIM `rimLoopSharp`, VIS `visibility`, ALLOWED `allowedFaces`, AREA `signedStrip`, CONTACTS `contacts` - and
     outputs `trim_frame`, `rim`, `visibility`, `allowed`, `rim_area`, `contacts` (Fable's names; naming was
     delegated). Only the default validates; seven kinds of edit are refused by name; setting it never touches the
     denture's slot. It holds no state until a node can be freed, so "one slot per kind" is that guarantee, not a
     second store. Not vendored: no wasm call reads it until (4)); (4) wasm + host: a kind-aware set, host `KINDS` / outputs per kind, the type file - parity test
     with an aligner corpus, `vendor:check`, full `gate:real`. **(4a) DONE 2026-11-22, the engine-facing half:**
     `set_zone_graph` reads a top-level `"kind"` (`dental/graph.rs` `kind_of`; absent = denture, so every saved
     graph and caller is unchanged) and sends `"aligner"` to the locked aligner graph; `putInForce` no longer sends
     "no graph" for an aligner type, which used to clear the denture's graph. Proven: geocore host tests through the
     wasm build fail with the routing removed; `typeInForce.test.ts` fails with the fix removed. **(4b) DONE
     2026-11-22, the host half:** `nodeGraph.mjs` has `ALIGNER_KINDS` (each node with a plain sentence),
     `alignerGraph()` and a locked `validate` branch for `kind: 'aligner'` with the engine's words; an unknown kind is
     refused. The type file accepts the aligner's locked default on an aligner type only (an edit to it is refused, a
     denture cannot carry it). `zoneGraphParity.test.ts` has six aligner cases and host and engine agree on all of
     them. Proven: four tests fail with the host's aligner branch removed. **(4c) DONE 2026-11-22, the screen:** on
     an aligner run the review viewer's stage area shows the aligner's locked graph read-only - six cards, each with
     a "locked" tag, its plain sentence, what it reads and which output it fills; no control on it, because every
     node is fixed in this version. Checked in the browser on a fresh aligner run at 1440 x 900 (six cards, the rail
     fits without scrolling); app gate 1985 tests, walk ALL PASS 199 + 2. Step 4 is complete.
   - **Why `gate:real` alone is not the proof:** an aligner graph that is only declared changes nothing the scans
     record, so the gate passes vacuously; step (3)'s refusal test is the real check until a node is freed.
   - **Traps (checked):** ONE override slot today (`zone_graph.rs` `OVERRIDE`), and `typeInForce.ts` sets the graph
     to null for an aligner type - a second kind must not clear the denture's graph. The aligner detection cache keys
     on mesh and profile only (`region.rs` `propose_region_part`): add the graph digest BEFORE any aligner node is
     freed, or an edit would return a stale region. `set_zone_graph` in the wasm API is denture-only (prefer a
     top-level `"kind"` field defaulting to denture over a new parameter). The type file refuses any graph on an
     aligner (`typeFile.ts`) - keep that until (3), then allow only the default. `default_graph(steep_deg)` and the
     host's `REQUIRED_OUTPUTS` are denture-shaped; `KINDS.rim.reads` names the denture finder.
5. **`rim` socket**: wrap each finder whole, no logic moved. Proof: bit-equal rim points on the real scans.
   **Made implementable by Fable (2026-11-22), claims checked:**
   - **5.1 DONE 2026-11-22** (geocore a4cd919 `dental/standard_rim.rs`): `StandardRim { lines: Vec<RimPolyline>, source }`,
     `RimPolyline { points: Vec<V3>, closed, vertices: Option<Vec<u32>> }`, `RimSource { Detected, Fallback, Drawn }`,
     and two pure conversions - `from_aligner(&Rim)` (one closed loop, no ids; f32 points widened exactly, so they
     come back bit for bit) and `from_denture(&[RimLine])` (one polyline per line, welded-surface ids). No caller
     changed. Proof: unit tests, plus round-trip assertions in the two real-scan tests (`local_orientation.rs`, 8
     lab aligner scans; `denture_rules.rs` on the local denture scans), which fail on a reversed rim.
     `gate:real` alone would not prove this - it records tip counts and GLB hashes, not rim points.
     Deliberately NOT carried: the denture's per-edge ids and lengths (`rim_tips.rs` and the review read them from
     `Analysis::rim`), the aligner's frame and visibility raster, and the whole-rim closed / gap facts.
   - **5.2 DONE 2026-11-22:** the denture zone graph's `Sources` carry `rim: &StandardRim`, built once in
     `Analysis::of`; `ZoneOutputs.rim` hands it through (the `rim` output is pinned to RIM, so it is always the
     finder's rim - a plain `StandardRim`, not an `Option`); `Analysis.standard_rim` keeps it as the value the Support
     zones tab will read. The finder runs once and no mask path changes. Proof: `denture_rules.rs` asserts
     `analysis.standard_rim == from_denture(&analysis.rim)` on the synthetic shape (always runs) and on the local
     denture scans, and fails when the graph drops the rim; then `gate:real`. The aligner has no evaluated graph,
     so its rim stays `from_aligner(&rim)` until a node of it is freed.
   - **Traps (checked):** denture vertex ids index the welded hard-edge surface, not the mesh; convert the aligner from
     `Rim::points` (f32), not `make_rim`'s f64 loop; never re-sort points; a fallback stays `Fallback` (never
     authorises supports); do not recompute a line's length from its points (`rim_tips.rs` takes the max of both).
6. **`lookFrom`** as an explicit input to both finders. Proof: bit-equal.
   **6.1 DONE 2026-11-22** (geocore 652a2dc `dental/look_from.rs`; Fable's design, checked and narrowed): `LookFrom { position,
   direction }`, direction toward the end the rim is searched at. The aligner finder `trace_rim` takes it - the
   vertex centroid and the opening (open arch: the reverse of the trim plane's up; ring: the floor rule's axis, so
   "down from the trim plane" is the open-arch preset only); its body is unchanged. The DENTURE finder needs a whole
   frame (it bins in the canon frame's across/up plane and takes the lowest point along `teeth`), so it keeps
   taking its `Canon` - already an explicit input. Fable proposed rebuilding a `Canon` from a `LookFrom` inside the
   finder; not done, because it would make a second frame the axis grid, tissue map and top face do not share.
   Proof: same values reach the same body; geocore tests and the local aligner scans; `gate:real` no differences;
   app gate 1985 tests, walk ALL PASS 199 + 2.
   **6.2 DONE 2026-11-22, aligner only:** the aligner's locked graph has a LOOK node (`lookFrom`, out `direction`)
   between TRIM and RIM - engine `aligner_graph.rs`, host `ALIGNER_KINDS` / `alignerGraph()`, the viewer's aligner
   rail (seven cards). The aligner tests now find nodes by id, not position, so the next node added cannot silently
   retarget an edit. Proof: the parity test (host and engine agree on every aligner case) and the refusal tests.
   NOT in the denture graph, on purpose: its finder takes a whole frame, not a look-from (6.1), and a `lookFrom`
   node there would also change the default graph every saved denture graph is compared against. It joins the
   denture graph with a `frame` socket, when the frame source becomes a node.
7. **`fitPlane` node**, then free the denture rim bands from `FIXED_OUTPUTS`. Proof: mask equality.
   **Made implementable by Fable (2026-11-22), claims checked - bands first, the plane later:** the strips depend on
   the rim, not the plane, so the order above is not a dependency; and a plane cannot be evaluated while the graph's
   values are face masks only, so a `fitPlane` node now would be a declared card and nothing more (written down as
   debt; the rim plane feeds only the cavity-ray origin, whose plane is already fixed to `rim`).
   - **7.1 DONE 2026-11-22** (geocore 8429b6f): the two rim strips were the same block written out twice in `Analysis::of`; they are
     one `EdgeGraph::band(seeds, mm)` now (grow from every rim vertex along the welded surface; empty for no seeds or a
     width of 0 or less). Same arithmetic, same order. Proof: a ring-slab test (wider grows more, the 2 mm strip lies
     inside the 5 mm one, the guards); `gate:real` no differences; app gate 1985 tests, walk ALL PASS 199 + 2.
   - **7.2 DONE 2026-11-22** (geocore 31ea863): the zone graph grows the rim strips. `Sources` carry the welded surface's `edges` and
     the profile's `rim_strip_mm`; `evaluate` fills `ZoneOutputs.rim_band` / `low_rim_band` with `EdgeGraph::band`
     from the standard rim's vertex ids (a rim without ids is refused); `Analysis` takes them from there and its own
     copy is gone. Every reader (`ruled_tips.rs` placement, `review.rs`) reads `Analysis`, so none changed.
     `validate` now refuses a graph whose RIMBAND / LOWRIMBAND is not a band seeded by the rim (two new refusal
     cases), so such a graph fails when set, never mid-run. Proof: `gate:real` no differences (the strips decide
     rim-strip tips); app gate 1985 tests, walk ALL PASS 199 + 2.
     **The width has two truths, decided:** the PROFILE is the truth. The graph nodes still say 2 and 5, but the
     engine grows each strip at the profile's width and never reads the node's `mm` - so a type with other widths
     keeps them. Still to do (7.2b): the host should show those two widths as fixed values read from the profile, as
     the print-angle search node does, instead of the node's 2 / 5.
   - **7.3 then:** free them - remove RIMBAND / LOWRIMBAND from `FIXED_OUTPUTS` and the host's `FIXED.outputs`, and
     replace the host's id exemption with "a band is seeded by Find holes or the rim". Never before 7.2: freed while
     the strips still come from `Analysis::of` would make an edit a silent no-op.
8. **Plane display** - moved up to run right after step 2 (it needs only the names, and it is the visible value):
   explanations, colours, show-on-select, important planes always on; captured at operator width. Tonight it lands
   in the batch-review viewer, the one place a node graph is shown today; the app has no node canvas for operators.
   **DONE 2026-11-22** in the viewer: formal names, explanations as hover text, one token per plane on the chip and
   in 3D (the engine-written trim plane retinted), frame-source planes on by default; captured and measured.
9. **`rimSide`** (new behaviour, off by default, owner-reviewed); 10. **`rimDrawn`** for dentures.

**Debt written down after Fable's review of the night's diffs (2026-11-22):**
- FIXED 2026-11-22: the engine's input check called a host-only mask kind (`basinFill`) "not a set of faces".
  It now says "which this version cannot evaluate yet" (`zone_graph.rs` `HOST_ONLY_MASK_KINDS`, `not_faces`), for
  an input and for a free output, with both cases in `validation_names_the_problem`. Still refused, as before.
- The viewer retints the four plane layers by material. Checked (2026-11-22, aligner review at 1440x900): in the
  3D canvas the trim chains stay red (115 px) and the U ends green (13 px) beside the amber trim plane (631 px),
  so the retint did not spill onto a layer sharing a material there. CLOSED the same morning, on every writer: in
  the 31 review GLBs written by fresh denture and aligner batches over the fixture folders, no material is used by
  more than one mesh at all, so no plane can share one (28 plane meshes, 0 shared). This tests the GLB writers,
  not any detection result. The check reads the
  GLB's own material indices and was shown to flag a synthetic file where a plane and the model share one. It
  holds for today's writers; a writer that starts reusing materials would need the viewer to clone before tinting.
- Fixed the same night: the denture facts filter dropped the renamed "Rim plane" row; `viewerScript.test.ts` now
  fails when a filter names a row the table no longer produces (proven against the regression).

Later, one measurement may shrink the set: the denture's `rimLowPoints` run on aligner scans; if it finds the same
rim, one finder replaces two. Sharp edges stay two rules (a yes/no set vs a continuous cost - different outputs).
