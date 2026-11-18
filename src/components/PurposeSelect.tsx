// Copyright (c) Mixo Creative.

import { ANY_MODEL, PURPOSE_CATEGORIES, categoryOf, typeIcon, typesOf } from './purposes';
import { PurposeMenu, type PurposeOption } from './PurposeMenu';
import { t } from '../i18n';
import { profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { type Lang } from '../i18n';

/**
 * THE PURPOSE QUESTION AS A DENSE CONTROL: the category's picture with a dropdown over it, and a
 * second dropdown for the type when the category has more than one.
 *
 * WHY NOT THE BIG KEYS. They are right on the entry screen, where the operator has nothing in front
 * of them and is choosing with pictures. On the deck they sit above a list that routinely runs to
 * twenty-four rows, and three pieces of pixel art there push the work off the screen to re-ask a
 * question whose answer is usually one word. Owner, 2026-11-18: *"it wont make sense to keep the
 * buttons above if u showed the deck, instead the icons be shown as category dropdown, then each
 * types."*
 *
 * BOTH LEVELS ARE PICTURE MENUS, and that is a change of pattern made on purpose.
 *
 * It was the house's invisible-native-select pattern (`LanguageSelect`, `.lang-select`): a real
 * `<select>` laid over a picture, so the list, the keyboard and the screen-reader announcement were
 * the platform's. The cost of that pattern is the one thing this control needed: the popup is drawn
 * by the operating system from `<option>` TEXT, so the list could never show the pictures the entry
 * screen teaches the categories with. Owner, 2026-11-18: *"can we also hv icon in dropdown of job
 * category."* `PurposeMenu` is the hand-built listbox that pays for the platform behaviour by hand;
 * its own header lists what it had to buy back.
 *
 * THE TYPE IS ALWAYS SHOWN, AND HIDING IT WAS A SAFETY DEFECT.
 *
 * It used to render only when a category had more than one profile, on the reasoning that a control
 * over a one-item list is a question with a single answer. That reasoning is right about QUESTIONS
 * and wrong about this: the type is not only a question, it is the statement of which profile the
 * engine will run - the pillar diameter, the contact size, the tilt rule, every number that decides
 * whether the print survives the plate. Each family ships one profile today, so the deck showed the
 * category alone and the operator could not see what they were about to print with. Owner,
 * 2026-11-18: *"deck fail to show type, only show category, dangerous gap it is."*
 *
 * A one-item list is a perfectly good READOUT. It names what is in force, it is in the same place
 * the second profile will appear, and it costs one select. The day a second profile file lands it
 * becomes a choice with no code change - which is what the old reasoning was actually protecting.
 */
export function PurposeSelect({ value, lang, ui, onChange, onAnyModel }: {
  /** The profile this case or row is on, or undefined when nothing has been answered. */
  value: string | undefined;
  lang: Lang;
  /**
   * This control's own stable name, e.g. `case-purpose` or `items-purpose-u-a`. It is a PROP because
   * the control is drawn once per case and once per row, and every `data-ui` on a page must be
   * unique - the house rule for designers, and `ItemsPage.test.tsx` fails when it is broken. It
   * caught this exact control repeating `purpose-select` down a list of rows.
   */
  ui: string;
  /** A dental answer: the category's own type, or a type within the category already chosen. */
  onChange: (profileId: string) => void;
  /**
   * "Any model" was chosen: these are not dental work. Absent on a control where that is not an
   * answer — a single ROW inside a dental case cannot become "not dental"; the case can.
   */
  onAnyModel?: () => void;
}) {
  const category = categoryOf(value);
  const typeList = category ? typesOf(category.kind) : [];
  /** A profile's own name, in the reader's language, for the type list. */
  const typeName = (id: string): string => {
    const names = category?.kind === 'denture' ? dentureProfileData(id).name : profileData(id).name;
    return names[lang] ?? names.en;
  };

  /** The categories, plus "Any model" where that is an answer this control may give. */
  const categories: readonly PurposeOption[] = [
    ...PURPOSE_CATEGORIES.map((entry) => ({ value: entry.id, label: t(entry.label), icon: entry.icon })),
    ...(onAnyModel ? [{ value: ANY_MODEL.value, label: t(ANY_MODEL.label), icon: ANY_MODEL.icon }] : []),
  ];
  const choose = (next: string) => (next === ANY_MODEL.value ? onAnyModel?.() : onChange(next));
  /* The profile names come from the engine already translated, so they are NOT i18n keys. */
  const types: readonly PurposeOption[] = typeList.map((id) => ({ value: id, label: typeName(id), icon: typeIcon(id) }));

  return <span className="purpose-select" data-ui={ui}>
    <PurposeMenu options={categories} value={value === undefined ? undefined : category?.id}
      ui={`${ui}-category`} label={t('What are you making?')} onChoose={choose} />
    {/*
      WHICH PROFILE IS IN FORCE. Drawn whenever a category is - see the header: one option is a
      readout, not a question, and the operator may not be left guessing which numbers are about to
      shape their supports. `Set all` passes no value, so it stays a category control and this stays
      out of the way there; "Any model" has no profile and so has no type.
    */}
    {category !== undefined ? <PurposeMenu options={types} value={value}
      ui={`${ui}-type`} label={t('Which type')} onChoose={onChange} /> : null}
  </span>;
}
