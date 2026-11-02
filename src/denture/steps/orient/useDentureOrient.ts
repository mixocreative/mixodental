import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { TiltPaths } from '@mixo-geocore/host/dental/dentureTilt';
import { arrangeCommands as arrangeCaseCommands } from '@mixo-geocore/editing/arrange';
import { defaultDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { resolveSettings } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintScene, PrintUnit, SceneCommand } from '../../../state/project';
import type { DentalTiltState } from '../../../components/useDentalFlow';
import type { ViewRequest } from '../../../components/viewport/types';
import type { OrientationLayer } from '../../../dental/orientationEvidence';
import type { DentureClient } from '../../engine/dentureClient';
import { liftedFrame, scanSettingsOf } from '../../engine/dentureCore';
import { liveTiltThrottle, type LiveTiltThrottle } from '../../engine/liveTilt';
import { dentureSupportSettings } from '../../settings/dentureSupportSettings';
import { dentureRulesOf } from '../../settings/dentureRules';
import { packRules } from '@mixo-geocore/host/supports/generateRules';
import { acceptCommands } from './acceptCommands';
import { liveTipLayers, tipCounts } from './liveTipLayers';
import { tipColours } from './tipColours';
import { scanOutcome, type ScanSettled } from './scanOutcome';
import { stepPanelInset } from '../../../dental/stepPanelInset';
import { isAbort } from '../../../components/appShared';

/*
 * Step 1 of the denture job (Round D): stand the dropped denture upright and search its print angle in the
 * denture worker (the batch review's `orientDenture` + `scanDentureTilts`), turn it to the pick, open the
 * live-tilt handle and colour the tips of the shown tilt by their path state while the dial moves (throttled:
 * one engine call per frame, never while one is on its way). Next places the accepted pose's tips and opens
 * Step 2. The handle is freed when the step is left. Same surface as the aligner's `useDentalFlow` Step 1.
 */

interface DentureOrientHost {
  client: () => DentureClient;
  dispatch: (command: SceneCommand) => void;
  send: (event: SessionEvent) => void;
  sceneRef: MutableRefObject<PrintScene>;
  sessionRef: MutableRefObject<EditSession>;
  session: EditSession;
  /** Free transform is on: the operator owns the pose, so the tips of no scanned tilt are shown. */
  freeTransform: boolean;
  setStatus: (key: string, vars?: Record<string, string | number>) => void;
  requestView: (kind: ViewRequest['kind'], rightInset?: number) => void;
}

/** The live tips of the tilt shown (unit-local), or none. */
type LiveTips = { unitId: string; tiltDeg: number; paths: Extract<TiltPaths, { kind: 'paths' }> } | undefined;

