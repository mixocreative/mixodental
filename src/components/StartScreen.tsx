import { useEffect, useRef, useState } from 'react';
import { isProjectFile } from '../state/projectFile';
import { dropAction } from './startDrop';
import { t, type Lang } from '../i18n';
import { DentureChoice } from '../denture/steps/start/DentureChoice';
import { ChoiceKey } from '../ui/ChoiceKey';
import { Icon } from '../ui/Icon';
import { ScreenHeading } from '../ui/ScreenHeading';
import { fileStepText } from '../denture/steps/start/startText';
import { DENTURE_PROFILE_ID, jobKindOf } from '../denture/jobKind';
import { defaultProfileId, type DentalKind } from '@mixo-geocore/host/dental/dentalKind';

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
 * The app's full-screen start. It renders instead of the workspace while the app has no work to
 * show: choose the task, then the aligner type, then the file. A file dropped on the first or second
 * screen is held until the type is chosen; the last screen hands the type and file to the app.
 */
export function StartScreen({ screen, profile, lang, onScreen, onAnyModel, onOpenProject, onProjectFile, onStart, onFiles, onUnsupported }: {
  screen: ChooserScreen;
  /** The aligner type chosen before (kept pressed when the screen is reached again). */
  profile: string | undefined;
  lang: Lang;
  /** `kind`: the job kind the file step is for (its status line); absent: the aligner. */
  onScreen: (screen: ChooserScreen, kind?: DentalKind) => void;
  onAnyModel: () => void;
  onOpenProject: () => void;
  onProjectFile: (file: File) => void;
  onStart: (profile: string, file?: File) => void;
  /**
   * A drop of MORE THAN ONE model on the Drop page. One file still goes through `onStart`, because a
   * single aligner is the dental flow's whole input; several cannot be, so they are imported together
   * and the operator chooses among them on the plate. The Items page takes this seam over (§8 7b) —
   * until then nothing silently discards the files past the first, which is what this replaced.
   */
  onFiles: (files: readonly File[]) => void;
  onUnsupported: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [held, setHeld] = useState<File>();
  const [chosen, setChosen] = useState(profile);
  const [over, setOver] = useState(false);

  // Keys reach onKeyDown only from inside: focus moves to the new screen's first button.
  useEffect(() => { root.current?.querySelector('button')?.focus(); }, [screen]);

  const go = (next: ChooserScreen) => {
    if (next === 'drop') setHeld(undefined);
    onScreen(next);
  };
  // A denture job has one type: its file step comes straight from the task screen, and Back returns there.
  const kind = jobKindOf(chosen);
  const text = fileStepText(screen === 'file' ? kind : 'aligner');
  // THE TYPE SCREEN IS GONE (plan §8 7c), so every Back from the file screen returns to Drop.
  // It offered one card: §2 establishes that Type is derived by `defaultProfileId(kind)` and that
  // exactly one aligner profile exists, so the screen asked a question with a single answer.
  const back = (): ChooserScreen => 'drop';
  const choose = (id: string) => {
    setChosen(id);
    if (held) onStart(id, held);
    else onScreen('file', jobKindOf(id));
  };
  const drop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setOver(false);
    // The decision lives in `startDrop.ts`; this only carries it out.
    const action = dropAction([...event.dataTransfer.files], { screen, chosen, isProject: isProjectFile });
    switch (action.kind) {
      case 'project': return onProjectFile(action.file);
      case 'unsupported': return onUnsupported();
      case 'many': return onFiles(action.files);
      case 'start': return onStart(action.profile, action.file);
      case 'hold':
        setHeld(action.file);
        // A model dropped on Drop goes straight in on the default aligner type.
        return screen === 'drop' ? onStart(defaultProfileId('aligner'), action.file) : undefined;
      case 'ignore': return undefined;
    }
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
      <ScreenHeading>{t('What are you making?')}</ScreenHeading>
      <div className="choice-keys">
        <ChoiceKey icon="aligner" label={t('Aligner')} ui="start-aligner" onChoose={() => choose(defaultProfileId('aligner'))} />
        <DentureChoice onChoose={() => choose(DENTURE_PROFILE_ID)} />
        {/* The way into the workspace for work with no flow at all - and the ONLY one, which is why it
            stays even though the step flow no longer ends there (src/scenes/sceneMap.ts `doors`).
            Hiding it took Support Edit Mode, zones, the plate panel and every export with it. */}
        <ChoiceKey icon="generic" label={t('Any model')} ui="start-any-model" onChoose={onAnyModel} />
      </div>
      <button type="button" className="link-button" onClick={onOpenProject}>{t('Open a saved project')}</button>
    </div> : null}
    {screen === 'file' ? <div className="dental-stage">
      <div className="dental-drop">
        <ScreenHeading>{t(text.heading)}</ScreenHeading>
        <p>{t(text.hint)}</p>
        <input ref={input} type="file" accept=".stl" aria-label={t(text.input)} hidden
          onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file && chosen) onStart(chosen, file); }} />
        <div className="edit-row">
          <button type="button" className="primary key-art" onClick={() => input.current?.click()}><Icon name="drop-file" />{t('Choose STL file')}</button>
        </div>
      </div>
    </div> : null}
  </section>;
}
