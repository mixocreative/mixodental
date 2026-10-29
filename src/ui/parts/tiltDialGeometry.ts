/**
 * Pure geometry of the print-angle dial (PD.11 S5): a 240-degree arc open at the bottom, from
 * -120° (left) through 0° (straight up) to +120° (right), clockwise positive. No React here.
 * Values are slider values in `[min, max]`; `step` snaps a pointer position to the nearest value.
 */

/** Half of the arc's sweep: the arc runs from -ARC_HALF to +ARC_HALF degrees about the top. */
export const ARC_HALF_DEG = 120;

/** The dial's angle (degrees, 0 = up, clockwise) of `value` in `[min, max]`. A flat range sits at 0. */
export function valueToAngle(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return -ARC_HALF_DEG + ((value - min) / (max - min)) * 2 * ARC_HALF_DEG;
}

/** The slider value at dial angle `angle` (degrees); the inverse of `valueToAngle`, not clamped. */
export function angleToValue(angle: number, min: number, max: number): number {
  return min + ((angle + ARC_HALF_DEG) / (2 * ARC_HALF_DEG)) * (max - min);
}

/** The point at radius `r` from the centre, `angleDeg` clockwise from straight up (SVG coordinates). */
export function polar(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** The SVG path `d` of the arc of radius `r` from `fromAngle` to `toAngle` (degrees, clockwise from up). */
export function arcPath(cx: number, cy: number, r: number, fromAngle: number, toAngle: number): string {
  const start = polar(cx, cy, r, fromAngle);
  const end = polar(cx, cy, r, toAngle);
  const large = Math.abs(toAngle - fromAngle) > 180 ? 1 : 0;
  const sweep = toAngle >= fromAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} ${sweep} ${end.x} ${end.y}`;
}

/**
 * The slider value under a pointer: the angle of the pointer about the rect's centre, clamped to
 * the arc, mapped to `[min, max]` and snapped to `step`. A pointer straight up gives the middle.
 */
export function valueFromPointer(rect: { left: number; top: number; width: number; height: number }, clientX: number, clientY: number,
  min: number, max: number, step: number): number {
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  const angle = Math.min(ARC_HALF_DEG, Math.max(-ARC_HALF_DEG, (Math.atan2(dx, -dy) * 180) / Math.PI));
  const raw = angleToValue(angle, min, max);
  const snapped = step > 0 ? min + Math.round((raw - min) / step) * step : raw;
  return Math.min(max, Math.max(min, snapped));
}
