// Copyright (c) Mixo Creative.

/*
 * ONE JOB: what differs between one scan's run with two types (docs/REVIEWER-OVERHAUL-PLAN.md section 2 step 6, build
 * step 11 - Compare). The stage flips between the two pictures at one camera; this says, in words, which of the run's
 * own numbers moved, so a difference is never only something to spot by eye.
 *
 * It compares the two runs' case rows as the batch wrote them (summary.json), field by field, leaving out what names a
 * run rather than describes it (its files, its folder, its time). Pure; the page lists what it returns.
 */

/** Fields that name a run, not what it did. */
const NOT_A_RESULT = new Set(['case', 'source', 'glb', 'orientationGlb', 'zonesFile', 'orientFile', 'peelFile', 'seconds', 'stageTimes', 'session', 'explanation']);
const isFileField = (key) => /File$|Glb$|Path$|Url$/.test(key);
const plain = (value) => value === null || ['string', 'number', 'boolean'].includes(typeof value);
const shown = (value) => (typeof value === 'number' && !Number.isInteger(value) ? Number(value.toFixed(3)) : value);

/**
 * Every result field whose value differs between `a` and `b` (two case rows of the same scan), in key order. Lists and
 * objects compare by their JSON; numbers to 3 decimals, so float noise is not a difference.
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 * @returns {{ key: string, a: unknown, b: unknown }[]}
 */
export function runDiffs(a, b) {
  const keys = [...new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])].filter((k) => !NOT_A_RESULT.has(k) && !isFileField(k)).sort();
  return keys.flatMap((key) => {
    const x = a?.[key];
    const y = b?.[key];
    const same = plain(x) && plain(y) ? shown(x) === shown(y) : JSON.stringify(x ?? null) === JSON.stringify(y ?? null);
    return same ? [] : [{ key, a: x, b: y }];
  });
}

/** A value as one short line for the compare list. */
export function diffText(value) {
  if (value === undefined || value === null) return '-';
  if (plain(value)) return String(shown(value));
  const text = JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}
