import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { proposeDentalOrientation } from '@mixo-geocore/host/dental/dental';
import { defaultSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { runSupportJob } from '@mixo-geocore/host/supports/jobRunner';
import { placeImportedUnits } from '../../src/state/import';
import { inverseTransformDirection, inverseTransformPoint, transformPoint } from '@mixo-geocore/host/state/transform';
import { buildDentalReview } from './build';
import { dentalStructureOf, dentalSupportSettings } from '../../src/dental/supportPreset';
import { parseStl } from '../test-support/rustImport';
import { REFERENCE_PROFILE } from '../test-support/referenceProfile';

/** The tip ID the placement code derives from a unit-local position: 0.01 mm rounding. */
const positionId = (position: readonly number[]): string => `auto-${position.map((value) => Math.round(value * 100)).join('_')}`;

const reference = () => {
  const bytes = readFileSync('docs/dental-reference/reference-aligner.stl');
  return parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
};

describe('dental import and preview parity', () => {
  it('reviews the same centred source mesh used after browser import', () => {
    const unit = placeImportedUnits([{ name: 'reference', mesh: reference() }], [],
      { lift: defaultSupportSettings.liftHeight, createId: () => 'reference' })[0]!;
    const review = buildDentalReview(unit.source);
    expect(review.kind).toBe('proposal');
    if (review.kind !== 'proposal') return;
    expect(review.supports.droppedByPath).toBeUndefined();
    const retained = new Set(review.supports.components.flatMap((part) => part.contactId ? [part.contactId] : []));
    // 94 placed primaries (71 outer, 23 opening, evenly spaced; none closer than 0.6 mm). Since engine 26
    // (routing: outline last resort, aligned cone, leans) every one of them is built where it was placed:
    // none is moved to an alternate, none is left out, and no brace is pruned (no fallback). Before, at the
    // profile's pose in this centred frame (B2 with D20 and D21, Tree off), 2 were moved, 1 crossing primary
    // was left out (93 built) and the crossing brace segments were pruned (brace-pruned).
    const placed = new Set(review.placement.points.map((point) => point.id));
    expect(placed.size).toBe(94);
    expect(retained.size).toBe(94);
    expect([...retained].filter((id) => !placed.has(id))).toHaveLength(0);
    expect([...placed].filter((id) => !retained.has(id))).toHaveLength(0);
    expect(review.supports.dropped).toHaveLength(0);
    expect(review.supports.dentalStructureFallback).toBeUndefined();
  }, 180000);

  it('keeps dental automatic contact IDs the same in preview and export', () => {
    const mesh = reference();
    const review = buildDentalReview(mesh);
    expect(review.kind).toBe('proposal');
    if (review.kind !== 'proposal') return;
    const orientation = proposeDentalOrientation(mesh, REFERENCE_PROFILE);
    expect(orientation.kind).toBe('proposal');
    if (orientation.kind !== 'proposal') return;
    const turn = { position: [0, 0, 0] as [number, number, number], rotation: review.frame.rotation };
    const localPoints = review.placement.points.map((point) => ({ ...point,
      position: inverseTransformPoint(turn, point.position), normal: inverseTransformDirection(turn, point.normal) }));
    // The settings and switches the review built with: the profile's Step 3 defaults.
    const supportJob = { mesh, dental: { kind: 'two-contour' as const, profileId: REFERENCE_PROFILE, rim: orientation.rim, region: review.region, stamps: [],
      structure: dentalStructureOf(REFERENCE_PROFILE) },
      frame: review.frame, settings: { ...dentalSupportSettings(REFERENCE_PROFILE, defaultSupportSettings), roofSeededModes: [] },
      contacts: { points: localPoints, manual: [], deleted: [], zones: [], contactSettings: {} },
      labelText: 'A', mode: 'preview' as const };
    const preview = runSupportJob(supportJob);
    const ids = (supports: typeof preview) => [...new Set(supports.components.flatMap((part) => part.contactId ? [part.contactId] : []))].sort();
    expect(ids(preview)).toEqual(ids(review.supports));
    // Export keeps the same automatic contacts as the preview. (The opt-in path preflight that used to be
    // compared here ran inside the TS builder; it returns, if its measured benefit holds, with the U7 safety engine.)
    const exported = runSupportJob({ ...supportJob, mode: 'export' });
    expect(exported.droppedByPath).toBeUndefined();
    expect(ids(exported)).toEqual(ids(preview));
  }, 180000);
});
