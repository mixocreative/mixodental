import { describe, expect, it } from 'vitest';
import { saveVerdict } from './saveType.mjs';

describe('what Save type may do to the file already there', () => {
  it('writes a new file, and replaces one only when the page says so', () => {
    expect(saveVerdict({ existing: null, text: 'a', replace: false })).toBe('write');
    expect(saveVerdict({ existing: 'old', text: 'new', replace: true })).toBe('write');
  });

  it('asks before replacing a different file, and does not ask for the same bytes', () => {
    expect(saveVerdict({ existing: 'old', text: 'new', replace: false })).toBe('ask');
    expect(saveVerdict({ existing: 'same', text: 'same', replace: false })).toBe('same');
  });
});
