/*
 * ONE JOB: the list of every type the review workbench can open - each category's built-in, and the save in force of
 * every saved type - with what could not load and why (docs/REVIEWER-OVERHAUL-PLAN.md section 2 step 1, build step 2).
 *
 * Pure: the discovered types (`discoverTypes`, the APP's own rule, so the workbench and the app never disagree on
 * which save is in force) and the built-in profiles are handed in. `typeCatalogRun.ts` feeds it the repo's `types/`
 * folder and the vendored built-ins; the server (`serve.mjs` GET /types) runs that script.
 *
 * Every entry carries its WHOLE type file (`type`): that is what the workbench edits as a draft, and what Restore
 * returns a value to (owner, 2026-11-25: "restore value goes to what saved previous setup were").
 */
import type { DiscoveredTypes, RefusedType } from '../src/dentalTypes/shippedTypes';
import type { TypeCategory, TypeFile } from '../src/dentalTypes/typeFile';

export interface CatalogEntry {
  category: TypeCategory;
  id: string;
  /** The English display name: the workbench is English only (owner, 2026-11-25). */
  name: string;
  badge: string;
  /** A built-in is code, not a file: shown read-only, "Duplicate to edit" (plan decision 9). */
  builtIn: boolean;
  /** The save in force: its repo path and stamp ('' for an undated file); null and '' for a built-in. */
  path: string | null;
  stamp: string;
  /** Every save of the type, newest first, repo paths - the reviewer offers older ones to reopen. */
  saves: { path: string; stamp: string }[];
  type: TypeFile;
}

export interface Catalog {
  types: CatalogEntry[];
  refused: RefusedType[];
}

/**
 * The badge a built-in wears in the app: `G` for both of today's (src/components/purposes.ts TYPE_BADGES). Read from
 * there it would load the app's type registry into this process, so it is written once here, with that pointer.
 */
const BUILT_IN_BADGE = 'G';

const repoPath = (path: string) => path.replace(/^[\\/]+/, '');

/** The catalog: built-ins first in each category, then saved types by id. */
export function catalogOf(discovered: DiscoveredTypes, builtIns: Readonly<Record<TypeCategory, readonly Record<string, unknown>[]>>): Catalog {
  const types: CatalogEntry[] = [];
  for (const category of Object.keys(builtIns).sort() as TypeCategory[]) {
    for (const profile of builtIns[category]) {
      const id = String(profile.id);
      types.push({
        category, id, name: (profile.name as Record<string, string>).en ?? id, badge: BUILT_IN_BADGE, builtIn: true, path: null, stamp: '', saves: [],
        // A built-in as a type file: its own profile, no pinned rules, the standard graphs (null / absent).
        type: { typeFile: 1, category, id, basedOn: id, profile, rules: {}, zoneGraph: null, validation: null },
      });
    }
    for (const type of discovered.loaded.filter((t) => t.category === category).sort((a, b) => a.id.localeCompare(b.id))) {
      const save = discovered.inForce[`${category}/${type.id}`];
      types.push({
        category, id: type.id, name: (type.profile.name as Record<string, string>).en ?? type.id, badge: type.badge ?? BUILT_IN_BADGE, builtIn: false,
        path: save ? repoPath(save.path) : null, stamp: save?.stamp ?? '',
        saves: (save?.saves ?? []).map((s) => ({ path: repoPath(s.path), stamp: s.stamp })), type,
      });
    }
  }
  return { types, refused: discovered.refused.map((r) => ({ ...r, file: repoPath(r.file) })) };
}
