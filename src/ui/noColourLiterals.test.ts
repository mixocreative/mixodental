import { describe, expect, it } from 'vitest';

/*
 * Colours live in CSS tokens only (src/styles.css and, for the batch viewer, dentalwork/batch-review/tokens.css).
 * This test fails when a hex colour or an rgb()/rgba() literal appears in a TSX file or in a viewport / 3D source
 * file, or when a TSX file sets an inline `style=`. See docs/ui-styling.md.
 */

/** Every source file under src/, as text, keyed `src/...`. */
const FILES = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })).map(([path, text]) => [path.startsWith('./') ? path.replace(/^\.\//, 'src/ui/') : path.replace(/^\.\.\//, 'src/'), text]),
);
const read = (path: string) => FILES[path] ?? '';
const rel = (path: string) => path;

/** Every TSX file under src/ (tests included). */
const TSX = Object.keys(FILES).filter((path) => path.endsWith('.tsx'));
/** The viewport and 3D source files (TS and TSX): the viewport folder, the canvas, the 3D layers of the denture flow, the token reader. */
const VIEWPORT_DIRS = ['src/components/viewport', 'src/denture/steps/orient', 'src/denture/parts', 'src/ui'];
const VIEWPORT_FILES = ['src/components/ObjectViewport.tsx'];
const VIEWPORT = Object.keys(FILES).filter((name) => VIEWPORT_DIRS.some((dir) => name.startsWith(`${dir}/`)) || VIEWPORT_FILES.includes(name));
/** The batch-review viewer and its GLB writers: colours come from dentalwork/batch-review/tokens.css only. */
const BATCH = Object.entries(import.meta.glob<string>('../../dentalwork/batch-review/*.{ts,html}', { query: '?raw', import: 'default', eager: true }))
  .map(([path, text]) => [path.replace(/^\.\.\/\.\.\//, ''), text] as const)
  .filter(([path]) => !/\.test\.ts$/.test(path));
/** Tests may name a colour they assert on; the ban is about source. */
const isTest = (path: string) => /\.test\.tsx?$/.test(path);

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/i;
const RGB = /\brgba?\(/;
const NUMBER_COLOUR = /\b0x[0-9a-f]{6}\b/i;

function offenders(files: string[], pattern: RegExp): string[] {
  return files.flatMap((path) => read(path).split('\n').flatMap((line, at) => (pattern.test(line) ? [`${rel(path)}:${at + 1}: ${line.trim().slice(0, 100)}`] : [])));
}

/**
 * Inline `style=` that is truly dynamic (a value computed from data at run time, which a class cannot hold).
 * Each entry: file -> reason. Anything else fails.
 */
const INLINE_STYLE_EXCEPTIONS: Record<string, string> = {
  'src/components/DebugSection.tsx': 'the swatch shows the colour of an engine debug layer, which is data from the engine, not a design colour',
  'src/components/JobActivity.tsx': 'progress bar width is the job percentage',
  'src/progress/Progress.tsx': 'the bar width is the job percentage; the tone is a class, declared per type in styles.css',
  'src/denture/progress/StagedProgress.tsx': 'the staged bar width is the job percentage (same exception as JobActivity)',
  'src/components/RangeField.tsx': 'the allowed band is positioned from the field range',
  'src/ui/parts/TiltDial.tsx': 'each tick and the knob dot are turned by an angle computed from the value and range (--tick-angle, --knob-angle); colours and sizes stay in styles.css',
  'src/components/viewport/CirclePreview.tsx': 'the brush circle size is the brush radius in pixels',
  'src/components/ObjectViewport.tsx': 'the canvas cursor changes with the gesture (its colours are tokens, read in style.ts)',
};

describe('no colour literals outside the token files', () => {
  it('scans the files it is meant to scan', () => {
    expect(TSX.length).toBeGreaterThan(20);
    expect(VIEWPORT.map(rel)).toEqual(expect.arrayContaining(['src/components/viewport/UnitObject.tsx', 'src/components/viewport/sceneColours.ts', 'src/ui/tokenColour.ts', 'src/components/ObjectViewport.tsx']));
  });

  it('has no #hex or rgb()/rgba() in any TSX file', () => {
    expect(offenders(TSX, HEX)).toEqual([]);
    expect(offenders(TSX, RGB)).toEqual([]);
  });

  it('has no #hex, rgb()/rgba() or 0xRRGGBB in the viewport / 3D source', () => {
    const source = VIEWPORT.filter((path) => !isTest(path));
    expect(offenders(source, HEX)).toEqual([]);
    expect(offenders(source, RGB)).toEqual([]);
    // tokenColour.ts holds the one neutral fallback grey; it is not a design colour.
    expect(offenders(source.filter((path) => rel(path) !== 'src/ui/tokenColour.ts'), NUMBER_COLOUR)).toEqual([]);
  });

  it('has no colour literal in the batch-review viewer or its GLB writers', () => {
    expect(BATCH.map(([path]) => path)).toEqual(expect.arrayContaining(['dentalwork/batch-review/viewer.html', 'dentalwork/batch-review/layerColours.ts']));
    for (const [path, text] of BATCH) {
      const lines = text.split(String.fromCharCode(10));
      for (const pattern of [HEX, RGB, NUMBER_COLOUR]) expect(lines.filter((line) => pattern.test(line)).map((line) => `${path}: ${line.trim().slice(0, 80)}`)).toEqual([]);
    }
  });

  it('has no inline style= in TSX, except the listed dynamic values', () => {
    const files = TSX.filter((path) => !isTest(path) && !(rel(path) in INLINE_STYLE_EXCEPTIONS));
    expect(offenders(files, /\bstyle=\{/)).toEqual([]);
    expect(offenders(files, /\bstyle=["']/)).toEqual([]);
  });

  it('lists only exceptions that still use an inline style', () => {
    for (const file of Object.keys(INLINE_STYLE_EXCEPTIONS)) expect(read(file), file).toMatch(/\bstyle=\{/);
  });
});
