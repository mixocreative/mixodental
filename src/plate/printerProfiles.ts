import printersFile from '../config/printers.json';
import type { PlateSize } from '@mixo-geocore/editing/arrange';

/*
 * Printer profiles (Round C plate): the one source of truth is src/config/printers.json, modelled on
 * the mixomesh printers.json (one row per printer, its build plate in mm). The app reads only the
 * plate here: width along x, depth along z, centred on the plate origin (what `arrangeOnPlate` packs).
 * Edit the JSON to add a printer; this module checks it and never invents a size.
 */

/** One printer of the config. */
export interface PrinterProfile {
  id: string;
  /** Display name (a product name, never translated). */
  name: string;
  process: 'resin';
  plate: PlateSize;
}

/** The parsed config: every printer, in menu order, and the one a new user starts with. */
export interface PrinterProfiles {
  defaultId: string;
  printers: readonly PrinterProfile[];
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** Checks a printers.json document; throws a TypeError naming the first bad row (a broken config is a bug, not a fallback). */
export function parsePrinterProfiles(raw: unknown): PrinterProfiles {
  if (!isObject(raw) || raw.version !== 1) throw new TypeError('printers.json: expected { "version": 1, ... }');
  if (!Array.isArray(raw.printers) || raw.printers.length === 0) throw new TypeError('printers.json: "printers" must list at least one printer');
  const seen = new Set<string>();
  const printers = raw.printers.map((row, index): PrinterProfile => {
    if (!isObject(row) || typeof row.id !== 'string' || row.id === '' || typeof row.name !== 'string' || row.name === '') throw new TypeError(`printers.json: printer ${index} needs an id and a name`);
    if (seen.has(row.id)) throw new TypeError(`printers.json: printer id '${row.id}' is listed twice`);
    seen.add(row.id);
    if (row.process !== 'resin') throw new TypeError(`printers.json: printer '${row.id}' must be a resin printer`);
    const plate = row.plate;
    if (!isObject(plate) || !positive(plate.widthMm) || !positive(plate.depthMm)) throw new TypeError(`printers.json: printer '${row.id}' needs plate.widthMm and plate.depthMm in mm`);
    return { id: row.id, name: row.name, process: 'resin', plate: { widthMm: plate.widthMm, depthMm: plate.depthMm } };
  });
  if (typeof raw.default !== 'string' || !seen.has(raw.default)) throw new TypeError('printers.json: "default" must name a listed printer');
  return { defaultId: raw.default, printers };
}

/** The app's printers (src/config/printers.json). */
export const PRINTERS: PrinterProfiles = parsePrinterProfiles(printersFile);

/** The printer with `id`, else the default one (a saved id the config no longer lists). */
export function printerById(id: string | undefined, profiles: PrinterProfiles = PRINTERS): PrinterProfile {
  return profiles.printers.find((printer) => printer.id === id) ?? profiles.printers.find((printer) => printer.id === profiles.defaultId)!;
}

const STORAGE_KEY = 'mixodental.printer';

/** The printer this user chose before (localStorage), else the default. */
export function loadPrinter(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): PrinterProfile {
  try {
    return printerById(storage?.getItem(STORAGE_KEY) ?? undefined);
  } catch {
    return printerById(undefined);
  }
}

/** Remembers the user's printer (a per-user choice, like the language; storage blocked: it lasts this visit). */
export function savePrinter(id: string, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(STORAGE_KEY, id);
  } catch { /* storage blocked */ }
}

/** The plate size as the UI shows it: "211.68 × 118.37 mm". */
export const plateSizeText = (plate: PlateSize): string => `${plate.widthMm} × ${plate.depthMm} mm`;
