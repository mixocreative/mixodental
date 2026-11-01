import { describe, expect, it } from 'vitest';
import { fileStepText } from './startText';

describe('fileStepText', () => {
  it('names the file the job needs', () => {
    expect(fileStepText('aligner').input).toBe('Choose aligner file');
    expect(fileStepText('denture')).toEqual({ heading: 'Open the denture STL', drop: 'Drop the denture STL here', input: 'Choose denture file' });
  });
});
