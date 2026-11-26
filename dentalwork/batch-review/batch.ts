/*
 * Folder review: every scan (STL, GLB, glTF) under the given folders goes through the app's own dental pipeline
 * (see reviewCase.ts), and each result is written as a review GLB plus one summary for the viewer
 * (`serve.mjs`).
 *
 *   npx vite-node --script dentalwork/batch-review/batch.ts [--kind aligner|denture] --out <folder> <stl folder> [more folders]
 *
 * Output names are case-001.glb, case-002.glb...; the original file paths appear only in
 * summary.json / summary.csv inside the output folder, which Git ignores (patient data).
 * Any error exits non-zero (the engine's wasm keeps no handles open, but exit explicitly anyway).
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { reviewCase, type CaseRow } from './reviewCase';
import { parseKind } from './profileSelect';
import { RULE_DEFAULTS } from './ruleDefaults';
import { setZoneGraph, ZoneGraphRefused } from '@mixo-geocore/host/dental/zoneGraph';
import { OrientGraphRefused, orientGraphDigest, setOrientGraph } from '@mixo-geocore/host/dental/orientGraph';
import { putInForce, recordType, typeOfRun } from './typeInForce';
import { SCAN_FILE } from './scanSet.mjs';

async function main(): Promise<void> {
const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
if (outAt < 0 || !args[outAt + 1]) throw new Error('Usage: batch.ts [--kind aligner|denture] --out <folder> <stl folder> [more folders]');
const kindAt = args.indexOf('--kind');
const kind = parseKind(kindAt < 0 ? undefined : args[kindAt + 1]);
const out = resolve(args[outAt + 1]!);
const roots = args.filter((_, k) => k !== outAt && k !== outAt + 1 && (kindAt < 0 || (k !== kindAt && k !== kindAt + 1))).map((root) => resolve(root.replace(/"/g, '')));

// The same scan formats the workbench imports (scanSet.mjs SCAN_FILE): STL, GLB, glTF.
function scansUnder(path: string): string[] {
  if (!statSync(path, { throwIfNoEntry: false })) return [];
  if (statSync(path).isFile()) return SCAN_FILE.test(path) ? [path] : [];
  return readdirSync(path).sort().flatMap((name) => scansUnder(join(path, name)));
}

const files = roots.flatMap(scansUnder);
if (files.length === 0) {
  process.stderr.write('No .stl files found in the given folders (nor .glb or .gltf).\n');
  process.exit(1);
}
mkdirSync(out, { recursive: true });

// THE ZONE GRAPH the node editor composed, when one was sent (benchwork --zone-graph, engine 69). The
// engine validates it when it is SET, so a graph it cannot run stops the batch HERE, naming the node -
// never halfway through, and never by quietly running the default instead. What ran is recorded in
// summary.json, because an edited graph and the default otherwise look identical on screen.
let zoneGraph = 'default';
// The graph itself, so the review page can tell which of its canvas's nodes ran (plan D2's per-node preview); null =
// the engine's own standard setup.
let zoneGraphRan: unknown = null;
// The Orient graph that ran (U6): set by a type (putInForce) or by --orient-graph below; "default" = today's Step 1.
let orientGraph = 'default';
// The Orient graph itself (null = the standard Step 1), so the review page's side labels can follow the canvas's side
// choices against the ones that ran (sidePreview.mjs).
let orientGraphRan: unknown = null;
// A TYPE (benchwork --type, or the review page's Apply): refused here, before any case runs, for
// exactly what a saved type file would be refused for. It carries its own rules and graph.
let type: ReturnType<typeof typeOfRun> = null;
try {
  type = typeOfRun(kind, process.env);
  if (type) {
    zoneGraph = putInForce(type, process.env);
    zoneGraphRan = type.zoneGraph ?? null;
    orientGraph = orientGraphDigest();
    orientGraphRan = type.orientGraph ?? null;
    process.stdout.write(`Type: ${type.id} (based on ${type.basedOn}), zone graph ${zoneGraph}\n`);
  }
} catch (error) {
  process.stderr.write(`The type was refused: ${(error as Error).message}\n`);
  process.exit(2);
}
if (!type && process.env.MIXO_ZONE_GRAPH_FILE) {
  try {
    zoneGraphRan = JSON.parse(readFileSync(process.env.MIXO_ZONE_GRAPH_FILE, 'utf8'));
    zoneGraph = setZoneGraph(zoneGraphRan);
  } catch (error) {
    process.stderr.write(`The zone graph was refused: ${error instanceof ZoneGraphRefused ? error.detail : (error as Error).message}\n`);
    process.exit(2);
  }
  process.stdout.write(`Zone graph: ${zoneGraph} (the edited graph from the node editor)\n`);
}
// THE ORIENT GRAPH the review page's Orient canvas composed (benchwork --orient-graph, engine 71; docs/ORIENT-NODES.md
// U6). Step 1 IS this graph; set before any case, refused by node name here - never halfway through - and recorded in
// summary.json, because an edited Step 1 and the default otherwise look alike on screen.
if (!type && process.env.MIXO_ORIENT_GRAPH_FILE) {
  try {
    orientGraphRan = JSON.parse(readFileSync(process.env.MIXO_ORIENT_GRAPH_FILE, 'utf8'));
    orientGraph = setOrientGraph(orientGraphRan);
  } catch (error) {
    process.stderr.write(`The Orient graph was refused: ${error instanceof OrientGraphRefused ? error.detail : (error as Error).message}\n`);
    process.exit(2);
  }
  process.stdout.write(`Orient graph: ${orientGraph} (the edited Step 1 from the Orient canvas)\n`);
}
// The rim strip widths this run used, from the type in force (a draft with the Rim tab's edits, or a saved type), so
// the review page can say when its Rim tab shows other numbers than the run on screen (Fable's review). null = the
// built-in profile's own.
// The belts' inner and outer widths ride along when set (2026-11-24): without them a run with a one-sided belt read
// as the standard on the page, and the Rim tab's live preview could not tell it from the edits.
const BELT_KEYS = ['rimBandMm', 'lowRimBandMm', 'rimBandInnerMm', 'rimBandOuterMm', 'lowRimBandInnerMm', 'lowRimBandOuterMm'] as const;
const typePlacement = type?.category === 'denture' ? type.profile.placement as Record<string, unknown> | undefined : undefined;
const placementRan = typePlacement ? Object.fromEntries(BELT_KEYS.filter((k) => typeof typePlacement[k] === 'number').map((k) => [k, typePlacement[k]])) : null;

const rows: CaseRow[] = [];
for (const [k, file] of files.entries()) {
  const name = `case-${String(k + 1).padStart(3, '0')}`;
  process.stdout.write(`[${k + 1}/${files.length}] ${name} ... `);
  const row = await reviewCase(file, name, out, kind);
  rows.push(row);
  process.stdout.write(`${row.result}${row.verdict ? ` / ${row.verdict}` : ''}${row.reason ? ` (${row.reason})` : ''}${row.printAngleDeg === null ? '' : `, print angle ${row.printAngleDeg}° (stable ${row.stableBand})`} in ${row.seconds} s
`);
  writeSummary(rows, out, zoneGraph, orientGraph, zoneGraphRan, orientGraphRan, placementRan);
}

if (type) recordType(out, type, files);
const look = rows.filter((row) => row.needsLook).length;
process.stdout.write(`
Done: ${rows.length} file(s), ${look} need a look. Output: ${out}
`);
const failed = rows.filter((row) => row.result === 'error').length;
if (failed > 0) throw new Error(`${failed} file(s) could not be read or built (see the lines above).`);
}

function writeSummary(rows: CaseRow[], out: string, zoneGraph: string, orientGraph: string, zoneGraphRan: unknown, orientGraphRan: unknown, placementRan: unknown): void {
  writeFileSync(join(out, 'summary.json'), JSON.stringify({ created: new Date().toISOString(), ruleDefaults: RULE_DEFAULTS, zoneGraph, zoneGraphRan, orientGraph, orientGraphRan, placementRan, cases: rows }, null, 2));
  const columns = Object.keys(rows[0]!) as Array<keyof CaseRow>;
  const cell = (value: unknown) => /[",\n]/.test(String(value ?? '')) ? `"${String(value).replace(/"/g, '""')}"` : String(value ?? '');
  writeFileSync(join(out, 'summary.csv'), [columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\r\n'));
}

main().then(() => process.exit(0), (error) => {
  process.stderr.write(`Folder review failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
