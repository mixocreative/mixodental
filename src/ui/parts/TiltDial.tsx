import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { arcPath, polar, valueFromPointer, valueToAngle, ARC_HALF_DEG } from './tiltDialGeometry';

const CENTRE = 60;
const RADIUS = 50;
const KNOB_RADIUS = 7;

/**
 * A round dial for one value in `[min, max]` (PD.11 S5): a 240-degree arc, the knob at the value,
 * and an optional kraft `band` (`[from, to]` in the same units) highlighted on the track. Drag or
 * press the arrow keys; every change calls `onChange` with the new value, snapped to `step`, so the
 * caller can turn the model live. Colours come from the `.tilt-dial-*` classes in styles.css.
 */
export function TiltDial({ min, max, step, value, band, label, disabled = false, onChange }: {
  min: number;
  max: number;
  step: number;
  value: number;
  /** A highlighted run of the track, `[from, to]` in the same units as `value`. */
  band?: readonly [number, number] | undefined;
  label: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const dragging = useRef(false);
  const knob = polar(CENTRE, CENTRE, RADIUS, valueToAngle(value, min, max));
  const bandPath = band
    ? arcPath(CENTRE, CENTRE, RADIUS, valueToAngle(Math.min(band[0], band[1]), min, max), valueToAngle(Math.max(band[0], band[1]), min, max))
    : undefined;

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange(valueFromPointer(rect, event.clientX, event.clientY, min, max, step));
  };
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pick(event);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (dragging.current && !disabled) pick(event);
  };
  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (disabled) return;
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (direction === 0) return;
    event.preventDefault();
    onChange(Math.min(max, Math.max(min, value + direction * step)));
  };

  return <svg className="tilt-dial" viewBox="0 0 120 120" role="slider" tabIndex={disabled ? -1 : 0} aria-label={label}
    aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-disabled={disabled || undefined}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}>
    <path className="tilt-dial-track" d={arcPath(CENTRE, CENTRE, RADIUS, -ARC_HALF_DEG, ARC_HALF_DEG)} />
    {bandPath ? <path className="tilt-dial-band" d={bandPath} /> : null}
    <circle className="tilt-dial-knob" cx={knob.x} cy={knob.y} r={KNOB_RADIUS} />
  </svg>;
}
