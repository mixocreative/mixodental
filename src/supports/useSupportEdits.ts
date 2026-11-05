import { useCallback } from 'react';
import { planAddTip } from '@mixo-geocore/editing/addTip';
import { contactToRemove } from '@mixo-geocore/editing/removal';
import { selectsTips, type EditSession, type SessionEvent } from '@mixo-geocore/editing/session';
import { missStatus } from '@mixo-geocore/editing/status';
import { profileData } from '@mixo-geocore/host/dental/alignerProfiles';
import { inverseTransformDirection, inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { resolveSettings, withRekeyedHandWork } from '@mixo-geocore/host/supports/unitSupports';
import type { SupportPoint } from '@mixo-geocore/host/core/analysis/types';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { SupportContact } from '@mixo-geocore/host/core/supports/mesh';
import type { DentalTipPreview } from '../components/useDentalPreview';
import type { Message } from '../i18n';
import type { PrintScene, PrintUnit, SceneCommand } from '../state/project';
import { deleteCommands } from './selection';

/*
 * WHAT A POINTER DOES TO SUPPORTS: add one, remove one, pick one.
 *
 * These were nine callbacks in `App.tsx`, which is where every wire in the app already meets. They are
 * one subject - a click or a right-click on the model or on a support body - so they are one module,
 * and App keeps a call site.
 *
 * The dependency list below is long and deliberately explicit. It is the honest cost of this group:
 * adding a tip needs the area preview and the added-marker, removing one needs the contact list and
 * the status line. Passing them in names the coupling that was previously invisible, which is the
 * point of the move - a shorter list would mean a context or a store, and that is a different and
 * larger decision than this one.
 */
export interface SupportEditDeps {
  /** Live refs, not state: a pointer handler must read what is true NOW, not what it closed over. */
  session: { readonly current: EditSession };
  scene: { readonly current: PrintScene };
  /** The detected area and its tip preview, for the snapping that Step 2's Add does. */
  area: { readonly current: { inArea: boolean; dentalPreview: DentalTipPreview | undefined } };
  dispatch: (command: SceneCommand, edit?: string) => void;
  send: (event: SessionEvent) => void;
  setStatus: (key: string, vars?: Message['vars'], other?: string) => void;
  setStatusMessage: (message: Message) => void;
  /** Every contact of a unit that a click could hit, automatic and manual. */
  contactsOf: (unit: PrintUnit) => readonly SupportContact[];
  /** Flashes a ring at a support just added. */
  setAdded: (next: (current: { seq: number } | undefined) => { unitId: string; point: Vector; normal: Vector; seq: number }) => void;
  /** True when the add answered an outstanding "fix this spot", which says its own thing. */
  noteAdded: (unitId: string, position: Vector) => boolean;
}

export function useSupportEdits(deps: SupportEditDeps) {
  const { session, scene, area, dispatch, send, setStatus, setStatusMessage, contactsOf, setAdded, noteAdded } = deps;
  const unitOf = (unitId: string) => scene.current.units.find((candidate) => candidate.id === unitId);

  /**
   * Step 2's Add: the tip snaps to a suggested one within Click reach, and that candidate is hidden in
   * the same command so the operator never ends up with two tips a hair apart.
   */
  const addTip = useCallback((unit: PrintUnit, point: Vector, normal: Vector) => {
    const preview = area.current.dentalPreview;
    if (!preview || preview.unitId !== unit.id) return setStatus('Finding safe support tips…');
    const local = inverseTransformPoint(unit.transform, point);
    const reach = resolveSettings(unit.settings).eraseRadius;
    const gone = new Set(withRekeyedHandWork(unit, preview.localPoints).deleted);
    // The shared add-tip snapping (mixo-geocore editing/addTip); a spot under the profile's smallest angle from up is flagged.
    const plan = planAddTip({
      point: local, normal: inverseTransformDirection(unit.transform, normal), worldNormal: normal, reach,
      candidates: [...preview.localPoints, ...preview.localSuggested], removed: gone,
      overhangAngleDeg: unit.dental ? profileData(unit.dental.profileId).defaults.overhangAngleDeg : 180,
      createId: () => `manual-${crypto.randomUUID()}`,
    });
    dispatch({ type: 'batch', commands: [{ type: 'manual/add', unitId: unit.id, point: plan.contact }, ...(plan.removeId ? [{ type: 'deletion/add' as const, unitId: unit.id, pointIds: [plan.removeId] }] : [])] });
    setStatus(plan.status === 'faces-up' ? 'This spot faces up, so a tip here may not hold.' : 'Support added.');
  }, [area, dispatch, setStatus]);

  const onAddContact = useCallback((unitId: string, point: Vector, normal: Vector) => {
    if (session.current.mode === 'zones') return; // supports take no edits while painting zones
    const unit = unitOf(unitId);
    if (!unit) return;
    if (session.current.mode === 'dental' && session.current.dentalStage === 'area') return addTip(unit, point, normal);
    const contact: SupportPoint = {
      id: `manual-${crypto.randomUUID()}`,
      regionId: -1,
      position: inverseTransformPoint(unit.transform, point),
      normal: inverseTransformDirection(unit.transform, normal),
      source: 'interior',
    };
    const commands: SceneCommand[] = unit.supports ? [] : [{
      type: 'supports/set', unitId, supports: { kind: 'live', data: { transform: { position: [...unit.transform.position], rotation: [...unit.transform.rotation] } } },
    }];
    dispatch({ type: 'batch', commands: [...commands, { type: 'manual/add', unitId, point: contact }] });
    setAdded((current) => ({ unitId, point: contact.position, normal: contact.normal, seq: (current?.seq ?? 0) + 1 }));
    if (!noteAdded(unitId, contact.position)) setStatus(normal[1] > 0 ? 'Support added on a top face: it grows from below.' : 'Support added.');
  }, [addTip, dispatch, noteAdded, scene, session, setAdded, setStatus]);

  // A removal is exact: the manual support itself, or the automatic contact's id. Click reach only decides which support a click on the model hits.
  const removeOne = useCallback((unit: PrintUnit, contactId: string) => {
    dispatch({ type: 'batch', commands: deleteCommands(unit, [contactId]) });
    setStatus('Removed 1 support; removals persist through regeneration.', { n: 1 }, 'Removed {n} supports; removals persist through regeneration.');
  }, [dispatch, setStatus]);

  const eraseNear = useCallback((unit: PrintUnit, local: Vector) => {
    const radius = resolveSettings(unit.settings).eraseRadius;
    const hit = contactToRemove(contactsOf(unit), local, radius);
    if (!hit) return setStatus('No support here: right-click a support, or the model within {radius} mm of one.', { radius });
    removeOne(unit, hit.id);
  }, [contactsOf, removeOne, setStatus]);

  const onRemoveContact = useCallback((unitId: string, contactId: string) => {
    if (session.current.mode === 'zones') return;
    const unit = unitOf(unitId);
    if (unit && contactsOf(unit).some((candidate) => candidate.id === contactId)) removeOne(unit, contactId);
  }, [contactsOf, removeOne, scene, session]);

  const onEditMiss = useCallback(() => {
    const message = missStatus(session.current);
    if (message) setStatusMessage(message);
  }, [session, setStatusMessage]);

  /** Step 2, Select → Click: the tip nearest the click within Click reach is picked (or unpicked). */
  const onPickTip = useCallback((unitId: string, point: Vector) => {
    const unit = unitOf(unitId);
    if (!selectsTips(session.current) || !unit || unit.id !== scene.current.activeUnitId) return;
    const local = inverseTransformPoint(unit.transform, point);
    const hit = contactToRemove(contactsOf(unit), local, resolveSettings(unit.settings).eraseRadius);
    if (!hit) return onEditMiss();
    send({ type: 'toggleContact', id: hit.id });
  }, [contactsOf, onEditMiss, scene, send, session]);

  const onErase = useCallback((unitId: string, point: Vector) => {
    if (session.current.mode === 'zones') return;
    const unit = unitOf(unitId);
    if (unit) eraseNear(unit, inverseTransformPoint(unit.transform, point));
  }, [eraseNear, scene, session]);

  const onToggleContact = useCallback((unitId: string, contactId: string) => {
    if (!selectsTips(session.current) || unitId !== scene.current.activeUnitId) return;
    const unit = unitOf(unitId);
    // A support deleted a moment ago can still be under the cursor until the mesh rebuilds.
    if (!unit || !contactsOf(unit).some((contact) => contact.id === contactId)) return;
    send({ type: 'toggleContact', id: contactId });
  }, [contactsOf, scene, send, session]);

  // `addTip` is not returned: Step 2's Add reaches it through `onAddContact`, which is the only caller
  // and the only thing that knows the stage. Exporting it would invite a second way in.
  return { onAddContact, onRemoveContact, onEditMiss, onPickTip, onErase, onToggleContact };
}
