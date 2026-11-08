// Copyright (c) Mixo Creative.

import { useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { SupportMeshClient } from '@mixo-geocore/host/workers/meshClient';
import type { JobLabel } from '@mixo-geocore/host/workers/jobActivity';
import { supportJobOf, unitSupportMesh, type UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import { errorStatus } from '@mixo-geocore/editing/errors';
import { codedJobError } from '../workers/jobErrors';
import { isAbort } from './appShared';
import { keptBuild } from '../denture/steps/supports/rigidMove';
import type { HeldBuild } from '../plate/releasedBuild';
import type { PrintUnit } from '../state/project';
import type { Message } from '../i18n';

/**
 * WHEN A UNIT'S SUPPORTS GET REBUILT: the debounce, the builds worth keeping, and the pruning of
 * work for a unit that has left the scene.
 *
 * WHY THIS TAKES THE SETTERS INSTEAD OF OWNING `built` AND `failedBuilds`. The maps are a hub, not
 * this job's private state: `App.tsx` reads them in some thirty places and three other hooks take
 * them as input. A hook that owned them would have to hand nearly all of that straight back out, and
 * a module earns its place by handing back LESS than it was given. So the maps stay where their
 * readers are and the MECHANISM lives here - which is the part with rules in it, and the part that
 * was impossible to read inside a 1400-line component.
 *
 * THE ONE INVARIANT EVERYTHING ELSE HANGS OFF: `requested` is the record of what this hook has asked
 * for, keyed by unit id and holding the exact unit OBJECT. Every late arrival - a worker result, an
 * error, a fired timer - checks `requested.current.get(id)?.unit !== unit` and drops itself if the
 * scene has moved on. Without that test a slow build would overwrite a newer one, which is the bug
 * this shape exists to prevent.
 */
interface Host {
  /** The scene's units, in plate order: the index is part of the support job. */
  units: readonly PrintUnit[];
  /** The builds as they stand, read inside timers and promises where state would be stale. */
  builtRef: MutableRefObject<ReadonlyMap<string, UnitBuild<HeldBuild>>>;
  setBuilt: Dispatch<SetStateAction<ReadonlyMap<string, UnitBuild<HeldBuild>>>>;
  setFailedBuilds: Dispatch<SetStateAction<ReadonlyMap<string, PrintUnit>>>;
  /** The preview worker, made on first use. */
  preview: () => SupportMeshClient;
  /** A denture builds with its own policy in its own worker (`src/denture`). */
  dentureBuild: (unit: PrintUnit, label: JobLabel) => Promise<HeldBuild | undefined>;
  unitName: (unitId: string) => string;
  /** A unit has left the scene: free what the OTHER subsystems hold for it. This hook frees its own. */
  forgetUnit: (unitId: string) => void;
  setStatusMessage: (message: Message) => void;
}

/**
 * How long an edit settles before a build is asked for. Short enough to feel immediate, long enough
 * that dragging a slider does not queue a build per frame.
 */
const BUILD_DELAY_MS = 120;

export function useSupportBuilds({
  units, builtRef, setBuilt, setFailedBuilds, preview, dentureBuild, unitName, forgetUnit, setStatusMessage,
}: Host): void {
  /** What has been asked for, per unit: the exact unit object and its plate index. */
  const requested = useRef(new Map<string, { unit: PrintUnit; index: number }>());
  /** The settling timers, per unit, so a fresh edit replaces the pending build rather than adding one. */
  const buildTimers = useRef(new Map<string, number>());

  useEffect(() => {
    const ids = new Set(units.map((unit) => unit.id));
    for (const id of [...requested.current.keys()]) {
      if (ids.has(id)) continue;
      requested.current.delete(id);
      // The timer is cleared HERE, where the timers live. It used to be the first two lines of
      // `App.tsx`'s `forgetUnit`, which had to reach into this hook's business to do it; `forgetUnit`
      // has exactly one caller - this loop - so moving it in removed a dependency rather than hiding one.
      window.clearTimeout(buildTimers.current.get(id));
      buildTimers.current.delete(id);
      forgetUnit(id);
    }
    setBuilt((current) => {
      const kept = new Map([...current].filter(([id]) => ids.has(id)));
      return kept.size === current.size ? current : kept;
    });
    setFailedBuilds((current) => {
      const kept = new Map([...current].filter(([id]) => ids.has(id)));
      return kept.size === current.size ? current : kept;
    });
    units.forEach((unit, index) => {
      const previous = requested.current.get(unit.id);
      // Nothing changed for this unit, so nothing is asked for. This test is also what makes the
      // effect's other dependencies harmless: when one of them changes identity, this pass is a no-op.
      if (previous && previous.unit === unit && previous.index === index) return;
      requested.current.set(unit.id, { unit, index });
      window.clearTimeout(buildTimers.current.get(unit.id));
      // A denture only slid over the plate (OK's arrangement) keeps its build: it is unit-local and the job is unchanged.
      const kept = unit.denture && index === previous?.index ? keptBuild(previous?.unit, unit, builtRef.current.get(unit.id)) : undefined;
      if (kept) {
        setBuilt((current) => new Map(current).set(unit.id, kept));
        return;
      }
      // No supports asked for: the unit still needs an entry, so its counts read as settled at zero
      // rather than for ever building.
      if (unit.supports === undefined) {
        const empty = unitSupportMesh(unit, index);
        setBuilt((current) => new Map(current).set(unit.id, { unit, mesh: empty }));
        return;
      }
      buildTimers.current.set(unit.id, window.setTimeout(() => {
        buildTimers.current.delete(unit.id);
        if (requested.current.get(unit.id)?.unit !== unit) return;
        const label = { key: 'Building supports for {name}', vars: { name: unitName(unit.id) } };
        (unit.denture ? dentureBuild(unit, label) : preview().build(unit.id, supportJobOf(unit, index, 'preview'), label)).then((mesh) => {
          if (!mesh || requested.current.get(unit.id)?.unit !== unit) return;
          setBuilt((current) => new Map(current).set(unit.id, { unit, mesh }));
        }, (error: unknown) => {
          // A build of a version the scene no longer holds says nothing: its unit changed or left, a newer build follows.
          if (requested.current.get(unit.id)?.unit !== unit) return;
          setStatusMessage(isAbort(error) ? { key: 'Support build of {name} cancelled. Change a setting to build it again.', vars: { name: unit.name } } : errorStatus('build', codedJobError(error), { name: unit.name }));
          setFailedBuilds((current) => new Map(current).set(unit.id, unit));
        });
      }, BUILD_DELAY_MS));
    });
    // `setStatusMessage` is listed because the body uses it. `App.tsx` listed `setStatus`, which this
    // code has never called - a stale entry, harmless only because both setters are stable.
  }, [units, forgetUnit, preview, dentureBuild, unitName, setBuilt, setFailedBuilds, setStatusMessage]);
}
