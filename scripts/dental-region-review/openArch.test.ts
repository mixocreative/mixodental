import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { nodeEngine } from '../node-engine';
import { sampleByContent } from '../samples.mjs';
import { OPEN_ARCH } from '../samplePins.mjs';
import { buildDentalReview } from './build';
import { parseStl } from '../test-support/rustImport';

// Local-only: customer scans are never committed. Pinned by content, so each one skips when absent.
describe('real aligner scans without an opening contour', () => {
  for (const [at, pin] of OPEN_ARCH.entries()) {
    const file = sampleByContent(pin);
    it.skipIf(!file)(`open-arch scan ${at} gets diagnostic contacts and a built review`, () => {
      const bytes = readFileSync(file!);
      const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
      nodeEngine.center_positions_in_place(mesh.positions);
      const review = buildDentalReview(mesh);
      if (review.kind !== 'proposal') expect(review.reason).not.toBe('diagnostic-contact-invalid-contour');
      else {
        // These open-arch scans are two-manifold, so their diagnostic band is drawn (a missing one would say why here).
        expect(review.diagnosticNote).toBe('');
        expect(review.diagnosticContacts!.outer.contacts.length).toBeGreaterThan(0);
        if (review.region.openingEdges.length === 0) expect(review.diagnosticContacts!.inner.contacts).toEqual([]);
      }
    }, 120_000);
  }
});
