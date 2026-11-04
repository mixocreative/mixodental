import { describe, expect, it } from 'vitest';
import { fileStepText } from './startText';

describe('fileStepText', () => {
  it('names the file the job needs', () => {
    expect(fileStepText('aligner').input).toBe('Choose aligner file');
    expect(fileStepText('denture')).toEqual({ heading: 'Place the denture file here', hint: 'Drag an STL here, or choose one below. It is checked and stood upright automatically.', input: 'Choose denture file', status: 'Place the denture STL, or choose it.' });
    expect(fileStepText('aligner').status).toBe('Place the aligner STL, or choose it.');
  });
});
