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

/** A file the app was built with that it cannot offer, and why. */
export interface RefusedType {
  file: string;
  /** The id from its path, when the path had one. */
  id?: string;
  reason: string;
}

export interface DiscoveredTypes {
  loaded: TypeFile[];
  refused: RefusedType[];
}

/** A profile the app already has (built-in, or loaded earlier in the list): a new type may not share its id or name. */
export interface KnownProfile {
  id: string;
  name: Record<string, string>;
}

/**
 * Why v1 refuses whole groups of types - each named where the next step will lift it. A type's zone and Orient graphs
 * load since plan E1 (`typeGraphs.ts` checks them with the engine and puts them in force per job); its rules do not yet.
 */
export const NOT_YET = {
  rules: (names: string[]) => `the app cannot apply a type's own rules yet (${names.join(', ')}): each unit's settings are its rules today, so these would be ignored`,
} as const;

/** `types/<category>/<id>.type.json`, wherever the glob roots it. */
const PATH = /(?:^|\/)types\/([^/]+)\/([^/]+)\.type\.json$/;

/**
 * The types the app can offer from `files` (path -> text), in path order, and every file it cannot, with the reason.
 * `known` is the profiles already present; each loaded type joins it, so two files cannot take one id or one name.
 */
export function discoverTypes(files: Readonly<Record<string, string>>, deps: TypeFileDeps, known: readonly KnownProfile[]): DiscoveredTypes {
  const loaded: TypeFile[] = [];
  const refused: RefusedType[] = [];
  const taken: KnownProfile[] = [...known];
  for (const file of Object.keys(files).sort()) {
    const at = PATH.exec(file);
    const refuse = (reason: string) => refused.push({ file, ...(at ? { id: at[2] } : {}), reason });
    if (!at) { refuse('a type file must be types/<category>/<id>.type.json'); continue; }
    const [, category, id] = at;
    let type: TypeFile;
    try {
      type = readTypeFile(files[file]!, deps).type;
    } catch (error) {
      refuse(error instanceof Error ? error.message : String(error));
      continue;
    }
    if (type.category !== category || type.id !== id) { refuse(`the file says ${type.category} / ${type.id}, but it sits at ${category} / ${id}`); continue; }
    const pinned = Object.keys(type.rules);
    if (pinned.length > 0) { refuse(NOT_YET.rules(pinned)); continue; }
    if (taken.some((p) => p.id === type.id)) { refuse(`another type already has the id "${type.id}"`); continue; }
    const name = type.profile.name as Record<string, string>;
    const twin = taken.find((p) => Object.entries(name).some(([lang, text]) => p.name[lang] === text));
    if (twin) { refuse(`its name would look the same as "${twin.id}" in the type list`); continue; }
    taken.push({ id: type.id, name });
    loaded.push(type);
  }
  return { loaded, refused };
}
