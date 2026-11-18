import { useCallback, useState, type MutableRefObject } from 'react';
import { errorStatus } from '@mixo-geocore/editing/errors';
import { supportsNeedReplanting } from '../state/revisions';
import { exportStatus, type CheckTally } from '@mixo-geocore/editing/check';
import { plural, translateMessage, type Message } from '../i18n';
import { EXPORT_PARTIAL_CODE, EXPORT_REFUSED_CODE, exportPartialRefusalText, exportPartialText, exportRefusalText, type ExportRefusalReason } from './exportOutcomeText';
import { jobActivity } from '@mixo-geocore/host/workers/jobActivity';
import { WorkerJobError } from '@mixo-geocore/host/workers/WorkerTask';
import type { PrintScene, PrintUnit } from '../state/project';
import { exportUnits, planExport, type ExportKind } from '@mixo-geocore/host/supports/export';
import { exportRefusal, type ExportRefusal } from '@mixo-geocore/host/supports/exportGate';
import { currentBuilds, supportJobOf, unitContacts, type BuiltSupports, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { ExportResult, SupportMeshClient } from '@mixo-geocore/host/workers/meshClient';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import { codedJobError } from '../workers/jobErrors';
import { isAbort, type SetStatus } from './appShared';
import { exportBatches } from './exportBatches';


/**
 * Export: plans the files, builds them at full resolution in the export worker, hands them to the
 * browser, and says what came out. The support check runs alongside so the status can warn about
 * gaps; a check that fails or is cancelled leaves its units unchecked and the status says so.
 */
export function useExport(host: {
  sceneRef: MutableRefObject<PrintScene>;
  /**
   * `BuiltSupports`, not the full mesh: this hook reads the map only through `currentBuilds` and
   * `unitContacts`, and BOTH of those already take `BuiltSupports`. The geometry written to the STL
   * comes from the export worker, not from here - so a released build (geometry freed once its unit
   * is finished) exports exactly as before.
   */
  builtRef: MutableRefObject<ReadonlyMap<string, UnitBuild<BuiltSupports>>>;
  exporter: () => SupportMeshClient;
  /** An export that holds a denture runs in the denture worker (src/denture), every unit built there. */
  dentureExport?: (units: readonly (readonly [PrintUnit, number])[], files: ExportFilePlan[], label: JobLabel) => Promise<ExportResult>;
  runCheck: (units: readonly PrintUnit[]) => Promise<CheckTally>;
  setStatus: SetStatus;
  setStatusMessage: (message: Message) => void;
}) {
  const { sceneRef, builtRef, exporter, dentureExport, runCheck, setStatus, setStatusMessage } = host;
  const [exporting, setExporting] = useState(false);
  /**
   * A REFUSAL IS SAID TWICE: to the status line, and to the job activity list, which KEEPS it.
   *
   * The four sentences used to be constants in this file, said once to the status line - which the
   * next message replaces. So the operator could press Export, be refused, press something else,
   * and be left with no record that nothing had been written (gap register W-05; walk `q2`
   * reproduced the same class on the import side). A failed activity row is never dropped and
   * surfaces even if it ended inside the show delay, so that list is the screen that remembers.
   *
   * The sentences moved to `exportOutcomeText.ts` because the list builds its text from an error
   * CODE, and the generic export failure it would otherwise reach says "the export failed" - a
   * second, vaguer vocabulary for an event the status line describes exactly.
   */
  const sayOutcome = useCallback((message: Message, code: string, vars: Record<string, string | number>): void => {
    setStatusMessage(message);
    jobActivity.begin({ label: { key: 'Exporting {name}', vars: { name: String(vars.name ?? '') } }, context: 'export' })
      .end(new WorkerJobError(translateMessage(message), code, vars));
  }, [setStatusMessage]);
  const refuse = useCallback((reason: ExportRefusalReason, name: string): void =>
    sayOutcome(exportRefusalText(reason, name), EXPORT_REFUSED_CODE, { reason, name }), [sayOutcome]);
  const runExport = useCallback(async (kind: ExportKind) => {
    const current = sceneRef.current;
    // A unit changed since its build keeps its supports part (the worker skips an empty one).
    const files = planExport(current, kind, currentBuilds(current.units, builtRef.current));
    if (files.length === 0) {
      if (kind.startsWith('active') && !current.activeUnitId) return setStatus('Select an object to export.');
      // Supports only, and every unit in scope had its contacts deleted or zoned out.
      const emptied = exportUnits(current, kind).filter(([unit]) => unit.supports);
      if (kind.endsWith('supports') && emptied.length === 1) return setStatus('Nothing to export: {name} has no supports left.', { name: emptied[0]![0].name });
      if (kind.endsWith('supports') && emptied.length > 1) return setStatus('Nothing to export: no object in this export has supports left.');
      return setStatus('Nothing to export for this mode.');
    }
    /*
     * SUPPORTS PLANTED BEFORE THE MODEL WAS TURNED ARE NOT SUPPORTS FOR THIS MODEL, and nothing
     * stopped them being written until this gate. Rotating a unit after generating moves its supports
     * rigidly with it - right for a MOVE and wrong for a TURN: they were planted against the old
     * down-direction, so after a turn they hold nothing. The app said so once, in a status line the
     * next message replaced, and then exported them anyway.
     *
     * `revisions` already knew. `transform/set` stamps `orient` when the ROTATION changed and only
     * then; `supports/set` stamps `supports`; so `staleTools` reports `supports` stale in exactly this
     * case. Before this, the rail's grey "stale" mark was that signal's only consumer - and the rail
     * lives on the deck, where nothing is exported (found by audit, `docs/reviews/2026-11-08-cia-deck-and-flow.md` F5).
     *
     * Refused rather than confirmed, and BEFORE the job rather than after: a full-resolution export of
     * supports that cannot hold is work the operator waits for and must then throw away.
     */
    const replanted = [...new Set(files.flatMap((file) => file.parts.filter((part) => part.content === 'supports').map((part) => part.unitId)))]
      .map((unitId) => current.units.find((unit) => unit.id === unitId))
      .find((unit) => unit !== undefined && supportsNeedReplanting(unit.revisions));
    if (replanted) return refuse('replant', replanted.name);

    const used = new Set(files.flatMap((file) => file.parts.map((part) => part.unitId)));
    const units = exportUnits(current, kind).filter(([unit]) => used.has(unit.id));
    setExporting(true);
    setStatus('Preparing export at full resolution.');
    const checking = runCheck(units.map(([unit]) => unit)).catch((): CheckTally => ({ spots: 0, inZone: 0, unjudged: 0, incomplete: units.filter(([unit]) => unit.supports).length }));
    const label = { key: files.length === 1 ? 'Exporting {name}' : 'Exporting {n} files', vars: { name: files[0]!.fileName, n: files.length } };
    /*
     * `saved` AND `names` LIVE OUTSIDE THE TRY, and that is the whole of a real defect.
     *
     * Since the export delivers one file at a time, a worker failure on file 3 of a case happens
     * with files 1 and 2 already in the operator's downloads - and the catch below says "Nothing was
     * saved; try again", which is the `r1` lie reachable from every worker failure rather than only
     * from a blocked download. Declared in the try, they were invisible to the one place that needed
     * them.
     */
    const saved: string[] = [];
    const names: string[] = [];
    try {
      const jobs = units.map(([unit, index]) => ({ unitId: unit.id, job: supportJobOf(unit, index, 'export'), transform: unit.transform }));
      /** Whether the unit is still exactly the one this export started from (the gate's `stale` test). */
      const unchanged = (unitId: string) => sceneRef.current.units.find((candidate) => candidate.id === unitId)
        === units.find(([unit]) => unit.id === unitId)?.[0];
      /** The units whose SUPPORTS are in these files: the only ones the gate has anything to judge. */
      const supportsIn = (plans: readonly ExportFilePlan[]) =>
        [...new Set(plans.flatMap((plan) => plan.parts.filter((part) => part.content === 'supports').map((part) => part.unitId)))];
      /**
       * Hand these files to the browser, in order. Returns the name of the first one the browser
       * REFUSED, so the caller can report what did arrive rather than claiming nothing did.
       *
       * THE TRAP, unchanged from when this was one loop at the end: a browser that blocks quietly
       * does not throw, and the page cannot tell. So this is not a guarantee that every file
       * arrived - it is the narrower and honest claim that what we MANAGED TO HAND OVER is what the
       * operator is told about, and `saved` is the record of it. Chrome refuses several automatic
       * downloads from one gesture, so this is a fault the operator meets unbidden.
       */
      const deliver = (ready: readonly { fileName: string; buffer: ArrayBuffer }[]): string | undefined => {
        for (const file of ready) {
          try {
            const url = URL.createObjectURL(new Blob([file.buffer], { type: 'model/stl' }));
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = file.fileName;
            anchor.click();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          } catch {
            return file.fileName;
          }
          saved.push(file.fileName);
        }
        return undefined;
      };

      let refusal: ExportRefusal | undefined;
      let refused: string | undefined;
      /*
       * ONE FILE'S WORTH OF WORK AT A TIME, built and handed over before the next is asked for
       * (`exportBatches.ts` carries the full reason). This was a SINGLE call with the whole case in
       * it: every unit's supports built at full resolution and every STL buffer held at once, which
       * on a thirty-model case is of the order of a gigabyte of ArrayBuffers in one tab - at the very
       * end of the work, where a dead tab costs the most. Auto-gen is what made thirty-model cases
       * ordinary, so this stopped being a theoretical peak.
       *
       * WHAT THIS CHANGES, said plainly rather than left for someone to find: a refusal part way
       * through now leaves the EARLIER files already handed over, where the single call refused the
       * whole case before writing a byte. That is reported as a partial export - the same report a
       * blocked download gets - and it is the better trade: four valid files plus a named refusal
       * beats throwing away four valid files because the fifth could not be judged. The gate itself
       * is unchanged and still runs BEFORE that file's bytes are handed over.
       *
       * THE DENTURE PATH IS LEFT WHOLE. `dentureExport` takes the case together and builds in its
       * own worker with its own policy; splitting it is a change to that flow and belongs with it.
       * A denture case is one or two models rather than thirty, so the peak this fixes is not its
       * peak either.
       */
      if (dentureExport && units.some(([unit]) => (unit as PrintUnit).denture)) {
        const outcome = await dentureExport(units as [PrintUnit, number][], files, label);
        if (outcome.files.length === 0) return setStatus('Nothing to export for this mode.');
        refusal = exportRefusal(outcome, supportsIn(files), unchanged);
        if (!refusal) {
          names.push(...outcome.files.map((file) => file.fileName));
          refused = deliver(outcome.files);
        }
      } else {
        const batches = exportBatches(files, jobs);
        for (const batch of batches) {
          const one = await exporter().exportFiles(batch.jobs, [batch.file],
            { key: 'Exporting {name}', vars: { name: batch.file.fileName } }, () => {});
          // Judged per file, against ITS OWN result: each call has its own revision, so a joined
          // result checked against one revision would read every earlier file as stale.
          refusal = exportRefusal(one, supportsIn([batch.file]), unchanged);
          /*
           * A BATCH THAT CAME BACK EMPTY IS THAT FILE FAILING. The gate has nothing to judge when no
           * supports are in the file, so without this the loop passed over it in silence and the
           * success line named the others - the operator counts N-1 files and is told nothing. The
           * single-call version said "Nothing to export"; this says which one.
           */
          if (!refusal && one.files.length === 0) refusal = { reason: 'failed', unitId: batch.jobs[0]!.unitId };
          if (refusal) break;
          names.push(...one.files.map((file) => file.fileName));
          refused = deliver(one.files);
          if (refused) break;
        }
        // Nothing came back at all (every file was empty, or the job was dropped): never report success.
        if (names.length === 0 && !refusal) return setStatus('Nothing to export for this mode.');
      }

      if (refused !== undefined) {
        // Nothing handed over: the generic export failure is the right report, so let it have it.
        if (saved.length === 0) throw new Error(`download of ${refused} refused`);
        return sayOutcome(exportPartialText(saved, refused), EXPORT_PARTIAL_CODE, { saved: saved.join(', '), name: refused });
      }
      if (refusal) {
        const name = units.find(([unit]) => unit.id === refusal!.unitId)?.[0].name ?? refusal.unitId;
        /*
         * A REFUSAL AFTER SOMETHING WAS SAVED IS A PARTIAL EXPORT, and reporting it as a plain
         * refusal would be the old all-or-nothing sentence said over files that are on disk - the
         * same lie walk `r1` caught the download loop telling.
         */
        if (saved.length > 0) return sayOutcome(exportPartialRefusalText(saved, refusal.reason, name), EXPORT_PARTIAL_CODE, { saved: saved.join(', '), name });
        // The gate's reason, not a translation of it: this chain used to end in an unconditional
        // `refuse('inconclusive')`, so engine 64's new `nothing-built` would have been reported as
        // a safety check that timed out. Passing it straight through makes the next reason
        // upstream a compile error in `ExportRefusalReason` instead.
        return refuse(refusal.reason, name);
      }
      // The file names and how many supports the files hold, as the status names them.
      const count = units.reduce((sum, [unit]) => sum + unitContacts(unit, builtRef.current.get(unit.id)?.mesh).length, 0);
      setStatusMessage(exportStatus(`${names.join(', ')} (${plural(count, '1 support', '{n} supports')})`, await checking));
    } catch (error) {
      /*
       * WHAT ALREADY REACHED THE DISK IS SAID FIRST, whatever went wrong after it. Every sentence
       * below ends "nothing was written", which is true of every export failure in this app EXCEPT
       * one that happens part way through a per-file run - and that is now every worker failure,
       * every timeout and every cancel after the first file.
       */
      if (saved.length > 0) sayOutcome(exportPartialText(saved, names[saved.length] ?? ''), EXPORT_PARTIAL_CODE, { saved: saved.join(', '), name: names[saved.length] ?? '' });
      else if (isAbort(error)) setStatus('Export cancelled; no file was written.');
      else setStatusMessage(errorStatus('export', codedJobError(error)));
    } finally {
      setExporting(false);
    }
  }, [builtRef, dentureExport, exporter, refuse, runCheck, sceneRef, setStatus, setStatusMessage]);
  return { exporting, runExport };
}
