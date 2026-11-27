// typelab's rules and its argument parsing. No I/O, no spawning, no process: importable, testable.
//
// WHY THIS IS A SEPARATE MODULE. `cli.mjs` is a script - it parses argv and exits - so importing it
// to test anything RUNS it: the first version printed its own listing and called `process.exit(0)`
// inside the test runner. The data and the rules that judge it belong somewhere a test can reach
// without starting a program, which is this file; `cli.mjs` is then only orchestration.

/*
 * THE SHORTLIST, and it is not invented here - it is the set this project already treats as the
 * knobs worth turning, lifted from the `MIXO_*` switches `typelab/profileSelect.ts`
 * exposes. `RULE_NAMES` carries about 130 names; a form over all of them would be the opposite of
 * "procedural, few settings", and nobody would have grounds to refuse the 131st.
 *
 * `rules.test.ts` asserts every name here is still in `RULE_NAMES`, so a rename in the engine fails
 * a test here instead of silently becoming a rule the engine ignores - which is the worst outcome
 * this tool has available, a run that looks like an answer and tested nothing. It has happened once:
 * the engine 56 -> 57 rename is why `profileSelect.ts` still carries `LEGACY_RULE_NAMES`.
 */
/*
 * `kinds` SAYS WHO ACTUALLY READS THE RULE, and it is the difference between a tool and a liar.
 *
 * `overhangAngleDeg` reaches an aligner because it acts in the SHARED supports layer, through
 * `generate` (`host/supports/jobRunner.ts:46` passes rules for every kind). The other twelve are read
 * only by the denture's own modules - islands, sockets, the steep ray, the self-support test, the
 * rim gate. Offering them for an aligner would let someone set one, watch nothing change, and
 * conclude the rule does not matter, when in fact nothing ever read it.
 */
/*
 * `label` is what an operator reads (plain words, unit in brackets); `name` stays what the engine
 * reads. A `mode` rule carries `choices`, so it is a dropdown and never a number typed from memory.
 * `rules.test.ts` fails on a rule without a label or a mode without choices.
 */
export const BENCH_RULES = [
  { name: 'overhangAngleDeg', label: 'overhang angle (°)', type: 'deg', was: 'MIXO_OVERHANG_ANGLE', kinds: ['denture', 'aligner'],
    /*
     * REACHES AN ALIGNER, BUT NOTHING WAS OBSERVED TO MOVE. Measured 2026-11-20 on the reference
     * aligner: 94 tips at the default, at 55 and at an extreme 10, with 0 left out every time. The
     * value provably arrives (the filter returns it, and `jobRunner` passes rules for every kind),
     * so an unchanged result here is UNPROVEN, not evidence that the rule does nothing - an aligner's
     * tips come from the dental contour policy rather than from overhang scatter. Said out loud by
     * the CLI, because a silent null result is how a tool teaches someone the wrong thing.
     */
    unprovenOn: ['aligner'],
    // Measured FROM HORIZONTAL, as the app's Overhang control and PrusaSlicer / Orca / Bambu / PreForm (owner, 2026-11-27).
    says: 'The one overhang angle every stream inherits. Measured from horizontal (0 = flat ceiling, 90 = vertical wall): downward faces flatter than this get supports, so a higher number means MORE supports.' },
  { name: 'dentalRimOverhangAngleDeg', label: 'rim overhang angle (°)', type: 'deg', was: null, kinds: ['denture'],
    says: 'The overhang angle along the dental rim, where the rim band is more forgiving. From horizontal: higher means more rim supports.' },
  {
    name: 'noSupportSteepDeg', label: 'steep no-support ray (°)', type: 'deg', was: 'MIXO_STEEP_NO_SUPPORT', kinds: ['denture'],
    /*
     * NARROWER THAN ITS TYPE, AND SILENTLY SO IN THE ENGINE. `supports/island_rules.rs` reads it as
     * "0, or anything outside the OPEN range 45..90, is off". So `--set noSupportSteepDeg=30` is
     * accepted by the 0-90 check every other angle uses, spends minutes of engine time, and tests
     * NOTHING - the run comes back looking like an answer with R1b never switched on. That is the
     * outcome this tool's own header says it exists to prevent, so the range is declared here and
     * refused before the run rather than discovered after it.
     */
    range: { above: 45, below: 90 },
    says: 'Adds the steep no-support ray (R1b) to the no-support zone, the tilt scan, the policy and the review layers. Off outside 45-90 exclusive: the engine reads anything else as off.' },
  { name: 'rimRespectsNoSupport', label: 'rim and hole tips obey no-support', type: 'flag', was: 'MIXO_RIM_NO_SUPPORT', kinds: ['denture'],
    says: 'Whether rim and hole-band tips respect the no-support zone instead of overriding it.' },
  { name: 'socketNoSupport', label: 'no tips in sockets', type: 'flag', was: 'MIXO_SOCKETS', kinds: ['denture'],
    says: 'Whether sockets become no-support. The allowed area cancels this (engine 59), which is why the two interact.' },
  { name: 'socketMinDepthMm', label: 'socket depth (mm)', type: 'mm', was: null, kinds: ['denture'], says: 'How deep a socket must be before the socket rule sees it at all.' },
  { name: 'lowOutsideAllowed', label: 'lowest points outside Allowed', choices: [['0', 'drop - only Allowed and the low rim strip'], ['1', 'keep outside the no-support zone (default)'], ['2', 'keep anywhere']], type: 'mode', was: null, kinds: ['denture'],
    says: 'What happens to a lowest point outside the allowed area: 0 drops it, 1 and 2 keep it under widening conditions.' },
  { name: 'overhangSelfSupport', label: 'no tips on self-supporting overhangs', type: 'flag', was: 'MIXO_SELF_SUPPORT', kinds: ['denture'],
    says: 'Turns on the self-supporting overhang rule: a small, shallow, well-reached overhang needs no tip.' },
  { name: 'overhangMinAreaMm2', label: 'self-support: largest area (mm²)', type: 'mm2', was: 'MIXO_SELF_AREA', kinds: ['denture'], says: 'Self-support: the largest area still called self-supporting.' },
  { name: 'overhangMaxReachMm', label: 'self-support: longest reach (mm)', type: 'mm', was: 'MIXO_SELF_REACH', kinds: ['denture'], says: 'Self-support: how far an overhang may reach from its support.' },
  { name: 'overhangMinAngleDeg', label: 'self-support: shallowest slope (°)', type: 'deg', was: 'MIXO_SELF_ANGLE', kinds: ['denture'], says: 'Self-support: the shallowest slope still called self-supporting.' },
  { name: 'overhangSelfSupportStreams', label: 'rim and hole tips use self-support too', type: 'flag', was: 'MIXO_SELF_STREAMS', kinds: ['denture'],
    says: 'Whether the self-support test also filters the rim and hole-band streams, not just the open area.' },
  { name: 'islandOverhangAngleDeg', label: 'island overhang angle (°)', type: 'deg', was: null, kinds: ['denture'], says: 'The overhang angle an island must meet to earn its own tip. From horizontal: higher means more islands get one.' },
];

