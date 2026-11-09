import { afterEach, describe, expect, it } from 'vitest';
import { PRESET_HINTS, ROOF_HINTS, SETTING_GROUPS } from './components/SettingsPanel';
import { CodedError, ERROR_CODES, ERROR_CONTEXTS, errorStatus } from '@mixo-geocore/editing/errors';
import { COMMAND_IDS, resolve } from '@mixo-geocore/editing/commands';
import { regeneratedStatus } from '@mixo-geocore/editing/regenerate';
import { undoToast } from '@mixo-geocore/editing/toast';
import { STEP_KINDS } from '@mixo-geocore/editing/types';
import { READY, STATES } from './dental/editing/uiFixture';
import { DICTIONARY, STAGE_KEYS, detectLanguage, plural, setLanguage, t, translateMessage } from './i18n';

/** Source text of every non-test module, keyed './path'; the shared editing package (vendored mixo-geocore editing/) as './editing/<file>'. */
const SOURCES = {
  ...import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts', '!./**/*.test.tsx'], { query: '?raw', import: 'default', eager: true }),
  ...Object.fromEntries(Object.entries(import.meta.glob<string>('../vendor/mixo-geocore/editing/*.ts', { query: '?raw', import: 'default', eager: true }))
    .map(([file, source]) => [file.replace('../vendor/mixo-geocore/editing/', './editing/'), source])),
};
/*
 * WHICH MODULES SPEAK, and this is the SECOND time the answer was wrong by name.
 *
 * It used to be a name pattern - a component, a hook, a `*Text.ts`, a `*Commands.ts`. That missed
 * `items/detectState.ts` (five sentences), so `*State.ts` was added; then it missed
 * `deck/jobSummary.ts` the same afternoon. Chasing names loses this race every time a module is
 * given a name nobody predicted.
 *
 * So the test is what the file DOES: a module that builds a `Message` owns UI words, whatever it is
 * called. The name pattern is kept as well, because a component or a hook can pass text through
 * without ever writing `key:` itself.
 */
const SPEAKS = /\.tsx$|\/use[A-Z]\w*\.ts$|Text\.ts$|Commands\.ts$|State\.ts$/;
/** A `Message` literal: `{ key: '...' }`, however it is spaced. */
const BUILDS_MESSAGE = /\bkey:\s*'/;
const speaks = (file: string) => SPEAKS.test(file) || BUILDS_MESSAGE.test(SOURCES[file] ?? '');
/** A flow's own UI modules, so a new widget is checked without a list edit. */
const uiFilesIn = (folder: string) => Object.keys(SOURCES).filter((file) => file.startsWith(folder) && speaks(file));
const DENTURE_UI_FILES = uiFilesIn('./denture/');
const DENTAL_UI_FILES = uiFilesIn('./dental/');
const ITEMS_UI_FILES = uiFilesIn('./items/');
const DECK_UI_FILES = uiFilesIn('./deck/');
/*
 * AND `./components/`, WHICH IS THE THIRD TIME THIS SCOPE WAS WRONG.
 *
 * The comment above records the first two misses, both inside folders this test already globbed.
 * The third was a folder it did not glob at all: `src/components/` had an explicit hand-written
 * list, so a new module there owned user-facing sentences and was simply outside the guard.
 * `exportOutcomeText.ts` (then named `exportRefusalText.ts`) is how it was found - four export refusal sentences, added by an audit,
 * invisible to this test, and its name even matches `SPEAKS`. The explicit list below stays, because
 * it names files that pass text through without writing `key:` themselves; this adds the ones that
 * speak for themselves, by the same rule as the other four folders.
 *
 * Cost of closing it: three entries in `NOT_UI`. Nothing else in `src/components/` was untranslated,
 * which is worth saying - the shadow was in the instrument, not in the work.
 */
const COMPONENTS_UI_FILES = uiFilesIn('./components/');
/*
 * AND `./workers/`, WHICH IS THE FOURTH TIME - and this one I walked into myself, on the very pass
 * that widened the guard to `./components/`. `workers/analysisJobVocabulary.ts` was added to stop a
 * failed orientation check being explained as a support build (W-13), it owns three user-facing
 * sentences, and it sits in a folder this test had never globbed. Its translations were added by
 * hand and NOTHING would have noticed a fourth sentence added beside them.
 *
 * The pattern across all four misses is one thing: the scope was always a list of the places UI text
 * had been FOUND, never of the places it could BE. `speaks()` already answers the second question -
 * a module that builds a `Message` owns UI words - so every folder under `src/` that could hold one
 * is globbed now, and the bill for this one was zero entries in `NOT_UI`.
 */
