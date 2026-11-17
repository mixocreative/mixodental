import { useEffect, useRef } from 'react';
import { plural, t, translateMessage, type Lang } from '../i18n';
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
import type { ToolId } from '../state/tools';
import { unitFacts } from '../deck/unitFacts';
import { jobSentence, jobTally } from '../deck/jobSummary';
import { isModelFile } from '../components/startDrop';
import { hint } from '../components/hint';

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
export function ItemsPage({ units, refused, detected, thumbnails, finished, lang, selectedUnitId, denture, onSelect, onStart, onRemove, onFiles, onBack, onArrange, onExport, onRetry }: {
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
  /**
   * Open this row. `tool` is the rail button that was pressed, absent for the page's own primary.
   *
   * The rail used to drop it (`onPick={() => onStart(railUnit)}`), so all four buttons did the same
   * thing - open the model at the start of its flow - which is how W-02's second half outlived its
   * first. `App.tsx` decides what a given tool may enter; the page only reports which was pressed.
   */
  onStart: (unit: PrintUnit, tool?: ToolId) => void;
  onRemove: (unit: PrintUnit) => void;
  /** Files dropped onto the list. They ADD to it — the caller must not apply Step 1's one-file rule. */
  onFiles: (files: readonly File[]) => void;
  /** Back to the Drop page. Every other start screen has this; without it the page is a dead end. */
  onBack: () => void;
  /**
   * THE CASE-LEVEL WORK, which until now lived only on the bench - and the bench is not rendered
   * while a start screen is up. So the one screen that knows about more than one model could not
   * finish a case: the technician had to leave for a screen reached by a different door, do two
   * things there, and come back. `useExport.ts` had already recorded the gap in an audit note: *the
   * rail lives on the deck, where nothing is exported*.
   *
   * Both are existing behaviour moved, not new behaviour. `onArrange` is the plate panel's own
   * press, which is pure (units in, move commands out) and never needed the workspace. `onExport`
   * writes ONE FILE PER OBJECT, because this app has no build plate by the owner's ruling: the
   * slicer packs the real plate, so a whole-plate export would be claiming a layout the app does
   * not own.
   */
  onArrange: () => void;
  onExport: () => void;
  /** Queue this row's detection again. A failed row had no way back before (`useBatchDetect`). */
  onRetry: (unitId: string) => void;
}) {
  const next = nextItem(units, finished, undefined);
  const left = itemsLeft(units, finished);
  /*
   * WHAT START WILL OPEN — and it has to SAY which, which is the half that was missing.
   *
   * It used to be `next` unconditionally: the first unfinished row in list order. So selecting row 3
   * and pressing Start opened row 1, and the label read "the first item" whatever was highlighted.
   * With the rail's own buttons inert (see `src/deck/README.md`), that made rows reachable ONLY in
   * order — a flagged row in the middle of a case could not be opened at all until every row above it
   * was finished or destroyed with Remove. For a drop where three of eight come back with no rim,
   * that is the ordinary case rather than an edge.
   *
   * A SELECTED ROW ALWAYS WINS, finished or not (owner's ruling, 2026-11-18: a done mark informs, it
   * never blocks a redo). This used to drop a finished selection, so picking a done row and pressing
   * Start silently opened a DIFFERENT one - and once every row was finished the key disappeared
   * altogether, which is the state a case ends in. "Finish that one again" is exactly what an
   * operator means when the print failed, the file was replaced, or the supports were wrong.
   */
  const target = units.find((unit) => unit.id === selectedUnitId) ?? next ?? units[units.length - 1];
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
  /* Export is offered only once something could come out of it; see the key's own note below. */
  const anySupports = units.some((unit) => unit.supports !== undefined);
  /*
   * TWENTY-FOUR CARDS IS THE CASE THIS SCREEN IS FOR, and it was built for four.
   *
   * NEEDS-YOU FIRST. A stage case is routinely 10-30 models, and under review-by-exception the two
   * or three the robot could not decide ARE the human's job. In plate order they have to be found by
   * scrolling. The sort is stable, so everything else keeps the order it was dropped in, and rows
   * are named for their unit rather than their position - so moving them re-points nothing.
   *
   * ONE PROGRESS LINE. The detector runs strictly one row at a time, so a case shows one "Checking…"
   * and twenty-three "Waiting its turn…" - which says how little is happening, not how far along it
   * is. The aggregate is the thing an operator reads from across the room.
   */
  const needsYou = (unit: PrintUnit) => {
    const state = detected.get(unit.id)?.kind;
    return state === 'failed' || state === 'no-rim';
  };
  const rows = [...units].sort((a, b) => Number(needsYou(b)) - Number(needsYou(a)));
  const waiting = units.filter((unit) => {
    const state = detected.get(unit.id)?.kind;
    return state === 'waiting' || state === 'running';
  }).length;
  const attention = units.filter(needsYou).length;
  const root = useRef<HTMLDivElement>(null);

  /*
   * THE PAGE TAKES THE KEYBOARD WHEN IT OPENS, and until now nothing gave it to anyone. Esc here is
   * a React `onKeyDown` on this div, which only fires from INSIDE it - and arriving from a drop
   * leaves focus on `<body>`, so Esc reached neither this handler nor the workspace's (which is
   * gated on the start screen). The Drop page has always done this; the deck was written without it.
   */
  useEffect(() => { root.current?.focus(); }, []);

  return <div ref={root} className="items-page" lang={lang} tabIndex={-1}
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
      {railUnit ? <ToolRail facts={unitFacts(railUnit, detected.get(railUnit.id), denture)} onPick={(tool) => onStart(railUnit, tool)} /> : null}
      <ul className="items-list">
        {refused.map((entry) => <RefusedRow key={`refused-${entry.name}`} name={entry.name} refusal={entry.refusal} />)}
        {rows.map((unit) => <ItemRow
          key={unit.id}
          unit={unit}
          /*
           * THE MARK IS DERIVED, NOT REMEMBERED. `finished` is session state and nothing persists
           * it - `encodeProject` serialises the scene alone - so a reopened project used to show a
           * whole case as untouched. The supports ARE in the file, so the row can say so without
           * the session's help. The two are OR'd rather than swapped because a unit finished with
           * no supports built (a model that needed none) is still finished this sitting.
           *
           * It is a label and nothing else: the row stays selectable, the rail still acts on it,
           * and Start still opens it (owner's ruling, 2026-11-18 - a done mark never blocks a redo).
           */
          done={finished.includes(unit.id) || unit.supports !== undefined}
          onRail={railUnit?.id === unit.id}
          detected={detected.get(unit.id)}
          thumbnails={thumbnails}
          onSelect={() => onSelect(unit)}
          onRemove={() => onRemove(unit)}
          onRetry={() => onRetry(unit.id)}
        />)}
      </ul>
    </div>

    {tally ? <p className="items-tally" data-ui="items-tally">{translateMessage(tally)}</p> : null}

    {/*
      WHAT THE WHOLE CASE NEEDS, beside what one row needs. Export says WHY it is off rather than
      going quietly grey: a case with no supports built yet is the ordinary state of this screen, and
      a dead key with no reason is the thing `src/deck/README.md` is mostly about.
    */}
    <div className="items-case">
      <button type="button" className="items-case-key" data-ui="items-arrange" disabled={units.length === 0}
        onClick={onArrange}
        {...hint('Move the objects so none overlaps another. Only positions change; supports stay editable')}
      >{t('Arrange objects')}</button>
      <button type="button" className="items-case-key" data-ui="items-export" disabled={!anySupports}
        onClick={onExport}
        {...(anySupports ? hint('One STL file per object, each with its supports')
          : { title: t('Nothing to export: no object in this export has supports left.') })}
      >{t('Each object with model')}</button>
    </div>

    <div className="items-foot">
      <span className="items-left">{left === 1 ? t('1 item left') : t('{n} items left', { n: left })}</span>
      {waiting > 0 ? <span className="items-progress" data-ui="items-progress">
        {t('Checking {done} of {n}', { done: units.length - waiting + 1, n: units.length })}
      </span> : null}
      {attention > 0 ? <span className="items-attention" data-ui="items-attention">
        {plural(attention, '{n} needs you', '{n} need you')}
      </span> : null}
      {target ? <button type="button" className="primary key-art" data-ui="items-start"
        /* The name goes in the title rather than the label: a long file name in the primary would
           either clip or wrap the row, and the label has to read the same in three languages. */
        title={target.name}
        onClick={() => onStart(target)}>
        <Icon name="next" />{t(target === next ? 'Start with the first item' : 'Start this item')}
      </button> : null}
    </div>
  </div>;
}
