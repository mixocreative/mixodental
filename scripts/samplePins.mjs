// The sample scans tests depend on ONE BY ONE, pinned by content (bytes + SHA-256), never by name or position.
//
// Find one with `sampleByContent(PIN)` (scripts/samples.mjs): it survives the owner renaming, moving
// or adding samples, and no patient file name appears in the code. A test whose pin is absent on this
// machine skips, and `npm run real-scan-tier` reports that it did.
// Where each pin was on 2026-11-26 is noted for the reader; the location is NOT what the test relies on.
// Retiring a pinned scan from samples/ means retiring or re-pinning its test, in the same change.

/** Denture #1 (denture/g): the shared check lists 5 spots the build never reports (ruleSpots), and keep-and-move is proven on it (rigidMove). */
export const DENTURE_RULE_SPOTS = { bytes: 7888684, sha256: 'aafea2257bf56661efb7bf8cb029bb8bdf32795396bf71a90261fc330da5835e' };

/**
 * The denture the end-to-end pipeline test runs (denture/g): the smallest one that orients. It was "the
 * smallest denture scan" until 2026-11-26, when two smaller ones arrived that the orientation step refuses
 * ("no-legs") - a finding about those scans for the Type Lab, not a reason for this test to change subject.
 */
export const DENTURE_PIPELINE = { bytes: 6036884, sha256: '3cbc9a768182cd2430519e1983f882db087cf46af287aafe406e46c1aff231be' };

/** Denture #0 (denture/g): builds with tips and a review GLB through the Type Lab's denture profile. */
export const DENTURE_PROFILE = { bytes: 25838584, sha256: '1b6a4e0c565678cb9e2ae3d4bab7eab13ee5ec62f79d4ce966b3e3fec4ba5c27' };

/** Scans with no central opening, open arch or one closed sharp loop (three in retainer/, one in aligner/g). */
export const OPEN_ARCH = [
  { bytes: 18448384, sha256: '006a279ebb7db92e3d7b1995fe61d3c7f1ce6eba449981be86cfeb3c32ecccbc' },
  { bytes: 15204284, sha256: 'c69dfade9be3119fdea620f700f341dc75e63fc8bd527d18bb5bd76cb098ce3c' },
  { bytes: 19153284, sha256: 'e73af178b9b0ebebb0a8a239f63f1170151234bee800a618deacbc8c8e2bbf1d' },
  { bytes: 17836284, sha256: '479d20d1a73d15beb1f886db3fae4d90c52237efacef853d8fb8fa4bde3ea1f0' },
];

/** A real scan with a large print angle (about 36.5 deg), so overlays must follow the rotation (retainer/). */
export const LARGE_PRINT_ANGLE = OPEN_ARCH[0];
