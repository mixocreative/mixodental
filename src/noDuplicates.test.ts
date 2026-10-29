import { describe, expect, it } from 'vitest';
import { findDuplicates } from '../scripts/check-no-duplicates.mjs';

// One copy of every shared module, in mixo-geocore (PE.5b): src/ holds no copy of a vendored one.
describe('no duplicates of the shared packages', () => {
  it('src has no module that mirrors, is named like or repeats a vendored mixo-geocore module', () => {
    const result = findDuplicates() as { checked: number; vendored: number; problems: string[] };
    expect(result.vendored).toBeGreaterThan(80);
    expect(result.problems).toEqual([]);
  });
});
