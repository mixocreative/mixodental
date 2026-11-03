import { StartChoice } from '../../../components/StartChoice';
import { t } from '../../../i18n';

/**
 * The denture choice on the start screen (Round D): the middle of the three big choices. It is a `StartChoice`
 * like the other two, so all three keep one shape and one art size; the denture module keeps its own entry point
 * here, so the whole denture flow can still be lifted out in one piece. Input: `onChoose`, called with no
 * arguments; the caller starts the denture job on the reference profile.
 */
export function DentureChoice({ onChoose }: { onChoose: () => void }) {
  return <StartChoice icon="denture" label={t('Denture supports')} ui="start-denture" onChoose={onChoose} />;
}
