import '../../scripts/test-support/useNodeEngine';
import { describe, expect, it } from 'vitest';
import { kindOfProfile, profileIdsOf } from '@mixo-geocore/host/dental/dentalKind';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { zoneGraphDigest } from '@mixo-geocore/host/dental/zoneGraph';
import { orientGraphDigest } from '@mixo-geocore/host/dental/orientGraph';
import { defaultGraph, upgradeGraph } from '../../dentalwork/batch-review/nodeGraph.mjs';
import { flatBaseGraph } from '../../dentalwork/batch-review/orientGraph.mjs';
import { applyTypeGraphs } from './typeGraphs';
import { typeFileText, type TypeFile } from './typeFile';
import { refusedTypes, registerTypes, shippedBadge } from './typesReady';

/* The app's sources as text, the way src/browserFloor.test.ts reads them: keyed by path from src/. */
const SOURCES = import.meta.glob(['../main.tsx', '../workers/*.ts', '../denture/engine/*.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const read = (path: string): string => {
  const text = SOURCES[path];
  if (text === undefined) throw new Error(`no source ${path} - widen the glob above`);
  return text;
};

/*
 * EVERY REALM REGISTERS THE TYPES. The app runs the engine in each worker as well as on the main thread, each with its
 * own profile list; an entry that still awaits `geometryReady()` would run without the shipped types, and a saved type
 * would be listed in the picker and unknown where it runs. The entries are read from `factories.ts`, so a new worker
 * is covered the day it is added.
 */
describe('every engine realm awaits typesReady', () => {
  const factories = read('../workers/factories.ts');
  // `new URL('./x.ts', ...)` in factories.ts is relative to src/workers; the glob keys are relative to src/dentalTypes.
  const entries = [...factories.matchAll(/new URL\('([^']+)', import\.meta\.url\)/g)]
    // `../x` from src/workers and from src/dentalTypes is the same file (both sit directly under src/).
    .map(([, path]) => (path!.startsWith('../') ? path! : `../workers/${path!.replace(/^\.\//, '')}`));
  it('finds the workers', () => {
    expect(entries.length).toBeGreaterThanOrEqual(5);
  });

  // No exceptions: the vendored mesh worker waits on typesReady through setMeshWorkerReady (aligner jobs resolve their
  // profile by id in its engine), so it is held to the same rule.
  it('main.tsx and every worker entry use typesReady, never geometryReady', () => {
    for (const file of ['../main.tsx', ...entries]) {
      const name = file.split('/').pop()!;
      const code = read(file);
      expect(code, name).not.toMatch(/\bgeometryReady\b/);
      expect(code, name).toMatch(/\btypesReady\b/);
    }
  });

  it('the mesh worker sets its wait at the top level, before any job can arrive', () => {
    expect(read('../workers/meshWorker.entry.ts')).toMatch(/^setMeshWorkerReady\(typesReady\);$/m);
  });
});

describe('registerTypes - a saved type becomes a profile this realm knows', () => {
  const generic = Object.values(DENTURE_PROFILE_FILES)[0] as Record<string, unknown>;
  const type = (id: string, badge?: string): TypeFile => ({
    typeFile: 1, category: 'denture', id, basedOn: String(generic.id),
    profile: { ...generic, id, name: { en: id, ja: id, 'zh-Hant': id } }, rules: {}, zoneGraph: null, validation: null,
    ...(badge ? { badge } : {}),
  });

  it('lists it as a denture type with its badge, and lists a broken file as refused with its reason', () => {
    const found = registerTypes({
      '/types/denture/test-soft.type.json': typeFileText(type('test-soft', 'SOFT')),
      '/types/denture/test-broken.type.json': '{"typeFile":1}',
    });
    expect(found.loaded.map((t) => t.id)).toEqual(['test-soft']);
    expect(profileIdsOf('denture')).toContain('test-soft');
    expect(kindOfProfile('test-soft')).toBe('denture');
    expect(shippedBadge('test-soft')).toBe('SOFT');
    expect(refusedTypes().map((r) => [r.id, r.reason.includes('missing key')])).toEqual([['test-broken', true]]);
  });

  // Plan E1. The app checks a type's graphs with the ENGINE (it imports no workbench validator), so a graph the engine
  // will not run is refused with the engine's own reason, and the check leaves the slots at the default.
  it('refuses a type whose graph the engine will not run, with the engine\'s reason, and leaves the slots at the default', () => {
    const zone = { ...type('test-graph'), zoneGraph: { nodes: [], outputs: {} } };
    const orient = { ...type('test-orient'), orientGraph: { nodes: [], outputs: {} } };
    const found = registerTypes({
      '/types/denture/test-graph.type.json': typeFileText(zone),
      '/types/denture/test-orient.type.json': typeFileText(orient),
    });
    expect(found.loaded).toEqual([]);
    expect(found.refused.map((r) => r.id)).toEqual(['test-graph', 'test-orient']);
    for (const r of found.refused) expect(r.reason, r.id).not.toContain('missing key');
    expect(zoneGraphDigest()).toBe('default');
    expect(orientGraphDigest()).toBe('default');
  });

  it('refuses a zone graph that turns the steep ray on, since a type cannot set the rule it needs', () => {
    const graph = upgradeGraph(defaultGraph()) as { nodes: { id: string; params: Record<string, unknown> }[] };
    const steep = { ...graph, nodes: graph.nodes.map((n) => (n.id === 'R1b' ? { ...n, params: { ...n.params, deg: 60 } } : n)) };
    const found = registerTypes({ '/types/denture/test-steep.type.json': typeFileText({ ...type('test-steep'), zoneGraph: steep }) });
    expect(found.refused[0]?.reason).toContain('steep ray R1b');
  });

  it('loads a type with runnable graphs and puts them in force for its jobs only', () => {
    const zone = upgradeGraph(defaultGraph()) as Record<string, unknown>;
    const orient = flatBaseGraph() as unknown as Record<string, unknown>;
    const found = registerTypes({ '/types/denture/test-flat.type.json': typeFileText({ ...type('test-flat'), zoneGraph: zone, orientGraph: orient }) });
    expect(found.refused).toEqual([]);
    applyTypeGraphs('test-flat');
    expect(zoneGraphDigest()).not.toBe('default');
    expect(orientGraphDigest()).not.toBe('default');
    // The next job on a type without graphs must not inherit them: the engine holds one slot each.
    applyTypeGraphs(String(generic.id));
    expect(zoneGraphDigest()).toBe('default');
    expect(orientGraphDigest()).toBe('default');
  });
});

/* Every denture job puts its type's graphs in force beside the drawn rim and the flip - one helper, every site. */
describe('every denture job sets the type graph slots', () => {
  it('the denture core and worker set the case slots through setCaseSlots, never the rim or flip alone', () => {
    const calls = (file: string) => [...read(file).matchAll(/\b(setDentureDrawnRim|setDentureCaseFlip|applyTypeGraphs)\(/g)].length;
    expect(calls('../denture/engine/dentureWorker.ts')).toBe(0);
    // Once each, inside setCaseSlots itself.
    expect(calls('../denture/engine/dentureCore.ts')).toBe(3);
    expect(read('../denture/engine/dentureCore.ts')).toMatch(/applyTypeGraphs\(profileId\);\n\s+setDentureDrawnRim\(drawnRim \?\? null\);\n\s+setDentureCaseFlip\(caseFlip \?\? null\);/);
  });
});
