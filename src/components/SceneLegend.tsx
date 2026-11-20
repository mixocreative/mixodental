import { t } from '../i18n';

/** One row of the legend: a colour the scene is drawing right now. */
export type LegendRow = 'area' | 'rim' | 'tip';

/**
 * WHICH COLOURS ARE ON THE MODEL IN THIS STEP - the legend lists those and nothing else.
 *
 * It used to list the area and its edge in every dental step, whatever was drawn. Step 3 draws neither
 * (`dentalArea` is a Step 2 prop in `App.tsx`) and its supports are teal BODIES, not the orange tip cones
 * the "A support" swatch shows, so at Step 3 the legend named three colours the operator could not find
 * (app UX review 2026-11-21, finding 11, walk shot x14). The rule follows the viewport's own props:
 *   - Step 1 draws the area and its edge only when there is an area preview, and tip cones only when
 *     its tip preview is out;
 *   - rim define mode draws the rim, in the edge colour (`DentalRimOutline`);
 *   - Step 2 draws all three;
 *   - Step 3 draws none of them, so it has no legend at all.
 */
export function legendRows(at: {
  /** Rim define mode is its own stage, `rim` (src/dental/editingMode.ts) - not a flag on Step 1. */
  stage: 'aligner' | 'rim' | 'area' | 'review';
  areaPreview: boolean;
  tips: boolean;
}): LegendRow[] {
  if (at.stage === 'review') return [];
  if (at.stage === 'area') return ['area', 'rim', 'tip'];
  if (at.stage === 'rim') return ['rim'];
  return [...(at.areaPreview ? ['area', 'rim'] as const : []), ...(at.tips ? ['tip'] as const : [])];
}

const ROW_TEXT: Record<LegendRow, string> = {
  area: 'Supports may grow here',
  rim: 'Edge of that area',
  tip: 'A support',
};

/**
 * WHAT THE COLOURS ON THE MODEL MEAN. The dental steps paint the model in three colours that carry real
 * meaning - where supports may grow, where that area ends, and the supports themselves - and nothing on
 * screen said so. A reader could work it out by changing something and watching what moved, which is a poor
 * way to learn a clinical tool.
 *
 * Each swatch is drawn from the SAME TOKEN as the thing in the 3D scene (src/styles.css, read live by
 * `tokenColour.ts`), so the legend cannot drift from what it describes: change the token and both move.
 */
export function SceneLegend({ rows }: { rows: readonly LegendRow[] }) {
  if (rows.length === 0) return null;
  return <aside className="scene-legend" data-ui="scene-legend" aria-label={t('What the colours mean')}>
    <h3 className="scene-legend-title">{t('What the colours mean')}</h3>
    <ul>
      {rows.map((row) => <li key={row}>
        <span className={`scene-legend-swatch scene-legend-swatch--${row === 'tip' ? 'support' : row}`} aria-hidden="true" />{t(ROW_TEXT[row])}
      </li>)}
    </ul>
  </aside>;
}
