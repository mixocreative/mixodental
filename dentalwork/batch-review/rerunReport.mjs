// What a re-run from the review page REPORTS, kept apart from the page and the server so each rule is
// tested: the reason a refused run gives, what "Done" may claim, and the one answer a run gets. Born of
// the 2026-11-20 cia audit of the edited-graph channel (docs/REVIEW-UX-REFINE.md, F1-F3), where each of
// these let a failure read as a success. No DOM, no node:* - the page and serve.mjs both import it.

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
 * What the status may say after a run that finished. It reads the run's OWN summary (`summaryGraph` is
 * its `zoneGraph`), never the request: an edited graph answered with "default" was NOT applied, and
 * saying "Done" there is the claim the audit caught (F2).
 */
export function rerunOutcome({ graphEdited, summaryGraph, names, orientEdited = false, summaryOrient }) {
  const ran = summaryGraph ?? 'unknown';
  if (graphEdited && ran === 'default') {
    return { applied: false, text: 'The run finished, but the edited zone graph was NOT applied: its summary says the default graph ran.' };
  }
  // The same check for the Orient canvas (U6): its run records `orientGraph` beside `zoneGraph`.
  if (orientEdited && (summaryOrient ?? 'default') === 'default') {
    return { applied: false, text: 'The run finished, but the edited Orient graph was NOT applied: its summary says the standard Step 1 ran.' };
  }
  const which = ran !== 'default' && ran !== 'unknown' ? ` (graph ${ran.slice(0, 8)})` : '';
  return { applied: true, text: `Done — showing the re-run with ${names}${which}. The earlier review is still in its own folder.` };
}

/**
 * ONE answer per run, whichever comes first: its exit, a spawn error, or the time limit (which also
 * stops it). Without the last two a run that never started or never ended left the page on
 * "Running..." with Apply disabled, and a spawn error crashed the server (F3).
 * `child` is anything with on() and kill() - a real ChildProcess, or a test's stand-in.
 */
export function guardRun(child, limitMs, { exit, error, timeout }) {
  let done = false;
  const once = (handler) => (...args) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    handler(...args);
  };
  const timer = setTimeout(once(() => { child.kill(); timeout(); }), limitMs);
  child.on('error', once(error));
  child.on('exit', once(exit));
}
