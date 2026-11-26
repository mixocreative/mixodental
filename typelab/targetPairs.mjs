// Copyright (c) Mixo Creative.

/*
 * ONE JOB: which imported scans have a supported target (`-sup`) to be compared with, and which files were left
 * without a partner - and why. Pure: paths in, pairs out. Lining a pair up is geometry and is NOT done here
 * (scripts/extract-sup-contacts.py, later the engine; docs/GEOCORE-BOUNDARY.md rules 1 and 6).
 *
 * THE RULE (owner, 2026-11-26): a target is the scan's own name with `-sup` before the extension, in the SAME folder.
 * `-sup` is the only part of a file name that means anything; nothing else in a name is read (owner, 2026-11-27).
 *
 * TRAP: the matcher reads STL only. A pair where either side is a GLB/glTF is not silently dropped as "no target" - it
 * is listed in `unsupported` with that reason, so the page can say why it was not compared.
 */
import { fileName, SCAN_FILE } from './scanSet.mjs';

const TARGET = /-sup\.(stl|glb|gltf)$/i;
const STL = /\.stl$/i;
const folderOf = (path) => path.slice(0, path.length - fileName(path).length);
const stemOf = (name) => name.replace(/\.(stl|glb|gltf)$/i, '');

/**
 * @param {readonly string[]} paths every file found (the server walks folders); non-scans are ignored
 * @returns {{ pairs: {scan: string, target: string}[], unsupported: {scan: string, target: string, reason: string}[],
 *   noTarget: string[], orphanTargets: string[] }} each list sorted by path
 */
export function targetPairs(paths) {
  const scans = [...paths].filter((p) => SCAN_FILE.test(p)).sort();
  const targets = scans.filter((p) => TARGET.test(p));
  const used = new Set();
  const pairs = [];
  const unsupported = [];
  const noTarget = [];
  for (const scan of scans) {
    if (TARGET.test(scan)) continue;
    const want = (folderOf(scan) + stemOf(fileName(scan)) + '-sup').toLowerCase();
    const found = targets.filter((t) => (folderOf(t) + stemOf(fileName(t))).toLowerCase() === want);
    if (found.length === 0) { noTarget.push(scan); continue; }
    found.forEach((t) => used.add(t));
    const stlTarget = found.find((t) => STL.test(t));
    if (STL.test(scan) && stlTarget) pairs.push({ scan, target: stlTarget });
    else unsupported.push({ scan, target: found[0], reason: 'the target matcher reads STL files only' });
  }
  return { pairs, unsupported, noTarget, orphanTargets: targets.filter((t) => !used.has(t)) };
}
