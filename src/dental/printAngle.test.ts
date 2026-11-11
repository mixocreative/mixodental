import { describe, expect, it } from 'vitest';
import { decodeTiltScan, type TiltRow } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentalTiltScanResultLike } from '@mixo-geocore/host/dental/dentalEngine';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import { noticeText, tiltFlags, tiltProblems } from '../components/DentalSteps';
import { confirmHolds } from './confirmTilt';
import { reduceSession, initialSession } from '@mixo-geocore/editing/session';

/** A scan result as the Rust call returns it: two tilts, the second failing a resin trap and a crossing. */
function fakeResult(): DentalTiltScanResultLike {
  const row = (tilt: number, step: number, flags: number, robust: number) => [tilt, step, flags, 3, 6, 18.5, 900, 37, robust, 0.1, 0.2, 0.3];
  return {
    free: () => {}, ok: () => true, reason: () => '', start_deg: () => 46.4577512332,
    rows: () => Float64Array.from([...row(45.4577512332, -1, 0, 1), ...row(46.4577512332, 0, 0b0101, 0)]),
    failing: () => ['', '', '', '', '81072', '', 'dental-opening-4', ''],
    order: () => Uint32Array.of(0, 1), pick_reason: () => 2, band: () => new Uint32Array(),
  };
}

describe('print angle (docs/ROADMAP.md F)', () => {
  it('decodes rows, flags, rotation and the pick from the Rust layout', () => {
    const scan = decodeTiltScan(fakeResult());
    if (scan.kind !== 'scan') throw new Error('expected a scan');
    expect(scan.reason).toBe('failing');
    expect(scan.band).toBeUndefined();
    expect(scan.order).toEqual([0, 1]);
    expect(scan.rows[0]).toMatchObject({ step: -1, failed: [], robust: true, rotation: [0.1, 0.2, 0.3], fittingSideTips: 3 });
    expect(scan.rows[1]!.failed).toEqual([{ rule: 'resin-trap', at: '81072' }, { rule: 'crossing', at: 'dental-opening-4' }]);
  });

  it('names each failed rule with its tilt and first failing vertex or tip in the problem entry', () => {
    const scan = decodeTiltScan(fakeResult());
    if (scan.kind !== 'scan') throw new Error('expected a scan');
    const row: TiltRow = scan.rows[1]!;
    expect(tiltFlags(row)).toEqual(['resin trap', 'support crossing the aligner']);
    expect(tiltProblems(row)).toEqual(['resin trap at 46.5° (81072)', 'support crossing the aligner at 46.5° (dental-opening-4)']);
    expect(tiltProblems(scan.rows[0]!)).toEqual([]);
  });

  it('a confirm build holds unless blocked, an island is unresolved or a rim gap needs review', () => {
    const base = { positions: new Float32Array(), indices: new Uint32Array(), parts: [], components: [], dropped: [] } as unknown as GeneratedSupportMesh;
    const rim = (needsReview: boolean) => ({ outer: { perimeterMm: 1, retained: 1, maxGapMm: 1, reviewGapMm: 2, needsReview }, opening: { perimeterMm: 1, retained: 1, maxGapMm: 1, reviewGapMm: 2, needsReview: false }, needsReview });
    expect(confirmHolds({ ...base, verdict: { status: 'clear', issues: [] }, dentalRimCoverage: rim(false) })).toBe(true);
    expect(confirmHolds({ ...base, verdict: { status: 'blocked', issues: [] } })).toBe(false);
    expect(confirmHolds({ ...base, islands: { status: 'ok', islands: [{ height: 1, vertex: 0, status: 'unresolved' }] } })).toBe(false);
    expect(confirmHolds({ ...base, dentalRimCoverage: rim(true) })).toBe(false);
    expect(confirmHolds(undefined)).toBe(false);
  });

  it('Step 2 opens with the moved-angle notice when the confirm moved the pick', () => {
    const ready = { ...initialSession, mode: 'dental' as const, dentalStage: 'aligner' as const, dentalAligner: 'ready' as const };
    const moved = reduceSession(ready, { type: 'acceptDentalOrientation', angleMovedDeg: 43.5 });
    expect(moved.dentalStage).toBe('area');
    expect(moved.dentalNotices).toEqual([{ kind: 'angle-moved', deg: 43.5 }]);
    expect(reduceSession(ready, { type: 'acceptDentalOrientation' }).dentalNotices).toEqual([]);
  });

  /*
   * THE CONFIRM CAN SAY NO (audit MIXO-02), and this is the test that fails if it stops being able to.
   *
   * `confirmPick` returns `confirmed: undefined` when NO tilt in the tried set builds supports that
   * hold, and the check itself can reject. Both used to reach the same `accept()` as the confirmed
   * case - three outcomes, ONE screen - so an operator could paint an area and build on an angle the
   * app had privately judged unusable, hearing about it later from the Step 3 check or an export
   * refusal, after the work.
   *
   * The assertion is not which words appear - those are placeholder and the owner's to change - but
   * that the three outcomes are THREE, and that each of the two bad ones has words at all.
   */
  it('Step 2 opens saying so when the confirm found nothing, or could not finish', () => {
    const ready = { ...initialSession, mode: 'dental' as const, dentalStage: 'aligner' as const, dentalAligner: 'ready' as const };
    const notices = (event: Parameters<typeof reduceSession>[1]) => reduceSession(ready, event).dentalNotices;

    expect(notices({ type: 'acceptDentalOrientation', angleCheck: 'none-held' })).toEqual([{ kind: 'angle-none-held' }]);
    expect(notices({ type: 'acceptDentalOrientation', angleCheck: 'failed' })).toEqual([{ kind: 'angle-check-failed' }]);

    // Three outcomes, three states. This is the whole finding: before the fix all three were [].
    const outcomes = [
      notices({ type: 'acceptDentalOrientation' }),
      notices({ type: 'acceptDentalOrientation', angleCheck: 'none-held' }),
      notices({ type: 'acceptDentalOrientation', angleCheck: 'failed' }),
    ].map((list) => JSON.stringify(list));
    expect(new Set(outcomes).size, 'the confirmed, nothing-held and did-not-finish cases must differ').toBe(3);

    // A notice nobody has words for is the same silence in a different place.
    for (const kind of ['angle-none-held', 'angle-check-failed'] as const) {
      const words = noticeText({ kind });
      expect(words.trim().split(/\s+/).length, kind).toBeGreaterThan(4);
    }
    expect(noticeText({ kind: 'angle-none-held' })).not.toBe(noticeText({ kind: 'angle-check-failed' }));
  });

  it('still carries a moved angle alongside a failed check, because both can be true', () => {
    const ready = { ...initialSession, mode: 'dental' as const, dentalStage: 'aligner' as const, dentalAligner: 'ready' as const };
    expect(reduceSession(ready, { type: 'acceptDentalOrientation', angleMovedDeg: 43.5, angleCheck: 'failed' }).dentalNotices)
      .toEqual([{ kind: 'angle-moved', deg: 43.5 }, { kind: 'angle-check-failed' }]);
  });
});
