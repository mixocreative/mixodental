// ONE JOB: score one run of a setup against the -sup targets, and say whether our own rules disqualify it.
//
// The fit mode (typelab/fit.mjs) tries setups and keeps the one whose supported AREA is closest to the owner's targets
// (owner, 2026-11-26/27: match where supports land and where they are not let land; tilt and height are not match
// terms). Pure: rows in, numbers out, so the rule is tested without running the engine (fitScore.test.ts).
//
// THE SCORE: mean "target area we cover" minus mean "our area outside the target" over the pairs, both in percent.
// Equal weight on purpose - missing the target's area and supporting where it has none are the same size of miss.
//
// OUR RULES ARE A FILTER, NEVER A TERM (docs/GEOCORE-BOUNDARY.md, the -sup "target, not gospel" rule): a setup that
// matches better by building fewer cases, losing the "clear" verdict, leaving more tips unsupported or more islands
// unserved than the starting setup is disqualified, whatever its score.

/** The rows of a run that can be scored: built and compared with a target. */
export const comparedRows = (rows) => rows.filter((row) => row.targetState === 'ok' && row.ownerAreaCoveredPct != null && row.outsideOwnerAreaPct != null);

const mean = (values) => (values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0);
const round1 = (value) => Math.round(value * 10) / 10;

/** A pair's own match: covered minus outside. */
const pairScore = (row) => row.ownerAreaCoveredPct - row.outsideOwnerAreaPct;

/** How far one pair may drop against the best so far before a candidate is refused (points of pair score). */
export const PAIR_WORSE_TOLERANCE = 1;
/** Under this many compared pairs a fit is labelled provisional: too few to trust beyond these scans. */
export const PROVISIONAL_UNDER = 5;

/**
 * Score `rows` (a run's summary.json cases) against `baseline` (the starting setup's rows), matched by source file.
 * @returns {{ score: number, covered: number, outside: number, pairs: number, perPair: Record<string, number>, disqualified: string[] }}
 */
export function scoreRun(rows, baseline = rows) {
  const compared = comparedRows(rows);
  const before = new Map(baseline.map((row) => [row.source, row]));
  const disqualified = [];
  const present = new Set(rows.map((row) => row.source));
  // TRAP: a case that is missing from the run entirely would otherwise just not count - and a smaller set can score higher.
  for (const base of baseline) if (!present.has(base.source)) disqualified.push(`${base.case}: missing from the run`);
  for (const row of rows) {
    const base = before.get(row.source);
    if (!base) continue;
    const name = row.case;
    if (base.result === 'built' && row.result !== 'built') disqualified.push(`${name}: no longer builds (${row.reason || row.result})`);
    else if (row.result === 'built') {
      if (base.verdict === 'clear' && row.verdict !== 'clear') disqualified.push(`${name}: verdict ${row.verdict}, was clear`);
      if ((row.tipsLeftOut ?? 0) > (base.tipsLeftOut ?? 0)) disqualified.push(`${name}: ${row.tipsLeftOut} tips left out, was ${base.tipsLeftOut ?? 0}`);
      if ((row.islandsUnresolved ?? 0) > (base.islandsUnresolved ?? 0)) disqualified.push(`${name}: ${row.islandsUnresolved} islands unserved, was ${base.islandsUnresolved ?? 0}`);
    }
    if (comparedRows([base]).length && !comparedRows([row]).length) disqualified.push(`${name}: no longer compared with its target`);
  }
  const covered = mean(compared.map((row) => row.ownerAreaCoveredPct));
  const outside = mean(compared.map((row) => row.outsideOwnerAreaPct));
  const perPair = Object.fromEntries(compared.map((row) => [row.source, round1(pairScore(row))]));
  return { score: round1(covered - outside), covered: round1(covered), outside: round1(outside), pairs: compared.length, perPair, disqualified };
}

/**
 * Why `candidate` does NOT replace `best`, or [] when it does. Not disqualified; a strictly higher score; NO pair worse
 * than under `best` by more than PAIR_WORSE_TOLERANCE (a mean can hide one case made much worse); and it must win
 * LEAVE-ONE-OUT - with any single pair left out, the rest still score higher - so a gain carried by one scan alone,
 * which is how a fit on four scans overfits, is refused. Ties keep the simpler, earlier setup.
 */
export function refusals(candidate, best) {
  if (candidate.disqualified.length) return ['disqualified'];
  if (!(candidate.score > best.score)) return [`score ${candidate.score} is not above ${best.score}`];
  const out = [];
  const shared = Object.keys(best.perPair).filter((source) => source in candidate.perPair);
  for (const source of shared) {
    if (candidate.perPair[source] < best.perPair[source] - PAIR_WORSE_TOLERANCE) out.push(`a pair got worse (${best.perPair[source]} -> ${candidate.perPair[source]})`);
  }
  if (shared.length > 1) {
    const sum = (run) => shared.reduce((total, source) => total + run.perPair[source], 0);
    const lost = shared.filter((source) => sum(candidate) - candidate.perPair[source] <= sum(best) - best.perPair[source]);
    if (lost.length) out.push(`the gain rests on ${lost.length === 1 ? 'one pair' : `${lost.length} pairs`} alone (leave-one-out)`);
  }
  return out;
}

/** True when `candidate` should replace `best` (refusals() is empty). */
export const beats = (candidate, best) => refusals(candidate, best).length === 0;
