import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './dental/editingMode';
import './workers/engineSource';
import App from './App';
import { AppBoundary, Stopped, type StopReason } from './AppBoundary';
import { geometryReady } from '@mixo-geocore/host/workers/geometryClient';
import { detectLanguage, setLanguage } from './i18n';
import { startTheme } from './ui/theme';
import './fonts.css';
import './styles.css';
import './styles/layout.css';
import './styles/theme.css';
// The theme is worn before the first render, so no frame is drawn in the wrong colours.
startTheme();

const root = createRoot(document.getElementById('root')!);

/**
 * Show the stopped screen instead of the app.
 *
 * The language is set HERE and not left to `App`: these two paths render without `App` ever
 * mounting, and before this the one thing an unsupported device was told was nothing at all - in
 * English (`AppBoundary.tsx`, audit MIXO-04). `detectLanguage()` is what `App` itself uses, so the
 * happy path below is unchanged.
 */
function stop(reason: StopReason, detail?: string): void {
  setLanguage(detectLanguage());
  root.render(<Stopped reason={reason} detail={detail} />);
}

/**
 * Is there a WebGL2 context to be had?
 *
 * Asked before anything mounts, because the alternative is what the audit found: the start screen
 * renders, "Any model" is pressed, `<Canvas>` throws, and React empties the page. The boundary would
 * now catch that - but being told after a click is worse than being told before one.
 *
 * A hardened browser can THROW here rather than return null, so the try matters.
 */
function hasWebGL2(): boolean {
  try {
    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) return false;
    // Hand it straight back: browsers cap live contexts near sixteen and the deck already spends one.
    probe.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const message = (error: unknown): string => (error instanceof Error ? error.message : String(error));

if (!hasWebGL2()) {
  stop('no-webgl2');
} else {
  // Interactive maths (transforms, pick, brush) is synchronous Rust: the engine is ready before the
  // first render. A REJECTION used to end here unhandled, with nothing rendered and nothing said.
  void geometryReady().then(
    () => root.render(<StrictMode><AppBoundary><App /></AppBoundary></StrictMode>),
    (error: unknown) => {
      console.error('mixoDental: the geometry engine did not load:', error);
      stop('engine', message(error));
    },
  );
}
