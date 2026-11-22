import '../../scripts/test-support/useNodeEngine';
import { describe, expect, it } from 'vitest';
import { kindOfProfile, profileIdsOf } from '@mixo-geocore/host/dental/dentalKind';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { NOT_YET } from './shippedTypes';
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

  it('refuses a graph-carrying type with the app\'s own reason, without importing the workbench', () => {
    const graph = { ...type('test-graph'), zoneGraph: { nodes: [], outputs: {} } };
    const found = registerTypes({ '/types/denture/test-graph.type.json': typeFileText(graph) });
    expect(found.refused[0]!.reason).toContain(NOT_YET.graph);
  });
});
