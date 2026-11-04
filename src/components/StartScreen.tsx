import { useEffect, useRef, useState } from 'react';
import { isProjectFile } from '../state/projectFile';
import { t, type Lang } from '../i18n';
import { DentalTypeStep } from './DentalSteps';
import { DentureChoice } from '../denture/steps/start/DentureChoice';
import { StartChoice } from './StartChoice';
import { fileStepText } from '../denture/steps/start/startText';
import { DENTURE_PROFILE_ID, jobKindOf } from '../denture/jobKind';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/** The three full-screen start screens: the task, the aligner type, the aligner file (docs/ROADMAP.md ST). */
export type StartScreenId = 'task' | 'type' | 'file';

const isStl = (file: File) => /\.stl$/i.test(file.name);

/**
 * The app's full-screen start. It renders instead of the workspace while the app has no work to
 * show: choose the task, then the aligner type, then the file. A file dropped on the first or second
 * screen is held until the type is chosen; the last screen hands the type and file to the app.
 */
export function StartScreen({ screen, profile, lang, onScreen, onAnyModel, onOpenProject, onProjectFile, onStart, onUnsupported }: {
  screen: StartScreenId;
  /** The aligner type chosen before (kept pressed when the screen is reached again). */
  profile: string | undefined;
  lang: Lang;
  /** `kind`: the job kind the file step is for (its status line); absent: the aligner. */
  onScreen: (screen: StartScreenId, kind?: DentalKind) => void;
  onAnyModel: () => void;
  onOpenProject: () => void;
  onProjectFile: (file: File) => void;
  onStart: (profile: string, file?: File) => void;
  onUnsupported: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [held, setHeld] = useState<File>();
  const [chosen, setChosen] = useState(profile);
  const [over, setOver] = useState(false);

  // Keys reach onKeyDown only from inside: focus moves to the new screen's first button.
  useEffect(() => { root.current?.querySelector('button')?.focus(); }, [screen]);

  const go = (next: StartScreenId) => {
    if (next === 'task') setHeld(undefined);
    onScreen(next);
  };
  // A denture job has one type: its file step comes straight from the task screen, and Back returns there.
  const kind = jobKindOf(chosen);
  const text = fileStepText(screen === 'file' ? kind : 'aligner');
  const back = (): StartScreenId => (screen === 'file' && kind === 'aligner' ? 'type' : 'task');
  const choose = (id: string) => {
    setChosen(id);
    if (held) onStart(id, held);
    else onScreen('file', jobKindOf(id));
  };
  const drop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setOver(false);
    const files = [...event.dataTransfer.files];
    const project = files.find((file) => isProjectFile(file.name));
    if (project) return onProjectFile(project);
    const stl = files.find(isStl);
    if (!stl) return files.length > 0 ? onUnsupported() : undefined;
    if (screen === 'file' && chosen) return onStart(chosen, stl);
    setHeld(stl);
    if (screen === 'task') onScreen('type');
  };

  return <section ref={root} className={`start-screen${over ? ' start-screen--dropping' : ''}`}
    onKeyDown={(event) => { if (event.key === 'Escape' && screen !== 'task') go(back()); }}
    onDragOver={(event) => { event.preventDefault(); setOver(true); }}
    onDragLeave={(event) => { if (event.currentTarget === event.target) setOver(false); }}
    onDrop={drop}>
    {screen !== 'task' ? <button type="button" className="start-back" onClick={() => go(back())}>{t('Back')}</button> : null}
    {screen === 'task' ? <div className="start-task">
      <h2 className="start-heading">{t('What would you like to support?')}</h2>
      <div className="start-choices">
        <StartChoice icon="aligner" label={t('Aligner')} ui="start-aligner" onChoose={() => onScreen('type')} />
        <DentureChoice onChoose={() => choose(DENTURE_PROFILE_ID)} />
        <StartChoice icon="generic" label={t('Any model')} ui="start-any-model" onChoose={onAnyModel} />
      </div>
      <button type="button" className="link-button" onClick={onOpenProject}>{t('Open a saved project')}</button>
    </div> : null}
    {screen === 'type' ? <DentalTypeStep profile={chosen} lang={lang} send={() => undefined} onChoose={choose} /> : null}
    {screen === 'file' ? <div className="dental-stage">
      <div className="dental-drop">
        <h2>{t(text.heading)}</h2>
        <p>{t(text.drop)}</p>
        <input ref={input} type="file" accept=".stl" aria-label={t(text.input)} hidden
          onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file && chosen) onStart(chosen, file); }} />
        <div className="edit-row">
          <button type="button" className="primary" onClick={() => input.current?.click()}>{t('Choose STL file')}</button>
        </div>
      </div>
    </div> : null}
  </section>;
}
