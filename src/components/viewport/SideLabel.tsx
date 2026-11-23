import { t } from '../../i18n';
import { SIDE_WORDS, isAcross, type SideName } from '../../dental/sideAnchors';

/**
 * One named side of a denture on Step 1 (WORKBENCH-TABS-PLAN C2; owner 2026-11-23: choosing a side "is clueless to
 * human not seeing"). Plain DOM with no renderer in it, so the three.js view (drei `<Html>`) and the Babylon view
 * (`AnchoredDom`) mount the identical element - one label, not two that resemble each other.
 */
export function SideLabel({ name }: { name: SideName }) {
  const title = isAcross(name) ? t('As seen from the front side, with the teeth side up.') : t('The sides as this scan was oriented. Flip front or Flip teeth side turns them round.');
  return <span className="side-label" data-ui={`side-label-${name.toLowerCase().replace(/\s+/g, '-')}`} title={title}>{t(SIDE_WORDS[name])}</span>;
}