export function useDentureOrient({ client, dispatch, send, sceneRef, sessionRef, session, freeTransform, setStatus, requestView }: DentureOrientHost) {
  const seq = useRef(0);
  const [tilt, setTiltState] = useState<DentalTiltState | undefined>(undefined);
  const tiltRef = useRef<DentalTiltState | undefined>(undefined);
  const setTilt = useCallback((next: DentalTiltState | undefined) => { tiltRef.current = next; setTiltState(next); }, []);
  /** The automatic pick's pose, for Auto orient (restore, no re-run). */
  const detected = useRef<{ unitId: string; rotation: Vector } | undefined>(undefined);
  const [live, setLive] = useState<LiveTips>(undefined);
  const throttle = useRef<{ unitId: string; throttle: LiveTiltThrottle } | undefined>(undefined);

  const unitOf = useCallback((unitId: string) => sceneRef.current.units.find((candidate) => candidate.id === unitId), [sceneRef]);

  /** Frees the live-tilt handle (and stops its throttle); the tips go. */
  const closeLive = useCallback(() => {
    const open = throttle.current;
    if (!open) return;
    open.throttle.dispose();
    throttle.current = undefined;
    setLive(undefined);
    void client().liveClose(open.unitId).catch(() => undefined);
  }, [client]);

  /** Turns the denture to `rotation` and lays the session's cases out again (its footprint changed). */
  const turnTo = useCallback((unitId: string, rotation: Vector) => {
    const current = unitOf(unitId);
    if (!current) return;
    const turned = { ...current, transform: { ...current.transform, rotation } };
    const units = sceneRef.current.units.map((candidate) => (candidate.id === unitId ? turned : candidate));
    dispatch({ type: 'batch', commands: [{ type: 'transform/set', unitId, transform: turned.transform }, ...arrangeCaseCommands(units, [...sessionRef.current.dentalFinished, unitId])] });
  }, [dispatch, sceneRef, sessionRef, unitOf]);

  /** Asks for the tips of the row shown (through the throttle). */
  const showTips = useCallback((state: DentalTiltState | undefined) => {
    if (state?.status !== 'ready' || throttle.current?.unitId !== state.unitId) return;
    throttle.current.throttle.request(state.scan.rows[state.index]!.tiltDeg);
  }, []);

  /** Step 1: upright and print angle in the worker; the pick turns the denture, then the live handle opens. */
  const start = useCallback((unit: PrintUnit) => {
    const token = ++seq.current;
    const profile = sessionRef.current.dentalProfile;
    closeLive();
    // A scan or placement still running for the object this one replaces stops: the worker is free for this scan.
    client().cancel('orient:');
    client().cancel('place:');
    send({ type: 'dentalLoading', unitId: unit.id });
    const stale = () => seq.current !== token || sceneRef.current.activeUnitId !== unit.id;
    const failed = () => send({ type: 'dentalOrientFailed', notices: [{ kind: 'denture-failed' }] });
    if (!profile) return failed();
    const settings = unit.denture?.policy.profileId === profile ? resolveSettings(unit.settings) : dentureSupportSettings(profile, resolveSettings(unit.settings));
    // The unit's denture settings (a denture seen before) shape the scan, the live tips and the placement too.
    const rules = dentureRulesOf(unit);
    const scanSettings = scanSettingsOf(settings, Object.keys(rules).length > 0 ? packRules(rules) : undefined);
    // The denture scan runs from upright (0) to the profile's range (Rust `denture::tilt`).
    const { tiltRangeDeg, tiltStepDeg } = dentureProfileData(profile).pose;
    const total = Math.floor(tiltRangeDeg / tiltStepDeg + 1e-9) + 1;
    setTilt({ status: 'scanning', unitId: unit.id, done: 0, total });
    void client().orient(unit.id, unit.source, profile, scanSettings, { key: 'Orienting {name}', vars: { name: unit.name } }, (fraction) => {
      const current = tiltRef.current;
      if (!stale() && current?.status === 'scanning') setTilt({ ...current, done: Math.round(fraction * total) });
    }).then((result): ScanSettled => ({ result }), (error: unknown): ScanSettled => ({ error })).then((settled) => {
      if (stale()) return;
      // Every ending leaves "scanning" (scanOutcome.ts): a crash, timeout or cancel never keeps Next waiting.
      const outcome = scanOutcome(unit.id, settled);
      if (outcome.kind === 'failed') {
        setTilt(outcome.tilt);
        failed();
        if (outcome.cancelled) setStatus('Orientation cancelled. Turn the denture with Free transform, then press Next.');
        return;
      }
      const ready = outcome.tilt;
      const { scan, index } = ready;
      setTilt(ready);
      detected.current = { unitId: unit.id, rotation: scan.rows[index]!.rotation };
      turnTo(unit.id, scan.rows[index]!.rotation);
      requestView('fit');
      send({ type: 'dentureOriented' });
      setStatus('Denture stood upright. Drag the dial to choose the print angle, then press Next.');
      const handle = liveTiltThrottle((deg) => client().liveAt(unit.id, deg), (tiltDeg, paths) => {
        if (paths.kind === 'paths') setLive({ unitId: unit.id, tiltDeg, paths });
      });
      throttle.current = { unitId: unit.id, throttle: handle };
      void client().liveOpen(unit.id, unit.source, profile, scanSettings).then((ok) => {
        if (ok && throttle.current?.throttle === handle) showTips(tiltRef.current);
      }, () => undefined);
    });
  }, [client, closeLive, requestView, sceneRef, send, sessionRef, setStatus, setTilt, showTips, turnTo]);

  /** The dial: the row at `index`, chosen by hand; the model turns and its tips are asked for. */
  const chooseTilt = useCallback((index: number) => {
    const current = tiltRef.current;
    if (current?.status !== 'ready' || !current.scan.rows[index]) return;
    const next: DentalTiltState = { ...current, index, hand: index !== current.scan.order[0] };
    setTilt(next);
    turnTo(current.unitId, current.scan.rows[index]!.rotation);
    showTips(next);
  }, [setTilt, showTips, turnTo]);

  /** Auto orient: restore the stored automatic pose (PD.11 owner answer: no re-run). */
  const useDetected = useCallback(() => {
    const current = tiltRef.current;
    const pick = detected.current;
    if (!pick || current?.status !== 'ready' || current.unitId !== pick.unitId) return;
    const next: DentalTiltState = { ...current, index: current.scan.order[0]!, hand: false };
    setTilt(next);
    turnTo(pick.unitId, pick.rotation);
    showTips(next);
  }, [setTilt, showTips, turnTo]);

  /** Free transform confirmed: the operator's rotation is the pose Next accepts. */
  const markHand = useCallback(() => {
    const current = tiltRef.current;
    if (current?.status === 'ready') setTilt({ ...current, hand: true });
  }, [setTilt]);

  /** Next: the accepted pose's tips (denture policy in the worker), the denture settings and policy, then Step 2. */
  const next = useCallback(() => {
    const unitId = sessionRef.current.dentalUnitId;
    const unit = unitId ? unitOf(unitId) : undefined;
    const profile = sessionRef.current.dentalProfile;
    if (!unit || !profile || sessionRef.current.dentalStage !== 'aligner' || sessionRef.current.dentalAligner !== 'ready') return;
    const token = ++seq.current;
    const own = unit.denture?.policy.profileId === profile;
    const settings = own ? resolveSettings(unit.settings) : dentureSupportSettings(profile, resolveSettings(unit.settings));
    const frame = liftedFrame(unit.source, unit.transform.rotation, settings.liftHeight, [unit.transform.position[0], unit.transform.position[2]]);
    const policy = defaultDenturePolicy(profile, settings.trussEnabled);
    const rules = dentureRulesOf(unit);
    setStatus('Placing the denture support tips…');
    void client().place(unit.id, { mesh: unit.source, policy, frame, rules, hand: { manual: unit.manual, deleted: unit.deleted, zones: unit.zones, contactSettings: unit.contactSettings } },
      { key: 'Placing support tips on {name}', vars: { name: unit.name } }).then((placed) => {
      if (seq.current !== token || unitOf(unit.id) !== unit || sessionRef.current.dentalStage !== 'aligner') return;
      if (!placed) return setStatus('The denture support tips could not be placed. Turn the denture, then press Next again.');
      dispatch({ type: 'batch', commands: acceptCommands(unit, { frame, points: placed.points, settings, denture: { policy, ...(unit.denture?.options ? { options: unit.denture.options } : {}) } }) });
      closeLive();
      send({ type: 'acceptDentalOrientation' });
      // Step 2's panel docks on the right: the denture is framed in the area left of it.
      requestView('fit', stepPanelInset({ mode: 'dental', dentalStage: 'review' }));
    }, (error: unknown) => {
      if (seq.current !== token) return;
      setStatus(isAbort(error) ? 'Placing the denture support tips was cancelled. Press Next again.' : 'The denture support tips could not be placed. Turn the denture, then press Next again.');
    });
  }, [client, closeLive, dispatch, requestView, send, sessionRef, setStatus, unitOf]);

  /** Exit, Back or a new file: what Step 1 still reads is dropped and the handle is freed. */
  const invalidate = useCallback(() => {
    seq.current += 1;
    closeLive();
    // Leaving Step 1 stops its scan and placement: nothing reads them, and the next job would wait behind them.
    client().cancel('orient:');
    client().cancel('place:');
    if (tiltRef.current?.status === 'scanning') setTilt(undefined);
  }, [client, closeLive, setTilt]);

  // Leaving Step 1 (Next, Back, Exit, another unit) frees the handle.
  const inStep = session.mode === 'dental' && session.dentalStage === 'aligner';
  const unitInStep = session.dentalUnitId;
  useEffect(() => {
    if (!inStep || (throttle.current && throttle.current.unitId !== unitInStep)) closeLive();
  }, [closeLive, inStep, unitInStep]);
  useEffect(() => () => closeLive(), [closeLive]);

  const showLive = inStep && !freeTransform && live !== undefined && tilt?.status === 'ready' && tilt.unitId === live.unitId && tilt.scan.rows[tilt.index]!.tiltDeg === live.tiltDeg;
  const tipLayers = useMemo<{ unitId: string; layers: OrientationLayer[] } | undefined>(
    () => (showLive && live ? { unitId: live.unitId, layers: liveTipLayers(live.paths, tipColours()) } : undefined), [live, showLive]);
  const counts = showLive && live ? tipCounts(live.paths) : undefined;

  return { start, useDetected, next, invalidate, tilt, chooseTilt, markHand, proposed: tilt?.status === 'ready', tipLayers, counts };
}
