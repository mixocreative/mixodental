import { useEffect, useRef, useState } from 'react';
import { isProjectFile } from '../state/projectFile';
import { dropAction } from './startDrop';
import { t, type Lang } from '../i18n';
import { PurposeKeys } from './PurposeKeys';
import { Icon } from '../ui/Icon';
import { ScreenHeading } from '../ui/ScreenHeading';
import { fileStepText } from '../denture/steps/start/startText';
import { jobKindOf } from '../denture/jobKind';
import { type DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/**
 * The full-screen start screens. `drop` is the first page — named for what the operator does on it
 * rather than for the choice it offers, because a dropped file is now the ordinary way in and the
 * keys are the alternative (plan §1, §7). It was `task` until the Drop page landed.
 */
export type StartScreenId = 'drop' | 'items' | 'file';

/**
 * The screens THIS component renders. `items` is its own component (`src/items/ItemsPage.tsx`), so
 * excluding it here makes "StartScreen never draws the Items page" a type fact rather than a
 * convention — and keeps `dropAction`'s screen argument honest, since the Items page has no drop
 * behaviour of its own.
 */
export type ChooserScreen = Exclude<StartScreenId, 'items'>;

/**
 * The app's full-screen start. It renders instead of the workspace while the app has no work to show.
 *
 * TWO WAYS IN, AND THEY ARE EQUALS (owner's ruling, 2026-11-18): *either the user tells what they
 * want, or they drag-drop files and it shows the deck.* So this screen offers a drop target and the
 * purpose question side by side — drop files and the deck asks what they are; answer first and the
 * file step asks for the file.
 *
 * WHAT THIS REPLACED, because the screen is the thing the owner called horribly planned twice. The
 * purpose question was the heading, the drop target was invisible (the whole `<section>`, announced
 * by a 1px outline that appears only once you are already dragging), and the two paths were not
 * equivalent: a single dropped file never reached the question at all. It became
 * `onStart(defaultProfileId('aligner'), file)` — so a dropped denture went into the aligner flow and
 * was asked for a rim, the purpose having been answered for the operator, invisibly, by a guess.
 * Files are no longer held here for a later press; they are imported on the drop, and the question
 * is asked about objects that exist. `src/components/startDrop.ts` holds the rest of that story.
 */
export function StartScreen({ screen, profile, onScreen, onAnyModel, onOpenProject, onProjectFile, onFiles, onUnsupported }: {
  screen: ChooserScreen;
  /** The aligner type chosen before (kept pressed when the screen is reached again). */
  profile: string | undefined;
  lang: Lang;
  /** `kind`: the job kind the file step is for (its status line); absent: the aligner. */
  onScreen: (screen: ChooserScreen, kind?: DentalKind) => void;
  /** Into the workspace with no flow and no files: this screen no longer holds any (see above). */
  onAnyModel: () => void;
  onOpenProject: () => void;
  onProjectFile: (file: File) => void;
  /**
   * FILES ARRIVED — dragged or chosen, one or many, on either screen. The caller imports them and
   * shows the deck. It is the ONLY thing this screen produces, which is the entry's invariant:
   * *one destination* (owner's ruling, 2026-11-18).
   *
   * `profile` is undefined for everything that happens on the first page, and that is the point:
   * nothing may be detected against a guess. It is set when the operator answered the purpose
   * question first — then the answer travels with the files and the deck opens with it already
   * filled in. That preselect is the ONLY thing choosing first buys; it is not a second route.
   */
  onFiles: (files: readonly File[], profile: string | undefined) => void;
  onUnsupported: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState(profile);
  const [over, setOver] = useState(false);

  // Keys reach onKeyDown only from inside: focus moves to the new screen's first button.
  useEffect(() => { root.current?.querySelector('button')?.focus(); }, [screen]);

  /*
   * BACK TO THE DROP PAGE FORGETS THE ANSWER, and it has to. `chosen` survives the trip otherwise,
   * so a technician who pressed Denture, thought better of it and came back would be holding an
   * invisible answer — and the next drop would carry it. That is the same class of fault as the
   * aligner guess this screen was rebuilt to remove: an answer nobody can see on screen.
   */
  const go = (next: ChooserScreen) => {
    if (next === 'drop') setChosen(undefined);
    onScreen(next);
  };
  // A denture job has one type: its file step comes straight from the task screen, and Back returns there.
  const kind = jobKindOf(chosen);
  const text = fileStepText(screen === 'file' ? kind : 'aligner');
  // THE TYPE SCREEN IS GONE (plan §8 7c), so every Back from the file screen returns to Drop.
  // It offered one card: §2 establishes that Type is derived by `defaultProfileId(kind)` and that
  // exactly one aligner profile exists, so the screen asked a question with a single answer.
  const back = (): ChooserScreen => 'drop';
  /** An answer given BEFORE any file exists: the file step is what it leads to. */
  const choose = (id: string) => {
    setChosen(id);
    onScreen('file', jobKindOf(id));
  };
  const drop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setOver(false);
    // The decision lives in `startDrop.ts`; this only carries it out.
    const action = dropAction([...event.dataTransfer.files], { screen, chosen, isProject: isProjectFile });
    switch (action.kind) {
      case 'project': return onProjectFile(action.file);
      case 'unsupported': return onUnsupported();
      // A drop is a case: imported now, asked about on the deck.
      case 'case': return onFiles(action.files, action.profile);
      case 'ignore': return undefined;
    }
  };
  /** The drop target's own file picker, for a case chosen rather than dragged. */
  const pickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])];
    event.target.value = '';
    if (files.length > 0) onFiles(files, undefined);
  };

  return <section ref={root} className={`start-screen${over ? ' start-screen--dropping' : ''}`}
    onKeyDown={(event) => { if (event.key === 'Escape' && screen !== 'drop') go(back()); }}
    onDragOver={(event) => { event.preventDefault(); setOver(true); }}
    onDragLeave={(event) => { if (event.currentTarget === event.target) setOver(false); }}
    onDrop={drop}>
    {screen !== 'drop' ? <button type="button" className="start-back back-key" data-ui="start-back" aria-label={t('Back')} title={t('Back')} onClick={() => go(back())}>
      <Icon name="back" className="start-back-art" />
    </button> : null}
    {/* The class stays `start-task` so section `s` of the walk keeps selecting it; 7d renames it. */}
    {screen === 'drop' ? <div className="start-task">
      <ScreenHeading>{t('Drop your files here')}</ScreenHeading>
      {/*
        THE DROP TARGET, DRAWN. The page is named `drop` and never used the word: its only affordance
        was the section-wide outline that appears after the drag has started, so the ordinary way into
        the app was invisible until you had already guessed it.
      */}
      <div className="dental-drop" data-ui="start-drop">
        <Icon name="drop-file" className="start-drop-art" />
        <p>{t('One file or a whole case. They stay on this device.')}</p>
        <input ref={input} type="file" accept=".stl" multiple hidden
          aria-label={t('Choose STL files')} onChange={pickFiles} />
        <button type="button" className="primary key-art" data-ui="start-choose-files"
          onClick={() => input.current?.click()}>{t('Choose STL files')}</button>
      </div>
      <p className="start-or" data-ui="start-or">{t('Or tell us what you are making')}</p>
      <PurposeKeys onDental={choose} onAnyModel={onAnyModel} />
      <button type="button" className="link-button" onClick={onOpenProject}>{t('Open a saved project')}</button>
    </div> : null}
    {screen === 'file' ? <div className="dental-stage">
      <div className="dental-drop">
        <ScreenHeading>{t(text.heading)}</ScreenHeading>
        <p>{t(text.hint)}</p>
        {/*
          THE SAME PICKER AS THE DROP PAGE, with the same ref (the two screens never render
          together) and the same `multiple`. Having answered the purpose does not make this a
          single-file screen: the answer governs a run, so a whole case can be handed over at once
          and it arrives on the deck already categorised.
        */}
        <input ref={input} type="file" accept=".stl" multiple aria-label={t(text.input)} hidden
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            event.target.value = '';
            if (files.length > 0) onFiles(files, chosen);
          }} />
        <div className="edit-row">
          <button type="button" className="primary key-art" onClick={() => input.current?.click()}><Icon name="drop-file" />{t('Choose STL file')}</button>
        </div>
      </div>
    </div> : null}
  </section>;
}
