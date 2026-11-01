import { t } from '../../i18n';
import { hint } from '../../components/hint';
import { RangeField } from '../../components/RangeField';
import { CLEARANCE_FLOOR_LIMITS, type DentureOptions, type ModelLandingDefault } from './dentureOptions';

const LANDING_LABELS: Record<ModelLandingDefault, string> = {
  off: 'Off (only points you click)',
  lows: 'Lowest points and islands',
  any: 'Any left-out tip',
};

/**
 * The denture settings block of Step 2 (Round C): "Allow support from model surface" (off / lowest points and islands /
 * any left-out tip), the switch that lets low tips stand outside the allowed area, and the last-resort clearance floor
 * (mm). Inputs: `options`, the unit's settings; `onChange` gets the whole new set (one undo step each change).
 */
export function DentureSettingsSection({ options, onChange }: { options: Readonly<DentureOptions>; onChange: (options: DentureOptions) => void }) {
  return <section className="dental-block denture-settings" data-ui="denture-settings" aria-label={t('Denture settings')}>
    <h3>{t('Denture settings')}</h3>
    <label className="field-row denture-landing" data-ui="denture-model-landing" {...hint('Where the build may support a tip from the model surface when the plate cannot reach it')}>
      <span>{t('Allow support from model surface')}</span>
      <select className="denture-landing-select" data-ui="denture-model-landing-select" value={options.modelLanding}
        onChange={(event) => onChange({ ...options, modelLanding: event.target.value as ModelLandingDefault })}>
        {(Object.keys(LANDING_LABELS) as ModelLandingDefault[]).map((value) => <option key={value} value={value}>{t(LANDING_LABELS[value])}</option>)}
      </select>
    </label>
    <label className="check denture-low-outside" data-ui="denture-low-outside" {...hint('Off: lowest points and islands get tips only inside the allowed area or near the rim')}>
      <input type="checkbox" checked={options.lowOutsideAllowed} onChange={(event) => onChange({ ...options, lowOutsideAllowed: event.target.checked })} />
      {t('Low tips outside the allowed area')}
    </label>
    <div data-ui="denture-clearance-floor">
      <RangeField layout="stack" label="Last-resort clearance" unit="{n} mm" hint="The smallest gap a support keeps from the model when nothing else routes"
        min={CLEARANCE_FLOOR_LIMITS.min} max={CLEARANCE_FLOOR_LIMITS.max} step={CLEARANCE_FLOOR_LIMITS.step} value={options.lastResortClearanceMm}
        onChange={(value) => onChange({ ...options, lastResortClearanceMm: value })} />
    </div>
  </section>;
}
