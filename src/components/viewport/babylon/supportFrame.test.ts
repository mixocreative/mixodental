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
 * So the guard is on the SOURCE, the way `noColourLiterals` and the i18n guard are. If a future
 * layer genuinely needs the generation frame -- the unresolved bubbles do, as DATA -- pass it in
 * rather than importing it here, and change this test with a reason beside it.
 */
describe('the Babylon view draws supports in the unit frame', () => {
  const source = Object.values(SOURCE)[0] ?? '';

  it('found the component to check', () => {
    expect(source).toContain('BabylonObjectViewport');
  });

  it('does not place anything by the generation frame', () => {
    // Comments stripped for THIS one only: the file explains the mistake in prose, and a guard that
    // fired on its own explanation would push the next person to delete the explanation.
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\bgenerationTransform\b/);
  });

  it('hangs the model and the supports off the SAME node, which is stronger than matching them', () => {
    /*
     * This assertion was changed once, on purpose, and the reason is the point of it.
     *
     * It used to count two separate `babylonPlacement(unit.transform)` calls -- one for the model,
     * one for the supports -- and check they matched. They now share a single `TransformNode`
     * carrying the unit's transform, so there is nothing left to keep in step: the supports cannot
     * disagree with the model about where the unit is, because neither of them is placed at all.
     * That is the arrangement `UnitObject` has always had with its group, and it is what the gizmo
     * moves.
     *
     * Read RAW, unlike the assertion above: no comment in that file contains these lines, and
     * stripping is what made an earlier draft of this fail against code that was plainly present.
     */
    expect(source).toContain('node.position = position');
    expect(source).toContain('mesh.parent = node');
    expect(source).toContain('supportMesh.parent = node');
    // And nothing places the support mesh itself any more.
    expect(source).not.toMatch(/supportMesh\.position\s*=/);
  });
});
