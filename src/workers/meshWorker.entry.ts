// Vite worker entry over the shared mesh worker body (mixo-geocore host/workers/meshWorker): this
// file tells the worker where its engine comes from, and to wait for the saved types before a job.
import './engineSource';
import { setMeshWorkerReady } from '@mixo-geocore/host/workers/meshWorker';
import { typesReady } from '../dentalTypes/typesReady';

// An aligner job resolves its profile by id in THIS worker's engine, so a saved aligner type must be registered here
// too (docs/TYPE-PIPELINE.md section 8a). Set synchronously, at the top level: no job message can arrive before this
// line has run.
setMeshWorkerReady(typesReady);
