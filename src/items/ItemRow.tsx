import { t, translateMessage } from '../i18n';
import { Icon } from '../ui/Icon';
import type { PrintUnit } from '../state/project';
import { detectChip, detectSentence, type DetectState } from './detectState';
import { kindOfProfile } from '@mixo-geocore/host/dental/dentalKind';
import { sizeSummary, triangleSummary } from './itemSummary';
import { verdictOfDiagnosis } from './rowState';
import { rowSentence } from './rowText';
import { THUMB_SIZE, type ThumbCache } from './thumbnail';
import { PurposeSelect } from '../components/PurposeSelect';
import type { Lang } from '../i18n';

/**
 * ONE MODEL'S ROW: its picture, its name, its size, and the two independent answers about it.
 *
 * The row works out its own sentences rather than being handed them. A row is the thing that knows
 * what a row says, so `ItemsPage` is left as layout and the two can be read apart — which was the
 * point of lifting this out of the page.
 *
 * THE TWO ANSWERS ARE KEPT APART, and `src/items/README.md` says why at length: `verdict` is whether
 * the MESH is sound (from the import diagnosis), `detect` is which way UP it is (from the batch).
 * A trimmed arch is a healthy mesh with no rim, so one can be fine while the other has nothing to
 * offer; collapsing them would have to pick which of the two facts to drop.
 *
 * Every part is named for the UNIT, never for the row's position: `items-row-3` would re-point every
 * later row the moment one is removed.
 */
