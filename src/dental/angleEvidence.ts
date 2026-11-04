import { tiltLabel, type TiltRow, type TiltRule, type TiltScan } from '@mixo-geocore/host/dental/dentalTilt';

/*
 * WHY THIS PRINT ANGLE, IN THE READER'S WORDS.
 *
 * The print-angle search measures a great deal at every angle it tries - four hard rules, the widest rim
 * gap, the most slender column, the largest solid layer, the build height, how many supports land on the
 * fitting side - and until now the app showed none of it. A reader who asked "why 34.5 and not 40?" had
 * nothing to look at: the dial gave them a number and the app gave them no reason for it.
 *
 * NOTHING HERE RUNS THE ENGINE. Every number is already in the scan the step ran once, sitting in memory;
 * this module only reads the row the dial is on and turns it into lines. That is the whole reason this is
 * worth having - the most useful thing the debug tool can show costs nothing to show.
 *
 * It is shaped as data, with no React in it, so the batch review can print the same account of a case as
 * the app shows on screen (as `orientationEvidence` already does for Step 1's orientation).
 */

/** What a rule means when it fails, in plain words rather than the engine's short name. */
export const RULE_WORDS: Record<TiltRule, string> = {
  'resin-trap': 'Resin would be trapped in a pocket',
  'rim-gap': 'The rim sits too far off the plate',
  crossing: 'Supports would cross the model',
  'too-thin': 'A column would print too slender',
};

/** One measured fact about an angle: its name, its value as shown, and its unit (empty for a count). */
export interface AngleFact {
  /** A stable key, for `data-ui` and for a test to name a row. */
  id: string;
  label: string;
  value: string;
  unit: string;
}

/** Everything the app can say about the angle the dial is on, all read from the scan already in memory. */
export interface AngleEvidence {
  /** The angle as the dial and the scene write it: one decimal, the same `tiltLabel` they use. */
  deg: string;
  /** True when this angle passes every rule with room to spare, not merely passes. */
  robust: boolean;
  /** The rules this angle fails, in plain words; empty when it passes them all. */
  broken: string[];
  /** The measurements behind the verdict. */
  facts: AngleFact[];
  /** True when this is the angle the search itself picked. */
  isPick: boolean;
  /** The run of robust angles around the pick, as degrees written the same way, when there is one. */
  band: [string, string] | undefined;
}

const round = (value: number, places: number): string => {
  const factor = 10 ** places;
  return (Math.round(value * factor) / factor).toString();
};

/** The facts of one row, in the order a reader would ask for them. */
function factsOf(row: TiltRow): AngleFact[] {
  return [
    { id: 'tips', label: 'Supports on the fitting side', value: round(row.fittingSideTips, 0), unit: '' },
    { id: 'gap', label: 'Widest rim gap', value: round(row.largestGapMm, 2), unit: 'mm' },
    { id: 'slender', label: 'Most slender column', value: round(row.largestSlenderness, 2), unit: '' },
    { id: 'layer', label: 'Largest solid layer', value: round(row.largestLayerMm2, 1), unit: 'mm²' },
    { id: 'height', label: 'Build height', value: round(row.heightMm, 1), unit: 'mm' },
  ];
}

/**
 * What the scan measured at the row the dial is on. `undefined` when there is no scan to read - the search
 * failed, or the reader turned the aligner by hand past the rows it tried, and inventing a verdict for an
 * angle nothing measured is exactly the thing this module exists not to do.
 */
export function angleEvidence(scan: TiltScan | undefined, index: number): AngleEvidence | undefined {
  if (!scan || scan.kind !== 'scan') return undefined;
  const row = scan.rows[index];
  if (!row) return undefined;
  const band = scan.band && scan.rows[scan.band[0]] && scan.rows[scan.band[1]]
    ? [tiltLabel(scan.rows[scan.band[0]]!.tiltDeg), tiltLabel(scan.rows[scan.band[1]]!.tiltDeg)] as [string, string]
    : undefined;
  return {
    // Written exactly as the dial and the reading in the scene write it. A profile's angles are not whole
    // numbers, and the raw value carries ten decimals: a panel that said 32.4577512332 where the dial said
    // 32.5 would read as two different angles.
    deg: tiltLabel(row.tiltDeg),
    robust: row.robust,
    broken: row.failed.map((failure) => RULE_WORDS[failure.rule]),
    facts: factsOf(row),
    isPick: scan.order[0] === index,
    band,
  };
}
