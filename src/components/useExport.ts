import { useCallback, useState, type MutableRefObject } from 'react';
import { errorStatus } from '@mixo-geocore/editing/errors';
import { exportStatus, type CheckTally } from '@mixo-geocore/editing/check';
import { plural, type Message } from '../i18n';
import type { PrintScene, PrintUnit } from '../state/project';
import { exportUnits, planExport, type ExportKind } from '@mixo-geocore/host/supports/export';
import { exportRefusal } from '@mixo-geocore/host/supports/exportGate';
import { currentBuilds, supportJobOf, unitContacts, type BuiltSupports, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { ExportResult, SupportMeshClient } from '@mixo-geocore/host/workers/meshClient';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import { codedJobError } from '../workers/jobErrors';
import { isAbort, type SetStatus } from './appShared';

const REFUSED_STALE = 'Export refused: {name} changed while it was being exported, so the files would not match what you see. Nothing was written; export again.';
const REFUSED_FAILED = 'Export refused: the supports of {name} were not built, so nothing was written. Generate again, then export.';
const REFUSED_INCONCLUSIVE = 'Export refused: the safety check of {name} could not reach a verdict (it ran out of time or could not judge a crossing), so nothing was written. Generate again, or use fewer supports.';

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
        if (refusal.reason === 'stale') return setStatus(REFUSED_STALE, { name });
        if (refusal.reason === 'failed') return setStatus(REFUSED_FAILED, { name });
        return setStatus(REFUSED_INCONCLUSIVE, { name });
      }
      for (const file of written) {
        const url = URL.createObjectURL(new Blob([file.buffer], { type: 'model/stl' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = file.fileName;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  }, [builtRef, dentureExport, exporter, runCheck, sceneRef, setStatus, setStatusMessage]);
  return { exporting, runExport };
}
