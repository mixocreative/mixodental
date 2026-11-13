import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from './i18n';
import { sceneSave } from './rescue';

/**
 * EVERY WAY THIS APP CAN FAIL NOW HAS A FACE.
 *
 * Until the 2026-11-11 audit it had none. A browser with no WebGL2 pressed one button and got a
 * blank white page - `#root` with zero children and zero text - while two uncaught
 * "Error creating WebGL context." sat in a console no operator opens (`docs/reviews/2026-11-11-cia-audit.md`
 * MIXO-04, proved by `artefacts/2026-11-11-screen/probe-nogl.mjs`, whose control pass is what makes
 * the blank one evidence). `grep` for `componentDidCatch`, `ErrorBoundary`, `window.onerror` over
 * `src/` returned nothing at all, and React unmounts the WHOLE tree on an uncaught render error -
 * so the same mechanism took an unsaved scene on any render-time throw or a lost GPU context.
 *
 * Three ways in, one surface out:
 *
 * - **no WebGL2**, checked in `main.tsx` BEFORE the app mounts, so an unsupported device is told
 *   rather than left to click and find out;
 * - **the engine failing to load**, which used to leave `main.tsx`'s `geometryReady()` promise
 *   rejected with nothing rendered and nothing said - a second blank page by a different route;
 * - **any uncaught render error**, caught here.
 *
 * The styles are classes in `src/styles.css`, like everything else (`docs/ui-styling.md` rules 1 and
 * 2). The first draft of this file used inline styles with literal colour fallbacks, reasoning that
 * an error screen must not depend on a stylesheet - but `main.tsx` imports the stylesheet at module
 * scope, so it is loaded on all three paths above, and the house rule is a house rule. What the
 * reasoning was actually worth is kept where it belongs: every colour in those rules names a token
 * AND a fallback, because a missing custom property is a silent total failure in this app.
 *
 * THE WORDING IS PLACEHOLDER AND THE OWNER'S TO CHANGE. The audit said as much; what is not
 * negotiable is that something is said, and that the scene can be rescued before a reload.
 */

/** Why the shell is showing instead of the app. */
export type StopReason = 'no-webgl2' | 'engine' | 'crash';

const TITLE: Record<StopReason, string> = {
  'no-webgl2': 'mixoDental cannot start on this device',
  engine: 'The 3D engine did not load',
  crash: 'The workspace stopped',
};

const SENTENCE: Record<StopReason, string> = {
  'no-webgl2': 'This browser could not start WebGL2 3D graphics, which mixoDental needs to show and prepare models. Try Chrome or Edge on a desktop computer.',
  engine: 'Reload the page to try again. If it keeps happening, your browser may be blocking WebAssembly.',
  crash: 'Your models are still in this page. Save them before reloading - a reload does not keep them.',
};

/**
 * The stopped screen. `detail` is the browser's own message and is NEVER translated - it is
 * evidence for whoever is asked to look at this, not prose for the operator.
 */
export function Stopped({ reason, detail }: { reason: StopReason; detail?: string }): ReactNode {
  const save = sceneSave();
  return (
    <div className="stopped" data-ui="stopped-screen" data-reason={reason}>
      {/* Text ranged left, the BOX centred - never the run of words itself. */}
      <div className="stopped-card" role="alert">
        <h1 className="stopped-title" data-ui="stopped-title">{t(TITLE[reason])}</h1>
        <p className="stopped-text" data-ui="stopped-sentence">{t(SENTENCE[reason])}</p>
        <div className="stopped-actions" data-ui="stopped-actions">
          {save ? <button type="button" className="primary" data-ui="stopped-save" onClick={() => void save()}>{t('Save project')}</button> : null}
          <button type="button" className={save ? undefined : 'primary'} data-ui="stopped-reload" onClick={() => window.location.reload()}>{t('Reload')}</button>
        </div>
        {detail ? <p className="stopped-detail" data-ui="stopped-detail">{detail}</p> : null}
      </div>
    </div>
  );
}

/**
 * The root boundary. It keeps the shell up and the scene reachable; it does not try to recover the
 * tree, because a render that threw once will throw again on the same state and a retry button that
 * re-crashes is worse than a reload.
 */
export class AppBoundary extends Component<{ children: ReactNode }, { detail?: string }> {
  state: { detail?: string } = {};

  static getDerivedStateFromError(error: unknown): { detail: string } {
    return { detail: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // The console is not the report - the screen above is. This is for whoever is asked to look.
    console.error('mixoDental stopped:', error, info.componentStack);
  }

  render(): ReactNode {
    return this.state.detail === undefined ? this.props.children : <Stopped reason="crash" detail={this.state.detail} />;
  }
}
