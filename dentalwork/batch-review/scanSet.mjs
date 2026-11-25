// Copyright (c) Mixo Creative.

/*
 * ONE JOB: which of the files a reviewer was given are cases to run (docs/REVIEWER-OVERHAUL-PLAN.md section 2 step 2,
 * build step 5). The review workbench imports scans itself now - a folder, files, or a pasted path - instead of
 * needing a batch run first.
 *
 * THE RULE: every `.stl` is a case EXCEPT an owner's `-sup.stl` (a scan with someone else's supports on it). Those
 * are reference clues only, never a case or a target (owner's standing rule); the review shows one beside its bare
 * scan (`dentureReviewLayers.ts` ownerSupportsPath), so it is counted, named as a reference, and never run. Anything
 * else is counted as skipped, so "I gave it 12 files and it shows 9" always has its answer on screen.
 *
 * Pure: the server lists the folder, this decides. Scans are read where they are; nothing is copied.
 */

const STL = /\.stl$/i;
const REFERENCE = /-sup\.stl$/i;

/** The file name of a path, either separator. @param {string} path */
export const fileName = (path) => path.split(/[\\/]/).pop() ?? path;

/**
 * @param {readonly string[]} paths every file found (the server walks folders)
 * @returns {{ cases: string[], references: string[], skipped: string[] }} cases sorted by path
 */
export function scanSet(paths) {
  const cases = [];
  const references = [];
  const skipped = [];
  for (const path of [...paths].sort()) {
    if (REFERENCE.test(path)) references.push(path);
    else if (STL.test(path)) cases.push(path);
    else skipped.push(path);
  }
  return { cases, references, skipped };
}

/** One line on what an import found, for the page. @param {{ cases: string[], references: string[], skipped: string[] }} set */
export function scanSetWords({ cases, references, skipped }) {
  if (cases.length === 0) return references.length > 0 ? `No scans to run: only ${references.length} reference file(s) with supports (-sup), which are never run.` : 'No STL files there.';
  const extra = [
    ...(references.length > 0 ? [`${references.length} reference file(s) with supports (-sup) kept as references, not run`] : []),
    ...(skipped.length > 0 ? [`${skipped.length} other file(s) skipped`] : []),
  ];
  return `${cases.length} scan(s) to run${extra.length > 0 ? `; ${extra.join('; ')}` : ''}.`;
}
