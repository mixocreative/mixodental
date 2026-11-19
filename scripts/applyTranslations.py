"""Put a Gemini reply back onto the right keys in ja.ts and zh-Hant.ts.

    python scripts/applyTranslations.py <reply.txt>            # check and print the triples
    python scripts/applyTranslations.py <reply.txt> --write    # append them to both locale files

WHY THIS IS A SCRIPT. The reply is `N JA:` / `N ZH:` lines whose only link to a key is the number,
and the key map is a separate file - so inserting by hand is 122 chances to put a line on the wrong
key, silently, in a language the reader cannot check at a glance. It also refuses a reply that lost
a placeholder, which is the one defect that cannot be seen by reading the Chinese: `{n}` dropped from
a count leaves a sentence that still reads perfectly and prints the wrong thing.

It does NOT replace reading the triples against the English. Gemini has invented terms on this
project before. The table this prints is for that read; `--write` is the step after it.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
KEYS = ROOT / 'docs' / 'translation' / '2026-11-19-missing-keys.json'
LOCALES = {'JA': ROOT / 'src' / 'locales' / 'ja.ts', 'ZH': ROOT / 'src' / 'locales' / 'zh-Hant.ts'}
PLACEHOLDER = re.compile(r'\{[a-zA-Z]+\}')

# Windows hands Python a cp950 stdout here, which cannot encode a single kana - so the review table
# would die on line 1 of its own output rather than on anything wrong with the reply.
sys.stdout.reconfigure(encoding='utf-8')

reply = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8')
keys = json.loads(KEYS.read_text(encoding='utf-8'))

lines = {}
for match in re.finditer(r'^(\d+)\s+(JA|ZH):\s*(.+?)\s*$', reply, re.M):
    lines[(int(match.group(1)), match.group(2))] = match.group(3)

problems = []
for index, key in enumerate(keys, 1):
    want = sorted(PLACEHOLDER.findall(key))
    for lang in LOCALES:
        text = lines.get((index, lang))
        if text is None:
            problems.append(f'{index} {lang}: missing from the reply')
            continue
        if sorted(PLACEHOLDER.findall(text)) != want:
            problems.append(f'{index} {lang}: placeholders {PLACEHOLDER.findall(text)}, key wants {want}')
extra = sorted(n for n, _ in lines if n > len(keys))
if extra:
    problems.append(f'the reply numbered strings that do not exist: {extra}')

if problems:
    print('\n'.join(problems))
    raise SystemExit(f'{len(problems)} problems - nothing written')

if '--write' not in sys.argv:
    for index, key in enumerate(keys, 1):
        print(f'{index}\nEN: {key}\nJA: {lines[(index, "JA")]}\nZH: {lines[(index, "ZH")]}\n')
    raise SystemExit(0)

banner = sys.argv[sys.argv.index('--write') + 1] if len(sys.argv) > sys.argv.index('--write') + 1 else None


def quoted(text: str) -> str:
    return "'" + text.replace('\\', '\\\\').replace("'", "\\'") + "'"


for lang, path in LOCALES.items():
    source = path.read_text(encoding='utf-8')
    if not source.rstrip().endswith('};'):
        raise SystemExit(f'{path.name} does not end in the dictionary literal')
    body = ''.join(
        f'  {quoted(key)}: {quoted(lines[(index, lang)])},\n' for index, key in enumerate(keys, 1)
        if quoted(key) + ':' not in source
    )
    if not body:
        print(f'{path.name}: every key was already there')
        continue
    head, _, tail = source.rstrip().rpartition('};')
    path.write_text(head + (f'  // {banner}\n' if banner else '') + body + '};' + tail + '\n',
                    encoding='utf-8', newline='\n')
    print(f'{path.name}: {body.count(chr(10))} keys added')
