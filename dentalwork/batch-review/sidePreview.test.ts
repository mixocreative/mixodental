import { describe, expect, it } from 'vitest';
import { defaultGraph, flatBaseGraph, setParam } from './orientGraph.mjs';
import { STANDARD_CHOICES, choicesChanged, previewLabel, sideChoices } from './sidePreview.mjs';

const SIX = ['Front', 'Back', 'Teeth side', 'Tissue side', 'Left', 'Right'];
const label = (now: typeof STANDARD_CHOICES) => SIX.map((name) => previewLabel(name, STANDARD_CHOICES, now));

describe('the side labels follow the Orient choices before Apply', () => {
  it('reads the standard Step 1 as today\'s choices, and the flat-base recipe as having none', () => {
    expect(sideChoices(defaultGraph())).toEqual(STANDARD_CHOICES);
    expect(sideChoices(flatBaseGraph())).toBeNull();
  });

  it('marks where the part stands and which side rises, and nothing else, when nothing changed', () => {
    expect(label(STANDARD_CHOICES)).toEqual(['Front', 'Back · on the plate', 'Teeth side · rises as it leans', 'Tissue side', 'Left', 'Right']);
    expect(choicesChanged(STANDARD_CHOICES, STANDARD_CHOICES)).toBe(false);
  });

  it('a front flip turns the part round: Front and Back trade, and Left and Right with them', () => {
    const now = sideChoices(setParam(defaultGraph(), 'UP', 'front', 'other'))!;
    expect(label(now)).toEqual(['Back · on the plate', 'Front', 'Teeth side · rises as it leans', 'Tissue side', 'Right', 'Left']);
    expect(choicesChanged(STANDARD_CHOICES, now)).toBe(true);
  });

  it('a teeth flip turns it over: Teeth and Tissue trade, Left and Right with them; both flips keep Left and Right', () => {
    const teeth = sideChoices(setParam(defaultGraph(), 'UP', 'teethSide', 'other'))!;
    expect(label(teeth)).toEqual(['Front', 'Back · on the plate', 'Tissue side', 'Teeth side · rises as it leans', 'Right', 'Left']);
    const both = sideChoices(setParam(setParam(defaultGraph(), 'UP', 'teethSide', 'other'), 'UP', 'front', 'other'))!;
    expect(label(both).slice(4)).toEqual(['Left', 'Right']);
  });

  it('a new plate side moves the marks to the sides chosen', () => {
    const now = sideChoices(setParam(setParam(defaultGraph(), 'POSE', 'plate', 'tissue'), 'POSE', 'leanToward', 'front'))!;
    expect(label(now)).toEqual(['Front · rises as it leans', 'Back', 'Teeth side', 'Tissue side · on the plate', 'Left', 'Right']);
  });
});
