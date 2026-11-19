// Shell guard: refuses the shell forms this machine has already corrupted a file or a commit with, at
// the moment the command is composed instead of after the damage is in the tree.
//
// WHY IT IS CODE AND NOT A NOTE. Every rule below was already written down in full, with its exact
// remedy, in the agent's own notes - and was broken anyway on 2026-11-19/20 with those notes loaded
// in context. A rule that must be recalled at the instant a command is typed is not a rule, it is a
// hope. These are decidable from the command string, so they are decided here.
//
// WHAT WAS MEASURED, 2026-11-20, because the note that prompted this guard had the mechanism WRONG.
// The note blamed the heredoc. The heredoc is where it was noticed, not the cause:
//
//   Bash tool    `printf '%s' 'a\\b'` prints `a\b` - inside SINGLE QUOTES, where bash itself cannot
//                collapse anything. So one backslash level is eaten before bash ever parses, for the
//                whole command, heredoc or not. A lone `\` survives (`'S:\ai'` came out intact).
//   Python       `python -c 'sys.stdout.write("S:\ai")'` writes byte 0x07. THAT is what produced the
//                invisible BEL in a committed path, not the shell: a non-raw string literal turning
//                `\a` into BEL. The raw-string form came out clean.
//   PowerShell   `'a\\b'` keeps BOTH backslashes - the collapse is the Bash tool's, not this machine's.
//                But `"S:`ai"` writes 0x07 too, because the backtick is PowerShell's escape
//                character. Same wound, different weapon, which is why the rules are per tool.
//   The hook     receives the command BEFORE the collapse (`a\\b` arrives as typed), which is the only
//                reason rule `double-backslash` can exist at all.
//
// FAIL OPEN, BUT LOUDLY. On an internal error this allows the command and says so on `systemMessage`:
// a guard that can brick the only shell is worse than the mistakes it prevents, but a guard that stops
// guarding silently is the exact failure this project's audit doctrine names first.
//
// WHAT IT DOES NOT COVER, so "handled" is not believed too widely: a bad string written straight to a
// file by the Write tool (scripts/control-chars.test.mjs catches the resulting byte instead); prose
// arguments to tools not listed in PROSE_FLAG; and any gate not in GATE. scripts/README.md carries
// the pair of them under "The mistake guards".
//
// Wiring: a PreToolUse hook on Bash|PowerShell in .claude/settings.json (untracked, like the rest of
// that directory - this script is the tracked, reviewed half). shell-guard.test.mjs is the gate.
// Input: the hook's stdin JSON. Output: a PreToolUse permissionDecision, or nothing to allow.
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** A heredoc opener: `<<TAG`, `<<-TAG`, `<<'TAG'`, `<<"TAG"`, `<<\TAG`. Not `<<<` (a here-string). */
const HEREDOC_OPEN = /<<-?\s*(?:'[^']+'|"[^"]+"|\\?[A-Za-z_]\w*)/;
/** Inline code handed to an interpreter that processes string escapes in its own literals. */
const INLINE_CODE = /\b(?:python3?|node|ruby|perl|php)\b[^\n|;]*\s-(?:c|e)\b/;
/** A backslash that is a shell line continuation, which is harmless and common in long commands. */
const CONTINUATION = /\\\n/g;

/**
 * The text a command hands to an interpreter to read as source: every heredoc body, plus any inline
 * `-c` / `-e` code. Empty string when there is none.
 *
 * Why bodies rather than the whole command: a backslash in `grep -F 'C:\Users'` is fine and common,
 * and a guard that refuses the wrong thing gets worked around instead of obeyed.
 */
export function interpretedText(command) {
  const lines = String(command).split('\n');
  const at = lines.findIndex((line) => HEREDOC_OPEN.test(line));
  // No terminator parsing on purpose: everything after the opener counts as body. An unterminated or
  // multi-heredoc command is exactly the shape where guessing the end would be wrong.
  const heredoc = at < 0 ? '' : lines.slice(at + 1).join('\n');
  const inline = lines.filter((line) => INLINE_CODE.test(line)).join('\n');
  return `${heredoc}\n${inline}`;
}

