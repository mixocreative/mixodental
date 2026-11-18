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
python ~/.config/gemini/gemini_chat.py --file docs/translation/2026-11-19-missing-strings.txt --out /tmp/reply.txt
```

2. The reply is `N JA: …` / `N ZH: …` for every N. Insert by key into `src/locales/ja.ts` and
   `src/locales/zh-Hant.ts`, matching N to `2026-11-19-missing-keys.json[N-1]`.
3. **Read every line against the English.** Gemini has invented terms on this project before — it
   produced "Code Coverage" where the source said "test counts" and flipped an unpaid order to paid.
   Check every placeholder survived exactly: `{n} {name} {saved} {reason}`.
4. `npm run fonts` if the Japanese uses a character the cut subset lacks — `src/ui/japaneseSubset.test.ts`
   says so loudly.
5. Then the real gate:

```bash
npm run vendor:check && npm test && npm run screens && npm run build && npm run walk
```

The walk must print `ALL PASS`. `SOME PASS` is not a pass of this gate.
