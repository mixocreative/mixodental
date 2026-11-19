// The gate on scripts/shell-guard.mjs.
//
// Every DENY case is a command that was actually run on this machine and actually caused the damage
// named beside it, or the measured mechanism behind it - these are regressions, not inventions. Every
// ALLOW case is a command the project's own docs tell the agent to run, and that half decides whether
// the guard gets obeyed or quietly switched off.
//
// Command fixtures that contain backslashes use String.raw, so what is written here is what the shell
// would receive. Writing `'a\\b'` in an ordinary JS string would test the collapsed form - the very
// confusion the guard is about.
import { describe, expect, it } from 'vitest';
import { interpretedText, judge } from './shell-guard.mjs';

const rule = (command, tool) => judge(command, tool)?.rule ?? null;

describe('the Bash tool eats one backslash level, command-wide', () => {
  it('refuses a doubled backslash, which can never arrive as typed', () => {
    expect(rule(String.raw`printf '%s' 'a\\b'`)).toBe('double-backslash');
    expect(rule(String.raw`sed -i 's/\\d/x/' file.js`)).toBe('double-backslash');
  });

  it('allows a line continuation, which is a backslash with an innocent job', () => {
    expect(rule(['npm run build \\', '  --mode production'].join('\n'))).toBeNull();
  });

  it('does not apply to PowerShell, where both backslashes were measured to survive', () => {
    expect(rule(String.raw`Write-Output 'a\\b'`, 'PowerShell')).toBeNull();
  });
});

describe('a backslash inside interpreter source', () => {
  it('refuses the heredoc that wrote an invisible BEL byte into a committed path', () => {
    const command = ["python - <<'PY'", String.raw`print("S:\ai\mixo-geocore")`, 'PY'].join('\n');
    expect(rule(command)).toBe('backslash-in-interpreted-code');
  });

  it('refuses the same string through -c, which is where the BEL actually came from', () => {
    expect(rule(String.raw`python -c 'import sys; sys.stdout.write("S:\ai")'`)).toBe('backslash-in-interpreted-code');
    expect(rule(String.raw`node -e 'console.log("a\tb")'`)).toBe('backslash-in-interpreted-code');
  });

  it('allows a heredoc with no backslash - the rule is about escapes, not heredocs', () => {
    const command = ["cat <<'EOF' > notes.txt", 'two plain lines', 'of ordinary prose', 'EOF'].join('\n');
    expect(rule(command)).toBeNull();
  });

  it('leaves a backslash outside interpreter source alone', () => {
    expect(rule(String.raw`grep -F 'C:\Users' log.txt`)).toBeNull();
    expect(rule(String.raw`ls 'S:\ai\mixodental'`)).toBeNull();
  });

  it('collects every heredoc body and inline body, and nothing else', () => {
    expect(interpretedText('echo plain')).not.toMatch(/\\/);
    expect(interpretedText(["cat <<'EOF'", 'in body', 'EOF', 'echo after'].join('\n'))).toContain('in body');
    // No terminator parsing on purpose: a second heredoc after the first must not escape the check.
    expect(interpretedText(["cat <<'A'", 'one', 'A', "cat <<'B'", String.raw`two \x`, 'B'].join('\n'))).toContain('\\');
  });
});

describe("PowerShell's escape character is the backtick", () => {
  it('refuses the escapes nobody types on purpose', () => {
    expect(rule('Write-Output "S:`ai"', 'PowerShell')).toBe('powershell-backtick-escape');
    expect(rule('Write-Output "col`vumn"', 'PowerShell')).toBe('powershell-backtick-escape');
  });

  it('allows the escapes a person does mean', () => {
    expect(rule('Write-Output "line one`nline two"', 'PowerShell')).toBeNull();
    expect(rule('Write-Output "a`tb"', 'PowerShell')).toBeNull();
  });

  it('allows single quotes, which are literal in PowerShell', () => {
    expect(rule("Write-Output 'S:`ai'", 'PowerShell')).toBeNull();
  });
});

describe('prose on the command line', () => {
  it('refuses the markdown backticks that committed three messages with empty spans', () => {
    expect(rule('git commit -m "fix(bench): the review was dropping `pipeline.test.ts` rules"')).toBe('prose-argument');
  });

  it('refuses $(...) and $VAR, which are substitution in a double-quoted string', () => {
    expect(rule('git commit -m "built at $(date)"')).toBe('prose-argument');
    expect(rule('git commit -m "on branch $BRANCH"')).toBe('prose-argument');
  });

  it('closes the holes a reviewer named: -am, a global flag, and the sibling subcommands', () => {
    expect(rule('git commit -am "a `b` c"')).toBe('prose-argument');
    expect(rule('git -C S:/ai/mixodental commit -m "a `b` c"')).toBe('prose-argument');
    expect(rule('git tag -m "release `v2`" v2')).toBe('prose-argument');
    expect(rule('git merge --no-ff -m "merge `topic`" topic')).toBe('prose-argument');
    expect(rule('gh pr create --title "x" --body "see `README.md`"')).toBe('prose-argument');
  });

  it('allows the file forms the house rule prescribes', () => {
    expect(rule('git commit -F /tmp/msg.txt')).toBeNull();
    expect(rule('git commit --amend -F /tmp/msg.txt')).toBeNull();
    expect(rule('gh pr create --title "x" --body-file /tmp/body.md')).toBeNull();
  });

  it('allows the few-plain-words carve-out, in either short form', () => {
    expect(rule("git commit -m 'docs: fix a typo'")).toBeNull();
    expect(rule("git commit -am 'wip'")).toBeNull();
  });

  it('refuses a long or an active message even in single quotes', () => {
    expect(rule(`git commit -m '${'x'.repeat(80)}'`)).toBe('prose-argument');
    expect(rule("git commit -m 'fix: do not run `npm test` here'")).toBe('prose-argument');
  });
});

