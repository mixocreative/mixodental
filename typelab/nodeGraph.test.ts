import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS, FIXED, KINDS, KIND_GROUP, KIND_WORDS, NODE_GROUPS, OUTPUT_WORDS, PARAM_WORDS, PRINT_ANGLE_SEARCH, REQUIRED_OUTPUTS, RIM_STRIP_MM,
  ALIGNER_KINDS, OLD_KINDS, RIM_DERIVED_REASON, addNode, alignerGraph, bindOutput, defaultGraph, isDefault, removeNode, rewire, rimTabGraph, rimTabView,
  setParam, unreached, upgradeGraph, validate, defaultOf, RIM_TAKES, rimOutputLines, FLAT_EDGE_NEEDS_BASE, sameGraph, RIM_LINE_PITCH_MM, placementProblem, fixedParam, beltOf, beltProblem,
  wordsOf, RIM_BELTS, RIM_TAB_KINDS, rimTabTarget, beltEdits, sameBelts, RIM_TAB_LAYERS, NOT_IN_PALETTE, copyNodes, pasteNodes, duplicateNodes,
} from './nodeGraph.mjs';

describe('every node, parameter and output says what it is, in plain words', () => {
  // The owner's rules, enforced rather than remembered: "anything that is not a number should be a
  // dropdown", and "name it or show explanations" - so a node added later cannot ship unexplained.
  it('every node kind belongs to a group with a title and a colour token', () => {
    for (const kind of Object.keys(KINDS)) {
      const group = NODE_GROUPS[KIND_GROUP[kind]];
      expect(group?.title, `${kind} has no group`).toBeTruthy();
      expect(group.token, `${kind}'s group has no colour`).toMatch(/^--node-/);
    }
  });

  it('every node kind has a plain title and a sentence', () => {
    for (const kind of Object.keys(KINDS)) {
      expect(KIND_WORDS[kind]?.title, `${kind} has no plain title`).toBeTruthy();
      expect(KIND_WORDS[kind]?.says, `${kind} has no sentence saying what it does`).toBeTruthy();
    }
  });

  it('every parameter has a label and help, and every non-number is a dropdown', () => {
    for (const [kind, spec] of Object.entries(KINDS)) {
      for (const [key, value] of Object.entries(spec.params)) {
        const words = PARAM_WORDS[key];
        expect(words?.label, `${kind}.${key} has no label`).toBeTruthy();
        expect(words?.help, `${kind}.${key} has no help`).toBeTruthy();
        if (typeof value !== 'number') {
          expect(words?.choices?.length, `${kind}.${key} is text, so it must be a dropdown`).toBeGreaterThan(0);
          // And its default must be one of its own choices, or the dropdown would open on nothing.
          expect(words.choices.map(([v]) => v), `${kind}.${key} default "${value}" is not a choice`).toContain(value);
        }
      }
    }
  });

  it('every output says what the engine does with it', () => {
    for (const name of Object.keys(REQUIRED_OUTPUTS)) {
      expect(OUTPUT_WORDS[name]?.title, `${name} has no plain title`).toBeTruthy();
      expect(OUTPUT_WORDS[name]?.says, `${name} does not say what the engine does with it`).toBeTruthy();
    }
  });

  it('names exactly the directions the engine reads', () => {
    // zone_graph.rs axis(): back, front, top|teeth, tissue, across, -across.
    expect(DIRECTIONS.map(([v]) => v).sort()).toEqual(['-across', 'across', 'back', 'front', 'teeth', 'tissue']);
  });
});

