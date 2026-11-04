import { t } from '../i18n';
import { hint } from './hint';
import { Icon } from '../ui/Icon';

/** What a dental step offers to put it back the way it began: `can` is false while nothing has changed. */
export interface StepRestore {
  can: boolean;
  run: () => void;
}

/**
 * The step's Restore button: the same quiet secondary button as Step 1's Free transform. It returns the
 * step to the state it had on entry (pose, dial, supports, policy, settings) as one undo step.
 */
export function RestoreStepButton({ restore, unique, round = false }: { restore: StepRestore; unique: string; round?: boolean }) {
  return <button type="button" className={round ? 'restore-step restore-round' : 'orient-free-btn restore-step'} data-ui={unique} disabled={!restore.can} onClick={restore.run}
    {...hint('Put this step back the way it was when you entered it. Undo brings your changes back')}>
    {round ? <><span className="visually-hidden">{t('Restore step')}</span><Icon name="restore" /></> : t('Restore step')}
  </button>;
}
