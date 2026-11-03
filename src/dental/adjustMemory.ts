/*
 * Whether a supports step's Adjust section is open, remembered for the browser session (sessionStorage):
 * closed by default, and as the user last left it when they come back to the step. Each step remembers its
 * own, because a reader who keeps the denture's settings open does not thereby want the aligner's open too.
 * Storage that throws (private mode, tests) leaves it closed and forgets.
 */

const key = (kind: string) => `mixodental.${kind}.adjustOpen`;

export function adjustRemembered(kind: string): boolean {
  try {
    return globalThis.sessionStorage?.getItem(key(kind)) === '1';
  } catch {
    return false;
  }
}

export function rememberAdjust(kind: string, open: boolean): void {
  try {
    globalThis.sessionStorage?.setItem(key(kind), open ? '1' : '0');
  } catch {
    // Not remembered: the next visit starts closed.
  }
}
