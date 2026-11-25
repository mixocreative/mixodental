// Copyright (c) Mixo Creative.

/*
 * ONE JOB: the canonical text of a type's parts and its fingerprint - shared, so the app (`typeFile.ts`), the
 * workbench's server and the workbench PAGE (`typeDraft.mjs`, served as a browser module) take the same fingerprint of
 * the same type. Plain JavaScript and no Node API, for that reason.
 */

/** Sorted keys at every level, so equal objects always give equal text. @param {unknown} value @returns {unknown} */
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(/** @type {Record<string, unknown>} */ (value)[key])]));
  }
  return value;
}

/**
 * A type's own fingerprint of a text: FNV-1a, 64 bits, hex. It only ever has to equal ITSELF - the proof records it,
 * the reader recomputes it - so it needs no engine call. (Fable's review, 2026-11-20: the engine exports no text
 * digest, and reading one from `set_zone_graph` would change the live graph.)
 * @param {string} text
 */
export function typeDigest(text) {
  let h = 0xcbf29ce484222325n;
  for (const byte of new TextEncoder().encode(text)) h = BigInt.asUintN(64, (h ^ BigInt(byte)) * 0x100000001b3n);
  return h.toString(16).padStart(16, '0');
}

/** THE one writer of a profile's text (typeFile.ts documents why there is one). @param {object} profile */
export const profileText = (profile) => `${JSON.stringify(canonical(profile), null, 2)}\n`;

/** THE one writer of a graph's text - also what the engine is sent. @param {object} graph */
export const graphText = (graph) => JSON.stringify(canonical(graph));

/** The whole type file as text, so a saved file reads back byte-identical. @param {object} type */
export const typeFileText = (type) => `${JSON.stringify(canonical(type), null, 2)}\n`;

/**
 * The proof record for `type` as it stands: the fingerprints of what decides a run, and the scans it ran on (by their
 * bytes' fingerprint, never a name - patient data).
 * @param {{ profile: object, zoneGraph: object | null, orientGraph?: object }} type
 * @param {{ engineVersion: number, scans: string[], at: string }} run
 */
export function proofOf(type, run) {
  return {
    engineVersion: run.engineVersion,
    profileDigest: typeDigest(profileText(type.profile)),
    zoneGraphDigest: type.zoneGraph === null ? 'default' : typeDigest(graphText(type.zoneGraph)),
    ...(type.orientGraph ? { orientGraphDigest: typeDigest(graphText(type.orientGraph)) } : {}),
    scans: run.scans,
    at: run.at,
  };
}
