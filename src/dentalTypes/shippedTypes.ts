/*
 * ONE JOB: turn the type files the app was built with into the types it can offer, and say plainly why any other
 * file cannot load (docs/TYPE-PIPELINE.md section 8a, units D1/A1).
 *
 * Pure: the files, the reader's checks and the profiles the app already has are all handed in, so every rule here
 * is tested with in-memory files - no glob, no engine. `typesReady.ts` feeds it the build-time glob of `types/` and
 * registers what it returns in each engine realm.
 *
 * NEVER SILENT, NEVER GENERIC. A file that cannot load goes on the refused list with its reason, which the app shows;
 * it is never dropped quietly and never replaced by the built-in type - an operator who picked "Soft denture" and got
 * Generic numbers without a word is the failure this module exists to prevent.
 *
 * NO PROOF GATE (owner, 2026-11-22: "Do not need prove, make it easier"): a type that reads cleanly loads whether or
 * not its `validation` record matches. The record stays in the file as information.
 */
import { readTypeFile, type TypeFile, type TypeFileDeps } from './typeFile';
import { typeRuleProblem } from './typeRules';
import { savesByType, stampWords } from './typeSaves.mjs';

/** A file the app was built with that it cannot offer, and why. */
export interface RefusedType {
  file: string;
  /** The id from its path, when the path had one. */
  id?: string;
  reason: string;
}

/** Which save of a loaded type is in force, and every save of it (newest first) - the workbench lists them. */
export interface LoadedSave {
  path: string;
  /** '' for an old undated file. */
  stamp: string;
  saves: readonly { path: string; stamp: string }[];
}

export interface DiscoveredTypes {
  loaded: TypeFile[];
  refused: RefusedType[];
  /** By `<category>/<id>`, for each loaded type. */
  inForce: Record<string, LoadedSave>;
}

/**
 * How many older saves are tried when the newest cannot load. ONE: the app ships the newest and one fallback per type
 * (docs/REVIEWER-OVERHAUL-PLAN.md section 6, decision 3f), so trying further here would load a save the built app does
 * not have.
 */
export const FALLBACKS = 1;

/** A profile the app already has (built-in, or loaded earlier in the list): a new type may not share its id or name. */
export interface KnownProfile {
  id: string;
  name: Record<string, string>;
}

/**
 * The types the app can offer from `files` (path -> text), and every file it cannot, with the reason.
 *
 * SAVES ARE APPEND-ONLY (`typeSaves.mjs`): a type may have several files, `<id>.<stamp>.type.json`. Only its NEWEST
 * is offered; when that one cannot load, the save before it is tried (`FALLBACKS`), and the newest stays on the
 * refused list with its reason AND the save used instead - a broken save never silently becomes the older numbers.
 *
 * `known` is the profiles already present; each loaded type joins it, so two types cannot take one id or one name.
 */
export function discoverTypes(files: Readonly<Record<string, string>>, deps: TypeFileDeps, known: readonly KnownProfile[]): DiscoveredTypes {
  const loaded: TypeFile[] = [];
  const refused: RefusedType[] = [];
  const inForce: Record<string, LoadedSave> = {};
  const taken: KnownProfile[] = [...known];
  const { types, strays } = savesByType(Object.keys(files));
  for (const file of strays) refused.push({ file, reason: 'a type file must be types/<category>/<id>.type.json (or <id>.<YYYYMMDD-HHMMSS>.type.json)' });
  for (const { category, id, saves } of types) {
    const failed: RefusedType[] = [];
    for (const save of saves.slice(0, 1 + FALLBACKS)) {
      const reason = refusalOf(files[save.path]!, category, id, deps, taken);
      if (typeof reason === 'string') { failed.push({ file: save.path, id, reason }); continue; }
      const type = reason;
      taken.push({ id: type.id, name: type.profile.name as Record<string, string> });
      loaded.push(type);
      inForce[`${category}/${id}`] = { path: save.path, stamp: save.stamp, saves };
      break;
    }
    const used = inForce[`${category}/${id}`];
    // The newest could not load but an older save did: say which one the operator is getting, in the same row.
    for (const f of failed) refused.push(used ? { ...f, reason: `${f.reason} - using the save of ${stampWords(used.stamp)} instead` } : f);
  }
  return { loaded, refused, inForce };
}

/** `text`, read as the type `<category>/<id>`, or why it cannot be offered. */
function refusalOf(text: string, category: string, id: string, deps: TypeFileDeps, taken: readonly KnownProfile[]): TypeFile | string {
  let type: TypeFile;
  try {
    type = readTypeFile(text, deps).type;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  if (type.category !== category || type.id !== id) return `the file says ${type.category} / ${type.id}, but it sits at ${category} / ${id}`;
  // Since plan E1 a type's graphs and every pinned rule load (typeGraphs.ts, typeRules.ts); a pinned denture option
  // that a unit's control could not start from is the one rule refused, by its reason.
  const ruleProblem = typeRuleProblem(type.rules);
  if (ruleProblem) return ruleProblem;
  if (taken.some((p) => p.id === type.id)) return `another type already has the id "${type.id}"`;
  const name = type.profile.name as Record<string, string>;
  const twin = taken.find((p) => Object.entries(name).some(([lang, text]) => p.name[lang] === text));
  if (twin) return `its name would look the same as "${twin.id}" in the type list`;
  return type;
}
