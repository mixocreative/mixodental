import { t, translateMessage, type Lang } from '../i18n';
import { ScreenHeading } from '../ui/ScreenHeading';
import { Icon } from '../ui/Icon';
import type { PrintUnit } from '../state/project';
import { verdictOfDiagnosis } from './rowState';
import { rowSentence } from './rowText';
import { sizeSummary, triangleSummary } from './itemSummary';
import { itemsLeft, nextItem } from './nextItem';
import { isModelFile } from '../components/startDrop';

/**
 * THE ITEMS PAGE (plan §1 page 2, §7): one row per dropped file, in plate order.
 *
 * Every row part is named for the UNIT, not for its position. `items-row-<index>` would re-point
 * every later row the moment one is removed, and `src/progress/README.md` records a walk check that
 * looked at the first of a set of identically-named elements and reported the rest as missing — a
 * false gap that cost a round of investigation. N rows sharing a name would reproduce it exactly.
 *
 * The page is a pure function of the scene and the session: it holds no state of its own, so there is
 * no second copy of "which item is next" to drift from `nextItem`.
 */
export function ItemsPage({ units, finished, lang, onStart, onRemove, onFiles, onBack }: {
  units: readonly PrintUnit[];
  /** `session.dentalFinished`: the units already through the flow. */
  finished: readonly string[];
  lang: Lang;
  /** Begin the dental flow on this unit. The caller owns the three-call order (see `nextItem`). */
  onStart: (unit: PrintUnit) => void;
  onRemove: (unit: PrintUnit) => void;
  /** Files dropped onto the list. They ADD to it — the caller must not apply Step 1's one-file rule. */
  onFiles: (files: readonly File[]) => void;
  /** Back to the Drop page. Every other start screen has this; without it the page is a dead end. */
  onBack: () => void;
}) {
  const next = nextItem(units, finished, undefined);
  const left = itemsLeft(units, finished);

  return <div className="items-page" lang={lang} tabIndex={-1}
    onKeyDown={(event) => { if (event.key === 'Escape') onBack(); }}
    onDragOver={(event) => event.preventDefault()}
    onDrop={(event) => {
      event.preventDefault();
      const models = [...event.dataTransfer.files].filter(isModelFile);
      if (models.length > 0) onFiles(models);
    }}>
    <button type="button" className="start-back back-key" data-ui="items-back"
      aria-label={t('Back')} title={t('Back')} onClick={onBack}>
      <Icon name="back" className="start-back-art" />
    </button>
    <ScreenHeading>{t('Your files')}</ScreenHeading>
    <ul className="items-list">
      {units.map((unit) => {
        const done = finished.includes(unit.id);
        // No verdict means the unit never went through the import worker, or predates the verdict.
        // The row then shows its size and says nothing about health, which is the honest gap.
        const verdict = unit.diagnosis ? rowSentence(verdictOfDiagnosis(unit.diagnosis)) : undefined;
        return <li key={unit.id} className={`items-row${done ? ' items-row--done' : ''}`} data-ui={`items-row-${unit.id}`}>
          <span className="name" title={unit.name}>{unit.name}</span>
          <span className="preview" data-ui={`items-preview-${unit.id}`}>
            {translateMessage(triangleSummary(unit.source))}
            {' · '}
            {translateMessage(sizeSummary(unit.source))}
          </span>
          <span className="verdict" data-ui={`items-verdict-${unit.id}`}>
            {verdict ? translateMessage(verdict) : null}
          </span>
          <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
            title={t('Take this file off the list.')} onClick={() => onRemove(unit)}>{t('Remove')}</button>
        </li>;
      })}
    </ul>
    <div className="items-foot">
      <span className="items-left">{left === 1 ? t('1 item left') : t('{n} items left', { n: left })}</span>
      {next ? <button type="button" className="primary key-art" data-ui="items-start" onClick={() => onStart(next)}>
        <Icon name="next" />{t('Start with the first item')}
      </button> : null}
    </div>
  </div>;
}
