import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Fold } from './Fold';

describe('Fold', () => {
  it('renders its body only while open, with a named toggle', () => {
    const closed = renderToStaticMarkup(<Fold uiName="x" label="Adjust" open={false} onToggle={() => {}}><p>inside</p></Fold>);
    expect(closed).toContain('data-ui="x-toggle"');
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).not.toContain('inside');
    const open = renderToStaticMarkup(<Fold uiName="x" label="Adjust" open onToggle={() => {}}><p>inside</p></Fold>);
    expect(open).toContain('data-ui="x-body"');
    expect(open).toContain('inside');
  });
});
