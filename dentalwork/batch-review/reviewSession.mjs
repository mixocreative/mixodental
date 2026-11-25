// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the review workbench's scan session - the scans the reviewer imported, the type they are being run with,
 * and what each scan's run with each type came to - as the case list and the stage banner read it
 * (docs/REVIEWER-OVERHAUL-PLAN.md section 2 steps 2-4, build step 7: the owner's core loop, import -> switch type ->
 * see the difference).
 *
 * A RESULT BELONGS TO A SCAN AND A TYPE AS IT STANDS: its id carries the type's run fingerprint (`typeDraft.mjs`
 * runPrint), so switching type, or editing one, looks up a different result - never shows another type's picture under
 * this type's name. The banner always says which scan, which type, and whether the picture is current.
 *
 * Pure and plain JavaScript (a browser module and Node tests). The page holds one session and redraws from it.
 */

/** @param {{ kind: string, scans: readonly string[] }} input */
export function newSession({ kind, scans }) {
  return { kind, scans: [...scans], results: new Map() };
}

/** The id of one scan's run with one type as it stands. */
export const resultId = (source, typeId, print) => `${source}|${typeId}|${print}`;

/**
 * What one scan with the current type is: `done` with its run (url + the one-case summary), `running` / `queued`,
 * `failed` with the reason, or `not run`.
 * @param {ReturnType<typeof newSession>} session
 */
export const stateOf = (session, id) => session.results.get(id) ?? { state: 'not run' };

/**
 * The case list's rows for the current type: a done scan is its run's own case row (so facts, layers and the 3D view
 * read it unchanged), renamed to its place in this session; any other scan is a placeholder with its state as
 * `result`, which the list and the stage card say in words.
 */
export function rowsOf(session, typeId, print) {
  return session.scans.map((source, k) => {
    const name = `case-${String(k + 1).padStart(3, '0')}`;
    const run = stateOf(session, resultId(source, typeId, print));
    if (run.state === 'done') return { ...run.summary.cases[0], case: name, source, session: { ...run, at: k } };
    return { case: name, source, kind: session.kind, result: run.state, needsLook: false, ...(run.error ? { reason: run.error } : {}), session: { ...run, at: k } };
  });
}

/** Seconds since `since`, whole. */
const secondsSince = (since, now) => Math.max(0, Math.round((now - since) / 1000));

/**
 * The stage banner: which scan, which type, and what the picture is. Never blank while a session is open - "the same
 * picture on a good day and a bad day" is what it exists to prevent.
 * @param {{ at: number, count: number, typeName: string, run: { state: string, since?: number, error?: string }, now?: number }} input
 */
export function bannerOf({ at, count, typeName, run, now = Date.now() }) {
  const where = `Scan ${at + 1} of ${count} with ${typeName}`;
  switch (run.state) {
    case 'done': return `${where} - current`;
    case 'running': return `${where} - running, ${secondsSince(run.since ?? now, now)} s`;
    case 'queued': return `${where} - waiting for a free run slot`;
    case 'failed': return `${where} - the run failed: ${run.error ?? 'no reason given'}`;
    default: return `${where} - not run yet`;
  }
}

/** One line on the whole session, for the totals: how many scans are done, running, waiting, failed. */
export function totalsOf(rows) {
  const count = (state) => rows.filter((r) => (r.session?.state ?? 'done') === state).length;
  const look = rows.filter((r) => r.needsLook).length;
  const parts = [`${count('done')} of ${rows.length} run`, ...(look ? [`${look} need a look`] : []),
    ...(count('running') ? [`${count('running')} running`] : []), ...(count('queued') ? [`${count('queued')} waiting`] : []),
    ...(count('failed') ? [`${count('failed')} failed`] : [])];
  return parts.join(', ');
}
