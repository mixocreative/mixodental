# `src/ui` — the pieces a designer edits

24 files. Not the app's screens (those are `src/components`) — the small shared pieces whose point is
that **a designer can change them without reading TypeScript.**

## Replace-the-file pieces

| file | its one job |
|---|---|
| `Icon.tsx` | an icon drawn from `src/ui/assets/icons/<name>.svg`. **Replace the file to replace the icon** |
| `Art.tsx` | coloured pixel art from `src/ui/assets/art/<name>.svg`, same rule |
| `iconCatalogue.ts` | what every icon file *is*: the slot it draws in, where it came from, and where the operator meets it |
| `iconSvg.ts` | makes one icon file safe to render inline beside the others (it scopes class names, which is why two raw Illustrator exports on one page do not paint each other) |

## Theme and colour

| file | its one job |
|---|---|
| `theme.ts` | which theme the app wears: the instrument theme, or the alternative |
| `tokenColour.ts` | a CSS colour token as a number for the 3D view, so the scene takes its palette from the stylesheet |
| `useTokenRevision.ts` | re-renders a component when a colour token changes |

## Shared controls and layout

| file | its one job |
|---|---|
| `ChoiceKey.tsx` | one key for "pick one of these" — the start screen's big choices, the aligner types |
| `ScreenHeading.tsx` | the heading every screen gets, so no screen ships without one |
| `useSlowJob.ts` | the "this is taking a while" state for jobs that run again and again as the reader works |

## Why it is shaped this way

- **An asset is a file, not code.** Icons and art are SVG files on disk with a catalogue beside
  them. A designer replaces a file; nobody edits a component. The owner has already done this for
  real — hand-drawn Illustrator files dropped in and rendered with no code change.
- **Two traps a hand-drawn file brings**, both learned the hard way and both handled in `iconSvg.ts`:
  Illustrator's `.st0` class names make two raw exports on one page paint each other, and the raw
  x/y of a rect carrying a transform must never be rounded — it moves the shape.
- **Colour lives in one place.** `tokenColour.ts` is how the 3D view reads the same tokens the
  panels use. A hex literal anywhere here is a drift waiting to happen.
- **`ScreenHeading` exists so a screen cannot ship headless.** `ScreenHeading.test.tsx` counts the
  screens that use it and fails if the count collapses, which is what catches a glob that has
  stopped matching anything.

## Rules for editing here

1. A new icon is a file in `src/ui/assets/icons/` plus a line in `iconCatalogue.ts`. No inline SVG
   in a component.
2. No colour literals. Add a token to `src/styles.css`, document it in `docs/ui-styling.md`, read it
   through `tokenColour.ts`.
3. Every element gets a unique stable `data-ui` name.
4. Text here is English **and English is the translation key** — a new string needs its `ja` and
   `zh-Hant` entries, Taiwan wording for zh-Hant, or `i18n.test.ts` fails.
