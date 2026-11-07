import { describe, expect, it } from 'vitest';
import { CapacityError, PlateFullError } from '@mixo-geocore/host/core/budget';
import { refusalOf } from './refusalOf';
import { verdictOfRefusal } from './rowState';
import { rowSentence } from './rowText';
import { translateMessage } from '../i18n';

const say = (error: unknown) => translateMessage(rowSentence(verdictOfRefusal(refusalOf(error)))!);

describe('why a file never became a unit', () => {
  it('tells the three capacity limits apart, because they send the operator to different fixes', () => {
    expect(refusalOf(new CapacityError('a.stl', 9e6, 6e6, 'desktop'))).toEqual({ kind: 'too-big', limit: 'triangles' });
    expect(refusalOf(new CapacityError('a.stl', 9e6, 6e6, 'desktop', 'memory'))).toEqual({ kind: 'too-big', limit: 'memory' });
    expect(refusalOf(new PlateFullError('a.stl', 9e6, 6e6))).toEqual({ kind: 'too-big', limit: 'plate' });
  });

  it('calls anything else unreadable, and keeps its code', () => {
    // The file was never parsed. Telling someone to simplify a model nobody could read would send
    // them to fix the wrong thing entirely.
    const coded = Object.assign(new Error('bad header'), { code: 'stl-format' });
    expect(refusalOf(coded)).toEqual({ kind: 'unreadable', code: 'stl-format' });
  });

  it('prefers the error’s own code, which the real import errors all carry', () => {
    // bad-stl and no-mesh are set by src/core/import/stlHeader.ts, so this is the usual path.
    expect(refusalOf(Object.assign(new Error('x'), { code: 'no-mesh' }))).toEqual({ kind: 'unreadable', code: 'no-mesh' });
    expect(refusalOf(Object.assign(new Error('x'), { code: 'bad-stl' }))).toEqual({ kind: 'unreadable', code: 'bad-stl' });
  });

  it('never keys on the message, and never on a name minification would change', () => {
    // `error.name` is 'Error' for a subclass that does not set it, and `constructor.name` would be
    // right in development and WRONG after minification - so neither is trusted. The row says
    // "Could not be read." regardless; the code is for diagnosis, not display.
    class StlEmptyError extends Error {}
    expect(refusalOf(new StlEmptyError('contains no mesh'))).toEqual({ kind: 'unreadable', code: 'Error' });
    expect(refusalOf('not an error at all')).toEqual({ kind: 'unreadable', code: 'unknown' });
    expect(refusalOf(Object.assign(new Error('x'), { code: '' }))).toEqual({ kind: 'unreadable', code: 'Error' });
  });

  /*
   * THE WHOLE POINT: these two row states had no production caller, so `unreadable` and `too-big`
   * could never occur and two of the five sentences were text for rows that cannot exist. This is
   * the chain that makes them real, end to end.
   */
  it('reaches the operator’s words, which is what made these states unreachable before', () => {
    expect(say(new PlateFullError('a.stl', 9e6, 6e6))).toBe('Too big for the plate.');
    expect(say(new CapacityError('a.stl', 9e6, 6e6, 'desktop'))).toBe('Too many triangles for the plate.');
    expect(say(new CapacityError('a.stl', 9e6, 6e6, 'desktop', 'memory'))).toBe('Too large to hold in memory.');
    expect(say(new Error('anything'))).toBe('Could not be read.');
  });
});
