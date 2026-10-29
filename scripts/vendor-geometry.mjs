// Vendor (or verify) the mixo-geocore engine and TS packages.
//
// mixo-geocore (private first-party repo mixocreative/mixo-geocore) owns the Rust/wasm
// engine and the TypeScript host/ and editing/ packages. mixosupports consumes them AS BUILT and
// never edits them: vendor/mixo-geocore/ (VERSION, SOURCE.json). Every vendored file is hashed in
// SOURCE.json; the runtime refuses an engine whose engine_version() differs from
// HOST_GEOMETRY_VERSION (vendor/mixo-geocore/host/geometryVersion.js).
//
// mixosupports layout: everything lands under vendor/mixo-geocore/ - pkg-browser (the engine Vite
// bundles into the app and its workers), pkg-node (the same engine for vitest and Node scripts),
// host/ and editing/ (TypeScript, imported as @mixo-geocore/host/* and @mixo-geocore/editing/*).
//
//   node scripts/vendor-geometry.mjs [--from <mixo-geocore dir>]   default S:\ai\mixo-geocore or ../mixo-geocore
//   node scripts/vendor-geometry.mjs --release v<N>                gh release download, verify SHA256SUMS, unpack
//   node scripts/vendor-geometry.mjs --check                       offline: verify every vendored file + versions
//   (hidden, tests) --release-dir <dir> instead of the download, --out-root <dir> instead of this repo
//
// --from needs a fresh `npm run wasm:build` in mixo-geocore and a clean crates/host/editing.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const REPO = 'mixocreative/mixo-geocore';
const SELF_ROOT = fileURLToPath(new URL('..', import.meta.url));
const PKG = join('crates', 'geometry-wasm', 'pkg-browser');
const NODE_PKG = join('crates', 'geometry-wasm', 'pkg-node');
const PACKAGES = ['host', 'editing'];
const FILES = ['mixo_geometry_wasm.js', 'mixo_geometry_wasm_bg.wasm', 'mixo_geometry_wasm.d.ts'];
// The Node build also carries the dental internals (test-abi) and a package.json that keeps its CommonJS glue CJS.
const NODE_FILES = [...FILES, 'mixo_geometry_wasm_bg.wasm.d.ts', 'package.json'];
const DEFAULT_SOURCES = ['S:\\ai\\mixo-geocore', join(SELF_ROOT, '..', 'mixo-geocore')];

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
// Text files are LF from the build; a Windows checkout with core.autocrlf turns them CRLF.
const asBuilt = (name, bytes) => (name.endsWith('.wasm') ? bytes
  : Buffer.from(bytes.toString('latin1').replace(/\r\n/g, '\n'), 'latin1'));
const posix = p => p.split(sep).join('/');

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const ROOT = resolve(argValue('--out-root') ?? SELF_ROOT);
const OUT_ROOT = join(ROOT, 'vendor', 'mixo-geocore');
const BROWSER_OUT = join(OUT_ROOT, 'pkg-browser');
const NODE_OUT = join(OUT_ROOT, 'pkg-node');

const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();

/** Package sources worth vendoring: no tests, no test fixtures. */
const isVendored = name => /\.(ts|js)$/.test(name) && !/\.test\.ts$/.test(name) && name !== 'uiFixture.ts';

/** Relative paths of every file under `dir`, optionally filtered by file name. */
function listFiles(dir, keep = () => true, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => (e.isDirectory()
    ? listFiles(join(dir, e.name), keep, base)
    : keep(e.name) ? [posix(relative(base, join(dir, e.name)))] : []));
}

function copyTree(from, to) {
  for (const rel of listFiles(from, isVendored)) {
    mkdirSync(dirname(join(to, rel)), { recursive: true });
    writeFileSync(join(to, rel), asBuilt(rel, readFileSync(join(from, rel))));
  }
}

