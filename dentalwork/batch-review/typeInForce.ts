/*
 * ONE JOB: decide which TYPE a folder review runs, register it with the engine, and record what ran.
 *
 * docs/TYPE-PIPELINE.md, units B1 + R1 + benchwork --type. A run uses a type when it is given one:
 * - `MIXO_TYPE_FILE` - a saved type file (benchwork --type), read by the ONE reader, `readTypeFile`;
 * - `MIXO_TYPE_ID` (and optionally `MIXO_POSE_FILE`, `MIXO_TYPE_BADGE`, `MIXO_TYPE_NAME`) - a DRAFT made here from the
 *   built-in profile, named with the full name typed (else its id), with the Orient node's print-angle edits, the turned rules, the edited zone graph
 *   and the badge the user typed: what the review page's Apply sends.
 * With neither, nothing here runs and the review is exactly the built-in one (gate:real depends on it).
 *
 * After the run, `type.json` in the output folder is the type that ran, with its proof record
 * (`proofOf`): this is what Save type copies into `types/`. The proof names scans by a fingerprint of
 * their bytes, NEVER by file name - a type file is committed, and these are patient scans.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAlignerProfile } from '@mixo-geocore/host/dental/alignerProfiles';
import { defaultProfileId, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { parseDentureProfile } from '@mixo-geocore/host/dental/dentureProfiles';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { PROFILE_FILES } from '@mixo-geocore/host/dental/profileFiles';
import { registerAlignerProfile, registerDentureProfile } from '@mixo-geocore/host/dental/registerProfile';
import { setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { HOST_GEOMETRY_VERSION } from '@mixo-geocore/host/geometryVersion.js';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { unreadBy } from '../../benchwork/rules.mjs';
import { discoverTypes } from '../../src/dentalTypes/shippedTypes';
import { draftOf, graphText, profileText, proofOf, readTypeFile, typeFileText, type TypeFile, type TypeFileDeps } from '../../src/dentalTypes/typeFile';
import { placementProblem, steepAngleProblem, upgradeGraph, validate } from './nodeGraph.mjs';
import { validate as validateOrient } from './orientGraph.mjs';
import { setOrientGraph } from '@mixo-geocore/host/dental/orientGraph';
import { useTypeProfile } from './profileSelect';

/** The one set of checks a type file is read with, here as in the app. */
export const TYPE_DEPS: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  unreadBy: (category, rules) => unreadBy(category, rules),
  graphProblems: (graph, rules) => [...validate(upgradeGraph(graph)).problems, ...[steepAngleProblem(graph, rules)].filter((p): p is string => Boolean(p))],
  orientProblems: (graph) => validateOrient(graph as never).problems,
  engineVersion: HOST_GEOMETRY_VERSION,
};

type Env = Readonly<Record<string, string | undefined>>;

/** The built-in profile of `kind` as its raw JSON - the whole profile a draft is copied from. */
function builtInProfile(kind: DentalKind): Record<string, unknown> {
  const files = kind === 'denture' ? DENTURE_PROFILE_FILES : PROFILE_FILES;
  const found = (Object.values(files) as Record<string, unknown>[]).find((p) => p.id === defaultProfileId(kind));
  if (!found) throw new Error(`no built-in ${kind} profile`);
  return found;
}

/**
 * The type this run uses, or null for a plain built-in run. Throws `TypeError` naming the problem when
 * the type cannot be one (the same refusals as anywhere a type is read).
 */
export function typeOfRun(kind: DentalKind, env: Env): TypeFile | null {
  if (env.MIXO_TYPE_FILE) {
    const { type } = readTypeFile(readFileSync(env.MIXO_TYPE_FILE, 'utf8'), TYPE_DEPS);
    if (type.category !== kind) throw new TypeError(`type ${type.id} is a ${type.category} type - this run is --kind ${kind}`);
    return type;
  }
  if (!env.MIXO_TYPE_ID) return null;
  const builtIn = builtInProfile(kind);
  const pose = env.MIXO_POSE_FILE ? JSON.parse(readFileSync(env.MIXO_POSE_FILE, 'utf8')) as Record<string, number> : {};
  // The Rim tab's profile numbers (WORKBENCH-TABS-PLAN C3: the strip widths; 2026-11-23: the two rim spacings), a denture's,
  // refused by name here rather than as an anonymous profile error later.
  const placement = kind === 'denture' && env.MIXO_PLACEMENT_FILE ? JSON.parse(readFileSync(env.MIXO_PLACEMENT_FILE, 'utf8')) as Record<string, number> : {};
  // The one list of what the Rim tab may set and its ranges (nodeGraph.mjs RIM_PLACEMENT).
  for (const [key, value] of Object.entries(placement)) {
    const problem = placementProblem(key, value);
    if (problem) throw new TypeError(problem);
  }
  const rules = env.MIXO_RULES ? JSON.parse(env.MIXO_RULES) as Record<string, number | boolean> : {};
  // The type's OWN name, in all three languages: a copy of the built-in's name would put two "Generic denture"
  // entries in the app's type picker (docs/TYPE-PIPELINE.md section 8a). The full name typed on the New-type strip
  // (`MIXO_TYPE_NAME`), else the id. One text for every language until someone translates it.
  const id = env.MIXO_TYPE_ID;
  const fullName = typeNameOf(env.MIXO_TYPE_NAME, id);
  const draft: TypeFile = {
    typeFile: 1, category: kind, id, basedOn: String(builtIn.id),
    profile: { ...builtIn, id, name: { en: fullName, ja: fullName, 'zh-Hant': fullName }, pose: { ...(builtIn.pose as object), ...pose },
      // Only a denture's profile has a placement section; an aligner's reader refuses the key.
      ...(kind === 'denture' ? { placement: { ...(builtIn.placement as object), ...placement } } : {}) },
    rules, zoneGraph: kind === 'denture' && env.MIXO_ZONE_GRAPH_FILE ? JSON.parse(readFileSync(env.MIXO_ZONE_GRAPH_FILE, 'utf8')) : null,
    validation: null,
    ...(env.MIXO_TYPE_BADGE ? { badge: env.MIXO_TYPE_BADGE } : {}),
    // The Orient canvas's graph (U6), so Save type keeps the Step 1 that ran.
    ...(kind === 'denture' && env.MIXO_ORIENT_GRAPH_FILE ? { orientGraph: JSON.parse(readFileSync(env.MIXO_ORIENT_GRAPH_FILE, 'utf8')) } : {}),
  };
  // Read back through the one reader, so a draft is refused for exactly what a saved file would be.
  return readTypeFile(typeFileText(draft), TYPE_DEPS).type;
}

