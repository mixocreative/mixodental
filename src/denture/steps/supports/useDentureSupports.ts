import { useCallback, type MutableRefObject } from 'react';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import { resolveSettings, supportJobOf } from '@mixo-geocore/host/supports/unitSupports';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import type { ExportResult } from '@mixo-geocore/host/workers/meshClient';
import type { PrintScene, PrintUnit, SceneCommand, SupportSettings } from '../../../state/project';
import { LANDING_TIER_TEXT } from '../../../supports/unresolved/unresolvedText';
import type { DentureClient } from '../../engine/dentureClient';
import type { DentureMesh } from '../../engine/dentureCore';
import { dentureRulesOf } from '../../settings/dentureRules';
import type { DentureOptions } from '../../settings/dentureOptions';
import { dentureJobOf } from './dentureBuildJob';
import { checksLandingFirst, isResolvable, resolvableIds, resolveCommand } from './resolvePoint';

/*
 * Step 2 of the denture job (Round D): the unit's support builds and exports run in the denture worker with the
 * denture policy (as the batch builds them), and the unresolved points resolve from the model surface. A single
 * point is first checked on the edit path (`reroute_support` with `allowModelLanding`, milliseconds, no build);
 * when the engine finds a landing, the point joins the allow list in one undoable scene command and the rebuild
 * places it, with its landing tier shown by the existing mark. "Resolve all" allows every resolvable point at once.
 */

interface DentureSupportsHost {
  client: () => DentureClient;
  dispatch: (command: SceneCommand) => void;
  sceneRef: MutableRefObject<PrintScene>;
  setStatus: (key: string, vars?: Record<string, string | number>, other?: string) => void;
}

export function useDentureSupports({ client, dispatch, sceneRef, setStatus }: DentureSupportsHost) {
  /** One preview build of a denture unit; undefined when a newer build replaced it (or the unit is no accepted denture). */
  const build = useCallback((unit: PrintUnit, label: JobLabel): Promise<DentureMesh | undefined> => {
    const job = dentureJobOf(unit, 'preview', dentureRulesOf(unit));
    return job ? client().build(unit.id, job, label) : Promise.resolve(undefined);
  }, [client]);

  /** An export whose units include a denture: every unit built in the denture worker (dentures with their own pipeline). */
  const exportFiles = useCallback((units: readonly (readonly [PrintUnit, number])[], files: ExportFilePlan[], label: JobLabel): Promise<ExportResult> => client().exportFiles(
    units.map(([unit, index]) => {
      const denture = dentureJobOf(unit, 'export', dentureRulesOf(unit));
      return { unitId: unit.id, transform: unit.transform, ...(denture ? { denture } : { generic: supportJobOf(unit, index, 'export') }) };
    }), files, label), [client]);

  const unitNow = useCallback((unitId: string) => sceneRef.current.units.find((candidate) => candidate.id === unitId), [sceneRef]);

  /** Allows `ids` on the unit as it is now: one scene command (undoable), then the rebuild. */
  const allow = useCallback((unitId: string, ids: readonly string[]): boolean => {
    const unit = unitNow(unitId);
    const command = unit ? resolveCommand(unit, ids) : undefined;
    if (command) dispatch(command);
    return command !== undefined;
  }, [dispatch, unitNow]);

  /** A bubble click: check the one point on the edit path, then allow it (a tipless lowest point goes straight on the list). */
  const resolve = useCallback((unitId: string, point: UnresolvedPoint) => {
    const unit = unitNow(unitId);
    if (!unit || !isResolvable(point)) return;
    if (!checksLandingFirst(point)) {
      if (allow(unitId, [point.id])) setStatus('Lowest point allowed on the model surface. Rebuilding the supports…');
      return;
    }
    const job = dentureJobOf(unit, 'preview', dentureRulesOf(unit));
    if (!job) return;
    setStatus('Looking for a landing on the model surface…');
    void client().checkLanding(unit.id, { ...job, tip: point.position as Vector, normal: point.normal as Vector }, { key: 'Checking a model-surface landing on {name}', vars: { name: unit.name } }).then((result) => {
      if (!result) return;
      if ('refusal' in result) return setStatus('No landing on the model surface either: {reason}', { reason: result.refusal });
      if (allow(unitId, [point.id])) setStatus(result.landing ? LANDING_TIER_TEXT[result.landing.tier] : 'Supported from the model surface.');
    }, () => setStatus('The model-surface landing could not be checked. Supports unchanged.'));
  }, [allow, client, setStatus, unitNow]);

  /** Resolve all: every resolvable point of the unit's current build, in one undo step. */
  const resolveAll = useCallback((unitId: string, points: readonly UnresolvedPoint[]) => {
    const ids = resolvableIds(points);
    if (allow(unitId, ids)) setStatus('Allowed 1 point on the model surface. Rebuilding the supports…', { n: ids.length }, 'Allowed {n} points on the model surface. Rebuilding the supports…');
    else setStatus('No unresolved points to support.');
  }, [allow, setStatus]);

  /** The lattice switch (the panel's Cross-braces): the policy's lattice and the settings' braces, one undo step. */
  const setLattice = useCallback((unitId: string, lattice: boolean) => {
    const unit = unitNow(unitId);
    if (!unit?.denture) return;
    dispatch({ type: 'batch', commands: [
      { type: 'denture/set', unitId, denture: { ...unit.denture, policy: { ...unit.denture.policy, lattice } } },
      { type: 'settings/set', unitId, settings: { ...resolveSettings(unit.settings), trussEnabled: lattice } as unknown as SupportSettings },
    ] });
  }, [dispatch, unitNow]);

  /** A denture setting changed: the unit's options, one undo step; the rebuild follows. */
  const setOptions = useCallback((unitId: string, options: DentureOptions) => {
    const unit = unitNow(unitId);
    if (unit?.denture) dispatch({ type: 'denture/set', unitId, denture: { ...unit.denture, options } });
  }, [dispatch, unitNow]);

  return { build, exportFiles, resolve, resolveAll, setLattice, setOptions, resolvable: isResolvable };
}
