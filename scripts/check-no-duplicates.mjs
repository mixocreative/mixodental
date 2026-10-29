// Fails when a module under src/ duplicates a module of the vendored mixo-geocore packages
// (vendor/mixo-geocore/host and editing): one copy of every shared module, in mixo-geocore (PE.5b).
//
// A src module is a duplicate when
//   - its path mirrors a vendored one (src/editing/x -> editing/x, src/core/x -> host/core/x,
//     src/core/analysis/dental* -> host/dental/, src/{supports,workers,state,dental}/x -> host/<dir>/x),
//   - or its file name is a vendored module's name, unless it is listed in DISTINCT below with
//     the reason it is another module (and its text shares little with the vendored one),
//   - or its text is a vendored module's (comments, imports and blank lines aside), a re-export
//     shim of @mixo-geocore, or mostly the same lines (an edited copy).
//
//   node scripts/check-no-duplicates.mjs [--json]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'vendor', 'mixo-geocore');
const PACKAGES = ['host', 'editing'];

/** App modules whose name is also a vendored module's, and why they are not that module. */
export const DISTINCT = {
  'src/state/project.ts': "the dental app's scene state, reducer and saved-project format (editing/project.ts is the shared open/save flow)",
  'src/supports/selection.ts': 'deleteCommands for the scene (editing/selection.ts is the shared support selection set)',
  'src/components/viewport/types.ts': 'the three.js viewport props (editing/types.ts and host/core/analysis/types.ts are the shared types)',
};

/** Lines two files may share before one counts as an edited copy of the other. */
const SIMILARITY = 0.5;

const posix = (path) => path.split(sep).join('/');
const isModule = (name) => /\.(ts|tsx|js|mjs)$/.test(name) && !name.endsWith('.d.ts');
const isTest = (name) => /\.test\.(ts|tsx|mjs)$/.test(name);
const stem = (path) => basename(path).replace(/\.(test\.)?(ts|tsx|js|mjs)$/, '');

function files(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path, base) : isModule(name) ? [posix(relative(base, path))] : [];
  });
}

/** The lines that make a module what it is: no comments, imports, blank lines or indentation. */
function bodyLines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '').split('\n')
    .map((line) => line.replace(/(^|[^:'"`])\/\/.*$/, '$1').trim())
    .filter((line) => line !== '' && !/^(import|export)\b.*\bfrom\s*['"]/.test(line) && !/^import\s*['"]/.test(line));
}

/** Share of `a`'s substantial lines that also stand in `b` (0 when `a` has none). */
function shared(a, b) {
  const lines = a.filter((line) => line.length > 12);
  if (lines.length === 0) return 0;
  const other = new Set(b);
  return lines.filter((line) => other.has(line)).length / lines.length;
}

/** Vendored package paths a src path mirrors. */
function mirrors(path) {
  const m = /^src\/([^/]+)\/(.+)\.(ts|tsx|js)$/.exec(path);
  if (!m) return [];
  const [, dir, rest] = m;
  const bare = rest.replace(/\.test$/, '');
  if (dir === 'editing') return [`editing/${bare}`];
  if (dir === 'core') return [`host/core/${bare}`, `host/dental/${bare.replace(/^analysis\//, '')}`];
  if (['supports', 'workers', 'state', 'dental'].includes(dir)) return [`host/${dir}/${bare}`, `host/${bare}`];
  return [];
}

export function findDuplicates() {
  const vendored = PACKAGES.flatMap((pkg) => files(join(VENDOR, pkg)).map((rel) => `${pkg}/${rel}`));
  const byStem = new Map();
  const texts = new Map();
  for (const path of vendored) {
    const key = `${path.replace(/\.(ts|js)$/, '')}`;
    texts.set(path, bodyLines(readFileSync(join(VENDOR, path), 'utf8')));
    if (!byStem.has(stem(path))) byStem.set(stem(path), []);
    byStem.get(stem(path)).push(path);
    byStem.set(`path:${key}`, [path]);
  }
  const problems = [];
  const local = files(join(ROOT, 'src')).map((rel) => `src/${rel}`);
  for (const path of local) {
    const text = readFileSync(join(ROOT, path), 'utf8');
    const lines = bodyLines(text);
    const name = basename(path);
    const mirrored = mirrors(path).flatMap((key) => byStem.get(`path:${key}`) ?? []);
    if (!isTest(name)) {
      for (const hit of mirrored) problems.push(`${path}: same path as the vendored ${hit}`);
      const sameName = byStem.get(stem(path)) ?? [];
      if (sameName.length > 0 && mirrored.length === 0) {
        if (!(path in DISTINCT)) problems.push(`${path}: same name as the vendored ${sameName.join(', ')} (list it in DISTINCT with the reason, or use the package)`);
        for (const hit of sameName) {
          const overlap = Math.max(shared(lines, texts.get(hit)), shared(texts.get(hit), lines));
          if (overlap >= SIMILARITY) problems.push(`${path}: shares ${Math.round(overlap * 100)}% of its lines with the vendored ${hit}`);
        }
      }
    }
    if (/^\s*export\s+\*\s+from\s+['"]@mixo-geocore\//m.test(text) && lines.length <= 2) problems.push(`${path}: a re-export shim of a vendored module (import the package instead)`);
    for (const [hit, theirs] of texts) {
      if (lines.length > 0 && lines.join('\n') === theirs.join('\n')) problems.push(`${path}: the same text as the vendored ${hit}`);
      else if (!isTest(name) && lines.length >= 8 && shared(lines, theirs) >= SIMILARITY && !problems.some((p) => p.startsWith(`${path}: shares`))) {
        problems.push(`${path}: shares ${Math.round(shared(lines, theirs) * 100)}% of its lines with the vendored ${hit}`);
      }
    }
  }
  for (const path of Object.keys(DISTINCT)) if (!local.includes(path)) problems.push(`${path}: listed in DISTINCT but gone: remove the entry`);
  return { checked: local.length, vendored: vendored.length, problems: [...new Set(problems)] };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const result = findDuplicates();
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  for (const problem of result.problems) console.error(`  FAIL ${problem}`);
  console.log(`check-no-duplicates: ${result.checked} src modules against ${result.vendored} vendored mixo-geocore modules: ${result.problems.length === 0 ? 'ok' : `${result.problems.length} duplicate(s)`}`);
  process.exit(result.problems.length === 0 ? 0 : 1);
}
