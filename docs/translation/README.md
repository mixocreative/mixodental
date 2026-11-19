# Finishing the Japanese and Taiwan Chinese strings

Everything needed is in this folder. **It is one Gemini request**, and the reason this page exists
is that the request is scarce: the free tier is **twenty a DAY**, so a wasted one costs half a day.

## The rule this folder is built around

**Never send a probe.** On 2026-11-19 a one-word "reply with OK" spent the last request of the day
and the real payload came back `429 … retry in 12h18m`. Send the real file first; if it fails, you
have lost nothing you would not have lost anyway.

**Never hand-write zh-Hant.** Owner's standing rule: Taiwan wording comes from Gemini, never from
me, and never mainland terms.

## The files

| file | what it is |
|---|---|
| `2026-11-19-missing-strings.txt` | the whole prompt: the app's context, four house-style examples with their shipped translations, the Taiwan term list, the placeholder rule, and all the English strings numbered |
| `2026-11-19-missing-keys.json` | the same strings in the same order, as a JSON array — this is the key map, so reply line *N* belongs to key `[N-1]` |

**Rebuild both rather than trusting them**, because they go stale within a day: the copy committed
on the morning of 2026-11-19 held 51 strings while the guard already wanted 58, and sending it would
have spent the day's request on a set that still left the gate red.

```bash
npx vitest run src/i18n.test.ts > /tmp/i18n.log 2>&1; python scripts/buildTranslationPrompt.py /tmp/i18n.log
```

The guard prints every missing key; the prompt is built from that output, never kept by hand.

## The steps

1. Send it, once:

```bash
python ~/.config/gemini/gemini_chat.py --file docs/translation/2026-11-19-missing-strings.txt --out reply.txt
```

2. **Check it and read it**, before anything is written:

```bash
python scripts/applyTranslations.py reply.txt
```

   That refuses a reply that lost a placeholder - the one defect reading cannot catch, because a
   count with `{n}` dropped still reads perfectly and prints the wrong thing - and prints the
   English, Japanese and Chinese as triples for the read. **Do the read.** Gemini has invented terms
   on this project before: it produced "Code Coverage" where the source said "test counts", and on
   this run it turned "only the type default is offered" into "only the type default is applied".

3. Then write them in, with a one-line note saying which batch they are:

```bash
python scripts/applyTranslations.py reply.txt --write "2026-11-19: what this batch was for"
```

4. **The glossary guard decides the terms, not the reply.** `npx vitest run src/glossary.test.ts`
   checks every translation against `src/glossary.ts`, and on this run it caught four: 支撐頭 written
   as 頂端, 書き出 as エクスポート, 塗刷 as 繪製, and オーバーハングの縁 as エッジ. Substituting the
   glossary's own term is the one way zh-Hant may be corrected by hand here - the table is the
   owner's and already shipped elsewhere in the file. Anything beyond a term goes back to Gemini.

5. `npm run fonts` when the Japanese uses a character the cut subset lacks — `src/ui/japaneseSubset.test.ts`
   says so loudly, and the 61 strings of 2026-11-19 needed it (646 characters, four new).

6. Then the real gate:

```bash
npm run vendor:check && npm test && npm run screens && npm run build && npm run walk
```

The walk must print `ALL PASS`. `SOME PASS` is not a pass of this gate.
