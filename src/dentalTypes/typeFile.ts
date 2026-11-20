/*
 * ONE JOB: read and write a dental TYPE FILE, and say whether it is still what was proved.
 *
 * A type file is what the workbench saves and the app will load (docs/TYPE-PIPELINE.md section 4a, unit
 * B1): one JSON per type bundling its WHOLE profile, the rules it pins and its zone graph, plus a
 * record of the proof. This module is pure - no engine, no file system. What it needs from either is
 * handed in (`TypeFileDeps`), so the rules below are tested without a wasm build, and the same code
 * will run in the app, in benchwork and behind the planned MCP server.
 *
 * The traps it exists to close:
 * - A profile of DIFFERENCES would make every future retune of Generic silently change every type
 *   built on it. The file holds the whole profile, parsed by the same strict parser as a built-in.
 * - Two writers formatting the same numbers differently would give two digests for one profile.
 *   `profileText` is the one writer; the digest is always taken over its output.
 * - A proof record copied along with edited contents would vouch for numbers it never saw. The
 *   record is never trusted by itself: the digests are recomputed, and any mismatch makes the type
 *   UNVALIDATED, with the reason named.
 */

/** The type-file format this code reads. A file with any other number is refused, never guessed at. */
export const TYPE_FILE_FORMAT = 1;

export type TypeCategory = 'denture' | 'aligner';

export interface TypeValidation {
  engineVersion: number;
  profileDigest: string;
  zoneGraphDigest: string;
  scans: string[];
  at: string;
}

export interface TypeFile {
  typeFile: number;
  category: TypeCategory;
  id: string;
  basedOn: string;
  profile: Record<string, unknown>;
  rules: Record<string, number | boolean>;
  zoneGraph: Record<string, unknown> | null;
  validation: TypeValidation | null;
}

/** What reading a type file needs from outside this module. */
export interface TypeFileDeps {
  /** The category's strict profile parser (the vendored host's `parseDentureProfile` / `parseAlignerProfile`); throws naming the key. */
  parseProfile(category: TypeCategory, value: unknown): unknown;
  /** Every rule name the engine reads (`RULE_NAMES`). */
  ruleNames: readonly string[];
  /** Problems with a zone graph (nodeGraph.mjs `validate`), empty when it is runnable. */
  graphProblems(graph: Record<string, unknown>): string[];
  /** The engine's digest of a profile text - the same function the engine keys its cache on. */
  digest(text: string): string;
  /**
   * The engine's digest of a zone graph's TEXT, when one can be computed here; absent means "not
   * checked". Always handed `graphText(graph)`: the engine digests the text it is sent, so a graph
   * proved from one key order and read back in another would otherwise look edited.
   */
  graphDigest?(graphText: string): string;
  /** The engine version the app ships. */
  engineVersion: number;
}

export interface ReadType {
  type: TypeFile;
  /** VALIDATED only when the proof record matches these exact contents and this engine. */
  label: 'VALIDATED' | 'UNVALIDATED';
  /** Why it is UNVALIDATED; empty when VALIDATED. */
  why: string[];
}

/** Sorted keys at every level, so equal objects always give equal text. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical((value as Record<string, unknown>)[key])]));
  }
  return value;
}

/** THE one writer of a profile's text. Every digest of a type's profile is taken over this output. */
export function profileText(profile: Record<string, unknown>): string {
  return `${JSON.stringify(canonical(profile), null, 2)}\n`;
}

/**
 * THE one writer of a zone graph's text - what the engine must be SENT when a type is proved or run
 * (`setZoneGraph`), because its digest is over the text. Found by this module's own test, 2026-11-20:
 * the canvas's key order and the file's sorted order gave one graph two digests.
 */
export function graphText(graph: Record<string, unknown>): string {
  return JSON.stringify(canonical(graph));
}

