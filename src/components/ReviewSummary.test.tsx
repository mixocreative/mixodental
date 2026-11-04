import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReviewSummary } from './ReviewSummary';

/** The verdict of a supports step: the same shape for both steps, named per step. */
describe('ReviewSummary', () => {
  const open = { open: false, onToggle: () => {} };

  it('leads with the verdict and colours its dot by tone', () => {
    const html = renderToStaticMarkup(<ReviewSummary kind="aligner" tone="ready" line="Supports ready." {...open} />);
    expect(html).toContain('class="review-summary is-ready"');
    expect(html).toContain('data-ui="aligner-review-line"');
    expect(html).toContain('Supports ready.');
    expect(html).toContain('role="status"');
  });

  it('names its parts after the step it is in', () => {
    const html = renderToStaticMarkup(<ReviewSummary kind="denture" tone="look" line="1 thing to look at." {...open} />);
    for (const name of ['denture-review-summary', 'denture-review-line', 'denture-review-details-toggle']) expect(html).toContain(`data-ui="${name}"`);
  });

  it('keeps the evidence behind Details, and shows it when Details is open', () => {
    const shut = renderToStaticMarkup(<ReviewSummary kind="aligner" tone="look" line="1 thing to look at." {...open}><p>the evidence</p></ReviewSummary>);
    expect(shut).toContain('aria-expanded="false"');
    expect(shut).toContain('>Details<');
    expect(shut).not.toContain('the evidence');
    const shown = renderToStaticMarkup(<ReviewSummary kind="aligner" tone="look" line="1 thing to look at." open onToggle={() => {}}><p>the evidence</p></ReviewSummary>);
    expect(shown).toContain('aria-expanded="true"');
    expect(shown).toContain('>Hide details<');
    expect(shown).toContain('the evidence');
  });

  it('offers no Details while the build is still running, because there is nothing to show', () => {
    const html = renderToStaticMarkup(<ReviewSummary kind="aligner" tone="building" line="Building supports…"><p>the evidence</p></ReviewSummary>);
    expect(html).toContain('Building supports');
    expect(html).not.toContain('Details');
    expect(html).not.toContain('the evidence');
  });

  it('carries the one action that answers the line, beside Details', () => {
    const html = renderToStaticMarkup(<ReviewSummary kind="denture" tone="fix" line="2 spots need a support." {...open} action={<button type="button">Fix</button>} />);
    expect(html).toContain('>Fix<');
    expect(html.indexOf('>Fix<')).toBeLessThan(html.indexOf('>Details<'));
  });

  it('always says whether it is waiting, so a watcher can see the verdict settle', () => {
    expect(renderToStaticMarkup(<ReviewSummary kind="aligner" tone="look" line="x" stale {...open} />)).toContain('aria-busy="true"');
    expect(renderToStaticMarkup(<ReviewSummary kind="aligner" tone="ready" line="x" {...open} />)).toContain('aria-busy="false"');
  });

  it('dims while a verdict is on its way, but never while it is still building', () => {
    expect(renderToStaticMarkup(<ReviewSummary kind="aligner" tone="look" line="x" stale {...open} />)).toContain('is-look is-stale');
    expect(renderToStaticMarkup(<ReviewSummary kind="aligner" tone="building" line="x" stale />)).not.toContain('is-stale');
  });
});
