import { describe, expect, it } from 'vitest';
import { parseAlignerProfile } from '@mixo-geocore/host/dental/alignerProfiles';
import { parseDentureProfile } from '@mixo-geocore/host/dental/dentureProfiles';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { PROFILE_FILES } from '@mixo-geocore/host/dental/profileFiles';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { unreadBy } from '../../benchwork/rules.mjs';
import { defaultGraph, steepAngleProblem, validate } from '../../dentalwork/batch-review/nodeGraph.mjs';
import { NOT_YET, discoverTypes, type KnownProfile } from './shippedTypes';
import { typeFileText, type TypeFile, type TypeFileDeps } from './typeFile';

/* The workbench's own checks, so a refusal here is a refusal by the real rules, not by a stand-in. */
const deps: TypeFileDeps = {
  parseProfile: (category, value) => (category === 'denture' ? parseDentureProfile(value) : parseAlignerProfile(value)),
  ruleNames: RULE_NAMES,
  unreadBy: (category, rules) => unreadBy(category, rules),
  graphProblems: (graph, rules) => [...validate(graph).problems, ...[steepAngleProblem(graph, rules)].filter((p): p is string => Boolean(p))],
  engineVersion: 70,
};

const builtIn = (files: Readonly<Record<string, unknown>>) => Object.values(files)[0] as Record<string, unknown>;
const generic = builtIn(DENTURE_PROFILE_FILES);
const known: KnownProfile[] = [{ id: String(generic.id), name: generic.name as Record<string, string> }];

/** A denture type named after its id, as the workbench now drafts it. */
function denture(id: string, edit: Partial<TypeFile> = {}): TypeFile {
  return {
    typeFile: 1, category: 'denture', id, basedOn: String(generic.id),
    profile: { ...generic, id, name: { en: id, ja: id, 'zh-Hant': id } }, rules: {}, zoneGraph: null, validation: null, ...edit,
  };
}
const at = (type: TypeFile) => ({ [`/types/${type.category}/${type.id}.type.json`]: typeFileText(type) });
const reasons = (files: Record<string, string>) => discoverTypes(files, deps, known).refused.map((r) => r.reason).join(' | ');

describe('discoverTypes - the types the app can offer', () => {
  it('loads a clean denture type with its badge, proved or not', () => {
    const found = discoverTypes(at(denture('soft', { badge: 'SOFT' })), deps, known);
    expect(found.refused).toEqual([]);
    expect(found.loaded.map((t) => [t.id, t.badge])).toEqual([['soft', 'SOFT']]);
  });

  it('loads nothing and refuses nothing when the folder is empty', () => {
    expect(discoverTypes({}, deps, known)).toEqual({ loaded: [], refused: [] });
  });

  it('refuses, by name, a file in the wrong place or one the reader refuses', () => {
    expect(reasons({ '/types/soft.type.json': typeFileText(denture('soft')) })).toMatch(/types\/<category>\/<id>\.type\.json/);
    expect(reasons({ '/types/denture/other.type.json': typeFileText(denture('soft')) })).toMatch(/it sits at denture \/ other/);
    expect(reasons({ '/types/denture/x.type.json': '{"typeFile":1}' })).toMatch(/missing key/);
    expect(reasons({ '/types/denture/x.type.json': typeFileText({ ...denture('x'), badge: 'TOOLONG' }) })).toMatch(/badge is 1 to 5/);
  });

  it('loads an aligner type like a denture one', () => {
    const profile = { ...builtIn(PROFILE_FILES), id: 'al', name: { en: 'al', ja: 'al', 'zh-Hant': 'al' } };
    const aligner: TypeFile = { typeFile: 1, category: 'aligner', id: 'al', basedOn: 'reference-aligner', profile, rules: {}, zoneGraph: null, validation: null, badge: 'AL' };
    const found = discoverTypes(at(aligner), deps, known);
    expect(found.refused).toEqual([]);
    expect(found.loaded.map((t) => [t.category, t.id, t.badge])).toEqual([['aligner', 'al', 'AL']]);
  });

  it('refuses what v1 cannot run - its own zone graph, pinned rules - saying why', () => {
    expect(reasons(at(denture('g', { zoneGraph: defaultGraph() })))).toBe(NOT_YET.graph);
    expect(reasons(at(denture('r', { rules: { overhangAngleDeg: 55 } })))).toBe(NOT_YET.rules(['overhangAngleDeg']));
  });

  it('refuses a type that would collide with one already there - by id or by a name in any language', () => {
    expect(reasons(at(denture(String(generic.id))))).toMatch(/already has the id/);
    const copyName = denture('copy', { profile: { ...denture('copy').profile, name: generic.name } });
    expect(reasons(at(copyName))).toMatch(/would look the same as "reference-denture"/);
    // Two files, one name: the first in path order loads, the second is refused - never both, never silently.
    const a = denture('a-type', { profile: { ...denture('a-type').profile, name: { en: 'Same', ja: 'a', 'zh-Hant': 'a' } } });
    const b = denture('b-type', { profile: { ...denture('b-type').profile, name: { en: 'Same', ja: 'b', 'zh-Hant': 'b' } } });
    const found = discoverTypes({ ...at(b), ...at(a) }, deps, known);
    expect(found.loaded.map((t) => t.id)).toEqual(['a-type']);
    expect(found.refused.map((r) => r.id)).toEqual(['b-type']);
  });
});
