import { t, translateMessage, type Lang } from '../i18n';
import { ScreenHeading } from '../ui/ScreenHeading';
import { Icon } from '../ui/Icon';
import type { PrintUnit } from '../state/project';
import type { ImportRefusal } from './rowState';
import { itemsLeft, nextItem } from './nextItem';
import type { DetectState } from './detectState';
import type { ThumbCache } from './thumbnail';
import { ItemRow } from './ItemRow';
import { RefusedRow } from './RefusedRow';
import { ToolRail } from '../deck/ToolRail';
import { unitFacts } from '../deck/unitFacts';
import { jobSentence, jobTally } from '../deck/jobSummary';
import { isModelFile } from '../components/startDrop';

/**
 * THE DECK (plan §1 page 2, §0b): the tool rail down the left, one row per dropped file beside it,
 * and how the whole drop is doing underneath.
 *
 * THIS FILE IS LAYOUT AND NOTHING ELSE. What a row says lives in `ItemRow` and `RefusedRow`, which
 * tool may be pressed lives in `src/deck/`, and which item is next lives in `nextItem`. Keeping the
 * page thin is what lets each of those be read — and tested — on its own; it used to render both
 * kinds of row inline and was three times this length.
 *
 * It holds NO state. There is no second copy of "which item is next" to drift from `nextItem`, and
 * no second opinion about a row's health to drift from the row's own verdict.
 *
 * Every row part is named for the UNIT, never for its position. `items-row-<index>` would re-point
 * every later row the moment one is removed, and `src/progress/README.md` records a walk check that
 * looked at the first of a set of identically-named elements and reported the rest as missing — a
 * false gap that cost a round of investigation.
 */
export function ItemsPage({ units, refused, detected, thumbnails, finished, lang, selectedUnitId, denture, onSelect, onStart, onRemove, onFiles, onBack }: {
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
  /**
   * The run is making dentures. It comes from the RUN's profile rather than from a row, because a
   * row's own `denture` policy is only written on acceptance - so until then the rail would read a
   * denture as an aligner and offer it a rim to draw (`deck/unitFacts.ts`).
   */
  denture: boolean;
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
   *
   * The LAST row behind that, because `next` is undefined once every unit is finished — and the rail
   * vanishing from a page that still has rows reads as a fault rather than as "nothing left to do".
   */
  const railUnit = units.find((unit) => unit.id === selectedUnitId) ?? next ?? units[units.length - 1];
  /*
   * HOW THE DROP IS DOING, from the SAME verdicts the rows show, so the two cannot disagree. Silent
   * when every row is sound: a line reading "0 problems" on every drop trains the operator to stop
   * reading it, and then it says nothing on the drop that matters.
   */
  const tally = jobSentence(jobTally(units, refused));

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

    {/*
      THE RAIL DOWN THE LEFT, with the models beside it, which is where the design puts it. One flex
      row here, and the workspace's own left edge once that exists — the same component either way.
    */}
    <div className="items-body">
      {railUnit ? <ToolRail facts={unitFacts(railUnit, detected.get(railUnit.id), denture)} onPick={() => onStart(railUnit)} /> : null}
      <ul className="items-list">
        {refused.map((entry) => <RefusedRow key={`refused-${entry.name}`} name={entry.name} refusal={entry.refusal} />)}
        {units.map((unit) => <ItemRow
          key={unit.id}
          unit={unit}
          done={finished.includes(unit.id)}
          onRail={railUnit?.id === unit.id}
          detected={detected.get(unit.id)}
          thumbnails={thumbnails}
          onSelect={() => onSelect(unit)}
          onRemove={() => onRemove(unit)}
        />)}
      </ul>
    </div>

    {tally ? <p className="items-tally" data-ui="items-tally">{translateMessage(tally)}</p> : null}

    <div className="items-foot">
      <span className="items-left">{left === 1 ? t('1 item left') : t('{n} items left', { n: left })}</span>
      {next ? <button type="button" className="primary key-art" data-ui="items-start" onClick={() => onStart(next)}>
        <Icon name="next" />{t('Start with the first item')}
      </button> : null}
    </div>
  </div>;
}