/** The whole type file as text, through the same writer, so a saved file reads back byte-identical. */
export function typeFileText(type: TypeFile): string {
  return `${JSON.stringify(canonical(type), null, 2)}\n`;
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * Read a type file. Throws `TypeError` naming the problem when the file cannot be a type at all (wrong
 * format, wrong category, a profile the strict parser refuses, an unknown rule, an unrunnable graph,
 * rules or a graph on an aligner). Otherwise returns it with its label: VALIDATED only when the proof
 * record matches these contents and this engine.
 */
export function readTypeFile(text: string, deps: TypeFileDeps): ReadType {
  const raw: unknown = JSON.parse(text);
  if (!isRecord(raw)) throw new TypeError('type file: not a JSON object');
  if (raw.typeFile !== TYPE_FILE_FORMAT) throw new TypeError(`type file: format ${String(raw.typeFile)} - this app reads ${TYPE_FILE_FORMAT}`);
  const category = raw.category;
  if (category !== 'denture' && category !== 'aligner') throw new TypeError(`type file: category "${String(category)}" - must be denture or aligner`);
  const id = raw.id;
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(id)) throw new TypeError('type file: id must be lower-case letters, digits, dots and dashes');
  if (typeof raw.basedOn !== 'string') throw new TypeError(`type file ${id}: basedOn must name the profile it was copied from`);
  if (!isRecord(raw.profile)) throw new TypeError(`type file ${id}: profile must be the whole profile`);
  deps.parseProfile(category, raw.profile); // throws, naming the key, exactly as for a built-in
  if (raw.profile.id !== id) throw new TypeError(`type file ${id}: its profile's id is "${String(raw.profile.id)}" - they must be the same`);

  const rules = raw.rules ?? {};
  if (!isRecord(rules)) throw new TypeError(`type file ${id}: rules must be an object of name: value`);
  for (const [name, value] of Object.entries(rules)) {
    if (!deps.ruleNames.includes(name)) throw new TypeError(`type file ${id}: the engine has no rule "${name}"`);
    if (typeof value !== 'number' && typeof value !== 'boolean') throw new TypeError(`type file ${id}: rule ${name} must be a number or true/false`);
  }
  const zoneGraph = raw.zoneGraph ?? null;
  if (zoneGraph !== null && !isRecord(zoneGraph)) throw new TypeError(`type file ${id}: zoneGraph must be a graph or null`);
  // The aligner chain reads neither (benchwork/README.md, "only a denture responds"): carrying them
  // would look like a setting and change nothing.
  if (category === 'aligner' && (Object.keys(rules).length > 0 || zoneGraph !== null)) {
    throw new TypeError(`type file ${id}: an aligner type takes no rules and no zone graph - the aligner chain reads neither`);
  }
  if (zoneGraph) {
    const problems = deps.graphProblems(zoneGraph);
    if (problems.length > 0) throw new TypeError(`type file ${id}: its zone graph cannot run - ${problems[0]}`);
  }

  const type: TypeFile = {
    typeFile: TYPE_FILE_FORMAT, category, id, basedOn: raw.basedOn, profile: raw.profile,
    rules: rules as Record<string, number | boolean>, zoneGraph: zoneGraph as Record<string, unknown> | null,
    validation: isRecord(raw.validation) ? raw.validation as unknown as TypeValidation : null,
  };
  return { type, ...labelOf(type, deps) };
}

/** VALIDATED, or UNVALIDATED with every reason - recomputed here, never read off the record. */
function labelOf(type: TypeFile, deps: TypeFileDeps): Pick<ReadType, 'label' | 'why'> {
  const v = type.validation;
  if (!v) return { label: 'UNVALIDATED', why: ['it has never been proved'] };
  const why: string[] = [];
  if (v.engineVersion !== deps.engineVersion) why.push(`it was proved on engine ${v.engineVersion}, this app runs ${deps.engineVersion}`);
  if (v.profileDigest !== deps.digest(profileText(type.profile))) why.push('its profile changed after it was proved');
  const graphNow = type.zoneGraph === null ? 'default' : deps.graphDigest?.(graphText(type.zoneGraph));
  if (graphNow === undefined) why.push('its zone graph digest cannot be checked here');
  else if (v.zoneGraphDigest !== graphNow) why.push('its zone graph changed after it was proved');
  if (!Array.isArray(v.scans) || v.scans.length === 0) why.push('the proof names no scans');
  return why.length === 0 ? { label: 'VALIDATED', why } : { label: 'UNVALIDATED', why };
}
