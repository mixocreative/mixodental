import { writeFileSync } from 'node:fs';
/*
 * "Any model": a plain isometric block, for the choice that takes ANY STL rather than a dental item.
 *
 * Generated rather than traced, and that is the right way round for this one. Tracing is for things that
 * must be RECOGNISED - a denture, an aligner - where a formula cannot reach the judgement. A block is
 * abstract: there is no correct block to miss, every edge is a straight line, and the generator gets the
 * isometric angles exactly right where a hand would wobble. Same rules as the traced art: 64 grid, one
 * black outline, solid inside, at most five colours.
 */
const N = 64, CELL = 10;
const INK = '#1a1a20', TOP = '#e8edf2', LEFT = '#b9c6d4', RIGHT = '#8e9eb0';
const g = Array.from({ length: N }, () => Array.from({ length: N }, () => ''));
const put = (x, y, v) => { const yy = Math.round(y), xx = Math.round(x); if (yy >= 0 && yy < N && xx >= 0 && xx < N) g[yy][xx] = v; };

const cx = 32, cy = 22, rx = 22, ry = 11, H = 20;   // 2:1 isometric: the top is twice as wide as deep
for (let x = cx - rx; x <= cx + rx; x += 1) {
  const t = Math.abs(x - cx) / rx;
  const topY = cy - ry * (1 - t);        // upper edge of the top face
  const midY = cy + ry * (1 - t);        // lower edge of the top face, and the top of the side
  for (let y = Math.ceil(topY); y <= Math.floor(midY); y += 1) put(x, y, TOP);
  for (let y = Math.floor(midY) + 1; y <= Math.floor(midY) + H; y += 1) put(x, y, x < cx ? LEFT : RIGHT);
}
// The outline, drawn last: TWO cells thick round everything, grown inward, exactly as the traced art
// does it. One cell is four real pixels at 128px and reads as a hairline beside art this chunky.
const OUTLINE = 2;
const solid = g.map((r) => r.map((v) => v !== ''));
for (let pass = 0; pass < OUTLINE; pass += 1) {
  const before = g.map((r) => [...r]);
  for (let y = 0; y < N; y += 1) for (let x = 0; x < N; x += 1) {
    if (!solid[y][x]) continue;
    const touches = [[0,-1],[0,1],[-1,0],[1,0]].some(([dx, dy]) => !(solid[y+dy]?.[x+dx]) || before[y+dy]?.[x+dx] === INK);
    if (touches) g[y][x] = INK;
  }
}
// The corner where the two side faces meet reads as a fold, which a single flat silhouette loses.
for (let y = cy + ry; y <= cy + ry + H; y += 1) put(cx, y, INK);

const runs = (want) => {
  const out = [];
  for (let y = 0; y < N; y += 1) { let run = 0;
    for (let x = 0; x <= N; x += 1) {
      if (x < N && g[y][x] === want) { run += 1; continue; }
      if (run) out.push(`<rect x="${(x - run) * CELL}" y="${y * CELL}" width="${run * CELL}" height="${CELL}"/>`);
      run = 0; } }
  return out.join('');
};
// Keep only the colours that drew something: an empty <g> ends the same way a full one does,
// so testing the string was wrong and filtered every layer out.
const layers = [INK, RIGHT, LEFT, TOP].map((c) => [c, runs(c)]).filter(([, r]) => r !== '').map(([c, r]) => `<g fill="${c}">${r}</g>`);
writeFileSync(process.argv[2], `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N * CELL} ${N * CELL}" shape-rendering="crispEdges">
  ${layers.join('\n  ')}
</svg>
`);
console.log(`generic: ${layers.length} colours, ${layers.reduce((n, l) => n + (l.match(/<rect/g) ?? []).length, 0)} rects`);
