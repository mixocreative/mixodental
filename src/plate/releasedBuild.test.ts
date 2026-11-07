import { describe, expect, it } from 'vitest';
import { buildBytes, builtGeometry, hasGeometry, releaseBuild, releaseFinished, type HeldBuild } from './releasedBuild';
import { plateFootprints } from './plateLayout';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { UnitBuild } from '@mixo-geocore/host/supports/unitSupports';
import type { PrintUnit } from '../state/project';

const unit = (id: string) => ({ id, supports: { kind: 'k', data: {} }, transform: { position: [0, 0, 0], rotation: [0, 0, 0] } } as unknown as PrintUnit);

const full = (over: Partial<GeneratedSupportMesh> = {}): GeneratedSupportMesh => ({
  positions: new Float32Array(3000),
  indices: new Uint32Array(1200),
  parts: [],
  components: [],
  dropped: ['c-1', 'c-2'],
  droppedByZones: ['c-2'],
  footprint: [[[0, 0], [10, 0], [10, 10]]],
  ...over,
} as unknown as GeneratedSupportMesh);

const build = (id: string, mesh: HeldBuild): UnitBuild<HeldBuild> => ({ unit: unit(id), mesh });

describe('releasing a finished build', () => {
  it('drops the geometry and keeps exactly what the plate and the check list read', () => {
    const held = build('a', full());
    const released = releaseBuild(held);

    expect(hasGeometry(released.mesh)).toBe(false);
    expect(buildBytes(released.mesh)).toBe(0);
    // The three facts that survive, because something still reads each one.
    expect(released.mesh.dropped).toEqual(['c-1', 'c-2']);
    expect(released.mesh.droppedByZones).toEqual(['c-2']);
    expect(released.mesh.footprint).toEqual([[[0, 0], [10, 0], [10, 10]]]);
    // The SAME unit object, by reference: `currentBuild` returns a build only when `latest.unit ===
    // unit`, so releasing must not substitute an equal-looking unit or every released build would
    // read as stale and the plate would lose its outline.
    expect(released.unit).toBe(held.unit);
  });

  it('frees the bytes that made this worth doing', () => {
    const mesh = full();
    expect(buildBytes(mesh)).toBe(3000 * 4 + 1200 * 4);
    expect(buildBytes(releaseBuild(build('a', mesh)).mesh)).toBe(0);
  });

  it('is idempotent by reference, so a no-op cannot cause a re-render', () => {
    const once = releaseBuild(build('a', full()));
    expect(releaseBuild(once)).toBe(once);
  });

  /*
   * THE PLATE MUST STILL PACK AROUND A RELEASED UNIT. This is the reason `footprint` is kept at all:
   * without it `plateFootprints` omits the unit and `arrangeOnPlate` falls back to its bounding box,
   * which is larger than the real outline - so a plate that fitted eight would silently fit fewer.
   */
  it('leaves plateFootprints reading a released unit exactly as before', () => {
    const u = unit('a');
    const held = { unit: u, mesh: full() };
    const before = plateFootprints([u], new Map([['a', held]]));
    const after = plateFootprints([u], new Map([['a', releaseBuild(held)]]));

    expect(after.get('a')).toEqual(before.get('a'));
    expect(after.size).toBe(1);
  });

  it('omits a key the build never had, rather than writing it as undefined', () => {
    // `'footprint' in mesh` must stay false for a build with no outline: a present-but-undefined key
    // reads as "has an outline" to anything checking the key instead of the value.
    const released = releaseBuild(build('a', full({ footprint: undefined, droppedByZones: undefined })));
    expect('footprint' in released.mesh).toBe(false);
    expect('droppedByZones' in released.mesh).toBe(false);
    expect(released.mesh.dropped).toEqual(['c-1', 'c-2']);
  });
});

