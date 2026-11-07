import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ToolRail } from './ToolRail';
import type { ToolFacts } from './toolState';

const fresh: ToolFacts = { oriented: false, hasRim: false, areaAccepted: false };
const ready: ToolFacts = { oriented: true, hasRim: true, areaAccepted: true };
const render = (facts: ToolFacts, current?: Parameters<typeof ToolRail>[0]['current']) =>
  renderToStaticMarkup(<ToolRail facts={facts} {...(current ? { current } : {})} onPick={() => {}} />);

describe('the tool rail', () => {
  it('draws all four tools, each named for its tool', () => {
    const html = render(fresh);
    for (const tool of ['orient', 'rim', 'area', 'supports']) expect(html).toContain(`data-ui="tool-${tool}"`);
  });

  it('disables the tools whose prerequisite is missing, and only those', () => {
    const html = render(fresh);
    // Orient is never withheld; the three below it are. (A `data-ui="tool-orient"[^>]*>` assertion
    // used to sit here too and said nothing: it cannot fail while the button exists at all.)
    expect(html).not.toMatch(/data-ui="tool-orient"[^>]*disabled/);
    for (const tool of ['rim', 'area', 'supports']) expect(html).toMatch(new RegExp(`data-ui="tool-${tool}"[^>]*disabled`));
  });

  /*
   * THE RULE THIS PROTECTS: a disabled control with no explanation is worse than a step. The line is
   * on the page, not only in a title, because a title is invisible on a touch screen.
   */
  it('shows the next thing to do as text on the page', () => {
    expect(render(fresh)).toContain('data-ui="tool-reason"');
    expect(render(fresh)).toMatch(/right way up/i);
  });

  it('drops the line when every tool is open, rather than leaving a stale instruction', () => {
    expect(render(ready)).not.toContain('data-ui="tool-reason"');
  });

  /*
   * RULE 2: greyed and busy must not resemble each other. A busy tool is PRESSABLE - the operator
   * opens it and sees progress. Disable it and they meet grey and conclude it failed.
   */
  it('leaves a busy tool pressable, and marks it as busy rather than greying it', () => {
    const html = render({ ...ready, busy: 'supports' });
    expect(html).toMatch(/data-ui="tool-supports"[^>]*tool--busy/);
    expect(html).not.toMatch(/data-ui="tool-supports"[^>]*disabled/);
  });

  it('leaves a stale tool pressable too, because its work is still there', () => {
    const html = render({ ...ready, stale: ['supports'] });
    expect(html).toMatch(/data-ui="tool-supports"[^>]*tool--stale/);
    expect(html).not.toMatch(/data-ui="tool-supports"[^>]*disabled/);
  });

  it('tells busy and stale apart in the markup, so they cannot be styled alike by accident', () => {
    expect(render({ ...ready, busy: 'supports' })).not.toContain('tool--stale');
    expect(render({ ...ready, stale: ['supports'] })).not.toContain('tool--busy');
  });

  /*
   * THE CASE THE CLAIM IS ACTUALLY ABOUT: a tool rebuilding after a change is BOTH. Rendering the
   * two separately, as the test above does, only catches a `look()` that emitted both class names
   * for one state - it never exercises the state where the rule has to choose.
   */
  it('shows a tool that is busy AND stale as busy, with no stale mark left on it', () => {
    const html = render({ ...ready, busy: 'supports', stale: ['supports'] });
    expect(html).toMatch(/data-ui="tool-supports"[^>]*tool--busy/);
    expect(html).not.toContain('tool--stale');
    expect(html).not.toMatch(/data-ui="tool-supports"[^>]*disabled/);
  });

  it('marks the open tool as pressed, which is what the ink fill is drawn from', () => {
    expect(render(ready, 'area')).toMatch(/data-ui="tool-area"[^>]*aria-pressed="true"/);
    expect(render(ready, 'area')).toMatch(/data-ui="tool-orient"[^>]*aria-pressed="false"/);
  });

  it('gives a greyed tool its own reason in a title as well, since the line covers only the next one', () => {
    expect(render(fresh)).toMatch(/data-ui="tool-supports"[^>]*title="[^"]*support area/i);
  });
});
