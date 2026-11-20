# The reviewer, with the node editor in it

What the folder review looks like once rules are authored as nodes, and **what every zone of the model
is painted and why**. Written 2026-11-20 on the owner's two asks: *"a holistic planning of how the
entire ui of the reviewer looks like when node editor is added in"*, and *"the zone of the model that
is not defined should get its own color, so we know."*

This page is a specification, not a wish list: every element below either exists today or is named
with the engine fact that makes it buildable. Where a thing is NOT buildable yet, it says so and says
what must land first.

---

## 1. THE ZONE MODEL — three origins, two outcomes, and that is the bug

The engine's own header is the authority (`mixo-geocore/crates/geometry-core/src/dental/denture/ruled_tips.rs:3-7`):

> 1. NO_SUPPORT: parallel rays from the front-top at 45 degrees; the first face each hits is NO_SUPPORT.
> 2. ALLOWED: the first face each oral-cavity ray hits is allowed, **and allowed overrides no-support.**
>    **Faces reached neither way are not allowed for tips.**

So a face arrives in the review by one of **three** routes, and today only **two** of them are
painted:

| Origin | Per-face data | Gets | Painted today |
|---|---|---|---|
| The oral-cavity ray (R2) reached it first | `review.allowedMask` | **tips may stand** - and this WINS over no-support | `--layer-allowed` |
| A 45-degree ray (R1, and R1b when on) reached it first | `review.noSupportMask` | **no tips** | `--layer-no-support` |
| **No ray reached it at all** | neither mask | **no tips** - same outcome, different fact | **NOTHING** |

**Why the third needs its own colour.** The outcome is the same - no tips - but the *fact* is not, and
the operator's next move is not:

- A no-support face was **decided**: a rule looked at it and said no. If that is wrong, you change the
  rule.
- An unreached face was **never seen**: no ray arrived. If that is wrong, you change the ray grid, the
  pose, or you are looking at a scan the detector cannot cover.

Until this layer existed, an undefined face had **no layer at all**: it drew as the bare model, which
reads as *"nothing to see here"* rather than *"undecided"*. That is worse than a wrong colour, because
nobody goes looking for a colour that was never there - this project's first law at the display layer.

**Measured on the first run with the layer on: 54% to 74% of the faces of a real denture scan are in no
zone** (three cases: 73.6%, 65.5%, 54.0%). Those faces are correctly denied tips - the rays reach the
outer surfaces, not the tissue side under a saddle - but *the proportion is itself a fact nobody could
see before*, and it is the kind of number that decides whether a pose or a ray grid is doing its job.

**The implementation is app-side.** Both masks arrive in
`dentalwork/batch-review/dentureReviewLayers.ts` (`review.allowedMask`, `review.noSupportMask`, around
`:381-384`), so the third layer is `allowed === 0 && noSupport === 0` per face. **No Rust, no wasm
rebuild, no vendor bump.**

### The painting rules, in the order the layers stack

Lift order matters: each patch is lifted off the surface so the one above wins visually
(`FACE_LIFT_MM` < `BAND_LIFT_MM` < `ALLOWED_LIFT_MM` today).

| Layer | Token | Lift | Says |
|---|---|---|---|
| Undefined | `--layer-undefined` (new) | lowest | no ray reached this face |
| No-support zone | `--layer-no-support` | low | a 45-degree ray reached it first |
| Hole band (5 mm) | `--layer-hole-band` | middle | allowed if overhanging |
| Allowed area | `--layer-allowed` | highest | tips may stand; overrides no-support |

**The override must stay visible, not be flattened.** A face in both masks is allowed, and the reviewer
already shows this by drawing allowed *above* no-support rather than removing the red underneath. Keep
that: the operator needs to see that a rule was overridden, not a tidy single colour. The step list in
`viewer.html` already teaches it as step 5 overriding step 3.

**Colour choice for undefined:** a neutral, low-chroma grey-violet, deliberately NOT in the
red/green/amber family the decided zones use, because it is not a verdict. It must read as "nothing
here", legible on both the teal model and the light background, and it must survive the colour-blind
check the other layer tokens were chosen against. It belongs in the shared tokens file that
`layerColours.ts` and the GLB writers both read, so the viewer and the app cannot drift.

**Counts, not just colour.** Every zone layer's legend row carries its face count, and the undefined
layer carries it too. A scan with 40% of its faces undefined is a different conversation from one with
0.3%, and the colour alone will not tell you which you are looking at. `W4` of the Witness protocol:
the count is the result.

---

## 2. THE LAYOUT, with the node editor in it

Today's reviewer is three regions (`dentalwork/batch-review/viewer.html`): the 3D view, the case list,
and the facts-plus-layers column, collapsing to one column on a narrow window. The node editor is a
**fourth region, not a replacement for any of them**, and it goes below the 3D view, full width.

```
+---------------------------------------------------------------+
|  CASE LIST   |            3D VIEW                  |  FACTS   |
|  (one row    |     live detection, layers on        |  +       |
|   per scan)  |     the model, the override          |  LAYERS  |
|              |     visible as stacked patches       |  (counts)|
+---------------------------------------------------------------+
|  NODE EDITOR - the chain the engine actually ran, left to      |
|  right, one node per engine unit, values on the node           |
+---------------------------------------------------------------+
```

