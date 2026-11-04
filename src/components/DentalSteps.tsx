import { useRef } from 'react';
import type { Gesture } from '@mixo-geocore/editing/gesture';
import type { SessionEvent } from '@mixo-geocore/editing/session';
import type { DentalNotice } from '../dental/editingMode';
import { ALIGNER_PROFILES } from '@mixo-geocore/host/dental/alignerProfiles';
import { t, translateMessage, type Lang } from '../i18n';
import { TiltDial } from '../ui/parts/TiltDial';
import { ChoiceKey } from '../ui/ChoiceKey';
import { RestoreStepButton, type StepRestore } from './RestoreStepButton';
import { Icon } from '../ui/Icon';
import { ScreenHeading } from '../ui/ScreenHeading';
import { tiltStepOf } from '../denture/jobKind';
import { fileStepText } from '../denture/steps/start/startText';
import { kindMessage, kindText } from '../denture/kindText';
import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import { tiltLabel, type TiltRow, type TiltRule } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentalTiltState } from './useDentalFlow';

/** The problem-list name of each print-angle rule. */
export const TILT_RULE_NAMES: Record<TiltRule, string> = {
  'resin-trap': 'resin trap',
  'rim-gap': 'gap in the rim supports',
  crossing: 'support crossing the aligner',
  'too-thin': 'support too thin for its height',
};

/** The rules a tilt fails, by name (empty when it passes every rule). */
export function tiltFlags(row: TiltRow): string[] {
  return row.failed.map((failure) => t(TILT_RULE_NAMES[failure.rule]));
}

/** How the chosen print angle stands: its broken rules, or that it passes them all. Undefined while scanning. */
export function tiltNote(tilt: DentalTiltState): string | undefined {
  if (tilt.status !== 'ready') return undefined;
  const flags = tiltFlags(tilt.scan.rows[tilt.index]!);
  return flags.length > 0 ? flags.join(' · ') : t('Passes every rule.');
}

/** The problem-list entries of a pick when no tilt passes: per failed rule, the tilt and the first failing vertex or tip. */
export function tiltProblems(row: TiltRow): string[] {
  return row.failed.map((failure) => t('{rule} at {n}° ({at})', { rule: t(TILT_RULE_NAMES[failure.rule]), n: tiltLabel(row.tiltDeg), at: failure.at }));
}

/** The Step 0 card art of each aligner type: the icon file that draws its top view. */
const CARD_ICON: Record<string, string> = { 'reference-aligner': 'aligner' };

/** The message of one notice, in the words of Step 1 and Step 2 (a refused file in the words of the job `kind`). */
export function noticeText(notice: DentalNotice, kind?: DentalKind): string {
  switch (notice.kind) {
    case 'bad-file': return translateMessage(kindMessage(notice.message, kind));
    case 'failed': return t('The aligner could not be oriented automatically. It stays as dropped: rotate it with the gizmo, then press Next.');
    case 'denture-failed': return t('The denture could not be stood upright automatically. It stays as dropped: use Free transform to turn it, then press Next.');
    case 'uncertain': return t('Automatic orientation is uncertain. The aligner stays as dropped: adjust it with the rotation gizmo, then press Next.');
    case 'holes': return t('This file has holes or non-manifold geometry. Detection may be unreliable: check the result before you continue.');
    case 'mismatch': return t('This looks like a different aligner type: no central opening was found.');
    case 'no-area': return t('No support area was detected on this aligner. Mark where supports may go. Next stays off until some area is marked.');
    case 'angle-moved': return t('Print angle moved to {n}°', { n: notice.deg });
  }
}

/** Step 0: one large card per aligner profile; a click selects it and goes to Step 1. */
export function DentalTypeStep({ profile, lang, send, onChoose }: {
  profile: string | undefined;
  lang: Lang;
  send: (event: SessionEvent) => void;
  /** The full-screen start chooses the type itself instead of sending the session event. */
  onChoose?: (id: string) => void;
}) {
  return <div className="dental-stage" role="group" aria-label={t('Aligner type')}>
    <ScreenHeading>{t('Choose the aligner type')}</ScreenHeading>
    <div className="choice-keys">
      {ALIGNER_PROFILES.map((entry) => <ChoiceKey key={entry.id} icon={CARD_ICON[entry.id] ?? 'generic'}
        label={entry.name[lang]} note={entry.description[lang]} ui={`type-${entry.id}`} pressed={profile === entry.id}
        onChoose={() => (onChoose ? onChoose(entry.id) : send({ type: 'chooseDentalProfile', id: entry.id }))} />)}
    </div>
  </div>;
}

