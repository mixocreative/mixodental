/*
 * Which theme the app wears (P7e). There are two: the app's own instrument theme ('instrument', src/styles/theme.css, the
 * default) and the plain paper set it is layered on ('paper', src/styles.css alone). The choice is one attribute,
 * `data-theme` on the root element, which is also what the 3D view watches (src/ui/tokenColour.ts), so a switch
 * recolours the DOM and the scene together.
 *
 * It is chosen by `?theme=paper` in the address (so a screen can be linked in either theme), else by the last choice
 * kept in this browser, else the default. Nothing here reads a colour; only the attribute is set.
 */
import { refreshTokenColours } from './tokenColour';

export const THEMES = ['instrument', 'paper'] as const;
export type Theme = (typeof THEMES)[number];

/** The app's own theme. 'paper' is the set underneath, kept so the two can be compared on the catalogue page. */
export const DEFAULT_THEME: Theme = 'instrument';

/** Where the last choice is kept. A browser with no storage simply starts on the default every time. */
const STORE_KEY = 'mixodental.theme';

const isTheme = (value: string | null): value is Theme => value !== null && (THEMES as readonly string[]).includes(value);

/** The theme named by a query string (`?theme=paper`), or null when it names none we know. */
export function themeFromSearch(search: string): Theme | null {
  const value = new URLSearchParams(search).get('theme');
  return isTheme(value) ? value : null;
}

/** The theme to start in: the address first, then this browser's last choice, then the default. */
export function readTheme(search = typeof location === 'undefined' ? '' : location.search): Theme {
  const asked = themeFromSearch(search);
  if (asked) return asked;
  try {
    const kept = localStorage.getItem(STORE_KEY);
    if (isTheme(kept)) return kept;
  } catch {
    // A browser that refuses storage (private mode, blocked cookies) starts on the default.
  }
  return DEFAULT_THEME;
}

/**
 * Wear `theme`: set the attribute, remember the choice, and tell the 3D view to read its tokens again.
 * 'paper' removes the attribute, because that set is src/styles.css on its own.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'paper') root.removeAttribute('data-theme');
  else root.dataset.theme = theme;
  try {
    localStorage.setItem(STORE_KEY, theme);
  } catch {
    // Not remembering the choice is not a reason to fail the switch.
  }
  refreshTokenColours();
}

/** Called once at start-up (src/main.tsx, src/kit/main.tsx), before the first render. Returns the theme worn. */
export function startTheme(): Theme {
  const theme = readTheme();
  applyTheme(theme);
  return theme;
}
