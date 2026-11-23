/*
 * ONE JOB: the Zones tab's live preview (docs/WORKBENCH-TABS-PLAN.md D3): every zone-graph node's value per face for
 * the canvas's graph on one scan, without placing a tip or building a support - seconds, not a run. Spawned by
 * serve.mjs POST /zone-preview through vite-node, like benchwork spawns batch.ts.
 *
 * THE MESH IS LOADED EXACTLY AS reviewCase.ts LOADS IT (parse, the same degenerate-triangle clean-up, the same
 * centring), because the viewer tints the review GLB's model by face index: one face more or less and every tint lands
 * on the wrong face. The viewer still checks the face count before drawing.
 *
 * Arguments: --source <stl> --out <dir> [--graph <json file>] [--steep <deg>]. Writes <out>/zone-preview.json
 * ({ ids, faces, bin, seconds }) and <out>/zone-preview.bin (the values, node after node). Exit 2 when the engine
 * refuses the graph, with the reason on stderr.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { removeDegenerateTriangles } from '@mixo-geocore/host/core/removeDegenerate';
import { setZoneGraph, ZoneGraphRefused, zoneNodesOf } from '@mixo-geocore/host/dental/zoneGraph';
import { nodeEngine, parseStl, useNodeEngine } from '../../scripts/node-engine';
import { reviewProfileId } from './profileSelect';

// The dental engine in this process is the node build, as the batch's own review uses (scripts/dental-region-review).
useNodeEngine();

const arg = (name: string): string | undefined => { const k = process.argv.indexOf(name); return k >= 0 ? process.argv[k + 1] : undefined; };
const source = arg('--source');
const out = arg('--out');
if (!source || !out) { process.stderr.write('zonePreviewRun: --source and --out are required\n'); process.exit(1); }
const started = Date.now();
const bytes = readFileSync(source);
const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
const cleaned = removeDegenerateTriangles(nodeEngine, mesh.positions, mesh.indices);
if (cleaned.removed > 0) mesh.indices = cleaned.indices;
nodeEngine.center_positions_in_place(mesh.positions);
const graphFile = arg('--graph');
try {
  setZoneGraph(graphFile ? JSON.parse(readFileSync(graphFile, 'utf8')) : null);
} catch (error) {
  process.stderr.write(`The zone graph was refused: ${error instanceof ZoneGraphRefused ? error.detail : (error as Error).message}\n`);
  process.exit(2);
}
// The built-in denture profile: a draft type's own numbers (the strip widths) are registered only inside a run, so the
// preview says so on the page rather than pretending to use them.
const nodes = zoneNodesOf(mesh, reviewProfileId('denture'), Number(arg('--steep') ?? 0));
const faces = mesh.indices.length / 3;
writeFileSync(join(out, 'zone-preview.bin'), Buffer.concat(nodes.map((n) => Buffer.from(n.values.buffer, n.values.byteOffset, n.values.byteLength))));
writeFileSync(join(out, 'zone-preview.json'), JSON.stringify({ ids: nodes.map((n) => n.id), faces, bin: 'zone-preview.bin', seconds: Math.round((Date.now() - started) / 100) / 10 }));