const WORKERS_UI_FILES = uiFilesIn('./workers/');
const UI_FILES = ['./App.tsx', './components/RangeField.tsx', './components/Segmented.tsx', './components/EditBar.tsx', './components/DentalBar.tsx', './components/DentalSteps.tsx', './components/StartScreen.tsx', './components/DentalSupports.tsx', './components/ZonesBar.tsx', './components/SurfaceBrushBar.tsx', './components/ModeEntry.tsx', './components/ProblemList.tsx', './components/ObjectList.tsx', './components/SettingsPanel.tsx', './components/JobActivity.tsx', './components/ObjectViewport.tsx', './components/DebugSection.tsx', './components/useDebugLayers.ts', './components/UndoToast.tsx', './components/useFixSpot.ts', './components/useRegenerate.ts', './editing/status.ts', './editing/errors.ts', './editing/toast.ts', './editing/check.ts', './editing/view.ts', './editing/regenerate.ts', './editing/project.ts', './components/useProjectFile.ts', './components/openProject.ts', './editing/shapeEdit.ts', './components/ShapeBand.tsx', './dental/editingMode.ts', './components/PlatePanel.tsx', './components/usePlateArrange.ts', './components/viewport/UnresolvedBubbles.tsx', './supports/unresolved/unresolvedText.ts', ...DENTURE_UI_FILES, ...DENTAL_UI_FILES, ...ITEMS_UI_FILES, ...DECK_UI_FILES, ...COMPONENTS_UI_FILES, ...WORKERS_UI_FILES];
/** Quoted literals in UI files that are not shown to the user. */
const NOT_UI = new Set(['Tab', 'Esc', 'Escape', 'Enter', 'Delete', 'Backspace', 'Unit', 'Mixo supports', 'ArrowUp', 'ArrowDown', 'CodedError', 'ProjectFileError', 'TimeoutError', '{error}', 'AbortError',
  // Not sentences: two font families a stylesheet names, and a modifier key. All three arrived with
  // `./components/` above, and all three are the whole bill for closing that blind spot.
  'Atkinson Hyperlegible Next', 'Segoe UI', 'Shift']);

/** Single-quoted literals that read like UI text: a lowercase letter and a space or capital start. */
/*
 * COMMENTS ARE NOT CODE, and this is why the scraper strips them first.
 *
 * Prose uses apostrophes, and two of them in a sentence read as a quoted literal: "the build`s own
 * unresolved report. The engine" was demanded as a UI string, and so was a line of this very file`s
 * own documentation. The old answer was to WRITE COMMENTS WITHOUT APOSTROPHES in any file the guard
 * covered - which contorts the prose and only holds until somebody forgets. Stripping comments fixes
 * the class instead.
 *
 * Block comments go whole. Line comments go only when the `//` opens the line, because a trailing
 * `//` cannot be told from one inside a string without tokenising, and a URL in a string is the
 * common case there.
 */
const withoutComments = (code: string) => code
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^[ 	]*\/\/.*$/gm, '');

function uiLiterals(code: string): string[] {
  return [...withoutComments(code).matchAll(/'((?:[^'\\\n]|\\.)+)'/g)].map((match) => match[1]!)
    .filter((text) => /[a-z]/.test(text) && (/^[A-Z{]/.test(text) || / /.test(text)))
    // Not code between two literals, a path, a MIME type or a lowercase class list.
    .filter((text) => !/[=()<>]|^[\s}.,/]|^\w+\/|^[a-z -]+$/.test(text));
}

