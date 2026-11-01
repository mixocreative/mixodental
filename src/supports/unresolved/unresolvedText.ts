import type { UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import type { Message } from '../../i18n';

/*
 * The plain-language tooltip of an unresolved-point bubble (Round C): what the point is, how high it stands, why no
 * support reaches it and the best gap the engine found against the gap it needs. Kept as an i18n message (key and
 * values) so it re-translates with the language. The engine's own `reason` stays in English for the batch report;
 * the UI words come from the point's kind and gaps only.
 */

/** A height as the tooltip shows it: whole mm from 10 mm up, else one decimal. */
export const heightText = (mm: number): string => (Math.abs(mm) >= 10 ? Math.round(mm).toString() : mm.toFixed(1));
/** A gap, one decimal (0.8, 1.0). */
export const gapText = (mm: number): string => mm.toFixed(1);

/** A lowest point the placement found but put no tip on (`denture-low-unreached-<k>`, engine 51). */
export const isUnreachedLow = (id: string): boolean => id.startsWith('denture-low-unreached-');

/** An island no tip serves, named by its own lowest vertex (`island-<vertex>`). */
export const isBareIsland = (id: string): boolean => id.startsWith('island-');

/**
 * An island the engine refused a tip (engine 54, after the click put it on the allow list): its lowest point faces sideways
 * (past `islandMaxFromDownDeg`) or has no usable face. The engine's reason says so; a further click cannot help.
 */
export const isRefusedIsland = (point: Pick<UnresolvedPoint, 'kind' | 'reason'>): boolean => point.kind === 'island' && point.reason.startsWith("island's lowest point");

/** The tooltip of a refused island. */
export const REFUSED_ISLAND_SENTENCE = 'Island {h} mm up: its lowest point faces sideways, so no support tip can stand there.';

const SENTENCES = {
  lowest: { gap: 'Lowest point {h} mm up: no route from the plate, best gap {gap} mm ({need} needed).', none: 'Lowest point {h} mm up: no route from the plate found ({need} mm gap needed).' },
  island: { gap: 'Island {h} mm up: no route from the plate, best gap {gap} mm ({need} needed).', none: 'Island {h} mm up: no route from the plate found ({need} mm gap needed).' },
  tip: { gap: 'Support tip {h} mm up: no route from the plate, best gap {gap} mm ({need} needed).', none: 'Support tip {h} mm up: no route from the plate found ({need} mm gap needed).' },
} as const;

/** The click sentence, added only where the click can resolve the point (`resolvable`). */
export const RESOLVE_SENTENCE = 'Click to support it from the model surface.';

/** The bubble's tooltip for `point`; `resolvable`: a click supports it from the model surface (the dental model landing). */
export function unresolvedMessage(point: Pick<UnresolvedPoint, 'id' | 'kind' | 'heightMm' | 'bestGapMm' | 'neededMm' | 'reason'>, resolvable: boolean): Message {
  const h = heightText(point.heightMm);
  const first: Message = isRefusedIsland(point) ? { key: REFUSED_ISLAND_SENTENCE, vars: { h } }
    : point.kind === 'lowest' && isUnreachedLow(point.id)
    ? { key: 'Lowest point {h} mm up: no support tip could be placed there.', vars: { h } }
    : point.bestGapMm === null
      ? { key: SENTENCES[point.kind].none, vars: { h, need: gapText(point.neededMm) } }
      : { key: SENTENCES[point.kind].gap, vars: { h, gap: gapText(point.bestGapMm), need: gapText(point.neededMm) } };
  return resolvable ? { ...first, then: { key: RESOLVE_SENTENCE } } : first;
}

/** Every sentence key the tooltip can use (the i18n test checks each has a translation). */
export const UNRESOLVED_KEYS: readonly string[] = [
  ...Object.values(SENTENCES).flatMap((pair) => [pair.gap, pair.none]),
  'Lowest point {h} mm up: no support tip could be placed there.', RESOLVE_SENTENCE, REFUSED_ISLAND_SENTENCE,
];

/** The hover text of a resolved mark, by the landing tier the engine reports (`modelLanded[].tier`). */
export const LANDING_TIER_TEXT = {
  allowed: 'Supported from the model surface, in the allowed area.',
  other: 'Supported from the model surface, outside the allowed area.',
  'no-support': 'Supported from the model surface, in a no-support zone.',
} as const;
