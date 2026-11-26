import { describe, expect, it } from 'vitest';
import { defaultGraph, flatBaseGraph, setParam } from './orientGraph.mjs';
import { STANDARD_CHOICES, choicesChanged, composeTurns, previewLabel, restTurn, sideChoices, turnFor } from './sidePreview.mjs';

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

  // The live turn: labels along the axes (front +y, teeth +z, left +x), the run standing on its Back leaning to Teeth.
  const SIDES = [
    { name: 'Front', position: [0, 10, 0] }, { name: 'Back', position: [0, -10, 0] },
    { name: 'Teeth side', position: [0, 0, 5] }, { name: 'Tissue side', position: [0, 0, -5] },
    { name: 'Left', position: [3, 0, 0] }, { name: 'Right', position: [-3, 0, 0] },
  ];
  const apply = (r: number[], v: number[]) => [0, 1, 2].map((i) => r[i * 3]! * v[0]! + r[i * 3 + 1]! * v[1]! + r[i * 3 + 2]! * v[2]!).map((c) => Math.round(c * 1e9) / 1e9 + 0);

  it('turns nothing when the choices are the run\'s', () => {
    expect(turnFor(SIDES, STANDARD_CHOICES, STANDARD_CHOICES)).toBeNull();
  });

  it('a front flip stands the other end on the plate: front goes where back was, the teeth side stays', () => {
    const turn = turnFor(SIDES, STANDARD_CHOICES, sideChoices(setParam(defaultGraph(), 'UP', 'front', 'other'))!)!;
    expect(apply(turn.rotation, [0, 1, 0])).toEqual([0, -1, 0]);
    expect(apply(turn.rotation, [0, 0, 1])).toEqual([0, 0, 1]);
  });

  it('a new plate side turns that side to the plate and the new lean side to where the run leaned', () => {
    const now = sideChoices(setParam(setParam(defaultGraph(), 'POSE', 'plate', 'tissue'), 'POSE', 'leanToward', 'front'))!;
    const turn = turnFor(SIDES, STANDARD_CHOICES, now)!;
    expect(apply(turn.rotation, [0, 0, -1])).toEqual([0, -1, 0]);
    expect(apply(turn.rotation, [0, 1, 0])).toEqual([0, 0, 1]);
    expect(turnFor(SIDES.slice(1), STANDARD_CHOICES, now)).toBeNull();
  });

  // Owner 2026-11-24: the Orient tab shows the part at rest - plate side straight down - not leaning at the print angle.
  it('stands a leaning part back on its plate side, and leaves an upright one alone', () => {
    const deg = 10 * Math.PI / 180;
    const lean = (v: number[]) => [v[0]!, v[1]! * Math.cos(deg) - v[2]! * Math.sin(deg), v[1]! * Math.sin(deg) + v[2]! * Math.cos(deg)];
    const leaning = SIDES.map((s) => ({ ...s, position: lean(s.position) }));
    const rest = restTurn(leaning, 'Back')!;
    expect(apply(rest.rotation, lean([0, -1, 0]))).toEqual([0, -1, 0]);
    expect(apply(rest.rotation, lean([0, 0, 1]))).toEqual([0, 0, 1]);
    expect(restTurn(SIDES, 'Back')).toBeNull();
    expect(restTurn(leaning, null)).toBeNull();
    expect(restTurn(leaning.slice(1), 'Back')).toBeNull();
    // A live side turn first, then the rest turn: the composed turn is the two applied in that order.
    const turn = turnFor(leaning, STANDARD_CHOICES, sideChoices(setParam(defaultGraph(), 'UP', 'front', 'other'))!)!;
    const both = composeTurns(turn, rest)!;
    expect(apply(both.rotation, [1, 2, 3])).toEqual(apply(rest.rotation, apply(turn.rotation, [1, 2, 3])));
    expect(composeTurns(null, rest)).toBe(rest);
  });

  it('a new plate side moves the marks to the sides chosen', () => {
    const now = sideChoices(setParam(setParam(defaultGraph(), 'POSE', 'plate', 'tissue'), 'POSE', 'leanToward', 'front'))!;
    expect(label(now)).toEqual(['Front · rises as it leans', 'Back', 'Teeth side', 'Tissue side · on the plate', 'Left', 'Right']);
  });
});
