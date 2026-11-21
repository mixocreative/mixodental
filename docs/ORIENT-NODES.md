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

### M1, results - all six scans (run of 2026-11-21), first reading checked by Fable

`scripts/tilt-measure.ts`: every angle 0-44 by 2 fully built, on the six local denture scans in
`dentalwork/fixtures/case-denture` (named by index, never by file); 138 builds. Raw rows: the session
scratchpad `m1.json`. The first reading was checked by Fable against the rows and corrected; then the
oddity it flagged was traced, and that trace is the headline.

**The six scans are three pairs.** Each multi-piece file is a single-piece file plus hundreds of small
separate pieces - the largest piece matches its partner to the triangle:

| Scan | Pieces | Largest piece (triangles) | Quick pick | Left out at the pick | Quick top 3, left out | Fewest left out (angle, quick rank) |
|---|---|---|---|---|---|---|
| 2 | 1 | 516,770 | 8 deg | **0** (168 placed) | 0 / 0 / 0 | 0 at most angles |
| 1 | 211 | 516,770 = scan 2 | 8 deg | **115** (388 placed) | 115 / 102 / 100 | 27 at 44 deg (22nd) |
| 4 | 1 | 157,772 | 0 deg | **0** (99 placed) | 0 / 0 / 0 | 0 at the pick |
| 3 | 339 | 157,772 = scan 4 | 0 deg | **249** (177 placed) | 249 / 255 / 254 | 129 at 44 deg (23rd) |
| 6 | 1 | 120,736 | 18 deg | **0** (76 placed) | 0 / 0 / 0 | 0 at most angles |
| 5 | 556 | 120,736 = scan 6 | 18 deg | **289** (243 placed) | 290 / 289 / 299 | 157 at 42 deg (22nd) |

The quick scan runs on a file's LARGEST PART by design - geocore `tilt_scan_ruled` in
`dental/denture/tilt.rs`: *"A file of several parts is scanned on its largest part (`parts.rs`); the build
checks every part."* That is why each pair gets the same quick ranking, and it splits the result in two:

1. **For the body, the quick pick is sound on tips and loose on resin.** On all three single-piece scans
   it leaves no tip out, and so does every one of the quick top 3. Resin at the pick against the leanest
   angle that also leaves none out: **+2.5 %** (scan 2, leanest 10 deg, quick 4th), **+8.7 %** (scan 4, 4 deg,
   quick 3rd), **+10.6 %** (scan 6, 22 deg, quick 8th) - print heights within 0.7 mm of the pick's. Against
   section 9's rule (best, or within one tip and 5 % resin) that is 1 of 3 inside and 2 over, on resin
   only. So: **keep option C** - extra builds (B, N = 3) would catch the leaner angle on scan 4 alone - and
   if 9-11 % resin matters, the cheap move is a resin estimate in the quick score, which is ruling 3's
   question (resin against the other preferences), not a measurement one.
2. **Every left-out tip comes with the small pieces.** The same bodies with their pieces leave 115, 249
   and 289 tips out. Steeper angles leave fewer out (to 27, 129, 157) but mainly by asking for fewer tips
   (candidates fall, placed barely rises) and at 30-50 % more resin - a weak trade the quick score cannot
   see, because it never reads the pieces.

**Where on the pieces, first rows of the upgraded script** (`leftOutOnLargest`, `candidates`, grouped
`leftOutByReason`, `maxSnapMm` as the check on the lookup): scan 3 at its pick, 30 of 249 left-out tips
stand on the body and 219 on the pieces; scan 1 at 0 deg, 25 of 91 on the body - although the body alone
(scan 2) leaves none there. Either the pieces take the body's pillar room (the commonest reason is "every
outline pillar in reach is full or crowded", 31 of 91), or the nearest-vertex lookup (worst snap 1.6 mm)
gives the body tips that sit on a piece touching it. Not separated yet.

