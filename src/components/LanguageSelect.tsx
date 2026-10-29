import { LANGS, t, type Lang } from '../i18n';

/**
 * The nav bar's language picker: one native dropdown with one option per entry of `LANGS`, each named in its own
 * language. Inputs: `lang`, the active language (preselected); `onChange`, called with the language the user picked.
 * No units; no colours (the look lives in `styles.css`, `.lang-select`).
 */
export function LanguageSelect({ lang, onChange }: { lang: Lang; onChange: (next: Lang) => void }) {
  return (
    <select className="lang-select" aria-label={t('Language')} value={lang} onChange={(event) => onChange(event.target.value as Lang)}>
      {LANGS.map((entry) => <option key={entry.lang} value={entry.lang} lang={entry.lang}>{entry.name}</option>)}
    </select>
  );
}
