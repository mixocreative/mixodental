/**
 * The one job: say how much of the real-scan test tier this machine could actually run.
 *
 *   node scripts/real-scan-tier.mjs
 *
 * WHY THIS EXISTS (2026-11-11 audit, MIXO-08). Seven `describe.skipIf` blocks hold the only proofs
 * that run against real patient scans. The scans are customer data, git-ignored, and present on
 * some machines only - so on a machine without them those blocks vanish, vitest prints a bare
 * "N skipped", and the gate receipt counts `Tests N passed` and nothing else. "222 files, 1626
 * passed" then reads as full coverage on the machine that verified the least.
 *
 * It does NOT fail when a fixture is absent: absence is legitimate, and `gate:real` already fails a
 * run that looked at nothing. It fails only on DRIFT - a skipIf block that is not registered below -
 * because an unregistered block is the silence coming back.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleByContent, sampleScans } from './samples.mjs';
import { DENTURE_PIPELINE, DENTURE_PROFILE, DENTURE_RULE_SPOTS, LARGE_PRINT_ANGLE, OPEN_ARCH } from './samplePins.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/*
 * What a block needs: `pins` (scans pinned by content, scripts/samplePins.mjs - ALL of them
 * for the block to run in full), `category` (any scan of that samples/ category), or `path` (one file).
 */
const TIER = [
  { file: 'src/denture/check/ruleSpots.real.test.ts', needs: { pins: [DENTURE_RULE_SPOTS], label: 'pinned denture #1' }, proves: 'the check follows the denture rules' },
  { file: 'src/denture/engine/dentureCore.test.ts', needs: { pins: [DENTURE_PIPELINE], label: 'the pinned pipeline denture' }, proves: 'the denture pipeline end to end' },
  { file: 'src/denture/steps/supports/rigidMove.real.test.ts', needs: { pins: [DENTURE_RULE_SPOTS], label: 'pinned denture #1' }, proves: 'keep-and-move equals rebuild-after-move' },
  { file: 'typelab/profileSelect.test.ts', needs: { pins: [DENTURE_PROFILE], label: 'pinned denture #0' }, proves: 'the denture review profile' },
  { file: 'scripts/dental-region-review/openArch.test.ts', needs: { pins: OPEN_ARCH, label: 'the 4 pinned open-arch scans' }, proves: 'aligners with no opening contour' },
  { file: 'typelab/reviewCase.test.ts', needs: { pins: [LARGE_PRINT_ANGLE], label: 'the pinned large print-angle scan' }, proves: 'Step 1 evidence after a large print-angle rotation' },
  { file: 'typelab/reviewCase.test.ts', needs: { path: 'samples/case-002/aligner002.stl' }, proves: 'case-002 review row and export' },
];
const labelOf = ({ pins, label, category, path: file }) => (pins ? label : category ? `a samples/${category} scan` : file);

/*
 * `git grep -cF` over the tracked tree: counts the blocks that exist, to compare with the registry.
 * Fixed-string, not a regex: git's ERE wants its parens escaped and the escaping differs per shell,
 * which cost one debugging round. `:(exclude)` keeps this file's own prose out of its own count.
 */
function blocksInTree() {
  const args = ['grep', '-cF', '.skipIf(', '--', 'src', 'scripts', 'typelab', ':(exclude)scripts/real-scan-tier.mjs'];
  const out = execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return out.trim().split('\n').filter(Boolean)
    .reduce((total, line) => total + Number(line.slice(line.lastIndexOf(':') + 1)), 0);
}

const pinPresent = new Map();
const hasPin = (pin) => (pinPresent.has(pin) ? pinPresent.get(pin) : pinPresent.set(pin, Boolean(sampleByContent(pin))).get(pin));
const has = ({ needs }) => (needs.pins ? needs.pins.every(hasPin) : needs.category ? sampleScans(needs.category).length > 0 : existsSync(path.join(ROOT, needs.path)));
const present = TIER.filter(has);
const absent = TIER.filter((row) => !has(row));

console.log(`real-scan tier: ${present.length} of ${TIER.length} blocks can run`);
for (const row of absent) console.log(`  SKIPPED  ${row.proves} - needs ${labelOf(row.needs)} (${row.file})`);
if (absent.length === 0) console.log('  every real-scan block has its fixture.');

const found = blocksInTree();
if (found !== TIER.length) {
  console.error(`\nreal-scan tier: DRIFT - the tree has ${found} skipIf block(s), the registry lists ${TIER.length}.`);
  console.error('  A real-scan block that is not registered here skips without being counted, which is the');
  console.error('  silence MIXO-08 closed. Add it to TIER in this file (or remove the stale row).');
  process.exit(1);
}