describe('a setting the engine does not read is fixed, never a field that lies', () => {
  // Mirrors zone_graph.rs fixed_params / FIXED_OUTPUTS; the engine refuses the same edits by name.
  it('refuses an edit to a fixed setting, and names it', () => {
    expect(validate(setParam(defaultGraph(), 'R1', 'pitchMm', 0.2)).problems).toContain('R1: "pitchMm" is fixed at 0.1 in this version - the engine does not read an edit yet');
    expect(validate(setParam(defaultGraph(), 'ORIGIN', 'face', 'front')).problems).toContain('ORIGIN: "face" is fixed at back in this version - the engine does not read an edit yet');
  });

  it('refuses rewiring the hole strip, which placement never reads from the graph', () => {
    expect(validate(bindOutput(defaultGraph(), 'hole_band', 'SIGHT')).problems).toContain('output "hole_band" is fixed in this version - it must stay wired to BAND');
  });

  it('leaves the free outputs free', () => {
    expect(FIXED.outputs).not.toContain('no_support');
    expect(FIXED.outputs).not.toContain('allowed');
    expect(FIXED.outputs).not.toContain('allowed_cavity');
  });

  it('draws the rim strips at the widths the shipped profile uses', () => {
    const profile = readFileSync(new URL('../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    const read = (key: string) => Number(new RegExp(`${key}\\\\?":\\s*([0-9.]+)`).exec(profile)?.[1]);
    const mm = (id: string) => defaultGraph().nodes.find((n) => n.id === id).params.mm;
    expect(mm('RIMBAND')).toBe(read('rimBandMm'));
    expect(mm('LOWRIMBAND')).toBe(read('lowRimBandMm'));
  });
});

describe('the print-angle search node shows what the engine actually searches', () => {
  it('matches the shipped denture profile, so the node cannot drift from the engine', () => {
    const profile = readFileSync(new URL('../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    const read = (key: string) => Number(new RegExp(`${key}\\\\?":\\s*([0-9.]+)`).exec(profile)?.[1]);
    expect(read('tiltRangeDeg')).toBe(PRINT_ANGLE_SEARCH.endDeg);
    expect(read('tiltStepDeg')).toBe(PRINT_ANGLE_SEARCH.stepDeg);
    expect(read('tiltMarginDeg')).toBe(PRINT_ANGLE_SEARCH.marginDeg);
    // 0 is upright by the engine's own definition, not a profile field.
    expect(PRINT_ANGLE_SEARCH.startDeg).toBe(0);
  });
});

/* Step 7.2b: the engine grows the rim strips at the profile's widths, so the words quote the profile's defaults. */
describe('the rim strips say the width the engine actually uses', () => {
  it('quotes the shipped profile\'s widths, and says they come from the profile', () => {
    const profile = readFileSync(new URL('../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    const read = (key: string) => Number(new RegExp(`"${key}\\\\?":\\s*([0-9.]+)`).exec(profile)?.[1]);
    expect(read('rimBandMm')).toBe(RIM_STRIP_MM.rim_band);
    expect(read('lowRimBandMm')).toBe(RIM_STRIP_MM.low_rim_band);
    expect(OUTPUT_WORDS.rim_band.says).toContain(`${RIM_STRIP_MM.rim_band} mm each side of the rim line (widths set on 2 Rim)`);
    expect(OUTPUT_WORDS.low_rim_band.says).toContain(`${RIM_STRIP_MM.low_rim_band} mm each side of the rim line (widths set on 2 Rim)`);
  });
});

/* Owner 2026-11-24: three "Grow a strip" boxes for three different jobs. Each rim belt is named by the output it fills,
   with the same name on 2 Rim, on the Zones canvas and on the output socket (Fable: never two names for one belt). */
describe('the rim belts are named by their job', () => {
  const g = defaultGraph();
  const of = (id: string) => g.nodes.find((n) => n.id === id)!;
  it('names the hole strip by its kind and each wired rim belt by its output, the same on every tab', () => {
    expect(wordsOf(of('BAND'), g).title).toBe('Grow a strip');
    for (const [id, out, kind] of [['RIMBAND', 'rim_band', 'rimStrip'], ['LOWRIMBAND', 'low_rim_band', 'lowRimStrip']] as const) {
      expect(wordsOf(of(id), g).title).toBe(RIM_BELTS[id].title);
      expect(OUTPUT_WORDS[out].title).toBe(RIM_BELTS[id].title);
      expect(rimTabView('denture').find((n) => n.id === id)!.title).toBe(RIM_BELTS[id].title);
      expect(RIM_TAB_KINDS[kind].label).toBe(RIM_BELTS[id].title);
    }
    expect(RIM_BELTS.LOWRIMBAND.says).toContain('places no tips');
  });
  it('wires every line of the Rim output card from the node that gives it, and no wire the zone graph does not take', () => {
    // Owner 2026-11-25: "even low point belt should output to the gives to 3 zones" - the card had ONE wire, from the rim.
    expect(rimOutputLines('denture', { graph: g }).map((l) => l.from)).toEqual(['RIM', 'RIMBAND', 'LOWRIMBAND', 'RIMPLANE', 'CROSSING']);
    expect(rimOutputLines('denture').map((l) => l.from)).toEqual(['RIM', 'RIMBAND', 'LOWRIMBAND', 'RIMPLANE', 'CROSSING']);
    const rewired = rimOutputLines('denture', { graph: { ...g, outputs: { ...g.outputs, low_rim_band: 'BAND' } } });
    expect(rewired[2].from).toBeNull();
    expect(rewired[2].text).toContain(RIM_BELTS.LOWRIMBAND.title);
  });
  it('tells the Rim tab\'s live preview which node to show and whether the belts differ from the run', () => {
    expect(rimTabTarget('RIM', g)).toBe('RIM');
    expect(rimTabTarget('LOWRIMBAND', g)).toBe('LOWRIMBAND');
    expect(rimTabTarget('RIMBAND', { ...g, outputs: { ...g.outputs, rim_band: 'BAND' } })).toBe('BAND');
    expect(rimTabTarget('RIMPLANE', g)).toBeNull();
    expect(beltEdits({ rimBandOuterMm: 0, dentalRimPitchMm: 3 })).toEqual({ rimBandOuterMm: 0 });
    // The profile's own numbers are the standard: a run on them and an untouched page are the same belts.
    expect(sameBelts({ rimBandMm: RIM_STRIP_MM.rim_band, lowRimBandMm: RIM_STRIP_MM.low_rim_band }, {})).toBe(true);
    expect(sameBelts(null, { rimBandOuterMm: 0 })).toBe(false);
  });
  it('restores a Rim field to the OPENED type\'s saved value, not the built-in (owner, 2026-11-25)', () => {
    const saved = { graph: setParam(defaultGraph(), 'RIM', 'shellMm', 3), placement: { rimBandMm: 4, dentalRimPitchMm: 2 } };
    const field = (id: string, key: string, ctx: object) => rimTabView('denture', ctx).find((n) => n.id === id)!.fields.find((f) => f.key === key)!;
    // Opened with its own values and not edited: each field shows the saved value, and that is its standard.
    const opened = { graph: saved.graph, placement: saved.placement, saved };
    expect(field('RIM', 'shellMm', opened)).toMatchObject({ value: 3, standard: 3 });
    expect(field('RIMBAND', 'rimBandInnerMm', opened)).toMatchObject({ value: 4, standard: 4 });
    expect(field('RIMBAND', 'dentalRimPitchMm', opened)).toMatchObject({ value: 2, standard: 2 });
    // Edited: the restore mark puts back the saved value, not the built-in 2 mm.
    const edited = { ...opened, placement: { ...saved.placement, rimBandInnerMm: 6 } };
    expect(field('RIMBAND', 'rimBandInnerMm', edited)).toMatchObject({ value: 6, standard: 4 });
    // With nothing saved (a built-in), the standard is the built-in's, as before.
    expect(field('RIM', 'shellMm', {}).standard).toBe(KINDS.rim.params.shellMm);
  });

  // Reviewer overhaul step 13 (owner, 2026-11-25: "nodes and types can be duplicated, renamed, or copied across").
  it('duplicates a node with fresh ids; the copy reads what the original reads', () => {
    const { graph, ids, cut } = duplicateNodes(defaultGraph(), 'R1', { category: 'denture' });
    expect(cut).toEqual([]);
    const copy = graph.nodes.find((n) => n.id === ids.R1)!;
    expect(copy.id).not.toBe('R1');
    expect(copy).toMatchObject({ kind: 'parallelCast', params: defaultGraph().nodes.find((n) => n.id === 'R1')!.params });
    expect(validate(graph).problems.filter((p: string) => p.startsWith(copy.id))).toEqual([]);
  });

  it('copies a wired group across types: inner wires kept, a wire to a node not copied arrives EMPTY and is named', () => {
    const g = defaultGraph();
    const clip = copyNodes(g, 'NS', { category: 'denture', withInputs: true });
    expect(clip.nodes.map((n) => n.id).sort()).toEqual(['NS', 'R1', 'R1b']);
    const alone = copyNodes(g, 'AL', { category: 'denture' });
    const pasted = pasteNodes(g, alone, { category: 'denture' });
    const al = pasted.graph.nodes.find((n) => n.id === pasted.ids.AL)!;
    expect(Object.values(al.inputs)).toEqual([null, null]);
    expect(pasted.cut).toEqual([`${pasted.ids.AL}.a (was SIGHT)`, `${pasted.ids.AL}.b (was BAND)`]);
    const group = pasteNodes(g, clip, { category: 'denture' });
    const ns = group.graph.nodes.find((n) => n.id === group.ids.NS)!;
    expect(ns.inputs).toEqual({ a: group.ids.R1, b: group.ids.R1b });
    expect(group.cut).toEqual([]);
  });

  it('refuses what cannot be copied, by name: a fixed node, another category, the locked aligner graph', () => {
    expect(() => copyNodes(defaultGraph(), 'RIM', { category: 'denture' })).toThrow(/found on an earlier tab/);
    expect(() => copyNodes(defaultGraph(), 'BASINS', { category: 'denture' })).toThrow(/cannot run yet/);
    const clip = copyNodes(defaultGraph(), 'R1', { category: 'denture' });
    expect(() => pasteNodes(defaultGraph(), clip, { category: 'aligner' })).toThrow(/copied from a denture type/);
    expect(() => copyNodes(alignerGraph(), 'TRIM', { category: 'aligner' })).toThrow(/aligner graph is locked/);
  });

  it('never offers a node that cannot run in the Add-node list', () => {
    // Every kind that says it is not runnable is held back, and every held-back kind is a real kind.
    for (const [kind, words] of Object.entries(KIND_WORDS)) if (/not runnable/i.test(words.says)) expect(NOT_IN_PALETTE, kind).toContain(kind);
    for (const kind of NOT_IN_PALETTE) expect(KINDS[kind], kind).toBeDefined();
  });
  it('shows every denture Rim-tab node in 3D, by its zone-graph node or by the layers the run drew', () => {
    // A selection that changes nothing on the model reads as a dead click (Fable, 2026-11-25).
    const viewer = readFileSync(new URL('./viewer.html', import.meta.url), 'utf8');
    for (const { id } of rimTabGraph('denture').nodes) {
      const layers = RIM_TAB_LAYERS[id];
      expect(rimTabTarget(id, g) !== null || Boolean(layers), id).toBe(true);
      // Each layer key is one the viewer draws, or the isolation would hide everything.
      for (const key of layers ?? []) expect(viewer.includes(`['${key}', `), key).toBe(true);
    }
  });
  it('gives a rim belt not wired to its output a neutral name, since that output may take other faces', () => {
    const rewired = { ...g, outputs: { ...g.outputs, rim_band: 'BAND' } };
    expect(wordsOf(of('RIMBAND'), rewired).title).toBe('Rim belt');
  });
});

describe('the default graph is today, node for node', () => {
  it('fills every output the engine reads, and validates clean', () => {
    const g = defaultGraph();
    expect(Object.keys(g.outputs).sort()).toEqual(Object.keys(REQUIRED_OUTPUTS).sort());
    expect(validate(g).problems).toEqual([]);
  });

  it('is the composition in ruled_tips.rs:151-163, not an approximation of it', () => {
    const g = defaultGraph();
    const n = (id) => g.nodes.find((x) => x.id === id);
    // no_support = r1 || r1b
    expect(n('NS')).toMatchObject({ kind: 'union', inputs: { a: 'R1', b: 'R1b' } });
    // The one-zone stack (plan D1): the rays No-support, then the cavity's view Support with `seen` (today's
    // allowed_cavity), then the hole strip Support without it - allowed = sight || band, the later Mark winning.
    expect(n('Z1')).toMatchObject({ kind: 'markNoSupport', inputs: { faces: 'NS' } });
    expect(n('Z2')).toMatchObject({ kind: 'markSupport', params: { seen: true }, inputs: { under: 'Z1', faces: 'SIGHT' } });
    expect(n('Z3')).toMatchObject({ kind: 'markSupport', params: { seen: false }, inputs: { under: 'Z2', faces: 'BAND' } });
    expect(g.outputs.zone).toBe('Z3');
    expect(g.outputs.allowed ?? g.outputs.no_support ?? g.outputs.allowed_cavity).toBeUndefined();
    // AL stays: the socket cancel reads the final allowed area.
    expect(n('AL')).toMatchObject({ kind: 'union', inputs: { a: 'SIGHT', b: 'BAND' } });
    // The socket cancel reads the FINAL allowed, made explicit so it cannot become a hidden cycle.
    expect(n('SOCK')).toMatchObject({ kind: 'subtract', inputs: { a: 'BASINS', b: 'AL' } });
    // R1 leans to the TISSUE side; "back->top" is the mirror ray and was in an earlier draft.
    expect(n('R1').params).toMatchObject({ from: 'back', toward: 'tissue', deg: 45 });
  });

  it('says plainly that the steep ray is off by default, rather than hiding it', () => {
    expect(validate(defaultGraph()).warnings).toEqual(['R1b: tilt is 0° - this ray is off and marks nothing']);
  });

  it('knows it is the default, and stops being it after any edit', () => {
    expect(isDefault(defaultGraph())).toBe(true);
    expect(isDefault(setParam(defaultGraph(), 'R1b', 'deg', 60))).toBe(false);
  });
});

describe('free editing: add, remove, rewire', () => {
  it('adds a node unwired, and validation names the loose input', () => {
    const g = addNode(defaultGraph(), 'sightCast');
    const added = g.nodes.at(-1);
    expect(added.kind).toBe('sightCast');
    expect(validate(g).problems).toContain(`${added.id}: input "origin" is not connected`);
  });

  it('removing a node empties the wires to it and names every consequence, never reshaping quietly', () => {
    const g = removeNode(defaultGraph(), 'SIGHT');
    const { problems } = validate(g);
    // The seen Mark and the socket cancel both lost their input, and each says so.
    expect(problems).toContain('Z2: input "faces" is not connected');
    expect(problems).toContain('AL: input "a" is not connected');
    // A Mark's `under` may be empty - the first Mark of a stack - but removing the Mark under one names nothing
    // wrong with the stack shape itself, only what the removed node fed.
    expect(validate(removeNode(defaultGraph(), 'Z1')).problems).toEqual([]);
  });

  it('refuses to add or remove what an earlier tab finds', () => {
    expect(() => addNode(defaultGraph(), 'rim')).toThrow(/earlier tab/);
    expect(() => removeNode(defaultGraph(), 'RIM')).toThrow(/earlier tab/);
  });

  it('refuses a wire between the wrong types - a depth map is not a mask', () => {
    const g = rewire(defaultGraph(), 'NS', 'b', 'MAP');
    expect(validate(g).problems).toContain('NS: input "b" takes mask, but MAP gives depthMap');
  });

  it('refuses a strip seeded by anything but Find holes, because the engine would run it as the hole strip anyway', () => {
    // The socket TYPE allows faces or a rim line (the engine's band does both); v1 runs only the hole strip.
    expect(validate(rewire(defaultGraph(), 'BAND', 'seeds', 'RIM')).problems)
      .toContain('BAND: in this version a strip must be seeded by Find holes - from anything else it would still run as the hole strip');
  });

  it('finds a cycle before any engine time is spent', () => {
    // allowed feeding the cast that feeds allowed.
    const withUnion = addNode(defaultGraph(), 'union');
    const u = withUnion.nodes.at(-1).id;
    expect(u).toBe('U1');
    const g = rewire(rewire(withUnion, u, 'a', 'AL'), u, 'b', 'R1');
    const looped = rewire(g, 'AL', 'b', u);
    expect(validate(looped).problems.some((p) => p.startsWith('cycle:'))).toBe(true);
  });

  it('subtraction has a direction, and swapping it is a different zone', () => {
    const g = defaultGraph();
    const swapped = rewire(rewire(g, 'SOCK', 'a', 'AL'), 'SOCK', 'b', 'BASINS');
    expect(validate(swapped).problems).toEqual([]);
    expect(isDefault(swapped)).toBe(false);
    expect(KINDS.subtract.reads).toMatch(/minuend/);
  });

  it('does not evaluate a node no output reaches - an added cast costs nothing until wired in', () => {
    const g = addNode(defaultGraph(), 'parallelCast');
    expect(unreached(g)).toEqual([g.nodes.at(-1).id]);
    expect(unreached(defaultGraph())).toEqual([]);
  });

  it('refuses to bind a name the engine does not read', () => {
    expect(() => bindOutput(defaultGraph(), 'everything', 'NS')).toThrow(/not an output/);
  });
});

/*
 * A node of unknown kind used as a SOURCE (feeding an input or an output) is a problem to report, not a crash:
 * validate() read `.out` off its missing spec and threw, so the operator got a stack trace instead of the name of
 * the node to fix (Fable's end-to-end review, 2026-11-22).
 */
describe('validate - a source of unknown kind', () => {
  it('reports the unknown node instead of throwing, whether it feeds an input or an output', () => {
    const g = defaultGraph();
    const target = g.nodes.find((n) => Object.keys(n.inputs).length > 0)!;
    const input = Object.keys(target.inputs)[0]!;
    g.nodes.push({ id: 'MYSTERY', kind: 'noSuchKind', inputs: {}, params: {} });
    target.inputs[input] = 'MYSTERY';
    const output = Object.keys(g.outputs)[0]!;
    g.outputs[output] = 'MYSTERY';
    let result: ReturnType<typeof validate> | undefined;
    expect(() => { result = validate(g); }).not.toThrow();
    expect(result!.problems).toContain('MYSTERY: unknown kind "noSuchKind"');
  });
});

/*
 * The rim socket was `curve` and its kind `rimCurve` until 2026-11-22. A graph saved before that (a type file,
 * the viewer's browser storage) must still load as today's default - dropping the alias turns it into
 * "unknown kind" with no other warning.
 */
describe('a graph saved under the old rim names still loads', () => {
  it('reads kind rimCurve as rim: valid, and the default again', () => {
    const old = defaultGraph();
    old.nodes.find((n) => n.id === 'RIM')!.kind = 'rimCurve';
    expect(validate(old).problems).toContain('RIM: unknown kind "rimCurve"');
    const read = upgradeGraph(old);
    expect(validate(read).ok).toBe(true);
    expect(isDefault(read)).toBe(true);
  });

  it('leaves a current graph untouched, the same object', () => {
    const g = defaultGraph();
    expect(upgradeGraph(g)).toBe(g);
    expect(OLD_KINDS).toEqual({ rimCurve: 'rim' });
  });
});

/*
 * PLAN D1: the three old zone outputs become a Mark stack. A graph saved before D1 (browser storage, a type file)
 * must load as a valid graph meaning the same thing - and the old default must come back as the default exactly.
 */
describe('a graph saved with the three old zone outputs loads as a Mark stack', () => {
  /** Today's graph as it was saved before D1: the three outputs, no Marks. */
  const oldForm = () => {
    const g = defaultGraph();
    const { zone: _zone, ...rest } = g.outputs;
    return {
      nodes: g.nodes.filter((n) => !n.kind.startsWith('mark')),
      outputs: { no_support: 'NS', allowed: 'AL', allowed_cavity: 'SIGHT', ...rest },
    };
  };

  it('the old default becomes the default, node for node', () => {
    const read = upgradeGraph(oldForm());
    expect(validate(read).ok).toBe(true);
    expect(isDefault(read)).toBe(true);
  });

  it('an edited allowed that still contains the cavity keeps its other input as the unseen Mark', () => {
    const old = oldForm();
    old.nodes.push({ id: 'R2', kind: 'parallelCast', params: { from: 'front', toward: 'tissue', deg: 30, pitchMm: 0.1 }, inputs: {} });
    old.nodes.push({ id: 'AL2', kind: 'union', params: {}, inputs: { a: 'R2', b: 'SIGHT' } });
    old.outputs.allowed = 'AL2';
    const read = upgradeGraph(old);
    expect(validate(read).problems).toEqual([]);
    const z = (id: string) => read.nodes.find((n) => n.id === id);
    expect(z('Z2')).toMatchObject({ kind: 'markSupport', params: { seen: true }, inputs: { faces: 'SIGHT' } });
    expect(z('Z3')).toMatchObject({ kind: 'markSupport', params: { seen: false }, inputs: { faces: 'R2' } });
  });

  it('an allowed that need not contain the cavity marks only their overlap as seen, so allowed stays exact', () => {
    const old = oldForm();
    old.outputs.allowed = 'BAND';
    const read = upgradeGraph(old);
    expect(validate(read).problems).toEqual([]);
    const seen = read.nodes.find((n) => n.id === 'SEEN');
    expect(seen).toMatchObject({ kind: 'intersect', inputs: { a: 'SIGHT', b: 'BAND' } });
    expect(read.nodes.find((n) => n.id === 'Z2')).toMatchObject({ inputs: { faces: 'SEEN' } });
    expect(read.nodes.find((n) => n.id === 'Z3')).toMatchObject({ inputs: { faces: 'BAND' } });
  });

  it('an old graph with an output left unwired is not guessed at: its problems say what to wire', () => {
    const old = oldForm();
    old.outputs.allowed_cavity = null as never;
    expect(upgradeGraph(old)).toBe(old);
    expect(validate(old).problems).toContain('output "zone" is not filled - the engine reads it by name');
  });
});

describe('the Mark stack is checked as the engine checks it', () => {
  it('refuses naming the zone and an old output together, a zone from a set of faces, and a seen that is not a yes/no', () => {
    const both = bindOutput(defaultGraph(), 'zone', 'Z3');
    both.outputs = { ...both.outputs, allowed: 'AL' };
    expect(validate(both).problems).toContain('output "allowed" cannot be wired with a zone output - the zone decides it');
    expect(validate(bindOutput(defaultGraph(), 'zone', 'NS')).problems).toContain('output "zone" needs a zone, but NS gives mask');
    expect(validate(setParam(defaultGraph(), 'Z2', 'seen', 'true')).problems).toContain('Z2: "seen" must be true or false, not "true"');
    expect(validate(rewire(defaultGraph(), 'Z2', 'under', 'NS')).problems).toContain('Z2: input "under" takes zone, but NS gives mask');
  });

  it('a new Mark arrives with nothing under it and its seen switch on', () => {
    const g = addNode(defaultGraph(), 'markSupport');
    const added = g.nodes[g.nodes.length - 1]!;
    expect(added).toMatchObject({ kind: 'markSupport', params: { seen: true }, inputs: { under: null, faces: null } });
    expect(validate(g).problems).toEqual([`${added.id}: input "faces" is not connected`]);
  });
});

/* The aligner's graph (step 4.4b): locked, mirrored from the engine's dental/aligner_graph.rs. */
describe('the aligner graph is locked', () => {
  it('accepts only its default, and every node says what it is', () => {
    expect(validate(alignerGraph()).ok).toBe(true);
    for (const node of alignerGraph().nodes) expect(ALIGNER_KINDS[node.kind as keyof typeof ALIGNER_KINDS]?.says).toBeTruthy();
  });

  it('refuses each kind of edit, naming the node or output', () => {
    const edit = (change: (g: ReturnType<typeof alignerGraph>) => void) => { const g = alignerGraph(); change(g); return validate(g).problems.join(' | '); };
    expect(edit((g) => { g.nodes.find((n) => n.id === 'RIM')!.kind = 'rimLowPoints'; })).toMatch(/RIM: must be a rimLoopSharp/);
    expect(edit((g) => { (g.nodes.find((n) => n.id === 'AREA')!.params as Record<string, unknown>).widthMm = 3; })).toMatch(/AREA: takes no parameters/);
    expect(edit((g) => { (g.nodes.find((n) => n.id === 'ALLOWED')!.inputs as Record<string, string>).rim = 'TRIM'; })).toMatch(/ALLOWED: its inputs must stay/);
    expect(edit((g) => { g.nodes.splice(g.nodes.findIndex((n) => n.id === 'VIS'), 1); })).toMatch(/VIS: missing/);
    expect(edit((g) => { g.nodes.push({ id: 'R1', kind: 'parallelCast', params: {}, inputs: {} }); })).toMatch(/R1: a node cannot be added/);
    expect(edit((g) => { g.outputs.allowed = 'AREA'; })).toMatch(/output "allowed" must stay wired to ALLOWED/);
    expect(edit((g) => { (g.outputs as Record<string, string>).no_support = 'TRIM'; })).toMatch(/output "no_support" is not an aligner output/);
  });

  it('a graph with no kind is still a denture graph, and an unknown kind is refused', () => {
    expect(validate(defaultGraph()).ok).toBe(true);
    expect(validate({ ...defaultGraph(), kind: 'denture' }).ok).toBe(true);
    expect(validate({ ...alignerGraph(), kind: 'crown' }).problems[0]).toMatch(/"crown"/);
  });
});

/* The rim tab (section 10): stage 1's nodes per kind, with the rim-derived ones greyed. */
describe('the rim tab', () => {
  for (const kind of ['aligner', 'denture'] as const) {
    it(`${kind}: every node says what it is, and every wire points at a node on the tab`, () => {
      const view = rimTabView(kind);
      const ids = new Set(view.map((n) => n.id));
      for (const n of view) {
        expect(n.title && n.says, n.id).toBeTruthy();
        for (const [, from] of n.inputs) expect(ids.has(from as string), `${n.id} <- ${from}`).toBe(true);
      }
    });

    it(`${kind}: the rim plane and what follows it are greyed with the reason, and nothing else reads them`, () => {
      const view = rimTabView(kind);
      const greyed = new Set(view.filter((n) => n.derived).map((n) => n.id));
      expect(greyed.has('RIMPLANE')).toBe(true);
      for (const n of view.filter((v) => v.derived)) expect(n.reason).toBe(RIM_DERIVED_REASON);
      // THE INVARIANT: a node that is not greyed never reads a greyed one - the rim cannot depend on its own result.
      for (const n of view.filter((v) => !v.derived)) {
        for (const [, from] of n.inputs) expect(greyed.has(from as string), `${n.id} reads greyed ${from}`).toBe(false);
      }
    });
  }

  it('the aligner tab holds the locked aligner graph unchanged; the denture tab names the zone graph strips', () => {
    const tab = rimTabGraph('aligner').nodes;
    for (const n of alignerGraph().nodes) expect(tab.find((t) => t.id === n.id)).toEqual(n);
    const denture = rimTabGraph('denture').nodes.map((n) => n.id);
    for (const id of ['RIM', 'RIMBAND', 'LOWRIMBAND']) expect(denture).toContain(id);
    expect(rimTabView('denture').find((n) => n.id === 'CROSSING')!.derived).toBe(true);
  });

  // C3: the Rim tab is editable. Arch frame is gone (the same thing as Orient's Arch shape); the Rim says it reads tab
  // 1's final orientation; its four settings sit on the zone graph's RIM node and the strip widths on the profile.
  it('denture: no Arch frame; the Rim takes tab 1\'s orientation and offers its four settings at the engine defaults', () => {
    const view = rimTabView('denture');
    expect(view.map((n) => n.id)).not.toContain('FRAME');
    const rim = view.find((n) => n.id === 'RIM')!;
    expect(rim.takes).toEqual([RIM_TAKES]);
    expect(rim.fields.map((f) => [f.key, f.value, f.target])).toEqual([['source', 'finder', 'graph'], ['binDeg', 3, 'graph'], ['shellMm', 2, 'graph'], ['openGapDeg', 20, 'graph']]);
    expect(rim.problems).toEqual([]);
    expect(view.find((n) => n.id === 'RIMBAND')!.fields).toMatchObject([
      { key: 'rimBandInnerMm', value: RIM_STRIP_MM.rim_band, standard: RIM_STRIP_MM.rim_band, target: 'placement' },
      { key: 'rimBandOuterMm', value: RIM_STRIP_MM.rim_band, standard: RIM_STRIP_MM.rim_band, target: 'placement' },
      { key: 'dentalRimPitchMm', value: RIM_LINE_PITCH_MM, target: 'placement' }, { key: 'rimStripPitchMm', value: '', standard: '', target: 'placement' }]);
    expect(view.find((n) => n.id === 'RIMBAND')!.problems).toEqual([]);
    expect(rimTabView('aligner').every((n) => n.fields.length === 0)).toBe(true);
  });

  it('an edit shows on the tab and on the Rim output card, and an out-of-range one is named before any run', () => {
    const graph = setParam(setParam(defaultGraph(), 'RIM', 'source', 'flatEdge'), 'RIM', 'binDeg', 6);
    const view = rimTabView('denture', { graph, placement: { rimBandMm: 3 } });
    expect(view.find((n) => n.id === 'RIM')!.fields.find((f) => f.key === 'binDeg')!.value).toBe(6);
    // A 6 degree step needs an open gap of at least 12: the default 20 still fits.
    expect(view.find((n) => n.id === 'RIM')!.problems).toEqual([]);
    const lines = rimOutputLines('denture', { graph, placement: { rimBandMm: 3 } });
    expect(lines[0].text).toContain('the edge of the flat area');
    expect(lines[1].text).toContain('3 mm');
    const bad = rimTabView('denture', { graph: setParam(defaultGraph(), 'RIM', 'binDeg', 15), placement: { lowRimBandMm: 0 } });
    expect(bad.find((n) => n.id === 'RIM')!.problems).toContain('RIM: binDeg must be between 1 and 10, got 15');
    expect(bad.find((n) => n.id === 'LOWRIMBAND')!.problems).toEqual(['the low-point belt is 0 mm on both sides - it would cover nothing']);
    expect(validate(setParam(defaultGraph(), 'RIM', 'source', 'edge')).problems).toContain('RIM: "source" must be finder or flatEdge, got "edge"');
  });

  // Fable's review: the flat edge without a flat area falls back silently unless the tab says so first; and widths kept
  // in browser storage can differ from the run on screen, so the output card says what the run used.
  it('warns before the run that the flat edge needs a Stand on the flat area, and names the widths the run used', () => {
    const graph = setParam(defaultGraph(), 'RIM', 'source', 'flatEdge');
    expect(rimTabView('denture', { graph, standsOnFlatArea: false }).find((n) => n.id === 'RIM')!.problems).toContain(FLAT_EDGE_NEEDS_BASE);
    expect(rimTabView('denture', { graph, standsOnFlatArea: true }).find((n) => n.id === 'RIM')!.problems).toEqual([]);
    expect(rimTabView('denture', { standsOnFlatArea: false }).find((n) => n.id === 'RIM')!.problems).toEqual([]);
    const lines = rimOutputLines('denture', { placement: {}, ran: { rimBandMm: 3, lowRimBandMm: 5 } });
    expect(lines[1].text).toBe('Rim tips belt - 2 mm each side of the rim line (the run on screen used 3 mm each side of the rim line); rim tips at 2 mm over the whole belt');
    expect(lines[2].text).toBe('Low-point belt - 5 mm each side of the rim line; places no tips, lets a lowest point keep its tip');
  });

  // Owner 2026-11-23: "why strip width is locked?" - the hole strip's is not any more; a rim strip's stays the profile's.
  it('lets the hole strip take its own width, keeps a rim strip node\'s fixed, and refuses a width the engine would', () => {
    const band = defaultGraph().nodes.find((n) => n.id === 'BAND')!;
    const rimBand = defaultGraph().nodes.find((n) => n.id === 'RIMBAND')!;
    expect(fixedParam(band, 'mm')).toBe(false);
    expect(fixedParam(rimBand, 'mm')).toBe(true);
    expect(validate(setParam(defaultGraph(), 'BAND', 'mm', 3)).problems).toEqual([]);
    expect(validate(setParam(defaultGraph(), 'BAND', 'mm', 0)).problems).toContain('BAND: the hole strip\'s width must be above 0 and at most 20 mm, got 0');
    expect(validate(setParam(defaultGraph(), 'RIMBAND', 'mm', 4)).problems.join(' ')).toContain('"mm" is fixed');
  });

  // Owner 2026-11-23: tips along the rim line at one spacing; the strip's area like the supported area, or its own grid.
  it('sets the rim line\'s spacing and the strip area\'s, says both on the output card, and refuses what the engine would', () => {
    const profile = readFileSync(new URL('../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    expect(Number(/"downPitchMm\\?":\s*([0-9.]+)/.exec(profile)?.[1])).toBe(RIM_LINE_PITCH_MM);
    const placement = { dentalRimPitchMm: 1.5, rimStripPitchMm: 0 };
    const strip = rimTabView('denture', { placement }).find((n) => n.id === 'RIMBAND')!;
    expect(strip.fields.map((f) => f.value)).toEqual([RIM_STRIP_MM.rim_band, RIM_STRIP_MM.rim_band, 1.5, '0']);
    expect(strip.problems).toEqual([]);
    const lines = rimOutputLines('denture', { placement });
    expect(lines[0].text).toContain('tips every 1.5 mm along it');
    expect(lines[1].text).toContain('the rest of the belt gets the supported area\'s tips');
    expect(rimOutputLines('denture', { placement: { rimStripPitchMm: 3 } })[1].text).toContain('the rest of the belt a 3 mm grid');
    expect(placementProblem('rimStripPitchMm', 0.1)).toBe('rimStripPitchMm must be 0 (like the supported area) or 0.2 to 10 mm, got 0.1');
    expect(placementProblem('dentalRimPitchMm', 0)).toContain('must be 0.2 to 10 mm');
    expect(placementProblem('rimStripPitchMm', '3')).toContain('must be a number');
    expect(placementProblem('tipPitchMm', 1)).toContain('sets only rimBandMm, lowRimBandMm, dentalRimPitchMm, rimStripPitchMm');
    // Every choice the dropdown offers passes the check, so no choice is refused only after a press.
    for (const [value] of strip.fields.find((f) => f.key === 'rimStripPitchMm')!.choices!) if (value !== '') expect(placementProblem('rimStripPitchMm', Number(value))).toBeNull();
  });

  // Owner 2026-11-23: the rim line is one node and the belt another, with an inner and an outer width.
  it('sets a belt\'s inner and outer widths, each side falling back to the symmetric width, and refuses one that covers nothing', () => {
    expect(beltOf({}, 'RIMBAND')).toEqual({ inner: RIM_STRIP_MM.rim_band, outer: RIM_STRIP_MM.rim_band, both: RIM_STRIP_MM.rim_band });
    expect(beltOf({ rimBandMm: 3, rimBandOuterMm: 0 }, 'RIMBAND')).toEqual({ inner: 3, outer: 0, both: 3 });
    const placement = { rimBandInnerMm: 3, rimBandOuterMm: 0 };
    const belt = rimTabView('denture', { placement }).find((n) => n.id === 'RIMBAND')!;
    expect(belt.title).toBe('Rim tips belt');
    expect(belt.fields.slice(0, 2).map((f) => [f.key, f.value])).toEqual([['rimBandInnerMm', 3], ['rimBandOuterMm', 0]]);
    expect(belt.problems).toEqual([]);
    expect(rimOutputLines('denture', { placement })[1].text).toContain('Rim tips belt - inner 3 mm, outer 0 mm from the rim line');
    expect(beltProblem({ lowRimBandInnerMm: 0, lowRimBandOuterMm: 0 }, 'LOWRIMBAND')).toContain('cover nothing');
    expect(placementProblem('rimBandInnerMm', 25)).toBe('rimBandInnerMm must be 0 to 20 mm, got 25');
  });
});

// WORKBENCH-TABS-PLAN section 4: every restore mark puts back the STANDARD graph's value first, the kind's second.
describe('a restore mark puts back the standard value', () => {
  it('R1b restores to off (0), never to its kind\'s 45, and a new node to its kind\'s default', () => {
    const r1b = defaultGraph().nodes.find((n) => n.id === 'R1b')!;
    expect(defaultOf({ ...r1b, params: { ...r1b.params, deg: 70 } }, 'deg')).toBe(0);
    const added = addNode(defaultGraph(), 'parallelCast').nodes.at(-1)!;
    expect(defaultOf(added, 'deg')).toBe(KINDS.parallelCast.params.deg);
    expect(defaultOf(added, 'noSuchKey')).toBeUndefined();
  });
});

/* The canvas status compares the canvas to the graph the run recorded, which the summary writes with sorted keys. */
describe('the canvas holds the graph that ran', () => {
  it('whatever order the keys were written in, and not once a value or the node order differs', () => {
    const g = defaultGraph();
    const resorted = JSON.parse(JSON.stringify(g, (_, v) => (v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().reverse().map((k) => [k, v[k]])) : v)));
    expect(JSON.stringify(resorted)).not.toBe(JSON.stringify(g));
    expect(sameGraph(g, resorted)).toBe(true);
    expect(sameGraph(g, setParam(g, 'RIM', 'binDeg', 5))).toBe(false);
    expect(sameGraph(g, { ...g, nodes: [...g.nodes].reverse() })).toBe(false);
  });
});
