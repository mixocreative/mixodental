import { describe, expect, it } from 'vitest';
import { scopeIcon } from './iconSvg';

/** Every icon is injected inline beside the others, so one file must never reach another. */
describe('scopeIcon', () => {
  const body = `<defs><style>
      .st0, .st1 { stroke: #000; stroke-width: 8px; }
      .st3 { fill: none; }
    </style></defs>
    <g id="layer"><rect class="st3" width="300" height="300"/><path class="st0" d="M0,0"/></g>`;

  it('gives the class names to the file they came from', () => {
    const out = scopeIcon('denture', body, '0 0 300 300');
    expect(out).toContain('class="denture-st0"');
    expect(out).toContain('.denture-st0, .denture-st1 {');
    expect(out).not.toMatch(/class="st\d"/);
    expect(out).not.toMatch(/\.st\d[,\s{]/);
  });

  it('drops the artboard square, so nothing can outline it', () => {
    const out = scopeIcon('denture', body, '0 0 300 300');
    expect(out).not.toContain('<rect');
    // The artwork itself is untouched.
    expect(out).toContain('<path class="denture-st0"');
  });

  it('keeps a rect that is part of the drawing', () => {
    const drawn = '<rect class="a" x="20" y="20" width="60" height="60"/>';
    expect(scopeIcon('x', drawn, '0 0 300 300')).toContain('<rect');
    expect(scopeIcon('x', '<rect class="a" width="120" height="300"/>', '0 0 300 300')).toContain('<rect');
  });

  it('draws every icon in one colour: the colour of the place it sits in', () => {
    const out = scopeIcon('denture', body, '0 0 300 300');
    expect(out).toContain('stroke: currentColor');
    expect(out).not.toContain('#000');
    const attrs = scopeIcon('x', '<path fill="#1a2b3c" stroke="rgb(1,2,3)" d="M0,0"/>', '0 0 10 10');
    expect(attrs).toContain('fill="currentColor"');
    expect(attrs).toContain('stroke="currentColor"');
  });

  it('leaves none, and the tint that follows the colour, alone', () => {
    expect(scopeIcon('x', '<path fill="none" d="M0,0"/>', '0 0 10 10')).toContain('fill="none"');
    const tint = '<defs><style>.a { fill: color-mix(in srgb, currentColor 14%, transparent); }</style></defs><path class="a"/>';
    expect(scopeIcon('x', tint, '0 0 10 10')).toContain('color-mix(in srgb, currentColor 14%, transparent)');
  });

  it('keeps ids and the references to them inside the one file', () => {
    const refs = '<defs><clipPath id="cut"><path d="M0,0"/></clipPath></defs><g clip-path="url(#cut)"><use href="#cut"/></g>';
    const out = scopeIcon('denture', refs, '0 0 10 10');
    expect(out).toContain('id="denture-cut"');
    expect(out).toContain('url(#denture-cut)');
    expect(out).toContain('href="#denture-cut"');
  });
});
