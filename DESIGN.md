# Design System: mixoDental

Design system for mixoDental, a resin 3D-print support editor for dental work (aligners and dentures).

**Two themes, one default.** The app ships the **instrument** theme (`<html data-theme="instrument">`,
`src/styles/theme.css`) and that is what a reader sees. Underneath it is the **paper** set
(`src/styles.css`), which comes from the owner's `mixo-app-style` and is still reachable by removing the
attribute; the catalogue page switches between them. Everything below describes the instrument theme.
Section 2 ends with the paper values, because a change to a shared token shows in both.

Token source of truth is `src/styles/theme.css` over `src/styles.css`; every token is documented in
`docs/ui-styling.md` and `src/ui/uiStylingDoc.test.ts` fails if one is not. Screen structure, the step
flow and the command registry are in `docs/design/ui-structure.md`. Upload with
`stitch upload design DESIGN.md` only after the owner approves the project, and **never upload a captured
screen that shows a patient scan** — capture the public fixture or the screens gallery instead.

## 1. Visual Theme & Atmosphere

A small studio instrument on a bench. Light hardware body, white screens, deep indigo ink, hairlines on a
strict grid, tiny tracked uppercase caps on every key and heading, machine numerals on every number,
square plates with one small round on the keys. **Flat**: nothing is raised, nothing is shaded, with one
exception — the print-angle dial, which is a turned knob and is meant to read as hardware.

Colour comes from the owner's reference photograph of indigo-dyed peas in a steel pot: the pale cool grey
of the pot, deep indigo ink, a dyed teal, a soft turquoise, a cream pea, and the single red speck in that
photograph — which is the only red in the app, and means alert.

Density is high: the 3D viewport is the room, the panels are the bench. Light only; there is no dark mode.

## 2. Color Palette & Roles

### Primary Foundation
- **Pot Grey (`#eef2f2`)** — `--paper`: the app and panel background.
- **Screen White (`#ffffff`)** — `--surface`: raised controls, bars, toasts, the 3D background.
- **Sunken (`#dde6e6`)** — `--sunken`: hover, a chosen row, a closed panel's title bar.
- **Hairline (`#cbd9da`)** — `--line`, strong `#93aaac` — `--line-strong`: all 1 px borders and dividers.

### Accent & Interactive
Three roles, and no control may invent a fourth.
- **Indigo (`#17334e`, hover `#214b6e`, text on it `#ffffff`)** — `--primary`: the **one** main action of a
  step (Next, OK, Generate). A filled indigo key.
- **Dyed Teal (`#2a8c99`)** — `--accent`: engaged, active, in range, every meter. Marks and fills only;
  **`--accent-strong` (`#1f6e79`)** when the teal has to be read as a word.
- **Pale Pea (`#7cc7c4`)** — `--accent-soft`: a wide quiet range band, the lit ticks inside a stable band,
  the 3 px underline under the engaged tool.
- **Deep Blue Pea (`#244e86`)** — `--selected`: a chosen row, a no-support zone, the second action
  (Regenerate).
- **Brand Teal (`#0d6579`)** — `--brand`: **the wordmark, and nothing else.** Not a control, not a status,
  not a 3D mark. It is the mark itself; spend it anywhere else and it stops meaning anything.

### Typography & Text Hierarchy
- **Ink (`#17334e`)** — `--ink`: body text, headings, the pressed state of a toggle.
- **Muted (`#5a6f7c`)** — `--muted`: captions, counts, units, help lines, dial labels.

### Functional States
- **Signal Red (`#c8372d`)** — `--signal`: **alerts only** — a problem found, or an action that cannot be
  undone. Outline and text, never a fill. Nothing else in the app is red.
- **Warning (`#a96f12`)**, **Success (`#4f8f6b`)**, **Info (= `--selected`)**: these tint a status dot; the
  words carry the meaning.
- **Note Cream (`#e8e2c8`)** — `--note`: the background of a note explaining why something is held.
- A locked panel in a focus mode sits at reduced opacity and is inert.