describe('releasing the finished ones and keeping the one in hand', () => {
  const map = new Map<string, UnitBuild<HeldBuild>>([
    ['a', build('a', full())], ['b', build('b', full())], ['c', build('c', full())],
  ]);

  it('releases every finished build except the one being looked at', () => {
    const next = releaseFinished(map, ['a', 'b'], ['b']);

    expect(hasGeometry(next.get('a')!.mesh)).toBe(false);
    expect(hasGeometry(next.get('b')!.mesh)).toBe(true);
    // Not finished, so untouched even though it is not the kept one.
    expect(hasGeometry(next.get('c')!.mesh)).toBe(true);
  });

  it('returns the SAME map when there is nothing to release', () => {
    // Reference equality is the point: a new map every render would re-render every consumer.
    expect(releaseFinished(map, [], [])).toBe(map);
    expect(releaseFinished(map, ['a'], ['a'])).toBe(map);
    const once = releaseFinished(map, ['a'], []);
    expect(releaseFinished(once, ['a'], [])).toBe(once);
  });

  it('ignores a finished id with no build, rather than inventing an entry', () => {
    const next = releaseFinished(map, ['a', 'gone'], []);
    expect(next.has('gone')).toBe(false);
    expect(next.size).toBe(3);
  });

  /*
   * THE CASE A DECK OF EIGHT IS FOR. Seven finished rows released, one open: the held bytes fall to
   * one mesh's worth, which is the whole argument for this step.
   */
  it('leaves one mesh held out of eight', () => {
    const deck = new Map<string, UnitBuild<HeldBuild>>(
      ['1', '2', '3', '4', '5', '6', '7', '8'].map((id) => [id, build(id, full())]),
    );
    const finished = ['1', '2', '3', '4', '5', '6', '7'];
    const next = releaseFinished(deck, finished, ['8']);

    const held = [...next.values()].filter((entry) => hasGeometry(entry.mesh)).length;
    const bytes = [...next.values()].reduce((sum, entry) => sum + buildBytes(entry.mesh), 0);
    expect(held).toBe(1);
    expect(bytes).toBe(3000 * 4 + 1200 * 4);
  });
});

/*
 * THE REGRESSION THAT SHIPPED FOR AN HOUR. Step 11 made the support check record a released build as
 * `undefined` while its staleness test compared against `currentBuild`, which returns the TRUTHY
 * kept build because releasing preserves the unit reference. The two never agreed, the unit was
 * permanently stale, and `problems` sits in the effect's own dependency list - so a worker check was
 * scheduled every 600 ms for ever, on every finished unit.
 *
 * `builtGeometry` exists so both readers ask one question. This is the test that notices if they
 * ever diverge again.
 */
describe('the check and its staleness test ask the same question', () => {
  const u = unit('a');

  it('agrees with itself on a released build', () => {
    const released = releaseBuild({ unit: u, mesh: full() });
    const recorded = builtGeometry(u, released);
    // What the check records, and what the staleness test compares, are the same value.
    expect(recorded).toBeUndefined();
    expect(builtGeometry(u, released)).toBe(recorded);
    // The comparison that used to run forever now settles.
    expect(recorded !== builtGeometry(u, released)).toBe(false);
  });

  it('still returns the mesh for a held build, so a live unit re-checks normally', () => {
    const mesh = full();
    expect(builtGeometry(u, { unit: u, mesh })).toBe(mesh);
  });

  it('returns undefined when the build is of another unit version, as currentBuild does', () => {
    // A stale entry must read as no geometry: that IS a reason to re-check.
    expect(builtGeometry(u, { unit: unit('a'), mesh: full() })).toBeUndefined();
    expect(builtGeometry(u, undefined)).toBeUndefined();
  });
});

/*
 * THE UNIT ON SCREEN IS NOT RELEASED, and this is the case that made `keep` a list. `exportedDental`
 * marks a unit finished WITHOUT leaving review, so the unit being looked at is finished and visible.
 * Clicking empty space clears the selection; with only the selected id kept, that released the unit
 * on screen and its supports vanished under the operator. With one aligner and no deck, that is the
 * ordinary path, not an edge case.
 */
describe('what is kept while it is still being looked at', () => {
  const map = new Map<string, UnitBuild<HeldBuild>>([['a', build('a', full())], ['b', build('b', full())]]);

  it('keeps the unit the dental session holds even when nothing is selected', () => {
    const next = releaseFinished(map, ['a', 'b'], [undefined, 'a']);
    expect(hasGeometry(next.get('a')!.mesh)).toBe(true);
    expect(hasGeometry(next.get('b')!.mesh)).toBe(false);
  });

  it('keeps the selected unit even when the session has moved on', () => {
    const next = releaseFinished(map, ['a', 'b'], ['b', undefined]);
    expect(hasGeometry(next.get('b')!.mesh)).toBe(true);
  });

  it('releases nothing that is kept by either reason, and is not confused by undefined', () => {
    // `undefined` in the keep list must never match a real id.
    expect(releaseFinished(map, ['a'], [undefined, undefined])).not.toBe(map);
    expect(hasGeometry(releaseFinished(map, ['a'], [undefined, undefined]).get('a')!.mesh)).toBe(false);
  });
});
