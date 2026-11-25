// Copyright (c) Mixo Creative.

/*
 * ONE JOB: a type being worked on in the review workbench - the type as it was OPENED (`base`, never changed) and as
 * edited (`draft`) - and what an edit, a restore and a duplicate do to it (docs/REVIEWER-OVERHAUL-PLAN.md section 3c-3e,
 * build step 3).
 *
 * RESTORE GOES TO WHAT WAS SAVED (owner, 2026-11-25: "restore value goes to what saved previous setup were, but not the
 * node's default"). The baseline of every value is `base`: the opened type's own saved value, the built-in's when a
 * built-in was opened. A graph parameter's baseline is the opened type's GRAPH (`zoneStandard` / `orientStandard`, the
 * standard graph `defaultParam` in nodeGraph.mjs already takes), so its node's value comes first and the kind's default
 * only when that node is not in the saved graph.
 *
 * A BUILT-IN IS READ-ONLY (plan decision 9): it is code, not a file. Duplicating it gives an editable type whose
 * baseline is still the built-in's values.
 *
 * Pure and plain JavaScript: the review page imports it as a browser module (the server maps `/src/dentalTypes/` so
 * `typeText.mjs` resolves), and its tests run under Node.
 */
import { canonical, typeDigest } from '../../src/dentalTypes/typeText.mjs';
import { defaultGraph as zoneDefaultGraph } from './nodeGraph.mjs';
import { defaultGraph as orientDefaultGraph } from './orientGraph.mjs';

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));
const same = (a, b) => JSON.stringify(canonical(a ?? null)) === JSON.stringify(canonical(b ?? null));

/** The type as an editable draft: no proof record and no hand override, as `typeFile.ts` draftOf does. */
function withoutProof(type) {
  const { proved: _proved, ...rest } = clone(type);
  return { ...rest, validation: null };
}

/**
 * Open a catalog entry (`typeCatalog.ts`) for work.
 * @param {{ category: string, id: string, builtIn: boolean, path: string | null, stamp: string, type: object }} entry
 */
export function openDraft(entry) {
  return { category: entry.category, id: entry.id, builtIn: entry.builtIn, savedFrom: entry.path, stamp: entry.stamp, base: clone(entry.type), draft: withoutProof(entry.type) };
}

/** The value at a dotted path in an object ('pose.tiltMaxDeg'), or undefined. */
const at = (object, path) => path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), object);
/** A copy of `object` with `path` set to `value` (deleted when `value` is undefined). */
function setAt(object, path, value) {
  const [key, ...rest] = path.split('.');
  const copy = { ...(object ?? {}) };
  if (rest.length > 0) copy[key] = setAt(copy[key], rest.join('.'), value);
  else if (value === undefined) delete copy[key];
  else copy[key] = value;
  return copy;
}

/** Profile keys that NAME the type rather than set how it prints: never an edit to restore, never part of a run's print. */
const NAMING = ['id', 'name'];

/**
 * The draft after one edit. A built-in refuses every edit, naming the way out.
 * `change` is one of: `{ rule, value }` (value undefined = back to the engine's default), `{ profile: 'pose.tiltMaxDeg',
 * value }`, `{ zoneGraph }`, `{ orientGraph }`, `{ name }`, `{ badge }` (badge '' = none).
 */
