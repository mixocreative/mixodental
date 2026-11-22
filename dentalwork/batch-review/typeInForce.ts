/*
 * ONE JOB: decide which TYPE a folder review runs, register it with the engine, and record what ran.
 *
 * docs/TYPE-PIPELINE.md, units B1 + R1 + benchwork --type. A run uses a type when it is given one:
 * - `MIXO_TYPE_FILE` - a saved type file (benchwork --type), read by the ONE reader, `readTypeFile`;
 * - `MIXO_TYPE_ID` (and optionally `MIXO_POSE_FILE`, `MIXO_TYPE_BADGE`) - a DRAFT made here from the built-in
 *   profile, named after its id, with the Orient node's print-angle edits, the turned rules, the edited zone graph
 *   and the badge the user typed: what the review page's Apply sends.
 * With neither, nothing here runs and the review is exactly the built-in one (gate:real depends on it).
 *
 * After the run, `type.json` in the output folder is the type that ran, with its proof record
 * (`proofOf`): this is what Save type copies into `types/`. The proof names scans by a fingerprint of
 * their bytes, NEVER by file name - a type file is committed, and these are patient scans.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
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
import { draftOf, graphText, profileText, proofOf, readTypeFile, typeFileText, type TypeFile, type TypeFileDeps } from '../../src/dentalTypes/typeFile';
import { steepAngleProblem, upgradeGraph, validate } from './nodeGraph.mjs';
import { useTypeProfile } from './profileSelect';

/** The one set of checks a type file is read with, here as in the app. */
export const TYPE_DEPS: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  unreadBy: (category, rules) => unreadBy(category, rules),
  graphProblems: (graph, rules) => [...validate(upgradeGraph(graph)).problems, ...[steepAngleProblem(graph, rules)].filter((p): p is string => Boolean(p))],
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
  const rules = env.MIXO_RULES ? JSON.parse(env.MIXO_RULES) as Record<string, number | boolean> : {};
  // The type's OWN name, in all three languages: a copy of the built-in's name would put two "Generic denture"
  // entries in the app's type picker (docs/TYPE-PIPELINE.md section 8a). The id until the workbench has a name field.
  const id = env.MIXO_TYPE_ID;
  const draft: TypeFile = {
    typeFile: 1, category: kind, id, basedOn: String(builtIn.id),
    profile: { ...builtIn, id, name: { en: id, ja: id, 'zh-Hant': id }, pose: { ...(builtIn.pose as object), ...pose } },
    rules, zoneGraph: kind === 'denture' && env.MIXO_ZONE_GRAPH_FILE ? JSON.parse(readFileSync(env.MIXO_ZONE_GRAPH_FILE, 'utf8')) : null,
    validation: null,
    ...(env.MIXO_TYPE_BADGE ? { badge: env.MIXO_TYPE_BADGE } : {}),
  };
  // Read back through the one reader, so a draft is refused for exactly what a saved file would be.
  return readTypeFile(typeFileText(draft), TYPE_DEPS).type;
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
  return setZoneGraph(type.zoneGraph === null ? null : JSON.parse(graphText(type.zoneGraph)));
}

/** A scan's fingerprint for a proof record: its bytes, never its name (patient data). */
export const scanPrint = (file: string): string => createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16);

/** Write `type.json`: the type that ran, as a draft with this run's proof record. Save type copies it. */
export function recordType(out: string, type: TypeFile, files: string[]): void {
  const ran = draftOf(type);
  ran.validation = proofOf(ran, { engineVersion: HOST_GEOMETRY_VERSION, scans: files.map(scanPrint), at: new Date().toISOString() });
  writeFileSync(join(out, 'type.json'), typeFileText(ran));
}
