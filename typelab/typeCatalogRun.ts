/*
 * ONE JOB: write the workbench's type catalog (`typeCatalog.ts`) for the repo's `types/` folder and the vendored
 * built-ins, so the server can answer GET /types. A script, not server code, because the built-in profiles and the
 * type file's checks are TypeScript the plain-Node server cannot import; serve.mjs runs it through vite-node at start
 * and after each Save.
 *
 * Arguments: --out <file>. Writes the catalog JSON there. Reads no scan and needs no engine.
 */
import { writeFileSync } from 'node:fs';
import { discoverTypes } from '../src/dentalTypes/shippedTypes';
import { catalogOf } from './typeCatalog';
import { builtInKnown, builtInProfiles, TYPE_DEPS, TYPES_ROOT, typesFolderFiles } from './typeInForce';

const k = process.argv.indexOf('--out');
const out = k >= 0 ? process.argv[k + 1] : undefined;
if (!out) { process.stderr.write('typeCatalogRun: --out is required\n'); process.exit(1); }
const discovered = discoverTypes(typesFolderFiles(TYPES_ROOT), TYPE_DEPS, builtInKnown());
writeFileSync(out, JSON.stringify(catalogOf(discovered, { denture: builtInProfiles('denture'), aligner: builtInProfiles('aligner') })));
