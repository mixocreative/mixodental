import { describe, expect, it } from 'vitest';
import { setZoneGraph, zoneGraphDigest } from '@mixo-geocore/host/dental/zoneGraph';
import { defaultGraph, setParam } from './nodeGraph.mjs';
import { flatBaseGraph } from './orientGraph.mjs';
import { typeFileText } from '../../src/dentalTypes/typeFile';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appLoadVerdict, putInForce, TYPE_DEPS, typeNameOf, typeOfRun } from './typeInForce';

/*
 * A type file saved before 2026-11-22 names the rim node's kind `rimCurve`. It is checked through TYPE_DEPS, the one
 * set of checks every type file is read with, so the alias must live there: `src/dentalTypes/typeFile.test.ts` builds
 * its own deps and cannot notice it being dropped (Fable's review of build step 3).
 */
describe('a type file with an old rim name passes the type-file graph check', () => {
  it('reads kind rimCurve as rim', () => {
    const old = defaultGraph();
    old.nodes.find((n) => n.id === 'RIM')!.kind = 'rimCurve';
    expect(TYPE_DEPS.graphProblems(old, {})).toEqual([]);
  });
});

/*
 * Build step 4.4: an aligner type carries no zone graph, and putting it in force used to send "no graph" to the one
 * slot the engine had - clearing the DENTURE's edited graph as a side effect.
 */
describe('putting an aligner type in force', () => {
  it('leaves the denture zone graph in force', () => {
    const edited = defaultGraph();
    edited.nodes.push({ id: 'R2', kind: 'parallelCast', params: { from: 'front', toward: 'tissue', deg: 30, pitchMm: 0.1 }, inputs: {} });
    edited.nodes.push({ id: 'NS2', kind: 'union', params: {}, inputs: { a: 'NS', b: 'R2' } });
    edited.nodes.find((n) => n.id === 'Z1')!.inputs.faces = 'NS2';
    const denture = setZoneGraph(edited);
    try {
      expect(denture).not.toBe('default');
      const aligner = typeOfRun('aligner', { MIXO_TYPE_ID: 'test-aligner-type' })!;
      expect(putInForce(aligner, {})).toBe('default');
      expect(zoneGraphDigest()).toBe(denture);
    } finally {
      setZoneGraph(null);
    }
  });
});

/* The workbench gives a draft its own name and the badge the user typed (docs/TYPE-PIPELINE.md section 8a). */
describe('a drafted type', () => {
  it('is named after its id in all three languages, and carries the badge', () => {
    const type = typeOfRun('denture', { MIXO_TYPE_ID: 'soft-denture', MIXO_TYPE_BADGE: 'SOFT' })!;
    expect(type.profile.name).toEqual({ en: 'soft-denture', ja: 'soft-denture', 'zh-Hant': 'soft-denture' });
    expect(type.badge).toBe('SOFT');
    expect(typeOfRun('denture', { MIXO_TYPE_ID: 'plain' })!.badge).toBeUndefined();
    expect(() => typeOfRun('denture', { MIXO_TYPE_ID: 'bad', MIXO_TYPE_BADGE: 'TOO LONG' })).toThrow(/badge is 1 to 5 characters/);
  });

  it('takes the full name typed on the New-type strip, in all three languages', () => {
    const type = typeOfRun('denture', { MIXO_TYPE_ID: 'soft-denture', MIXO_TYPE_NAME: '  Soft denture ' })!;
    expect(type.profile.name).toEqual({ en: 'Soft denture', ja: 'Soft denture', 'zh-Hant': 'Soft denture' });
    expect(typeNameOf('', 'x')).toBe('x');
    expect(() => typeNameOf('a'.repeat(61), 'x')).toThrow(/at most 60 characters/);
    expect(() => typeNameOf('two\nlines', 'x')).toThrow(/one line/);
  });

  // C3: the Rim tab's strip widths become the draft's profile numbers, the rest of placement kept; out of range, or a
  // key the tab does not offer, is refused by name before any run.
  it('takes the Rim tab\'s strip widths into its profile, and refuses one out of range by name', () => {
    const dir = mkdtempSync(join(tmpdir(), 'placement-'));
    const file = (body: object) => { const at = join(dir, `${Math.random()}.json`); writeFileSync(at, JSON.stringify(body)); return at; };
    const type = typeOfRun('denture', { MIXO_TYPE_ID: 'wide-rim', MIXO_PLACEMENT_FILE: file({ rimBandMm: 3, lowRimBandMm: 7 }) })!;
    const placement = type.profile.placement as Record<string, number>;
    expect([placement.rimBandMm, placement.lowRimBandMm]).toEqual([3, 7]);
    expect(placement.tipPitchMm).toBeGreaterThan(0);
    expect(() => typeOfRun('denture', { MIXO_TYPE_ID: 'x', MIXO_PLACEMENT_FILE: file({ rimBandMm: 0 }) })).toThrow(/rimBandMm must be above 0 and at most 20 mm/);
    expect(() => typeOfRun('denture', { MIXO_TYPE_ID: 'x', MIXO_PLACEMENT_FILE: file({ tipPitchMm: 1 }) })).toThrow(/the Rim tab sets only rimBandMm, .*rimBandInnerMm.*, not tipPitchMm/);
  });
});