/** engine_version() of the glue + wasm in `dir`, loaded the way a worker would (no fetch). */
async function engineVersion(dir) {
  const glue = await import(`${pathToFileURL(join(dir, FILES[0])).href}?v=${Date.now()}`);
  glue.initSync({ module: readFileSync(join(dir, FILES[1])) });
  return glue.engine_version();
}

/** engine_version() of the Node build in `dir`. */
const nodeEngineVersion = dir => createRequire(import.meta.url)(join(dir, FILES[0])).engine_version();

const hostVersion = async hostDir => (await import(`${pathToFileURL(join(hostDir, 'geometryVersion.js')).href}?v=${Date.now()}`)).HOST_GEOMETRY_VERSION;

/** sha256 map: `pkg-browser/...`, `pkg-node/...`, `host/...`, `editing/...`. */
function hashLayout({ engine, node, host, editing }) {
  const hashes = {};
  for (const name of FILES) hashes[`pkg-browser/${name}`] = sha256(asBuilt(name, readFileSync(join(engine, name))));
  for (const name of NODE_FILES) hashes[`pkg-node/${name}`] = sha256(asBuilt(name, readFileSync(join(node, name))));
  for (const [pkg, dir] of [['host', host], ['editing', editing]]) {
    for (const rel of listFiles(dir)) hashes[`${pkg}/${rel}`] = sha256(asBuilt(rel, readFileSync(join(dir, rel))));
  }
  return hashes;
}

/** The dental data the engine embeds (crates/.../profiles, label font) is copied into src/dental; a drifted copy is an error. */
const DENTAL_DATA = [
  [join('crates', 'geometry-core', 'src', 'dental', 'profiles'), join('src', 'dental', 'profiles'), name => name.endsWith('.json')],
  [join('crates', 'geometry-core', 'src', 'supports', 'parts', 'labelFont.json'), join('src', 'dental', 'labelFont.json')],
];

function checkDentalData(source) {
  const read = file => asBuilt(file, readFileSync(file)).toString('latin1');
  for (const [from, to, keep] of DENTAL_DATA) {
    const pairs = keep
      ? listFiles(join(source, from), keep).map(rel => [join(source, from, rel), join(ROOT, to, rel)])
      : [[join(source, from), join(ROOT, to)]];
    for (const [a, b] of pairs) {
      if (!existsSync(b) || read(a) !== read(b)) {
        throw new Error(`${relative(ROOT, b)} differs from the engine's ${a}: copy it, then re-run (dental data must match what the engine embeds)`);
      }
    }
  }
}

/** Stage the engine + packages of a local mixo-geocore checkout (fresh build, clean tree). */
function stageFromCheckout(source, stage) {
  checkDentalData(source);
  const pkg = join(source, PKG);
  const nodePkg = join(source, NODE_PKG);
  for (const [dir, names] of [[pkg, FILES], [nodePkg, NODE_FILES]]) {
    for (const name of names) {
      if (!existsSync(join(dir, name))) throw new Error(`${join(dir, name)} is missing (run \`npm run wasm:build\` in ${source})`);
    }
  }
  if (git(source, 'status', '--porcelain', '--', 'crates', ...PACKAGES) !== '') {
    throw new Error(`${source} crates/host/editing have uncommitted changes: vendor from a committed checkout only`);
  }
  // A pkg-browser older than the engine's last commit was built from older source.
  const builtAt = statSync(join(pkg, FILES[1])).mtimeMs;
  const committedAt = Number(git(source, 'log', '-1', '--format=%ct', '--', 'crates')) * 1000;
  if (builtAt < committedAt) throw new Error(`${pkg} is older than the last engine commit: run \`npm run wasm:build\` in ${source}`);
  mkdirSync(join(stage, 'engine'), { recursive: true });
  mkdirSync(join(stage, 'node'), { recursive: true });
  for (const name of FILES) writeFileSync(join(stage, 'engine', name), asBuilt(name, readFileSync(join(pkg, name))));
  for (const name of NODE_FILES) writeFileSync(join(stage, 'node', name), asBuilt(name, readFileSync(join(nodePkg, name))));
  for (const name of PACKAGES) copyTree(join(source, name), join(stage, name));
  return { commit: git(source, 'rev-parse', 'HEAD'), committed: git(source, 'log', '-1', '--format=%cI') };
}

