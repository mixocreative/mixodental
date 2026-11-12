import { afterEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { JobRow } from '@mixo-geocore/host/workers/jobActivity';
import { setLanguage } from '../../i18n';
import { DENTURE_STAGE } from './stagePlans';
import { stagedJobBar } from './StagedProgress';

const row = (over: Partial<JobRow>): JobRow => ({
  id: 1, label: { key: 'Building supports for {name}', vars: { name: 'Case 1' } }, stage: null, state: 'indeterminate', fraction: null, percent: null,
  elapsedMs: 12_000, showElapsed: false, remainingMs: null, cancellable: true, cancelling: false, blocking: false, context: 'build', error: null, inline: false, ...over,
});
const html = (over: Partial<JobRow>) => renderToStaticMarkup(<>{stagedJobBar(row(over))}</>);

afterEach(() => setLanguage('en'));

describe('stagedJobBar', () => {
  it('has nothing for a job without stages', () => {
    expect(stagedJobBar(row({ label: { key: 'Importing {name}' } }))).toBeNull();
  });

  it('shows the step, the stage and the elapsed time of a build', () => {
    const out = html({ stage: DENTURE_STAGE.routing });
    expect(out).toContain('data-ui="staged-progress"');
    expect(out).toContain('data-stage="routing"');
    expect(out).toMatch(/data-ui="staged-progress-step">Step 3 of 5</);
    expect(out).toMatch(/data-ui="staged-progress-stage">Routing supports</);
    expect(out).toMatch(/data-ui="staged-progress-time">12 s</);
    expect(out).toContain('role="progressbar"');
  });

  it('says it in Japanese and Taiwan Chinese', () => {
    setLanguage('ja');
    expect(html({ stage: DENTURE_STAGE.preparing })).toContain('ステップ 2 / 5');
    setLanguage('zh-Hant');
    expect(html({ stage: DENTURE_STAGE.preparing })).toContain('步驟 2／5');
  });

  it('freezes a failed job where it stopped and fills a finished one', () => {
    expect(html({ stage: DENTURE_STAGE.placing, state: 'failed' })).toContain('data-status="failed"');
    expect(html({ stage: DENTURE_STAGE.checking, state: 'done' })).toContain('aria-valuenow="100"');
  });

  it('names the repair round beside the stage, in all three languages', () => {
    expect(html({ stage: DENTURE_STAGE.checking })).not.toContain('staged-progress-repair');
    expect(html({ stage: DENTURE_STAGE.repairing })).toMatch(/data-ui="staged-progress-repair">Repairing</);
    setLanguage('ja');
    expect(html({ stage: DENTURE_STAGE.repairing })).toContain('>修復中<');
    setLanguage('zh-Hant');
    expect(html({ stage: DENTURE_STAGE.repairing })).toContain('>修復中<');
  });

  it('tells a cancel in progress', () => {
    expect(html({ stage: DENTURE_STAGE.routing, cancelling: true })).toMatch(/data-ui="staged-progress-stage">Cancelling…</);
  });

  it('stages the scan too', () => {
    expect(html({ label: { key: 'Orienting {name}' }, stage: DENTURE_STAGE.scanning, fraction: 0.5 })).toMatch(/Step 2 of 2</);
  });
});
