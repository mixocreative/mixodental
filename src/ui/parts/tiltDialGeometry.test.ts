import { describe, expect, it } from 'vitest';
import { angleToValue, arcPath, polar, valueFromPointer, valueToAngle } from './tiltDialGeometry';

describe('tiltDialGeometry', () => {
  it('maps the range onto a 240-degree arc and back', () => {
    for (const value of [-10, 0, 10]) expect(angleToValue(valueToAngle(value, -10, 10), -10, 10)).toBeCloseTo(value, 9);
    expect(valueToAngle(-10, -10, 10)).toBe(-120);
    expect(valueToAngle(10, -10, 10)).toBe(120);
    expect(valueToAngle(0, -10, 10)).toBe(0);
  });

  it('a flat range sits at the top', () => {
    expect(valueToAngle(5, 5, 5)).toBe(0);
  });

  it('polar puts 0 degrees straight up and 90 degrees to the right', () => {
    const up = polar(60, 60, 50, 0);
    expect(up.x).toBeCloseTo(60, 9);
    expect(up.y).toBeCloseTo(10, 9);
    const right = polar(60, 60, 50, 90);
    expect(right.x).toBeCloseTo(110, 9);
    expect(right.y).toBeCloseTo(60, 9);
  });

  it('arcPath starts at the polar point of its first angle', () => {
    const d = arcPath(60, 60, 50, -120, 120);
    const start = polar(60, 60, 50, -120);
    expect(d.startsWith(`M ${start.x} ${start.y} `)).toBe(true);
    expect(d).toContain(' 0 1 1 ');
  });

  it('a pointer straight up gives the middle value; the snap rounds to step', () => {
    const rect = { left: 0, top: 0, width: 120, height: 120 };
    expect(valueFromPointer(rect, 60, 0, -10, 10, 1)).toBe(0);
    expect(valueFromPointer(rect, 60, 0, 40, 60, 0.5)).toBe(50);
  });

  it('clamps a pointer outside the arc to its ends', () => {
    const rect = { left: 0, top: 0, width: 120, height: 120 };
    expect(valueFromPointer(rect, 60, 200, 0, 100, 1)).toBeCloseTo(100, 9);
    // Straight left is -90 degrees: 12.5 on 0..100, snapped to 13.
    expect(valueFromPointer(rect, 0, 60, 0, 100, 1)).toBe(13);
  });
});
