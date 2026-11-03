import { useEffect, useRef } from 'react';
import { t, type Lang } from '../i18n';
import { parseTerms, termsFor, type Inline } from '../termsText';

const resolveHref = (href: string) => (/^[a-z]+:/i.test(href) ? href : `${import.meta.env.BASE_URL}${href}`);

function Text({ inline }: { inline: Inline[] }) {
  return <>{inline.map((part, i) => part.href
    ? <a key={i} href={resolveHref(part.href)} target="_blank" rel="noopener">{part.text}</a>
    : part.bold ? <strong key={i}>{part.text}</strong> : part.text)}</>;
}

/** The terms of use in a modal dialog, bundled with the app so they open offline. */
export default function TermsDialog({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // React 18 has no synthetic `close` for <dialog>, so the native Escape shut the element while the state
    // that renders it stayed true: the dialog went invisible and the terms could never be opened again. Listen
    // for the native event instead, so every way of closing - Escape, Close, the backdrop - tells the app.
    const closed = () => onClose();
    dialog.addEventListener('close', closed);
    return () => dialog.removeEventListener('close', closed);
  }, [onClose]);
  const { text, translated } = termsFor(lang);
  return <dialog ref={ref} className="terms" onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label={t('Terms of use')}>
    {!translated && <p className="help">{t('The terms are shown in English for this language.')}</p>}
    {parseTerms(text).map((block, i) => block.kind === 'title'
      ? <h2 key={i} className="title">{block.text}</h2>
      : <p key={i} className={block.kind === 'item' ? 'terms-item' : block.kind === 'quote' ? 'help' : undefined}>
        {block.kind === 'item' && <span>{block.n}.</span>}<Text inline={block.inline} />
      </p>)}
    <button type="button" onClick={() => ref.current?.close()}>{t('Close')}</button>
  </dialog>;
}
