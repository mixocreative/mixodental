/*
 * ONE JOB: make the dental types the app was built with known to THIS realm's engine, before its first task.
 *
 * WHY EVERY REALM. The app runs the engine on the main thread and in several workers (`src/workers/factories.ts`),
 * each with its own wasm instance and its own host profile list. A type registered on the main thread only would be
 * listed in the type picker and unknown in the worker that runs it. So `main.tsx` and every worker entry await
 * `typesReady()` IN PLACE OF `geometryReady()` - `typesReady.test.ts` fails if one of them names `geometryReady`.
 *
 * It resolves to the same engine `geometryReady()` gives, so it is a drop-in. Registration runs once per realm.
 *
 * The files come from a build-time glob of `types/*` + `/*.type.json` (docs/TYPE-PIPELINE.md section 8a): the folder IS
 * the list. Adding a file needs no code change; in development, saving one reloads the page.
 */
import { geometryReady, type GeometryEngine } from '@mixo-geocore/host/workers/geometryClient';
import { HOST_GEOMETRY_VERSION } from '@mixo-geocore/host/geometryVersion.js';
import { allAlignerProfiles, parseAlignerProfile } from '@mixo-geocore/host/dental/alignerProfiles';
import { allDentureProfiles, parseDentureProfile } from '@mixo-geocore/host/dental/dentureProfiles';
import { registerDentureProfile } from '@mixo-geocore/host/dental/registerProfile';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { NOT_YET, discoverTypes, type DiscoveredTypes, type KnownProfile, type RefusedType } from './shippedTypes';
import { profileText, type TypeFileDeps } from './typeFile';

const FILES = import.meta.glob('/types/*/*.type.json', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/**
 * The reader's checks as the app runs them. `src/` imports nothing from `benchwork/` or `dentalwork/`: a graph is
 * refused outright (the app cannot run one yet) and pinned rules are refused by `discoverTypes`, so neither the
 * workbench's graph validator nor its per-category rule table is needed here.
 */
export const APP_TYPE_DEPS: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  unreadBy: () => [],
  graphProblems: () => [NOT_YET.graph],
  engineVersion: HOST_GEOMETRY_VERSION,
};

/** Every profile this realm already has, so a type cannot take an existing id or name. */
const knownProfiles = (): KnownProfile[] => [...allDentureProfiles(), ...allAlignerProfiles()]
  .map((p) => ({ id: p.id, name: p.name as unknown as Record<string, string> }));

let found: DiscoveredTypes = { loaded: [], refused: [] };
const badges = new Map<string, string>();

/**
 * Discover the types in `files` and register each one with this realm's engine and host. A type the engine refuses
 * moves to the refused list with the engine's reason - it is never half-registered (`registerProfile.ts` is all or
 * nothing). Exported for tests; the app calls it through `typesReady`.
 */
export function registerTypes(files: Readonly<Record<string, string>>): DiscoveredTypes {
  const discovered = discoverTypes(files, APP_TYPE_DEPS, knownProfiles());
  const refused: RefusedType[] = [...discovered.refused];
  const loaded = discovered.loaded.filter((type) => {
    try {
      registerDentureProfile(profileText(type.profile));
      if (type.badge) badges.set(type.id, type.badge);
      return true;
    } catch (error) {
      refused.push({ file: `types/${type.category}/${type.id}.type.json`, id: type.id, reason: error instanceof Error ? error.message : String(error) });
      return false;
    }
  });
  found = { loaded, refused };
  if (refused.length > 0) console.warn('mixoDental: saved types that could not load:', refused);
  return found;
}

let ready: Promise<GeometryEngine> | null = null;

/** The engine, once this realm also knows every shipped type. Use it wherever `geometryReady()` was awaited. */
export function typesReady(): Promise<GeometryEngine> {
  ready ??= geometryReady().then((engine) => {
    registerTypes(FILES);
    return engine;
  });
  return ready;
}

/** The badge a shipped type set (1-5 characters), or undefined. */
export const shippedBadge = (id: string): string | undefined => badges.get(id);

/** The shipped type files this realm could not load, with why - shown in the app, never dropped. */
export const refusedTypes = (): readonly RefusedType[] => found.refused;
