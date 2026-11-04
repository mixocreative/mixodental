import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChoiceKey } from './ChoiceKey';

describe('ChoiceKey', () => {
  it('is one key: the art, the word, and its stable name', () => {
    const html = renderToStaticMarkup(<ChoiceKey icon="aligner" label="Aligner" ui="start-aligner" onChoose={() => {}} />);
    expect(html).toContain('class="choice-key"');
    expect(html).toContain('data-ui="start-aligner"');
    expect(html).toContain('Aligner');
    expect(html).toContain('choice-key-art');
  });

  it('carries a line under the word only when it is given one', () => {
    const bare = renderToStaticMarkup(<ChoiceKey icon="aligner" label="Aligner" ui="a" onChoose={() => {}} />);
    expect(bare).not.toContain('choice-key-note');
    const noted = renderToStaticMarkup(<ChoiceKey icon="aligner" label="Reference aligner" note="U-shaped, supported along its lower rim." ui="a" onChoose={() => {}} />);
    expect(noted).toContain('U-shaped, supported along its lower rim.');
  });

  // A key that merely goes somewhere must not claim to be a toggle: `aria-pressed="false"` on the start
  // screen would tell a screen reader there are three switches, all off, instead of three ways to begin.
  it('is only a pressed thing when it stays chosen', () => {
    expect(renderToStaticMarkup(<ChoiceKey icon="aligner" label="Aligner" ui="a" onChoose={() => {}} />))
      .not.toContain('aria-pressed');
    expect(renderToStaticMarkup(<ChoiceKey icon="aligner" label="Aligner" ui="a" pressed={false} onChoose={() => {}} />))
      .toContain('aria-pressed="false"');
    expect(renderToStaticMarkup(<ChoiceKey icon="aligner" label="Aligner" ui="a" pressed onChoose={() => {}} />))
      .toContain('aria-pressed="true"');
  });
});
