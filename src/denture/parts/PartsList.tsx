import { plural, t } from '../../i18n';
import type { DentureParts } from '../engine/dentureCore';
import { ROLE_LABEL, orderedParts, roleCounts, showsPartsList } from './partRoles';

/**
 * The parts list of a multi-part denture file (Step 2): one row per part, target first, with its role, size and tips.
 * Add-ons are tinted on the model (the swatch matches, token `--part-addon`); debris gets no supports. Renders nothing
 * for a one-part file. Input: `parts`, the engine's part report of the current build.
 */
export function PartsList({ parts }: { parts: DentureParts | undefined }) {
  if (!showsPartsList(parts)) return null;
  const counts = roleCounts(parts.parts);
  return <section className="dental-block denture-parts" data-ui="denture-parts" aria-label={t('Parts')}>
    <h3>{t('Parts')}</h3>
    <p className="help" data-ui="denture-parts-summary">{t('{target} target, {addOn} add-on, {debris} debris', { target: counts.target, addOn: counts.addOn, debris: counts.debris })}</p>
    <ul className="denture-parts-list" data-ui="denture-parts-list">
      {orderedParts(parts.parts).map((part) => <li key={part.id} className="denture-part" data-ui="denture-part-row" data-role={part.role}>
        <span className={`part-swatch part-swatch--${part.role}`} aria-hidden="true" />
        <span className="denture-part-role">{t(ROLE_LABEL[part.role])}</span>
        <span className="denture-part-size">{t('{v} mm³', { v: part.volumeMm3.toFixed(part.volumeMm3 < 10 ? 1 : 0) })}</span>
        <span className="denture-part-tips">{part.role === 'debris' ? t('no supports') : plural(part.tips, '1 tip', '{n} tips')}</span>
      </li>)}
    </ul>
  </section>;
}
