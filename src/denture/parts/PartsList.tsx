import { plural, t } from '../../i18n';
import { Panel } from '../../components/Panel';
import type { DentureParts } from '../engine/dentureCore';
import { ROLE_LABEL, orderedParts, roleCounts, showsPartsList } from './partRoles';

/**
 * The parts list of a multi-part dental file: one row per part, target first, with its role, size and tips. A denture shows it
 * in its supports step, an aligner in Step 2 (`kind`, which also names the elements: `denture-parts`, `aligner-parts`...).
 * Add-ons and fused parts are tinted on the model (the swatch matches, token `--part-addon`); debris gets no supports. Renders
 * nothing for a one-part file. Input: `parts`, the engine's part report of the current build or placement.
 */
export function PartsList({ parts, kind = 'denture' }: { parts: DentureParts | undefined; kind?: 'denture' | 'aligner' }) {
  if (!showsPartsList(parts)) return null;
  const counts = roleCounts(parts.parts);
  const summary = counts.fused > 0
    ? t('{target} target, {fused} fused, {addOn} add-on, {debris} debris', { target: counts.target, fused: counts.fused, addOn: counts.addOn, debris: counts.debris })
    : t('{target} target, {addOn} add-on, {debris} debris', { target: counts.target, addOn: counts.addOn, debris: counts.debris });
  return <Panel title={t('Parts')} ui={`${kind}-parts`}>
    <p className="help" data-ui={`${kind}-parts-summary`}>{summary}</p>
    {counts.fused > 0 && <p className="help" data-ui={`${kind}-parts-fused-note`}>{t('A fused part overlaps the target and prints with it: only its exposed overhangs get supports.')}</p>}
    <ul className="denture-parts-list" data-ui={`${kind}-parts-list`}>
      {orderedParts(parts.parts).map((part) => <li key={part.id} className="denture-part" data-ui={`${kind}-part-row`} data-role={part.role}>
        <span className={`part-swatch part-swatch--${part.role}`} aria-hidden="true" />
        <span className="denture-part-role">{t(ROLE_LABEL[part.role])}</span>
        <span className="denture-part-size">{t('{v} mm³', { v: part.volumeMm3.toFixed(part.volumeMm3 < 10 ? 1 : 0) })}</span>
        <span className="denture-part-tips">{part.role === 'debris' ? t('no supports') : plural(part.tips, '1 tip', '{n} tips')}</span>
      </li>)}
    </ul>
  </Panel>;
}
