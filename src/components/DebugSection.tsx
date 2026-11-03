import { t } from '../i18n';
import { Field } from './Field';
import { Panel } from './Panel';
import type { OrientationLayer } from '../dental/orientationEvidence';
import { LAYER_LABELS, layerId, type DebugLayerStatus } from './useDebugLayers';

/* The Debug section of the 3D view: the Step 1 evidence layers, each a checkbox with its colour. Collapsed by default. Display only. */

export interface DebugSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: DebugLayerStatus;
  layers: readonly OrientationLayer[];
  visible: ReadonlySet<string>;
  onToggle: (id: string) => void;
}

export function swatchColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export default function DebugSection({ open, onOpenChange, status, layers, visible, onToggle }: DebugSectionProps) {
  return <div className="debug-section">
    <Panel title={t('Debug')} ui="debug-layers" collapsible open={open} onToggle={onOpenChange}>
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
