// Copyright (c) Mixo Creative.

/*
 * ONE JOB: where ONE run of ONE scan with ONE type is kept, and whether a kept one may be served - shared by the
 * review server (serve.mjs POST /run) and the fit (fit.mjs), so a setup the fit tried opens instantly on the page,
 * and Save finds the runs that prove it.
 *
 * THE KEY is the scan's bytes, the type's run fingerprint and the engine version (runQueue.mjs resultKey). A run is a
 * RESULT only once `finished.json` is written beside it, last. Since 2026-11-27 finished.json also records the
 * TARGET it was compared with (the -sup file's bytes, or none): the review now matches a target by itself, so a result
 * made before a target was added - or with an older target - must be run again, never served as "no target".
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST_GEOMETRY_VERSION } from '../vendor/mixo-geocore/host/geometryVersion.js';
import { notApplied } from './rerunReport.mjs';
import { resultKey } from './runQueue.mjs';
import { targetBeside } from './targetMatch.mjs';
import { runPrint } from './typeDraft.mjs';

const here = dirname(fileURLToPath(import.meta.url));
export const CACHE = join(here, 'output', 'review-cache');
export const FINISHED = 'finished.json';
/**
 * What a kept run's folder holds. Raise it when the review starts writing something a reader depends on: a kept run
 * of an older format is run again rather than served without it. 2 = the fit's evidence file (2026-11-27).
 */
export const REVIEW_FORMAT = 6; // 3 per-face classes; 4 slope / height; 5 composer re-scores; 6 rim distance and arch sector descriptors

const prints = new Map();
/** A file's fingerprint (its bytes, never its name: patient data), remembered by path, size and time. */
export function filePrintOf(path) {
  const stat = statSync(path);
  const memo = `${path}|${stat.size}|${stat.mtimeMs}`;
  if (!prints.has(memo)) prints.set(memo, createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 16));
  return prints.get(memo);
}

/** The fingerprint of the target beside a scan, or null when it has none. */
export function targetPrintOf(source) {
  const beside = targetBeside(source);
  return beside ? filePrintOf(beside.target) : null;
}

/** The key a run of `source` with `type` is kept under. */
export const runKey = (source, type) => resultKey({ scan: filePrintOf(source), type: runPrint(type), engine: HOST_GEOMETRY_VERSION });

/** True when a finished run is kept under `key` AND it was compared with the target that is beside the scan now. */
export function isKept(key, source) {
  const at = join(CACHE, key, FINISHED);
  if (!existsSync(at)) return false;
  let finished;
  try { finished = JSON.parse(readFileSync(at, 'utf8')); } catch { return false; }
  // A result kept before this field existed knows nothing of its target: run it again rather than guess.
  return 'target' in finished && finished.target === targetPrintOf(source) && finished.format === REVIEW_FORMAT;
}

/**
 * Close a run that exited cleanly in `part`: refuse it (the reason, nothing written) when it did not apply the graph
 * its type carried, else write finished.json - last - with the target it was compared with. null = kept.
 */
export function finishRun(part, source, type) {
  if (!existsSync(join(part, 'summary.json'))) return 'the run wrote no summary';
  let skipped = null;
  try { skipped = type ? notApplied(type, JSON.parse(readFileSync(join(part, 'summary.json'), 'utf8'))) : null; } catch (error) { skipped = `its summary could not be read: ${error.message}`; }
  if (skipped) return skipped;
  writeFileSync(join(part, FINISHED), JSON.stringify({ at: new Date().toISOString(), target: targetPrintOf(source), format: REVIEW_FORMAT }));
  return null;
}