describe('i18n', () => {
  afterEach(() => setLanguage('en'));

  it('translates every UI string into Chinese and Japanese', () => {
    const keys = new Set<string>([...STAGE_KEYS]);
    for (const file of UI_FILES) {
      const code = SOURCES[file]!.replace(/^import .*$/gm, '');
      uiLiterals(code).filter((text) => !NOT_UI.has(text) && !text.includes('${')).forEach((text) => keys.add(text));
      // Hover hints and export hints, parentheses included (uiLiterals skips text with brackets).
      for (const match of code.matchAll(/(?:hint\(|hint: )'([^'\n]+)'/g)) keys.add(match[1]!);
      for (const match of code.matchAll(/hint\([^)]*?\? '([^']+)' : '([^']+)'/g)) keys.add(match[1]!).add(match[2]!);
    }
    [...Object.values(PRESET_HINTS), ...Object.values(ROOF_HINTS)].forEach((text) => keys.add(text));
    for (const context of ERROR_CONTEXTS) for (const code of ERROR_CODES) keys.add(errorStatus(context, new CodedError(code, 'x')).key);
    for (const action of [{ kind: 'clearZones', hidden: 0 }, { kind: 'clearZones', hidden: 2 }, { kind: 'clearManual', added: 1, removed: 1, customised: 1 }, { kind: 'resetCustomised', count: 2 }, { kind: 'removeSupports', count: 2 }, { kind: 'deleteObjects', count: 2 }, { kind: 'openProject', name: 'a.mixodental' }, { kind: 'clearSelection', ids: ['a'], unitId: 'u' }, { kind: 'regenerate', message: regeneratedStatus('x', 1, { added: 1, removed: 1, reset: 1, customisedKept: 0, customisedReset: 0 }) }] as const) {
      const { message } = undoToast(1, action);
      keys.add(message.key);
      if (message.other) keys.add(message.other);
    }
    for (const group of SETTING_GROUPS) {
      keys.add(group.title);
      for (const field of group.fields) {
        if ('label' in field) keys.add(field.label);
        if ('hint' in field && field.hint) keys.add(field.hint);
        if (field.kind === 'text') keys.add(field.placeholder);
        if (field.kind === 'choice') field.options.forEach((option) => keys.add(option.label));
      }
    }
    expect(keys.size).toBeGreaterThan(150);
    for (const [lang, dictionary] of Object.entries(DICTIONARY)) {
      expect([...keys].filter((key) => !(key in dictionary)), lang).toEqual([]);
    }
  });

  it('joins a message and the sentence that follows it', () => {
    setLanguage('ja');
    expect(translateMessage({ key: 'Regenerated {n} objects.', vars: { n: 2 }, then: { key: '{n} customised kept, {m} reset.', vars: { n: 3, m: 1 } } })).toBe('2 個のオブジェクトを再生成しました。 個別設定 3 本を保持、1 本をリセット。');
  });

  it('translates every label, hint and reason of every command', () => {
    const keys = new Set<string>();
    const named = STEP_KINDS.map((kind) => ({ ...READY, undoStep: kind, redoStep: kind }));
    for (const state of [...STATES, ...named]) {
      for (const id of COMMAND_IDS) {
        const command = resolve(id, state);
        if (!command.visible) continue;
        expect(command.label.length + command.hint.length, id).toBeGreaterThan(0);
        for (const key of [command.label, command.hint, command.disabledReason?.key, command.disabledReason?.other]) if (key) keys.add(key);
      }
    }
    expect(keys.size).toBeGreaterThan(25);
    for (const [lang, dictionary] of Object.entries(DICTIONARY)) {
      expect([...keys].filter((key) => !dictionary[key]), lang).toEqual([]);
    }
  });

  it('knows every progress stage the workers post', () => {
    const stages = new Set<string>();
    for (const code of Object.values(SOURCES)) {
      for (const match of code.matchAll(/[pP]rogress\??\.?\(\s*[^,()]+(?:\([^)]*\))?[^,()]*,\s*'([^']+)'/g)) stages.add(match[1]!);
    }
    expect(stages.size).toBeGreaterThan(5);
    expect([...stages].filter((stage) => !(STAGE_KEYS as readonly string[]).includes(stage))).toEqual([]);
  });

  it('keeps the same placeholders in every translation', () => {
    for (const [lang, dictionary] of Object.entries(DICTIONARY)) {
      for (const [key, value] of Object.entries(dictionary)) {
        const names = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
        expect(names(value), `${lang}: ${key}`).toEqual(names(key));
      }
    }
  });

  it('fills placeholders, picks plurals and falls back to English', () => {
    expect(t('{n} triangles', { n: 12 })).toBe('12 triangles');
    expect(plural(1, '1 object', '{n} objects')).toBe('1 object');
    expect(plural(3, '1 object', '{n} objects')).toBe('3 objects');
    setLanguage('ja');
    expect(t('{n} objects', { n: 3 })).toBe('3 個のオブジェクト');
    expect(translateMessage(undoToast(1, { kind: 'deleteObjects', count: 2 }).message)).toBe('2 個のオブジェクトを削除しました。');
    expect(t('Not a key')).toBe('Not a key');
    setLanguage('zh-Hant');
    expect(t('Support Edit Mode')).toBe('支撐編輯模式');
  });

  it('detects the language from storage, then the browser', () => {
    const languages = (list: string[]) => Object.defineProperty(globalThis, 'navigator', { value: { languages: list, language: list[0] }, configurable: true });
    languages(['ja-JP', 'en']);
    expect(detectLanguage()).toBe('ja');
    languages(['zh-TW']);
    expect(detectLanguage()).toBe('zh-Hant');
    languages(['de-DE', 'zh-CN']);
    expect(detectLanguage()).toBe('zh-Hant');
    languages(['fr']);
    expect(detectLanguage()).toBe('en');
  });

  it('keeps zh-Hant in Taiwan wording, free of mainland terms', () => {
    const MAINLAND = ['文件', '默認', '界面', '設置', '對象', '信息', '鼠標', '打印', '軟件', '質量', '視頻', '屏幕', '菜單', '網絡', '數據', '加載', '創建', '用戶', '保存'];
    const text = Object.values(DICTIONARY['zh-Hant']).join(' ');
    expect(MAINLAND.filter((term) => text.includes(term))).toEqual([]);
  });
});
