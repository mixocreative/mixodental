// Copyright (c) Mixo Creative.

/*
 * ONE JOB: line a scan up with its supported target (-sup) and say where the target's supports touch it - once per
 * pair of FILE CONTENTS, kept, and handed to whoever asks (the review of a case, the fit, the ledger below).
 *
 *   node typelab/targetMatch.mjs <folder or files...>     the pair ledger: every pair, its line-up, or why not
 *
 * Which files are a pair is targetPairs.mjs (the `-sup` rule). The geometry is scripts/extract-sup-contacts.py, run once
 * per pair; it is review tooling outside the engine (docs/GEOCORE-BOUNDARY.md rule 6), and line-up itself is a generic
 * primitive the engine should own one day (rule 1) - this module is the one place that would change.
 *
 * THE KEY is the content of the scan, of the target and of the matcher script: a renamed file finds its result, a
 * replaced one never gets a stale result, and a changed matcher re-runs every pair. Results live in the git-ignored
 * typelab/output/targets (they are patient geometry), never beside the owner's scans.
 *
 * NOTHING DIES SILENTLY: a matcher that could not run is answered as status "failed" with the reason (and is not kept,
 * so the next ask retries); a pair the matcher refused is kept WITH its reason, which the review shows.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { targetPairs } from './targetPairs.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const TARGETS_DIR = join(here, 'output', 'targets');
export const MATCHER = resolve(here, '..', 'scripts', 'extract-sup-contacts.py');
export const MATCH_FORMAT = 'mixo-sup-contacts/2';

const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

/** Where the result for this pair of contents is kept. */
export function matchPath(scan, target, dir = TARGETS_DIR) {
  return join(dir, `${digest(scan).slice(0, 16)}-${digest(target).slice(0, 16)}-m${digest(MATCHER).slice(0, 12)}.json`);
}

/**
 * The line-up of one pair: kept, or computed now (can take a minute on a large scan). Never throws for a matcher
 * problem - the answer carries status "failed" and the reason.
 * @returns {{ status: 'ok'|'failed', reason: string|null, path: string|null, cached: boolean, [k: string]: unknown }}
 */
export function matchTarget(scan, target, { dir = TARGETS_DIR, python = process.env.PYTHON ?? 'python' } = {}) {
  const path = matchPath(scan, target, dir);
  if (existsSync(path)) return { ...JSON.parse(readFileSync(path, 'utf8')), path, cached: true };
  mkdirSync(dir, { recursive: true });
  // Written under a private name, then renamed: two runs can ask for the same pair at once (the server runs two scans
  // at a time, the fit runs beside it), and a reader must never see half a file.
  const part = `${path}.${process.pid}.part`;
  const run = spawnSync(python, ['-I', MATCHER, scan, target, part], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (run.error || run.status !== 0 || !existsSync(part)) {
    rmSync(part, { force: true });
    const why = run.error ? run.error.message : (run.stderr || run.stdout || '').trim().split('\n').slice(-3).join(' ');
    return { status: 'failed', reason: `the target matcher did not run (${python}): ${why}`, path: null, cached: false };
  }
  renameSync(part, path);
  const result = JSON.parse(readFileSync(path, 'utf8'));
  if (result.format !== MATCH_FORMAT) return { status: 'failed', reason: `the matcher wrote format ${result.format}, expected ${MATCH_FORMAT}`, path: null, cached: false };
  return { ...result, path, cached: false };
}

/**
 * The target of ONE scan, found beside it by the -sup rule: null when it has none; status "unsupported" (with the
 * reason) when the pair cannot be matched, e.g. a GLB on either side.
 */
export function targetFor(scan, options) {
  const beside = targetBeside(scan);
  if (!beside) return null;
  if (beside.reason) return { status: 'unsupported', reason: beside.reason, target: beside.target, path: null, cached: false };
  return { ...matchTarget(scan, beside.target, options), target: beside.target };
}

/**
 * The -sup file beside a scan WITHOUT matching it (cheap: a folder listing) - for "does this scan have a target at
 * all" on a scan that did not build. null = none; `reason` set when the pair cannot be matched.
 * @returns {{ target: string, reason: string | null } | null}
 */
export function targetBeside(scan) {
  const folder = dirname(scan);
  const set = targetPairs(readdirSync(folder).map((name) => join(folder, name)));
  const same = (a) => resolve(a).toLowerCase() === resolve(scan).toLowerCase();
  const pair = set.pairs.find((p) => same(p.scan));
  if (pair) return { target: pair.target, reason: null };
  const unsupported = set.unsupported.find((u) => same(u.scan));
  return unsupported ? { target: unsupported.target, reason: unsupported.reason } : null;
}

/** Every file under the given folders (and the files given). */
function filesUnder(roots) {
  return roots.flatMap((root) => (statSync(root).isDirectory()
    ? readdirSync(root, { recursive: true }).map((rel) => join(root, String(rel))).filter((p) => statSync(p).isFile())
    : [root]));
}

/** The ledger: every pair with its line-up, every file left without a partner, and why. */
export function pairLedger(roots, options) {
  const set = targetPairs(filesUnder(roots));
  return {
    pairs: set.pairs.map((p) => ({ ...p, match: matchTarget(p.scan, p.target, options) })),
    unsupported: set.unsupported, noTarget: set.noTarget, orphanTargets: set.orphanTargets,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2);
  if (roots.length === 0) { console.error('usage: node typelab/targetMatch.mjs <folder or files...>'); process.exit(2); }
  const ledger = pairLedger(roots);
  // Case numbers and short content hashes only: a scan's name is patient data and means nothing here.
  ledger.pairs.forEach(({ match }, at) => {
    const m = match;
    const what = m.status === 'ok' ? `ok, ${m.registration} gap ${m.rms_mm} mm, target ${m.moved}, ${m.contacts.length} contacts` : `FAILED: ${m.reason}`;
    console.log(`pair ${at + 1}${m.cached ? '' : ' (new)'}: ${what}`);
  });
  console.log(`${ledger.pairs.length} pair(s); ${ledger.unsupported.length} not matchable (${[...new Set(ledger.unsupported.map((u) => u.reason))].join('; ') || '-'}); `
    + `${ledger.noTarget.length} scan(s) without a target; ${ledger.orphanTargets.length} target(s) without a scan`);
  process.exit(ledger.pairs.some((p) => p.match.status !== 'ok' && p.match.path === null) ? 1 : 0);
}
