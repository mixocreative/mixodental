import { useSyncExternalStore } from 'react';
import { subscribeTokens, tokenRevision } from './tokenColour';

/** Re-renders the component when a colour token changes (see tokenColour.ts); the number is a memo key for colours read from tokens. */
export function useTokenRevision(): number {
  return useSyncExternalStore(subscribeTokens, tokenRevision, tokenRevision);
}
