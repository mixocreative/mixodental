/*
 * Whether denture Step 2's Adjust section is open, remembered for the browser session (sessionStorage): closed by
 * default, and as the user last left it when they come back to the step. Storage that throws (private mode, tests)
 * leaves it closed and forgets.
 */

const KEY = 'mixodental.denture.adjustOpen';

export function adjustRemembered(): boolean {
  try {
    return globalThis.sessionStorage?.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function rememberAdjust(open: boolean): void {
  try {
    globalThis.sessionStorage?.setItem(KEY, open ? '1' : '0');
  } catch {
    // Not remembered: the next visit starts closed.
  }
}
