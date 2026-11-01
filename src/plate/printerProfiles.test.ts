import { describe, expect, it } from 'vitest';
import printersFile from '../config/printers.json';
import { loadPrinter, parsePrinterProfiles, plateSizeText, printerById, PRINTERS, savePrinter } from './printerProfiles';

const row = (id: string, widthMm: unknown = 100, depthMm: unknown = 50) => ({ id, name: id.toUpperCase(), process: 'resin', plate: { widthMm, depthMm } });

describe('printer profiles (src/config/printers.json)', () => {
  it('parses the shipped config; the default is the Saturn 4 Ultra 16K plate', () => {
    expect(parsePrinterProfiles(printersFile)).toEqual(PRINTERS);
    const first = printerById(undefined);
    expect(first.id).toBe('elegoo-saturn-4-ultra-16k');
    expect(first.plate).toEqual({ widthMm: 211.68, depthMm: 118.37 });
    expect(PRINTERS.printers.length).toBeGreaterThan(3);
    expect(new Set(PRINTERS.printers.map((printer) => printer.id)).size).toBe(PRINTERS.printers.length);
  });

  it('rejects a broken config instead of inventing a plate', () => {
    expect(() => parsePrinterProfiles({ version: 2, default: 'a', printers: [row('a')] })).toThrow(/version/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'a', printers: [] })).toThrow(/at least one/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'a', printers: [row('a'), row('a')] })).toThrow(/twice/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'a', printers: [row('a', 0)] })).toThrow(/plate/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'a', printers: [row('a', '100')] })).toThrow(/plate/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'b', printers: [row('a')] })).toThrow(/default/);
    expect(() => parsePrinterProfiles({ version: 1, default: 'a', printers: [{ ...row('a'), process: 'fdm' }] })).toThrow(/resin/);
  });

  it('an unknown or removed id falls back to the default; the choice is remembered per user', () => {
    const profiles = parsePrinterProfiles({ version: 1, default: 'b', printers: [row('a'), row('b', 80, 40)] });
    expect(printerById('a', profiles).id).toBe('a');
    expect(printerById('gone', profiles).id).toBe('b');
    const store = new Map<string, string>();
    const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => void store.set(key, value) };
    expect(loadPrinter(storage).id).toBe(PRINTERS.defaultId);
    savePrinter('formlabs-form-4', storage);
    expect(loadPrinter(storage).plate).toEqual({ widthMm: 200, depthMm: 125 });
    expect(loadPrinter({ getItem: () => { throw new Error('blocked'); } }).id).toBe(PRINTERS.defaultId);
    expect(plateSizeText({ widthMm: 211.68, depthMm: 118.37 })).toBe('211.68 × 118.37 mm');
  });
});
