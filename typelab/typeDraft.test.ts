import { describe, expect, it } from 'vitest';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { defaultGraph, defaultParam, KINDS, setParam } from './nodeGraph.mjs';
import { editsOfType, runPrint, typeOfEdits } from './typeDraft.mjs';

const generic = Object.values(DENTURE_PROFILE_FILES)[0] as Record<string, unknown>;
const pose = generic.pose as Record<string, number>;
const builtIn = { typeFile: 1, category: 'denture', id: String(generic.id), basedOn: String(generic.id), profile: generic, rules: {}, zoneGraph: null, validation: null };
const opened = (type: Record<string, unknown>, isBuiltIn = false) => ({ id: String(type.id), builtIn: isBuiltIn, category: 'denture', type });
// A saved type: its own search end, a pinned rule, the hole strip at 6 mm, its own names and badge, a proof.
const savedGraph = setParam(defaultGraph(), 'BAND', 'mm', 6);
const soft = { typeFile: 1, category: 'denture', id: 'soft', basedOn: String(generic.id), badge: 'SOFT', rules: { overhangAngleDeg: 50 }, zoneGraph: savedGraph,
  profile: { ...generic, id: 'soft', name: { en: 'Soft', ja: 'ソフト', 'zh-Hant': '軟' }, pose: { ...pose, tiltRangeDeg: 30 } },
  validation: { engineVersion: 1, profileDigest: 'x', zoneGraphDigest: 'y', scans: ['a'], at: 'now' } };
const KEYS = { poseKeys: ['tiltStartDeg', 'tiltRangeDeg', 'tiltStepDeg', 'tiltMarginDeg'], placementKeys: ['rimBandMm', 'dentalRimPitchMm'] };

describe('a type file to the editors and back', () => {
  it('opens a saved type in the editors\' form: edits against the built-in, rules and graphs whole', () => {
    const edits = editsOfType(soft, builtIn, KEYS);
    expect(edits).toMatchObject({ name: 'Soft', pose: { tiltRangeDeg: 30 }, placement: {}, rules: { overhangAngleDeg: 50 } });
    expect(edits.zoneGraph).toEqual(savedGraph);
  });

  it('opening and applying with no edit gives the same type back - same run, same names, no proof', () => {
    const edits = editsOfType(soft, builtIn, KEYS);
    const draft = typeOfEdits({ opened: opened(soft), builtIn, edits, id: 'soft', name: 'Soft', badge: 'SOFT', ...KEYS });
    expect(runPrint(draft)).toBe(runPrint(soft));
    expect(draft).toMatchObject({ id: 'soft', basedOn: String(generic.id), badge: 'SOFT', validation: null });
    // The same name keeps the type's own translations.
    expect(draft.profile.name).toEqual(soft.profile.name);
  });

  it('a new id is a NEW type based on the opened one - a built-in\'s edit, a duplicate, an id rename', () => {
    const fromBuiltIn = typeOfEdits({ opened: opened(builtIn, true), builtIn, edits: editsOfType(builtIn, builtIn, KEYS), id: 'firm', name: 'Firm', badge: '', ...KEYS });
    expect(fromBuiltIn).toMatchObject({ id: 'firm', basedOn: String(generic.id), profile: { id: 'firm', name: { en: 'Firm', ja: 'Firm' } } });
    const copy = typeOfEdits({ opened: opened(soft), builtIn, edits: editsOfType(soft, builtIn, KEYS), id: 'soft-copy', name: 'Soft copy', badge: 'SOFT', ...KEYS });
    expect(copy).toMatchObject({ id: 'soft-copy', basedOn: 'soft' });
    expect(runPrint(copy)).toBe(runPrint(soft)); // a duplicate runs exactly as its source until edited
  });

  it('an edit reaches the draft; a search value back at the built-in\'s is written as the built-in\'s', () => {
    const edits = editsOfType(soft, builtIn, KEYS);
    const moved = typeOfEdits({ opened: opened(soft), builtIn, edits: { ...edits, pose: { tiltRangeDeg: 35 }, rules: { overhangAngleDeg: 55 } }, id: 'soft', name: 'Soft', badge: 'SOFT', ...KEYS });
    expect(moved.profile.pose.tiltRangeDeg).toBe(35);
    expect(moved.rules).toEqual({ overhangAngleDeg: 55 });
    expect(runPrint(moved)).not.toBe(runPrint(soft));
    const back = typeOfEdits({ opened: opened(soft), builtIn, edits: { ...edits, pose: {} }, id: 'soft', name: 'Soft', badge: 'SOFT', ...KEYS });
    expect(back.profile.pose.tiltRangeDeg).toBe(pose.tiltRangeDeg);
    // The standard zone graph is written as none, as the engine reads it.
    const standard = typeOfEdits({ opened: opened(soft), builtIn, edits: { ...edits, zoneGraph: defaultGraph() }, id: 'soft', name: 'Soft', badge: 'SOFT', ...KEYS });
    expect(standard.zoneGraph).toBeNull();
  });

  it('RESTORE GOES TO THE SAVED VALUE, not the node default: a graph parameter against the opened type\'s graph', () => {
    // The saved type's hole strip is 6 mm; the standard graph and the kind both say 5. Restoring through the opened
    // type's graph (the page's canvasLib) must put back 6.
    const band = savedGraph.nodes.find((n: { id: string }) => n.id === 'BAND');
    expect(defaultParam(editsOfType(soft, builtIn, KEYS).zoneGraph, KINDS, band, 'mm')).toBe(6);
    expect(defaultParam(defaultGraph(), KINDS, band, 'mm')).toBe(5);
  });

  it('a run print ignores the name and badge, and changes with any setting', () => {
    expect(runPrint({ ...soft, badge: 'S2', profile: { ...soft.profile, name: { en: 'x' } } })).toBe(runPrint(soft));
    expect(runPrint({ ...soft, rules: { overhangAngleDeg: 51 } })).not.toBe(runPrint(soft));
    expect(runPrint({ ...builtIn, zoneGraph: defaultGraph() })).toBe(runPrint(builtIn));
  });
});