### The legacy names
`--red`, `--kraft`, `--danger` and `--blue` are mapped onto the roles above at the end of `theme.css`
(`--red: var(--primary)`, `--kraft: var(--accent-soft)`, `--danger: var(--signal)`,
`--blue: var(--selected)`), so no component had to be edited when the theme landed. Style the role, not
the legacy name.

### The paper set underneath (`src/styles.css`)
Paper `#f4f2ed`, surface `#fbfaf7`, sunken `#ebe8e1`, ink `#3b3631`, muted `#8a847a`, lines `#dcd7cd` /
`#c4bdb0`, Mixo Red `#7f0019`, Zone Navy `#1d3461`, Kraft `#b59f78`, Danger `#b3261e`. Radius 2px.

## 3. Typography Rules

**Two bundled faces, and only two** — the Latin ones, because they are the part of the interface that is
identical in every language:

- **Atkinson Hyperlegible Next** (400 / 500 / 700) — every Latin word and **every number**. It is drawn so
  that the characters a reader can confuse (0 and O, 1 and l and I, 6 and 8) stay apart, which is what a
  dentist needs on a measurement. It carries tabular figures, so a column of numbers lines up under
  `font-variant-numeric: tabular-nums` and no second face is needed.
- **Instrument Serif** (400) — the title, the one place a serif appears.

