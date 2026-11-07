import { t, translateMessage } from '../i18n';
import { hint } from '../components/hint';
import { railReason, railStates, type ToolFacts, type ToolState } from './toolState';
import type { ToolId } from '../state/tools';

/**
 * THE TOOL RAIL: Orient · Rim · Area · Supports, down the left of the deck with the models beside
 * it, in dependency order. The same component becomes the one workspace's own left edge when that
 * exists; only the surrounding layout changes.
 *
 * The rule it draws lives in `toolState.ts` and the reasoning is in this folder's README. What this
 * file decides is how the four states LOOK, and there is one rule that matters: greyed and busy must
 * not resemble each other. A disabled tool is `disabled`, so it cannot be pressed and reads as grey.
 * A busy tool is pressable and says it is working - press it and you see progress, not grey.
 *
 * WORDS, NOT ICONS. `src/ui/assets/icons/` has `orient` and nothing for the other three, and the
 * icon system is file-driven precisely so a designer owns those drawings rather than code inventing
 * them. One icon beside three bare words looks broken, so all four are words until the files exist;
 * adding them later needs no change here. The house style allows plain word buttons for exactly this.
 */

/** What a tool's state adds to its button: the class, whether it can be pressed, and its hover line. */
function look(state: ToolState): { className: string; disabled: boolean; note: string | undefined } {
  switch (state.kind) {
    // "Open this model" and not the tool's name: the press enters the flow at its start. A rail that
    // opened the pressed tool was built and deleted - `App.tsx`'s `openTool` comment says why - and
    // this string went with it. What a ready button tells the operator truthfully is its STATE.
    case 'ready': return { className: 'tool', disabled: false, note: 'Open this model.' };
    // Pressable on purpose: the operator opens it and watches, rather than meeting grey.
    case 'busy': return { className: 'tool tool--busy', disabled: false, note: 'Being made now.' };
    case 'stale': return { className: 'tool tool--stale', disabled: false, note: 'Out of date since something above it changed.' };
    case 'unavailable': return { className: 'tool tool--blocked', disabled: true, note: undefined };
  }
}

const LABEL: { readonly [K in ToolId]: string } = {
  orient: 'Orient',
  rim: 'Rim',
  area: 'Area',
  supports: 'Supports',
};

export function ToolRail({ facts, onPick }: {
  facts: ToolFacts;
  onPick: (tool: ToolId) => void;
}) {
  const reason = railReason(facts);

  return <div className="tool-rail" role="group" aria-label={t('Tools')}>
    {railStates(facts).map(({ tool, state }) => {
      const { className, disabled, note } = look(state);
      return <button key={tool} type="button" data-ui={`tool-${tool}`}
        className={className}
        disabled={disabled}
        // A disabled button carries its own reason too: the line below says the NEXT thing to do, and
        // a tool further down the chain still owes an answer to "why not this one".
        {...(state.kind === 'unavailable' ? { title: translateMessage(state.because) }
          : note ? hint(note) : {})}
      >{t(LABEL[tool])}</button>;
    })}
    {/*
      ONE line, for the first tool that cannot be used - which is the next thing to do. Four at once
      is noise, and a reason that lives only in a title is invisible on a touch screen. This is the
      teaching the wizard used to do, so it is not optional chrome.
    */}
    {reason ? <p className="tool-reason" data-ui="tool-reason">{translateMessage(reason)}</p> : null}
  </div>;
}
