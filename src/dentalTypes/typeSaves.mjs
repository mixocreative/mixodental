// Copyright (c) Mixo Creative.

/*
 * ONE JOB: from the names of the saved type files, which save of each type is the newest, and which one to fall back
 * to (docs/REVIEWER-OVERHAUL-PLAN.md section 3f; owner, 2026-11-25).
 *
 * Saves are APPEND-ONLY: every Save writes `types/<category>/<id>.<YYYYMMDD-HHMMSS>.type.json` (UTC, so the names
 * sort in time order) and never touches an older file. The newest save of a type is the one in force; deleting it is
 * the rollback; older saves stay for reuse. "Newest" comes from the NAME, never the file's time: git does not keep
 * file times, so every checkout would stamp them all "now".
 *
 * A file named the old way, `<id>.type.json`, still loads, as that type's OLDEST save - so nothing written before
 * this rule is lost or reordered.
 *
 * Plain JavaScript on purpose: the app (`typesReady.ts`, through `shippedTypes.ts`) and the review workbench's
 * server (`serve.mjs`, plain Node) both read this one rule, so the two can never disagree on which save is in force.
 */

/** The stamp a save carries: UTC date and time, `YYYYMMDD-HHMMSS` (benchwork `stampNow` writes the same). */
export const STAMP = /^\d{8}-\d{6}$/;

/** `<category>/<id>[.<stamp>].type.json` at the end of a path, wherever the glob or the folder roots it. */
const SAVE_PATH = /(?:^|[\\/])types[\\/]([^\\/]+)[\\/]([^\\/]+)\.type\.json$/;
const DATED = /^(.+)\.(\d{8}-\d{6})$/;

/**
 * An id that ends like a stamp is refused, or `soft.20261125-210430.type.json` could mean two things: the type
 * "soft" saved at that time, or an undated type with that whole id. The reader (`typeFile.ts`) refuses such an id.
 * @param {string} id
 */
export const idLooksDated = (id) => DATED.test(id);

/**
 * What one path names: its category, the type id and the save's stamp ('' for an undated, old-style file), or null
 * when the path is not a type file at all.
 * @param {string} path
 * @returns {{ category: string, id: string, stamp: string } | null}
 */
export function saveOf(path) {
  const at = SAVE_PATH.exec(path);
  if (!at) return null;
  const [, category, stem] = at;
  const dated = DATED.exec(stem);
  return dated ? { category, id: dated[1], stamp: dated[2] } : { category, id: stem, stamp: '' };
}

/**
 * Every type's saves, newest first, grouped by category and id; and every path that is not a type file.
 * Two files of one type with the same stamp cannot happen from Save (it stamps to the second and refuses a twin),
 * but a hand copy could: the later path in sort order wins, so the choice is still the same on every machine.
 * @param {readonly string[]} paths
 * @returns {{ types: { category: string, id: string, saves: { path: string, stamp: string }[] }[], strays: string[] }}
 */
export function savesByType(paths) {
  const groups = new Map();
  const strays = [];
  for (const path of [...paths].sort()) {
    const save = saveOf(path);
    if (!save) { strays.push(path); continue; }
    const key = `${save.category}/${save.id}`;
    if (!groups.has(key)) groups.set(key, { category: save.category, id: save.id, saves: [] });
    groups.get(key).saves.push({ path, stamp: save.stamp });
  }
  const types = [...groups.values()].sort((a, b) => `${a.category}/${a.id}`.localeCompare(`${b.category}/${b.id}`));
  // Newest first: '' (undated) sorts below every stamp. A stable sort keeps the later path first for equal stamps.
  for (const type of types) type.saves.reverse().sort((a, b) => b.stamp.localeCompare(a.stamp));
  return { types, strays };
}

/**
 * The file name the next save of `id` takes, at `stamp`.
 * @param {string} id
 * @param {string} stamp
 */
export function saveName(id, stamp) {
  if (!STAMP.test(stamp)) throw new RangeError(`a save stamp is YYYYMMDD-HHMMSS, not "${stamp}"`);
  if (idLooksDated(id)) throw new RangeError(`a type id may not end like a save stamp: "${id}"`);
  return `${id}.${stamp}.type.json`;
}

/**
 * Why a new save of a type must be refused, or null. `newest` is the type's newest save's stamp (null: none saved);
 * `opened` is the stamp of the save the editor opened (null: the draft is new to the page - a built-in's edit or a
 * duplicate). A save may only follow the newest: anything else would hide a save the person never saw (owner,
 * 2026-11-25: "what if user forget to ask reviewer to read from it and just create new and save").
 * @param {{ id: string, newest: string | null, opened: string | null }} input
 */
export function saveRefusal({ id, newest, opened }) {
  if (newest === null) return null;
  if (opened === null) return `a saved type "${id}" already exists (${stampWords(newest)}) - open it from the type list, or give this one another id`;
  if (opened !== newest) return `"${id}" has a newer save (${stampWords(newest)}) than the one you opened (${stampWords(opened)}) - saving would hide it. Open the newest first, or save under another id`;
  return null;
}

/**
 * Why a draft would clash with ANOTHER type the app loads, or null - asked BEFORE a save is written. The app refuses a
 * type whose id is a built-in's, and a type whose name reads the same as one loaded earlier in any language
 * (`shippedTypes.ts` refusalOf). Checked only after writing, a copy that kept the opened type's name was refused - or,
 * sorting first, got the OTHER type refused - while the page said both load (Fable, 2026-11-26). `others` is every
 * type the workbench lists ({ id, builtIn, names: { en, ja, ... } }); the draft's own id is the same type, not a clash.
 * @param {{ id: string, names: Record<string, string>, others: readonly { id: string, builtIn: boolean, names: Record<string, string> }[] }} input
 */
export function clashRefusal({ id, names, others }) {
  if (others.some((o) => o.builtIn && o.id === id)) return `"${id}" is a built-in type and is read-only - give the new type its own id`;
  for (const other of others) {
    if (other.id === id) continue;
    const lang = Object.keys(names).find((l) => names[l] && other.names?.[l] === names[l]);
    if (lang) return `its name "${names[lang]}" is already "${other.id}"'s in the type list - the app would refuse one of them. Give it its own name`;
  }
  return null;
}

/** How a save's stamp reads to a person: `25 Nov 2026 21:04 UTC`, or "an undated save". @param {string} stamp */
export function stampWords(stamp) {
  if (!STAMP.test(stamp)) return 'an undated save';
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(stamp.slice(4, 6)) - 1];
  return `${Number(stamp.slice(6, 8))} ${month} ${stamp.slice(0, 4)} ${stamp.slice(9, 11)}:${stamp.slice(11, 13)} UTC`;
}
