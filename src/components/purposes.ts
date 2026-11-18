// Copyright (c) Mixo Creative.

import { DENTAL_KINDS, defaultProfileId, kindOfProfile, profileIdsOf, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/**
 * THE ANSWERS TO "WHAT ARE YOU MAKING?" — in one list, and this is the only one.
 *
 * TWO LEVELS, BECAUSE THE ENGINE HAS TWO (owner, 2026-11-18: *"the icons be shown as category
 * dropdown, then each types"*). The structure is already in `@mixo-geocore/host/dental/dentalKind`
 * and this only names it for the UI:
 *
 * - **CATEGORY** is `DentalKind` — aligner or denture. Separate engine pipelines, separate profile
 *   families, separate tool chains. This is what the operator answers.
 * - **TYPE** is a profile id WITHIN a category (`profileIdsOf`): the actual numbers the engine runs
 *   with. Today each family ships exactly one, and the deck briefly showed no type control at all
 *   for that reason — which the owner caught on 2026-11-18: *"deck fail to show type, only show
 *   category, dangerous gap it is."* A single option is still a READOUT of which profile is in
 *   force, and that is not the same thing as a question with one answer. `PurposeSelect` draws it
 *   whenever a category is chosen; a second profile file turns the readout into a choice with no
 *   code change.
 *
 * WHY THIS FILE EXISTS AT ALL. The question is asked in three renderings — the big keys on the entry
 * screen, the case control on the deck, and a per-row control for a file whose answer differs from
 * the rest of its case. Three renderings of one question must not be three copies of its answers.
 *
 * AND BECAUSE THE ANSWERS ARE THE OPEN QUESTION. A night guard and a retainer are neither of these —
 * the commonest chairside object has no true answer here, and the axis may be wrong altogether
 * (shell-with-a-trim-line vs solid body, rather than product). That is open question 4 in
 * `docs/design/2026-11-17-flow-map.md`, and when it settles THIS is what changes.
 *
 * `label` is the English string, which IS the i18n key (`src/i18n.ts`); `icon` names a drawing in
 * `src/ui/assets/art/`.
 */
export interface PurposeCategory {
  readonly kind: DentalKind;
  /** The profile a case of this category starts on: the family's reference profile. */
  readonly id: string;
  /** The English string, and the translation key. */
  readonly label: string;
  /** The art file, for the renderings that show a picture. */
  readonly icon: string;
}

const LABELS: Record<DentalKind, { label: string; icon: string }> = {
  aligner: { label: 'Aligner', icon: 'aligner' },
  denture: { label: 'Denture', icon: 'denture' },
};

/** Every dental category, in the engine's own menu order. */
export const PURPOSE_CATEGORIES: readonly PurposeCategory[] = DENTAL_KINDS.map((kind) => ({
  kind,
  id: defaultProfileId(kind),
  ...LABELS[kind],
}));

/**
 * "Any model" — the answer that means NO DENTAL FLOW at all.
 *
 * It is a category the operator can choose and not a link off to one side, because it is an answer to
 * the same question: *these are not dental work.* It carries no profile, which is why it is kept out
 * of `PURPOSE_CATEGORIES` — every entry there must have a type to detect against. It is also the only
 * door to the bench (`src/scenes/sceneMap.ts` `doors`), so it cannot simply be dropped.
 */
export const ANY_MODEL = { value: 'any', label: 'Any model', icon: 'generic' } as const;

/** The category a profile id belongs to, for a control that has to show what is already chosen. */
export const categoryOf = (profileId: string | undefined): PurposeCategory | undefined =>
  PURPOSE_CATEGORIES.find((category) => category.kind === kindOfProfile(profileId));

/**
 * The types within a category, in card order. One entry today for both families — see the header:
 * the caller draws it anyway, because a single option still names which profile the engine will run.
 */
export const typesOf = (kind: DentalKind): readonly string[] => profileIdsOf(kind);

/**
 * THE BADGE FOR A TYPE: one letter in a rounded box, not a drawing.
 *
 * It WAS a drawing - a pixel letter G on the same 48x48 grid as the aligner and the denture - and
 * the owner's verdict was right: *"the GENERIC G icon is messed up, its ugly, doesnt look like a G,
 * u can just use a badge system, a round cornered badge, G for generic standard items."* A glyph
 * drawn as pixel art is legible at 144px on the entry screen and a smudge at 26px on a row, which
 * is the only size this one is ever shown at.
 *
 * A BADGE IS THE RIGHT SYSTEM FOR A TYPE, and not only for this one. A category is a THING and is
 * drawn as a picture of itself; a type is a NAME, and the letter is the shortest form of the name.
 * Text scales to any size, needs no file, costs nothing to add, and the next profile gets its badge
 * by adding one entry here rather than by someone drawing an icon nobody asked them to draw.
 *
 * The fallback is `G`, because an unlisted profile is a general-purpose one until somebody says
 * otherwise - which is exactly what both of today's profiles are.
 */
const TYPE_BADGES: Readonly<Record<string, string>> = {
  'reference-aligner': 'G',
  'reference-denture': 'G',
};

/** The letter a profile wears on the deck. One or two characters; never a word. */
export const typeBadge = (profileId: string): string => TYPE_BADGES[profileId] ?? 'G';
