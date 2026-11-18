import { t, translateMessage } from '../i18n';
import { Icon } from '../ui/Icon';
import type { PrintUnit } from '../state/project';
import { detectChip, detectSentence, type DetectState } from './detectState';
import { autoGenSentence } from '../autoGen/autoGenText';
import type { AutoGenCard } from '../autoGen/useAutoGen';
import { RecipeChip } from '../recipes/RecipeChip';
import type { RecipeBook } from '../recipes/recipeBook';
import { kindOfProfile } from '@mixo-geocore/host/dental/dentalKind';
import { sizeSummary, triangleSummary } from './itemSummary';
import { verdictOfDiagnosis } from './rowState';
import { rowSentence } from './rowText';
import type { ThumbCache } from './thumbnail';
import { formatBytes } from './deckBudget';
import { PurposeSelect } from '../components/PurposeSelect';
import { CardShot } from './CardShot';
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
export function ItemRow({ unit, done, willOpen, detected, thumbnails, purpose, onPurpose, lang, live, onLive, onRelease, onSelect, onOpen, onRemove, onRetry, autoGen, autoGenReady, onAutoGen, onEnlarge, recipe }: {
  unit: PrintUnit;
  /**
   * WHAT THIS CARD IS: its own answer, absent until somebody gives one.
   *
   * It is PER FILE, and this comment used to say the opposite - *"one press sets the case, a row
   * can be re-answered"* - which was the ruling for about six hours before the owner saw it on
   * screen: *"each file has a category and type, but it ask me what i am making for all files,
   * which is wrong."* An upper aligner, a lower aligner and a denture base arrive in one drop, so a
   * case-level answer is wrong for part of every mixed drop. `Set all` is the convenience that
   * keeps a stage case of thirty same-kind models to one press; it is not the question.
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
  /**
   * This is the card whose picture is LIVE. One model at a time has the deck's renderer, and the
   * page decides which, so a card can ask but never take it.
   */
  live: boolean;
  onLive: () => void;
  onRelease: () => void;
  onSelect: () => void;
  /**
   * OPEN THIS MODEL IN THE FLOW, at Step 1. The owner's card spec, 2026-11-18: *"each item has an
   * auto gen button and edit button that goes to step1"*.
   *
   * A card is a thing you act ON, so the action belongs on it. The footer's Start key still exists
   * and still opens whichever row is marked - that is the "carry on where I was" key, read from
   * across the room. This is the "that one, now" key, and a worklist needs both.
   */
  onOpen: () => void;
  onRemove: () => void;
  /** This card's auto-gen run, or `undefined` for a card that has never been in the queue. */
  autoGen: AutoGenCard | undefined;
  /**
   * Auto-gen may run on this card. The owner's ruling 4: the key appears only on a card that can use
   * it - ABSENT, not greyed - so there is nothing to explain and nothing dead to press.
   */
  autoGenReady: boolean;
  onAutoGen: () => void;
  /** Show this model on its own, full size. A look, never an editor (owner's ruling 7). */
  onEnlarge: () => void;
  /** The support recipe this card builds with, and the control that switches it (`src/recipes/`). */
  recipe: {
    book: RecipeBook; problem: boolean; selectedId: string | undefined; edited: boolean;
    /** The finished run's recipe, while it is still true of this model. */
    ranName: string | undefined;
    onChoose: (recipeId: string) => void;
  };
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
  /*
   * A DOUBT THE OPERATOR HAS ALREADY ANSWERED is stale, exactly as a missing rim is once one is
   * drawn: they went in, looked at the orientation and accepted an area, so the row must stop
   * telling them to go and look. A MESH doubt is not answered that way - nothing in the flow closes
   * a mesh - so it stands until the file itself is replaced.
   */
  const stale = detected?.kind === 'no-rim' || detected?.kind === 'failed'
    || (detected?.kind === 'check' && detected.doubts[0] !== 'mesh');
  const superseded = settled && stale;
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
  /*
   * A mesh doubt reads as a FAULT, because nothing the operator does in the flow answers it; every
   * other doubt reads as a job, because opening the model answers it.
   */
  const bad = detected?.kind === 'failed' || (detected?.kind === 'check' && detected.doubts[0] === 'mesh');
  const todo = detected?.kind === 'no-rim' || detected?.kind === 'check';
  const tone = superseded || !detected ? '' : bad ? ' detect--bad' : todo ? ' detect--todo' : '';
  const shot = thumbnails.get(unit.id)?.url;
  /*
   * A CARD WITH ITS SUPPORTS OPENS AT STEP 3, which is owner's ruling 2 and not a convenience: Step
   * 1 is the orient step, and entering a re-orient DELETES the supports already built. Opening a
   * generated card the ordinary way would destroy exactly the work the operator pressed Open to see.
   * The caller sends the session there (`App.tsx`); the key's job is to say where it goes.
   */
  /*
   * ANY ACCEPTED POLICY COUNTS, not only a two-contour one. A card whose area was PAINTED carries a
   * `legacy` policy (`src/dental/manualArea.ts`), so testing for `two-contour` sent it through the
   * Step 1 door - the one that re-orients and deletes its supports. Routing a card with supports to
   * Step 3 can only ever be the safer mistake of the two.
   */
  const built = unit.supports !== undefined && unit.dental !== undefined;
  const generating = autoGen?.kind === 'running' || autoGen?.kind === 'queued';
  /*
   * A DONE LINE MUST NOT OUTLIVE THE SUPPORTS IT DESCRIBES. Nothing expires this sitting's card
   * record, so auto-gen a model, open it, go Back to Step 1 - which re-orients and deletes the
   * supports - and the deck still said "94 supports placed" over a model with none. The unit is the
   * only honest source for whether supports exist; the card record is only how they got there.
   */
  const outlived = autoGen?.kind === 'done' && unit.supports === undefined;
  const autoGenSaid = autoGen && !outlived ? autoGenSentence(autoGen) : undefined;

  return <li
    className={`items-row${done ? ' items-row--done' : ''}${willOpen ? ' items-row--next' : ''}`}
    data-ui={`items-row-${unit.id}`}
    onClick={onSelect}
  >
    {/*
      BUSY IS DRAWN FROM THE ROW'S OWN STATE, so one card can be working while the rest sit still -
      which is exactly what a serial queue looks like and is the honest picture of it.
    */}
    <CardShot unit={unit} shot={shot} live={live} onLive={onLive} onRelease={onRelease}
      busy={detected?.kind === 'running' ? { label: translateMessage({ key: 'Checking…' }) }
        : generating ? { label: translateMessage(autoGenSaid ?? { key: 'Generating supports…' }) } : undefined} />
    {/*
      THE NAME. It was deleted by accident when the shot became `CardShot` - the edit that replaced
      the picture took the span after it as well - and for an hour the deck identified every
      imported file only by an `aria-label`, while a REFUSED file still named itself. A review
      caught it; three walk checks read `.items-row .name` and would have caught it next.
      `title` carries the whole name, because the card clips it.
    */}
    <span className="name" title={unit.name}>{unit.name}</span>
    {/*
      THE SIZE FIRST, because that is what a technician checks. Owner, 2026-11-18: *"instead of
      triangles, show dimensions and file size"*. The triangle count is a MACHINE fact - it decides
      what the case costs to hold and generate, which the deck's own budget line now says once for
      the whole case - so it moves to where a curious reader finds it rather than taking the line
      every card spends on telling a lab something about its model.

      THE FILE SIZE IS THE FILE'S, not the mesh's cost in memory - an 18.7 MB STL is ~6.4 MiB once
      welded. They are different facts: this is the one a lab recognises off a folder listing, and
      the deck's budget line says the other once for the whole case. It is absent rather than
      guessed on a unit from a project saved before `bytes` existed.
    */}
    <span className="preview" data-ui={`items-preview-${unit.id}`}
      title={translateMessage(triangleSummary(unit.source))}>
      {translateMessage(sizeSummary(unit.source))}
      {unit.file === undefined ? null : <> {'·'} {formatBytes(unit.file.bytes)}</>}
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
      THE CARD'S OWN ANSWER, and it is the question rather than a correction of one: nothing above
      asks it any more. It is the same list the entry screen's big keys draw
      (`components/purposes.ts`), so a new category or type lands in one file.

      ALWAYS DRAWN, INCLUDING ON A CARD NOBODY HAS NAMED YET - which is the card that most needs it.
      It was briefly gated on an answer already existing, a leftover from the case-level question,
      and that gate hid the control from exactly the cards it is for. `PurposeSelect` draws a
      readable "Choose…" while there is no answer and the category's picture once there is - never
      a picture standing for "no answer", which is the silent-default defect this screen exists to
      remove and which its own first fix rebuilt in miniature.

      Changing it re-runs this card's detection, because the answer is what the detector is given:
      `useBatchDetect` queues each card with the profile it was queued under.

      No `onAnyModel`: "not dental at all" is an answer about the whole drop, not about one file
      inside it, and it is offered where it can act - on the deck's Set all.
    */}
    <span className="row-purpose">
      <PurposeSelect value={purpose} lang={lang} ui={`items-purpose-${unit.id}`} onChange={onPurpose} />
      {/*
        THE RECIPE SITS WITH THE TYPE, because they are the two answers that decide what gets built -
        the type chooses the geometry rules, the recipe chooses the numbers. It appears only once the
        card has been named, for the same reason Open does: nothing can be generated before then, so
        a control that changes how it would be is noise.
      */}
      {purpose !== undefined ? <RecipeChip unitId={unit.id} book={recipe.book} problem={recipe.problem}
        selectedId={recipe.selectedId} ran={recipe.ranName}
        edited={recipe.edited} onChoose={recipe.onChoose} /> : null}
    </span>
    {/*
      ONE CELL FOR BOTH KEYS. Retry only exists on a failed row, so it was an EIGHTH child in a
      seven-column grid: the row wrapped and Remove dropped onto a second line, overlapping the row
      below. A cell that holds whatever keys the row has keeps every row exactly one line tall.
    */}
    <span className="row-actions">
    {/*
      OPEN IS GATED ON THE ANSWER, like everything else that acts through a profile. The flow is
      job-specific - a denture has no Rim step - so opening a model nobody has named would have to
      invent which chain to walk. The row's own control is a few pixels away.
    */}
    {/*
      THE RUN'S OWN LINE, inside this cell rather than as a cell of its own. The row is a fixed grid
      and an eighth child wraps it - the lesson Retry already taught here. It is also why the line is
      short: the sentence that teaches goes under the pointer.
    */}
    {/*
      A DONE CARD WHOSE PRINT ANGLE IS IN DOUBT READS AS A WARNING, not as a result. "94 supports
      placed, but no print angle held" in the same quiet green as a clean run is the one place the
      app learns its central claim failed for this model, said in the colour of success.
    */}
    {autoGenSaid && !generating ? <span className={`autogen autogen--${autoGen!.kind === 'done' && autoGen!.angleCheck !== undefined ? 'doubt' : autoGen!.kind}`}
      data-ui={`items-autogen-state-${unit.id}`} title={translateMessage(autoGenSaid)}>
      {translateMessage(autoGenSaid)}
    </span> : null}
    {/*
      AUTO-GEN: absent unless this card may use it (owner's ruling 4). What "may" means is one
      function, `src/autoGen/eligibility.ts`, and the queue asks the same one - so the key cannot
      appear on a card the queue would refuse.

      AND ABSENT WHILE THIS CARD IS IN THE QUEUE. The hook refuses a second press for the same unit,
      so leaving the key up was safe and still wrong: a control that cannot act must not look as
      though it can, and the card is already saying "Generating supports…" over its own picture.
      Found by pressing it and watching the card.
    */}
    {autoGenReady && !generating ? <button type="button" className="row-autogen" data-ui={`items-autogen-${unit.id}`}
      title={t('Orient it, find its support area and place its supports, without opening it.')}
      onClick={(event) => { event.stopPropagation(); onAutoGen(); }}>{t('Auto-gen')}</button> : null}
    {/*
      OPEN IS NOT OFFERED WHILE THIS CARD IS IN THE QUEUE. Opening it under its own run lets the
      operator turn the model with the gizmo at Step 1 while the placement is in flight - and the
      pipeline lands those tips against its OWN copy of the scene, so nothing refuses them and the
      supports belong to a pose that no longer exists. The footer's Start key can still reach the
      card, which is why `startItem` cancels as well: this is the half that stops it being offered.
    */}
    {purpose !== undefined && !generating ? <button type="button" className="row-open" data-ui={`items-open-${unit.id}`}
      title={built ? t('Open Step 3 to add, move or remove its supports.') : t('Orient it and place its supports by hand.')}
      onClick={(event) => { event.stopPropagation(); onOpen(); }}>{built ? t('Edit supports') : t('Open this model')}</button> : null}
    {detected?.kind === 'failed' ? <button type="button" className="retry" data-ui={`items-retry-${unit.id}`}
      title={t('Check this file again.')}
      onClick={(event) => { event.stopPropagation(); onRetry(); }}>{t('Retry')}</button> : null}
    {/*
      ENLARGE SITS WITH THE KEYS, not on the picture. A control drawn over the model would be in the
      way of the drag that turns it - and the picture is already a control, so a second one inside it
      would be two targets in one place.
    */}
    <button type="button" className="row-enlarge" data-ui={`items-enlarge-${unit.id}`}
      title={t('Look at this model on its own, full size.')}
      onClick={(event) => { event.stopPropagation(); onEnlarge(); }}>{t('Enlarge')}</button>
    <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
      title={t('Take this file off the list.')}
      onClick={(event) => { event.stopPropagation(); onRemove(); }}>{t('Remove')}</button>
    </span>
  </li>;
}
