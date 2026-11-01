import type { DentalKind } from '@mixo-geocore/host/dental/dentalKind';

/*
 * The words of the start screen's file step for each job kind (English keys, translated by t()).
 * One table, so the aligner and denture screens stay one component.
 */

export interface FileStepText {
  heading: string;
  drop: string;
  input: string;
}

const TEXT: Record<DentalKind, FileStepText> = {
  aligner: { heading: 'Open the aligner STL', drop: 'Drop the aligner STL here', input: 'Choose aligner file' },
  denture: { heading: 'Open the denture STL', drop: 'Drop the denture STL here', input: 'Choose denture file' },
};

/** The file step's heading, drop line and file-input label for `kind`. */
export const fileStepText = (kind: DentalKind): FileStepText => TEXT[kind];
