// Copyright (c) Mixo Creative.

/*
 * ONE JOB: a type file <-> the review workbench's editors (docs/REVIEWER-OVERHAUL-PLAN.md section 3c-3e, build steps
 * 3, 8 and 12). The page OPENS a type by putting its values into the editors (`editsOfType`), and makes the DRAFT -
 * what Apply runs and Save writes - from the editors back (`typeOfEdits`). Both live here, pure, so the rules have
 * tests; the page only reads and writes its fields.
 *
 * THE EDITORS' FORM: the print-angle search (`pose`) and the Rim tab's numbers (`placement`) are held as EDITS MEASURED
 * AGAINST THE BUILT-IN - how the page has always held them - so the built-in is "no edit". The rules and both graphs are
 * held whole.
 *
 * RESTORE GOES TO WHAT WAS SAVED (owner, 2026-11-25): the opened type's own values in this same form are the page's
 * restore baseline (`savedBaseline`), and a graph parameter restores against the opened type's graph through
 * nodeGraph.mjs `defaultParam` (the test below holds the R1b trap).
 *
 * A NEW ID IS A NEW TYPE (plan 3e): editing a built-in, a Duplicate, or renaming an id all give a type based on the
 * opened one (`basedOn`); the opened one is never changed - projects store its id.
 *
 * Plain JavaScript: the page imports it as a browser module (the server maps `/src/dentalTypes/` so `typeText.mjs`
 * resolves), and its tests run under Node.
 */
import { canonical, typeDigest } from '../src/dentalTypes/typeText.mjs';
import { defaultGraph as zoneDefaultGraph } from './nodeGraph.mjs';
import { defaultGraph as orientDefaultGraph } from './orientGraph.mjs';

const same = (a, b) => JSON.stringify(canonical(a ?? null)) === JSON.stringify(canonical(b ?? null));
/** The keys in `keys` where `from` sets a value the built-in does not. */
const diff = (keys, from, builtIn) => Object.fromEntries(keys.filter((k) => from?.[k] !== undefined && from[k] !== builtIn?.[k]).map((k) => [k, from[k]]));

/**
 * A type file's values in the editors' form. `poseKeys` / `placementKeys` are the keys the editors show.
 * @returns {{ name: string, pose: object, placement: object, rules: object, zoneGraph: object, orientGraph: object }}
 */
export function editsOfType(type, builtIn, { poseKeys, placementKeys }) {
  return {
    name: type.profile?.name?.en ?? type.id,
    pose: diff(poseKeys, type.profile?.pose, builtIn?.profile?.pose),
    placement: diff(placementKeys, type.profile?.placement, builtIn?.profile?.placement),
    rules: { ...type.rules },
    zoneGraph: type.zoneGraph ?? zoneDefaultGraph(),
    orientGraph: type.orientGraph ?? orientDefaultGraph(),
  };
}

/**
 * The draft: the OPENED type with the editors' values, as one whole type file. Keys no editor shows are kept from the
 * opened type, so opening and applying with no edit gives back the same type (and the same run print). A graph equal to
 * the standard one is written as none, as the engine reads it.
 * @param {{ opened: { id: string, builtIn: boolean, category: string, type: object }, builtIn: object,
 *   edits: { pose: object, placement: object, rules: object, zoneGraph: object, orientGraph: object },
 *   id: string, name: string, badge: string, poseKeys: string[], placementKeys: string[] }} input
 */
export function typeOfEdits({ opened, builtIn, edits, id, name, badge, poseKeys, placementKeys }) {
  const base = opened.type;
  const denture = opened.category === 'denture';
  const merged = (keys, editsPart, from, builtInPart) => {
    const out = { ...from };
    for (const key of keys) { const value = editsPart[key] ?? builtInPart?.[key]; if (value === undefined) delete out[key]; else out[key] = value; }
    return out;
  };
  const shownName = name.trim() || id;
  // The same name keeps the type's own three-language name; a new one is the typed text in every language.
  const profileName = shownName === (base.profile?.name?.en ?? base.id) ? base.profile.name : { en: shownName, ja: shownName, 'zh-Hant': shownName };
  const { proved: _proved, badge: _badge, orientGraph: _orient, ...rest } = base;
  const zone = denture && !same(edits.zoneGraph, zoneDefaultGraph()) ? edits.zoneGraph : (denture ? null : base.zoneGraph);
  const orient = denture && !same(edits.orientGraph, orientDefaultGraph()) ? edits.orientGraph : null;
  return {
    ...rest, id, validation: null,
    basedOn: opened.builtIn || id !== opened.id ? opened.id : base.basedOn,
    ...(badge.trim() ? { badge: badge.trim() } : {}),
    profile: { ...base.profile, id, name: profileName,
      ...(denture ? { pose: merged(poseKeys, edits.pose, base.profile?.pose, builtIn?.profile?.pose),
        placement: merged(placementKeys, edits.placement, base.profile?.placement, builtIn?.profile?.placement) } : {}) },
    rules: { ...edits.rules },
    zoneGraph: zone,
    ...(orient ? { orientGraph: orient } : {}),
  };
}

/**
 * A run's fingerprint of a type: what decides its result - the profile without its naming keys, the rules, both
 * graphs (absent = the standard one). A rename or a new badge keeps it; any setting changes it. The result cache keys
 * on it, so undoing an edit finds the earlier result again.
 */
export function runPrint(type) {
  const { id: _id, name: _name, ...profile } = type.profile ?? {};
  // The standard graph written out and "no graph" run the same (zoneGraphParity.test.ts), so they print the same.
  const zoneGraph = type.zoneGraph && !same(type.zoneGraph, zoneDefaultGraph()) ? type.zoneGraph : null;
  const orientGraph = type.orientGraph && !same(type.orientGraph, orientDefaultGraph()) ? type.orientGraph : null;
  return typeDigest(JSON.stringify(canonical({ category: type.category, profile, rules: type.rules ?? {}, zoneGraph, orientGraph })));
}
