import { t, translateMessage } from '../i18n';
import type { PrintUnit } from '../state/project';
import { detectSentence, type DetectState } from './detectState';
import { sizeSummary, triangleSummary } from './itemSummary';
import { verdictOfDiagnosis } from './rowState';
import { rowSentence } from './rowText';
import { THUMB_SIZE, type ThumbCache } from './thumbnail';

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
export function ItemRow({ unit, done, onRail, detected, thumbnails, onSelect, onRemove }: {
  unit: PrintUnit;
  /** Already through the flow: the row dims rather than disappearing. */
  done: boolean;
  /** This is the row the rail acts on. Not "visible" - every row is visible. */
  onRail: boolean;
  detected: DetectState | undefined;
  thumbnails: ThumbCache;
  onSelect: () => void;
  onRemove: () => void;
}) {
  // No verdict means the unit never went through the import worker, or predates the verdict. The row
  // then shows its size and says nothing about health, which is the honest gap.
  const verdict = unit.diagnosis ? rowSentence(verdictOfDiagnosis(unit.diagnosis)) : undefined;
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
  const found = superseded ? undefined : detectSentence(detected ?? { kind: 'waiting' });
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
    className={`items-row${done ? ' items-row--done' : ''}${onRail ? ' items-row--on-rail' : ''}`}
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
    <span className="verdict" data-ui={`items-verdict-${unit.id}`}>
      {verdict ? translateMessage(verdict) : null}
    </span>
    <span className={`detect${tone}`} data-ui={`items-detect-${unit.id}`}>
      {found ? translateMessage(found) : null}
    </span>
    {/*
      REMOVE MUST NOT ALSO SELECT. This button sits inside the row's own `onClick`, so without
      `stopPropagation` a press removed the unit and then dispatched a selection for the id that had
      just gone - leaving the scene's active unit pointing at nothing, which switches a live dental
      session off (`editing/session.ts` reads `event.id` to decide the mode). The reducer now guards
      the same invariant, so this is the local half of a fix that is made in two places on purpose.
    */}
    <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
      title={t('Take this file off the list.')}
      onClick={(event) => { event.stopPropagation(); onRemove(); }}>{t('Remove')}</button>
  </li>;
}
