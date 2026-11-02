// Pure logic of the real-scan gate (no file or process access): turn a batch row into a baseline
// record and diff two records. Kept apart so it is unit-tested with synthetic data.

/** Row fields compared exactly. Timings and file names are deliberately absent. */
export const NUMBER_FIELDS = ['tipsPlaced', 'tipsLeftOut', 'islandsUnresolved', 'printAngleDeg'];
export const TEXT_FIELDS = ['tipsBySource', 'unresolvedIslands', 'verdict', 'result', 'reason'];

/** Reduces one batch summary row plus the SHA-256 of each output file to the record the baseline stores. */
export function recordOf(row, hashes) {
  const record = {};
  for (const field of NUMBER_FIELDS) record[field] = row[field] ?? null;
  for (const field of TEXT_FIELDS) record[field] = row[field] ?? '';
  record.hashes = { ...hashes };
  return record;
}

/** Differences between the saved and the current record: [{ field, was, now }]. Hashes are skipped when `numbersOnly`. */
export function diffRecords(saved, current, numbersOnly = false) {
  const out = [];
  for (const field of [...NUMBER_FIELDS, ...TEXT_FIELDS]) {
    if (saved[field] !== current[field]) out.push({ field, was: saved[field], now: current[field] });
  }
  if (!numbersOnly) {
    const names = new Set([...Object.keys(saved.hashes ?? {}), ...Object.keys(current.hashes ?? {})]);
    for (const name of [...names].sort()) {
      const was = saved.hashes?.[name];
      const now = current.hashes?.[name];
      if (was !== now) out.push({ field: `sha256 ${name}`, was: was ? was.slice(0, 10) : '(none)', now: now ? now.slice(0, 10) : '(none)' });
    }
  }
  return out;
}

/**
 * Compares a whole run with the baseline. `baseline.cases` and `runs` are keyed by case id.
 * Returns { differences: [{ id, kind, problems }], ok }. A case missing on either side is a difference.
 * Cases listed in `baseline.nondeterministic` are compared on numbers and text only.
 */
export function compareRuns(baseline, runs, kinds) {
  const differences = [];
  const volatile = baseline.nondeterministic ?? {};
  const inScope = (kind) => !kinds || kinds.includes(kind);
  for (const [id, saved] of Object.entries(baseline.cases)) {
    if (!inScope(saved.kind)) continue;
    const now = runs[id];
    if (!now) { differences.push({ id, kind: saved.kind, problems: [{ field: 'case', was: 'in baseline', now: 'not found / not run' }] }); continue; }
    const problems = diffRecords(saved.record, now.record, id in volatile);
    if (problems.length) differences.push({ id, kind: saved.kind, problems });
  }
  for (const [id, now] of Object.entries(runs)) {
    if (!(id in baseline.cases)) differences.push({ id, kind: now.kind, problems: [{ field: 'case', was: '(not in baseline)', now: 'new scan' }] });
  }
  return { differences, ok: differences.length === 0 };
}

/** Compact table text for the differences. */
export function formatDifferences(differences) {
  if (differences.length === 0) return 'No differences.';
  const lines = [];
  for (const d of differences) {
    lines.push(`${d.kind} ${d.id}`);
    for (const p of d.problems) lines.push(`    ${p.field}: ${JSON.stringify(p.was)} -> ${JSON.stringify(p.now)}`);
  }
  return lines.join('\n');
}
