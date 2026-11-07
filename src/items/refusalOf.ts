// Copyright (c) Mixo Creative.

import { CapacityError, PlateFullError } from '@mixo-geocore/host/core/budget';
import type { ImportRefusal } from './rowState';

/**
 * WHY A FILE NEVER BECAME A UNIT, as the row needs it.
 *
 * `verdictOfRefusal` has existed since the row states were written and had **no production caller**:
 * a refused file was reported on the status line and vanished, so `unreadable` and `too-big` could
 * never occur. Two of the five sentences were text for rows that cannot exist — exactly the fault
 * this module refused to commit for the repair states.
 *
 * §3's first table always wanted refused files to BE rows, and a case of eight needs it: drop eight,
 * one is broken, see **which**. This is the missing link.
 *
 * TWO SENTENCES, NOT ONE, and the distinction is the operator's: a capacity refusal read the file
 * perfectly well and it does not fit, while an unreadable one could not be read at all. Telling
 * someone to simplify a model that was never parsed would send them to fix the wrong thing.
 */
export function refusalOf(error: unknown): ImportRefusal {
  // The plate is full: this file is fine, and so is the plate — together they are too much.
  if (error instanceof PlateFullError) return { kind: 'too-big', limit: 'plate' };
  // One file past the runtime's budget, by triangles or by the memory those triangles need.
  if (error instanceof CapacityError) return { kind: 'too-big', limit: error.reason === 'memory' ? 'memory' : 'triangles' };
  // Everything else: a damaged or empty STL, non-finite coordinates, a worker that gave up.
  return { kind: 'unreadable', code: codeOf(error) };
}

/**
 * The error's own `code` when it carries one — which the real import errors do: `bad-stl` and
 * `no-mesh` (`src/core/import/stlHeader.ts`). Never the message: messages are translated and
 * rewritten, and a row must key on something stable.
 *
 * THE FALLBACK IS DELIBERATELY WEAK. `error.name` is `'Error'` for any subclass that does not set it,
 * and `constructor.name` would be better in development and **wrong after minification** — a code
 * that changes between the build you test and the build you ship is worse than a vague one. So an
 * uncoded error reads as `'Error'` or `'unknown'`, and that is honest: the row says "Could not be
 * read." either way, and the code is for diagnosis, not for display.
 */
function codeOf(error: unknown): string {
  const coded = error as { code?: unknown } | null;
  if (coded && typeof coded.code === 'string' && coded.code.length > 0) return coded.code;
  return error instanceof Error && error.name ? error.name : 'unknown';
}
