import { describe, expect, it } from 'vitest';
import type { TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import { scanOutcome } from './scanOutcome';

const oriented = { kind: 'oriented' } as unknown as DentureOrientation;
const scan = { kind: 'scan', order: [2, 0, 1], rows: [{}, {}, {}] } as unknown as TiltScan;

describe('Step 1 scan outcome (audit 2026-11-02 #2)', () => {
  it('a scan with a pick is ready on the pick', () => {
    expect(scanOutcome('d1', { result: { orientation: oriented, scan } })).toMatchObject({ kind: 'ready', tilt: { status: 'ready', unitId: 'd1', index: 2, hand: false } });
  });

  it('a crashed, timed-out or failed job leaves "scanning", so Next is not kept waiting on nothing', () => {
    const crashed = scanOutcome('d1', { error: Object.assign(new Error('Denture engine crashed'), { name: 'WorkerTaskError' }) });
    expect(crashed).toEqual({ kind: 'failed', tilt: undefined, cancelled: false });
  });

  it('a cancelled scan is failed and says it was cancelled', () => {
    expect(scanOutcome('d1', { error: new DOMException('Denture engine aborted', 'AbortError') })).toEqual({ kind: 'failed', tilt: undefined, cancelled: true });
  });

  it('a replaced job or a scan without a pick is failed; a failed scan keeps its reason', () => {
    expect(scanOutcome('d1', { result: undefined })).toEqual({ kind: 'failed', tilt: undefined, cancelled: false });
    const failedScan = { kind: 'failed', reason: 'no tilt' } as unknown as TiltScan;
    expect(scanOutcome('d1', { result: { orientation: oriented, scan: failedScan } })).toEqual({ kind: 'failed', tilt: { status: 'failed', unitId: 'd1', reason: 'no tilt' }, cancelled: false });
  });
});
