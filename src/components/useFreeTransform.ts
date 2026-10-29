import { useCallback, useEffect, useState } from 'react';

/**
 * Step 1's Free transform state (PD.11 S6): off, asking (the confirm prompt is open), or on (the
 * rotation-only gizmo shows and the big number and dial hide). Pure, so the transitions are tested
 * without React.
 */
export interface FreeState {
  free: boolean;
  asking: boolean;
}

export type FreeAction = { type: 'ask' } | { type: 'confirm' } | { type: 'cancel' } | { type: 'leave' };

export const FREE_OFF: FreeState = { free: false, asking: false };

/** The next Free transform state. `confirm` turns it on; `leave` (Auto orient) turns it off; `cancel` closes the prompt only. */
export function freeReducer(state: FreeState, action: FreeAction): FreeState {
  switch (action.type) {
    case 'ask': return { free: state.free, asking: true };
    case 'confirm': return { free: true, asking: false };
    case 'cancel': return { free: state.free, asking: false };
    case 'leave': return FREE_OFF;
  }
}

/**
 * Free transform for the Step 1 aligner. The state belongs to one stage (`stageKey`, e.g.
 * `aligner:<unit id>`): it is reset whenever the stage changes, so leaving Step 1 drops it.
 */
export function useFreeTransform(stageKey: string) {
  const [held, setHeld] = useState<{ stage: string; state: FreeState }>({ stage: stageKey, state: FREE_OFF });
  useEffect(() => { setHeld({ stage: stageKey, state: FREE_OFF }); }, [stageKey]);
  // Until the reset effect runs, a state from another stage reads as off.
  const state = held.stage === stageKey ? held.state : FREE_OFF;
  const act = useCallback((action: FreeAction) => {
    setHeld((previous) => ({ stage: stageKey, state: freeReducer(previous.stage === stageKey ? previous.state : FREE_OFF, action) }));
  }, [stageKey]);
  return {
    free: state.free,
    asking: state.asking,
    ask: useCallback(() => act({ type: 'ask' }), [act]),
    confirm: useCallback(() => act({ type: 'confirm' }), [act]),
    cancel: useCallback(() => act({ type: 'cancel' }), [act]),
    leave: useCallback(() => act({ type: 'leave' }), [act]),
  };
}
