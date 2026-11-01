import { describe, expect, it } from 'vitest';
import { resolve } from '@mixo-geocore/editing/commands';
import { READY } from '../dental/editing/uiFixture';
import { DICTIONARY } from '../i18n';
import { KIND_TEXT_KEYS, kindMessage, kindText } from './kindText';
import '../dental/editingMode';

describe('kindText', () => {
  it('words a dental line for the job kind, the aligner line as the key', () => {
    const step = 'Drop an aligner STL, or choose one. It is oriented automatically; adjust with the gizmo, then press Next.';
    expect(kindText(step, 'aligner')).toBe(step);
    expect(kindText(step, undefined)).toBe(step);
    expect(kindText(step, 'denture')).toMatch(/^Drop a denture STL/);
    expect(kindText('Support Edit Mode', 'denture')).toBe('Support Edit Mode');
  });

  it('words a status message, its plural and its next sentence', () => {
    const finished = { key: 'Finished {n} aligner on the plate. Export STL or Save project to keep it.', vars: { n: 2 }, other: 'Finished {n} aligners on the plate. Export STL or Save project to keep them.', then: { key: 'Add an aligner first.' } };
    expect(kindMessage(finished, 'aligner')).toBe(finished);
    expect(kindMessage(finished, 'denture')).toEqual({ key: 'Finished {n} denture on the plate. Export STL or Save project to keep it.', vars: { n: 2 }, other: 'Finished {n} dentures on the plate. Export STL or Save project to keep them.', then: { key: 'Add a denture first.' } });
  });

  it('no denture line names the aligner, and both lines are translated', () => {
    for (const key of KIND_TEXT_KEYS) {
      const denture = kindText(key, 'denture');
      expect(denture, key).not.toMatch(/aligner/i);
      for (const [lang, dictionary] of Object.entries(DICTIONARY)) {
        expect(dictionary[key], `${lang}: ${key}`).toBeDefined();
        expect(dictionary[denture], `${lang}: ${denture}`).toBeDefined();
      }
    }
  });

  it('the dental commands speak of the denture in a denture job', () => {
    const review = { ...READY, mode: 'dental', dentalStage: 'review', dentalKind: 'denture' } as typeof READY;
    expect(resolve('dental.finish', review).hint).toBe('Finish this denture. It stays on the plate with its supports');
    expect(resolve('dental.addAnother', review).label).toBe('Add another denture');
    expect(resolve('dental.exit', review).hint).toBe('Leave the dental flow. The denture stays on the plate without supports');
    expect(resolve('dental.exit', { ...review, dentalKind: 'aligner' }).hint).toBe('Leave the dental flow. The aligner stays on the plate without supports');
  });
});