export function ItemRow({ unit, done, willOpen, detected, thumbnails, purpose, onPurpose, lang, onSelect, onRemove, onRetry }: {
  unit: PrintUnit;
  /**
   * WHAT THIS ROW IS, which is the case's answer unless this row was re-answered.
   *
   * The owner's ruling of 2026-11-18: *one press sets the case, a row can be re-answered.* A stage
   * case is 10-30 models of one kind, so asking per file would be twenty-four presses to say one
   * word - but a mixed drop (upper, lower, a night guard, a denture base) is ordinary, and the ROW
   * is where a wrong answer shows itself: "No rim found. Draw one to continue." on an object whose
   * rail has no Rim button at all. The control is therefore on the row that is complaining.
   */
  purpose: string | undefined;
  /** Re-answer this one row. The caller re-runs its detection under the new answer. */
  onPurpose: (profile: string) => void;
  lang: Lang;
  /** Already through the flow: the row dims rather than disappearing. */
  done: boolean;
  /** Try this row's detection again; shown only on a row whose detection failed. */
  onRetry: () => void;
  /**
   * This is the row the footer's Start will open. It was `onRail` - the row the tool rail acted on -
   * until the rail was removed from the deck (owner, 2026-11-18). The highlight outlived it because
   * what it marks was never really about the rail: on a case of thirty, the one row a press is about
   * has to be visible from across the room.
   */
  willOpen: boolean;
  detected: DetectState | undefined;
  thumbnails: ThumbCache;
  onSelect: () => void;
  onRemove: () => void;
}) {
  // No verdict means the unit never went through the import worker, or predates the verdict. The row
  // then shows its size and says nothing about health, which is the honest gap.
  /*
   * A SOUND MESH SAYS NOTHING, which is the same rule the "Waiting its turn…" lines already follow
   * and for the same reason: twenty-four rows reading "Ready to print." is how little is wrong said
   * twenty-four times, and the footer's tally already counts the ones that are not. The row is a
   * line in a worklist, so it earns its height only when it has something to report.
   *
   * The two answers are still KEPT APART (`src/items/README.md`): this drops a benign verdict, never
   * the detect line beside it, and a verdict that needs a look is shown in full.
   */
  const health = unit.diagnosis ? verdictOfDiagnosis(unit.diagnosis) : undefined;
  const verdict = health && health.state !== 'clean' ? rowSentence(health) : undefined;
  /*
   * A DETECT SENTENCE CAN GO OUT OF DATE, and two of them are INSTRUCTIONS. "No rim found. Draw one
   * to continue." and the failure line come from the batch's map, which is never written again - so a
   * row whose rim the operator had since drawn by hand still told them to draw it, while the rail
   * beside it (which reads the unit) said the rim was there. Two surfaces on one row, disagreeing,
   * and the instruction was the wrong one of the two.
   *
   * Only those two are superseded. "Already upright." stays true however far the row has progressed.
   */
  const settled = unit.rimDraft?.closed === true || unit.dental !== undefined || unit.denture !== undefined;
  const superseded = settled && (detected?.kind === 'no-rim' || detected?.kind === 'failed');
  /*
   * NO STATE AT ALL IS NOT "WAITING ITS TURN", and this defaulted to saying it was.
   *
   * That default was true while the deck only ever opened with a purpose already chosen: every row
   * was queued in the same tick the page mounted, so an absent state meant "queued, about to be
   * written". Since the deck took over the purpose question (2026-11-18) it opens with NOTHING
   * queued and nothing queueable - the detector needs the answer - so every row claimed to be
   * waiting in a queue that did not exist. The question above is what the operator is waiting on,
   * and the screen already says so; the row's job here is to be quiet about a check that has not
   * been asked for.
   */
  const kind = kindOfProfile(purpose) ?? 'aligner';
  const found = superseded || detected === undefined ? undefined : detectSentence(detected, kind);
  /**
   * What the row SHOWS; `found` is what it says under the pointer.
   *
   * A DENTURE NAMED BUT NOT CHECKED still says something. The batch is the aligner's detector and
   * skips dentures on purpose (`useBatchDetect`), so such a row has no detect state at all - and a
   * named row that says nothing is indistinguishable from one nobody has named. It is oriented by
   * its own step when opened, so "needs orienting" is exactly true.
   */
  const chip = superseded ? undefined
    : detected === undefined
      ? (purpose !== undefined && kind === 'denture' ? { key: 'Needs orienting' } : undefined)
      : detectChip(detected, kind);
  /*
   * TROUBLE MUST NOT LOOK LIKE SUCCESS. Every detect line rendered in the same muted grey, so
   * "Already upright." and "Could not check the orientation." were indistinguishable at a glance -
   * with eight rows the operator had to read all eight. Two tones, because the two states are not the
   * same thing: a rim that was not found needs the operator (a job, not an error), and a check that
   * could not run is a fault.
   */
  const tone = superseded || !detected ? '' : detected.kind === 'failed' ? ' detect--bad' : detected.kind === 'no-rim' ? ' detect--todo' : '';
  const shot = thumbnails.get(unit.id)?.url;

  return <li
    className={`items-row${done ? ' items-row--done' : ''}${willOpen ? ' items-row--next' : ''}`}
    data-ui={`items-row-${unit.id}`}
    onClick={onSelect}
  >
    <span className="shot" data-ui={`items-shot-${unit.id}`}>
      {/*
        The model as it is PLACED, so the row shows the orientation the batch just reported. It is
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
    {/*
      HEALTH AS A MARK, NOT A SENTENCE. A sound mesh shows nothing at all; one worth a look shows a
      warning glyph carrying the full sentence under the pointer. It stays SEPARATE from the chip
      beside it - the two are independent answers (`src/items/README.md`), and a trimmed arch is a
      healthy mesh with no rim, so one can be fine while the other has something to say.
    */}
    <span className="verdict" data-ui={`items-verdict-${unit.id}`} title={verdict ? translateMessage(verdict) : undefined}>
      {verdict ? <Icon name="warning" className="verdict-mark" /> : null}
    </span>
    {/*
      A ROW THAT IS ONLY WAITING SAYS NOTHING, because the footer now says it once for the whole
      case. The aggregate line was added beside these rather than in place of them, so a case of
      twenty-four still read "Checking 3 of 24" over one "Checking…" and twenty-three "Waiting its
      turn…" - which is the noise the aggregate was for. `running` stays: that one names the row
      the robot is actually on, which the ordinal cannot.
    */}
    {/*
      THE CHIP, WITH THE SENTENCE UNDER THE POINTER. The sentence is still the thing that teaches -
      "No rim found. Draw one to continue." - and it is still what the rail says in full for the row
      being worked on. On a line in a list of thirty it is two words.
    */}
    <span className={`detect${tone}`} data-ui={`items-detect-${unit.id}`}
      title={found ? translateMessage(found) : undefined}>
      {chip ? translateMessage(chip) : null}
    </span>
    {/*
      REMOVE MUST NOT ALSO SELECT. This button sits inside the row's own `onClick`, so without
      `stopPropagation` a press removed the unit and then dispatched a selection for the id that had
      just gone - leaving the scene's active unit pointing at nothing, which switches a live dental
      session off (`editing/session.ts` reads `event.id` to decide the mode). The reducer now guards
      the same invariant, so this is the local half of a fix that is made in two places on purpose.
    */}
    {/*
      A FAILED ROW GETS THE WAY BACK IT NEVER HAD. `useBatchDetect` only ever grew its started set,
      so a row whose orientation check failed was never queued again - and the row's own line named
      no next action, which is the rule `src/deck/README.md` holds every greyed or stuck control to.
      Only on `failed`: `no-rim` is not a failure, it is the ordinary answer for a trimmed arch and
      its line already says to draw one.
    */}
    {/*
      THE ROW'S OWN ANSWER. A native `<select>` and not keys: twenty-four rows of pictures would be a
      wall, and this is a correction rather than the question - the question was asked once, above.
      It is the same list the big keys draw (`components/purposes.ts`), so question 4 lands in one
      file. Changing it re-runs this row's detection, because the answer is what the detector is
      given: `useBatchDetect` queues each row with the profile it was queued under.
    */}
    {/*
      NOT DRAWN BEFORE THE CASE IS ANSWERED, and that is the same rule as everywhere else on this
      screen. A select has to show one of its options, so an unanswered row would read "Aligner" -
      a default the operator never chose, displayed as though they had. That is the entry defect in
      miniature, and it is the reason this whole screen exists.
    */}
    {/*
      ALWAYS DRAWN, INCLUDING ON A ROW NOBODY HAS NAMED YET - which is the row that most needs it.
      It was gated on an answer existing, a leftover from the case-level question that used to gate
      the whole screen; with the answer per file (owner, 2026-11-18) that gate hid the control from
      exactly the rows it is for. `PurposeSelect` draws a readable "Choose…" dropdown while there is
      no answer and the category's picture once there is.

      No `onAnyModel`: "not dental at all" is an answer about the whole drop, not about one row
      inside it, and it is offered where it can act - on the deck's Set all.
    */}
    <span className="row-purpose">
      <PurposeSelect value={purpose} lang={lang} ui={`items-purpose-${unit.id}`} onChange={onPurpose} />
    </span>
    {/*
      ONE CELL FOR BOTH KEYS. Retry only exists on a failed row, so it was an EIGHTH child in a
      seven-column grid: the row wrapped and Remove dropped onto a second line, overlapping the row
      below. A cell that holds whatever keys the row has keeps every row exactly one line tall.
    */}
    <span className="row-actions">
    {detected?.kind === 'failed' ? <button type="button" className="retry" data-ui={`items-retry-${unit.id}`}
      title={t('Check this file again.')}
      onClick={(event) => { event.stopPropagation(); onRetry(); }}>{t('Retry')}</button> : null}
    <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
      title={t('Take this file off the list.')}
      onClick={(event) => { event.stopPropagation(); onRemove(); }}>{t('Remove')}</button>
    </span>
  </li>;
}
