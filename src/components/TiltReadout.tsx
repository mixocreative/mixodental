import { tiltLabel } from '@mixo-geocore/host/dental/dentalTilt';
import { t } from '../i18n';

/**
 * The big print-angle number under Step 1's badge (PD.11 S5): `deg` in degrees, shown with one
 * decimal and a degree sign. The number is decoration plus a live status for screen readers.
 */
export function TiltReadout({ deg }: { deg: number }) {
  return <div className="tilt-readout" role="status" aria-label={t('Print angle')}>
    <span className="tilt-readout-num">{tiltLabel(deg)}</span>
    <span className="tilt-readout-deg">°</span>
  </div>;
}
