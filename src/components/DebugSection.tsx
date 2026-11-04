import { t } from '../i18n';
import { Field } from './Field';
import { Panel } from './Panel';
import type { OrientationLayer } from '../dental/orientationEvidence';
import type { AngleEvidence } from '../dental/angleEvidence';
import { LAYER_LABELS, layerId, type DebugLayerStatus } from './useDebugLayers';

/*
 * The Debug section of the 3D view. Collapsed by default. Display only.
 *
 * It holds two accounts of what the app decided, because the reader has two questions:
 *   - WHICH WAY IS UP, answered by the orientation layers drawn on the model (trim chains, U ends, the
 *     bottom plane, the back arrow), each a checkbox with the colour it is drawn in;
 *   - WHY THIS ANGLE, answered by what the print-angle search measured at the angle the dial is on. The
 *     search measured all of it already and the app used to throw it away (src/dental/angleEvidence.ts).
 */

export interface DebugSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: DebugLayerStatus;
  layers: readonly OrientationLayer[];
  visible: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /** Step 1 only, and only while there is a scan to read: what was measured at the angle on the dial. */
  angle?: AngleEvidence | undefined;
}

export function swatchColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/*
 * What the print-angle search measured at the angle the dial is on: the verdict, then the numbers behind it.
 *
 * EVERY NUMBER LIVES IN THE FACTS LIST, and every piece of prose is a WHOLE SENTENCE. Both for the same
 * reason: a sentence sewn together from translated fragments ("... run from" + a number + "to" + a number)
 * puts the pieces in English word order and reads as nonsense in Chinese and Japanese, and a number buried
 * mid-sentence cannot be set in Roboto Mono without splitting the sentence again. The facts list solves
 * both - its values are always numbers, always in the mono face, and never inside a translated string.
 */
function AngleEvidenceBlock({ angle }: { angle: AngleEvidence }) {
  const verdict = angle.broken.length > 0 ? 'This angle breaks a rule.'
    : angle.robust ? 'This angle passes every rule with room to spare.'
      : 'This angle passes every rule, but only just.';
  return <div className="debug-angle" data-ui="debug-angle">
    <h4 className="debug-angle-title">{t('Why this angle')}</h4>
    <p className="debug-angle-deg"><span className="num">{angle.deg}</span>°</p>
    <p className="debug-angle-verdict" data-ui="debug-angle-verdict">{t(verdict)}</p>
    {angle.isPick ? <p className="help" data-ui="debug-angle-pick">{t('This is the angle the search itself picked.')}</p> : null}
    {angle.broken.length > 0 && <ul className="debug-angle-broken" data-ui="debug-angle-broken">
      {angle.broken.map((words) => <li key={words}>{t(words)}</li>)}
    </ul>}
    <dl className="debug-angle-facts">
      {angle.facts.map((fact) => <div key={fact.id} data-ui={`debug-angle-${fact.id}`}>
        <dt>{t(fact.label)}</dt>
        <dd><span className="num">{fact.value}</span>{fact.unit ? ` ${fact.unit}` : ''}</dd>
      </div>)}
      {angle.band ? <div data-ui="debug-angle-band">
        <dt>{t('Angles that pass with room to spare')}</dt>
        {/* No space before the degree sign, unlike "6.03 mm": a gap there reads as a separate token. */}
        <dd><span className="num">{angle.band[0]}–{angle.band[1]}</span>°</dd>
      </div> : null}
    </dl>
  </div>;
}

export default function DebugSection({ open, onOpenChange, status, layers, visible, onToggle, angle }: DebugSectionProps) {
  return <div className="debug-section">
    <Panel title={t('Debug')} ui="debug-layers" collapsible open={open} onToggle={onOpenChange}>
      {angle ? <AngleEvidenceBlock angle={angle} /> : null}
      {status === 'busy' && <p className="help">{t('Computing layers…')}</p>}
      {status === 'failed' && <p className="help">{t('The layers could not be computed for this model.')}</p>}
      {status === 'ready' && layers.map((layer) => {
        const id = layerId(layer);
        return <Field key={id} label={t(LAYER_LABELS[id] ?? layer.name)} ui={`debug-layer-${id}`} className="debug-layer">
          <span className="debug-swatch" style={{ background: swatchColor(layer.color) }} aria-hidden="true" />
          <input type="checkbox" checked={visible.has(id)} onChange={() => onToggle(id)} />
        </Field>;
      })}
      <p className="help">{t('Step 1 evidence on the model. Display only; the export never reads it.')}</p>
    </Panel>
  </div>;
}
