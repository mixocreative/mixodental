// Finds the owner's local sample scans; the one place in the code that knows how samples/ is laid out.
//
// samples/<category>/<type>/<file> - category is the kind of item (aligner, denture, retainer), type
// the owner's sub-kind (`g` = generic until other types are found). A `-sup` file is the same scan
// WITH a supported structure: a target, never run as a case (samples/README.md). Everything is
// git-ignored patient data, read in place.
//
// TRAP - THE FOLDERS KEEP CHANGING. The owner adds, moves and renames scans as fixtures (2026-11-26:
// case-aligner/ became aligner/g/ and the retainers moved out). So:
//   - search a category at ANY depth, so a new type folder, or none, needs no code change;
//   - never pick a scan by its position in a list - the list grows. A test that needs ONE particular
//     scan pins it by content with `sampleByContent`, which survives a rename or a move and keeps the
//     file name (patient data) out of the code.
// `root` exists for the module's own test; every caller leaves it at samples/.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCAN_FILE } from '../typelab/scanSet.mjs';

export const SAMPLES = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'samples');
const SUPPORTED = /-sup\.[^.\\/]+$/i;

/** Every scan-format file under `dir`, any depth, sorted by path so runs list them in a stable order. */
function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const path = join(at, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (SCAN_FILE.test(entry.name)) found.push(path);
    }
  };
  walk(dir);
  return found.sort((a, b) => relative(dir, a).localeCompare(relative(dir, b)));
}

/** The category folders this machine has (aligner, denture, retainer, ...); [] with no samples/. */
export function sampleCategories(root = SAMPLES) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

/** Every scan file of a category, the `-sup` targets included. */
export const sampleFiles = (category, root = SAMPLES) => filesUnder(join(root, category));

/** The scans of a category that can be run as cases: the `-sup` targets left out. */
export const sampleScans = (category, root = SAMPLES) => sampleFiles(category, root).filter((path) => !SUPPORTED.test(path));

/**
 * The sample with exactly these bytes, wherever it now lives, or undefined when this machine lacks it.
 * Only files of the right size are hashed, so the search stays cheap as samples/ grows.
 */
export function sampleByContent({ bytes, sha256 }, root = SAMPLES) {
  for (const path of filesUnder(root)) {
    if (statSync(path).size !== bytes) continue;
    if (createHash('sha256').update(readFileSync(path)).digest('hex') === sha256) return path;
  }
  return undefined;
}
