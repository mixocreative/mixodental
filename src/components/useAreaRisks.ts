import { useEffect, useState } from 'react';
import type { PrintUnit } from '../state/project';
import { placementJobOf, resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import type { AnalysisClient } from '../workers/analysisClient';
import type { AreaRisk } from '../dental/areaRisk';

/** How long after the last paint or erase stroke the low points are looked for again. */
export const AREA_RISK_DELAY_MS = 500;

/** The risks of one unit version: a result for an older version is never shown. */
export interface AreaRisks { unit: PrintUnit; risks: readonly AreaRisk[] }

const NONE: readonly AreaRisk[] = [];

/**
 * Step 2: the overhang low points outside the permitted area, looked for in the analysis worker
 * `AREA_RISK_DELAY_MS` after the unit last changed (a paint or erase stroke, a retune). The unit is
 * the revision: a result whose unit is no longer the current one is dropped, and a newer job replaces
 * a running one by key. The main thread only waits.
 */
export function useAreaRisks(unit: PrintUnit | undefined, active: boolean, analysis: () => AnalysisClient, unitName: (unitId: string) => string): readonly AreaRisk[] {
  const [stored, setStored] = useState<AreaRisks>();
  useEffect(() => {
    if (!active || !unit?.dental) { setStored(undefined); return; }
    let live = true;
    let client: AnalysisClient | undefined;
    const key = `dental-risk:${unit.id}`;
    const timer = window.setTimeout(() => {
      client = analysis();
      const placement = placementJobOf(unit);
      void client.dentalRisks(key, { mesh: unit.source, orientation: placement.orientation, dental: unit.dental!, settings: placement.settings,
        radius: resolveSettings(unit.settings).eraseRadius },
      { key: 'Looking for low points outside the support area on {name}', vars: { name: unitName(unit.id) } }).then((risks) => {
        if (live && risks) setStored({ unit, risks });
      }, () => { if (live) setStored(undefined); });
    }, AREA_RISK_DELAY_MS);
    return () => { live = false; window.clearTimeout(timer); client?.cancel(key); };
  }, [unit, active, analysis, unitName]);
  // Shown only for the unit version they were found on; while a newer one is on its way the spots are hidden, not stale.
  return active && stored && stored.unit === unit ? stored.risks : NONE;
}
