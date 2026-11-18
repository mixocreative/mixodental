"""Rebuild the Gemini translation prompt from the i18n guard's own output.

    npx vitest run src/i18n.test.ts > i18n.log 2>&1
    python scripts/buildTranslationPrompt.py i18n.log

WHY THIS IS A SCRIPT AND NOT A HABIT. The missing-string list is kept by the guard, not by a person,
and a hand-kept copy goes stale within a day: the prompt committed on the morning of 2026-11-19 held
51 strings while the guard already wanted 58. Gemini's free tier is TWENTY REQUESTS A DAY, so
sending a stale prompt does not cost a retry - it costs the day, and comes back with translations
that still leave the gate red.

The header of the existing prompt (app context, house-style examples, the Taiwan term list, the
placeholder rule) is kept as written; only the numbered strings are replaced, and the key map is
written beside it so reply line N can be put back on the right key.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PROMPT = ROOT / 'docs' / 'translation' / '2026-11-19-missing-strings.txt'
KEYS = ROOT / 'docs' / 'translation' / '2026-11-19-missing-keys.json'

log = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'i18n.log').read_text(encoding='utf-8')

# vitest prints the received array as `+   "<string>",` lines inside its diff block.
if '+ [' not in log:
    raise SystemExit('no missing-key list in that log: the guard passed, or it failed for another reason')
block = log.split('+ [', 1)[1].split('\n+ ]', 1)[0]
keys = [json.loads(m.group(1)) for m in re.finditer(r'^\+\s+("(?:[^"\\]|\\.)*"),?$', block, re.M)]
if not keys:
    raise SystemExit('the diff block held no strings: has vitest changed how it prints an array?')
if len(keys) != len(set(keys)):
    raise SystemExit('the guard listed a key twice, which should be impossible - look before sending')

header = PROMPT.read_text(encoding='utf-8').split('THE STRINGS:')[0] + 'THE STRINGS:\n\n'
PROMPT.write_text(header + ''.join(f'{i} {k}\n' for i, k in enumerate(keys, 1)), encoding='utf-8', newline='\n')
KEYS.write_text(json.dumps(keys, ensure_ascii=False, indent=1) + '\n', encoding='utf-8', newline='\n')
print(f'{len(keys)} strings -> {PROMPT.relative_to(ROOT)} and {KEYS.relative_to(ROOT)}')
