import type { TipPathState } from '@mixo-geocore/host/dental/dentureTilt';
import { t } from '../../../i18n';

/**
 * The live angle step's legend under the dial (Round C): how many tips of the shown tilt have a path to the plate
 * at full clearance, only at the fallback clearance, or none, each beside its colour swatch (CSS tokens
 * `--tip-path`, `--tip-fallback`, `--tip-none`). Input: `counts`, tips per path state; absent while the engine works.
 */
export function LiveTipSummary({ counts }: { counts: Record<TipPathState, number> | undefined }) {
  if (!counts) return <p className="edit-note live-tips" data-ui="denture-live-tips" role="status">{t('Checking support paths…')}</p>;
  return <ul className="live-tips" data-ui="denture-live-tips" aria-label={t('Support paths at this angle')}>
    <li data-ui="denture-live-tips-path"><span className="tip-swatch tip-swatch--path" aria-hidden="true" />{t('{n} with a path', { n: counts.path })}</li>
    <li data-ui="denture-live-tips-fallback"><span className="tip-swatch tip-swatch--fallback" aria-hidden="true" />{t('{n} fallback only', { n: counts.fallback })}</li>
    <li data-ui="denture-live-tips-none"><span className="tip-swatch tip-swatch--none" aria-hidden="true" />{t('{n} without a path', { n: counts.none })}</li>
  </ul>;
}
