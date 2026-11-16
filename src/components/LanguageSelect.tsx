import { LANGS, t, type Lang } from '../i18n';
import { Icon } from '../ui/Icon';

/**
 * The nav bar's language picker: a globe key that opens the native dropdown, one option per entry of
 * `LANGS`, each named in its own language. Inputs: `lang`, the active language (preselected);
 * `onChange`, called with the language the user picked. No units; no colours (the look lives in
 * `styles.css`, `.lang-select`).
 *
 * WHY A GLOBE AND NOT THE LANGUAGE'S NAME. The control used to be as wide as the longest language
 * name; the globe is one 36px key, and the nav bar keeps the difference. The name is not lost -- it
 * is in the open list, and the `<select>` still carries the current value for anything that asks.
 *
 * WHY THE NATIVE `<select>` IS STILL HERE, invisible over the icon rather than replaced: the list,
 * the keyboard, the type-ahead and the screen-reader announcement stay the platform's own. A custom
 * menu would have to earn all of that back, and when it fails it fails for the people who can least
 * afford it. The icon is `aria-hidden` inside `Icon`, so the only thing announced is the select and
 * its label.
 */
export function LanguageSelect({ lang, onChange }: { lang: Lang; onChange: (next: Lang) => void }) {
  return (
    <span className="lang-select" data-ui="language-select">
      <Icon name="language" />
      <select
        data-ui="language-select-input"
        aria-label={t('Language')}
        value={lang}
        onChange={(event) => onChange(event.target.value as Lang)}
      >
        {LANGS.map((entry) => <option key={entry.lang} value={entry.lang} lang={entry.lang}>{entry.name}</option>)}
      </select>
    </span>
  );
}