**Why below and full width, not a side panel.** The graph is read left to right and the model is read
in the round; side by side, both get half the width they need. Below, the operator changes a value and
watches the model above it change - which is the whole point of the layout the owner already approved
for the batch review: *live detection above, numbers and toggleable masks below.*

**The node editor is a VIEW of the real chain, never a free canvas.** It is generated from the
pipeline, not drawn by hand, so it cannot describe a chain the engine does not run. One node per engine
unit, in the order `trim_frame` and the policy actually combine them.

**What a node shows:** its name, the one question it answers (the house rule - *"a rule whose question
takes a paragraph is two rules"*), its input values with units from the field-name suffix, and its
verdict badge: decided / **CANNOT TELL** / overridden-by. A node that reported `Ambiguous` or `None` is
drawn in the undefined colour above, for the same reason the faces are.

**What a node does NOT offer, and must not: reordering.** The combines are three hardcoded statements
in `denture/ruled_tips.rs`, no single combined mask exists, precedence is re-derived per consumer, and
placement is **stateful** - a `Spacer` claims space in stream order and drops what arrives later in a
crowded spot. So dragging a node earlier would change *which tips exist*, not just their order. A
drag handle here would be a lie the tool tells its operator. **Reordering becomes honest only after
precedence-as-data lands in the engine**, which is an engine handoff, not editor scope.

**What it offers instead:** toggling and retuning by name, which the engine genuinely supports through
the 128-name rules channel, plus the integer modes that select among fixed clauses. Editable fields are
drawn as inputs; everything else is drawn as a value with a lock and a one-line reason.

**Three edit states on every field**, because "why can't I change this" must be answerable from the
node itself:

| State | Looks like | Reason shown |
|---|---|---|
| Operator default | an input | the app owns this; changing it is normal work |
| Calibration | locked, with an unlock that warns | clinical, and an edit **voids this type's validation** |
| Engine constant | a value, not a field | tolerance or wiring; it is not a type's business |

That split is the Fable ruling of 2026-11-20 (`docs/design.md`, *WHO OWNS A NUMBER*), and the editor is
where an operator meets it, so the editor is where it has to be legible.

---

## 3. CREATING A TYPE, and why a CATEGORY is not on this page

**Every type belongs to exactly one category, and there are two** (owner, 2026-11-20): `aligner` and
`denture`. Each ships exactly one type today, and both are the general-purpose one - `reference-aligner`
("Generic aligner") and `reference-denture` ("Generic denture"). So nothing in the product has yet
exercised a second type in either category, and the editor is the first thing that will.

**The categories' types are not the same shape**, which is the consequence that governs the editor:
`AlignerProfile` and `DentureProfile` are different structs with different fields, parsed by separate
strict registries (the denture registry returns nothing for an aligner id, and its test pins that). So:

- **a type cannot be moved or copied between categories** - there is no field mapping, and pretending
  otherwise would produce a profile that fails a strict parse at best;
- **"new type" starts by choosing the category**, because the category decides which fields exist
  before a single value can be shown;
- `register_profile(kind, json)` keeps the category an explicit argument rather than inferring it from
  the content - a digest says which numbers, never which category.

**A type is data; a category is code.** `ADDING-A-KIND-OR-TYPE.md` states it and means it: no JSON
field can supply an algorithm. So the editor's "new type" is: copy the nearest type, retune, bench it,
export a profile. The editor can do that for types as soon as the values are the app's to supply
(steps 4 and 5 of the order in `docs/design.md`).

**A new category needs a new chain**, and a chain the editor could compose does not exist yet - see the
reordering paragraph above. Until precedence-as-data lands, a "new category" button would be a button
that cannot keep its promise, so there is not one.

**Every authored type carries its validation, visibly.** Scan-set digests, engine version, profile
digest and the W4 count line. A type whose digests no longer match drops to **UNVALIDATED**
automatically, and that word appears wherever the type is selectable and on export - not only in the
editor that made it. A type that cannot say it is unvalidated is the first law broken at the data
layer.

---

## 4. WHAT MUST LAND FIRST, in order

1. **The undefined zone colour** - app-side only, buildable today, and it is the one the owner asked
   for. It also makes every later step readable, because an unreached face currently looks like a
   decided one in every screenshot taken to prove anything.
2. **Content-digest cache key** - otherwise a retune under the same type id reuses the old verdict and
   the editor shows a stale model (`dental/cache.rs:33-38`).
3. **`schema` + `register_profile`** - the app can hand the engine a profile, and a mismatch throws.
4. **Promote the ~38 policy constants to profile fields**, one unit at a time, at today's values, each
   proved byte-identical by `gate:real`. **This is the bulk of the work** and it is what gives the
   nodes inputs to show.
5. **The node editor itself**, built on 4.

**The editor can be PROTOTYPED against step 1 alone**, read-only except for the 13 shortlisted rules
that already have a live channel. That is worth doing early, not because it is nearly the real thing,
but because a layout is cheap to change now and expensive to change after step 4 is spent on it.
