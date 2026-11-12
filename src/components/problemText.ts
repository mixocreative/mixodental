import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { kindText } from '../denture/kindText';
import { plural, t } from '../i18n';

/**
 * The sentence of one support-check finding.
 *
 * Extracted from `ProblemList` because it had become a single conditional expression six branches
 * long on one line, and the sixth (`buried`) would not have been readable in it. One job, no JSX,
 * and testable per kind — which is how `problemText.test.ts` can assert every kind has a sentence
 * without rendering anything.
 */
export function problemText(
  problem: Pick<SupportProblem, 'kind' | 'area' | 'points'> & { unitId: string; rule?: unknown },
  kindOf?: (unitId: string) => DentalKind | undefined,
): string {
  const n = problem.points?.length ?? 1;
  // A rule reason outranks the kind: a denture's accepted spot is reported as the rule's decision,
  // not as whatever kind the check gave it.
  if (problem.rule) return plural(n, '1 spot accepted by the denture rules.', '{n} spots accepted by the denture rules.');
  switch (problem.kind) {
    case 'island':
      return t('Unsupported island');
    case 'unjudged':
      return t('Could not judge islands on this mesh');
    case 'omitted':
      return plural(n,
        '1 support was left out because it would cross the model or break a placement rule.',
        '{n} supports were left out because they would cross the model or break a placement rule.');
    case 'buried':
      // Deliberately not worded like `omitted`. That one is about the BUILD leaving a support out,
      // which another setting might bring back; this is the model's own shape putting the surface
      // inside another of its meshes, which no setting changes. Saying "left out" alone would send
      // an operator into the settings after a cause that is not there.
      return plural(n,
        '1 contact was left out: it sits inside another mesh of this object, where no support can reach.',
        '{n} contacts were left out: they sit inside another mesh of this object, where no support can reach.');
    case 'outside':
      return plural(n,
        kindText('1 low point lies outside the dental support area and is left to the aligner shape.', kindOf?.(problem.unitId)),
        kindText('{n} low points lie outside the dental support area and are left to the aligner shape.', kindOf?.(problem.unitId)));
    default:
      return t('Uncovered overhang');
  }
}

/** Findings with nothing to fix: informational, so the row offers Show but no Fix. */
export function hasNoFix(kind: SupportProblem['kind']): boolean {
  return kind === 'outside' || kind === 'buried';
}
