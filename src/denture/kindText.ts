import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';
import type { Message } from '../i18n';

/*
 * The dental flow's words that name the job's object (Round D). The shared dental screens were written for the
 * aligner; each of their lines that names it has its denture line here, once. Callers keep the aligner sentence as
 * the key and ask `kindText` for the job's own; t() translates the result, so both sentences have ja and zh-Hant
 * entries. A key with no denture line is the same for both kinds.
 */

const DENTURE: Readonly<Record<string, string>> = {
  'Drop an aligner STL, or choose one. It is oriented automatically; adjust with the gizmo, then press Next.':
    'Drop a denture STL, or choose one. It is stood upright automatically; turn it with Free transform if needed, then press Next.',
  'Left the aligner on the plate without supports.': 'Left the denture on the plate without supports.',
  'No orientation was proposed for this aligner.': 'No orientation was proposed for this denture.',
  'Add an aligner first.': 'Add a denture first.',
  'Rotate the aligner to the proposed orientation again': 'Rotate the denture to the proposed orientation again',
  'Leave the dental flow. The aligner stays on the plate without supports': 'Leave the dental flow. The denture stays on the plate without supports',
  'Finish this aligner. It stays on the plate with its supports': 'Finish this denture. It stays on the plate with its supports',
  'Add another aligner': 'Add another denture',
  'Finish this aligner and add the next one of the same type': 'Finish this denture and add the next one',
  'Finished {n} aligner on the plate. Export STL or Save project to keep it.': 'Finished {n} denture on the plate. Export STL or Save project to keep it.',
  'Finished {n} aligners on the plate. Export STL or Save project to keep them.': 'Finished {n} dentures on the plate. Export STL or Save project to keep them.',
  '{name} finished. Add the next aligner of the same type.': '{name} finished. Add the next denture.',
  '{n} aligner finished and ready on the plate. Export STL (right panel) or Save project to keep your work.':
    '{n} denture finished and ready on the plate. Export STL (right panel) or Save project to keep your work.',
  '{n} aligners finished and ready on the plate. Export STL (right panel) or Save project to keep your work.':
    '{n} dentures finished and ready on the plate. Export STL (right panel) or Save project to keep your work.',
  'click the aligner to add one; right-click or Ctrl+click removes.': 'click the denture to add one; right-click or Ctrl+click removes.',
  'Diameter of each support tip where it touches the aligner': 'Diameter of each support tip where it touches the denture',
  'How high the aligner stands above the plate. Supports are placed again': 'How high the denture stands above the plate. Supports are placed again',
  'Letters, digits and "-" only, up to 8. Embossed on the raft so printed aligners can be told apart':
    'Letters, digits and "-" only, up to 8. Embossed on the raft so printed dentures can be told apart',
  'Aligners finished so far: {n}': 'Dentures finished so far: {n}',
  'This aligner has too many triangles ({n}) for the dental flow. Simplify the file and drop it again.':
    'This denture has too many triangles ({n}) for the dental flow. Simplify the file and drop it again.',
  'Checking and orienting the aligner…': 'Checking and orienting the denture…',
  'The aligner is checked and turned the right way up automatically.': 'The denture is checked and stood upright automatically.',
  // Step 2 (P7c): one short line, and the support settings in plain words.
  'Review the supports, adjust the settings, then press OK.': 'Check the supports, then press OK.',
  'Review the supports: change the settings, add or delete supports, fix the problems, then press OK.': 'Check the supports, then press OK.',
  'Pillar size': 'Support thickness',
  'Lift height': 'Lift from plate',
  'Cross-braces': 'Extra bracing',
  'Cross-braces were omitted because they crossed the model. Review the supports before finishing.': 'Extra bracing was left out because it crossed the denture. Check the supports before you finish.',
  'Some cross-braces were left out where they crossed the model. Review the supports before finishing.': 'Some extra bracing was left out where it crossed the denture. Check the supports before you finish.',
  // Problem list `outside` entries: only an aligner policy reports islands outside its area today; the denture line keeps a mixed plate honest.
  '1 low point lies outside the dental support area and is left to the aligner shape.': '1 low point lies outside the allowed support area and is left to the denture shape.',
  '{n} low points lie outside the dental support area and are left to the aligner shape.': '{n} low points lie outside the allowed support area and are left to the denture shape.',
};

/** The line `key` (an aligner sentence) in the words of `kind`; the key itself for the aligner, an unknown kind or a key with no denture line. */
export const kindText = (key: string, kind: DentalKind | undefined): string => (kind === 'denture' ? DENTURE[key] ?? key : key);

/** `message` (its sentence, plural and following sentence) in the words of `kind`. */
export function kindMessage(message: Message, kind: DentalKind | undefined): Message {
  if (kind !== 'denture') return message;
  return {
    ...message,
    key: kindText(message.key, kind),
    ...(message.other ? { other: kindText(message.other, kind) } : {}),
    ...(message.then ? { then: kindMessage(message.then, kind) } : {}),
  };
}

/** Every aligner sentence that has a denture line (the i18n test checks both are translated). */
export const KIND_TEXT_KEYS: readonly string[] = Object.keys(DENTURE);
