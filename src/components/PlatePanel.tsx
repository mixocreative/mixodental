import { plural, t } from '../i18n';
import { hint } from './hint';

/**
 * The left panel's layout section: one button that lays every object out so none overlaps.
 *
 * It used to be the BUILD PLATE section — a printer picker, its plate size, and a list of the cases
 * that did not fit. The build plate is retired here (exports are per-object, so the slicer packs the
 * real plate), and with no bounds nothing can fail to fit, so the picker, the size line and the
 * unplaced list all went with it. `src/plate/printerProfiles.ts` and `PlateOutline.tsx` are kept
 * unwired and still tested, as the seam for reviving plate packing.
 */
export function PlatePanel({ cases, locked, onArrange }: {
  cases: number;
  locked: boolean;
  onArrange: () => void;
}) {
  return <section className="plate-panel" data-ui="plate-panel" {...(locked ? { inert: '' } : {})}>
    <h3>{t('Layout')}</h3>
    <p className="plate-cases" data-ui="plate-cases">{plural(cases, '{n} object', '{n} objects')}</p>
    <button type="button" className="plate-arrange" data-ui="plate-arrange" disabled={cases === 0} onClick={onArrange}
      {...hint('Move the objects so none overlaps another. Only positions change; supports stay editable')}>{t('Arrange objects')}</button>
  </section>;
}
