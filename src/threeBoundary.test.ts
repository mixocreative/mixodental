import { describe, expect, it } from 'vitest';

// three.js stays in the view layer (src/components) so the rules and the core port to a Babylon.js
// host. The glTF loader is the listed exception (STL is read and welded without
// three, src/core/import); tests may use three as a reference.
const SOURCES = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true });
const VIEW_LAYER = /^\.\/components\//;
/**
 * ONE exception left. `App.tsx` was the other: it parsed glTF with the loader on the main thread.
 * That parse now lives in `components/useImportFiles.ts`, which is INSIDE the view layer — so the
 * exception did not move, it stopped being needed. The third test keeps a stale entry from sitting
 * here unnoticed, and is what caught this one.
 */
const LOADER_EXCEPTIONS: Record<string, string> = {
  './state/import.ts': 'walks the GLTFLoader scene graph (gltfRawMeshes) and takes BufferGeometry inputs in tests (geometryToMesh); the weld is typed-array (src/core/import)',
};
const THREE_IMPORT = /\b(?:import|export)\s[^'"`;]*?\sfrom\s*['"](three|three\/[^'"]*|@react-three\/[^'"]*|three-mesh-bvh|three-stdlib)['"]/;

describe('three.js boundary', () => {
  it('scans the app sources', () => {
    expect(Object.keys(SOURCES)).toContain('./state/project.ts');
  });

  it('keeps three.js in the view layer and the listed loaders', () => {
    const outside = Object.entries(SOURCES)
      .filter(([file, source]) => !VIEW_LAYER.test(file) && THREE_IMPORT.test(source))
      .map(([file]) => file)
      .filter((file) => !(file in LOADER_EXCEPTIONS));
    expect(outside).toEqual([]);
  });

  it('lists only exceptions that still import three.js', () => {
    expect(Object.keys(LOADER_EXCEPTIONS).filter((file) => !THREE_IMPORT.test(SOURCES[file] ?? ''))).toEqual([]);
  });
});
