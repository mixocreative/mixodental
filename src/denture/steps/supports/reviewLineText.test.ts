import { describe, expect, it } from 'vitest';
import { reviewLine } from './reviewLineText';

describe('reviewLine', () => {
  it('says the build is on its way, or that it failed', () => {
    expect(reviewLine({ built: false, failed: false, resolvable: 3, problems: 2 }).kind).toBe('building');
    expect(reviewLine({ built: false, failed: true, resolvable: 0, problems: 0 })).toMatchObject({ kind: 'failed', key: 'The supports could not be built. Change a setting to build them again, or press Back.' });
  });

  it('puts points a click can support first (with Fix), then the things to look at, else ready', () => {
    expect(reviewLine({ built: true, failed: false, resolvable: 2, problems: 5 })).toEqual({ kind: 'fix', key: '1 spot needs a support.', other: '{n} spots need a support.', n: 2 });
    expect(reviewLine({ built: true, failed: false, resolvable: 0, problems: 1 })).toMatchObject({ kind: 'look', n: 1 });
    expect(reviewLine({ built: true, failed: false, resolvable: 0, problems: 0 })).toMatchObject({ kind: 'ready', key: 'Supports ready. Every point is held.' });
  });

  it('a finished build wins over an earlier failure', () => {
    expect(reviewLine({ built: true, failed: true, resolvable: 0, problems: 0 }).kind).toBe('ready');
  });
});
