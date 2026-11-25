/*
 * ONE JOB: read and write a dental TYPE FILE, and say whether it is still what was proved.
 *
 * A type file is what the workbench saves and the app will load (docs/TYPE-PIPELINE.md section 4a, unit
 * B1): one JSON per type bundling its WHOLE profile, the rules it pins and its zone graph, plus a
 * record of the proof. This module is pure - no engine, no file system. What it needs from either is
 * handed in (`TypeFileDeps`), so the rules below are tested without a wasm build, and the same code
 * runs in the app, in benchwork and behind the planned MCP server.
 *
 * The traps it exists to close:
 * - A profile of DIFFERENCES would make every future retune of Generic silently change every type
 *   built on it. The file holds the whole profile, parsed by the same strict parser as a built-in
 *   (owner ruling 1, 2026-11-20).
 * - Two writers formatting the same numbers differently would give two fingerprints for one profile.
 *   `profileText` and `graphText` are the one writers; `typeDigest` is taken over their output only.
 * - A proof record copied along with edited contents would vouch for numbers it never saw. The record
 *   is never trusted by itself: the fingerprints are recomputed here, and any mismatch makes the type
 *   UNVALIDATED with the reason named. `draftOf` drops the record AND the hand override on every edit.
 * - A misspelt key ("zonegraph", "prooved") would quietly fall back to a default. Every key is
 *   required and an unknown one is refused, exactly as the profile parser does.
 */

import { idLooksDated } from './typeSaves.mjs';
import { canonical, typeDigest } from './typeText.mjs';

/** The type-file format this code reads. A file with any other number is refused, never guessed at. */
export const TYPE_FILE_FORMAT = 1;

export type TypeCategory = 'denture' | 'aligner';

export interface TypeValidation {
  engineVersion: number;
  /** `typeDigest(profileText(profile))` at the time of the proof. */
  profileDigest: string;
  /** `typeDigest(graphText(zoneGraph))`, or "default" when the type has no graph. */
  zoneGraphDigest: string;
  /** `typeDigest(graphText(orientGraph))` (U6); absent or "default" when the type has none. */
  orientGraphDigest?: string;
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
  /**
   * The type's own Orient graph - its Step 1 (docs/ORIENT-NODES.md U6). Absent = the category's default Step 1, so
   * every type file written before it stays valid under the same format, as `tiltStartDeg` did. Denture only.
   */
  orientGraph?: Record<string, unknown>;
  validation: TypeValidation | null;
  /**
   * The owner's hand override (ruling 4, 2026-11-20): `true` makes the type count as proved whatever
   * the proof record says. Reported as "proved by hand", never as a measured proof, and dropped by
   * `draftOf` on any edit so it cannot vouch for numbers it was not set on.
   */
  proved?: boolean;
  /**
   * The type's badge in the app's type picker: 1 to 5 characters, set by the user in the workbench (owner, 2026-11-22).
   * Absent = the app's default badge. Not part of the profile, so it never changes a fingerprint or a proof.
   */
  badge?: string;
}

/** Why `badge` cannot be a type's badge, or null when it can: 1 to 5 characters, no spaces or control characters. */
export function badgeProblem(badge: unknown): string | null {
  if (typeof badge !== 'string') return 'a badge is text';
  // The `u` flag counts characters, not UTF-16 units, so 5 Japanese or Chinese characters fit too.
  return /^[^\s\p{C}]{1,5}$/u.test(badge) ? null : `a badge is 1 to 5 characters with no spaces, not "${badge}"`;
}

/** What reading a type file needs from outside this module. */
export interface TypeFileDeps {
  /** The category's strict profile parser (the vendored host's `parseDentureProfile` / `parseAlignerProfile`); throws naming the key. */
  parseProfile(category: TypeCategory, value: unknown): unknown;
  /** Every rule name the engine reads (`RULE_NAMES`). */
  ruleNames: readonly string[];
  /** The names in `rules` this category does NOT read (benchwork `unreadBy`): pinning one would look like a setting and change nothing. */
  unreadBy(category: TypeCategory, rules: Record<string, unknown>): string[];
  /** Problems with a zone graph together with the rules it runs beside (nodeGraph `validate` + `steepAngleProblem`); empty when runnable. */
  graphProblems(graph: Record<string, unknown>, rules: Record<string, unknown>): string[];
  /** Problems with an Orient graph (orientGraph `validate`); empty when runnable. */
  orientProblems(graph: Record<string, unknown>): string[];
  /** The engine version the app ships. */
  engineVersion: number;
}

