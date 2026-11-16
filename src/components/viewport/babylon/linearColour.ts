/*
 * One job: a CSS colour as LINEAR 0..1 RGB, for vertex colours.
 *
 * THE REASON THIS IS NOT `Color3.FromHexString(css).toLinearSpace()`. Babylon's `toLinearSpace`
 * raises each channel to 2.2, which is the old approximation. three.js applies the exact sRGB
 * transfer function -- a linear segment below 0.04045 and a shifted power of 2.4 above it -- and
 * the three.js view's `linearBytes` is built on it. The two differ by a few counts across the
 * midtones, most in the dark end, which on a selection highlight reads as "the Babylon one is
 * slightly off" rather than as a bug anyone can name.
 *
 * `linearColour.test.ts` holds this against three's own `Color` for every token the viewport uses,
 * so the two renderers cannot drift apart on colour.
 */

/** The exact sRGB → linear transfer function, per channel, as three.js applies it. */
export function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** `#rrggbb` (or `#rgb`) as linear 0..1 RGB. Unparseable input is mid grey rather than a throw. */
export function linearRgb(css: string): [number, number, number] {
  const text = css.trim().replace(/^#/, '');
  const full = text.length === 3 ? [...text].map((digit) => digit + digit).join('') : text;
  if (!/^[0-9a-f]{6}$/i.test(full)) return [srgbToLinear(0.5), srgbToLinear(0.5), srgbToLinear(0.5)];
  const byte = (at: number) => Number.parseInt(full.slice(at, at + 2), 16) / 255;
  return [srgbToLinear(byte(0)), srgbToLinear(byte(2)), srgbToLinear(byte(4))];
}
