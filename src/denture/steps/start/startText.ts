import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/*
 * The words of the start screen's file step for each job kind (English keys, translated by t()).
 * One table, so the aligner and denture screens stay one component.
 */

export interface FileStepText {
  /** The big line: what to do. The drop box on the start screen and in Step 1 both show this one. */
  heading: string;
  /** The small line under it: what the reader cannot see for themselves. */
  hint: string;
  input: string;
  /** The status line while the step waits for the file. */
  status: string;
}

const TEXT: Record<DentalKind, FileStepText> = {
  aligner: { heading: 'Place the aligner file here', hint: 'Drag an STL here, or choose one below. It is checked and turned the right way up automatically.', input: 'Choose aligner file', status: 'Place the aligner STL, or choose it.' },
  denture: { heading: 'Place the denture file here', hint: 'Drag an STL here, or choose one below. It is checked and stood upright automatically.', input: 'Choose denture file', status: 'Place the denture STL, or choose it.' },
};

/** The file step's heading, hint, file-input label and status line for `kind`. */
export const fileStepText = (kind: DentalKind): FileStepText => TEXT[kind];
