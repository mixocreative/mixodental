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
 * Step 1's edit bar once the aligner is oriented (PD.11): a narrow column, top to bottom: Auto
 * orientation, the print-angle range and dial, Free transform (slot, filled later), the notices with
 * their type-mismatch choice, and Back | Next as one full-width row. Exit lives in the nav bar.
 * `tilt` and `onTilt` are the live print-angle search and its turn-the-model callback.
 */
export function OrientationBar({ notices, profile, lang, ui, send, run, tilt, onTilt }: {
  notices: readonly DentalNotice[];
  profile: string | undefined;
  lang: Lang;
  ui: UiState;
  send: (event: SessionEvent) => void;
  run: (id: CommandId) => void;
  tilt?: DentalTiltState | undefined;
  onTilt?: (index: number) => void;
}) {
  const current = profileById(profile);
  const alternatives = profilesWithoutOpening();
  return <div className="edit-bar edit-bar--orient">
    <div className="orient-row">
      <CommandButton command={resolve('dental.useDetected', ui)} run={run} className="orient-auto"><Icon name="orient" /></CommandButton>
    </div>
    {tilt && profile ? <div className="orient-row">
      <PrintAngleField tilt={tilt} profile={profile} onChoose={(index) => onTilt?.(index)} />
    </div> : null}
    <div className="orient-row orient-free" />
    {notices.map((notice) => <div key={notice.kind} className="dental-notice">
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
