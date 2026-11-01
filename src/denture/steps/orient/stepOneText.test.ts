import { describe, expect, it } from 'vitest';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { stepOneText } from './stepOneText';

describe('stepOneText', () => {
  it('names the denture step and profile', () => {
    const text = stepOneText('reference-denture', 'en');
    expect(text.title).toBe('Step 1 · Denture');
    expect(text.profileName).toBe('Partial denture');
    expect(stepOneText('reference-denture', 'ja').profileName).toBe(dentureProfileData('reference-denture').name.ja);
  });

  it('keeps the aligner words for an aligner', () => {
    expect(stepOneText('reference-aligner', 'en')).toMatchObject({ title: 'Step 1 · Aligner', waiting: 'Add the aligner STL.' });
  });
});
