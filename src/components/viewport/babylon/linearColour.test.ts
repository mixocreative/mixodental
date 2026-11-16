import * as THREE from 'three';
import { Color3 } from '@babylonjs/core';
import { describe, expect, it } from 'vitest';
import { linearRgb, srgbToLinear } from './linearColour';

/*
 * Held against three.js' own `Color`, because the three.js view's vertex colours come from it and
 * the two renderers must agree. The third test is the one that earns this module's existence:
 * Babylon's `toLinearSpace` is a 2.2 power, not the sRGB curve, and using it would have put the
 * Babylon selection highlight a few counts off in a way that reads as a palette choice.
 */

/** Every colour the viewport actually uses for bodies and selection, plus the ends of the range. */
const COLOURS = ['#000000', '#ffffff', '#808080', '#eda428', '#cdc8bf', '#1a1a1a', '#0a0a0a', '#f5f5f5'];

describe('linear colour for vertex colours', () => {
  it.each(COLOURS)('matches three.js for %s', (css) => {
    const theirs = new THREE.Color(css);
    const [r, g, b] = linearRgb(css);
    expect(r).toBeCloseTo(theirs.r, 5);
    expect(g).toBeCloseTo(theirs.g, 5);
    expect(b).toBeCloseTo(theirs.b, 5);
  });

  it('is exact at the ends and continuous across the curve’s join', () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBeCloseTo(1, 12);
    // The piecewise join at 0.04045: both branches must meet, or dark colours step.
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.04045 / 12.92, 9);
    expect(srgbToLinear(0.04046)).toBeCloseTo(0.04045 / 12.92, 5);
  });

  it('differs from Babylon’s 2.2 power, which is why this module exists', () => {
    // If these ever agree, either Babylon changed its transfer function or this test is comparing
    // the wrong thing -- and the module could be deleted in favour of toLinearSpace().
    const babylon = Color3.FromHexString('#808080').toLinearSpace();
    const [r] = linearRgb('#808080');
    expect(Math.abs(babylon.r - r)).toBeGreaterThan(0.002);
  });

  it('falls back to mid grey rather than throwing on nonsense', () => {
    expect(linearRgb('not a colour')).toEqual([srgbToLinear(0.5), srgbToLinear(0.5), srgbToLinear(0.5)]);
  });

  it('reads the short form the same as the long one', () => {
    expect(linearRgb('#abc')).toEqual(linearRgb('#aabbcc'));
  });
});
