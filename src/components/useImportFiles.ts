import { useCallback, useEffect, type MutableRefObject } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Object3D } from 'three';
import { acceptModelFile } from './ObjectViewport';
import type { ImportClient } from '../workers/importClient';
import type { PreparedMesh } from '../workers/importProtocol';
import { codedJobError } from '../workers/jobErrors';
import { isAbort, RUNTIME, triangleCount, type SetStatus } from './appShared';
import { gltfRawMeshes, placeImportedUnits } from '../state/import';
import { setDisplayMesh } from '../state/meshExtras';
import { memoryInfo } from '../state/runtime';
import { assertMemoryCapacity, assertPlateCapacity, assertTriangleCapacity, CapacityError, memoryCapBytes, meshTier, PlateFullError } from '@mixo-geocore/host/core/budget';
import { jobActivity } from '@mixo-geocore/host/workers/jobActivity';
import { PlateLedger, type PlateScene } from '../core/plateLedger';
import { estimateTriangles, ESTIMATE_HEAD_BYTES } from '../core/import/estimate';
import type { PrintScene, PrintUnit, SceneCommand } from '../state/project';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { acceptsDentalDrop } from '../dental/editingMode';
import { dropKeepsOneFile, filesToImport } from '../items/dropGrain';
import { refusalOf } from '../items/refusalOf';
import type { ImportRefusal } from '../items/rowState';
import { importRefusal, importStatus } from '@mixo-geocore/editing/status';
import { CodedError, errorStatus } from '@mixo-geocore/editing/errors';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { Message } from '../i18n';

/** A .gltf (JSON) up to this size is read whole for its pre-parse triangle count. */
const GLTF_ESTIMATE_BYTES = 16 * 1024 * 1024;
/** A .glb's JSON chunk up to this size is read for its pre-parse triangle count. */
const GLB_JSON_ESTIMATE_BYTES = 64 * 1024 * 1024;

/**
 * THE PLATE GUARD ACROSS IMPORTS THAT RUN AT ONCE: each holds what it adds while it reads.
 *
 * Module-level, so it is ONE ledger for the app rather than one per mount - which is the whole
 * point of it. Two drops in flight have to count each other's triangles, and a per-mount ledger
 * would let each believe the plate had room.
 */
const PLATE = new PlateLedger();

/**
 * A REFUSAL THAT NEVER STARTED A JOB STILL HAS TO REACH A SCREEN.
 *
 * A file the import WORKER refuses - a damaged STL, a file with no mesh - already lands in the
 * activity list and STAYS there: `jobActivity.view` never drops a failed row, and surfaces one even
 * if it ended inside the show delay. That list is the screen the operator watches to learn what a
 * drop did, and walk check `m1` relies on it keeping a deliberate failure up.
 *
 * A file the BUDGET refuses - too many triangles, not enough memory, a full plate - is refused
 * BEFORE any worker starts, usually off the 84-byte header alone. So no job ever began, nothing was
 * ever listed, and the refusal had one home: the status line. Walk check `q2` dropped two
 * 3.19M-triangle files together, watched the plate ledger correctly refuse the second
 * ("6,386,736 triangles; the limit is 6,000,000"), and then watched the WINNER's own heavy-model
 * sentence replace it. One object on the plate, a cheerful line, and no way left to learn that the
 * other file was refused or why.
 *
 * One row, opened and closed at once, puts both kinds of refusal on the same screen. The error is
 * handed over whole, so the list says it in the operator's language from the same code and values
 * the status line uses (`JobActivity`'s `failureText`), and it stays until they dismiss it.
 */
function listBudgetRefusal(fileName: string, error: CapacityError | PlateFullError): void {
  jobActivity.begin({ label: { key: 'Importing {name}', vars: { name: fileName } }, context: 'import' }).end(error);
}

/** How much of a file the pre-parse estimate reads: a whole small .gltf, a .glb's JSON chunk, else the head. */
async function estimateHeadBytes(file: File): Promise<number> {
  if (/\.gltf$/i.test(file.name) && file.size <= GLTF_ESTIMATE_BYTES) return file.size;
  if (/\.glb$/i.test(file.name) && file.size >= 20) {
    const json = new DataView(await file.slice(0, 20).arrayBuffer()).getUint32(12, true);
    if (20 + json <= GLB_JSON_ESTIMATE_BYTES) return Math.min(file.size, 20 + json);
  }
  return ESTIMATE_HEAD_BYTES;
}