**The question this hands the owner is not "quick or full build" but what the small pieces are.** 210 to
555 pieces of a few thousand triangles each, beside one large body: separate teeth or tooth fragments to
be printed with the base, or scan debris above the debris size that should be dropped? If they are real
parts, the print angle should hear from them (and ruling 3 - fewer tips left out or less resin - applies
to them); if they are debris, the right fix is the debris rule, and the angle choice is already good.

**Next:** that answer first. Then, only if they are real parts, re-run M1 with the upgraded script and
separate the two readings above. Scans 2, 4 and 6 are the clean baselines for any later change to the
quick score.

Section 9 above says "3 of them in `dentalwork/fixtures/case-denture`"; the folder holds 6 - three
bodies, each with and without its pieces.

### The owner's answers (2026-11-21) and the pieces, measured

**Ruling 3: fewer tips left out beats less resin.** So the resin gap at the body's pick (+2.5 / +8.7 /
+10.6 % against the leanest clean angle) is not a reason to change anything: on all three bodies the
quick pick and its whole top 3 leave no tip out. **Option C stays; no resin term goes into the quick
score.** TRAP for whoever scores "fewer left out" next: M1 showed steeper angles cut the left-out count
mainly by ASKING for fewer tips (candidates fall, placed barely rises). Count left out against the same
or more tips asked for - a share, or placed and left out side by side - never the bare count.

