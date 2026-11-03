import { t } from '../../i18n';
import { Field } from '../../components/Field';
import { Panel } from '../../components/Panel';
import { RangeField } from '../../components/RangeField';
import { CLEARANCE_FLOOR_LIMITS, type DentureOptions, type ModelLandingDefault } from './dentureOptions';

const LANDING_LABELS: Record<ModelLandingDefault, string> = {
  off: 'Off (only points you click)',
  lows: 'Lowest points and islands',
  any: 'Any left-out tip',
};

/**
 * The denture settings block of Step 2 (Round C), under Adjust (P7c): "Supports may touch the denture" (off / lowest points and islands /
 * any left-out tip), the switch that lets low tips stand outside the allowed area, and the last-resort clearance floor
 * (mm). Inputs: `options`, the unit's settings; `onChange` gets the whole new set (one undo step each change).
 */
export function DentureSettingsSection({ options, onChange }: { options: Readonly<DentureOptions>; onChange: (options: DentureOptions) => void }) {
  return <Panel title={t('Denture settings')} ui="denture-settings">
    <Field label={t('Supports may touch the denture')} ui="denture-model-landing" layout="stack"
      hint={t('Where the build may support a tip from the model surface when the plate cannot reach it')}>
      <select className="denture-landing-select" data-ui="denture-model-landing-select" value={options.modelLanding}
        onChange={(event) => onChange({ ...options, modelLanding: event.target.value as ModelLandingDefault })}>
        {(Object.keys(LANDING_LABELS) as ModelLandingDefault[]).map((value) => <option key={value} value={value}>{t(LANDING_LABELS[value])}</option>)}
      </select>
    </Field>
    <Field label={t('Low tips outside the allowed area')} ui="denture-low-outside"
      hint={t('Off: lowest points and islands get tips only inside the allowed area or near the rim')}>
      <input type="checkbox" checked={options.lowOutsideAllowed} onChange={(event) => onChange({ ...options, lowOutsideAllowed: event.target.checked })} />
    </Field>
    <RangeField layout="stack" label="Last-resort clearance" ui="denture-clearance-floor" unit="{n} mm" hint="The smallest gap a support keeps from the model when nothing else routes"
      min={CLEARANCE_FLOOR_LIMITS.min} max={CLEARANCE_FLOOR_LIMITS.max} step={CLEARANCE_FLOOR_LIMITS.step} value={options.lastResortClearanceMm}
      onChange={(value) => onChange({ ...options, lastResortClearanceMm: value })} />
  </Panel>;
}
