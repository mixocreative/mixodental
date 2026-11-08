import { describe, expect, it } from 'vitest';
import { isBuilding, isSettled, meshesOf, rimGap, withGeometry } from './buildViews';
import { releaseBuild, type HeldBuild } from './releasedBuild';
import type { DentalRimCoverage, GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintUnit } from '../state/project';

/** A unit that has asked for supports. Each call is a NEW object: these tests turn on identity. */
const unit = (id: string, over: Partial<PrintUnit> = {}) =>
  ({ id, supports: { kind: 'k', data: {} }, ...over } as unknown as PrintUnit);
/** A two-contour aligner — the only kind that gets a rim verdict. */
const aligner = (id: string) => unit(id, { dental: { kind: 'two-contour' } } as unknown as Partial<PrintUnit>);

const rim = (over: Partial<DentalRimCoverage> = {}): DentalRimCoverage => ({
  outer: { perimeterMm: 80, retained: 10, maxGapMm: 4.2, reviewGapMm: 3, needsReview: true },
  opening: { perimeterMm: 60, retained: 8, maxGapMm: 8, reviewGapMm: 3, needsReview: true },
  needsReview: true,
  ...over,
});

const full = (over: Partial<GeneratedSupportMesh> = {}): GeneratedSupportMesh => ({
  positions: new Float32Array(300), indices: new Uint32Array(120), parts: [], components: [], dropped: [],
  ...over,
} as unknown as GeneratedSupportMesh);

const entryFor = (u: PrintUnit, mesh: HeldBuild): UnitBuild<HeldBuild> => ({ unit: u, mesh });
const mapOf = (...entries: UnitBuild<HeldBuild>[]) =>
  new Map(entries.map((entry) => [entry.unit.id, entry]));
const NO_FAILURES: ReadonlyMap<string, PrintUnit> = new Map();

describe('is this build current', () => {
  it('settles only for the unit version the build was made from', () => {
    const shown = unit('a');
    const edited = unit('a'); // same id, edited since: a different object
    const built = mapOf(entryFor(shown, full()));

    expect(isSettled(built, NO_FAILURES, shown)).toBe(true);
    // The trap this guards: matching on id would call a stale build current, and the counts on screen
    // would describe supports the operator has already changed.
    expect(isSettled(built, NO_FAILURES, edited)).toBe(false);
    expect(isBuilding(built, NO_FAILURES, edited)).toBe(true);
  });

  it('settles a failed build, so its counts stop waiting for ever', () => {
    const u = unit('a');
    expect(isBuilding(new Map(), new Map([['a', u]]), u)).toBe(false);
  });

  it('does not call a unit with no supports "building"', () => {
    const plain = unit('a', { supports: undefined });
    expect(isBuilding(new Map(), NO_FAILURES, plain)).toBe(false);
  });
});

describe('the builds that still carry geometry', () => {
  it('leaves out a released build, so a finished unit draws no supports', () => {
    const live = unit('a');
    const done = unit('b');
    const built = mapOf(entryFor(live, full()), releaseBuild(entryFor(done, full({ footprint: [[[0, 0]]] }))));

    const held = withGeometry(built);
    expect([...held.keys()]).toEqual(['a']);
    expect([...meshesOf(held).keys()]).toEqual(['a']);
    // The released entry is still in `built` — the plate packs by its outline.
    expect(built.has('b')).toBe(true);
  });

  it('keeps each held build paired with the unit version it was built from', () => {
    const u = unit('a');
    const held = withGeometry(mapOf(entryFor(u, full())));
    expect(held.get('a')?.unit).toBe(u);
  });
});

describe('the dental rim verdict', () => {
  it('reports both measurements when the rim needs a look', () => {
    const u = aligner('a');
    expect(rimGap(u, entryFor(u, full({ dentalRimCoverage: rim() })))).toEqual({ outerMm: 4.2, openingMm: 8 });
  });

  it('says nothing when the rim was measured and is fine', () => {
    const u = aligner('a');
    const fine = rim({ needsReview: false });
    expect(rimGap(u, entryFor(u, full({ dentalRimCoverage: fine })))).toBeUndefined();
  });

  it('says "unavailable" when the coverage was never computed, rather than implying it passed', () => {
    const u = aligner('a');
    // A mesh built before the rim pass...
    expect(rimGap(u, entryFor(u, full()))).toBe('unavailable');
    // ...and a released build, whose geometry (and so its coverage) is gone.
    expect(rimGap(u, releaseBuild(entryFor(u, full({ dentalRimCoverage: rim() }))))).toBe('unavailable');
  });

  it('withholds a verdict until the build belongs to this version of the unit', () => {
    const shown = aligner('a');
    const edited = aligner('a');
    // An older build's rim says nothing about the unit as it is now: no note, not a stale measurement.
    expect(rimGap(edited, entryFor(shown, full({ dentalRimCoverage: rim() })))).toBeUndefined();
  });

  it('has no verdict for anything but a two-contour aligner', () => {
    const plain = unit('a');
    expect(rimGap(plain, entryFor(plain, full({ dentalRimCoverage: rim() })))).toBeUndefined();
    expect(rimGap(undefined, undefined)).toBeUndefined();
  });
});
