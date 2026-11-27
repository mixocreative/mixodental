# geocore: the editor's "Clear manual edits" and "Remove supports" need not be red

STATUS: drafted 2026-11-27, NOT SENT (owner approval needed for any geocore request).

**As the operator meets it.** The any-model editor's left panel shows three red-outlined keys stacked (Delete, Clear
manual edits, Remove supports). The house style (mixo-app-style) keeps red for the one destructive action in view; Fable
and Codex both agreed the other two should be neutral, because Undo already brings both back.

**Why the host cannot close it.** Their role is set in `vendor/mixo-geocore/editing/commands.ts:224,228`
(`role: 'destructive'`), which mixodental consumes as built and never edits.

**The ask (generic, placement rule 8).** Make those two commands `role: 'secondary'` (keeping their Undo hints), or let
the host override a command's role per surface. No behaviour change.
