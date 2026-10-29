import { describe, expect, it } from 'vitest';
import { FREE_OFF, freeReducer } from './useFreeTransform';

describe('freeReducer', () => {
  it('asks, then confirm turns Free transform on and closes the prompt', () => {
    const asking = freeReducer(FREE_OFF, { type: 'ask' });
    expect(asking).toEqual({ free: false, asking: true });
    expect(freeReducer(asking, { type: 'confirm' })).toEqual({ free: true, asking: false });
  });

  it('cancel closes the prompt and keeps Free transform as it was', () => {
    expect(freeReducer({ free: false, asking: true }, { type: 'cancel' })).toEqual(FREE_OFF);
    expect(freeReducer({ free: true, asking: false }, { type: 'cancel' })).toEqual({ free: true, asking: false });
  });

  it('leave (Auto orient) turns Free transform off from any state', () => {
    expect(freeReducer({ free: true, asking: false }, { type: 'leave' })).toEqual(FREE_OFF);
    expect(freeReducer({ free: false, asking: true }, { type: 'leave' })).toEqual(FREE_OFF);
  });
});
