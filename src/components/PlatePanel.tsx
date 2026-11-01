import { plural, t } from '../i18n';
import { plateSizeText, PRINTERS, type PrinterProfile } from '../plate/printerProfiles';
import { hint } from './hint';

/**
 * The left panel's plate section (Round C): the printer (its build plate, from src/config/printers.json),
 * "Arrange plate" (every case packed by its support outline, at least the plate gap apart) and the cases
 * that do not fit, each a button that selects it. Inputs: `printer`, the chosen printer; `unplaced`, the
 * ids and names of the cases the last arrange could not place; `cases`, how many objects are on the plate.
 */
export function PlatePanel({ printer, unplaced, cases, locked, onPrinter, onArrange, onSelect }: {
  printer: PrinterProfile;
  unplaced: readonly { id: string; name: string }[];
  cases: number;
  locked: boolean;
  onPrinter: (id: string) => void;
  onArrange: () => void;
  onSelect: (unitId: string) => void;
}) {
  return <section className="plate-panel" data-ui="plate-panel" {...(locked ? { inert: '' } : {})}>
    <h3>{t('Build plate')}</h3>
    <label className="plate-printer" data-ui="plate-printer">
      <span>{t('Printer')}</span>
      <select className="plate-printer-select" data-ui="plate-printer-select" value={printer.id} onChange={(event) => onPrinter(event.target.value)}>
        {PRINTERS.printers.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
      </select>
    </label>
    <p className="plate-size" data-ui="plate-size">{t('Plate {size}', { size: plateSizeText(printer.plate) })}</p>
    <button type="button" className="plate-arrange" data-ui="plate-arrange" disabled={cases === 0} onClick={onArrange}
      {...hint('Pack every case on the plate by its support outline, without overlap. Only positions change; supports stay editable')}>{t('Arrange plate')}</button>
    {unplaced.length > 0 ? <div className="plate-unplaced" data-ui="plate-unplaced" role="alert">
      <p>{plural(unplaced.length, '{n} case does not fit on the plate.', '{n} cases do not fit on the plate.')}</p>
      <ul>
        {unplaced.map((entry) => <li key={entry.id}><button type="button" className="plate-unplaced-item" data-ui="plate-unplaced-item" onClick={() => onSelect(entry.id)} {...hint('Select this case')}>{entry.name}</button></li>)}
      </ul>
    </div> : null}
  </section>;
}
