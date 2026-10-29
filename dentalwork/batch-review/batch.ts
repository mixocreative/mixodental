/*
 * Folder review: every STL under the given folders goes through the app's own dental pipeline
 * (see reviewCase.ts), and each result is written as a review GLB plus one summary for the viewer
 * (`serve.mjs`).
 *
 *   npx vite-node --script dentalwork/batch-review/batch.ts --out <folder> <stl folder> [more folders]
 *
 * Output names are case-001.glb, case-002.glb...; the original file paths appear only in
 * summary.json / summary.csv inside the output folder, which Git ignores (patient data).
 * Any error exits non-zero (the engine's wasm keeps no handles open, but exit explicitly anyway).
 */
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { reviewCase, type CaseRow } from './reviewCase';

async function main(): Promise<void> {
const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
if (outAt < 0 || !args[outAt + 1]) throw new Error('Usage: batch.ts --out <folder> <stl folder> [more folders]');
const out = resolve(args[outAt + 1]!);
const roots = args.filter((_, k) => k !== outAt && k !== outAt + 1).map((root) => resolve(root.replace(/"/g, '')));

function stlsUnder(path: string): string[] {
  if (!statSync(path, { throwIfNoEntry: false })) return [];
  if (statSync(path).isFile()) return path.toLowerCase().endsWith('.stl') ? [path] : [];
  return readdirSync(path).sort().flatMap((name) => stlsUnder(join(path, name)));
}

const files = roots.flatMap(stlsUnder);
if (files.length === 0) {
  process.stderr.write('No .stl files found in the given folders.\n');
  process.exit(1);
}
mkdirSync(out, { recursive: true });


const rows: CaseRow[] = [];
for (const [k, file] of files.entries()) {
  const name = `case-${String(k + 1).padStart(3, '0')}`;
  process.stdout.write(`[${k + 1}/${files.length}] ${name} ... `);
  const row = await reviewCase(file, name, out);
  rows.push(row);
  process.stdout.write(`${row.result}${row.verdict ? ` / ${row.verdict}` : ''}${row.reason ? ` (${row.reason})` : ''}${row.printAngleDeg === null ? '' : `, print angle ${row.printAngleDeg}° (stable ${row.stableBand})`} in ${row.seconds} s
`);
  writeSummary(rows, out);
}

const look = rows.filter((row) => row.needsLook).length;
process.stdout.write(`
Done: ${rows.length} file(s), ${look} need a look. Output: ${out}
`);
const failed = rows.filter((row) => row.result === 'error').length;
if (failed > 0) throw new Error(`${failed} file(s) could not be read or built (see the lines above).`);
}

function writeSummary(rows: CaseRow[], out: string): void {
  writeFileSync(join(out, 'summary.json'), JSON.stringify({ created: new Date().toISOString(), cases: rows }, null, 2));
  const columns = Object.keys(rows[0]!) as Array<keyof CaseRow>;
  const cell = (value: unknown) => /[",\n]/.test(String(value ?? '')) ? `"${String(value).replace(/"/g, '""')}"` : String(value ?? '');
  writeFileSync(join(out, 'summary.csv'), [columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\r\n'));
}

main().then(() => process.exit(0), (error) => {
  process.stderr.write(`Folder review failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
