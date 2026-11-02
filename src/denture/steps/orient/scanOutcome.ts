import type { DentureOrientation } from '@mixo-geocore/host/dental/dentureOrient';
import type { TiltScan } from '@mixo-geocore/host/dental/dentalTilt';
import type { DentalTiltState } from '../../../components/useDentalFlow';

/*
 * How Step 1's orientation and print-angle scan ended, as the step shows it (audit 2026-11-02 #2). Every ending
 * leaves the "scanning" state: a scan that answered with a pick is ready; one that answered without a pick, was
 * replaced, failed, crashed, timed out or was cancelled is failed, so Next and Free transform are free again and the
 * step's notice says what to do. A scan left "scanning" kept Next off ("Wait until the print angles are checked")
 * with nothing running.
 */

/** What the scan job settled with: its answer (undefined when replaced), or the error it was rejected with. */
export type ScanSettled = { result: { orientation: DentureOrientation; scan: TiltScan } | undefined } | { error: unknown };

export type ScanOutcome =
  | { kind: 'ready'; tilt: Extract<DentalTiltState, { status: 'ready' }> }
  /** `tilt` is the step's new tilt state (a failed scan keeps its reason; anything else shows no dial); `cancelled` when the operator stopped it. */
  | { kind: 'failed'; tilt: DentalTiltState | undefined; cancelled: boolean };

const isAbort = (error: unknown) => error instanceof Error && error.name === 'AbortError';

export function scanOutcome(unitId: string, settled: ScanSettled): ScanOutcome {
  if ('error' in settled) return { kind: 'failed', tilt: undefined, cancelled: isAbort(settled.error) };
  const { result } = settled;
  if (!result || result.orientation.kind !== 'oriented' || result.scan.kind !== 'scan') {
    return { kind: 'failed', tilt: result?.scan.kind === 'failed' ? { status: 'failed', unitId, reason: result.scan.reason } : undefined, cancelled: false };
  }
  const { scan } = result;
  return { kind: 'ready', tilt: { status: 'ready', unitId, scan, index: scan.order[0]!, hand: false, confirming: false } };
}