/** A type's full name: the text typed (trimmed, 1 to 60 characters, one line), else its id. Throws naming the problem. */
export function typeNameOf(typed: string | undefined, id: string): string {
  const name = (typed ?? '').trim();
  if (name === '') return id;
  if (name.length > 60 || /[\n\r\t]/.test(name)) throw new TypeError(`a type's name is one line of at most 60 characters, not "${name}"`);
  return name;
}

/**
 * Put `type` in force: its profile registered with the engine and the host (by `profileText`, the one
 * writer), every review of its kind using its id, its rules in the run's rules, its graph set by
 * `graphText`. Returns the zone-graph digest now in force.
 */
export function putInForce(type: TypeFile, env: Record<string, string | undefined>): string {
  const text = profileText(type.profile);
  const id = type.category === 'denture' ? registerDentureProfile(text).id : registerAlignerProfile(text).id;
  useTypeProfile(type.category, id);
  env.MIXO_RULES = JSON.stringify({ ...(env.MIXO_RULES ? JSON.parse(env.MIXO_RULES) as object : {}), ...type.rules });
  // An aligner type carries at most the aligner's locked default (the type file refuses anything else) and the
  // aligner chain reads no graph, so it leaves the zone graph alone: sending null here cleared the DENTURE's graph
  // (Fable's step 4 trap, docs/ORIENT-NODES.md section 10).
  if (type.category === 'aligner') return 'default';
  // Its Step 1 (U6): its own Orient graph, or today's when it has none - never one a previous run left in force.
  setOrientGraph(type.orientGraph ? JSON.parse(graphText(type.orientGraph)) : null);
  return setZoneGraph(type.zoneGraph === null ? null : JSON.parse(graphText(type.zoneGraph)));
}

/** A scan's fingerprint for a proof record: its bytes, never its name (patient data). */
export const scanPrint = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);

/** Write `type.json`: the type that ran, as a draft with this run's proof record. Save type copies it. */
export function recordType(out: string, type: TypeFile, files: string[]): void {
  const ran = draftOf(type);
  ran.validation = proofOf(ran, { engineVersion: HOST_GEOMETRY_VERSION, scans: files.map(scanPrint), at: new Date().toISOString() });
  writeFileSync(join(out, 'type.json'), typeFileText(ran));
  // Whether the app will load what Save would write - beside it, read by the review page's Type strip and Save.
  writeFileSync(join(out, 'type-load.json'), JSON.stringify(appLoadVerdict(ran, TYPES_ROOT)));
}

/** The repo's `types/` folder, where Save type writes. */
const TYPES_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'types');

/**
 * Whether the APP will load `type` once it is saved, and if not, why - by the app's own rule (`discoverTypes`), run
 * over the files already in `typesRoot` plus this one at the path Save writes. The workbench used to say "commit it
 * to ship it" for a type the app then refused (pinned rules, its own zone graph, a taken name - Fable's end-to-end
 * audit, 2026-11-23); one rule in one place means the two can no longer disagree. A file already at that path is
 * the type being replaced, so it is overwritten by the draft. The known profiles are the BUILT-IN files only - never
 * this process's registered list, which holds the draft itself - so a draft reusing a built-in's id is still caught.
 */
export function appLoadVerdict(type: TypeFile, typesRoot: string): { loads: true } | { loads: false; reason: string } {
  const path = `/types/${type.category}/${type.id}.type.json`;
  // Every folder under types/, as the app's glob (types/*/*.type.json) reads it - a list of categories here would
  // miss a category added later.
  const files: Record<string, string> = {};
  if (existsSync(typesRoot)) {
    for (const entry of readdirSync(typesRoot, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const dir = join(typesRoot, entry.name);
      for (const name of readdirSync(dir).filter((n) => n.endsWith('.type.json'))) files[`/types/${entry.name}/${name}`] = readFileSync(join(dir, name), 'utf8');
    }
  }
  const known = [...Object.values(DENTURE_PROFILE_FILES), ...Object.values(PROFILE_FILES)]
    .map((p) => p as { id: string; name: Record<string, string> })
    .map((p) => ({ id: p.id, name: p.name }));
  const before = new Set(discoverTypes(files, TYPE_DEPS, known).refused.map((r) => r.file));
  const after = discoverTypes({ ...files, [path]: typeFileText(type) }, TYPE_DEPS, known).refused;
  const own = after.find((r) => r.file === path);
  if (own) return { loads: false, reason: own.reason };
  // The loader refuses the LATER of two clashing files in path order, so a draft that sorts first loads and knocks
  // out a type already saved - and every project using that one stops opening (Fable, 2026-11-23).
  const knocked = after.find((r) => !before.has(r.file));
  return knocked ? { loads: false, reason: `saving it stops "${knocked.id ?? knocked.file}" loading: ${knocked.reason}` } : { loads: true };
}
