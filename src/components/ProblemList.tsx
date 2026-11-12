import type { SupportProblem } from '@mixo-geocore/host/core/analysis/supportCheck';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { t } from '../i18n';
import { hint } from './hint';
import { hasNoFix, problemText } from './problemText';
import type { RuleReason } from '../denture/check/ruleSpots';
import { ruleReasonText } from '../denture/check/ruleText';

/** How many findings the list shows; the rest are counted. */
const SHOWN = 12;

/** Support check findings: what and where, Show me (frame it) and Fix (open Support Edit Mode on its object). */
export function ProblemList<P extends SupportProblem & { unitId: string; inZone: boolean; rule?: RuleReason }>({ problems, outOfDate, rechecking, unitName, kindOf, onShow, onFix }: {
  problems: readonly P[];
  /** The supports changed since these findings were made: they are listed until the re-check replaces them. */
  outOfDate: boolean;
  /** A support was added at this finding's spot: it stays listed, marked, until the re-check says if it is covered. */
  rechecking: (problem: P) => boolean;
  unitName: (unitId: string) => string;
  /** The dental kind of the unit of a finding, for the sentences that name the object of the job (`kindText`); absent: the aligner words. */
  kindOf?: (unitId: string) => DentalKind | undefined;
  onShow: (problem: P) => void;
  onFix: (problem: P) => void;
}) {
  return <>
    {outOfDate && <p className="help stale" role="status">{t('Out of date, check again.')}</p>}
    {problems.length > 0 && <ul className="problems" data-ui="problem-list">
      {problems.slice(0, SHOWN).map((problem, index) => <li key={`${problem.unitId}-${index}`} data-ui={problem.rule ? 'problem-item-accepted' : `problem-item-${problem.kind}`}>
        <span className={`problem-kind ${problem.kind === 'unjudged' ? 'island' : problem.kind}`} aria-hidden="true" />
        <span className="problem-text">
          {problemText(problem, kindOf)}
          <small>{unitName(problem.unitId)}{problem.kind === 'overhang' ? ` · ${t('{n} mm²', { n: Math.round(problem.area) })}` : ''}{problem.inZone ? ` · ${t('in a no-support zone')}` : ''}{rechecking(problem) ? ` · ${t('re-checking')}` : ''}</small>
          {problem.rule && <small>{ruleReasonText(problem.rule)}</small>}
          {problem.kind === 'unjudged' && <small>{t('This mesh has defects, such as edges shared by more than two faces, so no island is called supported. Repair the model, then check again.')}</small>}
        </span>
        {problem.kind !== 'unjudged' && <>
          <button onClick={() => onShow(problem)} {...hint('Frame the camera on this spot')}>{t('Show me')}</button>
          {!hasNoFix(problem.kind) && <button onClick={() => onFix(problem)} {...hint('Open Support Edit Mode on this object to add supports here')}>{t('Fix')}</button>}
        </>}
      </li>)}
    </ul>}
    {problems.length > SHOWN && <p className="help">{t('and {n} more', { n: problems.length - SHOWN })}</p>}
  </>;
}
