import { describe, expect, it } from 'vitest';
import { canvasCursor } from './style';

/*
 * The rim cursor is built from the icon FILE at run time, and a data-URI cursor that is malformed does not
 * throw - the browser silently falls back to the keyword after the comma, which here is `crosshair`. That is
 * exactly the cursor this replaced, so the failure would look like the feature never shipped. Hence a test
 * on the string itself.
 */
const rim = canvasCursor({ kind: 'dental-rim' } as Parameters<typeof canvasCursor>[0], true);

describe('the rim-mode cursor', () => {
  it('is a data URI with the hot spot at the centre of the square', () => {
    expect(rim).toMatch(/^url\("data:image\/svg\+xml,[^"]+"\) 12 12, crosshair$/);
  });

  it('carries the real drawing, at a size, with no currentColor left to inherit', () => {
    const svg = decodeURIComponent(/,([^"]+)"/.exec(rim)![1]!);
    // A standalone SVG has nothing to inherit `currentColor` from, so a leftover one renders as black and
    // ignores the theme. The file is full of them; none may survive into the cursor.
    expect(svg).not.toContain('currentColor');
    expect(svg).toMatch(/^<svg width="24" height="24" /);
    // The file's own artboard, whatever it is - it was a 240 pixel-art grid and is now a 24 line icon,
    // and pinning the number here made this fail for the drawing changing rather than for breaking.
    expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
    // The drawing itself, not an empty shell: the crosshair arms and the open square at the centre.
    expect(svg).toContain('<rect');
    expect(svg).toContain('<path');
  });

  it('still orbits off the model, where a drag turns the view', () => {
    expect(canvasCursor({ kind: 'dental-rim' } as Parameters<typeof canvasCursor>[0], false)).toBe('grab');
  });
});
