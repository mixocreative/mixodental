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
  const found = detectSentence(detected ?? { kind: 'waiting' });
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
    <span className="detect" data-ui={`items-detect-${unit.id}`}>
      {found ? translateMessage(found) : null}
    </span>
    <button type="button" className="danger remove" data-ui={`items-remove-${unit.id}`}
      title={t('Take this file off the list.')} onClick={onRemove}>{t('Remove')}</button>
  </li>;
}
