import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TiltDial } from './TiltDial';
import { dialTicks, valueToAngle } from './tiltDialGeometry';

/** The `--tick-angle` of every tick in `html`, with whether it is on, in order. */
function ticksOf(html: string): { angle: number; on: boolean }[] {
  return [...html.matchAll(/<span class="tilt-dial-tick( is-on)?" style="--tick-angle:(-?[\d.]+)deg"/g)].map((match) => ({ on: Boolean(match[1]), angle: Number(match[2]) }));
}

/** The `--knob-angle` the knob carries, in degrees. */
const knobAngle = (html: string) => Number(html.match(/class="tilt-dial-knob"[^>]*style="--knob-angle:(-?[\d.]+)deg"/)?.[1]);

describe('TiltDial', () => {
  const base = { min: -10, max: 10, step: 1, value: 2, label: 'Print angle', onChange: () => {} };

  it('is a slider whose value is the one given', () => {
    const html = renderToStaticMarkup(<TiltDial {...base} />);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuenow="2"');
    expect(html).toContain('aria-valuemin="-10"');
    expect(html).toContain('aria-valuemax="10"');
    expect(html).toContain('aria-label="Print angle"');
    expect(html).toContain('tabindex="0"');
  });

  it('names every part for a designer', () => {
    const html = renderToStaticMarkup(<TiltDial {...base} />);
    for (const name of ['tilt-dial', 'tilt-dial-ticks', 'tilt-dial-knob', 'tilt-dial-dot', 'tilt-dial-label-min', 'tilt-dial-label-max']) expect(html).toContain(`data-ui="${name}"`);
  });

  it('turns the knob so its dot points at the value: the arc runs -120° to +120°, the middle is straight up', () => {
    expect(knobAngle(renderToStaticMarkup(<TiltDial {...base} value={-10} />))).toBe(-120);
    expect(knobAngle(renderToStaticMarkup(<TiltDial {...base} value={0} />))).toBe(0);
    expect(knobAngle(renderToStaticMarkup(<TiltDial {...base} value={10} />))).toBe(120);
    expect(knobAngle(renderToStaticMarkup(<TiltDial {...base} value={5} />))).toBeCloseTo(valueToAngle(5, -10, 10), 6);
  });

  it('rings the arc with evenly spaced ticks from end to end', () => {
    const ticks = ticksOf(renderToStaticMarkup(<TiltDial {...base} ticks={5} />));
    expect(ticks.map((tick) => tick.angle)).toEqual([-120, -60, 0, 60, 120]);
  });

  it('lights only the ticks inside the stable band; with no band none is lit', () => {
    expect(ticksOf(renderToStaticMarkup(<TiltDial {...base} ticks={5} />)).some((tick) => tick.on)).toBe(false);
    // Ticks at -10, -5, 0, 5, 10; the band [-5, 5] holds the middle three, ends included.
    expect(ticksOf(renderToStaticMarkup(<TiltDial {...base} ticks={5} band={[-5, 5]} />)).map((tick) => tick.on)).toEqual([false, true, true, true, false]);
    // A reversed band means the same run.
    expect(ticksOf(renderToStaticMarkup(<TiltDial {...base} ticks={5} band={[5, -5]} />)).map((tick) => tick.on)).toEqual([false, true, true, true, false]);
    // A band covering the whole range lights every tick.
    expect(ticksOf(renderToStaticMarkup(<TiltDial {...base} ticks={5} band={[-10, 10]} />)).every((tick) => tick.on)).toBe(true);
  });

  it('labels the arc ends with the range ends in degrees', () => {
    const html = renderToStaticMarkup(<TiltDial min={24.4577} max={68.4577} step={1} value={44.4577} label="Print angle" onChange={() => {}} />);
    expect(html).toMatch(/data-ui="tilt-dial-label-min"[^>]*>24\.5°</);
    expect(html).toMatch(/data-ui="tilt-dial-label-max"[^>]*>68\.5°</);
  });

  it('leaves the tab order and marks itself when disabled', () => {
    const html = renderToStaticMarkup(<TiltDial {...base} disabled />);
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('class="tilt-dial is-disabled"');
  });
});

describe('dialTicks', () => {
  it('spreads the ticks over the range and marks the band, float ends included', () => {
    const ticks = dialTicks(24.4577512332, 68.4577512332, [26.4577512332, 44.4577512332], 23);
    expect(ticks).toHaveLength(23);
    expect(ticks[0]!.angle).toBe(-120);
    expect(ticks.at(-1)!.angle).toBe(120);
    // Ticks every 2°: 26.46 .. 44.46 are the 2nd to the 11th.
    expect(ticks.flatMap((tick, at) => (tick.on ? [at] : []))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('gives a flat range one tick at the top', () => {
    expect(dialTicks(5, 5, [5, 5])).toEqual([{ angle: 0, value: 5, on: true }]);
  });
});
