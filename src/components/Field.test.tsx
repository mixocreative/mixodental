import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Field } from './Field';

/** The field holds whatever control it is given, in either layout, and names every part of itself. */
describe('Field', () => {
  it('wraps its control in a label, row layout by default', () => {
    const html = renderToStaticMarkup(<Field label="Lift height" ui="lift"><input type="number" /></Field>);
    expect(html).toContain('<label class="field field--row" data-ui="lift">');
    expect(html).toContain('data-ui="lift-label"');
    expect(html).toContain('data-ui="lift-control"');
    expect(html).toContain('<input type="number"');
  });

  it('stacks the label over the control when asked', () => {
    const html = renderToStaticMarkup(<Field label="Brush size" ui="brush" layout="stack"><input type="range" /></Field>);
    expect(html).toContain('field field--stack');
    expect(html).toContain('<input type="range"');
  });

  it('is a plain row, not a label, when it only shows a value', () => {
    const html = renderToStaticMarkup(<Field label="Tips" ui="tips" readOnly>94</Field>);
    expect(html).toContain('<div class="field field--row field--read-only" data-ui="tips">');
    expect(html).not.toContain('<label');
    expect(html).toContain('94');
  });

  it('takes any control: a slider, a checkbox, a switch, a dropdown', () => {
    const controls = [
      <input key="r" type="range" />,
      <input key="c" type="checkbox" />,
      <select key="s"><option>a</option></select>,
      <button key="b" type="button" aria-pressed="true">Paint</button>,
    ];
    for (const control of controls) {
      const html = renderToStaticMarkup(<Field label="x" ui="x">{control}</Field>);
      expect(html).toContain('data-ui="x-control"');
    }
  });
});
