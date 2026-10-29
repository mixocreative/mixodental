import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { nodeEngine } from '../node-engine';
import { buildDentalReview } from './build';
import { parseStl } from '../test-support/rustImport';

// Local-only: customer scans are never committed, so this skips when the folder is absent.
const dir = 'dentalwork/fixtures/case-aligner';
const has = existsSync(dir);
// Sorted indices of the scans with no central opening (open arch) or one closed sharp loop.
const SCANS = [0, 2, 5, 7];

describe.skipIf(!has)('real aligner scans without an opening contour', () => {
  it.each(SCANS)('scan %i gets diagnostic contacts and a built review', (at) => {
    const file = readdirSync(dir).filter((name) => name.endsWith('.stl')).sort()[at]!;
    const bytes = readFileSync(join(dir, file));
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    nodeEngine.center_positions_in_place(mesh.positions);
    const review = buildDentalReview(mesh);
    if (review.kind !== 'proposal') expect(review.reason).not.toBe('diagnostic-contact-invalid-contour');
    else {
      expect(review.diagnosticContacts.outer.contacts.length).toBeGreaterThan(0);
      if (review.region.openingEdges.length === 0) expect(review.diagnosticContacts.inner.contacts).toEqual([]);
    }
  }, 120_000);
});
