// Copyright (c) Mixo Creative.

/*
 * ONE JOB: which of the files a reviewer was given are cases to run (docs/REVIEWER-OVERHAUL-PLAN.md section 2 step 2,
 * build step 5). The review workbench imports scans itself now - a folder, files, or a pasted path - instead of
 * needing a batch run first.
 *
 * THE RULE: every model file the app opens (STL, GLB, glTF - SCAN_FILE) is a case EXCEPT an owner's `-sup` file (the
 * same scan with supports from the owner's dental software). Since 2026-11-26 that file is the TARGET a rebuild works
 * toward (samples/README.md), but it is NEVER RUN: read as a case, its hundreds of support pieces look like parts of
 * the scan. The review shows one beside its bare scan (`dentureReviewLayers.ts` ownerSupportsPath), so it is counted,
 * named as a target, and never run. Anything else is counted as skipped, so "I gave it 12 files and it shows 9"
 * always has its answer on screen. (The field keeps its old name, `references`.)
 *
 * Pure: the server lists the folder, this decides. Scans are read where they are; nothing is copied.
 */

/** A scan file: the formats the app imports (its acceptModelFile; scanSet.test.ts holds the two together). */
export const SCAN_FILE = /\.(stl|glb|gltf)$/i;
const REFERENCE = /-sup\.(stl|glb|gltf)$/i;

/** The file name of a path, either separator. @param {string} path */
export const fileName = (path) => path.split(/[\\/]/).pop() ?? path;

/**
 * TRAP: the reviewer WRITES .glb files (every result, into typelab/output). Now that a GLB can be a scan, a folder
 * of results imported by mistake would run the review's own drawings as scans - `isResult` (the server passes "under
 * typelab/output") counts those as results instead.
 * @param {readonly string[]} paths every file found (the server walks folders)
 * @param {(path: string) => boolean} [isResult] true for a file the reviewer wrote
 * @returns {{ cases: string[], references: string[], results: string[], skipped: string[] }} cases sorted by path
 */
export function scanSet(paths, isResult = () => false) {
  const cases = [];
  const references = [];
  const results = [];
  const skipped = [];
  for (const path of [...paths].sort()) {
    if (!SCAN_FILE.test(path)) skipped.push(path);
    else if (isResult(path)) results.push(path);
    else if (REFERENCE.test(path)) references.push(path);
    else cases.push(path);
  }
  return { cases, references, results, skipped };
}

/** One line on what an import found, for the page. @param {{ cases: string[], references: string[], results?: string[], skipped: string[] }} set */
export function scanSetWords({ cases, references, results = [], skipped }) {
  const resultWords = `${results.length} review result file(s) (typelab/output) - those are drawings the reviewer made, not scans`;
  if (cases.length === 0) {
    if (references.length > 0) return `No scans to run: only ${references.length} supported target file(s) (-sup), which are never run.`;
    return results.length > 0 ? `No scans to run: only ${resultWords}.` : 'No scan files there (STL, GLB or glTF).';
  }
  const extra = [
    ...(references.length > 0 ? [`${references.length} supported target file(s) (-sup) kept aside, not run`] : []),
    ...(results.length > 0 ? [`${resultWords}, skipped`] : []),
    ...(skipped.length > 0 ? [`${skipped.length} other file(s) skipped`] : []),
  ];
  return `${cases.length} scan(s) to run${extra.length > 0 ? `; ${extra.join('; ')}` : ''}.`;
}