function untar(archive, dest) {
  mkdirSync(dest, { recursive: true });
  execFileSync('tar', ['-xzf', archive.slice(dirname(archive).length + 1), '-C', dest], { cwd: dirname(archive) });
}

/** The directory inside an unpacked tarball that holds the payload (the root, or its single folder). */
function payloadRoot(dir, marker) {
  if (existsSync(join(dir, marker))) return dir;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && existsSync(join(dir, e.name, marker))) return join(dir, e.name);
  }
  throw new Error(`release archive has no ${marker}`);
}

/** Verify SHA256SUMS in a release folder and stage its assets. */
function stageFromRelease(releaseDir, tag, stage) {
  const sumsFile = join(releaseDir, 'SHA256SUMS');
  if (!existsSync(sumsFile)) throw new Error(`${sumsFile} is missing`);
  const sums = new Map();
  for (const line of readFileSync(sumsFile, 'utf8').split(/\r?\n/).filter(Boolean)) {
    const m = /^([0-9a-f]{64}) [ *](.+)$/.exec(line.trim());
    if (!m) throw new Error(`SHA256SUMS line is malformed: ${line}`);
    sums.set(m[2], m[1]);
  }
  const asset = suffix => {
    const name = [...sums.keys()].find(n => n.endsWith(`-${suffix}.tgz`));
    if (!name) throw new Error(`SHA256SUMS lists no ${suffix} asset`);
    return name;
  };
  for (const [name, want] of sums) {
    const file = join(releaseDir, name);
    if (!existsSync(file)) throw new Error(`release asset ${name} is missing`);
    const got = sha256(readFileSync(file));
    if (got !== want) throw new Error(`release asset ${name} does not match SHA256SUMS (got ${got})`);
  }
  const scratch = join(stage, 'unpacked');
  untar(join(releaseDir, asset('pkg-browser')), join(scratch, 'engine'));
  mkdirSync(join(stage, 'engine'), { recursive: true });
  const engineDir = payloadRoot(join(scratch, 'engine'), FILES[0]);
  for (const name of FILES) writeFileSync(join(stage, 'engine', name), asBuilt(name, readFileSync(join(engineDir, name))));
  for (const name of PACKAGES) {
    untar(join(releaseDir, asset(name)), join(scratch, name));
    copyTree(payloadRoot(join(scratch, name), name === 'host' ? 'geometryVersion.js' : 'types.ts'), join(stage, name));
  }
  untar(join(releaseDir, asset('pkg-node')), join(scratch, 'node'));
  mkdirSync(join(stage, 'node'), { recursive: true });
  const nodeDir = payloadRoot(join(scratch, 'node'), FILES[0]);
  for (const name of NODE_FILES) writeFileSync(join(stage, 'node', name), asBuilt(name, readFileSync(join(nodeDir, name))));
  rmSync(scratch, { recursive: true, force: true });
  return { tag };
}

/** Throws unless the engine and host of a layout agree on one ABI version. */
async function verifyVersions(layout) {
  const version = await engineVersion(layout.engine);
  const nodeVersion = nodeEngineVersion(layout.node);
  if (nodeVersion !== version) throw new Error(`pkg-node reports engine ${nodeVersion}, pkg-browser ${version}`);
  const expected = await hostVersion(layout.host);
  if (version !== expected) {
    throw new Error(`engine_version() is ${version}, host expects ${expected}: `
      + 'port the ABI change, then bump HOST_GEOMETRY_VERSION in vendor/mixo-geocore/host/geometryVersion.js');
  }
  return version;
}