export interface ReadType {
  type: TypeFile;
  /** VALIDATED only when the proof record matches these exact contents and this engine - or by hand. */
  label: 'VALIDATED' | 'UNVALIDATED';
  /** Why the proof record does not vouch for these contents; empty when it does. Kept when `byHand`. */
  why: string[];
  /** VALIDATED only because the file says `"proved": true`, not because the record matched. */
  byHand: boolean;
}


/** THE one writer of a profile's text. Every fingerprint of a type's profile is taken over this output. */
export function profileText(profile: Record<string, unknown>): string {
  return `${JSON.stringify(canonical(profile), null, 2)}\n`;
}

/**
 * THE one writer of a zone graph's text - and what the engine must be SENT when a type runs, so the
 * graph the run used is the graph the file names. Found by this module's own test, 2026-11-20: the
 * canvas's key order and a file's sorted order gave one graph two fingerprints.
 */
export function graphText(graph: Record<string, unknown>): string {
  return JSON.stringify(canonical(graph));
}

/** A type's own fingerprint of a text (FNV-1a, 64 bits) - written once in typeText.mjs, which the workbench page shares. */
export { typeDigest };

/** The whole type file as text, through the same writer, so a saved file reads back byte-identical. */
export function typeFileText(type: TypeFile): string {
  return `${JSON.stringify(canonical(type), null, 2)}\n`;
}

/** The proof record for `type` as it stands - what benchwork writes after it has run the scans. */
export function proofOf(type: TypeFile, run: { engineVersion: number; scans: string[]; at: string }): TypeValidation {
  return {
    engineVersion: run.engineVersion,
    profileDigest: typeDigest(profileText(type.profile)),
    zoneGraphDigest: type.zoneGraph === null ? 'default' : typeDigest(graphText(type.zoneGraph)),
    ...(type.orientGraph ? { orientGraphDigest: typeDigest(graphText(type.orientGraph)) } : {}),
    scans: run.scans,
    at: run.at,
  };
}

/**
 * The type as an editable DRAFT: the proof record and the hand override removed. Every edit (the
 * workbench's Save type, the MCP's draft writer) goes through this, so neither can vouch for numbers
 * they were never set on (Fable's review, finding 8).
 */
