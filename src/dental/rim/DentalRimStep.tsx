import type { CommandId, UiState } from '@mixo-geocore/editing/commands';
import { resolve } from '@mixo-geocore/editing/commands';
import { CommandButton } from '../../components/CommandButton';
import { Panel } from '../../components/Panel';
import { Segmented } from '../../components/Segmented';
import { Icon } from '../../ui/Icon';
import { plural, t } from '../../i18n';
import { rimCountText, rimDoneReason } from './rimStepText';
import type { DentalRimTool } from '../editingMode';

/*
 * The dock of rim define mode: the Step 1 detour where the operator draws the rim detection could not find.
 *
 * Built the way Step 1 and Step 2's docks are - titled `Panel` widgets, a readout in the mono face, prose
 * ranged left - and ordered the way a tool mode is: the tool in hand, then what has been drawn, then the
 * keys that act on it, with Done as the step's one primary at the foot.
 *
 * Everything it shows comes from `ui` and the command registry, so the labels, hints, shortcuts and
 * disabled reasons are the registry's in every language, and this file holds no wording of its own
 * (`rimStepText.ts` has the sentences).
 */

const RIM_TOOLS: readonly DentalRimTool[] = ['place', 'adjust'];

export function DentalRimStep({ ui, run }: { ui: UiState; run: (id: CommandId) => void }) {
  const anchors = ui.dentalRimAnchors ?? 0;
  const closed = ui.dentalRimClosed ?? false;
  const count = rimCountText(anchors, closed);
  // Why Done is off, said once here as well as on the key, because the reason is the step's whole state.
  const blocked = rimDoneReason(ui);

  return <aside className="dental-side" data-ui="dental-rim-panel" aria-label={t('Define the rim')}>
    <div className="dental-scroll">
      <Panel title={t('Tool')} ui="rim-tool">
        <div className="edit-row">
          <Segmented label={t('Rim tools')} value={ui.dentalRimTool ?? 'place'} onChange={(tool) => run(`dental.rim.${tool}` as CommandId)}
            options={RIM_TOOLS.map((tool) => {
              const command = resolve(`dental.rim.${tool}` as CommandId, ui);
              /*
               * Words, no icon. Step 2's tools carry one because `tool-<name>.svg` already draws each of
               * them; Place and Adjust have no drawing yet, and a borrowed icon would say the wrong thing
               * about the gesture. Two short words in the operator's language are clearer than either.
               */
              return { value: tool, label: t(command.label), hint: command.hint, ...(command.shortcut ? { shortcut: command.shortcut } : {}) };
            })} />
        </div>
      </Panel>

      <Panel title={t('The rim')} ui="rim-shape">
        {/* The count is a READOUT, in the mono face, like every other number the docks report. */}
        <output className="edit-count" data-ui="rim-point-count">{plural(count.n, count.key, count.other ?? count.key)}</output>
        <div className="edit-row">
          {(['dental.rim.close', 'dental.rim.clear'] as const)
            .map((id) => resolve(id, ui))
            .filter((command) => command.visible)
            .map((command) => <CommandButton key={command.id} command={command} run={run} />)}
        </div>
        {/*
          The refusal, in words, where the reader is looking - not only as a tooltip on a greyed key. Prose
          ranged left, as a run of words always is.
        */}
        {blocked ? <p className="help" data-ui="rim-blocked" role="status">{t(blocked)}</p> : null}
      </Panel>
    </div>

    <div className="dental-footer">
      <section className="dental-block dental-finish">
        <div className="edit-row step-nav">
          <CommandButton command={resolve('dental.back', ui)} run={run} className="back-key back-key--arrow" labelHidden><Icon name="back" /></CommandButton>
          <CommandButton command={resolve('dental.rim.done', ui)} run={run} />
        </div>
      </section>
    </div>
  </aside>;
}
