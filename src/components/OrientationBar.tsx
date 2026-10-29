import { resolve, type CommandId, type UiState } from '@mixo-geocore/editing/commands';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import { profileById, profilesWithoutOpening } from '@mixo-geocore/host/dental/alignerProfiles';
import { t, type Lang } from '../i18n';
import type { DentalNotice } from '../dental/editingMode';
import { CommandButton } from './CommandButton';
import { PrintAngleField, noticeText } from './DentalSteps';
import { Icon } from '../ui/Icon';
import type { DentalTiltState } from './useDentalFlow';

/**
 * Step 1's Free transform controls, as DentalBar passes them (PD.11 S6). `on`: the rotation-only
 * gizmo shows and only Auto orient and Back | Next remain; `asking`: the confirm prompt is open;
 * `autoOrient` restores the stored automatic pose and leaves Free transform.
 */
export interface DentalFreeControls {
  on: boolean;
  asking: boolean;
  ask: () => void;
  confirm: () => void;
  cancel: () => void;
  autoOrient: () => void;
}

/**
 * Step 1's edit bar once the aligner is oriented (PD.11): a narrow column, top to bottom: Auto
 * orientation, the print-angle range and dial, Free transform, the notices with their type-mismatch
 * choice, and Back | Next as one full-width row. Exit lives in the nav bar. `tilt` and `onTilt` are
 * the live print-angle search and its turn-the-model callback. `free` is absent outside Free transform.
 */
export function OrientationBar({ notices, profile, lang, ui, send, run, tilt, onTilt, free }: {
  notices: readonly DentalNotice[];
  profile: string | undefined;
  lang: Lang;
  ui: UiState;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
  tilt?: DentalTiltState | undefined;
  onTilt?: (index: number) => void;
  free?: DentalFreeControls;
}) {
  const current = profileById(profile);
  const alternatives = profilesWithoutOpening();
  const freeOn = free?.on === true;
  const asking = free?.asking === true;
  // Auto orient in Free transform restores the stored automatic pose; otherwise it is the command.
  const autoRun = freeOn && free ? () => free.autoOrient() : run;
  return <div className="edit-bar edit-bar--orient">
    {asking ? null : <div className="orient-row">
      <CommandButton command={resolve('dental.useDetected', ui)} run={autoRun} className="orient-auto"><Icon name="orient" /></CommandButton>
    </div>}
    {asking && free ? <div className="orient-confirm" role="alertdialog" aria-label={t('Free transform')}>
      <p>{t('You will orient it yourself. Continue?')}</p>
      <div className="orient-row">
        <button type="button" onClick={() => free.cancel()}>{t('Cancel')}</button>
        <button type="button" className="primary" onClick={() => free.confirm()}>{t('Continue')}</button>
      </div>
    </div> : null}
    {freeOn || asking ? null : <>
      {tilt && profile ? <div className="orient-row">
        <PrintAngleField tilt={tilt} profile={profile} onChoose={(index) => onTilt?.(index)} />
      </div> : null}
      <div className="orient-row orient-free">
        <button type="button" className="orient-free-btn" onClick={() => free?.ask()}>{t('Free transform')}</button>
      </div>
    </>}
    {freeOn ? null : notices.map((notice) => <div key={notice.kind} className="dental-notice">
      <p className="edit-note" role="alert">{noticeText(notice)}</p>
      {notice.kind === 'mismatch' ? <div className="edit-row">
        {alternatives.map((entry) => <button key={entry.id} type="button" onClick={() => send({ type: 'switchDentalProfile', id: entry.id })}>{t('Switch to {name}', { name: entry.name[lang] })}</button>)}
        <button type="button" onClick={() => send({ type: 'dismissDentalNotice', kind: 'mismatch' })}>{t('Keep {name}', { name: current ? current.name[lang] : '' })}</button>
      </div> : null}
    </div>)}
    <div className="orient-row orient-nav">
      <CommandButton command={resolve('dental.back', ui)} run={run} />
      <CommandButton command={resolve('dental.next', ui)} run={run} />
    </div>
  </div>;
}
