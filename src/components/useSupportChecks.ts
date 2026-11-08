import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import type { AnalysisClient } from '../workers/analysisClient';
import { codedJobError } from '../workers/jobErrors';
import { isAbort, type SetStatus } from './appShared';
import { useFixSpot, type FixTarget } from './useFixSpot';
import type { PrintScene, PrintUnit, SceneCommand } from '../state/project';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { inverseTransformDirection, inverseTransformPoint, transformPoint } from '@mixo-geocore/host/state/transform';
import { problemInZone } from '@mixo-geocore/host/supports/zoneCheck';
import { checkJobOf, currentBuild, orientationOf, resolveSettings, unitContacts, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import { builtGeometry, type HeldBuild } from '../plate/releasedBuild';
import { islandProblems } from '@mixo-geocore/editing/islandProblems';
import { omittedProblems } from '@mixo-geocore/editing/omittedProblem';
import { splitDentureSpots } from '../denture/check/dentureSpots';
import type { DentureClient } from '../denture/engine/dentureClient';
import { checkStatus, joinRun, runToken, tallyChecks, uncovered, type CheckTally } from '@mixo-geocore/editing/check';
import { errorStatus } from '@mixo-geocore/editing/errors';
import type { EditSession, SessionEvent } from '@mixo-geocore/editing/session';
import type { EditMode } from '@mixo-geocore/editing/types';
import type { Message } from '../i18n';

/** A support check finding, its position in the unit's local frame. */
export interface UnitProblem extends SupportProblem {
  unitId: string;
  /** The spot lies inside a no-support zone, which is why it has no support. */
  inZone: boolean;
}

/** A unit's findings, with the unit version and support build they were found on. */
export interface UnitProblems {
  unit: PrintUnit;
  mesh: GeneratedSupportMesh | undefined;
  items: UnitProblem[];
}

/** How long an edited unit's re-check waits, so a burst of edits runs one check and not five. */
const RECHECK_DELAY_MS = 600;

/**
 * THE SUPPORT CHECK: running it, what it found, and what the problem list is allowed to say.
 *
 * It owns `problems` — the findings by unit — and therefore everything that reads them: the list
 * the panel renders, the re-check that replaces a stale unit's findings, and Fix (`useFixSpot`),
 * which follows one finding through to the support that covers it. Fix is called from in here
 * rather than beside it because it both reads `problems` and reports back whether a finding is
 * being re-checked; keeping them apart would have been a cycle through `App.tsx`.
 *
 * The one rule the whole module turns on: a finding is a statement about a PARTICULAR unit version
 * and a PARTICULAR build. When either has moved on, the finding is out of date and says so.
 */
export function useSupportChecks(host: {
  sceneRef: MutableRefObject<PrintScene>;
  sessionRef: MutableRefObject<EditSession>;
  units: readonly PrintUnit[];
  activeUnitId: string | undefined;
  /** Support Edit Mode, or a dental step that reuses its tools, as `useFixSpot` reads it. */
  editMode: EditMode;
  analysis: () => AnalysisClient;
  /** The denture worker, for the rules that decide a denture leaves a spot bare on purpose. */
  dentureClient: () => DentureClient;
  /**
   * `built` and `failedBuilds` ARE THE ARGUMENT, not a `buildSettled` callback.
   *
   * The re-check effect re-runs when either map changes. A callback recreated on every render would
   * put a value in that effect's dependencies that is never equal twice, so the 600 ms timer would
   * be torn down and rebuilt every render and the re-check could be deferred for as long as the app
   * kept rendering. The maps compare by identity, which is exactly the question being asked.
   */
  built: ReadonlyMap<string, UnitBuild<HeldBuild>>;
  failedBuilds: ReadonlyMap<string, PrintUnit>;
  builtRef: MutableRefObject<ReadonlyMap<string, UnitBuild<HeldBuild>>>;
  /** The units a command acts on: the selection, or the whole plate when nothing is selected. */
  targets: (scene: PrintScene) => readonly PrintUnit[];
  unitName: (unitId: string) => string;
  send: (event: SessionEvent) => void;
  dispatch: (command: SceneCommand) => void;
  /** Frame a spot in the viewport. The seq that makes it a fresh request belongs to the caller. */
  focusSpot: (point: [number, number, number], area: number) => void;
  setStatus: SetStatus;
  setStatusMessage: (message: Message) => void;
}) {
  const {
    sceneRef, sessionRef, units, activeUnitId, editMode, analysis, dentureClient,
    built, failedBuilds, builtRef, targets, unitName, send, dispatch, focusSpot, setStatus, setStatusMessage,
  } = host;

  /** Findings by unit, with the unit version and support build they checked. */
  const [problems, setProblems] = useState<ReadonlyMap<string, UnitProblems>>(new Map());
  const showProblem = useCallback((problem: FixTarget) => {
    const unit = sceneRef.current.units.find((candidate) => candidate.id === problem.unitId);
    if (unit) focusSpot(transformPoint(unit.transform, problem.position), problem.area);
  }, [focusSpot, sceneRef]);

  const { fix: fixProblem, noteAdded, isRechecking, stopRechecking } = useFixSpot({
    sceneRef, sessionRef, units, activeUnitId, editMode, built, problems, send, dispatch, setStatus, setStatusMessage, showProblem,
  });

  /** The unit's build finished, or failed, for the unit as it is now. */
  const buildSettled = (unit: PrintUnit) => built.get(unit.id)?.unit === unit || failedBuilds.get(unit.id) === unit;

  /** A unit left the scene: its findings go with it, or the list would name an object that is gone. */
  const forgetProblems = useCallback((unitId: string) => setProblems((current) => {
    if (!current.has(unitId)) return current;
    const next = new Map(current);
    next.delete(unitId);
    return next;
  }), []);

  /** Running checks by unit id, with the unit version they check (a second caller joins, editing/check). */
  const checksRunning = useRef(new Map<string, { token: object; promise: Promise<SupportProblem[] | undefined> }>());
  /**
   * Checks the units' current contacts; resolves with the spots found outside and inside no-support
   * zones, and how many units' checks did not finish (replaced by a newer check of a changed unit).
   */
  const runCheck = useCallback(async (toCheck: readonly PrintUnit[]): Promise<CheckTally> => {
    const checked = await Promise.all(toCheck.filter((unit) => unit.supports).map(async (unit) => {
      const orientation = orientationOf(unit);
      const key = `check:${unit.id}`;
      // Only a build of the unit as it is now says which contacts it dropped.
      // A RELEASED build is "no current build" here, which this function already has a path for:
      // the island verdict is not known, so the check is never reported clean. That is honest - a
      // released build's islands were judged when it was finished, not now.
      const mesh = builtGeometry(unit, builtRef.current.get(unit.id));
      const found = await joinRun(checksRunning.current, unit.id, runToken(unit, mesh), () => analysis().check(key, checkJobOf(unit, mesh), { key: 'Checking supports on {name}', vars: { name: unitName(unit.id) } }));
      if (!found) return undefined;
      // Spots face down on the plate: plate down in unit-local space keeps a zone on the far side of a thin floor out.
      const down = inverseTransformDirection(orientation, [0, -1, 0]);
      const located = found.map((problem) => {
        const position = inverseTransformPoint(orientation, problem.position);
        return { ...problem, unitId: unit.id, position, inZone: problemInZone(unit.zones, position, down) };
      });
      // A denture follows its own rules: spots they leave unsupported on purpose are listed grey, not as problems.
      const { real: overhangs, accepted } = await splitDentureSpots(dentureClient(), unit, located, { key: 'Checking the denture rules on {name}', vars: { name: unitName(unit.id) } });
      const acceptedRows = accepted.map(({ reason, points }) => ({ kind: 'outside' as const, area: 0, position: points[0]!, points, rule: reason, unitId: unit.id, inZone: false }));
      // Islands are the Rust verdict of the build, already in the unit frame (a vertex of the unit mesh).
      const islands = islandProblems(mesh?.islands, unit.source.positions).map((problem) => ({
        ...problem, unitId: unit.id, inZone: problem.kind === 'island' && problemInZone(unit.zones, problem.position, down),
      }));
      const items = [...islands, ...omittedProblems(unitContacts(unit, undefined), mesh).map((problem) => ({ ...problem, unitId: unit.id, inZone: false })), ...acceptedRows, ...overhangs];
      setProblems((current) => new Map(current).set(unit.id, { unit, mesh, items }));
      // No current build: the island verdict is not known yet, so this check is not complete (never clean);
      // the re-check below runs once the build lands and lists what it finds.
      if (!mesh) return undefined;
      const unjudged = items.filter((problem) => problem.kind === 'unjudged').length;
      // Low points outside the policy's area are informational: never a spot that may print unsupported.
      const outside = items.filter((problem) => problem.kind === 'outside' || problem.kind === 'omitted').length;
      const inZone = items.filter((problem) => problem.inZone).length;
      return { spots: items.length - inZone - unjudged - outside, inZone, unjudged };
    }));
    return tallyChecks(checked);
  }, [analysis, builtRef, dentureClient, unitName]);

  /**
   * The findings listed: those of units and builds unchanged since their check, and, for a unit
   * edited since, its last findings that no support covers yet, marked out of date until its
   * re-check (below) replaces them.
   */
  const { listedProblems, outOfDate } = useMemo(() => {
    let stale = false;
    const listed = units.flatMap((unit) => {
      const entry = problems.get(unit.id);
      if (!entry) return [];
      const mesh = currentBuild(unit, built.get(unit.id));
      if (entry.unit === unit && entry.mesh === mesh) return entry.items;
      // An unjudged verdict, and the outside-policy note, have no spot a support could cover: it stays until the re-check replaces it.
      const open = uncovered(entry.items, unitContacts(unit, mesh), resolveSettings(unit.settings).scatterSpacing, (problem) => problem.kind === 'unjudged' || problem.kind === 'outside' || problem.kind === 'omitted' || isRechecking(problem));
      stale ||= open.length > 0;
      return open;
    });
    return { listedProblems: listed, outOfDate: stale };
  }, [built, isRechecking, problems, units]);

  const recheckTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    const stale = units.filter((unit) => {
      const entry = problems.get(unit.id);
      // Re-checked once the unit's build settles, so the check sees the contacts that build kept.
      // `builtGeometry`, the SAME function the check records with. Comparing against
      // `currentBuild` here compared `undefined` with a truthy released build on every pass.
      return unit.supports && entry && buildSettled(unit) && (entry.unit !== unit || entry.mesh !== builtGeometry(unit, built.get(unit.id)));
    });
    if (stale.length === 0) return;
    window.clearTimeout(recheckTimer.current);
    // A recheck replaced by a newer one says nothing (the newer one runs); a failure or a cancel is
    // said, since the edited unit's findings stay hidden until a check finishes.
    recheckTimer.current = window.setTimeout(() => void runCheck(stale).catch((error: unknown) => {
      stopRechecking();
      if (isAbort(error)) setStatus('Support check cancelled. Supports unchanged.');
      else setStatusMessage(errorStatus('check', codedJobError(error)));
    }), RECHECK_DELAY_MS);
  }, [built, failedBuilds, problems, runCheck, units, setStatus, stopRechecking]);

  /** Check supports now, on the command's targets, and say what came of it on the status line. */
  const checkSupports = useCallback(() => {
    const toCheck = targets(sceneRef.current).filter((unit) => unit.supports);
    if (toCheck.length === 0) return setStatus('Generate supports before checking them.');
    setStatus('Checking supports on 1 object.', { n: toCheck.length }, 'Checking supports on {n} objects.');
    runCheck(toCheck).then(
      (tally) => setStatusMessage(checkStatus(tally)),
      (error: unknown) => (isAbort(error) ? setStatus('Support check cancelled. Supports unchanged.') : setStatusMessage(errorStatus('check', codedJobError(error)))),
    );
  }, [runCheck, sceneRef, setStatus, setStatusMessage, targets]);

  return { problems, listedProblems, outOfDate, runCheck, checkSupports, showProblem, fixProblem, noteAdded, isRechecking, forgetProblems };
}