describe('a gate may not be piped', () => {
  it('refuses the two pipes that have already swallowed a gate result', () => {
    expect(rule('npm run walk | tail -5')).toBe('piped-gate');
    expect(rule('npm test | Select-Object -Last 20', 'PowerShell')).toBe('piped-gate');
  });

  it('refuses a pipe behind a redirect, a semicolon that drops the status, and the walk run directly', () => {
    expect(rule('npm run gate:real 2>&1 | tee gate.log')).toBe('piped-gate');
    expect(rule('npm test; echo done')).toBe('piped-gate');
    expect(rule('node scripts/walk.mjs --only=m5b | head -20')).toBe('piped-gate');
  });

  it('allows a semicolon that READS the status, which is the idiom in use here', () => {
    // The guard's second false positive in its first ten minutes. `; echo "exit=$?"` is how a gate's
    // real status gets reported, since the tool itself reports only the last command's.
    expect(rule('npm test > g.log 2>&1; echo "exit=$?"; tail -5 g.log')).toBeNull();
    expect(rule('npm test; Write-Output $LASTEXITCODE', 'PowerShell')).toBeNull();
    // But a pipe is never excused by it: the `$?` would be tail's, not the gate's.
    expect(rule('npm test | tail -5; echo "exit=$?"')).toBe('piped-gate');
  });

  it('allows the full local gate exactly as CLAUDE.md writes it', () => {
    expect(rule('npm run vendor:check && npm test && npm run screens && npm run build && npm run walk')).toBeNull();
  });

  it('allows a gate redirected to a file, which is the prescribed form', () => {
    expect(rule('npm run walk > gate.log 2>&1')).toBeNull();
    expect(rule('npm run walk -- --only=m5b > gate.log 2>&1')).toBeNull();
  });

  it('judges only what comes after the gate', () => {
    expect(rule('echo starting; npm test')).toBeNull();
    expect(rule('npm test || echo failed')).toBeNull();
  });

  it('leaves non-gate pipes alone', () => {
    expect(rule('ls -la | grep walk')).toBeNull();
    expect(rule('git log --oneline -5 | cat')).toBeNull();
  });

  it('ignores a gate name and a bar that are only quoted text', () => {
    // The guard's own first false positive, four minutes into real use: reading the gate's LOG was
    // refused, because `npm test` sat inside an echo and the bar inside a grep pattern. A guard that
    // refuses a legitimate command teaches its owner to switch it off, so this is a regression test.
    expect(rule('echo "=== npm test"; grep -E "Test Files|Tests" gate.log')).toBeNull();
    expect(rule('npm test && echo "a|b"')).toBeNull();
    expect(rule("git commit -F msg.txt && echo 'ran npm test | tail'")).toBeNull();
  });
});

describe('the guard itself', () => {
  it('allows the ordinary commands this session runs all day', () => {
    for (const command of [
      'git status --porcelain',
      'node scripts/geometry-guard.mjs',
      'git log --oneline -1',
      'npm test',
      '',
    ]) {
      expect(rule(command)).toBeNull();
    }
  });

  it('gives every refusal a rule name and an alternative, not just a no', () => {
    const refused = [
      String.raw`printf '%s' 'a\\b'`,
      ["python - <<'PY'", String.raw`print("S:\ai")`, 'PY'].join('\n'),
      'git commit -m "a `b` c"',
      'npm run walk | tail -5',
    ];
    for (const command of refused) {
      const verdict = judge(command);
      expect(verdict?.rule).toMatch(/^[a-z-]+$/);
      // A refusal with no way forward is an obstacle; each of these names the tool or form to use.
      expect(verdict?.reason).toMatch(/Write tool|-F <path>|--body-file|Redirect to a file|single quotes/);
      expect(verdict.reason.length).toBeGreaterThan(80);
    }
  });

  it('never throws, whatever it is handed', () => {
    for (const input of [undefined, null, 0, {}, [], '<<', '<<<', 'git commit -m', '|', ';']) {
      expect(() => judge(input)).not.toThrow();
      expect(() => judge(input, 'PowerShell')).not.toThrow();
    }
  });
});
