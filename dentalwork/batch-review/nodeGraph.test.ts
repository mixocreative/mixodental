import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  KINDS, PRINT_ANGLE_SEARCH, REQUIRED_OUTPUTS, addNode, bindOutput, defaultGraph, isDefault, removeNode, rewire, setParam, unreached, validate,
} from './nodeGraph.mjs';

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
    expect(validate(defaultGraph()).warnings).toEqual(['R1b: a parallel cast at 0 deg casts nothing - it is off']);
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
    expect(() => addNode(defaultGraph(), 'rimCurve')).toThrow(/stage 1/);
    expect(() => removeNode(defaultGraph(), 'RIM')).toThrow(/stage 1/);
  });

  it('refuses a wire between the wrong types - a depth map is not a mask', () => {
    const g = rewire(defaultGraph(), 'NS', 'b', 'MAP');
    expect(validate(g).problems).toContain('NS: input "b" takes mask, but MAP gives depthMap');
  });

  it('lets a Band take faces OR a curve, because the engine does both', () => {
    const g = defaultGraph();
    expect(validate(rewire(g, 'BAND', 'seeds', 'RIM')).problems).toEqual([]);
    expect(validate(rewire(g, 'RIMBAND', 'seeds', 'HOLES')).problems).toEqual([]);
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
