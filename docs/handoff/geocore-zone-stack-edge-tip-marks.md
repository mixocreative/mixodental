# geocore: rim and hole tips as Marks in the denture zone stack (a later Mark wins for them too)

STATUS: agreed by Fable and Codex 2026-11-27 under the owner's delegation; the idea is the owner's (2026-11-27).
Sent to mixo-geocore docs/requests/. Design only: nothing here is built, and the bit-equality below is a hand trace
until the unit test exists.

**As the operator meets it.** In the zone tab a later Mark wins, so the owner arranges the stack to say where supports
go. Rim tips and hole tips do not take part. They stand on their belts "allowed mask or not". A no-support zone reaches
them only through one global rule, `rimRespectsNoSupport` (off by default). That rule ignores the order: any
no-support Mark anywhere in the stack drops them, unless a seen Support Mark covers the face. So a no-support zone
painted to cancel rim tips also lets the standard 45-degree rays (NS) drop rim tips. And the hole strip's tips are tied
to the same switch. The owner's words: rim tips should be "a node that can be arranged in zone tab before or after a
no support zone ... (later nodes override the earlier)".

**Where it lives today.**
- `crates/geometry-core/src/dental/denture/zone_graph.rs:118-160`: `Zone { state, no_support_touched, seen }` and
  `Zone::mark`. `no_support_touched` is sticky.
- `ruled_tips.rs:388-397` (`consider`) and `:596`: the only reader that applies the zone to `Stream::Edge` and
  `Stream::Hole`. It drops a tip on `no_support_touched && !(allowed && seen)`, except within a rim pitch of a lowest
  point.
- `ruled_tips.rs:600-618`: rim LINE samples, gated per face, plus the rim belt grid and the hole strip grid.

**The ask.**
1. `Zone` gains two per-face bits, `rim_ok` and `hole_ok`. Two bits, not one: the two belts can overlap, and today's
   single switch wrongly ties them together.
2. Two Mark kinds, `markRimTips` and `markHoleTips` (inputs `under`, optional `faces`). With no `faces` wired they
   cover EVERY face. This is needed because the rim line samples are gated per face and may lie outside the 2 mm belt.
3. Over a face, a later `markNoSupport` clears both bits. `markSupport` with `seen` on sets both. `markSupport` with
   `seen` off leaves them alone. `masks()` is unchanged, so `tilt.rs`, `model_landing.rs` and `review.rs` do not move.
4. Both readers (`:393` and `:596`) read the bit when the graph contains an edge Mark. A graph without one runs today's
   rule path untouched, the same precedent as the zone form (`zone_graph.rs:102-106`). The low-point exception stays in
   the reader: it tests a tip's position, not a face. Socket and self-support rules are untouched.
5. Not changed, and to be said in the docs: `no_support_touched` stays sticky for the print-angle ranking. "A later Mark
   wins" therefore holds for tips but not for the angle search.

**The proof asked for.**
- A `Zone::mark` unit test of the six orders traced by hand against `touched && !(allowed && seen)`:
  - never touched;
  - NS then seen;
  - NS then unseen;
  - seen then NS;
  - seen, NS, unseen;
  - NS, seen, unseen.
- `tests/denture_rules.rs` bit-equal tips on the local scans, with the rule on and with it off, after the host's upgrade
  below.

**Host side (mixodental, after vendoring - not part of this request).** `typelab/nodeGraph.mjs` gains the two kinds.
`upgradeGraph` handles saved graphs:
- rule off: both marks, all faces, at the TOP of the stack;
- rule on: both at the BOTTOM, under Z1;
- either way, the rule is then dropped from the saved type.

Then `gate:real` must show bit-equal tips for every saved type, followed by the walk. The Type Lab composer stops
toggling the rule, and its probes then drop rim tips only through the engine. That includes the area back-fill of a
dropped rim face (`ruled_tips.rs:622-633`), which the post-hoc re-score cannot model.

**What this does NOT fix, measured 2026-11-27.** No automatic rim mask comes with this request. On the 4 dentures
compared with the owner's `-sup` targets, 80 per-face rules dropped rim tips only and none helped every pair:
- every slope, height, rim-distance and sector band;
- 18 parallel casts, each as "hit" and "NOT hit".

Dropping ALL rim tips scores -39.7 / -12 / -51.1 / +20.1, so the cases disagree. The print pose is ruled out: in the
owner's pose, at the rim's 60-degree limit, only 1 / 4 / 3 / 5 of our rim tips stop overhanging. What this request DOES
give is that a no-support zone, painted by hand for a case or found later, cancels rim tips without side effects.

**Evidence to attach when picked up.** mixodental `typelab/output/rimprobe-1` and `poseprobe-1` (logs and rows; scans
named by hash only; git-ignored, so regenerate them with the scripts named in mixodental `typelab/CLI.md`).
