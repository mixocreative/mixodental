import { t } from '../i18n';

/**
 * WHAT THE COLOURS ON THE MODEL MEAN. The dental steps paint the model in three colours that carry real
 * meaning - where supports may grow, where that area ends, and the supports themselves - and nothing on
 * screen said so. A reader could work it out by changing something and watching what moved, which is a poor
 * way to learn a clinical tool.
 *
 * Each swatch is drawn from the SAME TOKEN as the thing in the 3D scene (src/styles.css, read live by
 * `tokenColour.ts`), so the legend cannot drift from what it describes: change the token and both move.
 */
export function SceneLegend({ supports }: {
  /** Step 3 and later: the supports themselves are on screen, so they are worth naming. */
  supports?: boolean;
}) {
  return <aside className="scene-legend" data-ui="scene-legend" aria-label={t('What the colours mean')}>
    <h3 className="scene-legend-title">{t('What the colours mean')}</h3>
    <ul>
      <li><span className="scene-legend-swatch scene-legend-swatch--area" aria-hidden="true" />{t('Supports may grow here')}</li>
      <li><span className="scene-legend-swatch scene-legend-swatch--rim" aria-hidden="true" />{t('Edge of that area')}</li>
      {supports ? <li><span className="scene-legend-swatch scene-legend-swatch--support" aria-hidden="true" />{t('A support')}</li> : null}
    </ul>
  </aside>;
}
