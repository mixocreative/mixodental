import { t, translateMessage, type Lang } from '../i18n';
import { ScreenHeading } from '../ui/ScreenHeading';
import { Icon } from '../ui/Icon';
import type { PrintUnit } from '../state/project';
import { verdictOfDiagnosis, verdictOfRefusal, type ImportRefusal } from './rowState';
import { rowSentence } from './rowText';
import { sizeSummary, triangleSummary } from './itemSummary';
import { itemsLeft, nextItem } from './nextItem';
import { detectSentence, type DetectState } from './detectState';
import { THUMB_SIZE, type ThumbCache } from './thumbnail';
import { ToolRail } from '../deck/ToolRail';
import { unitFacts } from '../deck/unitFacts';
import { jobSentence, jobTally } from '../deck/jobSummary';
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
export function ItemsPage({ units, refused, detected, thumbnails, finished, lang, selectedUnitId, onSelect, onStart, onRemove, onFiles, onBack }: {
  units: readonly PrintUnit[];
  /**
   * Files that never became units. They are rows too (§3's first table): drop eight, one is broken,
   * see WHICH. Before this they were reported on the status line, which can say only one thing — so
   * a drop with two bad files named one of them and lost the other.
   */
  refused: readonly { name: string; refusal: ImportRefusal }[];
  /** Each row's OWN orientation result. Upper and lower arches in one drop differ, so this is per row. */
  detected: ReadonlyMap<string, DetectState>;
  /**
   * The drawn row pictures. A row without one yet shows the empty frame and nothing else: the
   * pictures arrive one at a time (`useThumbnails`), so a blank frame means "not drawn yet" rather
   * than "nothing to see", and the frame holds the row height steady while they fill in.
   */
  thumbnails: ThumbCache;
  /** `session.dentalFinished`: the units already through the flow. */
  finished: readonly string[];
  /** The row the rail acts on. Absent falls back to the next unfinished one, which is where work resumes. */
  selectedUnitId?: string;
  onSelect: (unit: PrintUnit) => void;
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
  /*
   * THE ROW THE RAIL IS ABOUT. Falling back to `next` rather than to the first row matters: the
   * fallback is where work RESUMES, so a returning operator sees the state of the model they are
   * about to pick up rather than of one they already finished.
   */
  const shown = units.find((unit) => unit.id === selectedUnitId) ?? next;

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
      {refused.map((entry) => {
        const said = rowSentence(verdictOfRefusal(entry.refusal));
        return <li key={`refused-${entry.name}`} className="items-row items-row--refused" data-ui={`items-row-refused-${entry.name}`}>
          <span className="shot" data-ui={`items-shot-refused-${entry.name}`} />
          <span className="name" title={entry.name}>{entry.name}</span>
          <span className="preview" data-ui={`items-preview-refused-${entry.name}`} />
          <span className="verdict" data-ui={`items-verdict-refused-${entry.name}`}>
            {said ? translateMessage(said) : null}
          </span>
        </li>;
      })}
      {units.map((unit) => {
        const done = finished.includes(unit.id);
        // No verdict means the unit never went through the import worker, or predates the verdict.
        // The row then shows its size and says nothing about health, which is the honest gap.
        const verdict = unit.diagnosis ? rowSentence(verdictOfDiagnosis(unit.diagnosis)) : undefined;
        const found = detectSentence(detected.get(unit.id) ?? { kind: 'waiting' });
        const shot = thumbnails.get(unit.id)?.url;
        return <li key={unit.id} className={`items-row${done ? ' items-row--done' : ''}${shown?.id === unit.id ? ' items-row--shown' : ''}`} data-ui={`items-row-${unit.id}`} onClick={() => onSelect(unit)}>
          <span className="shot" data-ui={`items-shot-${unit.id}`}>
            {/*
              The model as it is PLACED, so a row shows the orientation the batch just reported. It is
              decoration beside the name and the sentences, which carry the same facts in words, so it
              takes an empty `alt` rather than a description no screen reader needs to hear.
            */}
            {shot ? <img src={shot} alt="" width={THUMB_SIZE} height={THUMB_SIZE} /> : null}
          </span>
          <span className="name" title={unit.name}>{unit.name}</span>
          <span className="preview" data-ui={`items-preview-${unit.id}`}>
            {translateMessage(triangleSummary(unit.source))}
            {' · '}
            {translateMessage(sizeSummary(unit.source))}
          </span>
          <span className="verdict" data-ui={`items-verdict-${unit.id}`}>
            {verdict ? translateMessage(verdict) : null}
          </span>
          <span className="detect" data-ui={`items-detect-${unit.id}`}>
            {found ? translateMessage(found) : null}
          </span>
          <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
            title={t('Take this file off the list.')} onClick={() => onRemove(unit)}>{t('Remove')}</button>
        </li>;
      })}
    </ul>
    {/*
      HOW THE DROP IS DOING, from the SAME verdicts the rows show, so the two cannot disagree. Silent
      when every row is sound: a line reading "0 problems" on every drop trains the operator to stop
      reading it, and then it says nothing on the drop that matters.
    */}
    {(() => {
      const said = jobSentence(jobTally(units, refused));
      return said ? <p className="items-tally" data-ui="items-tally">{translateMessage(said)}</p> : null;
    })()}
    {/*
      THE RAIL, ABOUT ONE ROW. It is the deck's answer to "what is done here and what is next",
      which is the property the wizard used to carry. The rule it draws and the reasoning behind
      each state live in `src/deck/README.md`.
    */}
    {shown ? <ToolRail facts={unitFacts(shown, detected.get(shown.id))} onPick={() => onStart(shown)} /> : null}
    <div className="items-foot">
      <span className="items-left">{left === 1 ? t('1 item left') : t('{n} items left', { n: left })}</span>
      {next ? <button type="button" className="primary key-art" data-ui="items-start" onClick={() => onStart(next)}>
        <Icon name="next" />{t('Start with the first item')}
      </button> : null}
    </div>
  </div>;
}
