import { describe, expect, it } from 'vitest';
import { angularSensibilityFor, panningSensibilityFor, zoomedRadius } from './orbit';

/*
 * These hold the Babylon camera to drei's OrbitControls, whose own arithmetic is written out here
 * from `three-stdlib`'s source. The point is not that the formulas are hard -- it is that they are
 * INVISIBLE: a view that turns seven times too far per pixel still works, still looks right in a
 * screenshot, and feels like a different app the moment anyone uses it.
 */

const HEIGHT = 844;
const FOV = (40 * Math.PI) / 180;

describe('the Babylon orbit matches OrbitControls', () => {
  it('turns a whole revolution over one canvas height', () => {
    // three: `rotateLeft(2 * Math.PI * dx / element.clientHeight)`.
    const radiansPerPixel = 1 / angularSensibilityFor(HEIGHT);
    expect(radiansPerPixel * HEIGHT).toBeCloseTo(2 * Math.PI, 10);
  });

  it('pans the world units three pans, which depend on the distance', () => {
    for (const radius of [5, 40, 400]) {
      // three: `2 * deltaX * distance * tan(fov / 2) / element.clientHeight` world units.
      const expected = (2 * radius * Math.tan(FOV / 2)) / HEIGHT;
      expect(1 / panningSensibilityFor(radius, FOV, HEIGHT)).toBeCloseTo(expected, 10);
    }
  });

  /*
   * The one that cannot be had from Babylon's own wheel input at all: it scales by the raw event
   * delta, which a mouse, a trackpad and a tilting wheel all report differently, where
   * OrbitControls reads only the sign and always steps by 0.95.
   */
  it('zooms one fixed step per notch, in and back out again', () => {
    expect(zoomedRadius(100, true)).toBeCloseTo(95, 10);
    expect(zoomedRadius(100, false)).toBeCloseTo(100 / 0.95, 10);
    expect(zoomedRadius(zoomedRadius(100, true), false)).toBeCloseTo(100, 10);
  });

  it('never divides by a camera sitting on its own target', () => {
    expect(Number.isFinite(panningSensibilityFor(0, FOV, HEIGHT))).toBe(true);
    expect(Number.isFinite(angularSensibilityFor(0))).toBe(true);
  });
});
