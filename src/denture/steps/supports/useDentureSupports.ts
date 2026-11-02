import { useCallback, useRef, type MutableRefObject } from 'react';
import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';
import { resolveSettings, supportJobOf } from '@mixo-geocore/host/supports/unitSupports';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import type { ExportResult } from '@mixo-geocore/host/workers/meshClient';
import type { PrintScene, PrintUnit, SceneCommand, SupportSettings } from '../../../state/project';
import type { DentureClient } from '../../engine/dentureClient';
import type { DentureMesh } from '../../engine/dentureCore';
import { dentureRulesOf } from '../../settings/dentureRules';
import type { DentureOptions } from '../../settings/dentureOptions';
import { dentureJobOf } from './dentureBuildJob';
import { isBareIsland, LANDING_TIER_TEXT } from '../../../supports/unresolved/unresolvedText';
import { checksLandingFirst, isResolvable, resolvableIds, resolveCommand } from './resolvePoint';
import { allFinish, awaitedBuild, landedFinish, pointFinish, type PendingRebuild } from './rebuildStatus';

/*
 * Step 2 of the denture job (Round D): the unit's support builds and exports run in the denture worker with the
 * denture policy (as the batch builds them), and the unresolved points resolve from the model surface. A single
 * point is first checked on the edit path (`reroute_support` with `allowModelLanding`, milliseconds, no build);
 * when the engine finds a landing, the point joins the allow list in one undoable scene command and the rebuild
 * places it, with its landing tier shown by the existing mark. "Resolve all" allows every resolvable point at once. The status line
 * that says the supports are rebuilding turns into a finished line when that rebuild lands (`rebuildStatus.ts`).
 */

interface DentureSupportsHost {
  client: () => DentureClient;
  dispatch: (command: SceneCommand) => void;
  sceneRef: MutableRefObject<PrintScene>;
  setStatus: (key: string, vars?: Record<string, string | number>, other?: string) => void;
}

export function useDentureSupports({ client, dispatch, sceneRef, setStatus }: DentureSupportsHost) {
  /** The resolve whose status line waits for its rebuild; the latest allow replaces it. */
  const pending = useRef<PendingRebuild>();

  /** One preview build of a denture unit; undefined when a newer build replaced it (or the unit is no accepted denture). */
  const build = useCallback((unit: PrintUnit, label: JobLabel): Promise<DentureMesh | undefined> => {
    const job = dentureJobOf(unit, 'preview', dentureRulesOf(unit));
    if (!job) return Promise.resolve(undefined);
    return client().build(unit.id, job, label).then((mesh) => {
      const waiting = pending.current;
      if (mesh && waiting && awaitedBuild(waiting, unit, sceneRef.current.units.find((candidate) => candidate.id === unit.id))) {
        pending.current = undefined;
        const line = waiting.finish(mesh);
        if (line) setStatus(line.key, line.vars, line.other);
      }
      return mesh;
    });
  }, [client, sceneRef, setStatus]);

  /** An export whose units include a denture: every unit built in the denture worker (dentures with their own pipeline). */
  const exportFiles = useCallback((units: readonly (readonly [PrintUnit, number])[], files: ExportFilePlan[], label: JobLabel): Promise<ExportResult> => client().exportFiles(
    units.map(([unit, index]) => {
      const denture = dentureJobOf(unit, 'export', dentureRulesOf(unit));
      return { unitId: unit.id, transform: unit.transform, ...(denture ? { denture } : { generic: supportJobOf(unit, index, 'export') }) };
    }), files, label), [client]);

  const unitNow = useCallback((unitId: string) => sceneRef.current.units.find((candidate) => candidate.id === unitId), [sceneRef]);

  /** Allows `ids` on the unit as it is now: one scene command (undoable), then the rebuild, whose landing says `finish`'s line. */
  const allow = useCallback((unitId: string, ids: readonly string[], finish: PendingRebuild['finish']): boolean => {
    const unit = unitNow(unitId);
    const command = unit ? resolveCommand(unit, ids) : undefined;
    if (!unit || !command) return false;
    pending.current = { unitId, before: unit, finish };
    dispatch(command);
    return true;
  }, [dispatch, unitNow]);

  /** A bubble click: check the one point on the edit path, then allow it (a tipless lowest point or island goes straight on the list). */
  const resolve = useCallback((unitId: string, point: UnresolvedPoint) => {
    const unit = unitNow(unitId);
    if (!unit || !isResolvable(point)) return;
    if (!checksLandingFirst(point)) {
      if (allow(unitId, [point.id], pointFinish(point.id, isBareIsland(point.id)))) setStatus(isBareIsland(point.id) ? 'Island allowed on the model surface. Rebuilding the supports…' : 'Lowest point allowed on the model surface. Rebuilding the supports…');
      return;
    }
    const job = dentureJobOf(unit, 'preview', dentureRulesOf(unit));
    if (!job) return;
    setStatus('Looking for a landing on the model surface…');
    void client().checkLanding(unit.id, { ...job, tip: point.position as Vector, normal: point.normal as Vector }, { key: 'Checking a model-surface landing on {name}', vars: { name: unit.name } }).then((result) => {
      if (!result) return;
      if ('refusal' in result) return setStatus('No landing on the model surface either: {reason}', { reason: result.refusal });
      if (allow(unitId, [point.id], landedFinish(point.id))) setStatus(result.landing ? LANDING_TIER_TEXT[result.landing.tier] : 'Supported from the model surface.');
    }, () => setStatus('The model-surface landing could not be checked. Supports unchanged.'));
  }, [allow, client, setStatus, unitNow]);

  /** Resolve all: every resolvable point of the unit's current build, in one undo step. */
  const resolveAll = useCallback((unitId: string, points: readonly UnresolvedPoint[]) => {
    const ids = resolvableIds(points);
    if (allow(unitId, ids, allFinish(ids))) setStatus('Allowed 1 point on the model surface. Rebuilding the supports…', { n: ids.length }, 'Allowed {n} points on the model surface. Rebuilding the supports…');
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

  /** Exit left the unit's Step 2: its builds and landing checks stop (nothing reads them) and its waiting status line goes. */
  const leave = useCallback((unitId: string) => {
    if (pending.current?.unitId === unitId) pending.current = undefined;
    client().cancel(`build:${unitId}:`);
    client().cancel(`landing:${unitId}:`);
  }, [client]);

  return { build, exportFiles, resolve, resolveAll, setLattice, setOptions, leave, resolvable: isResolvable };
}
