// Where this realm's engine comes from: the vendored pkg-browser, bundled by Vite (glue as a module,
// wasm as an asset URL). Imported first by the app entry and by every worker entry, before the
// shared host (mixo-geocore host/workers/geometryClient) loads it in `geometryReady()`.
import * as glue from '@mixo-geocore/engine';
import wasmUrl from '../../vendor/mixo-geocore/pkg-browser/mixo_geometry_wasm_bg.wasm?url';
import { configureGeometry, type GeometryEngine } from '@mixo-geocore/host/workers/geometryClient';

configureGeometry(glue as unknown as GeometryEngine, wasmUrl);