export function draftOf(type: TypeFile): TypeFile {
  const { proved: _dropped, ...rest } = type;
  return { ...rest, validation: null };
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const REQUIRED_KEYS = ['typeFile', 'category', 'id', 'basedOn', 'profile', 'rules', 'zoneGraph', 'validation'] as const;
const OPTIONAL_KEYS = ['proved', 'badge', 'orientGraph'] as const;

/**
 * Read a type file. Throws `TypeError` naming the problem when the file cannot be a type at all (a key
 * missing or unknown, wrong format or category, a profile the strict parser refuses, a rule the engine
 * or this category does not read, an unrunnable graph, a graph on an aligner). Otherwise returns it
 * with its label: VALIDATED only when the proof record matches these contents and this engine, or the
 * file says `"proved": true`.
 */
export function readTypeFile(text: string, deps: TypeFileDeps): ReadType {
  const raw: unknown = JSON.parse(text);
  if (!isRecord(raw)) throw new TypeError('type file: not a JSON object');
  for (const key of REQUIRED_KEYS) if (!(key in raw)) throw new TypeError(`type file: missing key "${key}"`);
  for (const key of Object.keys(raw)) {
    if (!(REQUIRED_KEYS as readonly string[]).includes(key) && !(OPTIONAL_KEYS as readonly string[]).includes(key)) throw new TypeError(`type file: unknown key "${key}"`);
  }
  if (raw.typeFile !== TYPE_FILE_FORMAT) throw new TypeError(`type file: format ${String(raw.typeFile)} - this app reads ${TYPE_FILE_FORMAT}`);
  const category = raw.category;
  if (category !== 'denture' && category !== 'aligner') throw new TypeError(`type file: category "${String(category)}" - must be denture or aligner`);
  const id = raw.id;
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9.-]*$/.test(id)) throw new TypeError('type file: id must be lower-case letters, digits, dots and dashes');
  // A save is named <id>.<stamp>.type.json (typeSaves.mjs), so an id ending like a stamp would make a name mean two things.
  if (idLooksDated(id)) throw new TypeError(`type file: id "${id}" ends like a save stamp (YYYYMMDD-HHMMSS) - choose another`);
  if (typeof raw.basedOn !== 'string') throw new TypeError(`type file ${id}: basedOn must name the profile it was copied from`);
  if (!isRecord(raw.profile)) throw new TypeError(`type file ${id}: profile must be the whole profile`);
  deps.parseProfile(category, raw.profile); // throws, naming the key, exactly as for a built-in
  if (raw.profile.id !== id) throw new TypeError(`type file ${id}: its profile's id is "${String(raw.profile.id)}" - they must be the same`);
  if (raw.proved !== undefined && typeof raw.proved !== 'boolean') throw new TypeError(`type file ${id}: proved must be true or false`);
  const badgeWhy = raw.badge === undefined ? null : badgeProblem(raw.badge);
  if (badgeWhy) throw new TypeError(`type file ${id}: ${badgeWhy}`);

  const rules = raw.rules;
  if (!isRecord(rules)) throw new TypeError(`type file ${id}: rules must be an object of name: value`);
  for (const [name, value] of Object.entries(rules)) {
    if (!deps.ruleNames.includes(name)) throw new TypeError(`type file ${id}: the engine has no rule "${name}"`);
    if (typeof value !== 'number' && typeof value !== 'boolean') throw new TypeError(`type file ${id}: rule ${name} must be a number or true/false`);
  }
  const unread = deps.unreadBy(category, rules);
  if (unread.length > 0) throw new TypeError(`type file ${id}: ${category === 'aligner' ? 'an' : 'a'} ${category} does not read ${unread.join(', ')} - pinning it would change nothing`);
  const zoneGraph = raw.zoneGraph;
  if (zoneGraph !== null && !isRecord(zoneGraph)) throw new TypeError(`type file ${id}: zoneGraph must be a graph or null`);
  // A graph must be its type's kind. An aligner type may carry only the aligner's LOCKED graph (step 4.4b,
  // docs/ORIENT-NODES.md section 10), which says `kind: 'aligner'`; the aligner chain still reads none, so any edit
  // to it is refused by graphProblems rather than looking like a setting.
  if (zoneGraph && category === 'aligner' && zoneGraph.kind !== 'aligner') throw new TypeError(`type file ${id}: an aligner type's zone graph must be the aligner graph (kind "aligner")`);
  if (zoneGraph && category === 'denture' && zoneGraph.kind === 'aligner') throw new TypeError(`type file ${id}: a denture type cannot carry the aligner graph`);
  if (zoneGraph) {
    const problems = deps.graphProblems(zoneGraph, rules);
    if (problems.length > 0) throw new TypeError(`type file ${id}: its zone graph cannot run - ${problems[0]}`);
  }

  const orientGraph = raw.orientGraph;
  if (orientGraph !== undefined) {
    if (!isRecord(orientGraph)) throw new TypeError(`type file ${id}: orientGraph must be a graph`);
    if (category !== 'denture') throw new TypeError(`type file ${id}: only a denture reads an Orient graph in this version`);
    const problems = deps.orientProblems(orientGraph);
    if (problems.length > 0) throw new TypeError(`type file ${id}: its Orient graph cannot run - ${problems[0]}`);
  }

  const type: TypeFile = {
    typeFile: TYPE_FILE_FORMAT, category, id, basedOn: raw.basedOn, profile: raw.profile,
    rules: rules as Record<string, number | boolean>, zoneGraph: zoneGraph as Record<string, unknown> | null,
    validation: isRecord(raw.validation) ? raw.validation as unknown as TypeValidation : null,
    ...(raw.proved === undefined ? {} : { proved: raw.proved }),
    ...(raw.badge === undefined ? {} : { badge: raw.badge as string }),
    ...(orientGraph === undefined ? {} : { orientGraph: orientGraph as Record<string, unknown> }),
  };
  const measured = labelOf(type, deps.engineVersion);
  // The hand override wins, but the reasons stay, so "proved by hand" never hides what the record says.
  if (type.proved === true && measured.label === 'UNVALIDATED') return { type, label: 'VALIDATED', why: measured.why, byHand: true };
  return { type, ...measured, byHand: false };
}

/** VALIDATED, or UNVALIDATED with every reason - recomputed here, never read off the record. */
function labelOf(type: TypeFile, engineVersion: number): Pick<ReadType, 'label' | 'why'> {
  const v = type.validation;
  if (!v) return { label: 'UNVALIDATED', why: ['it has never been proved'] };
  const now = proofOf(type, { engineVersion, scans: v.scans, at: v.at });
  const why: string[] = [];
  if (v.engineVersion !== engineVersion) why.push(`it was proved on engine ${v.engineVersion}, this app runs ${engineVersion}`);
  if (v.profileDigest !== now.profileDigest) why.push('its profile changed after it was proved');
  if (v.zoneGraphDigest !== now.zoneGraphDigest) why.push('its zone graph changed after it was proved');
  if ((v.orientGraphDigest ?? 'default') !== (now.orientGraphDigest ?? 'default')) why.push('its Orient graph changed after it was proved');
  if (!Array.isArray(v.scans) || v.scans.length === 0) why.push('the proof names no scans');
  return why.length === 0 ? { label: 'VALIDATED', why } : { label: 'UNVALIDATED', why };
}
