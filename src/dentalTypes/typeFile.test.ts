import { describe, expect, it } from 'vitest';
import { parseAlignerProfile } from '@mixo-geocore/host/dental/alignerProfiles';
import { parseDentureProfile } from '@mixo-geocore/host/dental/dentureProfiles';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { PROFILE_FILES } from '@mixo-geocore/host/dental/profileFiles';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { unreadBy } from '../../benchwork/rules.mjs';
import { alignerGraph, defaultGraph, setParam, steepAngleProblem, validate } from '../../dentalwork/batch-review/nodeGraph.mjs';
import {
  TYPE_FILE_FORMAT, badgeProblem, draftOf, graphText, proofOf, readTypeFile, typeDigest, typeFileText, type TypeFile, type TypeFileDeps,
} from './typeFile';

const deps: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  unreadBy: (category, rules) => unreadBy(category, rules),
  graphProblems: (graph, rules) => [...validate(graph).problems, ...[steepAngleProblem(graph, rules)].filter((p): p is string => Boolean(p))],
  engineVersion: 70,
};

const builtIn = (files: Readonly<Record<string, unknown>>) => Object.values(files)[0] as Record<string, unknown>;
const RUN = { engineVersion: 70, scans: ['mesh-1'], at: '2026-11-20T00:00:00Z' };

/** A denture type copied from the built-in, proved: what the workbench will save. */
function dentureType(edit: Partial<TypeFile> = {}): TypeFile {
  const type: TypeFile = {
    typeFile: TYPE_FILE_FORMAT, category: 'denture', id: 'mixo.denture.narrow', basedOn: 'reference-denture',
    profile: { ...builtIn(DENTURE_PROFILE_FILES), id: 'mixo.denture.narrow' }, rules: { overhangAngleDeg: 55 }, zoneGraph: null, validation: null,
    ...edit,
  };
  return edit.validation === undefined ? { ...type, validation: proofOf(type, RUN) } : type;
}

describe('a type file reads back exactly as it was proved', () => {
  it('a proved denture type is VALIDATED, and its text round-trips byte for byte', () => {
    const text = typeFileText(dentureType());
    const read = readTypeFile(text, deps);
    expect(read).toMatchObject({ label: 'VALIDATED', why: [], byHand: false });
    expect(typeFileText(read.type)).toBe(text);
  });

  it('the fingerprint is the writer\'s: equal objects in any key order give one fingerprint', () => {
    expect(typeDigest(graphText({ b: 1, a: { d: 2, c: 3 } }))).toBe(typeDigest(graphText({ a: { c: 3, d: 2 }, b: 1 })));
    expect(typeDigest('a')).not.toBe(typeDigest('b'));
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
    expect(readTypeFile(typeFileText({ ...t, validation: { ...t.validation!, engineVersion: 69 } }), deps).why).toEqual(['it was proved on engine 69, this app runs 70']);
  });

  it('a zone graph edited after the proof is caught, even when proved from the canvas\'s key order', () => {
    const graph = setParam(defaultGraph(), 'R1b', 'deg', 60);
    const proved = dentureType({ zoneGraph: graph, rules: { noSupportSteepDeg: 60 } });
    expect(readTypeFile(typeFileText(proved), deps).label).toBe('VALIDATED');
    const changed = { ...proved, zoneGraph: setParam(graph, 'R1', 'deg', 50) };
    expect(readTypeFile(typeFileText(changed), deps).why).toEqual(['its zone graph changed after it was proved']);
  });

  it('a type never proved says so', () => {
    expect(readTypeFile(typeFileText(dentureType({ validation: null })), deps).why).toEqual(['it has never been proved']);
  });

  it('"proved": true is the owner\'s hand override - it counts as proved, and says it was by hand', () => {
    const read = readTypeFile(typeFileText(dentureType({ validation: null, proved: true })), deps);
    expect(read).toMatchObject({ label: 'VALIDATED', byHand: true, why: ['it has never been proved'] });
    expect(readTypeFile(typeFileText(dentureType({ proved: true })), deps)).toMatchObject({ label: 'VALIDATED', byHand: false });
  });

  it('an edit is a draft: no proof record and no hand override survive it', () => {
    const draft = draftOf(dentureType({ proved: true }));
    expect(draft.validation).toBeNull();
    expect('proved' in draft).toBe(false);
    expect(readTypeFile(typeFileText(draft), deps)).toMatchObject({ label: 'UNVALIDATED', byHand: false });
  });
});

