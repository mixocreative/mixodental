import { tokenColour } from '../../../ui/tokenColour';
import type { TipColours } from './liveTipLayers';

/*
 * The live tip colours come from the CSS tokens (src/styles.css `--tip-path`, `--tip-fallback`, `--tip-none`), so a
 * designer changes them in one place.
 */

/** The path-state colours from the document's tokens (`unknown` is the engine-64 fallback). */
export function tipColours(): TipColours {
  return { path: tokenColour('--tip-path'), fallback: tokenColour('--tip-fallback'), none: tokenColour('--tip-none'), unknown: tokenColour('--tip-unknown') };
}
