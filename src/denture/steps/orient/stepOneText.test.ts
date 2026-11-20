import { describe, expect, it } from 'vitest';
import { dentureProfileData } from '@mixo-geocore/host/dental/dentureProfiles';
import { stepOneText } from './stepOneText';

describe('stepOneText', () => {
  it('names the denture step and profile', () => {
    const text = stepOneText('reference-denture', 'en');
    expect(text.title).toBe('Print angle');
    expect(text.profileName).toBe('Generic denture');
    expect(stepOneText('reference-denture', 'ja').profileName).toBe(dentureProfileData('reference-denture').name.ja);
  });

  it('keeps the aligner words for an aligner', () => {
    expect(stepOneText('reference-aligner', 'en')).toMatchObject({ title: 'Print angle', waiting: 'Add the aligner STL.' });
  });
});