**Kana, kanji and Chinese characters come from the reader's own machine.** No CJK face is bundled: every
one worth having is tens of megabytes, and a clinic's machine already has a good one. Japanese and
Traditional Chinese name their platform faces in their own order, because the kanji forms differ —
**Chinese must never fall back to a Japanese face.** `Shippori Mincho B1` leads the Japanese serif (the
owner's choice, used when installed).

Six stacks: `--font-ui` / `-ja` / `-zh`, `--font-title` / `-ja` / `-zh`; `--font-number` = `--font-ui`.
`src/i18n.ts` sets `documentElement.lang` on every switch and `:lang()` picks the stack.

### The three text styles
1. **Title** — `--title-size` 30px, serif, weight 400, `--title-track` −.01em, sentence case, never
   tracked, never uppercased. **One per screen**, and it names the screen. Class `.title`.
2. **Header** — four levels, sans, tracked uppercase caps: `--h1-size` 13px (the app), `--h2-size` 12px (a
   screen), `--h3-size` 11px (a group), `--label-size` 10.5px at `--label-track` .14em (a field label).
3. **Content** — sans, sentence case: `--body-size` 12.5px at `--body-line` 1.65, small print
   `--small-size` 11.5px.

## 4. Component Stylings

Every panel in the app is a `Panel` and every labelled control is a `Field`. There is no second way to
draw either, so a change here reaches the whole app.

- **Panel** (`src/components/Panel.tsx`) — a titled block. The title is a **solid bar**: `--panel-title-bg`
  (ink) with `--panel-title-ink` (paper) on it when open, and the plainly lighter
  `--panel-title-bg-closed` / `--panel-title-ink-closed` when closed, so open and closed are told apart at
  a glance. Four shapes from two choices: `collapsible` (false = always there) and `defaultOpen` / caller-
  owned `open` + `onToggle`. `columns={2|3}` lays the body out in columns and drops to one by itself in a
  narrow panel (a container query, not a media query). A panel stands 8 px clear of what is above it —
  further than its own rows stand apart — so a title reads as the head of what follows it.
- **Field** (`src/components/Field.tsx`) — one control with its label. `row` (label left, control right) or
  `stack` (label on top); a `row` field stacks itself in a narrow panel. `grouped` for a control that is
  several controls, `readOnly` for a value with nothing to change. The field styles whatever is inside it:
  a typed value gets an underline and right-aligned tabular figures, a slider and a segmented switch take
  the width, an `<output>` and a unit `<small>` stay beside them.
- **Button** — square (`--radius` 0) except keys, which take `--radius-key` 3px. `.primary` is a filled
  indigo key with white tracked caps, one per view. The default is quiet: a hairline on surface.
  `.danger` is signal-red outline and text, never filled. A pressed toggle fills with ink; a pressed
  **segment** also takes a 3 px `--accent-soft` underline — the one place the accent sits under a key.
- **Segmented** — joined segments inside a hairline box, uppercase tracked caps.
- **Print-angle dial** (`src/ui/parts/TiltDial.tsx`) — the one piece of hardware. A turned indigo knob
  (`--dial-face` → `--dial-face-shade` gradient, two soft shadows) on a 240° tick ring; ticks inside the
  stable band light `--accent-soft`. The current angle is a large white number in the middle of the knob,
  with the degree sign raised to the cap line. `--dial-size` (168px) sizes everything; a triangular index
  points from the knob. It is a real ARIA slider: arrows step, Home and End jump to the ends.

## 5. Layout Principles

- Base spacing unit **8px**; panel bodies and field stacks use 10px / 4px within it.
- **`--radius: 0`** — plates, panels and bands are square. Only keys are rounded, at 3px.
- Hairlines are always exactly 1px, `--line` or `--line-strong`; there are no 2px rules.
- Shell: a header bar, a left panel (objects, plate, transform), the viewport, a right panel (settings), a
  status footer. The dental steps take the whole width (`.workspace--dental`) and dock their own side
  panel on the right from **721px** up; below that it sits along the bottom.
- Panels are **CSS containers** (`container-type: inline-size`), so a panel decides its own column count
  and whether its fields stack. Window-width media queries are the exception, not the rule.
- Motion is `--dur` .12s on colour only. Nothing slides, nothing bounces.
- Layouts are checked at 900×700 and 1280×800, and at 721px where the step panel docks.

## 6. Stitch Generation Notes

**Atmosphere keywords**: studio instrument, bench tool, flat, hairline grid, square plates, tracked
uppercase micro-caps, machine numerals, dense rows, light only, one accent, one alert colour.

**Canonical colours**: Pot Grey `#eef2f2`, Screen White `#ffffff`, Sunken `#dde6e6`, Hairline `#cbd9da`,
Indigo `#17334e`, Dyed Teal `#2a8c99`, Pale Pea `#7cc7c4`, Deep Blue Pea `#244e86`, Note Cream `#e8e2c8`,
Signal Red `#c8372d`, Brand Teal `#0d6579` (wordmark only), Muted `#5a6f7c`.

**Component prompts**

- *Panel*: "A square block on a pale grey body. Its heading is a solid deep-indigo bar with white
  letter-spaced uppercase micro-caps; when the block is closed the bar is pale grey with indigo letters.
  Rows of controls sit under it on a hairline grid, no shadows, no rounded corners."
- *Field*: "One label and one control on a line, label left in sentence case, control right. A typed value
  is right-aligned on a single hairline underline with no box. A slider fills the width with its value
  pinned beside it."
- *Step screen*: "A full-width 3D viewport with one narrow panel docked right, 300px wide, 14px clear of the
  edge. The step names itself in a small badge over the viewport, not in the panel. The panel is a column of
  solid-bar blocks; its last block is pinned to the bottom and holds a quiet Back button and one filled
  indigo key with uppercase micro-caps. Flat, light, dense, a single teal accent."

## 7. How a step is laid out, and the one place it is inconsistent

A step names itself in an `.edit-badge` over the viewport ("Step 0 - Aligner type", and a bold line under it
saying what to do). The panel carries no title of its own; its first block is the first thing to read, which
makes the ORDER of the blocks the step's hierarchy.

Denture Step 2 is the shape to copy, and the owner's reference style (the aligner tilt step: one bar, one big
number, Back | Next):

1. the verdict, one sentence with a coloured dot
2. **Details** - opens the counts, the parts and the check's findings
3. **Adjust** - folded, and it remembers whether it was open; the settings live in here
4. the footer: Restore step, Add another, Back | OK

Aligner Step 3 answers the same question in the opposite order: Support settings, then Edit supports, then
Problems, then the footer. The verdict is third, under two blocks of controls, so a reader who opens the step
to learn whether the build is sound reads the sliders first and has to scroll for the answer. Bringing it
onto the denture Step 2 shape is an open design decision for the owner, not a bug.
