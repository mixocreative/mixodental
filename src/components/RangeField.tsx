import { t } from '../i18n';
import { hint } from './hint';
import { Field } from './Field';

/**
 * A slider with its value: a `Field`, so it is the same row as every other control in the app. `row` puts the
 * label beside the slider (zones Brush size), `stack` above it (Circle size, under its tool button); either way
 * the value stays beside the track, where it is read while the slider moves.
 *
 * `label`, `unit` and `hint` are i18n keys, `unit` shows the value as {n}; `ui` is the field's stable name.
 * `onAdjust` hears the slider being held or moved (true) and let go (false).
 */
export function RangeField({ layout, label, ui, unit, hint: hintKey, value, min, max, step, onChange, onAdjust, band, display }: {
  layout: 'row' | 'stack';
  label: string;
  /** The field's stable name, e.g. `aligner-tip-size`. */
  ui: string;
  unit: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onAdjust?: (adjusting: boolean) => void;
  /** A highlighted run of the track, `[from, to]` in slider values (the print angle's stable band). */
  band?: readonly [number, number] | undefined;
  /** The value as shown (default: the value itself). */
  display?: string | number;
}) {
  const slider = <input
    type="range" min={min} max={max} step={step} value={value}
    onChange={(event) => { onChange(Number(event.target.value)); onAdjust?.(true); }}
    onPointerDown={() => onAdjust?.(true)}
    onPointerUp={() => onAdjust?.(false)}
    onKeyUp={() => onAdjust?.(false)}
    onBlur={() => onAdjust?.(false)}
    {...hint(hintKey)}
  />;
  const span = max - min;
  const track = band && span > 0
    ? <span className="range-track">
      <span className="range-band" aria-hidden="true" style={{ left: `${((band[0] - min) / span) * 100}%`, width: `${((band[1] - band[0]) / span) * 100}%` }} />
      {slider}
    </span>
    : slider;
  return <Field label={t(label)} ui={ui} layout={layout} hint={t(hintKey)}>
    {track}
    <output>{t(unit, { n: display ?? value })}</output>
  </Field>;
}
