import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OrientationBar, type DentalFreeControls } from './OrientationBar';
import type { UiState } from '@mixo-geocore/editing/commands';
import type { DentalTiltState } from './useDentalFlow';

const ui = { mode: 'dental', dentalStage: 'aligner', dentalAlignerReady: true, dentalProposed: true } as UiState;
const scanning: DentalTiltState = { status: 'scanning', unitId: 'u', done: 1, total: 3 };
const noop = () => {};
const free = (over: Partial<DentalFreeControls>): DentalFreeControls => ({ on: false, asking: false, ask: noop, confirm: noop, cancel: noop, autoOrient: noop, ...over });

describe('OrientationBar', () => {
  it('lists Auto orientation, then Back and Next as the last row, and no Exit', () => {
    const html = renderToStaticMarkup(<OrientationBar notices={[]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}} />);
    const order = ['Auto orientation', 'Back', 'Next'].map((word) => html.indexOf(word));
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
    expect(html).toContain('orient-nav');
    // Auto orientation is the primary red button with its icon.
    expect(html).toMatch(/<button class="primary orient-auto"[^>]*>Auto orientation<svg/);
    expect(html).not.toContain('Exit');
    expect(html).not.toContain('Detector confidence');
  });

  it('normal: the dial and the Free transform button', () => {
    const html = renderToStaticMarkup(<OrientationBar notices={[]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}}
      tilt={scanning} free={free({})} />);
    expect(html).toContain('Scanning print angles');
    expect(html).toContain('>Free transform<');
    expect(html).not.toContain('Continue');
  });

  it('asking: the confirm prompt with Cancel and Continue, Auto orientation and Next stay', () => {
    const html = renderToStaticMarkup(<OrientationBar notices={[]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}}
      tilt={scanning} free={free({ asking: true })} />);
    expect(html).toContain('You will orient it yourself. Continue?');
    expect(html).toContain('>Continue<');
    expect(html).toContain('>Cancel<');
    expect(html).not.toContain('Scanning print angles');
    expect(html).not.toContain('>Free transform<');
    expect(html).toContain('>Next<');
  });

  /*
   * u7. A failure and a type mismatch have the same way out - another aligner type - so both notices carry the
   * same row. With one profile embedded, and that one insisting on a central opening, there is nothing to switch
   * to: the row then says so rather than standing empty, since "is this the wrong type?" is the question the
   * reader actually has. Only the mismatch can be dismissed; a failure is not an opinion to disagree with.
   */
  it('offers the aligner type as the way out of a failure as well as a mismatch', () => {
    const failed = renderToStaticMarkup(<OrientationBar notices={[{ kind: 'failed' }]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}} />);
    expect(failed).toContain('could not be oriented automatically');
    expect(failed).toContain('data-ui="orient-ways-failed"');
    expect(failed).toContain('Reference aligner is the only aligner type so far.');
    expect(failed).not.toContain('data-ui="orient-keep-type"');

    const mismatch = renderToStaticMarkup(<OrientationBar notices={[{ kind: 'mismatch' }]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}} />);
    expect(mismatch).toContain('data-ui="orient-ways-mismatch"');
    expect(mismatch).toContain('Reference aligner is the only aligner type so far.');
    expect(mismatch).toContain('data-ui="orient-keep-type"');

    // A notice with no second way out carries no row at all.
    const holes = renderToStaticMarkup(<OrientationBar notices={[{ kind: 'holes' }]} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}} />);
    expect(holes).not.toContain('data-ui="orient-only-type"');
  });

  it('free transform: only Auto orientation and Next; no dial, no Free transform button, no notices', () => {
    const notices = [{ kind: 'holes' }] as const;
    const html = renderToStaticMarkup(<OrientationBar notices={notices} profile="reference-aligner" lang="en" ui={ui} send={() => {}} run={() => {}}
      tilt={scanning} free={free({ on: true })} />);
    expect(html).toContain('Auto orientation');
    expect(html).toContain('>Next<');
    expect(html).not.toContain('Scanning print angles');
    expect(html).not.toContain('>Free transform<');
    expect(html).not.toContain('holes or non-manifold');
  });
});
