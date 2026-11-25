// What a run from the review page REPORTS, kept apart from the page and the server so each rule is
// tested: the reason a refused run gives, whether a finished run applied what it was given, and the one answer a
// run gets. Born of the 2026-11-20 cia audit of the edited-graph channel (docs/REVIEW-UX-REFINE.md, F1-F3), where
// each of these let a failure read as a success. No DOM, no node:* - the page and serve.mjs both import it. (The
// name is older than the scan session: the review folder's re-run it was written for is retired, 2026-11-26.)

import { isDefault as isStandardZone } from './nodeGraph.mjs';
import { isDefault as isStandardOrient } from './orientGraph.mjs';

/**
 * The line of a run's log that says why it did not run, or undefined. The engine's own refusal first,
 * then benchwork's; "Nothing ran. 1 problem(s):" is a header, so the problem under it is joined on.
 * Falls back to the last line the run printed.
 */
export function refusalReason(log) {
  const lines = String(log ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  // "The type was refused" (batch.ts): without it a draft reusing a built-in id said only "exit 2".
  const at = lines.findIndex((line) => /zone graph was refused|Orient graph was refused|type was refused|^--zone-graph|^--orient-graph|Nothing ran/.test(line));
  if (at < 0) return lines.at(-1);
  return /:$/.test(lines[at]) && lines[at + 1] ? `${lines[at]} ${lines[at + 1]}` : lines[at];
}

/**
 * Why a run that FINISHED still did not run what it was asked, or null. It reads the run's OWN summary, never the
 * request: a type carrying a zone graph answered with "default" did NOT apply it, and showing that result as the
 * type's is the claim the audit caught (F2). The same for the Orient graph (U6), recorded beside it. `type` is the
 * whole type file the run was given (a scan session's run, POST /run); `summary` is its summary.json.
 */
export function notApplied(type, summary) {
  // An aligner run always records "default" (typeInForce.ts putInForce leaves the zone graph alone: the aligner chain
  // reads none), while its type may carry the locked aligner graph - checking it would cry wolf on every aligner run.
  if (type?.category !== 'denture') return null;
  // A type that writes the STANDARD graph out in full asked for the default, so "default" is the right answer for it.
  if (type?.zoneGraph && !isStandardZone(type.zoneGraph) && (summary?.zoneGraph ?? 'default') === 'default') {
    return 'the run finished, but its zone graph was NOT applied: its summary says the default graph ran';
  }
  if (type?.orientGraph && !isStandardOrient(type.orientGraph) && (summary?.orientGraph ?? 'default') === 'default') {
    return 'the run finished, but its Orient graph was NOT applied: its summary says the standard Step 1 ran';
  }
  return null;
}

/**
 * ONE answer per run, whichever comes first: its exit, a spawn error, or the time limit (which also
 * stops it). Without the last two a run that never started or never ended left the page on
 * "Running..." with Apply disabled, and a spawn error crashed the server (F3).
 * `child` is anything with on() and kill() - a real ChildProcess, or a test's stand-in.
 */
export function guardRun(child, limitMs, { exit, error, timeout, kill = () => child.kill() }) {
  // `kill`: how a run past its limit is stopped. On Windows the server passes a TREE kill: killing the parent first left
  // the build it started running with no one to stop it (Fable's sign-off review, 2026-11-26).
  let done = false;
  const once = (handler) => (...args) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    handler(...args);
  };
  const timer = setTimeout(once(() => { kill(); timeout(); }), limitMs);
  child.on('error', once(error));
  child.on('exit', once(exit));
}
