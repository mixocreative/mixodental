import type { ReactNode } from 'react';

/**
 * One control with its label: the standard row of a panel. It holds whatever the control is - a text or number
 * input, a slider, a checkbox, a segmented switch, a dropdown, or a value with nothing to change (`readOnly`).
 *
 * Two layouts, and both are responsive:
 * - `row` (the default): the label on the left, the control on the right, on one line.
 * - `stack`: the label on top, the control under it. For a control that needs the width (a slider, a long
 *   segmented switch) or a label too long to sit beside one.
 *
 * A `row` field falls back to `stack` by itself when the panel around it is narrow (a container query on
 * `.panel-widget`), so the layout does not have to be chosen for a particular panel width.
 *
 * Names: the field is `data-ui={ui}`, its label `{ui}-label`, its control `{ui}-control`.
 */
export function Field({ label, ui, layout = 'row', readOnly = false, children }: {
  /** The label words, already translated. */
  label: string;
  /** The field's stable name, e.g. `lift-height`. */
  ui: string;
  layout?: 'row' | 'stack';
  /**
   * The field shows a value and takes none. It is then a plain row, not a `<label>`: a label that reaches no
   * control would send a click nowhere and read as interactive to a screen reader.
   */
  readOnly?: boolean;
  children: ReactNode;
}) {
  const className = `field field--${layout}${readOnly ? ' field--read-only' : ''}`;
  const inside = <>
    <span className="field-label" data-ui={`${ui}-label`}>{label}</span>
    <span className="field-control" data-ui={`${ui}-control`}>{children}</span>
  </>;
  return readOnly
    ? <div className={className} data-ui={ui}>{inside}</div>
    : <label className={className} data-ui={ui}>{inside}</label>;
}
