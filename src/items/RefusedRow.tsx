import { translateMessage } from '../i18n';
import { verdictOfRefusal, type ImportRefusal } from './rowState';
import { rowSentence } from './rowText';

/**
 * A FILE THAT NEVER BECAME A UNIT, as a row.
 *
 * It is a row and not a status line because the status line can say only ONE thing: a drop with two
 * bad files named one of them and lost the other. Being a row is also what makes two of the five row
 * sentences reachable at all (`unreadable` and `too-big`) - before this, `verdictOfRefusal` had no
 * production caller and those were text for rows that could not exist.
 *
 * It keeps the same five columns as a real row, with the picture frame and the size left EMPTY, so
 * the two kinds of row line up instead of the list stepping sideways where a refusal appears. There
 * is no Remove, because there is no unit to remove.
 *
 * Keyed by file NAME, since there is no unit id to key it by.
 */
export function RefusedRow({ name, refusal }: { name: string; refusal: ImportRefusal }) {
  const said = rowSentence(verdictOfRefusal(refusal));

  return <li className="items-row items-row--refused" data-ui={`items-row-refused-${name}`}>
    <span className="shot" data-ui={`items-shot-refused-${name}`} />
    <span className="name" title={name}>{name}</span>
    <span className="preview" data-ui={`items-preview-refused-${name}`} />
    <span className="verdict" data-ui={`items-verdict-refused-${name}`}>
      {said ? translateMessage(said) : null}
    </span>
  </li>;
}
