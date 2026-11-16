import { describe, expect, it } from 'vitest';

const SOURCE = import.meta.glob<string>('../../BabylonObjectViewport.tsx', { query: '?raw', import: 'default', eager: true });

/*
 * ONE RULE, AND IT IS HERE BECAUSE I BROKE IT AND ARGUED FOR THE BREAKAGE.
 *
 * The Babylon view drew support bodies at `generationTransform(unit)` for several commits, with a
 * confident comment at the line calling the alternative "a lie about where the printed supports
 * will be". It was backwards: `UnitObject` puts ONE group at `unit.transform` and draws the model
 * AND `SupportBodies` inside it, and `SupportBodies` applies no transform of its own. Support
 * geometry is unit-local, so the bodies are rigidly attached and travel with the model.
 * `generationTransform` is DATA -- the frame they were generated in, for code that reasons about
 * it -- and never a draw position.
 *
 * Nothing caught it. The suite did not, because no unit test renders this component; the walk did
 * not, because no check moves a model that already has supports. It would have shipped as
 * "supports stay behind when you drag a model".
 *
 * So the guard is on the SOURCE, the way `noColourLiterals` and the i18n guard are: this file may
 * not reach for the generation frame at all. If a future layer genuinely needs it -- the unresolved
 * bubbles do, as DATA -- pass it in rather than importing it here, and change this test with a
 * reason beside it.
 */
describe('the Babylon view draws supports in the unit frame', () => {
  const source = Object.values(SOURCE)[0] ?? '';

  it('found the component to check', () => {
    expect(source).toContain('BabylonObjectViewport');
  });

  it('does not place anything by the generation frame', () => {
    // Comments are stripped first: the file EXPLAINS this mistake in prose, and a guard that fired
    // on its own explanation would push the next person to delete the explanation.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\bgenerationTransform\b/);
  });

  it('places the supports by the unit transform, the same one the model uses', () => {
    // Both the model and the support mesh take `babylonPlacement(unit.transform)`. If one of them
    // ever takes something else, this count drops and the next person is told why here.
    const placements = source.match(/babylonPlacement\(unit\.transform\)/g) ?? [];
    expect(placements.length).toBeGreaterThanOrEqual(2);
  });
});
