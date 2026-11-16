import { Color3 } from '@babylonjs/core/Maths/math.color';

/*
 * One job: a CSS colour as LINEAR 0..1 RGB -- for vertex colours, and for every Babylon material
 * that does NOT convert the colour itself.
 *
 * WHICH MATERIALS NEED IT, measured rather than assumed. `PBRMaterial.albedoColor` is converted to
 * linear by Babylon before it reaches the shader, so the models and the supports come out right
 * from the token as it is. `StandardMaterial`'s colours and a `LinesMesh`'s `color` are NOT: they
 * go to the shader as given and then through the scene's ACES tone mapping and sRGB encode, so an
 * sRGB token handed over raw is converted a second time. The drawn rim measured
 * 255/214/255 on screen for `--mark-area-edge` -- a washed-out near-white where a
 * magenta line should be, and the walk's `u5j` found zero pixels of the colour it was looking for.
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

/**
 * A CSS token as a Babylon colour in LINEAR space, for the materials listed above. Hand it the
 * token, never `Color3.FromHexString(token)`: that is the raw value this exists to convert.
 */
export function linearColour3(css: string): Color3 {
  const [red, green, blue] = linearRgb(css);
  return new Color3(red, green, blue);
}