/**
 * ONE SENTENCE FOR AN ALIGNER THE DENTAL FLOW CANNOT TAKE, said by both ways in.
 *
 * A drop and an already-loaded object reach Step 1 by different routes and refused it with two
 * copies of this message. One copy means one translation and one wording to keep true.
 */
const tooManyTriangles = (unit: PrintUnit): Message => ({
  key: 'This aligner has too many triangles ({n}) for the dental flow. Simplify the file and drop it again.',
  vars: { n: triangleCount(unit).toLocaleString() },
});

/**
 * IMPORT: files to units on the plate - reading, the budget refusals, placement, and what the
 * status line says came of it.
 *
 * A hook rather than a plain module function because the whole job is a closure over the app's refs
 * and setters. What it owns outright is the plate ledger and the pre-parse estimate above, which is
 * why those left `App.tsx` with it.
 */
export function useImportFiles(host: {
  sceneRef: MutableRefObject<PrintScene>;
  /** The scene's units, so a landed drop can be settled on the ledger (the effect at the end). */
  units: readonly PrintUnit[];
  sessionRef: MutableRefObject<EditSession>;
  /** The next dental import replaces the plate (a file chosen on the start screens). */
  freshStart: MutableRefObject<boolean>;
  send: (event: SessionEvent) => void;
  dispatch: (command: SceneCommand, edit?: string) => void;
  importer: () => ImportClient;
  /** Step 1 of the dental flow, on the aligner that has just arrived. */
  startDentalAligner: (unit: PrintUnit) => void;
  /**
   * A refusal because a mode owns the scene pulses the left panel, whose lock note says why and how
   * out. A narrow callback rather than the pulse setter: this hook only ever pulses that one panel.
   */
  pulseLeftPanel: () => void;
  setStatus: SetStatus;
  setStatusMessage: (message: Message) => void;
}) {
  const { sceneRef, sessionRef, units: sceneUnits, freshStart, send, dispatch, importer, startDentalAligner, pulseLeftPanel, setStatus, setStatusMessage } = host;

  /**
   * `takesOne` overrides the Step 1 rule that a drop is ONE aligner. Step 1 does take one - it
   * orients the file as it reads it - but the Items page is a list, and a drop onto a list adds to
   * it. Without this, a drop there mid-loop would silently keep the first file and discard the rest,
   * which is the same class of bug `startDrop.ts` was written to end.
   */
  const importFiles = useCallback(async (files: readonly File[], options?: {
    takesOne?: boolean;
    onAdded?: (count: number) => void;
    /**
     * EVERY refusal, not just the first. The status line can only say one thing, so a drop of eight
     * with two bad files named one of them and lost the other. A deck of rows can say which.
     */
    onRefused?: (refusals: readonly { name: string; refusal: ImportRefusal }[]) => void;
  }) => {
    // Dental Step 1 takes the aligner itself: one file, and it is oriented once read.
    const dentalDrop = dropKeepsOneFile(acceptsDentalDrop(sessionRef.current), options?.takesOne);

    const replacesPlate = dentalDrop && freshStart.current;
    freshStart.current = false;
    const badFile = (message: Message) => {
      setStatusMessage(message);
      if (dentalDrop) send({ type: 'dentalBadFile', message });
    };
    // A mode owns the scene until it is finished: a dropped or chosen file waits.
    const refusal = dentalDrop ? undefined : importRefusal(sessionRef.current.mode);
    if (refusal) {
      // The refusal also pulses the left panel's lock note, which says why and how out.
      pulseLeftPanel();
      return setStatusMessage(refusal);
    }
    const accepted = filesToImport(files.filter(acceptModelFile), dentalDrop);
    if (accepted.length === 0) return badFile(errorStatus('import', new CodedError('file-type', 'file-type')));
    if (dentalDrop) send({ type: 'dentalLoading' });
    /** The file being read, named in an error. */
    let reading = accepted[0]!.name;
    // One controller for the whole drop: Cancel (in the activity list) stops it and nothing is added.
    const controller = new AbortController();
    // What this drop adds is held on the plate while it reads, so an import started meanwhile counts
    // it too; a failure or cancel releases it (core/plateLedger).
    const reservation = PLATE.open();
    const plateNow = (): PlateScene => ({ ids: new Set(sceneRef.current.units.map((unit) => unit.id)), triangles: sceneRef.current.units.reduce((sum, unit) => sum + triangleCount(unit), 0) });
    try {
      const imported: PreparedMesh[][] = [];
      /*
       * ONE BAD FILE IS ITS OWN FAILURE, NOT THE DROP'S.
       *
       * The read loop used to sit inside the single `try` below, so any refusal - a damaged STL, a
       * triangle or memory cap, a full plate - aborted the whole drop and added NOTHING. With one
       * file that is the same thing; with a case of several it throws away the files that were fine
       * because one was not, which is the behaviour a per-file Items row cannot be built on.
       *
       * A CANCEL IS STILL THE WHOLE DROP. One `AbortController` covers every file, and stopping is
       * the operator asking for nothing to be added - so an abort is re-thrown to the outer handler
       * rather than collected here.
       */
      const refused: { name: string; error: unknown }[] = [];
      const memoryCap = memoryCapBytes(memoryInfo());
      // The triangles this drop adds, with each file as it is read.
      let adding = 0;
      for (const file of accepted) {
        reading = file.name;
        try {
        // Refused before anything is parsed or copied, whenever the file says how big it is.
        const estimate = estimateTriangles(new Uint8Array(await file.slice(0, await estimateHeadBytes(file)).arrayBuffer()), file.size, file.name);
        if (estimate) {
          assertTriangleCapacity(file.name, estimate.triangles, RUNTIME, estimate.exact);
          assertMemoryCapacity(file.name, estimate.triangles, RUNTIME, memoryCap);
          if (estimate.exact) reservation.hold(adding + estimate.triangles, plateNow(), (plate) => assertPlateCapacity(file.name, plate, RUNTIME));
        }
        const label = { key: 'Importing {name}', vars: { name: file.name } };
        if (/\.stl$/i.test(file.name)) {
          // The worker reads the file itself, slice by slice.
          imported.push(await importer().readStl(file, file.name, RUNTIME, label, controller.signal));
        } else {
          const data = await file.arrayBuffer();
          const gltf = await new Promise<{ scene: Object3D }>((resolve, reject) => new GLTFLoader().parse(data, '', resolve, reject));
          const raw = gltfRawMeshes(gltf, file.name);
          if (raw.length === 0) throw new CodedError('no-mesh', `${file.name} contains no mesh`);
          // Backstop for a glTF the estimate could not read: counted before welding.
          assertTriangleCapacity(file.name, raw.reduce((sum, mesh) => sum + (mesh.indices ? mesh.indices.length : mesh.positions.length / 3) / 3, 0), RUNTIME, true);
          imported.push(await importer().weld(raw, RUNTIME, label, controller.signal));
        }
          // Counted again from what was read (an estimate may have been short).
          adding += imported[imported.length - 1]!.reduce((sum, item) => sum + item.mesh.indices.length / 3, 0);
          reservation.hold(adding, plateNow(), (plate) => assertPlateCapacity(file.name, plate, RUNTIME));
        } catch (error) {
          if (isAbort(error)) throw error;
          refused.push({ name: file.name, error });
          // Refused by the budget, so no worker ever ran and nothing listed it (see above). The deck
          // turns a refusal into a ROW; the plain editor has no list of its own, and before this the
          // refusal lived only in a status line the next message replaced.
          if (error instanceof CapacityError || error instanceof PlateFullError) listBudgetRefusal(file.name, error);
        }
      }
      /*
       * Nothing survived: behave exactly as before, reporting the first refusal. `adding` never rose
       * for a refused file, so the next successful `hold` lowers the reservation back on its own; with
       * no successes at all there is nothing to commit, so release it.
       */
      options?.onRefused?.(refused.map((entry) => ({ name: entry.name, refusal: refusalOf(entry.error) })));
      if (imported.length === 0) {
        reservation.release();
        const first = refused[0]!;
        return badFile(errorStatus('import', codedJobError(first.error), { name: first.name }));
      }
      for (const item of imported.flat()) {
        if (item.display) setDisplayMesh(item.mesh, item.display);
      }
      let units = [...sceneRef.current.units];
      const added: PrintUnit[] = [];
      for (const group of imported) {
        const placed = placeImportedUnits(group, units, { lift: defaultSupportSettings.liftHeight, createId: () => `unit-${crypto.randomUUID()}` });
        units = [...units, ...placed];
        added.push(...placed);
      }
      // A mode that began while the files were read still ends here, so the new objects are never edited under it.
      if (!dentalDrop) send({ type: 'leave' });
      dispatch({ type: 'batch', commands: [
        // A file chosen on the start screens replaces the aligner that stayed on the plate.
        ...(replacesPlate ? sceneRef.current.units.map((unit) => ({ type: 'unit/remove' as const, unitId: unit.id })) : []),
        // Handed over: the worker's fresh arrays, also the keys of their display copy and pick index.
        ...added.map((unit) => ({ type: 'unit/add' as const, unit, owned: true })),
        { type: 'selection/set', unitIds: added.map((unit) => unit.id), activeUnitId: added[0]!.id },
      ] });
      reservation.commit(added.map((unit) => unit.id));
      // HOW MANY ARRIVED, reported at the moment this knows it. A caller that compared
      // `sceneRef.current.units.length` before and after saw NO CHANGE: the ref is updated on render,
      // and the render has not happened when this promise resolves. The walk caught that; no unit
      // test could have, because the fault is in the timing between a dispatch and a ref.
      //
      // A callback rather than a return value: this function has six early exits for refusals, and
      // making each invent a count would spread the question over all of them.
      options?.onAdded?.(added.length);
      if (dentalDrop) {
        const aligner = added[0]!;
        if (meshTier(triangleCount(aligner), RUNTIME) === 'heavy') {
          dispatch({ type: 'unit/remove', unitId: aligner.id });
          return badFile(tooManyTriangles(aligner));
        }
        setStatusMessage({ key: 'Imported {name}. Checking and orienting it…', vars: { name: aligner.name } });
        return startDentalAligner(aligner);
      }
      /*
       * A refusal is the actionable news, so it wins the status line: the files that DID import are
       * on the plate where the operator can see them, and a count of successes tells them nothing
       * they cannot already count. No new string for the mixed case - the refusal's own sentence
       * already names the file and says why.
       */
      if (refused.length > 0) {
        const first = refused[0]!;
        return badFile(errorStatus('import', codedJobError(first.error), { name: first.name }));
      }
      const heaviest = added.reduce((most, unit) => (triangleCount(unit) > triangleCount(most) ? unit : most));
      const plate = units.reduce((sum, unit) => sum + triangleCount(unit), 0);
      setStatusMessage(importStatus({ name: heaviest.name, triangles: triangleCount(heaviest) }, plate, added.length, RUNTIME));
    } catch (error) {
      reservation.release();
      if (isAbort(error)) {
        setStatus('Import cancelled; nothing was added.');
        if (dentalDrop) send({ type: 'dentalBadFile', message: { key: 'Import cancelled; nothing was added.' } });
      } else badFile(errorStatus('import', codedJobError(error), { name: reading }));
    }
  }, [dispatch, freshStart, importer, pulseLeftPanel, sceneRef, send, sessionRef, setStatus, setStatusMessage, startDentalAligner]);

  /** Step 1 with the object already selected on the plate instead of a drop. */
  const useSelectedAligner = useCallback(() => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === sceneRef.current.activeUnitId);
    if (!unit || !acceptsDentalDrop(sessionRef.current)) return;
    if (meshTier(triangleCount(unit), RUNTIME) === 'heavy') {
      const message = tooManyTriangles(unit);
      setStatusMessage(message);
      return send({ type: 'dentalBadFile', message });
    }
    startDentalAligner(unit);
  }, [sceneRef, send, sessionRef, setStatusMessage, startDentalAligner]);

  /**
   * A DROP HAS LANDED: the units the scene now shows are counted by the scene, so the import that
   * added them stops holding their triangles.
   *
   * This used to be one line inside `App.tsx`'s support-build effect, which is about builds and
   * only happened to be the place that noticed the unit set had changed. Here the ledger never
   * leaves this module, which is what lets it be a module-level singleton nobody else can reach.
   *
   * PROMPTNESS, NOT CORRECTNESS: `PlateLedger.reserved` settles before counting, so the next import
   * to check capacity would free these holds anyway (`src/core/plateLedger.ts`). This effect just
   * means a landed drop stops being counted at once rather than at the next drop — which is why
   * moving the call out of the build effect could not change what any import is allowed to do.
   */
  useEffect(() => { PLATE.settle(new Set(sceneUnits.map((unit) => unit.id))); }, [sceneUnits]);

  return { importFiles, useSelectedAligner };
}
