/*
 * ONE JOB: the live preview of tabs 4 and 5 (docs/WORKBENCH-TABS-PLAN.md D3): with the page's settings, the engine's
 * print-angle search on one scan and the tips at the angle it picks - no support built, seconds instead of a run.
 * Tab 4 draws the tips, tab 5 the angles and the pick. Spawned by serve.mjs POST /tilt-preview through vite-node.
 *
 * THE SAME INPUTS AS A RUN. The server hands over exactly what /rerun hands benchwork - MIXO_RULES, and for a draft
 * type MIXO_TYPE_ID with MIXO_POSE_FILE / MIXO_PLACEMENT_FILE / the graph files - and this reads them with the run's
 * own code (`typeOfRun`, `putInForce`, `dentureScanSettings`), so the preview cannot use a setting the run would not.
 * The mesh is loaded exactly as reviewCase.ts loads it, so a tip lands where the run's would.
 *
 * WHERE THE TIPS ARE DRAWN. The engine gives them in the scan's own frame; the review GLB shows the model under the
 * run's frame (`<case>-orient.json` `frame`). With `--frame` they are written in that display space, so they sit on
 * the model on screen whatever angle the preview picked; without it they are not written, and the page says why.
 *
 * Arguments: --source <stl> --out <dir> [--frame <json file>]. Writes <out>/tilt-preview.json. Exit 2 when a setting
 * or graph is refused, with the reason on stderr.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { removeDegenerateTriangles } from '@mixo-geocore/host/core/removeDegenerate';
import { transformPoint } from '@mixo-geocore/host/state/transform';
import type { JobTransform } from '@mixo-geocore/host/core/jobs';
import { openLiveTilt, scanDentureTilts } from '@mixo-geocore/host/dental/dentureTilt';
import { setZoneGraph } from '@mixo-geocore/host/dental/zoneGraph';
import { setOrientGraph } from '@mixo-geocore/host/dental/orientGraph';
import { nodeEngine, useNodeEngine } from '../../scripts/node-engine';
import { readMeshFile } from '../../scripts/meshFile';
import { dentureScanSettings, reviewProfileId } from './profileSelect';
import { putInForce, typeOfRun } from './typeInForce';
import { tiltPreviewOf } from './tiltPreview.mjs';

useNodeEngine();

const arg = (name: string): string | undefined => { const k = process.argv.indexOf(name); return k >= 0 ? process.argv[k + 1] : undefined; };
const source = arg('--source');
const out = arg('--out');
if (!source || !out) { process.stderr.write('tiltPreviewRun: --source and --out are required\n'); process.exit(1); }
const started = Date.now();
const bytes = readFileSync(source);
const mesh = await readMeshFile(bytes, source);
const cleaned = removeDegenerateTriangles(nodeEngine, mesh.positions, mesh.indices);
if (cleaned.removed > 0) mesh.indices = cleaned.indices;
nodeEngine.center_positions_in_place(mesh.positions);

try {
  // A draft type (the search, the strip widths, a name) is registered and put in force exactly as batch.ts does;
  // without one the graphs the page sent are set the way batch.ts sets --zone-graph / --orient-graph.
  const type = typeOfRun('denture', process.env);
  if (type) putInForce(type, process.env);
  else {
    setZoneGraph(process.env.MIXO_ZONE_GRAPH_FILE ? JSON.parse(readFileSync(process.env.MIXO_ZONE_GRAPH_FILE, 'utf8')) : null);
    setOrientGraph(process.env.MIXO_ORIENT_GRAPH_FILE ? JSON.parse(readFileSync(process.env.MIXO_ORIENT_GRAPH_FILE, 'utf8')) : null);
  }
} catch (error) {
  process.stderr.write(`The preview's settings were refused: ${(error as { detail?: string }).detail ?? (error as Error).message}\n`);
  process.exit(2);
}

const profileId = reviewProfileId('denture');
const settings = dentureScanSettings(profileId);
const scan = scanDentureTilts(mesh, profileId, settings);
const frameFile = arg('--frame');
const frame = frameFile ? JSON.parse(readFileSync(frameFile, 'utf8')) as JobTransform : null;
let tips: { position: [number, number, number]; state: string }[] | null = null;
if (scan.kind === 'scan' && frame) {
  const live = openLiveTilt(mesh, profileId, settings);
  try {
    const paths = live.ok ? live.at(scan.rows[scan.order[0]!]!.tiltDeg) : null;
    tips = paths?.kind === 'paths' ? paths.tips.map((t) => ({ position: transformPoint(frame, t.position) as [number, number, number], state: t.state })) : null;
  } finally {
    live.free();
  }
}
writeFileSync(join(out, 'tilt-preview.json'), JSON.stringify({ ...tiltPreviewOf(scan, tips), seconds: Math.round((Date.now() - started) / 100) / 10 }));
