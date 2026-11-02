/*
 * Layer colours of the batch review, for the GLB writers (dentureReviewLayers.ts, profileSelect.ts, reviewCase.ts,
 * rayLayers.ts). They are NOT set here: each is the CSS token `--layer-*` of tokens.css (the same file the viewer
 * reads), parsed at load, so a colour is changed in one place. An alias such as `var(--success)` is followed.
 * Comments on what each layer is are beside its token in tokens.css.
 */
import { readFileSync } from 'node:fs';

const tokensCss = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

const DECLARATION = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
const TOKENS = new Map<string, string>();
for (const [, name, value] of tokensCss.matchAll(DECLARATION)) TOKENS.set(name!, value!.replace(/\/\*.*?\*\//g, '').trim());

/** The colour of a token as 0xRRGGBB, following `var(--other)` aliases. Throws when the token is missing or not a hex colour. */
export function tokenNumber(name: string, seen: readonly string[] = []): number {
  const value = TOKENS.get(name);
  if (value === undefined || seen.includes(name)) throw new Error(`tokens.css has no colour ${name}`);
  const alias = /^var\((--[a-z0-9-]+)\)$/.exec(value);
  if (alias) return tokenNumber(alias[1]!, [...seen, name]);
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (!hex) throw new Error(`${name} is not a #rrggbb colour: ${value}`);
  return Number.parseInt(hex[1]!, 16);
}

const layer = (name: string): number => tokenNumber(`--layer-${name}`);

export const LAYER_COLOURS = {
  allowed: layer('allowed'),
  noSupport: layer('no-support'),
  lowOutside: layer('low-outside'),
  lowUnsupported: layer('low-unsupported'),
  islandResolved: layer('island-resolved'),
  islandUnresolved: layer('island-unresolved'),
  selfSupporting: layer('self-supporting'),
  sockets: layer('sockets'),
  fitting: layer('fitting'),
  suction: layer('suction'),
  drain: layer('drain'),
  ourTips: layer('our-tips'),
  unsupportableTips: layer('unsupportable-tips'),
  tipsLeftOut: layer('tips-left-out'),
  rimEdge: layer('rim-edge'),
  rimEdgeBridged: layer('rim-bridged'),
  holeEdge: layer('hole-edge'),
  holeBand: layer('hole-band'),
  sourceRim: layer('source-rim'),
  sourceHole: layer('source-hole'),
  sourceArea: layer('source-area'),
  sourceLow: layer('source-low'),
  pillars: layer('pillars'),
  owner: layer('owner'),
  downFacing: layer('down-facing'),
  downEdges: layer('down-edges'),
  tightBox: layer('tight-box'),
  middlePlane: layer('middle-plane'),
  symmetryPlane: layer('symmetry-plane'),
  printTilt: layer('ray-r7'),
  rays: layer('tight-box'),
  rayOrigin: layer('ray-origin'),
  rayR1: layer('ray-r1'),
  rayR1b: layer('ray-r1b'),
  rayR2: layer('ray-r2'),
  rayR3: layer('ray-r3'),
  rayR4: layer('ray-r4'),
  rayR5: layer('ray-r5'),
  rayR6: layer('ray-r6'),
  rayR7: layer('ray-r7'),
  rayR8: layer('ray-r8'),
  compareBoth: layer('compare-both'),
  compareOwnerOnly: layer('compare-owner-only'),
  compareOursOnly: layer('compare-ours-only'),
  dentureModel: layer('denture-model'),
  profileModel: layer('profile-model'),
  hardEdges: layer('hard-edges'),
  crossingBlocked: layer('crossing-blocked'),
  crossingUnjudged: layer('crossing-unjudged'),
  vertexBase: layer('vertex-base'),
} as const;
