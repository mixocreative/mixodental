import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Panel } from './Panel';

/** The four shapes a panel comes in, plus the names every one of them carries. */
describe('Panel', () => {
  it('is a heading and a body when it does not collapse', () => {
    const html = renderToStaticMarkup(<Panel ui="x" title="Raft"><p>inside</p></Panel>);
    expect(html).toContain('data-ui="x"');
    expect(html).toContain('<h3 class="panel-widget-title" id="x-title" data-ui="x-title">Raft</h3>');
    expect(html).toContain('data-ui="x-body"');
    expect(html).toContain('inside');
    expect(html).not.toContain('aria-expanded');
  });

  it('ignores defaultOpen when it does not collapse, because there is nothing to open', () => {
    const html = renderToStaticMarkup(<Panel ui="x" title="Raft" defaultOpen={false}><p>inside</p></Panel>);
    expect(html).toContain('inside');
  });

  it('collapses from a title button, open by default', () => {
    const html = renderToStaticMarkup(<Panel ui="x" title="Adjust" collapsible><p>inside</p></Panel>);
    expect(html).toContain('data-ui="x-title"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="x-body"');
    expect(html).toContain('inside');
    expect(html).toContain('panel-widget is-open');
  });

  it('starts closed on defaultOpen false, and does not render the body', () => {
    const html = renderToStaticMarkup(<Panel ui="x" title="Adjust" collapsible defaultOpen={false}><p>inside</p></Panel>);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('inside');
    expect(html).not.toContain('is-open');
  });

  it('names itself from its own title, so the region is never named twice', () => {
    const plain = renderToStaticMarkup(<Panel ui="x" title="Raft"><p>inside</p></Panel>);
    expect(plain).toContain('aria-labelledby="x-title"');
    const folding = renderToStaticMarkup(<Panel ui="x" title="Adjust" collapsible><p>inside</p></Panel>);
    expect(folding).toContain('aria-labelledby="x-title"');
    expect(folding).toContain('id="x-title"');
  });

  it('takes a class for where it sits, and says when its contents are on their way', () => {
    const html = renderToStaticMarkup(<Panel ui="x" title="Problems" className="denture-parts" busy><p>inside</p></Panel>);
    expect(html).toContain('class="panel-widget is-open is-stale denture-parts"');
    expect(html).toContain('aria-busy="true"');
    const settled = renderToStaticMarkup(<Panel ui="x" title="Problems"><p>inside</p></Panel>);
    expect(settled).not.toContain('aria-busy');
    expect(settled).not.toContain('is-stale');
  });

  it('takes the open state from the caller when it is given one', () => {
    const closed = renderToStaticMarkup(<Panel ui="x" title="Adjust" collapsible defaultOpen open={false} onToggle={() => {}}><p>inside</p></Panel>);
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).not.toContain('inside');
    const open = renderToStaticMarkup(<Panel ui="x" title="Adjust" collapsible defaultOpen={false} open onToggle={() => {}}><p>inside</p></Panel>);
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('inside');
  });
});