export function editDraft(state, change) {
  if (state.builtIn) throw new Error(`${state.id} is a built-in type and is read-only - Duplicate it to edit`);
  const draft = { ...state.draft };
  if ('rule' in change) {
    const rules = { ...draft.rules };
    if (change.value === undefined) delete rules[change.rule]; else rules[change.rule] = change.value;
    draft.rules = rules;
  } else if ('profile' in change) {
    if (NAMING.includes(change.profile.split('.')[0])) throw new Error(`the profile's ${change.profile} is the type's name - rename the type instead`);
    draft.profile = setAt(draft.profile, change.profile, change.value);
  } else if ('zoneGraph' in change) draft.zoneGraph = clone(change.zoneGraph);
  else if ('orientGraph' in change) {
    if (change.orientGraph) draft.orientGraph = clone(change.orientGraph); else delete draft.orientGraph;
  } else if ('name' in change) {
    const name = String(change.name).trim();
    if (name === '') throw new Error('a type needs a name');
    draft.profile = { ...draft.profile, name: { en: name, ja: name, 'zh-Hant': name } };
  } else if ('badge' in change) {
    if (change.badge) draft.badge = change.badge; else delete draft.badge;
  } else throw new Error(`unknown edit ${JSON.stringify(Object.keys(change))}`);
  return { ...state, draft };
}

/** The value Restore puts back for a rule or a profile path: the opened type's own; undefined = the engine's default. */
export const restoreRule = (state, rule) => state.base.rules?.[rule];
export const restoreProfile = (state, path) => at(state.base.profile, path);
/** The graph a zone / Orient parameter restores against (nodeGraph.mjs `defaultParam`'s `standard`): the opened type's. */
export const zoneStandard = (state) => state.base.zoneGraph ?? zoneDefaultGraph();
export const orientStandard = (state) => state.base.orientGraph ?? orientDefaultGraph();

/** Every leaf path where two profiles differ, the naming keys left out. */
function profileDiffs(a, b, prefix = '') {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  return [...keys].sort().flatMap((key) => {
    if (!prefix && NAMING.includes(key)) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    const x = a?.[key];
    const y = b?.[key];
    const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
    if (isObject(x) || isObject(y)) return profileDiffs(isObject(x) ? x : {}, isObject(y) ? y : {}, path);
    return same(x, y) ? [] : [path];
  });
}

/**
 * What the draft changes from the opened type, one line each - the page's "edited" mark and "before your edits"
 * banner read it. Keys: `rule:<name>`, `profile:<path>`, `zoneGraph`, `orientGraph`, `name`, `badge`.
 */
export function changes(state) {
  const { base, draft } = state;
  const rules = [...new Set([...Object.keys(base.rules ?? {}), ...Object.keys(draft.rules ?? {})])].sort()
    .filter((rule) => !same(base.rules?.[rule], draft.rules?.[rule])).map((rule) => `rule:${rule}`);
  return [
    ...rules,
    ...profileDiffs(base.profile, draft.profile).map((path) => `profile:${path}`),
    ...(same(base.zoneGraph ?? zoneDefaultGraph(), draft.zoneGraph ?? zoneDefaultGraph()) ? [] : ['zoneGraph']),
    ...(same(base.orientGraph ?? orientDefaultGraph(), draft.orientGraph ?? orientDefaultGraph()) ? [] : ['orientGraph']),
    ...(same(base.profile?.name, draft.profile?.name) ? [] : ['name']),
    ...(same(base.badge, draft.badge) ? [] : ['badge']),
  ];
}

/**
 * Duplicate the type being worked on under a new id and name: its current draft (edits included) becomes a new,
 * editable, unsaved type. The baseline stays the source's saved values, so Restore still means "as it was saved".
 * `basedOn` names the source. Renaming an id is this, never an in-place change: projects store the id (plan 3e).
 */
export function duplicateDraft(state, { id, name }) {
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(id ?? '')) throw new Error('a type id is lower-case letters, digits, dots and dashes');
  if (id === state.id) throw new Error(`the copy needs an id other than ${state.id}`);
  const label = String(name ?? '').trim() || id;
  const rename = (type) => ({ ...clone(type), id, basedOn: state.id, profile: { ...clone(type.profile), id, name: { en: label, ja: label, 'zh-Hant': label } } });
  return { category: state.category, id, builtIn: false, savedFrom: null, stamp: '', base: rename(state.base), draft: { ...rename(state.draft), validation: null } };
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
