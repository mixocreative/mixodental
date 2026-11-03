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

/** How many tick marks ring the dial by default: one every 10 degrees of the 240-degree arc. */
export const DIAL_TICK_COUNT = 25;

/** One tick of the dial's ring: its angle (degrees, as `valueToAngle`), the value it stands for, and whether it is in the band. */
export interface DialTick {
  angle: number;
  value: number;
  on: boolean;
}

/**
 * The ring of `count` ticks evenly spread over the arc from `min` to `max`. A tick is `on` when its value lies in
 * `band` (`[from, to]`, either order, ends included); with no band every tick is off. A flat range gives one tick.
 */
export function dialTicks(min: number, max: number, band: readonly [number, number] | undefined, count = DIAL_TICK_COUNT): DialTick[] {
  const n = max > min ? Math.max(2, Math.round(count)) : 1;
  const lo = band ? Math.min(band[0], band[1]) : 0;
  const hi = band ? Math.max(band[0], band[1]) : 0;
  // A sliver of one tick spacing absorbs float rounding, so a band end that falls on a tick includes that tick.
  const slack = n > 1 ? ((max - min) / (n - 1)) * 1e-6 : 0;
  return Array.from({ length: n }, (_, at) => {
    const value = n > 1 ? min + ((max - min) * at) / (n - 1) : min;
    return { angle: valueToAngle(value, min, max), value, on: band !== undefined && value >= lo - slack && value <= hi + slack };
  });
}

/**
 * The value a key press moves the dial to, or undefined for a key the dial does not take. Arrows step by
 * `step` and hold the range; Home and End jump to its ends, as they do on any slider - the dial replaced a
 * range input, and a reader who drives it from the keyboard should not have to hold an arrow down to cross
 * the whole arc.
 */
export function keyValue(key: string, { value, min, max, step }: { value: number; min: number; max: number; step: number }): number | undefined {
  if (key === 'Home') return min;
  if (key === 'End') return max;
  const direction = key === 'ArrowRight' || key === 'ArrowUp' ? 1 : key === 'ArrowLeft' || key === 'ArrowDown' ? -1 : 0;
  return direction === 0 ? undefined : Math.min(max, Math.max(min, value + direction * step));
}