/**
 * The names in `rules` that this kind's pipeline never reads.
 *
 * Refusing these is the point: a rule the engine ignores produces a run identical to the baseline,
 * and the honest reading of that run - "this rule changes nothing" - would be exactly wrong. The
 * refusal names them so the operator learns which half of the engine they are standing in.
 */
export const unreadBy = (kind, rules) => Object.keys(rules)
  .filter((name) => !(BENCH_RULES.find((rule) => rule.name === name)?.kinds ?? []).includes(kind));

/** The rules of `rules` that this kind does read - what it is safe to send to the engine. */
export const readBy = (kind, rules) => Object.fromEntries(
  Object.entries(rules).filter(([name]) => (BENCH_RULES.find((rule) => rule.name === name)?.kinds ?? []).includes(kind)));

/**
 * The stamp an output folder is named by: `20261120-015310`.
 *
 * Here because BOTH callers need it - the CLI and the viewer's re-run route - and they had drifted
 * within an hour of each other (`…T175310` against `…-175310`), which makes two runs of the same
 * tool sort differently in one folder.
 */
export const stampNow = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, '').replace('T', '-');

/**
 * `name=value` pairs to the rules object the engine reads, with every refusal collected.
 *
 * IT COLLECTS RATHER THAN THROWS, so one command reports all of its mistakes instead of one per run,
 * and REFUSES BEFORE ANYTHING IS SPENT: a review of a real folder is minutes of engine time, and a
 * typo in a rule name must not cost that and then silently produce the DEFAULT result. A run that
 * looks like an answer and tested nothing is worse than a run that did not start.
 */
export function parseSets(pairs) {
  const rules = {};
  const problems = [];
  for (const pair of pairs) {
    const at = typeof pair === 'string' ? pair.indexOf('=') : -1;
    if (at < 1) { problems.push(`--set ${pair}: expected name=value`); continue; }
    const name = pair.slice(0, at);
    const raw = pair.slice(at + 1);
    const known = BENCH_RULES.find((rule) => rule.name === name);
    if (!known) { problems.push(`--set ${name}: not a rule the Jig offers (run --list)`); continue; }
    if (known.type === 'flag') {
      if (raw !== '0' && raw !== '1') { problems.push(`--set ${name}=${raw}: a flag takes 1 or 0`); continue; }
      rules[name] = raw === '1';
      continue;
    }
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value)) { problems.push(`--set ${name}=${raw}: not a number`); continue; }
    // An angle here is always a SLOPE FROM HORIZONTAL (engine 57), so 0-90 is the whole range and
    // anything outside it is a mistake rather than an experiment.
    if (known.type === 'deg' && (value < 0 || value > 90)) { problems.push(`--set ${name}=${raw}: an angle here is 0-90 (slope from horizontal)`); continue; }
    // A rule whose engine gate is NARROWER than its type. Outside it the engine does not refuse, it
    // quietly treats the value as off, so the run would cost its minutes and prove nothing.
    if (known.range && !(value > known.range.above && value < known.range.below)) {
      problems.push(`--set ${name}=${raw}: the engine reads anything outside ${known.range.above}-${known.range.below} (exclusive) as OFF, so this run would test nothing`);
      continue;
    }
    if (known.type !== 'deg' && value < 0) { problems.push(`--set ${name}=${raw}: cannot be negative`); continue; }
    if (known.type === 'mode' && !Number.isInteger(value)) { problems.push(`--set ${name}=${raw}: a mode takes a whole number`); continue; }
    rules[name] = value;
  }
  return { rules, problems };
}