describe('a file that cannot be a type is refused by name', () => {
  const refused = (type: unknown) => () => readTypeFile(JSON.stringify(type), deps);

  it('a missing or misspelt key - it would otherwise fall back to a default', () => {
    const { zoneGraph: _gone, ...noGraph } = dentureType();
    expect(refused(noGraph)).toThrow(/missing key "zoneGraph"/);
    expect(refused({ ...dentureType(), prooved: true })).toThrow(/unknown key "prooved"/);
    expect(refused({ ...dentureType(), proved: 'yes' })).toThrow(/proved must be true or false/);
  });

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

  it('a zone graph that cannot run, or that disagrees with the steep-angle rule', () => {
    expect(refused({ ...dentureType(), zoneGraph: { ...defaultGraph(), outputs: { ...defaultGraph().outputs, allowed: null } } })).toThrow(/cannot run/);
    expect(refused({ ...dentureType(), zoneGraph: setParam(defaultGraph(), 'R1b', 'deg', 60) })).toThrow(/noSupportSteepDeg is not set/);
  });

  it('an aligner pins only what an aligner reads, and takes only its own locked graph', () => {
    const profile = { ...builtIn(PROFILE_FILES), id: 'mixo.aligner.a' };
    const aligner = { typeFile: 1, category: 'aligner', id: 'mixo.aligner.a', basedOn: 'reference-aligner', profile, rules: {}, zoneGraph: null, validation: null };
    expect(readTypeFile(JSON.stringify(aligner), deps).label).toBe('UNVALIDATED');
    // overhangAngleDeg reaches an aligner (shared supports layer); a denture-only rule does not.
    expect(readTypeFile(JSON.stringify({ ...aligner, rules: { overhangAngleDeg: 55 } }), deps).type.rules).toEqual({ overhangAngleDeg: 55 });
    expect(refused({ ...aligner, rules: { socketNoSupport: true } })).toThrow(/an aligner does not read socketNoSupport/);
    expect(refused({ ...aligner, zoneGraph: defaultGraph() })).toThrow(/must be the aligner graph/);
    // Step 4.4b: the aligner's locked default is accepted, an edit to it is refused, and a denture cannot carry it.
    expect(readTypeFile(JSON.stringify({ ...aligner, zoneGraph: alignerGraph() }), deps).type.zoneGraph).toEqual(alignerGraph());
    const edited = alignerGraph();
    (edited.nodes.find((n) => n.id === 'AREA')!.params as Record<string, unknown>).widthMm = 3;
    expect(refused({ ...aligner, zoneGraph: edited })).toThrow(/AREA: takes no parameters/);
    expect(refused({ ...dentureType(), zoneGraph: alignerGraph() })).toThrow(/a denture type cannot carry the aligner graph/);
  });
});

/* The badge (owner, 2026-11-22): up to 5 characters set by the user, beside the full name in the app's type list. */
describe('a type badge', () => {
  it('is 1 to 5 characters with no spaces - counted as characters, so 5 Japanese ones fit', () => {
    for (const ok of ['G', 'SOFT', 'NG-2X', '汎用義歯A']) expect(badgeProblem(ok), ok).toBeNull();
    for (const bad of ['', 'TOOLONG', 'A B', ' G', 'G\n', 3]) expect(badgeProblem(bad), String(bad)).not.toBeNull();
  });

  it('reads back with the type, is refused by name when it breaks the rule, and changes no fingerprint', () => {
    const type = { ...dentureType(), badge: 'SOFT' };
    const read = readTypeFile(typeFileText(type), deps);
    expect(read.type.badge).toBe('SOFT');
    expect(read.label).toBe(readTypeFile(typeFileText(dentureType()), deps).label);
    expect(() => readTypeFile(JSON.stringify({ ...dentureType(), badge: 'TOOLONG' }), deps)).toThrow(/badge is 1 to 5 characters/);
  });
});