/** Step 1 before an aligner is oriented: the drop zone and upload button, or the loading line. */
export function DentalAlignerPrompt({ phase, notices, selectedName, onFiles, onUseSelected, kind = 'aligner' }: {
  phase: Extract<Gesture, { kind: 'dental-aligner' }>['phase'];
  /** The job kind: its own words for the file and the loading line. */
  kind?: DentalKind;
  notices: readonly DentalNotice[];
  selectedName: string | undefined;
  onFiles: (files: File[]) => void;
  onUseSelected: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  if (phase === 'loading') return <div className="dental-stage" role="status" aria-busy="true">
    <ScreenHeading>{t(kindText('Checking and orienting the aligner…', kind))}</ScreenHeading>
  </div>;
  const bad = notices.find((notice) => notice.kind === 'bad-file');
  return <div className="dental-stage">
    <div className="dental-drop">
      <ScreenHeading>{t(fileStepText(kind).heading)}</ScreenHeading>
      <p>{t(fileStepText(kind).hint)}</p>
      <input ref={input} type="file" accept=".stl,.glb,.gltf" aria-label={t(fileStepText(kind).input)} hidden
        onChange={(event) => { onFiles([...(event.target.files ?? [])]); event.target.value = ''; }} />
      <div className="edit-row">
        <button type="button" className="primary key-art" onClick={() => input.current?.click()}><Icon name="drop-file" />{t('Choose STL file')}</button>
        {selectedName ? <button type="button" onClick={onUseSelected}>{t('Use the selected model')}</button> : null}
      </div>
      {bad ? <p className="dental-problem" role="alert">{noticeText(bad, kind)}</p> : null}
    </div>
  </div>;
}

/**
 * Step 1's print angle (docs/ROADMAP.md F): the scan's progress, then the chosen angle with the
 * stable band, a slider over the type's tilt range (band highlighted) and that tilt's rule flags.
 */
export function PrintAngleField({ tilt, profile, onChoose, restore }: {
  tilt: DentalTiltState;
  profile: string;
  onChoose: (index: number) => void;
  /** Put back, as a round key in the dial's bottom-right corner. */
  restore?: StepRestore | undefined;
}) {
  if (tilt.status === 'scanning') return <p className="edit-note" role="status">{t('Scanning print angles {i}/{n}', { i: tilt.done, n: tilt.total })}</p>;
  if (tilt.status === 'failed') return <p className="edit-note" role="alert">{t('The print angles could not be scanned. The detected angle is kept.')}</p>;
  const { scan, index } = tilt;
  const tiltStepDeg = tiltStepOf(profile);
  const row = scan.rows[index]!;
  const band = scan.band ? [scan.rows[scan.band[0]]!.tiltDeg, scan.rows[scan.band[1]]!.tiltDeg] as const : undefined;
  const flags = tiltFlags(row);
  const pick = scan.rows[scan.order[0]!]!;
  return <div className="print-angle" role="group" aria-label={t('Print angle')}>
    {/* The dial DRAWS the stable band, so the line that said it in words was saying it twice. It stays for a
        screen reader, which cannot see the band. */}
    <p className="orient-range visually-hidden" role="status">{band
      ? t('Stable {a}–{b}°', { a: tiltLabel(band[0]), b: tiltLabel(band[1]) })
      : t('No stable angle')}</p>
    <TiltDial min={scan.rows[0]!.tiltDeg} max={scan.rows.at(-1)!.tiltDeg} step={tiltStepDeg} value={row.tiltDeg} band={band} label={t('Print angle')}
      onChange={(value) => {
        const nearest = scan.rows.reduce((best, candidate, at) => (Math.abs(candidate.tiltDeg - value) < Math.abs(scan.rows[best]!.tiltDeg - value) ? at : best), 0);
        if (nearest !== index) onChoose(nearest);
      }} />
    {restore ? <RestoreStepButton restore={restore} unique="restore-step-1" round /> : null}
    {scan.reason === 'failing' ? <ul className="problems" aria-label={t('No print angle passes every rule.')}>
      <li><span className="problem-kind angle" aria-hidden="true" /><span className="problem-text">{t('No print angle passes every rule.')}
        {tiltProblems(pick).map((line) => <small key={line}>{line}</small>)}</span></li>
    </ul> : null}
  </div>;
}
