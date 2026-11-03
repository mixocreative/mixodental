import { useState, type ReactNode } from 'react';
import type { JobRow } from '@mixo-geocore/host/workers/jobActivity';
import { LANGS, setLanguage, t, plural, type Lang } from '../i18n';
import { TiltDial } from '../ui/parts/TiltDial';
import { RangeField } from '../components/RangeField';
import { NumberField } from '../components/NumberField';
import { Fold } from '../components/Fold';
import { RestoreStepButton } from '../components/RestoreStepButton';
import { stagedJobBar } from '../denture/progress/StagedProgress';
import { reviewLine } from '../denture/steps/supports/reviewLineText';

/*
 * Every shared control of the app in its states, built from the real components and styled by src/styles.css
 * (entry: src/kit/main.tsx, page: kit.html). The headings and captions are notes for the designer and stay English;
 * the controls' own words go through t() and follow the language switch.
 */

/** A captioned box on the page. */
function Card({ caption, children }: { caption: string; children: ReactNode }) {
  return <div className="kit-card"><p className="kit-caption">{caption}</p>{children}</div>;
}

function Section({ title, ui, children }: { title: string; ui: string; children: ReactNode }) {
  return <section className="kit-section" data-ui={ui}><h2>{title}</h2><div className="kit-grid">{children}</div></section>;
}

/** A static job row for the staged bar (its model reads only these fields). */
function jobRow(id: number, labelKey: string, stage: string | null, state: JobRow['state'], fraction: number | null, elapsedMs: number): JobRow {
  return {
    id, label: { key: labelKey, vars: { name: 'denture' } }, stage, state, fraction, percent: fraction === null ? null : Math.round(fraction * 100), elapsedMs,
    showElapsed: true, remainingMs: null, cancellable: true, cancelling: false, blocking: false, context: null, error: null,
  };
}

/** The print-angle range of the public reference aligner: start ± 22° in 1° steps, stable 26.5–44.5°. */
const DIAL = { min: 24.4577512332, max: 68.4577512332, step: 1, band: [26.4577512332, 44.4577512332] as const };

/** The status line of denture Step 2 in one state, with its coloured dot. */
function StatusLine({ resolvable = 0, problems = 0, built = true, failed = false }: { resolvable?: number; problems?: number; built?: boolean; failed?: boolean }) {
  const line = reviewLine({ built, failed, resolvable, problems });
  return <section className={`denture-review-summary is-${line.kind}`}>
    <p className="denture-review-line" role="status">{line.other ? plural(line.n, line.key, line.other) : t(line.key)}</p>
  </section>;
}

/** A dial that turns: the catalogue's dials are live, so the drag and the arrow keys can be tried. */
function LiveDial({ start, band, size, disabled = false }: { start: number; band?: readonly [number, number]; size?: 'kit-dial-small' | 'kit-dial-large'; disabled?: boolean }) {
  const [value, setValue] = useState(start);
  const dial = <TiltDial min={DIAL.min} max={DIAL.max} step={DIAL.step} value={value} band={band} label={t('Print angle')} disabled={disabled} onChange={setValue} />;
  return <div className="print-angle">
    {band ? <p className="orient-range">{t('Stable {a}–{b}°', { a: 26.5, b: 44.5 })}</p> : null}
    {size ? <div className={size}>{dial}</div> : dial}
  </div>;
}

