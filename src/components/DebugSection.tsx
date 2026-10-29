import { t } from '../i18n';
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
  return <div className="settings debug-section">
    <details open={open} onToggle={(event) => onOpenChange(event.currentTarget.open)}>
      <summary>{t('Debug')}</summary>
      {status === 'busy' && <p className="help">{t('Computing layers…')}</p>}
      {status === 'failed' && <p className="help">{t('The layers could not be computed for this model.')}</p>}
      {status === 'ready' && layers.map((layer) => {
        const id = layerId(layer);
        return <label key={id} className="check debug-layer">
          <input type="checkbox" checked={visible.has(id)} onChange={() => onToggle(id)} />
          <span className="debug-swatch" style={{ background: swatchColor(layer.color) }} aria-hidden="true" />
          {t(LAYER_LABELS[id] ?? layer.name)}
        </label>;
      })}
      <p className="help">{t('Step 1 evidence on the model. Display only; the export never reads it.')}</p>
    </details>
  </div>;
}
