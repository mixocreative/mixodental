// Copyright (c) Mixo Creative.

/**
 * WHAT SAVE TYPE MAY DO TO THE FILE ALREADY AT ITS PATH - the rule serve.mjs `saveType` follows, kept here so it has a
 * test (serve.mjs starts a server when imported).
 *
 * 'write' when nothing is there or the page said to replace; 'same' when the bytes are identical (nothing to ask);
 * 'ask' when a different file is there. Save used to overwrite silently, and an uncommitted type is gone for good.
 * A re-save of the SAME type usually differs too - the proof record carries the run's time - so the question says
 * "a saved type", never "a different type".
 *
 * @param {{ existing: string | null, text: string, replace: boolean }} input
 * @returns {'write' | 'same' | 'ask'}
 */
export function saveVerdict({ existing, text, replace }) {
  if (existing === null || replace) return 'write';
  return existing === text ? 'same' : 'ask';
}
