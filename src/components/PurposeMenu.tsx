// Copyright (c) Mixo Creative.

import { useEffect, useId, useRef, useState } from 'react';
import { Art } from '../ui/Art';
import { t } from '../i18n';

/**
 * THE CATEGORY PICKER, WITH THE PICTURES IN THE LIST — one job, and the reason it is hand-built.
 *
 * It replaced a native `<select>` on 2026-11-18, at the owner's asking: *"can we also hv icon in
 * dropdown of job category."* A native select cannot do it. Its popup is drawn by the operating
 * system from the `<option>` text, and an `<option>` renders no markup: no image, no SVG, no
 * background. That is a browser limit, not a styling one, and no amount of CSS reaches it.
 *
 * SO THE COST IS ACCEPTED ON PURPOSE, AND IT IS NOT SMALL. A native select brings the keyboard, the
 * screen-reader announcement, type-ahead, touch behaviour and the OS popup for free; everything
 * below is this file paying for those by hand. It is worth paying HERE and nowhere else: the
 * category is the one answer in this app that is a THING rather than a word — an aligner and a
 * denture are told apart by shape across a bench, and the entry screen already teaches them as
 * pictures. The TYPE control beside it stays a native select, because a profile name is a word.
 *
 * WHAT IS PAID FOR, so a later reader can check it is still paid:
 *   - `role="listbox"` / `role="option"` with `aria-selected`, which is what the picture is NOT.
 *   - Enter, Space and Down open; Up and Down move; Enter and Space choose; Esc closes and returns
 *     focus to the button; Tab closes. Focus is moved to the list so the arrows reach it.
 *   - A pointer press anywhere else closes it, listened for on `pointerdown` rather than `click`
 *     so it closes before the press lands on whatever was under it.
 *   - Every instance gets its own `data-ui` (the house rule for designers) and its own id, because
 *     this is drawn once per row on a deck that routinely runs to thirty.
 */
export interface PurposeOption {
  /** What `onChoose` is given. A profile id, or `any` for the not-dental answer. */
  readonly value: string;
  /** The words to show, ALREADY in the reader's language. A category's label is an i18n key the
   *  caller resolves; a type's is the engine's own profile name, which is not a key at all. */
  readonly label: string;
  /**
   * The drawing in `src/ui/assets/art/`, for an option that is a THING - a category.
   * Exactly one of `icon` and `badge` is set.
   */
  readonly icon?: string;
  /**
   * One letter in a rounded box, for an option that is a NAME - a type. A profile has no product to
   * draw, and a drawing of one would overclaim what a general-purpose profile is.
   */
  readonly badge?: string;
}

export function PurposeMenu({ options, value, ui, label, onChoose }: {
  readonly options: readonly PurposeOption[];
  /** The chosen option's value, or undefined when nothing has been answered. */
  readonly value: string | undefined;
  /** This control's own stable name, e.g. `items-purpose-u-a-category`. */
  readonly ui: string;
  /** What the control is FOR, for the screen reader and the pointer: "What are you making?". */
  readonly label: string;
  readonly onChoose: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  /*
   * THE LIST IS POSITIONED, NOT NESTED, because the deck's body is a SCROLL CONTAINER
   * (`.items-body { overflow-y: auto }`) and an absolutely positioned child of a scroll container is
   * clipped by it. On the last row of a case the menu would have opened into nothing. `fixed` takes
   * it out of that box; the coordinates are the button's own, read when it opens.
   */
  const [at, setAt] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const root = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const chosen = options.find((option) => option.value === value);
  /** A picture for a thing, a letter for a name. One helper so the key and the list cannot differ. */
  const face = (option: PurposeOption) => (option.badge !== undefined
    ? <span className="purpose-badge" aria-hidden="true">{option.badge}</span>
    : <Art name={option.icon ?? ''} className="purpose-art" />);

  /*
   * THE LIST TAKES THE KEYBOARD WHEN IT OPENS. Without this the arrows go to whatever had focus -
   * on a row, the row itself - and the menu is a picture nobody can drive. The index is set to the
   * current answer so Down from "Aligner" reaches "Denture" rather than starting over.
   */
  useEffect(() => {
    if (!open) return undefined;
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    const box = button.current?.getBoundingClientRect();
    /*
     * KEPT INSIDE THE WINDOW. These controls sit at the RIGHT-HAND end of a row, so a list simply
     * dropped at the button's left edge hangs off the glass - and a `fixed` list has no scroll
     * container to rescue it. 176px is `.purpose-menu-list`'s min-width plus its padding; the
     * 8px keeps it off the edge rather than flush against it.
     */
    if (box) {
      const room = document.documentElement.clientWidth;
      setAt({ top: Math.round(box.bottom + 4), left: Math.round(Math.max(8, Math.min(box.left, room - 176 - 8))) });
    }
    list.current?.focus();
    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open, options, value]);

  const choose = (next: string) => {
    setOpen(false);
    button.current?.focus();
    onChoose(next);
  };

  const onKeys = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Tab') { setOpen(false); button.current?.focus(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((at) => (at + (event.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = options[active];
      if (option) choose(option.value);
    }
  };

  return <span className="purpose-menu" ref={root} data-ui={ui}>
    <button type="button" ref={button}
      className={`purpose-menu-key${chosen ? '' : ' purpose-menu-key--empty'}`}
      data-ui={`${ui}-key`}
      aria-haspopup="listbox" aria-expanded={open} aria-label={`${label}${chosen ? `: ${chosen.label}` : ''}`}
      title={chosen ? chosen.label : label}
      onClick={(event) => { event.stopPropagation(); setOpen((was) => !was); }}
      onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}>
      {chosen
        ? face(chosen)
        /* NOT A PICTURE WHILE THERE IS NO ANSWER. The first version of the old control fell back to
           the generic cube, which IS the "Any model" art - so an unanswered row looked exactly like
           one answered "not dental". That is the silent-default defect this screen exists to
           remove, and it is easy to rebuild inside its own fix. */
        : <span className="purpose-menu-empty">{t('Choose…')}</span>}
    </button>
    {open ? <ul className="purpose-menu-list" ref={list} role="listbox" tabIndex={-1}
      style={{ top: `${at.top}px`, left: `${at.left}px` }}
      data-ui={`${ui}-list`} aria-label={label}
      aria-activedescendant={`${id}-${active}`} onKeyDown={onKeys}>
      {options.map((option, index) => <li key={option.value} id={`${id}-${index}`}
        role="option" aria-selected={option.value === value}
        className={`purpose-menu-item${index === active ? ' purpose-menu-item--active' : ''}`}
        data-ui={`${ui}-option-${option.value}`}
        /* `onPointerDown` and not `onClick`: the document-level close listener fires first on a
           press, which unmounts this list before a click could ever land on it. */
        onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); choose(option.value); }}
        onMouseEnter={() => setActive(index)}>
        {face(option)}
        <span>{option.label}</span>
      </li>)}
    </ul> : null}
  </span>;
}
