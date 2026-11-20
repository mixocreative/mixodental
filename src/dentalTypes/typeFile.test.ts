import { describe, expect, it } from 'vitest';
import { parseAlignerProfile } from '@mixo-geocore/host/dental/alignerProfiles';
import { parseDentureProfile } from '@mixo-geocore/host/dental/dentureProfiles';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { PROFILE_FILES } from '@mixo-geocore/host/dental/profileFiles';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { defaultGraph, setParam, validate } from '../../dentalwork/batch-review/nodeGraph.mjs';
import { TYPE_FILE_FORMAT, graphText, profileText, readTypeFile, typeFileText, type TypeFile, type TypeFileDeps } from './typeFile';

// A stand-in digest: any function of the text works for these rules, because the module only ever
// compares a digest it computes with one it was given. The real one is the engine's.
const digest = (text: string) => `d${[...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(16)}`;
const deps: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  graphProblems: (graph) => validate(graph).problems,
  digest,
  graphDigest: digest,
  engineVersion: 70,
};

const builtIn = (files: Readonly<Record<string, unknown>>) => Object.values(files)[0] as Record<string, unknown>;

/** A denture type copied from the built-in, proved: what the workbench will save. */
function dentureType(edit: Partial<TypeFile> = {}): TypeFile {
  const profile = { ...builtIn(DENTURE_PROFILE_FILES), id: 'mixo.denture.narrow' };
  const type: TypeFile = {
    typeFile: TYPE_FILE_FORMAT, category: 'denture', id: 'mixo.denture.narrow', basedOn: 'reference-denture',
    profile, rules: { overhangAngleDeg: 55 }, zoneGraph: null,
    validation: { engineVersion: 70, profileDigest: digest(profileText(profile)), zoneGraphDigest: 'default', scans: ['mesh-1'], at: '2026-11-20T00:00:00Z' },
    ...edit,
  };
  return type;
}

describe('a type file reads back exactly as it was proved', () => {
  it('a proved denture type is VALIDATED, and its text round-trips byte for byte', () => {
    const text = typeFileText(dentureType());
    const read = readTypeFile(text, deps);
    expect(read).toMatchObject({ label: 'VALIDATED', why: [] });
    expect(typeFileText(read.type)).toBe(text);
  });

  it('the one writer gives equal text for equal profiles, whatever their key order', () => {
    expect(profileText({ b: 1, a: { d: 2, c: 3 } })).toBe(profileText({ a: { c: 3, d: 2 }, b: 1 }));
  });
});

describe('the proof record is never trusted by itself', () => {
  it('a profile edited after the proof becomes UNVALIDATED, with the reason', () => {
    const t = dentureType();
    const edited = { ...t, profile: { ...t.profile, pose: { ...(t.profile.pose as object), tiltRangeDeg: 20 } } };
    expect(readTypeFile(typeFileText(edited), deps)).toMatchObject({ label: 'UNVALIDATED', why: ['its profile changed after it was proved'] });
  });

  it('a type proved on another engine is UNVALIDATED', () => {
    const t = dentureType();
    const read = readTypeFile(typeFileText({ ...t, validation: { ...t.validation!, engineVersion: 69 } }), deps);
    expect(read.why).toEqual(['it was proved on engine 69, this app runs 70']);
  });

  it('a zone graph edited after the proof is caught; one that cannot be checked says so', () => {
    const graph = setParam(defaultGraph(), 'R1b', 'deg', 60);
    const proved = dentureType({ zoneGraph: graph });
    // Proved from the canvas's own key order: the canonical writer must still match after a round trip.
    proved.validation!.zoneGraphDigest = deps.graphDigest!(graphText(graph));
    expect(readTypeFile(typeFileText(proved), deps).label).toBe('VALIDATED');
    const changed = { ...proved, zoneGraph: setParam(graph, 'R1b', 'deg', 70) };
    expect(readTypeFile(typeFileText(changed), deps).why).toEqual(['its zone graph changed after it was proved']);
    const { graphDigest: _unused, ...noGraphDigest } = deps;
    expect(readTypeFile(typeFileText(proved), noGraphDigest).why).toEqual(['its zone graph digest cannot be checked here']);
  });

  it('a type never proved says so', () => {
    expect(readTypeFile(typeFileText(dentureType({ validation: null })), deps).why).toEqual(['it has never been proved']);
  });
});

describe('a file that cannot be a type is refused by name', () => {
  const refused = (type: unknown) => () => readTypeFile(JSON.stringify(type), deps);

  it('another format or category', () => {
    expect(refused({ ...dentureType(), typeFile: 2 })).toThrow(/format 2/);
    expect(refused({ ...dentureType(), category: 'crown' })).toThrow(/category "crown"/);
  });

  it('a profile of differences, through the same strict parser as a built-in', () => {
    expect(refused({ ...dentureType(), profile: { id: 'mixo.denture.narrow', pose: { tiltRangeDeg: 20 } } })).toThrow();
  });

  it('a profile whose id is not the type\'s', () => {
    const t = dentureType();
    expect(refused({ ...t, profile: { ...t.profile, id: 'other' } })).toThrow(/must be the same/);
  });

  it('a rule the engine does not have - the packer would drop it silently', () => {
    expect(refused({ ...dentureType(), rules: { overhangAngelDeg: 55 } })).toThrow(/no rule "overhangAngelDeg"/);
  });

  it('a zone graph that cannot run', () => {
    expect(refused({ ...dentureType(), zoneGraph: { ...defaultGraph(), outputs: { ...defaultGraph().outputs, allowed: null } } })).toThrow(/cannot run/);
  });

  it('rules or a graph on an aligner, which reads neither', () => {
    const profile = { ...builtIn(PROFILE_FILES), id: 'mixo.aligner.a' };
    const aligner = { typeFile: 1, category: 'aligner', id: 'mixo.aligner.a', basedOn: 'reference-aligner', profile, rules: {}, zoneGraph: null, validation: null };
    expect(readTypeFile(JSON.stringify(aligner), deps).label).toBe('UNVALIDATED');
    expect(refused({ ...aligner, rules: { overhangAngleDeg: 55 } })).toThrow(/takes no rules/);
  });
});
