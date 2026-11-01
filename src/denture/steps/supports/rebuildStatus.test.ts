import { afterEach, describe, expect, it } from 'vitest';
import { setLanguage, translateMessage } from '../../../i18n';
import type { PrintUnit } from '../../../state/project';
import type { DentureMesh } from '../../engine/dentureCore';
import { allFinish, awaitedBuild, landedFinish, pointFinish, REBUILD_STATUS_KEYS, STILL_OPEN } from './rebuildStatus';

const unit = (id: string) => ({ id }) as unknown as PrintUnit;
const mesh = (ids: string[]) => ({ unresolved: ids.map((id) => ({ id })) }) as unknown as DentureMesh;

describe('the status line of a resolve once its rebuild lands', () => {
  afterEach(() => setLanguage('en'));

  it('waits for the build of the unit the allow made, while it is still the scene unit', () => {
    const before = unit('u1');
    const after = unit('u1');
    const pending = { unitId: 'u1', before, finish: pointFinish('island-4', true) };
    expect(awaitedBuild(pending, before, before)).toBe(false);
    expect(awaitedBuild(pending, after, after)).toBe(true);
    expect(awaitedBuild(pending, after, unit('u1'))).toBe(false);
    expect(awaitedBuild(pending, unit('u2'), unit('u2'))).toBe(false);
  });

  it('says the point is supported, or still open, from the rebuilt report', () => {
    expect(pointFinish('island-4', true)(mesh([]))?.key).toBe('Island supported from the model surface. Supports rebuilt.');
    expect(pointFinish('denture-low-unreached-0', false)(mesh(['x']))?.key).toBe('Lowest point supported from the model surface. Supports rebuilt.');
    expect(pointFinish('island-4', true)(mesh(['island-4']))?.key).toBe(STILL_OPEN);
    expect(landedFinish('denture-rim-2')(mesh([]))).toBeUndefined();
    expect(landedFinish('denture-rim-2')(mesh(['denture-rim-2']))?.key).toBe(STILL_OPEN);
    expect(allFinish(['a', 'b'])(mesh([]))?.key).toBe('Supports rebuilt. Every allowed point is supported.');
    expect(translateMessage(allFinish(['a', 'b', 'c'])(mesh(['a', 'c', 'z']))!)).toBe('Supports rebuilt. 2 allowed points are still unresolved; their bubbles say why.');
  });

  it('translates every finished line', () => {
    for (const lang of ['ja', 'zh-Hant'] as const) {
      setLanguage(lang);
      for (const key of REBUILD_STATUS_KEYS) expect(translateMessage({ key, vars: { n: 2 } }), `${lang}: ${key}`).not.toBe(key.replace(/\{\w+\}/g, '2'));
    }
  });
});