export function Catalogue() {
  const [lang, setLang] = useState<Lang>('en');
  const [brush, setBrush] = useState(2.5);
  const [lift, setLift] = useState(5);
  const [raft, setRaft] = useState(true);
  const [braces, setBraces] = useState(false);
  const [tool, setTool] = useState<'paint' | 'erase'>('paint');
  const [details, setDetails] = useState(true);
  const [adjust, setAdjust] = useState(false);
  const choose = (next: Lang) => { setLanguage(next); setLang(next); };
  const raftBox = <label className="check"><input type="checkbox" checked={raft} onChange={(event) => setRaft(event.target.checked)} />{t('Raft')}</label>;

  // `key={lang}`: a language switch renders every control again, so each t() reads the new language.
  return <div className="kit-page" data-ui="kit-page" key={lang}>
    <header className="kit-head">
      <h1>mixoDental UI catalogue</h1>
      <p>Edit src/styles.css, then refresh. Every control below is the real component with sample values.</p>
      <select className="lang-select" data-ui="kit-lang" aria-label="Language" value={lang} onChange={(event) => choose(event.target.value as Lang)}>
        {LANGS.map((entry) => <option key={entry.lang} value={entry.lang}>{entry.label}</option>)}
      </select>
    </header>

    <Section title="Buttons" ui="kit-buttons">
      <Card caption="primary / primary disabled">
        <div className="kit-row"><button type="button" className="primary">{t('Next')}</button><button type="button" className="primary" disabled>{t('Next')}</button></div>
      </Card>
      <Card caption="quiet (default) / quiet disabled">
        <div className="kit-row"><button type="button">{t('Back')}</button><button type="button" disabled>{t('Back')}</button></div>
      </Card>
      <Card caption="danger (destructive) / second accent (.primary.regen)">
        <div className="kit-row"><button type="button" className="danger">{t('Cancel')}</button><button type="button" className="primary regen">{t('Next')}</button></div>
      </Card>
      <Card caption="Step bar: Free transform, Restore step on / off, Back | Next">
        <button type="button" className="orient-free-btn">{t('Free transform')}</button>
        <RestoreStepButton restore={{ can: true, run: () => {} }} unique="kit-restore-on" />
        <RestoreStepButton restore={{ can: false, run: () => {} }} unique="kit-restore-off" />
        <div className="orient-row"><button type="button">{t('Back')}</button><button type="button" className="primary">{t('Next')}</button></div>
      </Card>
    </Section>

    <Section title="Sliders, toggles, checkboxes, fields" ui="kit-fields">
      <Card caption="RangeField, row layout">
        <RangeField layout="row" label="Brush size" unit="{n} mm" hint="Radius of the surface brush" min={0.5} max={10} step={0.5} value={brush} onChange={setBrush} />
      </Card>
      <Card caption="RangeField, stack layout with a band">
        <RangeField layout="stack" label="Lift height" unit="{n} mm" hint="How high the aligner stands above the plate. Supports are placed again" min={0} max={10} step={0.5} value={lift} band={[3, 6]} onChange={setLift} />
      </Card>
      <Card caption="Segmented toggle (pressed = ink fill)">
        <div className="segmented">
          <button type="button" aria-pressed={tool === 'paint'} onClick={() => setTool('paint')}>{t('Paint')}</button>
          <button type="button" aria-pressed={tool === 'erase'} onClick={() => setTool('erase')}>{t('Erase')}</button>
        </div>
      </Card>
      <Card caption="Checkboxes (.check): on, off, disabled">
        {raftBox}
        <label className="check"><input type="checkbox" checked={braces} onChange={(event) => setBraces(event.target.checked)} />{t('Cross-braces')}</label>
        <label className="check"><input type="checkbox" checked disabled readOnly />{t('Raft')}</label>
      </Card>
      <Card caption="NumberField (.field-row .number): a value, mixed values">
        <NumberField label={t('Lift height')} unit="mm" step={0.5} value={lift} limits={{ min: 0, max: 10 }} onChange={setLift} />
        <NumberField label={t('Tip size')} unit="mm" step={0.1} value={undefined} limits={{ min: 0.1, max: 1 }} onChange={() => {}} />
      </Card>
    </Section>

    <Section title="Print-angle dial" ui="kit-dial">
      <Card caption="In the stable band (44.5°)"><LiveDial start={44.4577512332} band={DIAL.band} /></Card>
      <Card caption="Outside the band (60.5°)"><LiveDial start={60.4577512332} band={DIAL.band} /></Card>
      <Card caption="At the lowest end, no stable band"><LiveDial start={DIAL.min} /></Card>
      <Card caption="Disabled"><LiveDial start={34.4577512332} band={DIAL.band} disabled /></Card>
      <Card caption="--dial-size: 120px (.kit-dial-small)"><LiveDial start={40.4577512332} band={DIAL.band} size="kit-dial-small" /></Card>
      <Card caption="--dial-size: 240px (.kit-dial-large)"><LiveDial start={50.4577512332} band={DIAL.band} size="kit-dial-large" /></Card>
    </Section>

    <Section title="Status line and its dot" ui="kit-status">
      <Card caption="ok (is-ready)"><StatusLine /></Card>
      <Card caption="warn (is-look)"><StatusLine problems={3} /></Card>
      <Card caption="problem (is-fix)"><StatusLine resolvable={2} /></Card>
      <Card caption="failed (is-failed)"><StatusLine built={false} failed /></Card>
      <Card caption="building (is-building)"><StatusLine built={false} /></Card>
    </Section>

    <Section title="Staged progress bar (static states)" ui="kit-progress">
      <Card caption="scan, running">{stagedJobBar(jobRow(1, 'Orienting {name}', 'Scanning print angles', 'determinate', 0.5, 4000))}</Card>
      <Card caption="build, routing">{stagedJobBar(jobRow(2, 'Building supports for {name}', 'Routing supports', 'determinate', 0.4, 18000))}</Card>
      <Card caption="build, done">{stagedJobBar(jobRow(3, 'Building supports for {name}', 'Checking the supports', 'done', 1, 41000))}</Card>
      <Card caption="build, failed">{stagedJobBar(jobRow(4, 'Building supports for {name}', 'Routing supports', 'failed', 0.5, 22000))}</Card>
      <Card caption="build, cancelled">{stagedJobBar(jobRow(5, 'Building supports for {name}', 'Bracing and raft', 'cancelled', 0.7, 30000))}</Card>
    </Section>

    <Section title="Panels, Details and Adjust" ui="kit-panels">
      <Card caption="Details (open) and Adjust (folded), as in denture Step 2">
        <section className="denture-review-summary is-look">
          <p className="denture-review-line" role="status">{plural(3, '1 thing to look at.', '{n} things to look at.')}</p>
          <div className="orient-row denture-review-actions">
            <button type="button" aria-expanded={details} onClick={() => setDetails(!details)}>{t(details ? 'Hide details' : 'Details')}</button>
          </div>
          {details ? <div className="denture-review-details"><p className="edit-note">{t('Passes every rule.')}</p></div> : null}
        </section>
        <Fold uiName="kit-adjust" label={t('Adjust')} open={adjust} onToggle={setAdjust}>{raftBox}</Fold>
      </Card>
      <Card caption="Side panel (.panel section with its heading band)">
        <div className="panel"><section><h3>{t('Raft')}</h3>{raftBox}</section></div>
      </Card>
    </Section>
  </div>;
}
