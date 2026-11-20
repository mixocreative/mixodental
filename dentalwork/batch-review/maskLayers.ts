/*
 * ONE JOB: turn per-face masks into display layers, with the colour looked up by token name.
 *
 * Why this is a module and not four lines in `dentureReviewLayers.ts`. The rule worth owning here is
 * not "paint a mask" - it is **which faces are in NO mask**, and that rule had no home, so it had no
 * test and nobody drew it. `ruled_tips.rs:3-7` says "faces reached neither way are not allowed for
 * tips": the outcome matches the no-support zone, but the FACT does not, and neither does what the
 * operator should do next. A no-support face was DECIDED by a rule. An undefined face was never SEEN,
 * which points at the ray grid or the pose, not at the rule. Until this module existed an undefined
 * face had NO LAYER AT ALL: it rendered as the bare model, which reads as "nothing to see here"
 * rather than "undecided" - the worse of the two failures, because an operator does not go looking
 * for a colour that was never there. Measured on the first run with this layer on: 54% to 74% of the
 * faces of a real denture scan are in no zone. Owner's ask, 2026-11-20.
 *
 * COLOUR IS INJECTED, NEVER BAKED. A spec names a `--layer-*` token and the caller passes the
 * resolver, so the same specs work in node (`tokenNumber` of `layerColours.ts`, which reads
 * `tokens.css`) and in a browser (`getComputedStyle`), and no mask display has to hold a hex value.
 * That is what makes this reusable for any mask, not just these zones.
 *
 * PURE: `facesIn` and `facesInNone` need no mesh, no loader and no renderer, so `maskLayers.test.ts`
 * exercises the rules directly. Geometry stays with the caller, which owns `patchPositions`.
 */

/** A per-face mask: 1 (or any non-zero) means the face is in it. */
export type Mask = ArrayLike<number>;

/** One mask to draw: its layer name, the faces, the colour token, and how far off the surface it sits. */
export interface MaskSpec {
  /** The layer name the viewer shows and groups by. */
  name: string;
  mask: Mask;
  /** A `--layer-*` token in `tokens.css`; resolved by the caller's resolver, never a literal colour. */
  token: string;
  /** Millimetres off the surface. A higher lift draws over a lower one, so precedence is visible rather than flattened. */
  lift: number;
}

/** Token name to colour. `tokenNumber` (node, reads tokens.css) or a `getComputedStyle` reader (browser). */
export type Resolve = (token: string) => number;

/** The faces a mask holds. */
export function facesIn(mask: Mask): number[] {
  const out: number[] = [];
  for (let face = 0; face < mask.length; face += 1) if (mask[face] !== 0) out.push(face);
  return out;
}

/**
 * The faces NO mask holds — the undecided ones.
 *
 * `faceCount` is required and is not inferred from the masks: a mask that arrived short (a truncated
 * decode, a mask for a different mesh) would otherwise make this quietly return a SHORTER undecided
 * set, which is the same silence the whole layer exists to end. A mask longer than `faceCount` is a
 * mismatch too, and both throw.
 */
export function facesInNone(masks: readonly Mask[], faceCount: number): number[] {
  for (const mask of masks) {
    if (mask.length !== faceCount) {
      throw new Error(`maskLayers: a mask has ${mask.length} faces, the mesh has ${faceCount} - one of them is for a different mesh`);
    }
  }
  const out: number[] = [];
  for (let face = 0; face < faceCount; face += 1) {
    if (masks.every((mask) => mask[face] === 0)) out.push(face);
  }
  return out;
}

/** `facesInNone` as a mask, so the undecided faces go into a spec list beside the decided ones. */
export function maskOfNone(masks: readonly Mask[], faceCount: number): Uint8Array {
  const out = new Uint8Array(faceCount);
  for (const face of facesInNone(masks, faceCount)) out[face] = 1;
  return out;
}

/** One layer as the GLB writers take it. `positions` comes from the caller's patch builder. */
export interface MaskLayer {
  name: string;
  color: number;
  faces: number[];
  lift: number;
}

/**
 * Each spec that holds at least one face, as a layer with its colour resolved, lowest lift first so a
 * caller that appends in order gets the decided zones over the undecided ones.
 *
 * An empty mask is left out rather than drawn empty: the viewer lists only the layers a file has.
 */
export function maskLayers(specs: readonly MaskSpec[], resolve: Resolve): MaskLayer[] {
  return specs
    .map((spec) => ({ name: spec.name, color: resolve(spec.token), faces: facesIn(spec.mask), lift: spec.lift }))
    .filter((layer) => layer.faces.length > 0)
    .sort((a, b) => a.lift - b.lift);
}
