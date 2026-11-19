// benchwork's rules and its argument parsing. No I/O, no spawning, no process: importable, testable.
//
// WHY THIS IS A SEPARATE MODULE. `cli.mjs` is a script - it parses argv and exits - so importing it
// to test anything RUNS it: the first version printed its own listing and called `process.exit(0)`
// inside the test runner. The data and the rules that judge it belong somewhere a test can reach
// without starting a program, which is this file; `cli.mjs` is then only orchestration.

/*
 * THE SHORTLIST, and it is not invented here - it is the set this project already treats as the
 * knobs worth turning, lifted from the `MIXO_*` switches `dentalwork/batch-review/profileSelect.ts`
 * exposes. `RULE_NAMES` carries about 130 names; a form over all of them would be the opposite of
 * "procedural, few settings", and nobody would have grounds to refuse the 131st.
 *
 * `rules.test.ts` asserts every name here is still in `RULE_NAMES`, so a rename in the engine fails
 * a test here instead of silently becoming a rule the engine ignores - which is the worst outcome
 * this tool has available, a run that looks like an answer and tested nothing. It has happened once:
 * the engine 56 -> 57 rename is why `profileSelect.ts` still carries `LEGACY_RULE_NAMES`.
 */
export const BENCH_RULES = [
  { name: 'overhangAngleDeg', type: 'deg', was: 'MIXO_OVERHANG_ANGLE',
    says: 'The one overhang angle every stream inherits (slope from horizontal). Widens or narrows every mask at once.' },
  { name: 'dentalRimOverhangAngleDeg', type: 'deg', was: null,
    says: 'The overhang angle used along the dental rim, where the rim band is more forgiving than the rest.' },
  { name: 'noSupportSteepDeg', type: 'deg', was: 'MIXO_STEEP_NO_SUPPORT',
    says: 'Adds the steep no-support ray (R1b) to the no-support zone, the tilt scan, the policy and the review layers.' },
  { name: 'rimRespectsNoSupport', type: 'flag', was: 'MIXO_RIM_NO_SUPPORT',
    says: 'Whether rim and hole-band tips respect the no-support zone instead of overriding it.' },
  { name: 'socketNoSupport', type: 'flag', was: 'MIXO_SOCKETS',
    says: 'Whether sockets become no-support. The allowed area cancels this (engine 59), which is why the two interact.' },
  { name: 'socketMinDepthMm', type: 'mm', was: null, says: 'How deep a socket must be before the socket rule sees it at all.' },
  { name: 'lowOutsideAllowed', type: 'mode', was: null,
    says: 'What happens to a lowest point outside the allowed area: 0 drops it, 1 and 2 keep it under widening conditions.' },
  { name: 'overhangSelfSupport', type: 'flag', was: 'MIXO_SELF_SUPPORT',
    says: 'Turns on the self-supporting overhang rule: a small, shallow, well-reached overhang needs no tip.' },
  { name: 'overhangMinAreaMm2', type: 'mm2', was: 'MIXO_SELF_AREA', says: 'Self-support: the largest area still called self-supporting.' },
  { name: 'overhangMaxReachMm', type: 'mm', was: 'MIXO_SELF_REACH', says: 'Self-support: how far an overhang may reach from its support.' },
  { name: 'overhangMinAngleDeg', type: 'deg', was: 'MIXO_SELF_ANGLE', says: 'Self-support: the shallowest slope still called self-supporting.' },
  { name: 'overhangSelfSupportStreams', type: 'flag', was: 'MIXO_SELF_STREAMS',
    says: 'Whether the self-support test also filters the rim and hole-band streams, not just the open area.' },
  { name: 'islandOverhangAngleDeg', type: 'deg', was: null, says: 'The overhang angle an island must meet to earn its own tip.' },
];

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
    if (known.type !== 'deg' && value < 0) { problems.push(`--set ${name}=${raw}: cannot be negative`); continue; }
    if (known.type === 'mode' && !Number.isInteger(value)) { problems.push(`--set ${name}=${raw}: a mode takes a whole number`); continue; }
    rules[name] = value;
  }
  return { rules, problems };
}
