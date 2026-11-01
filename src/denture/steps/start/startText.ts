import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/*
 * The words of the start screen's file step for each job kind (English keys, translated by t()).
 * One table, so the aligner and denture screens stay one component.
 */

export interface FileStepText {
  heading: string;
  drop: string;
  input: string;
  /** The status line while the step waits for the file. */
  status: string;
}

const TEXT: Record<DentalKind, FileStepText> = {
  aligner: { heading: 'Open the aligner STL', drop: 'Drop the aligner STL here', input: 'Choose aligner file', status: 'Open or drop the aligner STL.' },
  denture: { heading: 'Open the denture STL', drop: 'Drop the denture STL here', input: 'Choose denture file', status: 'Open or drop the denture STL.' },
};

/** The file step's heading, drop line, file-input label and status line for `kind`. */
export const fileStepText = (kind: DentalKind): FileStepText => TEXT[kind];
