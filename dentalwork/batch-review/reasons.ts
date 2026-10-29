/*
 * Plain-language text for the folder-review reason codes. The table is `reasons.json` (the viewer
 * fetches the same file), so the summary and the viewer always say the same thing. Kept apart from
 * reviewCase.ts (which loads the whole engine) so the mapping can be tested on its own.
 */
import { reasons } from './reasons.json';

/** The plain-language text for a reason code (first matching prefix wins); an error message or unknown code as is. */
export function explainReason(reason: string): string {
  return reasons.find(([prefix]) => reason.startsWith(prefix!))?.[1] ?? reason;
}
