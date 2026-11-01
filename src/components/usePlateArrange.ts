import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { PrintUnit, SceneCommand } from '../state/project';
import { arrangePlateCases, editedCases, footprintKeys, plateFootprints } from '../plate/plateLayout';
import { loadPrinter, printerById, savePrinter, type PrinterProfile } from '../plate/printerProfiles';

/*
 * The plate section's state (Round C): the chosen printer (its plate size), "Arrange plate", and after a first
 * arrange the incremental re-pack: when a case's footprint changes (an edit, a rebuild) only that case moves, and
 * only if it now overlaps another or leaves the plate. The re-pack waits while a mode is open (the case being
 * edited never jumps under the pointer) and never runs while a redo is pending (it would drop the redo).
 */

interface PlateHost {
  units: readonly PrintUnit[];
  built: ReadonlyMap<string, { unit: PrintUnit; mesh: GeneratedSupportMesh }>;
  dispatch: (command: SceneCommand) => void;
  /** A status line: key, vars, plural key. */
  setStatus: (key: string, vars?: Record<string, string | number>, other?: string) => void;
  /** No mode (Support Edit Mode, zones, the dental flow) is open. */
  idle: boolean;
  /** Undo was used and Redo can step forward. */
  redoPending: boolean;
}

export function usePlateArrange({ units, built, dispatch, setStatus, idle, redoPending }: PlateHost) {
  const [printer, setPrinter] = useState<PrinterProfile>(() => loadPrinter());
  /** Cases the last arrange could not place (shown until a later arrange places them). */
  const [unplaced, setUnplaced] = useState<readonly string[]>([]);
  /** The footprint keys the plate was last laid out with; undefined until the first "Arrange plate". */
  const laidOut = useRef<Map<string, string> | undefined>(undefined);

  const choosePrinter = useCallback((id: string) => {
    const next = printerById(id);
    savePrinter(next.id);
    setPrinter(next);
  }, []);

  const arrange = useCallback(() => {
    const footprints = plateFootprints(units, built);
    const result = arrangePlateCases(units, footprints, printer.plate);
    laidOut.current = footprintKeys(units, footprints);
    setUnplaced(result.unplaced);
    if (result.command) dispatch(result.command);
    if (result.unplaced.length > 0) setStatus('{n} case does not fit on the plate.', { n: result.unplaced.length }, '{n} cases do not fit on the plate.');
    else setStatus(result.moved.length > 0 ? 'Arranged {n} cases on the plate.' : 'The cases already fit on the plate.', { n: result.moved.length });
  }, [built, dispatch, printer, setStatus, units]);

  // The incremental re-pack: only cases whose footprint changed since the last layout, every other case frozen.
  useEffect(() => {
    const before = laidOut.current;
    if (!before || !idle || redoPending) return;
    const footprints = plateFootprints(units, built);
    const now = footprintKeys(units, footprints);
    const edited = editedCases(before, now);
    laidOut.current = now;
    if (edited.length === 0) return;
    const result = arrangePlateCases(units, footprints, printer.plate, edited);
    setUnplaced((current) => [...current.filter((id) => !edited.includes(id) && now.has(id)), ...result.unplaced]);
    if (result.command) {
      dispatch(result.command);
      setStatus('Moved {n} edited case so the cases stay apart.', { n: result.moved.length }, 'Moved {n} edited cases so the cases stay apart.');
    }
  }, [built, dispatch, idle, printer, redoPending, setStatus, units]);

  return { printer, choosePrinter, arrange, unplaced: unplaced.filter((id) => units.some((unit) => unit.id === id)) };
}