/** Subcommands whose prose argument has already been eaten by a shell, and the flags that carry it. */
const PROSE_COMMAND =
  /\b(?:git\s+(?:-[^\s]+\s+\S+\s+)*(?:commit|tag|merge|stash\s+push|notes\s+add)|gh\s+(?:pr|issue|release)\s+\w+)\b/;
// `-[A-Za-z]*m` so that the combined short form `git commit -am "..."` is caught too, which a plain
// `-m` misses - it was the first hole a reviewer put a finger through.
const PROSE_FLAG = /(?:^|\s)(?:-[A-Za-z]*m|-b|--message|--body|--notes|--title|--subject)(?:=|\s|")/;
/*
 * The forms that take the text from a file or an editor instead, which is what the house rule wants.
 *
 * `-C` is NOT here, although `git commit -C <commit>` is such a form: it collides with git's GLOBAL
 * `-C <dir>`, so allowing it waved through every `git -C S:/ai/mixodental commit -m "..."` - the shape
 * this session actually types. Found by the test, not by reading. `git commit -C` is rare enough to
 * accept a refusal; `--reuse-message` is its unambiguous spelling.
 */
const PROSE_FROM_FILE = /(?:^|\s)(?:-F|--file|--body-file|--notes-file|--no-edit|--fixup|--reuse-message)\b/;

/** Commands whose exit code and printed counts ARE the evidence, so nothing may stand between. */
const GATE =
  /\b(?:npm\s+(?:run\s+)?(?:test|walk|screens|build|gate:real|vendor:check)|npx\s+vitest|node\s+scripts\/walk\.mjs|cargo\s+test)\b/;
/*
 * A pipe, but not `||` - which needs BOTH guards, because in `||` the second bar has no bar after it
 * and would match a lookahead-only test. `;` is here too: `npm test; echo done` reports echo's status.
 *
 */
const PIPED = /(?<!\|)\|(?!\|)/;

/**
 * The command with quoted spans blanked out, for the gate rule only.
 *
 * WHY, and it took four minutes of real use to find out. The first version tested the raw command, so
 * `echo "=== npm test"; grep -E "Test Files|Tests" log` was refused - the words `npm test` sat inside
 * an echo and the bar inside a grep pattern, and neither was a gate or a pipe. A guard that refuses a
 * legitimate command teaches its owner to switch it off, so quoting is now cheaply accounted for. The
 * other rules keep their quotes, because for them the quoting IS the question.
 *
 * shortcut: `bash -c "npm test | tail"` loses its gate along with the quotes and is allowed. A real
 * tokeniser to catch a shape nobody here types would cost more than the mistake.
 */
const withoutQuotedSpans = (text) => text.replace(/'[^']*'|"[^"]*"/g, '""');

/**
 * The one refusal this command earns, or null. `tool` is the hook's `tool_name`.
 *
 * ONE verdict, not a list: the operator fixes the command and runs it again, so only the first reason
 * is ever read. The order below is by how expensive the mistake is to find later - a corrupted file
 * outlives a mangled commit message, which outlives a gate result that has to be re-run - and the
 * test file pins that order so it cannot drift.
 */
export function judge(command, tool = 'Bash') {
  const text = String(command ?? '');
  const bare = text.replace(CONTINUATION, '\n');

  if (tool === 'Bash' && bare.includes('\\\\')) {
    return {
      rule: 'double-backslash',
      reason:
        'The Bash tool eats one backslash level before bash parses, even inside single quotes (measured: `printf \'%s\' \'a\\\\b\'` prints `a\\b`), so `\\\\` never arrives as typed - `\\\\d` loses its escape and `\\\\r?\\\\n` becomes a real line break in whatever file this writes. Write the file with the Write tool, or Edit for a patch.',
    };
  }

  if (tool === 'Bash' && /\\/.test(interpretedText(bare))) {
    return {
      rule: 'backslash-in-interpreted-code',
      reason:
        "A backslash inside interpreter source is read as an escape by that interpreter, not by the shell: `python -c '...\"S:\\ai\"'` writes a BEL byte, which is invisible in a diff, in rendered markdown and to the Edit tool, so the file silently stops matching the string typed at it. Write the script to the scratchpad with the Write tool and run the file, or use a raw string literal.",
    };
  }

  if (tool === 'PowerShell') {
    // `a`b`e`f`v are escapes nobody types on purpose (BEL, backspace, escape, form feed, vertical tab).
    // `n `r `t are deliberately allowed: they are the ones a person does mean.
    const surprising = bare.match(/"[^"\n]*`[abefv0][^"\n]*"/);
    if (surprising) {
      return {
        rule: 'powershell-backtick-escape',
        reason: `PowerShell's escape character is the backtick, and inside double quotes ${surprising[0].slice(0, 40)} becomes a control byte (measured: "S:\`ai" writes 0x07). Use single quotes, which are literal in PowerShell, or write the text to a file with the Write tool.`,
      };
    }
  }

  if (PROSE_COMMAND.test(bare) && PROSE_FLAG.test(bare) && !PROSE_FROM_FILE.test(bare)) {
    // Same flag pattern as PROSE_FLAG, or the carve-out would miss `-am 'wip'` and refuse a safe message.
    const quoted = bare.match(/(?:-[A-Za-z]*m|-b|--message|--body|--notes|--title|--subject)(?:=|\s+)'([^']*)'/);
    // The carve-out the house rule already allows: "never -m for anything longer than a few plain
    // words". Single quotes are inert in BOTH shells, so a short single-quoted message is safe.
    const safe =
      quoted && quoted[1].length <= 72 && !quoted[1].includes('\n') && !/[`$!]/.test(quoted[1]);
    if (!safe) {
      return {
        rule: 'prose-argument',
        reason:
          'Prose on the command line gets executed: a backtick or `$(...)` in a double-quoted string is command substitution, and markdown backticks have already committed three messages with those spans EMPTY. Write the text to a file with the Write tool and pass the file form (`git commit -F <path>`, `gh pr create --body-file <path>`), then read it back with `git log -1`. A short single-quoted message with no backtick, `$` or `!` is still allowed.',
      };
    }
  }

  // Only what comes AFTER the gate can swallow its status, so `echo starting; npm test` is fine while
  // `npm test; echo done` is not. Testing the whole command would refuse the harmless half.
  const unquoted = withoutQuotedSpans(bare);
  const gate = unquoted.match(GATE);
  const after = gate ? unquoted.slice(gate.index + gate[0].length) : '';
  /*
   * `;` is only dangerous when the status is then DROPPED. `npm test > log 2>&1; echo "exit=$?"` reads
   * it explicitly and is the idiom this session uses all day, so asking for `$?` is what separates the
   * two - and it is read from the raw command, because the quote-stripping above blanks `"exit=$?"`.
   * A pipe is never excused this way: `cmd | tail; echo $?` reports TAIL's status, not the gate's.
   */
  const statusRead = /\$\?|\$LASTEXITCODE/.test(bare);
  if (gate && (PIPED.test(after) || (/;/.test(after) && !statusRead))) {
    return {
      rule: 'piped-gate',
      reason:
        "A gate may not be piped or chained with `;`: the shell returns the LAST command's status, so a FAILING gate reports success, and `tail` / `Select-Object -Last N` throw away the check counts that are the evidence a gate exists to produce. Redirect to a file instead (`npm run walk > gate.log 2>&1`) and read the file.",
    };
  }

  return null;
}

/** Hook wiring, kept at the edge so `judge` stays a pure (string, tool) -> verdict the test drives. */
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  const verdict = judge(input?.tool_input?.command ?? '', input?.tool_name ?? 'Bash');
  if (!verdict) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `shell-guard (${verdict.rule}): ${verdict.reason}`,
      },
    }),
  );
}

// Run only as a script. Importing this file must not RUN it: a tool in this repo once printed its own
// listing and called `process.exit(0)` inside vitest because its main guard compared path suffixes, so
// this one resolves both sides through realpath.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : '';
if (invoked && invoked === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    process.stdout.write(JSON.stringify({ systemMessage: `shell-guard did not run: ${error?.message ?? error}` }));
  });
}
