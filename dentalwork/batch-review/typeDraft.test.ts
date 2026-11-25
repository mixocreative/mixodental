import { describe, expect, it } from 'vitest';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { defaultGraph, defaultParam, KINDS, setParam } from './nodeGraph.mjs';
import { changes, duplicateDraft, editDraft, openDraft, restoreProfile, restoreRule, runPrint, zoneStandard } from './typeDraft.mjs';

const generic = Object.values(DENTURE_PROFILE_FILES)[0] as Record<string, unknown>;
const builtIn = { category: 'denture', id: String(generic.id), builtIn: true, path: null, stamp: '',
  type: { typeFile: 1, category: 'denture', id: String(generic.id), basedOn: String(generic.id), profile: generic, rules: {}, zoneGraph: null, validation: null } };
// A saved type whose zone graph turned the steep ray R1b on at 30 degrees, with a pinned rule and its own tilt limit.
const savedGraph = setParam(defaultGraph(), 'R1b', 'deg', 30);
const pose = generic.pose as Record<string, number>;
const soft = { category: 'denture', id: 'soft', builtIn: false, path: 'types/denture/soft.20261125-210430.type.json', stamp: '20261125-210430',
  type: { typeFile: 1, category: 'denture', id: 'soft', basedOn: String(generic.id), badge: 'SOFT', rules: { overhangAngleDeg: 50 }, zoneGraph: savedGraph,
    profile: { ...generic, id: 'soft', name: { en: 'Soft', ja: 'Soft', 'zh-Hant': 'Soft' }, pose: { ...pose, tiltMaxDeg: 30 } },
    validation: { engineVersion: 1, profileDigest: 'x', zoneGraphDigest: 'y', scans: ['a'], at: 'now' } } };

describe('a type being worked on: opened, edited, restored, duplicated', () => {
  it('opens as a draft without its proof, with nothing changed', () => {
    const state = openDraft(soft);
    expect(state.draft.validation).toBeNull();
    expect(state.savedFrom).toBe(soft.path);
    expect(changes(state)).toEqual([]);
  });

  it('RESTORE GOES TO THE SAVED VALUE, not the node default (owner, 2026-11-25)', () => {
    const state = openDraft(soft);
    expect(restoreRule(state, 'overhangAngleDeg')).toBe(50);
    expect(restoreProfile(state, 'pose.tiltMaxDeg')).toBe(30);
    // The graph parameter: the saved type's R1b is 30. The standard graph says 0 (off) and the kind's default 45; the
    // restore must put back 30 - the type's own - and neither of the others.
    const r1b = state.base.zoneGraph.nodes.find((n: { id: string }) => n.id === 'R1b');
    expect(defaultParam(zoneStandard(state), KINDS, r1b, 'deg')).toBe(30);
    expect(defaultParam(defaultGraph(), KINDS, r1b, 'deg')).toBe(0);
    // A built-in's baseline is the built-in: no pinned rule, the standard graph.
    const plain = openDraft(builtIn);
    expect(restoreRule(plain, 'overhangAngleDeg')).toBeUndefined();
    expect(defaultParam(zoneStandard(plain), KINDS, r1b, 'deg')).toBe(0);
  });

  it('lists each edit, and an edit back to the saved value is no edit', () => {
    let state = openDraft(soft);
    state = editDraft(state, { rule: 'overhangAngleDeg', value: 55 });
    state = editDraft(state, { profile: 'pose.tiltMaxDeg', value: 40 });
    state = editDraft(state, { zoneGraph: setParam(savedGraph, 'R1b', 'deg', 0) });
    state = editDraft(state, { badge: 'S2' });
    expect(changes(state)).toEqual(['rule:overhangAngleDeg', 'profile:pose.tiltMaxDeg', 'zoneGraph', 'badge']);
    state = editDraft(state, { rule: 'overhangAngleDeg', value: 50 });
    expect(changes(state)).not.toContain('rule:overhangAngleDeg');
    expect(() => editDraft(state, { profile: 'name.en', value: 'x' })).toThrow(/rename the type/);
  });

  it('refuses to edit a built-in, and a duplicate of it is editable with the built-in as its baseline', () => {
    const plain = openDraft(builtIn);
    expect(() => editDraft(plain, { rule: 'overhangAngleDeg', value: 50 })).toThrow(/read-only - Duplicate it/);
    const copy = duplicateDraft(plain, { id: 'firm', name: 'Firm denture' });
    expect(copy).toMatchObject({ id: 'firm', builtIn: false, savedFrom: null });
    expect(copy.draft).toMatchObject({ id: 'firm', basedOn: String(generic.id), profile: { id: 'firm', name: { en: 'Firm denture' } } });
    expect(changes(copy)).toEqual([]);
    const edited = editDraft(copy, { rule: 'overhangAngleDeg', value: 50 });
    expect(restoreRule(edited, 'overhangAngleDeg')).toBeUndefined();
    expect(() => duplicateDraft(copy, { id: 'firm' })).toThrow(/id other than firm/);
    expect(() => duplicateDraft(copy, { id: 'Bad Id' })).toThrow(/lower-case/);
  });

  it('a run print ignores the name and badge, and changes with any setting', () => {
    const state = openDraft(soft);
    const renamed = editDraft(editDraft(state, { name: 'Soft v2' }), { badge: 'S2' });
    expect(runPrint(renamed.draft)).toBe(runPrint(state.draft));
    expect(runPrint(duplicateDraft(state, { id: 'soft-copy' }).draft)).toBe(runPrint(state.draft));
    expect(runPrint(editDraft(state, { rule: 'overhangAngleDeg', value: 51 }).draft)).not.toBe(runPrint(state.draft));
    // The standard graph written out runs the same as no graph, so it prints the same.
    expect(runPrint({ ...builtIn.type, zoneGraph: defaultGraph() })).toBe(runPrint(builtIn.type));
  });
});