/*
 * THE HINGE OF THE REVIEWER OVERHAUL (docs/REVIEWER-OVERHAUL-PLAN.md section 5, step 4). The page used to send a run its
 * edits in pieces (rules, pose, placement, both graphs, name, badge) and the run built the draft from the built-in;
 * now the page holds the whole type file and the run reads it as it is (MIXO_TYPE_FILE). If the two ever give a
 * different type, every result from then on would differ from what the old Apply ran - so this must stay equal.
 */
describe('a run given the whole type file runs the same type as one given its edits in pieces', () => {
  it('reads back to the same type text, every edit kind at once', () => {
    const dir = mkdtempSync(join(tmpdir(), 'parity-'));
    const file = (name: string, body: unknown) => { const at = join(dir, name); writeFileSync(at, typeof body === 'string' ? body : JSON.stringify(body)); return at; };
    const zone = setParam(defaultGraph(), 'BAND', 'mm', 6);
    const pieces = typeOfRun('denture', {
      MIXO_TYPE_ID: 'parity', MIXO_TYPE_NAME: 'Parity denture', MIXO_TYPE_BADGE: 'PAR',
      MIXO_RULES: JSON.stringify({ overhangAngleDeg: 50 }),
      MIXO_POSE_FILE: file('pose.json', { tiltRangeDeg: 30 }),
      MIXO_PLACEMENT_FILE: file('placement.json', { rimBandMm: 3 }),
      MIXO_ZONE_GRAPH_FILE: file('zone.json', zone),
      MIXO_ORIENT_GRAPH_FILE: file('orient.json', flatBaseGraph()),
    })!;
    const whole = typeOfRun('denture', { MIXO_TYPE_FILE: file('type.json', typeFileText(pieces)) })!;
    expect(typeFileText(whole)).toBe(typeFileText(pieces));
    // And what each puts in force is the same: the rules the batch runs with and the zone graph the engine holds.
    const envA: Record<string, string> = {};
    const envB: Record<string, string> = {};
    try {
      expect(putInForce(whole, envB)).toBe(putInForce(pieces, envA));
      expect(envB.MIXO_RULES).toBe(envA.MIXO_RULES);
    } finally {
      setZoneGraph(null);
    }
  });
});

/*
 * THE WORKBENCH SAYS WHAT THE APP WILL DO (Fable's end-to-end audit, 2026-11-23). It said "commit it to ship it" for
 * types the app then refused; appLoadVerdict runs the app's own rule (discoverTypes) over types/ plus the draft.
 */
describe('whether the app will load a drafted type', () => {
  const root = mkdtempSync(join(tmpdir(), 'types-'));

  it('loads a plain draft, and a draft replacing a saved type of the same id', () => {
    const draft = typeOfRun('denture', { MIXO_TYPE_ID: 'verdict-plain' })!;
    expect(appLoadVerdict(draft, root)).toEqual({ loads: true });
    mkdirSync(join(root, 'denture'), { recursive: true });
    writeFileSync(join(root, 'denture', 'verdict-plain.type.json'), JSON.stringify(draft));
    expect(appLoadVerdict(draft, root)).toEqual({ loads: true });
  });

  it('catches a draft that reuses a built-in id', () => {
    const copy = typeOfRun('denture', { MIXO_TYPE_ID: 'reference-denture', MIXO_TYPE_NAME: 'My copy' })!;
    const verdict = appLoadVerdict(copy, root);
    expect(verdict.loads ? '' : verdict.reason).toMatch(/already has the id "reference-denture"/);
  });

  it('loads a type that pins the unit-owned rules, and says why it would refuse a name another saved type has', () => {
    // The unit-owned rules load and seed the unit's controls (src/dentalTypes/typeRules.ts).
    const seeded = typeOfRun('denture', { MIXO_TYPE_ID: 'verdict-seeded', MIXO_RULES: JSON.stringify({ overhangAngleDeg: 55, lowOutsideAllowed: 0 }) })!;
    expect(appLoadVerdict(seeded, root)).toEqual({ loads: true });
    const twin = typeOfRun('denture', { MIXO_TYPE_ID: 'verdict-twin', MIXO_TYPE_NAME: 'verdict-plain' })!;
    const verdict = appLoadVerdict(twin, root);
    expect(verdict.loads).toBe(false);
    expect(verdict.loads ? '' : verdict.reason).toMatch(/would look the same as "verdict-plain"/);
  });

  it('catches a draft that sorts BEFORE its twin, which would load and knock the saved type out', () => {
    const first = typeOfRun('denture', { MIXO_TYPE_ID: 'a-twin', MIXO_TYPE_NAME: 'verdict-plain' })!;
    const verdict = appLoadVerdict(first, root);
    expect(verdict.loads ? '' : verdict.reason).toMatch(/^saving it stops "verdict-plain" loading: .*would look the same as "a-twin"/);
  });
});
