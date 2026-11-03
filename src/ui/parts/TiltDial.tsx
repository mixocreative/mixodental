import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { dialTicks, valueFromPointer, valueToAngle, DIAL_TICK_COUNT } from './tiltDialGeometry';

/** An end label: the value to one decimal with a degree sign (a number, so it needs no translation). */
const degrees = (value: number): string => `${Math.round(value * 10) / 10}°`;

/**
 * A CSS custom property set from data. Inline `style=` is banned in TSX except for values computed at run time
 * (src/ui/noColourLiterals.test.ts): here the angle of each tick and of the knob's indicator. Only the angle is set
 * inline (the knob itself never turns: only its dot moves, so the light stays top left); every colour, size and shadow stays in the `.tilt-dial*` rules of src/styles.css.
 */
const angleVar = (name: '--tick-angle' | '--knob-angle', deg: number): CSSProperties => ({ [name]: `${deg}deg` }) as CSSProperties;

/**
 * A round dial for one value in `[min, max]` (PD.11 S5, restyled P7d): a raised, soft knob whose indicator dot
 * points at the value, a ring of tick marks over a 240-degree arc open at the bottom, and the range ends as small
 * labels at both arc ends. Ticks inside the optional `band` (`[from, to]` in the same units, the stable range) carry
 * the class `is-on`. Drag or press the arrow keys; every change calls `onChange` with the new value, snapped to
 * `step`, so the caller can turn the model live.
 *
 * Built from plain HTML elements and CSS, not SVG: each tick is a `<span>` turned by `--tick-angle`, the knob is a
 * `<div>` with a `box-shadow`, so a designer can restyle every part with ordinary CSS (width, height, background,
 * border-radius, box-shadow). `--dial-size` in src/styles.css sizes the whole dial; see docs/ui-styling.md.
 */
export function TiltDial({ min, max, step, value, band, label, disabled = false, ticks = DIAL_TICK_COUNT, onChange }: {
  min: number;
  max: number;
  step: number;
  value: number;
  /** A highlighted run of the tick ring, `[from, to]` in the same units as `value`. */
  band?: readonly [number, number] | undefined;
  label: string;
  disabled?: boolean;
  /** How many tick marks ring the dial. */
  ticks?: number;
  onChange: (value: number) => void;
}) {
  const dragging = useRef(false);

  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onChange(valueFromPointer(rect, event.clientX, event.clientY, min, max, step));
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pick(event);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current && !disabled) pick(event);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (direction === 0) return;
    event.preventDefault();
    onChange(Math.min(max, Math.max(min, value + direction * step)));
  };

  return <div className={disabled ? 'tilt-dial is-disabled' : 'tilt-dial'} data-ui="tilt-dial" role="slider" tabIndex={disabled ? -1 : 0} aria-label={label}
    aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-disabled={disabled || undefined}
    onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onKeyDown={onKeyDown}>
    <div className="tilt-dial-ticks" data-ui="tilt-dial-ticks" aria-hidden="true">
      {dialTicks(min, max, band, ticks).map((tick) => <span key={tick.angle} className={tick.on ? 'tilt-dial-tick is-on' : 'tilt-dial-tick'}
        style={angleVar('--tick-angle', tick.angle)} />)}
    </div>
    <div className="tilt-dial-knob" data-ui="tilt-dial-knob" aria-hidden="true" style={angleVar('--knob-angle', valueToAngle(value, min, max))}>
      <span className="tilt-dial-dot" data-ui="tilt-dial-dot" />
    </div>
    <span className="tilt-dial-label tilt-dial-label-min" data-ui="tilt-dial-label-min" aria-hidden="true">{degrees(min)}</span>
    <span className="tilt-dial-label tilt-dial-label-max" data-ui="tilt-dial-label-max" aria-hidden="true">{degrees(max)}</span>
  </div>;
}