async function install(stage, meta) {
  const layout = { engine: join(stage, 'engine'), node: join(stage, 'node'), host: join(stage, 'host'), editing: join(stage, 'editing') };
  const version = await verifyVersions(layout);
  const hashes = hashLayout(layout);
  rmSync(OUT_ROOT, { recursive: true, force: true });
  mkdirSync(OUT_ROOT, { recursive: true });
  cpSync(layout.engine, BROWSER_OUT, { recursive: true });
  cpSync(layout.node, NODE_OUT, { recursive: true });
  for (const name of PACKAGES) cpSync(layout[name], join(OUT_ROOT, name), { recursive: true });
  writeFileSync(join(OUT_ROOT, 'SOURCE.json'), `${JSON.stringify({ repo: REPO, ...meta, engineVersion: version, sha256: hashes }, null, 2)}\n`);
  writeFileSync(join(OUT_ROOT, 'VERSION'), `${version}\n`);
  return { version, label: meta.tag ?? meta.commit.slice(0, 7) };
}

async function check() {
  const sourceFile = join(OUT_ROOT, 'SOURCE.json');
  if (!existsSync(sourceFile)) throw new Error('vendor/mixo-geocore/SOURCE.json is missing (run: node scripts/vendor-geometry.mjs)');
  const source = JSON.parse(readFileSync(sourceFile, 'utf8'));
  const layout = { engine: BROWSER_OUT, node: NODE_OUT, host: join(OUT_ROOT, 'host'), editing: join(OUT_ROOT, 'editing') };
  const version = await verifyVersions(layout);
  if (source.engineVersion !== version) throw new Error(`SOURCE.json records engine ${source.engineVersion}, the wasm reports ${version}`);
  const versionFile = readFileSync(join(OUT_ROOT, 'VERSION'), 'utf8').trim();
  if (versionFile !== String(version)) throw new Error(`VERSION says ${versionFile}, the wasm reports ${version}`);
  const actual = hashLayout(layout);
  for (const [name, want] of Object.entries(source.sha256)) {
    if (!(name in actual)) throw new Error(`vendored file ${name} is missing`);
    if (actual[name] !== want) throw new Error(`vendored file ${name} does not match SOURCE.json: sha256 ${actual[name]}`);
  }
  for (const name of Object.keys(actual)) {
    if (!(name in source.sha256)) throw new Error(`vendored file ${name} is not recorded in SOURCE.json (hand-added?)`);
  }
  return { version, label: source.tag ?? source.commit.slice(0, 7) };
}

function findCheckout() {
  const found = DEFAULT_SOURCES.map(p => resolve(p)).find(p => existsSync(join(p, PKG)));
  if (!found) throw new Error(`no mixo-geocore checkout found (tried ${DEFAULT_SOURCES.join(', ')}): pass --from <dir>`);
  return found;
}

async function main() {
  let result;
  if (process.argv.includes('--check')) {
    result = await check();
  } else {
    const stage = mkdtempSync(join(tmpdir(), 'mixo-geocore-stage-'));
    try {
      writeFileSync(join(stage, 'package.json'), '{"type":"module"}'); // staged glue is ESM
      let meta;
      const tag = argValue('--release');
      if (tag) {
        if (!/^v\d+$/.test(tag)) throw new Error(`--release expects v<N>, got ${tag}`);
        let dir = argValue('--release-dir');
        if (!dir) {
          dir = join(stage, 'download');
          execFileSync('gh', ['release', 'download', tag, '--repo', REPO, '--dir', dir], { stdio: 'inherit' });
        }
        meta = stageFromRelease(resolve(dir), tag, stage);
      } else {
        meta = stageFromCheckout(resolve(argValue('--from') ?? findCheckout()), stage);
      }
      result = await install(stage, meta);
    } finally {
      rmSync(stage, { recursive: true, force: true });
    }
  }
  console.log(`mixo-geocore engine ${result.version} (${result.label}) verified in vendor/mixo-geocore`);
}

main().catch(err => {
  console.error(`vendor-geometry: ${err.message}`);
  process.exit(1);
});
