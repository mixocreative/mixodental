import type { CommandId, UiState } from '@mixo-geocore/editing/commands';
import { noticeText } from '../../components/DentalSteps';
import type { DentalNotice } from '../editingMode';
import { resolve } from '@mixo-geocore/editing/commands';
import { CommandButton } from '../../components/CommandButton';
import { Panel } from '../../components/Panel';
import { Field } from '../../components/Field';
import { Segmented } from '../../components/Segmented';
import { t } from '../../i18n';
import { rimDoneReason, rimLoopText } from './rimStepText';
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

export function DentalRimStep({ ui, run, notices = [] }: {
  ui: UiState;
  run: (id: CommandId) => void;
  /** What orientation found on the way in; the mode opened because it found no rim. */
  notices?: readonly DentalNotice[];
}) {
  const anchors = ui.dentalRimAnchors ?? 0;
  const closed = ui.dentalRimClosed ?? false;
  // Why Done is off, said once here as well as on the key, because the reason is the step's whole state.
  const blocked = rimDoneReason(ui);

  return <aside className="dental-side" data-ui="dental-rim-panel" aria-label={t('Define the rim')}>
    <div className="dental-scroll">
      {/*
        WHY THE OPERATOR IS HERE, first thing. They did not choose this detour - orientation handed it to
        them - and a drawing dock appearing unannounced is the kind of thing that reads as a fault in the
        app. Said once, in the dock they are about to use, rather than as a notice to dismiss before they
        can start: dismissing it would cost a click and leave no trace of why the step exists.
      */}
      <p className="edit-note" data-ui="rim-why" role="status">{t('Orientation could not find a rim on this aligner, so you draw it here.')}</p>
      {/* Anything else orientation found still applies to the shape being drawn on. */}
      {notices.map((notice) => <p key={notice.kind} className="edit-note" data-ui="rim-notice" role="alert">{noticeText(notice)}</p>)}
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
        {/*
          The two facts an operator checks over and over, as two readouts rather than one sentence: how
          many points are down, and whether the loop is joined. `dental-tip-count` is the same readout
          Step 2 gives its tip count, so the number wears the app's own number face.
        */}
        <Field label={t('Points')} ui="rim-point-count" layout="row" className="dental-tip-count" readOnly>
          <span className="num">{anchors}</span>
        </Field>
        <Field label={t('Loop')} ui="rim-loop-state" layout="row" readOnly>
          <span>{t(rimLoopText(closed))}</span>
        </Field>
        <div className="edit-row">
          {/*
            Close loop, then the two that take something away, narrowest first: Delete point acts on the
            one anchor picked out, Clear takes the whole drawing. Delete point is a `.danger` OUTLINE and
            Clear is plain, per the house rule - the one filled control in this mode is Done.
          */}
          {(['dental.rim.close', 'dental.rim.deletePoint', 'dental.rim.clear'] as const)
            .map((id) => resolve(id, ui))
            .filter((command) => command.visible)
            .map((command) => <CommandButton key={command.id} command={command} run={run} />)}
        </div>
        {/*
          The refusal, in words, where the reader is looking - not only as a tooltip on a greyed key. It is
          a tinted note, not muted help text: it is the reason the step cannot finish, so it should not
          read as a footnote. Same shape as the plate's "not placed" note. Prose ranged left, as always.
        */}
        {blocked ? <p className="rim-blocked" data-ui="rim-blocked" role="status">{t(blocked)}</p> : null}
      </Panel>
    </div>

    <div className="dental-footer">
      <section className="dental-block dental-finish">
        {/*
          CANCEL AND DONE, not an arrow and Done. This is a mode, not a step: its two ways out are finish
          it and leave it, so the way out wears a word like the way on, and neither pretends to be the
          step arrow that would take the operator somewhere else entirely.
        */}
        <div className="edit-row mode-nav">
          <CommandButton command={resolve('dental.back', ui)} run={run} uiName="rim-cancel" />
          <CommandButton command={resolve('dental.rim.done', ui)} run={run} />
        </div>
      </section>
    </div>
  </aside>;
}
