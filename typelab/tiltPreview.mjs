/*
 * ONE JOB: the rules of the tabs 4 and 5 live preview (docs/WORKBENCH-TABS-PLAN.md D3) that need no engine and no
 * page: what a preview carries (from the engine's tilt scan and the tips at its pick), and what the page says about it.
 * tiltPreviewRun.ts writes `tiltPreviewOf`; viewer.html draws it with these words. Tested in tiltPreview.test.ts.
 *
 * THE PREVIEW NEVER CLAIMS A BUILD. It is the search and the tips, not the pillars: a tip "with a path" has a free
 * rod to the plate at the normal clearance, which is what the search judges - whether the build then makes that
 * pillar is Apply's answer. Every sentence here says preview, and says what Apply adds.
 */

/** A tip's path state (dentureTilt.ts TipPathState) -> the page's status token and its words. */
export const TIP_STATES = {
  path: { token: '--success', words: 'with a path to the plate' },
  fallback: { token: '--warning', words: 'only at the last-resort clearance' },
  none: { token: '--danger', words: 'with no path' },
  unknown: { token: '--muted', words: 'not judged' },
};

/** One decimal, as the run's own summary labels an angle (`tiltLabel`). */
const deg = (value) => Math.round(value * 10) / 10;

/**
 * What a preview carries, from the engine's tilt scan (`TiltScan`) and the tips at its pick (display space, or null
 * when they could not be placed on the model on screen). Small on purpose: the page needs the pick, why, the angles
 * and the tips - not the rotations or the trap report.
 */
export function tiltPreviewOf(scan, tips) {
  if (scan.kind !== 'scan') return { kind: 'failed', reason: scan.reason };
  const picked = scan.rows[scan.order[0]];
  const counts = { path: 0, fallback: 0, none: 0, unknown: 0 };
  for (const tip of tips ?? []) counts[tip.state in counts ? tip.state : 'unknown'] += 1;
  return {
    kind: 'scan',
    startDeg: deg(scan.startDeg),
    pickedDeg: picked ? deg(picked.tiltDeg) : null,
    reason: scan.reason,
    band: scan.band ? [deg(scan.rows[scan.band[0]].tiltDeg), deg(scan.rows[scan.band[1]].tiltDeg)] : null,
    rows: scan.rows.map((row) => ({ tiltDeg: deg(row.tiltDeg), robust: row.robust, failed: [...new Set(row.failed.map((f) => f.rule))] })),
    tips,
    counts,
  };
}

/** The pick's reason in plain words (TiltPickReason). */
const REASON_WORDS = {
  robust: 'a robust angle (its neighbours pass too)',
  passing: 'an angle that passes, though not robustly',
  failing: 'no angle passes - the least bad one',
  unknown: 'no reason given',
};

/**
 * The line under the tab while a preview is shown. `tab` is 'support' (tab 4) or 'angle' (tab 5); `ranDeg` is the
 * angle the run on screen picked (null when it picked none); `pending` while a newer preview is still running.
 */
export function tiltPreviewNote(preview, { tab, ranDeg = null, pending = false }) {
  if (!preview) return pending ? 'Previewing your settings: the search and its tips, a few seconds…' : '';
  if (preview.kind === 'failed') return `Preview: the search found no angle (${preview.reason}). Apply would say the same.`;
  const moved = ranDeg !== null && preview.pickedDeg !== ranDeg ? ` (the run on screen picked ${ranDeg}°)` : '';
  const head = `Preview with your settings: the search picks ${preview.pickedDeg}°${moved}, ${REASON_WORDS[preview.reason] ?? preview.reason}.`;
  const tail = pending ? ' A newer preview is running.' : ' Nothing is built until Apply.';
  if (tab === 'angle') return `${head}${tail}`;
  if (preview.tips === null) return `${head} Its tips cannot be placed on this review's model: run it once with Apply, then the preview draws them.${tail}`;
  const c = preview.counts;
  const parts = ['path', 'fallback', 'none', 'unknown'].filter((k) => c[k] > 0).map((k) => `${c[k]} ${TIP_STATES[k].words}`);
  // Its own sentence already says nothing is built, so the general tail would say it twice.
  return `${head} ${preview.tips.length} tips at that angle${parts.length ? `: ${parts.join(', ')}` : ''}. Pillars come with Apply - a preview never builds them.${pending ? tail : ''}`;
}
