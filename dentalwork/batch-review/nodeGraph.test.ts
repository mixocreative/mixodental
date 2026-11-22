import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  DIRECTIONS, FIXED, KINDS, KIND_GROUP, KIND_WORDS, NODE_GROUPS, OUTPUT_WORDS, PARAM_WORDS, PRINT_ANGLE_SEARCH, REQUIRED_OUTPUTS,
  ALIGNER_KINDS, OLD_KINDS, addNode, alignerGraph, bindOutput, defaultGraph, isDefault, removeNode, rewire, setParam, unreached, upgradeGraph, validate,
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
    const profile = readFileSync(new URL('../../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    const read = (key: string) => Number(new RegExp(`${key}\\\\?":\\s*([0-9.]+)`).exec(profile)?.[1]);
    const mm = (id: string) => defaultGraph().nodes.find((n) => n.id === id).params.mm;
    expect(mm('RIMBAND')).toBe(read('rimBandMm'));
    expect(mm('LOWRIMBAND')).toBe(read('lowRimBandMm'));
  });
});

describe('the print-angle search node shows what the engine actually searches', () => {
  it('matches the shipped denture profile, so the node cannot drift from the engine', () => {
    const profile = readFileSync(new URL('../../vendor/mixo-geocore/host/dental/dentureProfileFiles.ts', import.meta.url), 'utf8');
    const read = (key: string) => Number(new RegExp(`${key}\\\\?":\\s*([0-9.]+)`).exec(profile)?.[1]);
    expect(read('tiltRangeDeg')).toBe(PRINT_ANGLE_SEARCH.endDeg);
    expect(read('tiltStepDeg')).toBe(PRINT_ANGLE_SEARCH.stepDeg);
    expect(read('tiltMarginDeg')).toBe(PRINT_ANGLE_SEARCH.marginDeg);
    // 0 is upright by the engine's own definition, not a profile field.
    expect(PRINT_ANGLE_SEARCH.startDeg).toBe(0);
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
    // allowed = sight || band, and allowed_cavity is the sight result BEFORE the band - a wire, not a position.
    expect(n('AL')).toMatchObject({ kind: 'union', inputs: { a: 'SIGHT', b: 'BAND' } });
    expect(g.outputs.allowed_cavity).toBe('SIGHT');
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
    // The rule rimRespectsNoSupport reads allowed_cavity, so losing the sight cast must be loud.
    expect(problems).toContain('output "allowed_cavity" is not filled - the engine reads it by name');
    expect(problems).toContain('AL: input "a" is not connected');
  });

  it('refuses to add or remove what stage 1 finds', () => {
    expect(() => addNode(defaultGraph(), 'rim')).toThrow(/stage 1/);
    expect(() => removeNode(defaultGraph(), 'RIM')).toThrow(/stage 1/);
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
