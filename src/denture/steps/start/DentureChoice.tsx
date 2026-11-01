import { t } from '../../../i18n';

/**
 * The start screen's denture card (Round D): one large button beside "Aligner supports". Input:
 * `onChoose`, called with no arguments; the caller starts the denture job on the reference profile.
 */
export function DentureChoice({ onChoose }: { onChoose: () => void }) {
  return <button type="button" className="start-big start-denture" data-ui="start-denture" onClick={onChoose}>{t('Denture supports')}</button>;
}
