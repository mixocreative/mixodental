import './test-support/useNodeEngine';
/**
 * sha256 of every STL the headless export path writes: each golden fixture x its variants (the
 * generic printable export, assembled as the app does) and the dental reference aligner with its
 * Step 3 supports. Used to prove an engine or host change leaves exports byte-identical:
 *   npx vite-node scripts/export-hashes.ts .tmp/pe5-exports.json
 * (a file argument writes the JSON; without one it prints it).
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { GOLDEN_FIXTURES } from '../src/goldens/fixtures';
import { supportedUnit } from '../src/goldens/pipeline';
import { emptyScene } from '../src/state/project';
import { encodeStl, planExport } from '@mixo-geocore/host/supports/export';
import { runSupportJob } from '@mixo-geocore/host/supports/jobRunner';
import { unitSupportMesh } from '@mixo-geocore/host/supports/unitSupports';
import { base, jobAt, mesh as referenceMesh } from './test-support/referenceStep3';

const sha256 = (buffer: ArrayBuffer): string => createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
const out: Record<string, { bytes: number; sha256: string }> = {};
const record = (name: string, buffer: ArrayBuffer) => { out[name] = { bytes: buffer.byteLength, sha256: sha256(buffer) }; };

for (const fixture of GOLDEN_FIXTURES) {
  for (const variant of fixture.variants) {
    const supported = supportedUnit(fixture, variant);
    const preview = unitSupportMesh(supported, 0, 'preview');
    const exported = unitSupportMesh(supported, 0, 'export');
    const scene = { ...emptyScene, units: [supported], selectedUnitIds: [supported.id], activeUnitId: supported.id };
    for (const kind of ['active-printable', 'active-supports'] as const) {
      const [file] = planExport(scene, kind, new Map([[supported.id, preview]]));
      const parts = file!.parts
        .map((part) => ({ mesh: part.content === 'model' ? supported.source : exported, transform: supported.transform }))
        .filter((part) => part.mesh.indices.length > 0);
      record(`generic/${fixture.name}.${variant}.${kind}.stl`, encodeStl(parts));
    }
  }
}

// Dental: the reference aligner in its Step 3 pose, model + supports, from the export-mode job.
const job = jobAt(base, 'export');
const supports = runSupportJob(job);
record('dental/reference-aligner.printable.stl', encodeStl([{ mesh: referenceMesh, transform: job.frame }, { mesh: supports, transform: job.frame }]));
record('dental/reference-aligner.supports.stl', encodeStl([{ mesh: supports, transform: job.frame }]));

const text = `${JSON.stringify(out, null, 2)}\n`;
const target = process.argv[2];
if (target) writeFileSync(target, text); else process.stdout.write(text);
console.error(`export-hashes: ${Object.keys(out).length} files`);
