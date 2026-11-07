import { useCallback } from 'react';
import { arrangeCommands } from '@mixo-geocore/editing/arrange';
import type { PrintUnit, SceneCommand } from '../state/project';

/*
 * LAYING THE OBJECTS OUT, with no build plate.
 *
 * This used to pack every case INSIDE a chosen printer's build plate, report the cases that did not
 * fit, and re-pack incrementally whenever a footprint changed. All of that answered a question this
 * product does not ask: exports are per-object, so the slicer packs the real plate, and packing to a
 * build volume the app does not own decides nothing. The owner retired the build plate here.
 *
 * What is left is the part that was always load-bearing: **objects must not overlap**, so the
 * operator can see them. `arrangeCommands` does exactly that and takes no plate size — it never did.
 * It is the same call the dental flow already makes when an aligner is finished, so the app now has
 * ONE layout behaviour instead of two.
 *
 * Gone with the plate: the printer choice, the "does not fit" list (nothing can fail to fit without
 * bounds), and the incremental re-pack (it existed to re-fit things inside those bounds).
 *
 * THE SEAM IS KEPT, UNWIRED AND STILL TESTED: `src/plate/printerProfiles.ts`, `src/config/
 * printers.json`, `components/viewport/PlateOutline.tsx`, and `arrangeOnPlate` in the core — which
 * mixomesh may need. Reviving plate packing is re-wiring these call sites, not rebuilding the thing.
 */

interface PlateHost {
  units: readonly PrintUnit[];
  dispatch: (command: SceneCommand) => void;
  /** A status line: key, vars, plural key. */
  setStatus: (key: string, vars?: Record<string, string | number>, other?: string) => void;
}

export function usePlateArrange({ units, dispatch, setStatus }: PlateHost) {
  const arrange = useCallback(() => {
    const commands = arrangeCommands(units, units.map((unit) => unit.id));
    // No command means every object is already clear of the others, which is worth saying rather
    // than leaving the press looking broken.
    if (commands.length === 0) return setStatus('The objects are already apart.');
    dispatch({ type: 'batch', commands });
    setStatus('Moved {n} object so they do not overlap.', { n: commands.length }, 'Moved {n} objects so they do not overlap.');
  }, [units, dispatch, setStatus]);

  return { arrange };
}
