import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A QUESTION THAT STOPS EVERYTHING UNTIL IT IS ANSWERED.
 *
 * It is a native `<dialog>` opened with `showModal()`, and that is the whole point: the browser darkens the
 * page behind it through `::backdrop`, makes everything outside it inert so no stray click lands on the
 * scene or the panel, holds the keyboard focus inside it, and answers Escape. Written by hand - a div with
 * a dark overlay - every one of those would be ours to get right, and the one that is always missed is
 * inertness: the dialog looks modal while the 3D view underneath quietly keeps taking drags.
 *
 * `onCancel` is the way out, however it is reached: the Cancel button, Escape, or the backdrop.
 */
export function ConfirmModal({ label, onCancel, children }: {
  /** Names the dialog for a reader who cannot see it. */
  label: string;
  onCancel: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    // jsdom-free test rendering has no showModal; the dialog is still written out, just not opened.
    if (!element || typeof element.showModal !== 'function' || element.open) return;
    element.showModal();
    return () => { if (element.open) element.close(); };
  }, []);
  return <dialog
    ref={dialog}
    className="confirm-modal"
    role="alertdialog"
    aria-label={label}
    data-ui="confirm-modal"
    // Escape fires `cancel`; it is answered rather than left to close the dialog behind the app's back.
    onCancel={(event) => { event.preventDefault(); onCancel(); }}
    // A click that lands on the dialog element itself landed on the backdrop: the content is inside.
    onClick={(event) => { if (event.target === dialog.current) onCancel(); }}
  >
    <div className="confirm-modal-body">{children}</div>
  </dialog>;
}
