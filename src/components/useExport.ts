import { useCallback, useState, type MutableRefObject } from 'react';
import { errorStatus } from '@mixo-geocore/editing/errors';
import { supportsNeedReplanting } from '../state/revisions';
import { exportStatus, type CheckTally } from '@mixo-geocore/editing/check';
import { plural, translateMessage, type Message } from '../i18n';
import { EXPORT_PARTIAL_CODE, EXPORT_REFUSED_CODE, exportPartialText, exportRefusalText, type ExportRefusalReason } from './exportOutcomeText';
import { jobActivity } from '@mixo-geocore/host/workers/jobActivity';
import { WorkerJobError } from '@mixo-geocore/host/workers/WorkerTask';
import type { PrintScene, PrintUnit } from '../state/project';
import { exportUnits, planExport, type ExportKind } from '@mixo-geocore/host/supports/export';
import { exportRefusal } from '@mixo-geocore/host/supports/exportGate';
import { currentBuilds, supportJobOf, unitContacts, type BuiltSupports, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { ExportResult, SupportMeshClient } from '@mixo-geocore/host/workers/meshClient';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import { codedJobError } from '../workers/jobErrors';
import { isAbort, type SetStatus } from './appShared';


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
    try {
      const jobs = units.map(([unit, index]) => ({ unitId: unit.id, job: supportJobOf(unit, index, 'export'), transform: unit.transform }));
      const outcome = dentureExport && units.some(([unit]) => (unit as PrintUnit).denture) ? await dentureExport(units as [PrintUnit, number][], files, label) : await exporter().exportFiles(jobs, files, label, () => {});
      const written = outcome.files;
      // Nothing came back (every file was empty, or the job was dropped): never report success.
      if (written.length === 0) return setStatus('Nothing to export for this mode.');
      // Written only from the newest, finished and judged result: anything else says why and writes nothing.
      const withSupports = files.flatMap((file) => file.parts.filter((part) => part.content === 'supports').map((part) => part.unitId));
      const refusal = exportRefusal(outcome, [...new Set(withSupports)], (unitId) => sceneRef.current.units.find((candidate) => candidate.id === unitId) === units.find(([unit]) => unit.id === unitId)?.[0]);
      if (refusal) {
        const name = units.find(([unit]) => unit.id === refusal.unitId)?.[0].name ?? refusal.unitId;
        if (refusal.reason === 'stale') return refuse('stale', name);
        if (refusal.reason === 'failed') return refuse('failed', name);
        return refuse('inconclusive', name);
      }
      /*
       * THE ONE PLACE THIS FUNCTION COMMITS MORE THAN ONCE, and it used to lie about it (walk `r1`,
       * G1). Each `click()` hands one file to the browser; the first file is in the operator's
       * downloads before the second hand-over is even attempted. A throw anywhere in this loop went
       * to the catch below, which says "Nothing was saved" - true of every other export failure in
       * the app, because every other one happens before a byte is written, and false here. The walk
       * caught it saying so with the first file already on disk, and advising "try again".
       *
       * Chrome refuses several automatic downloads from one gesture, so this is a fault the operator
       * meets without any help from an audit.
       *
       * THE TRAP: A BROWSER THAT BLOCKS QUIETLY DOES NOT THROW, and the page cannot tell. So this is
       * not a guarantee that every file arrived - it is the narrower and honest claim that what this
       * loop MANAGED TO HAND OVER is what the operator is told about, and `saved` is the record of it.
       */
      const saved: string[] = [];
      try {
        for (const file of written) {
          const url = URL.createObjectURL(new Blob([file.buffer], { type: 'model/stl' }));
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = file.fileName;
          anchor.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 1000);
          saved.push(file.fileName);
        }
      } catch (error) {
        // Nothing handed over: the generic export failure below is right, so let it have it.
        if (saved.length === 0) throw error;
        const refused = written[saved.length]!.fileName;
        return sayOutcome(exportPartialText(saved, refused), EXPORT_PARTIAL_CODE, { saved: saved.join(', '), name: refused });
      }
      // The file names and how many supports the files hold, as the status names them.
      const count = units.reduce((sum, [unit]) => sum + unitContacts(unit, builtRef.current.get(unit.id)?.mesh).length, 0);
      const names = `${written.map((file) => file.fileName).join(', ')} (${plural(count, '1 support', '{n} supports')})`;
      setStatusMessage(exportStatus(names, await checking));
    } catch (error) {
      if (isAbort(error)) setStatus('Export cancelled; no file was written.');
      else setStatusMessage(errorStatus('export', codedJobError(error)));
    } finally {
      setExporting(false);
    }
  }, [builtRef, dentureExport, exporter, refuse, runCheck, sceneRef, setStatus, setStatusMessage]);
  return { exporting, runExport };
}
