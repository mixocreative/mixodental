// Refuses a control byte in any tracked text file.
//
// WHY. On 2026-11-20 `docs/PLAN.md` carried a literal BEL (0x07) in the middle of a Windows path:
// `S:\ai\mixo-geocore` had gone through a non-raw Python string literal, where `\a` IS a BEL. It is
// invisible in a diff, invisible in rendered markdown, and - the expensive part - invisible to the
// Edit tool, which then could not match the string being typed at it. It survived review, a commit
// and a push.
//
// This is the backstop for scripts/shell-guard.mjs rather than a duplicate of it. The guard refuses
// the shell forms that PRODUCE such a byte, which is better because it acts before the damage; but it
// only sees shell commands, and the Write tool can put the same byte in a file with no shell involved.
// This test checks the ARTEFACT, so it does not care which tool was holding the pen.
//
// It cannot catch a `\r?\n` that became a real line break: that is a legal newline and only the
// file's author knows it was meant to be two characters of regex.
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');

/**
 * Extensions scanned. An allowlist, so a new binary format cannot quietly join the scan.
 *
 * `tests/controlChars.test.ts` in mixo-geocore holds the same list and must keep holding it. The shell
 * guard is one shared file so that it cannot drift; this scan cannot be shared that way - two repos,
 * two runners, two roots - so this list is the one thing that can, and on 2026-11-20 it had: six
 * extensions were missing there. Change one, change both.
 */
const TEXT = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'md', 'html', 'css', 'svg',
  'yml', 'yaml', 'toml', 'rs', 'sh', 'ps1', 'txt', 'gitignore', 'npmrc',
]);

/** Tab, line feed and carriage return are the only control bytes a text file has business holding. */
const ALLOWED = new Set([0x09, 0x0a, 0x0d]);
const isControl = (byte) => (byte < 0x20 && !ALLOWED.has(byte)) || byte === 0x7f;

/** A generated file may legitimately embed one, and a fixture may exist to carry one. */
const SKIP = [/^graphify-out\//, /^artefacts\//, /\.min\./, /^vendor\//];

/** Tracked text files, by git's own list - untracked scratch files are nobody's problem. */
function trackedTextFiles() {
  const listing = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return listing
    .split('\0')
    .filter(Boolean)
    .filter((path) => TEXT.has(path.split('.').pop().toLowerCase()))
    .filter((path) => !SKIP.some((pattern) => pattern.test(path)));
}

describe('tracked text files hold no control bytes', () => {
  it('finds the BEL that a Python escape once wrote into a committed path', () => {
    const files = trackedTextFiles();
    // A scan that measured nothing passes vacuously, which is the failure this repo's doctrine names
    // first - so the file count is asserted before the bytes are.
    expect(files.length).toBeGreaterThan(200);

    const found = [];
    for (const path of files) {
      const full = resolve(root, path);
      // shortcut: files over 4 MB are skipped; no hand-written source here is near that, and reading
      // every golden would make this the slowest test in the suite. Raise it if real source grows.
      if (statSync(full).size > 4 * 1024 * 1024) continue;
      const bytes = readFileSync(full);
      for (let at = 0; at < bytes.length; at += 1) {
        if (!isControl(bytes[at])) continue;
        const around = bytes.subarray(Math.max(0, at - 24), at + 24).toString('utf8').replace(/[\x00-\x1f\x7f]/g, '?');
        found.push(`${path}: byte 0x${bytes[at].toString(16).padStart(2, '0')} at offset ${at} near "${around}"`);
        break; // One report per file: the first one names the file, and that is enough to go and look.
      }
    }
    expect(found).toEqual([]);
  });
});