**What the pieces are: the owner is not sure.** So they were measured instead of guessed
(scratchpad `pieces.py`: vertices welded on exact coordinates, pieces by shared vertex, the body is the
piece with the most triangles, gap = nearest piece vertex to the body's vertices):

| Scan | Other pieces | Longest side, median / 90 % / max | Over 5 mm | Under 1 mm | Touching the body (< 0.05 mm) | Pieces' resin vs the body's |
|---|---|---|---|---|---|---|
| 1 | 211 | 1.8 / 11.7 / 70.7 mm | 50 | 89 | 94 | 23 % |
| 3 | 340 | 2.2 / 5.8 / 65.8 mm | 40 | 65 | 37 | 37 % |
| 5 | 556 | 2.0 / 9.3 / 44.4 mm | 83 | 94 | 144 | 119 % |

**They are not scan debris, on three counts.** One piece in scans 1 and 3 is as long as the whole
denture (66-71 mm, 470-900 mm3). In scan 5 the pieces together hold more resin than the body. And the
smallest pieces repeat exactly - scans 1 and 5 have dozens of the same 80-triangle, 0.65 mm, 0.14 mm3
shape - which noise from a scanner never does. These are designed parts, most of them touching or
within 1 mm of the body (173 / 140 / 205), with a tooth-sized band of 5-12 mm among them. What exactly
they are (teeth as separate shells, a second part of the base, design markers) is for whoever made the
files to say; for the print angle the answer is the same either way: **they print, so the angle must
hear from them.**

**What that means, not done tonight:** the quick scan reads the largest part only (geocore
`tilt_scan_ruled`, by design), so on these files it chooses the angle blind to the parts that carry
most of the left-out tips (70-90 %, M1 v2 below). Under ruling 3 the next step is the quick scan reading every part that prints - an
engine change in geocore, to be measured on the workbench first (benchwork), on scans 1, 3 and 5 against
today's pick, with scans 2, 4 and 6 as the baseline that must not move. Not started: a change to how
the app decides, owner's approval first.

**The owner, later the same morning: the pieces are structures the dental software adds, they print, and
they need supports on their non-overlapping areas.** The build already works that way - geocore
`supports/file_parts.rs` (engine 56, the owner's ruling of 2026-11-02): pieces get generic tips on their
exposed overhangs, faces inside or touching another part get none, and only bits under `partDebrisMm` get
nothing. So the build is right and the one part of the pipeline blind to the pieces is the quick angle
scan.

### M1 v2 - where the left-out tips are, and why (scans 1, 3, 5, every angle, 69 builds; checked by Fable)

| Scan | At the quick pick: asked / placed / left out (share) | of them on the body / on pieces | Lowest share left out (quick rank): asked / placed / left out (share) | Resin, pick to that angle |
|---|---|---|---|---|
| 1 | 503 / 388 / 115 (23 %) | 35 / 80 | 44 deg (22nd): 428 / 401 / 27 (6 %) | +39 % |
| 3 | 426 / 177 / 249 (58 %) | 30 / 219 | 44 deg (23rd): 408 / 279 / 129 (32 %) | +64 % |
| 5 | 532 / 243 / 289 (54 %) | 28 / 261 | 42 deg (22nd): 436 / 279 / 157 (36 %) | +48 % |

1. **The pieces carry 70-90 % of the left-out tips at the pick** (69.6 / 88.0 / 90.3 %); the body loses
   28-35, against none for the same body alone (scans 2, 4, 6, from the first M1 run). Why the body loses
   tips once the pieces are there is not shown: scan 3's body loss RISES at the steep angle (30 to 39).
   The body/piece split is a nearest-vertex lookup (worst snap 1.6-1.9 mm at the pick, up to 3.4 mm
   over all angles), so some "body" tips stand on a piece touching it.
2. **About 99 % are routing failures, not missing tips** (the rest, 26 / 39 / 63 over all angles, stand
   on a face pointing up or sideways after the tilt). The causes differ by scan. At the pick: scan 1 is
   63 % "every outline pillar in reach is full or crowded" and 17 % "all rods within x mm of the model";
   scans 3 and 5 are 45 % and 54 % rods too near the model plus 29 % and 28 % where only rods longer than
   the branch cap (`branchRodMaxMm`) reach a pillar. Over all angles scan 1 also has 20 % "no room below
   the neck".
3. **The steep angles are a real gain on scan 3, and mostly a counting effect on scans 1 and 5.** On
   scan 3, 102 more tips are placed and only 18 of the 120 fewer left out come from asking for fewer.
   On scans 1 and 5, 75 of 88 and 96 of 132 do; scan 1's +13 placed is inside its angle-to-angle spread
   (368-425). Fewer tips are asked for on all three, so the trap's test (same or more asked) is not met.
   The quick scan ranks these angles 22nd-23rd; whether that is BECAUSE it never reads the pieces is
   not tested here.

**So there are two levers, separate changes, neither proven:**

- **A. The quick scan reads every part that prints** (geocore `tilt_scan_ruled`, today the largest
  part only). Untested whether it would choose the steep angles, and point 3 says their gain is real
  on one scan of three.
- **B. Routing room for the pieces**: rods allowed nearer the model where the model is a piece fused
  to the body, or a longer branch cap on dentures. It addresses the commonest causes on scans 3 and 5
  at every angle; it does not address scan 1's (pillars full, no room below the neck), and more placed
  tips means more support resin, so it is not free either.

Both change how the app decides, so both go through benchwork first, on all six scans, with scans 2,
4 and 6 as the baseline that must not move. Order recommended: **B first, as the cheaper experiment**
(a rule change, no new scan); what it leaves on the table sets whether A is worth measuring. Not
started: owner's approval first.

### Both levers measured (2026-11-21, owner: "fix all"; checked by Fable)

**Lever B, as rule numbers the engine already has** (no engine change; `scripts/tilt-measure.ts --pick` with
`MIXO_RULES`, the quick pick of each scan, all six scans; raw rows: scratchpad `b0`-`b3.json`):

| Scan | Today's rules: placed / left out | branchRodMaxMm 15 | dentalModelLanding 2 | both | Resin, both vs today |
|---|---|---|---|---|---|
| 1 | 388 / 115 | 401 / 102 | 408 / 95 | 413 / 90 | +4 % |
| 2 | 168 / 0 | 168 / 0 | 168 / 0 | 168 / 0 | -4 % |
| 3 | 177 / 249 | 176 / 250 | 199 / 227 | 199 / 227 | +3 % |
| 4 | 99 / 0 | 99 / 0 | 99 / 0 | 99 / 0 | -4 % |
| 5 | 243 / 289 | 243 / 289 | 249 / 283 | 249 / 283 | -2 % |
| 6 | 76 / 0 | 76 / 0 | 76 / 0 | 76 / 0 | +0 % |

The single-piece scans (2, 4, 6) keep every tip, as they must - though their supports change shape (resin
-4 % on 2 and 4 with the same tips, from the branch cap alone: it reshapes their trees, a side effect). On
the scans with pieces the best variant (both rules) leaves 90 / 227 / 283 out where today leaves 115 / 249 /
289: **22 %, 9 % and 2 % fewer - not the fix.** The longer branch cap alone moves scan 1 only; landing on the model (the owner's option of
2026-11-01, off by default because a column ending on the denture leaves a mark on it) does most of it.

**Lever A, checked before any engine work** (`scripts/lever-a-check.ts`): would the angle scan pick the
steep angles if it counted the pieces' overhang too? **No.** The pieces' downward area hardly changes with
the angle (scan 3: 1457-1544 mm2 over 0-44 deg, scan 5: 2285-2379), while the body's own area rises some
200 mm2 toward the steep angles - so the sum's minimum stays low (10, 16 and 18 deg by bare minimum; the
scan's tie rule, lowest tilt within the tie fraction, would likely keep scan 3 at 0). That settles the
OVERHANG term only: the real pick sorts by landing paths, boxed-in lows and lows outside the allowed area
before overhang, and reading the pieces would change those too - untested. What the steep angles change
is routing: "rods too near the model" refusals fall (scan 3: 237 to 58 over the M1 v2 rows) - but on
scans 1 and 5 most of the gain is fewer tips asked (section above). So A as an overhang term is dropped;
no engine rule was added for it.

**What is left, for the owner** - each one changes what the app does, so none is switched on:

1. **Turn on landing on the model for dentures** (`dentalModelLanding` 2): 17 / 9 / 2 % fewer left out
   on its own (22 / 9 / 2 % with the longer branch cap), at the cost the owner switched it off for (marks where a column meets the denture).
2. **A steep probe**: on a file with pieces only, build the quick pick AND the steepest robust angle and
   keep the one that PLACES more tips (not the one leaving fewer out - that is the counting trap above). One extra build of a few minutes, nothing for
   single-piece files. Measured gain (M1 v2): real on scan 3 (+102 placed), mostly fewer tips asked on 1
   and 5; resin +39-64 %.
3. **Accept the pieces' left-out tips as reported** - they are listed, and the operator can place tips by
   hand - and close lever work here.
4. **Not yet measured, named by Fable:** less rod-to-model clearance where the model is a fused piece (the
   commonest cause on scans 3 and 5 - needs an engine rule, the clearance is model-wide today).

**Pillar capacity, measured the same way** (Fable's second suggestion; scratchpad `b4`, `b5.json`): `tipsPerPillar` 10 instead of 6 leaves 107 / 249 / 289 out (scan 1 only moves, by 8), and with the branch cap and model landing on top it gives exactly what those two gave alone (90 / 227 / 283). So "every outline pillar in reach is full or crowded" is about crowded SPACE, not the count per pillar; the single-piece scans keep every tip in both runs.

**Decided for now (2026-11-21, under the owner's "fix all"; theirs to reverse): option 3, accept and report.** Nothing measured is a fix: the routing rules cut 2-22 %, landing on the model would reverse the owner's 2026-11-01 ruling, the steep probe's gain is real on one scan of three, and the clearance rule is unmeasured. The pieces' left-out tips stay listed in the build's report for placing by hand. No app behaviour changed.
