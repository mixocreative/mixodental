/*
 * ONE JOB: the zone graph an operator composes - its nodes, what they connect to, and whether it is
 * a graph the engine could run. Pure: no DOM, no engine, no mesh. `nodeGraph.test.ts` exercises it.
 *
 * WHY A GRAPH AND NOT A FIXED CHAIN (docs/NODE-PLAN.md). A zone is not one decision: several rays
 * and bands produce allowed and forbidden areas that overlap and cancel, and the order they combine
 * in IS the design. Today that composition is five fixed statements in `ruled_tips.rs:151-163` -
 * pure per-face boolean algebra, no state - so it can be data. `defaultGraph()` is those statements,
 * node for node, and it is the graph that has to reproduce today's behaviour exactly.
 *
 * ORDER IS STRUCTURE. Subtraction does not commute, and here that shows as which input feeds which
 * side of a SUBTRACT - never as a position in a list, so inserting a node cannot silently change what
 * another node means.
 *
 * IT RUNS (engine 69). Apply sends an edited graph to the engine, which evaluates it in
 * `dental::denture::zone_graph`. The engine validates a graph when it is SET and refuses with the node
 * named, so the checks here are the fast first pass, not the last word; `zoneGraphParity.test.ts` holds
 * the two to the same verdicts.
 *
 * ONE ZONE (plan D1, docs/WORKBENCH-TABS-PLAN.md section 9). The graph's answer to "may a tip stand here"
 * is ONE output, `zone`, stacked from Mark support / Mark no-support nodes - a later Mark wins. The engine
 * derives the three masks placement reads from it, so no reader changed. A graph saved with the three old
 * outputs (`OLD_ZONE_OUTPUTS`) is turned into a stack by `upgradeGraph`, which every loader calls first.
 */

/** Socket types. A wire is only legal between matching types: the connection you cannot make beats the error you would read later. */
export const TYPES = ['mask', 'depthMap', 'position', 'rim', 'zone'];

/**
 * An input whose type ends in `?` may stay empty (plan D1): a Mark's `under` - the first Mark of a stack has nothing
 * under it and starts from every face Undefined. Every other input must be wired.
 */
const optional = (want) => want.endsWith('?');
/** The type an input takes, without the optional mark. */
export const inputType = (want) => want.replace(/\?$/, '');

/**
 * Every node kind: its inputs (name -> type), its output type, its parameters with units, and the
 * engine unit it stands for. `stage` is the owner's three stages; only `zones` kinds are editable here.
 */
export const KINDS = {
  // The rim's settings are edited on the RIM tab (WORKBENCH-TABS-PLAN C3), not on the zone canvas, where the node is
  // fixed. Defaults are the engine's constants; the standard graph carries none of them (absent = default), so it stays
  // the standard graph until one is changed. `zone_graph.rs` rim_source / rim_finder check the same limits.
  rim: { stage: 'orient', label: 'Rim', out: 'rim', inputs: {}, params: { source: 'finder', binDeg: 3, shellMm: 2, openGapDeg: 20 }, fixed: true,
    reads: 'denture/rim_lowpoints.rs (the finder) or flat_edge_rim.rs (the flat area\'s edge) - set on the Rim tab' },
  intersection: { stage: 'zones', label: 'Intersection', out: 'position', inputs: {},
    params: { planeA: 'rim', planeB: 'symmetry', face: 'back' },
    reads: 'oral_cavity_ray.rs:49-70 - the two planes meet the box face; three fallbacks when they cannot' },
  planePoint: { stage: 'zones', label: 'Point on plane', out: 'position', inputs: {},
    params: { plane: 'rim', xPct: 50, yPct: 50 },
    reads: 'new - x/y as % of the part extent along the two frame axes in that plane; cannot reproduce today\'s origin' },
  parallelCast: { stage: 'zones', label: 'Parallel cast', out: 'mask', inputs: {},
    params: { from: 'back', toward: 'tissue', deg: 45, pitchMm: 0.1 },
    reads: 'no_support.rs:21; direction = normalize(back·cos θ − top·sin θ) - it leans to TISSUE, not top' },
  sightCast: { stage: 'zones', label: 'Sight cast', out: 'mask', inputs: { origin: 'position' }, params: {},
    reads: 'zones.rs:19 - a face is seen if 2 of 4 samples reach it; uncapped cost' },
  depthCast: { stage: 'zones', label: 'Depth cast', out: 'depthMap', inputs: {},
    params: { axis: 'teeth', side: 'tissue', pitchMm: 0.3 },
    reads: 'holes_axis.rs:83 - returns a DEPTH MAP, not a mask' },
  holes: { stage: 'zones', label: 'Holes', out: 'mask', inputs: { map: 'depthMap' }, params: { minAreaMm2: 0.5 },
    reads: 'holes_axis.rs:166' },
  basinFill: { stage: 'zones', label: 'Basin fill', out: 'mask', inputs: { map: 'depthMap' }, params: { minDepthMm: 1 },
    reads: 'sockets.rs:100 - the socket basins, before any cancel' },
  band: { stage: 'zones', label: 'Band', out: 'mask', inputs: { seeds: 'mask|rim' }, params: { mm: 5 },
    reads: 'rim_graph.rs:112 - grows along mesh edges from faces OR a rim line\'s vertices' },
  // Step 9 (docs/ORIENT-NODES.md section 10), OFF by default: offered in the palette, in no default graph.
  rimSide: { stage: 'zones', label: 'Rim side', out: 'mask', inputs: { rim: 'rim' }, params: { which: 'inner', mm: 2 },
    reads: 'zone_graph.rs rim_side - the strip along the rim on one side, by which way each face looks across the rim' },
  union: { stage: 'zones', label: 'Union', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {}, reads: 'A or B, per face' },
  subtract: { stage: 'zones', label: 'Subtract', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {},
    reads: 'A and not B. A is the minuend: swapping them is a different zone' },
  intersect: { stage: 'zones', label: 'Intersect', out: 'mask', inputs: { a: 'mask', b: 'mask' }, params: {}, reads: 'A and B, per face' },
  not: { stage: 'zones', label: 'Not', out: 'mask', inputs: { a: 'mask' }, params: {},
    reads: 'every face A does not hold - forced by the engine: low admission tests !no_support (ruled_tips.rs:191)' },
  // THE ONE-ZONE STACK (docs/WORKBENCH-TABS-PLAN.md section 9, plan D1; engine `zone_graph.rs` Zone). Each Mark takes
  // the zone so far (`under`, optional) and a set of faces, and gives the zone with those faces marked; a later Mark
  // wins. The engine derives the three masks placement reads from the Zone, so no reader changed.
  markSupport: { stage: 'zones', label: 'Mark support', out: 'zone', inputs: { under: 'zone?', faces: 'mask' }, params: { seen: true },
    reads: 'zone_graph.rs Zone::mark - Support on its faces; `seen` keeps rim and hole tips there under "rim obeys no-support"' },
  markNoSupport: { stage: 'zones', label: 'Mark no-support', out: 'zone', inputs: { under: 'zone?', faces: 'mask' }, params: {},
    reads: 'zone_graph.rs Zone::mark - No-support on its faces; the angle ranking still counts them under a later Support' },
};

/*
 * PLAIN WORDS, owned here and shown on every node (owner, 2026-11-20: "a lot of things are unclear -
 * what is tissue, what is band, what is basin fill"). `title` is what a node is called on the canvas,
 * `says` is the one sentence under it. Engine names stay as the kind keys, because they are what the
 * engine reads; nobody should have to know them to use the editor. `nodeGraph.test.ts` fails if a kind
 * has no title or sentence.
 */
/*
 * NODE GROUPS (owner, 2026-11-20: "categorize and organize the nodes, colour code them, so they are easy
 * to find and work with"). Each group's colour is a token in tokens.css (`--node-*`), kept apart from
 * the 3D layer colours, which mean something else. `nodeGraph.test.ts` fails on a kind with no group.
 */
export const NODE_GROUPS = {
  rays: { title: 'Rays', says: 'Mark faces by shooting rays at the part.', token: '--node-rays' },
  points: { title: 'Points', says: 'A place rays start from.', token: '--node-points' },
  maps: { title: 'Maps & finds', says: 'Look through the part and find holes or sockets.', token: '--node-maps' },
  strips: { title: 'Strips', says: 'Faces within a distance of something.', token: '--node-strips' },
  combine: { title: 'Combine', says: 'Join, remove, overlap or invert sets of faces.', token: '--node-combine' },
  marks: { title: 'Mark the zone', says: 'Stack layers into the Zone: each Mark sets its faces to Support or No-support, and a later Mark wins.', token: '--node-marks' },
  orient: { title: 'From Orient', says: 'Found in stage 1; fixed here.', token: '--node-orient' },
};

/** The group of each node kind. */
export const KIND_GROUP = {
  parallelCast: 'rays', sightCast: 'rays',
  intersection: 'points', planePoint: 'points',
  depthCast: 'maps', holes: 'maps', basinFill: 'maps',
  band: 'strips', rimSide: 'strips',
  union: 'combine', subtract: 'combine', intersect: 'combine', not: 'combine',
  markSupport: 'marks', markNoSupport: 'marks',
  rim: 'orient',
};

export const KIND_WORDS = {
  parallelCast: { title: 'Parallel rays', says: 'Shoots many parallel rays across the whole part from one direction. Every face a ray hits FIRST is marked.' },
  sightCast: { title: 'Rays from a point', says: 'From one point, marks every face that point can see directly.' },
  intersection: { title: 'Rim crossing', says: 'Where the rim plane crosses the symmetry plane, on one side of the part. It comes from the rim, so it exists only after the rim is found. Today\'s cavity rays start here.' },
  planePoint: { title: 'Point on a plane', says: 'A point placed on a plane by % across and % along; 50 / 50 is the centre. Not runnable yet.' },
  depthCast: { title: 'Depth map', says: 'Looks straight through the part along one direction and records how deep it is at every spot. Feeds Find holes and Find sockets. Its settings are fixed in this version.' },
  holes: { title: 'Find holes', says: 'Openings you can see right through the part, found from the depth map. Its setting is fixed in this version.' },
  basinFill: { title: 'Find sockets', says: 'Hollows - like tooth sockets - that would hold resin like a cup, found from the depth map. Not runnable yet: the socket depth comes from the rule "socket depth".' },
  // Owner 2026-11-23: "i still dont get what strip around does" - the title says the action, the sentence the picture.
  band: { title: 'Grow a strip', says: 'Grows its input outward along the surface: every face within the set distance of it, like painting a border round each hole. The hole strip takes its width from here (standard 5 mm; it is where hole tips stand). The two rim strips are grown from the rim at the profile\'s widths, not from this node; since step 7.3 they may feed any zone.' },
  rim: { title: 'Rim line', says: 'The dental rim line found in stage 1 (Orient). Fixed here.' },
  rimSide: { title: 'Rim side', says: "Faces near the rim on ONE side of it: inner faces the fitting surface, outer is the visible outside. Its width is this node's own, not the profile's rim strip width. Nothing uses it until you wire it in." },
  // Names from docs/WORKBENCH-TABS-PLAN.md section 2: "Either A or B" read like a switch that picks one. It is the
  // combine node; the four keep their engine kinds, so every saved graph still loads.
  union: { title: 'Combine (A + B)', says: 'Faces in A, or in B, or in both.' },
  subtract: { title: 'Subtract (A - B)', says: 'Faces in A, minus any that are also in B. A and B are not interchangeable.' },
  intersect: { title: 'Overlap (A and B)', says: 'Only the faces that are in both A and B.' },
  not: { title: 'Invert', says: 'Every face that is NOT in A.' },
  markSupport: { title: 'Mark support', says: 'The faces wired in become Support - area tips may stand there - on top of the zone wired under it. A later Mark wins where they overlap.' },
  markNoSupport: { title: 'Mark no-support', says: 'The faces wired in become No-support on top of the zone wired under it. A later Mark wins where they overlap; the print-angle search still counts them as unwanted even if a later Mark makes them Support.' },
};

/**
 * The directions a ray or a face can name, in the part's own frame - so they mean the same thing
 * however the scan was imported. The keys are what the engine reads (`zone_graph.rs` axis()).
 */
export const DIRECTIONS = [
  ['back', 'back - the open end of the U'],
  ['front', 'front - the closed end, at the front teeth'],
  ['teeth', 'teeth side - where the teeth are'],
  ['tissue', 'tissue side - the side that rests on the gums'],
  ['across', 'across - toward one side (left / right)'],
  ['-across', 'across - toward the other side'],
];

/**
 * Every parameter: its label, its help sentence, and - for anything that is not a number - the only
 * values it may take, as a dropdown (owner: "anything that is not a number should be an input node or
 * a dropdown"). Free text is how a typo turns into a refused run. `nodeGraph.test.ts` enforces it.
 */
export const PARAM_WORDS = {
  from: { label: 'rays start along', help: 'The direction the rays point before tilting.', choices: DIRECTIONS },
  toward: { label: 'tilting toward', help: 'The rays tilt from "start along" toward this, by the angle.', choices: DIRECTIONS },
  deg: { label: 'tilt (deg)', help: 'How far the rays tilt from "start along" toward "tilting toward". 0 = off: no rays.' },
  pitchMm: { label: 'ray spacing (mm)', help: 'Distance between neighbouring rays. Smaller is finer and slower.' },
  planeA: { label: 'first plane', help: 'One of the two planes whose crossing gives the point.',
    choices: [['rim', 'rim plane - fitted through the rim line (comes from the rim)'], ['symmetry', 'symmetry plane - splits left from right, from the arch frame']] },
  planeB: { label: 'second plane', help: 'The other plane.',
    choices: [['symmetry', 'symmetry plane - splits left from right, from the arch frame'], ['rim', 'rim plane - fitted through the rim line (comes from the rim)']] },
  face: { label: 'on the side', help: 'Which side of the part the point sits on.', choices: DIRECTIONS },
  plane: { label: 'plane', help: 'The plane the point sits on.',
    choices: [['rim', 'rim plane'], ['symmetry', 'symmetry plane'], ['back', 'box face: back'], ['front', 'box face: front'], ['teeth', 'box face: teeth side'], ['tissue', 'box face: tissue side']] },
  xPct: { label: '% across', help: '0 to 100 across the plane; 50 is the centre.' },
  yPct: { label: '% along', help: '0 to 100 along the plane; 50 is the centre.' },
  axis: { label: 'look along', help: 'The direction the depth map looks through the part.',
    choices: [['teeth', 'teeth - tissue axis'], ['back', 'back - front axis'], ['across', 'left - right axis']] },
  side: { label: 'look from', help: 'Which side the depth map looks from.', choices: [['tissue', 'tissue side'], ['teeth', 'teeth side']] },
  minAreaMm2: { label: 'smallest hole (mm2)', help: 'Openings smaller than this are ignored.' },
  minDepthMm: { label: 'shallowest socket (mm)', help: 'Hollows shallower than this are not sockets.' },
  mm: { label: 'strip width (mm)', help: 'How far from the seeds the strip reaches, measured along the surface.' },
  which: { label: 'side of the rim', help: 'Inner faces the fitting surface; outer is the visible outside.',
    choices: [['inner', 'inner - facing the fitting surface'], ['outer', 'outer - the visible outside']] },
  // The Rim node's settings (C3), edited on the Rim tab. The finder cuts the arch into bins round its centre and takes
  // the lowest point of the outer shell in each; an empty stretch of at least the gap cuts the rim (an open U's end).
  source: { label: 'rim from', help: 'Where the rim line comes from. The lowest edge: the finder, as today. The flat area\'s edge: the outline of the flat area the part stands on (Orient\'s "Stand on the flat area"); without one, the found rim is used and the review says why.',
    choices: [['finder', 'the lowest edge (found)'], ['flatEdge', 'the edge of the flat area it stands on']] },
  binDeg: { label: 'search step (deg)', help: 'The finder looks for the lowest point once per this many degrees round the arch. Smaller follows the rim more closely and is slower. 1 to 10.' },
  shellMm: { label: 'outer shell (mm)', help: 'Only points within this distance of the outermost point of each step count, so the rim stays on the outer edge. Above 0, at most 10.' },
  openGapDeg: { label: 'open end gap (deg)', help: 'An empty stretch of at least this many degrees cuts the rim there - the open end of a U. At least two search steps, at most 120.' },
  // A true / false choice: the canvas hands back the choice's own value, never its text (the engine refuses "true").
  // Owner 2026-11-23 could not read "count it as seen": the label now says what it does. The engine reads it only
  // under rimRespectsNoSupport (ruled_tips.rs: a rim or hole tip on a No-support face is dropped unless it is seen).
  seen: { label: 'keep rim and hole tips here', help: 'Only acts with the rule "rim obeys no-support" on (off by default). That rule removes rim and hole tips from No-support faces - except on faces a Mark support with this set to yes covered, where they are kept. Standard: yes for what the cavity rays see, no for the strip round the holes.',
    choices: [[true, 'yes'], [false, 'no']] },
};

/**
 * What the engine DOES with each output, in plain words - because "no_support" names a mask, not a
 * consequence, and an operator wiring it needs the consequence. Checked against the engine's own
 * readers (docs/NODE-PLAN.md, the six consumers): no_support does NOT gate area tips - allowed does.
 */
export const OUTPUT_WORDS = {
  // The one-zone form (plan D1): what the three old outputs said, now said by the Zone's three states.
  zone: { title: 'Zone', says: 'Every face ends up Support, No-support or Undefined (no Mark touched it). Area tips stand only on Support. With "low outside" at 1 (the default), lowest-point and island tips stay off No-support unless the face is in the low rim strip; on Undefined they still stand. A later Mark wins.' },
  hole_band: { title: 'Hole strip', says: 'The strip around holes where hole tips are placed - as wide as its Grow a strip node (standard 5 mm). The output itself stays wired to that node.' },
  rim: { title: 'Rim line', says: 'The line rim tips are placed along. Found in Orient; fixed here.' },
  rim_band: { title: 'Rim strip', says: 'The strip along the rim where rim-strip tips go. As wide as the profile\'s rim strip width (2 mm by default). Free since step 7.3: fill it with any faces, e.g. the rim strip on the rim\'s inner side only. Rim tips go on these faces whether or not they are Allowed, so faces from the no-support zone here get rim tips.' },
  low_rim_band: { title: 'Low rim strip', says: 'The wider strip along the rim where a lowest point or island still gets a tip, even inside the no-support zone. As wide as the profile\'s low rim strip width (5 mm by default). Free since step 7.3.' },
  sockets: { title: 'Sockets', says: 'Hollows that would trap resin. Rim, hole and area tips stay out of them when "sockets deny" is on. Fixed in this version.' },
};

/**
 * WHAT THIS VERSION DOES NOT READ, mirrored from the engine (`zone_graph.rs` FIXED_OUTPUTS and
 * fixed_params). The canvas shows these as fixed rather than as fields, because a field that accepts
 * an edit the engine then ignores is a control that lies (Fable's check, 2026-11-20: ray spacing, the
 * depth-map and hole settings, the cavity origin's planes and a rewired hole strip all ran "clean" and
 * changed nothing). The engine refuses them too; this is so the operator never gets that far.
 */
/** The two rim strips, by node id: grown at the PROFILE's widths, so their node's `mm` is never read (engine RIM_STRIP_NODES). */
export const RIM_STRIP_IDS = ['RIMBAND', 'LOWRIMBAND'];

/** Whether `key` of `node` is fixed in this version: the kind's fixed settings, and a rim strip's width. */
export function fixedParam(node, key) {
  return (FIXED.params[node.kind] ?? []).includes(key) || (node.kind === 'band' && key === 'mm' && RIM_STRIP_IDS.includes(node.id));
}

export const FIXED = {
  params: {
    parallelCast: ['pitchMm'],
    depthCast: ['axis', 'side', 'pitchMm'],
    holes: ['minAreaMm2'],
    basinFill: ['minDepthMm'],
    intersection: ['planeA', 'planeB', 'face'],
    // A strip's width is NOT here since 2026-11-23: the hole strip grows at its node's width. The two rim strips'
    // width stays the profile's (set on 2 Rim), so their `mm` alone is fixed - by node, in `fixedParam`.
  },
  // rim_band and low_rim_band were freed in step 7.3 (owner ruling 2026-11-23); the strips' WIDTH stays the profile's.
  outputs: ['hole_band', 'rim', 'sockets'],
};

/**
 * The names the engine reads. Placement never looks at the graph: it asks for these BY NAME, the way
 * a render only reads Blender's Material Output. Every one must be filled, or the run is refused -
 * never quietly defaulted, because a graph that fell back to today's behaviour would report a clean
 * run having done nothing it was asked to.
 */
export const REQUIRED_OUTPUTS = {
  zone: 'zone', hole_band: 'mask', rim: 'rim', rim_band: 'mask', low_rim_band: 'mask', sockets: 'mask',
};

/**
 * The three outputs a graph saved before plan D1 used, which the Zone now decides. `upgradeGraph` turns them into
 * Marks; a graph naming both forms is refused, as the engine refuses it ("the zone decides it").
 */
export const OLD_ZONE_OUTPUTS = ['no_support', 'allowed', 'allowed_cavity'];

/** What each value type is called on a node's output ("gives faces"), for the canvas. */
export const TYPE_WORDS = { mask: 'faces', depthMap: 'a depth map', position: 'a point', rim: 'a rim line', zone: 'a zone' };

/** The output node's own words on the canvas. */
export const OUTPUT_NODE = { title: 'Zone output', says: 'What the engine reads. Each socket below decides one thing about where tips may go.' };

/**
 * The print-angle search, which is an ORIENT-stage node (the owner: it sets the range auto-detection
 * searches). The denture stands on the plate teeth end DOWN; 0 deg is bolt upright, and a positive
 * angle leans it so the teeth side tips UP toward the viewer (`denture/tilt.rs:1-3`). The search
 * tries every step from start to end and keeps the best by an ordered preference (`tilt.rs:16-19`).
 *
 * These are PROFILE fields, not rules, so they are read-only until `register_profile` exists. The
 * numbers must match the shipped profile: `nodeGraph.test.ts` reads the vendored profile and fails if
 * they drift, because a node showing 45 while the engine searches 30 would be lying.
 */
export const PRINT_ANGLE_SEARCH = { startDeg: 0, endDeg: 45, stepDeg: 2, marginDeg: 2 };

/**
 * The rim strips' widths in the shipped denture profile (`rimBandMm`, `lowRimBandMm`), quoted in the words above. The
 * engine grows each strip at the PROFILE's width and never reads the RIMBAND / LOWRIMBAND node's `mm` (section 10
 * step 7.2), so these are the defaults a type may change. `nodeGraph.test.ts` fails if they drift from the profile.
 */
export const RIM_STRIP_MM = { rim_band: 2, low_rim_band: 5 };

/** Today's denture, node for node (`ruled_tips.rs:151-163`, `:126-143`, `:113-115`). Must reproduce today exactly. */
export function defaultGraph() {
  const nodes = [
    { id: 'R1', kind: 'parallelCast', params: { from: 'back', toward: 'tissue', deg: 45, pitchMm: 0.1 }, inputs: {} },
    { id: 'R1b', kind: 'parallelCast', params: { from: 'back', toward: 'tissue', deg: 0, pitchMm: 0.1 }, inputs: {}, note: 'steep ray; 0 = off' },
    { id: 'ORIGIN', kind: 'intersection', params: { planeA: 'rim', planeB: 'symmetry', face: 'back' }, inputs: {} },
    { id: 'SIGHT', kind: 'sightCast', params: {}, inputs: { origin: 'ORIGIN' } },
    { id: 'MAP', kind: 'depthCast', params: { axis: 'teeth', side: 'tissue', pitchMm: 0.3 }, inputs: {} },
    { id: 'HOLES', kind: 'holes', params: { minAreaMm2: 0.5 }, inputs: { map: 'MAP' } },
    { id: 'BAND', kind: 'band', params: { mm: 5 }, inputs: { seeds: 'HOLES' } },
    { id: 'RIM', kind: 'rim', params: {}, inputs: {} },
    { id: 'RIMBAND', kind: 'band', params: { mm: 2 }, inputs: { seeds: 'RIM' } },
    { id: 'LOWRIMBAND', kind: 'band', params: { mm: 5 }, inputs: { seeds: 'RIM' } },
    { id: 'BASINS', kind: 'basinFill', params: { minDepthMm: 1 }, inputs: { map: 'MAP' } },
    { id: 'NS', kind: 'union', params: {}, inputs: { a: 'R1', b: 'R1b' } },
    { id: 'AL', kind: 'union', params: {}, inputs: { a: 'SIGHT', b: 'BAND' } },
    { id: 'SOCK', kind: 'subtract', params: {}, inputs: { a: 'BASINS', b: 'AL' } },
    // The stack (plan D1), the engine's `zone_default_graph`: the rays No-support, then what the cavity rays see
    // Support (seen), then the strip round the holes Support (not seen). The later Mark wins, so "allowed overrides
    // no-support" IS the order. AL stays because the sockets read it. Proved bit-equal to the old three outputs on
    // the local scans (geocore tests/denture_rules.rs) and by gate:real.
    { id: 'Z1', kind: 'markNoSupport', params: {}, inputs: { faces: 'NS' } },
    { id: 'Z2', kind: 'markSupport', params: { seen: true }, inputs: { under: 'Z1', faces: 'SIGHT' } },
    { id: 'Z3', kind: 'markSupport', params: { seen: false }, inputs: { under: 'Z2', faces: 'BAND' } },
  ];
  // Key order matches what `upgradeGraph` makes of the old default, so `isDefault` holds for an upgraded one.
  const outputs = { hole_band: 'BAND', rim: 'RIM', rim_band: 'RIMBAND', low_rim_band: 'LOWRIMBAND', sockets: 'SOCK', zone: 'Z3' };
  return { nodes, outputs };
}

/*
 * NAMES A SAVED GRAPH MAY STILL USE (docs/ORIENT-NODES.md section 10, build step 3). The rim socket was
 * called `curve` and its node kind `rimCurve` until 2026-11-22; graphs saved before that - a type file,
 * the viewer's browser storage - still say so. They are read through `upgradeGraph`, so no saved graph
 * breaks. Remove an entry only with a type-file version bump: dropping it quietly turns every old graph
 * into "unknown kind" on the next load. The engine never reads this kind (it checks only that `rim` is
 * bound to RIM), so the rename needs no engine change.
 */
export const OLD_KINDS = { rimCurve: 'rim' };

/**
 * `graph` in today's form: old kind names read as today's, and a graph saved with the three old zone outputs turned
 * into a Mark stack (plan D1). Returns the same object when nothing changed. An aligner graph is left alone.
 */
export function upgradeGraph(graph) {
  if (!Array.isArray(graph?.nodes) || graph.kind === 'aligner') return graph;
  const renamed = graph.nodes.some((n) => n.kind in OLD_KINDS)
    ? { ...graph, nodes: graph.nodes.map((n) => (n.kind in OLD_KINDS ? { ...n, kind: OLD_KINDS[n.kind] } : n)) }
    : graph;
  return toOneZone(renamed);
}

/**
 * The three old outputs (no_support N, allowed A, allowed_cavity C) as a stack: Mark no-support N, then Mark support
 * C with `seen`, then Mark support the rest of A without it. Derived back: allowed = C or A, no_support = N, cavity =
 * C - EXACT when C lies inside A. That holds when A is a union with C as one input (today's default and every graph
 * built from it), and then the rest of A is the union's other input; it holds when A is C. Otherwise C cannot be
 * proved inside A without a mesh, so the seen Mark takes Overlap(C, A): allowed and no_support stay exact, and the
 * cavity loses the faces of C outside A - which only the rule "rim obeys no-support" reads, only on those faces.
 * A graph with one of the three left unwired is not converted: its problems say what to wire.
 */
function toOneZone(graph) {
  const out = graph.outputs ?? {};
  if (out.zone || !OLD_ZONE_OUTPUTS.every((name) => out[name])) return graph;
  const { no_support: n, allowed: a, allowed_cavity: c, ...rest } = out;
  const nodes = [...graph.nodes];
  const used = new Set(nodes.map((node) => node.id));
  const id = (wanted, stem) => { let pick = wanted; for (let k = 1; used.has(pick); k += 1) pick = `${stem}${k}`; used.add(pick); return pick; };
  const union = nodes.find((node) => node.id === a);
  let seenFaces = c;
  let restFaces = null;
  if (a === c) restFaces = null;
  else if (union?.kind === 'union' && (union.inputs.a === c || union.inputs.b === c)) restFaces = union.inputs.a === c ? union.inputs.b : union.inputs.a;
  else {
    seenFaces = id('SEEN', 'SEEN');
    nodes.push({ id: seenFaces, kind: 'intersect', params: {}, inputs: { a: c, b: a } });
    restFaces = a;
  }
  const z1 = id('Z1', 'ZN');
  const z2 = id('Z2', 'ZS');
  nodes.push({ id: z1, kind: 'markNoSupport', params: {}, inputs: { faces: n } });
  nodes.push({ id: z2, kind: 'markSupport', params: { seen: true }, inputs: { under: z1, faces: seenFaces } });
  let top = z2;
  if (restFaces) {
    top = id('Z3', 'ZS');
    nodes.push({ id: top, kind: 'markSupport', params: { seen: false }, inputs: { under: z2, faces: restFaces } });
  }
  return { ...graph, nodes, outputs: { ...rest, zone: top } };
}

const byId = (graph, id) => graph.nodes.find((n) => n.id === id);

/** A fresh id for a new node of `kind`: its initials and the next free number - sightCast -> SC1, union -> U1. */
function freshId(graph, kind) {
  const stem = (kind[0] + kind.slice(1).replace(/[a-z]/g, '')).toUpperCase();
  for (let k = 1; ; k += 1) if (!byId(graph, `${stem}${k}`)) return `${stem}${k}`;
}

/** A new graph with one more node of `kind`, unwired, at its default parameters. */
export function addNode(graph, kind) {
  const spec = KINDS[kind];
  if (!spec) throw new Error(`no node kind "${kind}"`);
  if (spec.fixed) throw new Error(`${spec.label} is found by stage 1, not added here`);
  const id = freshId(graph, kind);
  const inputs = Object.fromEntries(Object.keys(spec.inputs).map((name) => [name, null]));
  return { ...graph, nodes: [...graph.nodes, { id, kind, params: { ...spec.params }, inputs }] };
}

/**
 * A new graph without `id`. Wires that pointed at it become EMPTY rather than vanishing, and output
 * bindings to it are cleared - so `validate` names exactly what the deletion broke, instead of the
 * graph quietly reshaping itself around the hole.
 */
export function removeNode(graph, id) {
  if (!byId(graph, id)) throw new Error(`no node ${id}`);
  if (KINDS[byId(graph, id).kind].fixed) throw new Error(`${id} is found by stage 1 and cannot be removed here`);
  const nodes = graph.nodes.filter((n) => n.id !== id).map((n) => ({
    ...n, inputs: Object.fromEntries(Object.entries(n.inputs).map(([k, v]) => [k, v === id ? null : v])),
  }));
  const outputs = Object.fromEntries(Object.entries(graph.outputs).map(([k, v]) => [k, v === id ? null : v]));
  return { nodes, outputs };
}

/**
 * A parameter's STANDARD value, what its restore mark puts back (docs/WORKBENCH-TABS-PLAN.md section 4): the
 * standard graph's node with the same id first, the kind's own default second; undefined when neither has the key.
 * THE TRAP, in that order: a kind's default is not the standard graph's value - `parallelCast.deg` is 45 but the
 * standard graph's R1b is 0 (off), so restoring R1b to its kind's 45 would switch the steep ray ON. Shared by the
 * Orient library, which passes its own standard graph and kinds.
 */
export function defaultParam(standard, kinds, node, key) {
  const same = standard.nodes.find((n) => n.id === node.id && n.kind === node.kind);
  if (same && key in (same.params ?? {})) return same.params[key];
  return kinds[node.kind]?.params?.[key];
}

/** `defaultParam` for the zone graph. */
export const defaultOf = (node, key) => defaultParam(defaultGraph(), KINDS, node, key);

/** A new graph with input `input` of node `id` wired to `from` (or emptied with null). */
export function rewire(graph, id, input, from) {
  const node = byId(graph, id);
  if (!node) throw new Error(`no node ${id}`);
  if (!(input in node.inputs)) throw new Error(`${id} has no input "${input}"`);
  return { ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, inputs: { ...n.inputs, [input]: from } } : n)) };
}

/** A new graph with output `name` bound to node `from` (or emptied). */
export function bindOutput(graph, name, from) {
  if (!(name in REQUIRED_OUTPUTS)) throw new Error(`"${name}" is not an output the engine reads`);
  return { ...graph, outputs: { ...graph.outputs, [name]: from } };
}

/** A new graph with one parameter of `id` set. */
export function setParam(graph, id, key, value) {
  return { ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, params: { ...n.params, [key]: value } } : n)) };
}

const accepts = (want, got) => want.split('|').includes(got);

/**
 * Everything wrong with a graph, each problem naming the node, so the operator is told what to fix
 * before any engine time is spent. Empty means the engine could run it.
 *
 * It also reports WARNINGS, which are graphs that are structurally valid and still wrong in fact - an
 * output wired to something that can never hold a face. Refusal is the wrong tool for those, because
 * nothing is malformed; they must be visible instead.
 */
export function validate(graph) {
  // A graph says its kind (step 4.4); none means denture, as every graph saved before the aligner had one.
  if (graph?.kind === 'aligner') return validateAligner(graph);
  if (graph?.kind !== undefined && graph.kind !== 'denture') {
    return { problems: [`"kind" must be "denture" or "aligner", not "${graph.kind}"`], warnings: [], ok: false };
  }
  const problems = [];
  const warnings = [];
  for (const node of graph.nodes) {
    const spec = KINDS[node.kind];
    if (!spec) { problems.push(`${node.id}: unknown kind "${node.kind}"`); continue; }
    // The engine refuses a tilt outside 0-180 degrees (zone_graph.rs); the editor said nothing and let it through,
    // so the graph failed only when it reached the engine (zoneGraphParity.test.ts listed it, 2026-11-22).
    const deg = node.params?.deg;
    if (deg !== undefined && !(Number.isFinite(deg) && deg >= 0 && deg <= 180)) problems.push(`${node.id}: tilt must be from 0 to 180 degrees, not ${deg}`);
    for (const [name, wantRaw] of Object.entries(spec.inputs)) {
      const from = node.inputs[name];
      if (from === null || from === undefined) {
        if (!optional(wantRaw)) problems.push(`${node.id}: input "${name}" is not connected`);
        continue;
      }
      const want = inputType(wantRaw);
      const source = byId(graph, from);
      if (!source) { problems.push(`${node.id}: input "${name}" points at ${from}, which does not exist`); continue; }
      // A source of unknown kind is reported once, by the loop above; its type is unknowable, so nothing to compare
      // (reading `.out` off it threw, and the whole check died instead of naming the problem).
      const got = KINDS[source.kind]?.out;
      if (got === undefined) continue;
      if (!accepts(want, got)) problems.push(`${node.id}: input "${name}" takes ${want.replace('|', ' or ')}, but ${from} gives ${got}`);
    }
  }
  // One answer to "may a tip stand here": the Zone, or the three old outputs - never both (the engine refuses it too).
  for (const name of OLD_ZONE_OUTPUTS) {
    if (graph.outputs[name]) problems.push(`output "${name}" cannot be wired with a zone output - the zone decides it`);
  }
  for (const [name, want] of Object.entries(REQUIRED_OUTPUTS)) {
    const from = graph.outputs[name];
    if (!from) { problems.push(`output "${name}" is not filled - the engine reads it by name`); continue; }
    const source = byId(graph, from);
    if (!source) { problems.push(`output "${name}" points at ${from}, which does not exist`); continue; }
    const got = KINDS[source.kind]?.out;
    if (got === undefined) continue;
    if (got !== want) problems.push(`output "${name}" needs a ${want}, but ${from} gives ${got}`);
  }
  // A cycle, by depth-first search over the input wires.
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === 'done') return null;
    if (state.get(id) === 'open') return [...path, id];
    state.set(id, 'open');
    const node = byId(graph, id);
    for (const from of Object.values(node?.inputs ?? {})) {
      if (!from || !byId(graph, from)) continue;
      const loop = visit(from, [...path, id]);
      if (loop) return loop;
    }
    state.set(id, 'done');
    return null;
  };
  for (const node of graph.nodes) {
    const loop = visit(node.id, []);
    if (loop) { problems.push(`cycle: ${loop.join(' -> ')}`); break; }
  }
  // Fixed in this version: an edit here would be refused by the engine, so it is refused here first.
  const today = defaultGraph();
  for (const name of FIXED.outputs) {
    if (graph.outputs[name] !== today.outputs[name]) problems.push(`output "${name}" is fixed in this version - it must stay wired to ${today.outputs[name]}`);
  }
  for (const node of graph.nodes) {
    const was = byId(today, node.id)?.params ?? KINDS[node.kind]?.params ?? {};
    for (const key of Object.keys({ ...(KINDS[node.kind]?.params ?? {}), ...node.params }).filter((k) => fixedParam(node, k))) {
      if (key in node.params && node.params[key] !== was[key]) problems.push(`${node.id}: "${key}" is fixed at ${was[key]} in this version - the engine does not read an edit yet`);
    }
    if (node.kind === 'rim') problems.push(...rimProblems(node));
    if (node.kind === 'markSupport' && 'seen' in node.params && typeof node.params.seen !== 'boolean') {
      problems.push(`${node.id}: "seen" must be true or false, not ${JSON.stringify(node.params.seen)}`);
    }
    if (node.kind === 'rimSide') {
      const mm = Number(node.params.mm);
      if (!(mm > 0 && mm <= 20)) problems.push(`${node.id}: mm must be above 0 and at most 20, got ${node.params.mm}`);
      if (node.params.which !== 'inner' && node.params.which !== 'outer') problems.push(`${node.id}: which must be inner or outer, got "${node.params.which}"`);
    }
    // The hole strip's width, as the engine checks it (zone_graph.rs HOLE_BAND_MAX_MM).
    if (node.kind === 'band' && !RIM_STRIP_IDS.includes(node.id) && !(Number(node.params.mm) > 0 && Number(node.params.mm) <= 20)) {
      problems.push(`${node.id}: the hole strip's width must be above 0 and at most 20 mm, got ${node.params.mm}`);
    }
    if (node.kind === 'band' && !RIM_STRIP_IDS.includes(node.id) && byId(graph, node.inputs.seeds)?.kind !== 'holes') {
      problems.push(`${node.id}: in this version a strip must be seeded by Find holes - from anything else it would still run as the hole strip`);
    }
  }
  // Valid but suspect: a parallel cast at 0 degrees is OFF, and an output fed only by it is empty.
  for (const node of graph.nodes) {
    if (node.kind === 'parallelCast' && Number(node.params.deg) === 0) warnings.push(`${node.id}: tilt is 0° - this ray is off and marks nothing`);
  }
  return { problems, warnings, ok: problems.length === 0 };
}

/**
 * The Rim node's settings out of range, worded as the engine words them (`zone_graph.rs` rim_source, rim_finder), so
 * a value is refused on the Rim tab before any run. Absent means the default.
 */
export function rimProblems(node) {
  const p = node.params ?? {};
  const out = [];
  // A key the rim does not read is refused, as the engine refuses it: accepting it would ignore the edit.
  for (const key of Object.keys(p)) if (!(key in KINDS.rim.params)) out.push(`${node.id}: "${key}" is not a rim setting - the rim reads only ${Object.keys(KINDS.rim.params).join(', ')}`);
  if ('source' in p && p.source !== 'finder' && p.source !== 'flatEdge') out.push(`${node.id}: "source" must be finder or flatEdge, got ${JSON.stringify(p.source)}`);
  const num = (key, standard) => (key in p ? Number(p[key]) : standard);
  const [bin, shell, gap] = [num('binDeg', 3), num('shellMm', 2), num('openGapDeg', 20)];
  if (!(bin >= 1 && bin <= 10)) out.push(`${node.id}: binDeg must be between 1 and 10, got ${p.binDeg}`);
  if (!(shell > 0 && shell <= 10)) out.push(`${node.id}: shellMm must be above 0 and at most 10, got ${p.shellMm}`);
  if (!(gap >= 2 * bin && gap <= 120)) out.push(`${node.id}: openGapDeg must be at least two bins (${2 * bin}) and at most 120, got ${p.openGapDeg ?? gap}`);
  return out;
}

/**
 * ONE STEEP ANGLE, NOT TWO. With a graph set, the zones take R1b's angle from the graph and never read
 * the rule `noSupportSteepDeg` (zone_graph.rs current()), while the policy and the review layer still
 * read the rule - so the two must be the same number, or a run is "clean" with the zones and the report
 * disagreeing. Returns the problem, or null. Shared by benchwork's `--zone-graph` and the type file.
 */
export function steepAngleProblem(graph, rules = {}) {
  const steep = graph?.nodes?.find?.((n) => n.id === 'R1b')?.params?.deg;
  if (steep === undefined) return null;
  const rule = rules.noSupportSteepDeg;
  if (rule !== undefined && Number(steep) !== Number(rule)) {
    return `the zone graph sets the steep ray R1b to ${steep} deg but the rule noSupportSteepDeg is ${rule}: the zones would use one and the report the other`;
  }
  if (Number(steep) > 0 && rule === undefined) {
    return `the zone graph sets the steep ray R1b to ${steep} deg but the rule noSupportSteepDeg is not set, so the policy and the review layer would treat it as off (the rule takes 45 to 90, exclusive)`;
  }
  return null;
}

/** The nodes no output reaches. They are not evaluated - an added cast costs rays only once it is wired in. */
export function unreached(graph) {
  const seen = new Set();
  const walk = (id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    for (const from of Object.values(byId(graph, id)?.inputs ?? {})) walk(from);
  };
  for (const from of Object.values(graph.outputs)) walk(from);
  return graph.nodes.filter((n) => !seen.has(n.id)).map((n) => n.id);
}

/*
 * THE ALIGNER'S GRAPH (build step 4.4b, docs/ORIENT-NODES.md section 10). Today's aligner chain as LOCKED nodes,
 * mirrored from the engine (`dental/aligner_graph.rs`): declared so it can be shown and saved in the same shape as
 * the denture's graph, refused on any edit, evaluated by nothing - the aligner still runs orient -> region ->
 * footprint. A graph is an aligner's when it says `kind: 'aligner'`; no kind means denture, so every saved graph
 * stays what it was. `zoneGraphParity.test.ts` holds this table and the engine's to the same verdicts.
 */
export const ALIGNER_KINDS = {
  trimPlane: { label: 'Trim plane', out: 'frame', inputs: {},
    says: 'The plane through the detected trim edges; it gives the direction the aligner opens toward.' },
  lookFrom: { label: 'Look from', out: 'direction', inputs: { frame: 'frame' },
    says: 'Where the rim search looks from: the middle of the part, toward its open end.' },
  rimLoopSharp: { label: 'Rim', out: 'rim', inputs: { look: 'direction' },
    says: 'The innermost sharp edge loop at the open end; if there is none, the last ring of the cap.' },
  visibility: { label: 'Visibility', out: 'mask', inputs: { rim: 'rim' },
    says: 'The faces seen from the open side, found from the rim.' },
  allowedFaces: { label: 'Allowed area', out: 'mask', inputs: { rim: 'rim' },
    says: 'The faces supports may stand on: inside the trim contours.' },
  signedStrip: { label: 'Rim area', out: 'mask', inputs: { allowed: 'mask' },
    says: 'The strip along the rim set by position, width and density in the aligner settings.' },
  contacts: { label: 'Contacts', out: 'position', inputs: { area: 'mask' },
    says: 'The support contacts placed on the rim area.' },
};

/** The aligner's graph, node for node - the only one this version accepts. */
export function alignerGraph() {
  const node = (id, kind, inputs = {}) => ({ id, kind, params: {}, inputs });
  return {
    kind: 'aligner',
    nodes: [
      node('TRIM', 'trimPlane'), node('LOOK', 'lookFrom', { frame: 'TRIM' }), node('RIM', 'rimLoopSharp', { look: 'LOOK' }),
      node('VIS', 'visibility', { rim: 'RIM' }),
      node('ALLOWED', 'allowedFaces', { rim: 'RIM' }), node('AREA', 'signedStrip', { allowed: 'ALLOWED' }),
      node('CONTACTS', 'contacts', { area: 'AREA' }),
    ],
    outputs: { trim_frame: 'TRIM', rim: 'RIM', visibility: 'VIS', allowed: 'ALLOWED', rim_area: 'AREA', contacts: 'CONTACTS' },
  };
}

const ALIGNER_LOCKED = 'the aligner graph is locked in this version - its nodes stand for today\'s aligner chain, which reads no graph';

/** The aligner graph's problems: empty only for `alignerGraph()`. Same order and words as the engine's refusals. */
function validateAligner(graph) {
  const today = alignerGraph();
  const problems = [];
  for (const want of today.nodes) {
    const node = byId(graph, want.id);
    if (!node) { problems.push(`${want.id}: missing - ${ALIGNER_LOCKED}`); continue; }
    if (node.kind !== want.kind) problems.push(`${want.id}: must be a ${want.kind}, not a ${node.kind} - ${ALIGNER_LOCKED}`);
    else if (Object.keys(node.params ?? {}).length > 0) problems.push(`${want.id}: takes no parameters - the aligner's settings come from its profile and tuning; ${ALIGNER_LOCKED}`);
    else if (JSON.stringify(node.inputs ?? {}) !== JSON.stringify(want.inputs)) problems.push(`${want.id}: its inputs must stay as they are - ${ALIGNER_LOCKED}`);
  }
  for (const node of graph.nodes) if (!byId(today, node.id)) problems.push(`${node.id}: a node cannot be added - ${ALIGNER_LOCKED}`);
  for (const [name, from] of Object.entries(today.outputs)) {
    if (graph.outputs?.[name] !== from) problems.push(`output "${name}" must stay wired to ${from} - ${ALIGNER_LOCKED}`);
  }
  for (const name of Object.keys(graph.outputs ?? {})) if (!(name in today.outputs)) problems.push(`output "${name}" is not an aligner output - ${ALIGNER_LOCKED}`);
  return { problems, warnings: [], ok: problems.length === 0 };
}

/*
 * THE RIM TAB (docs/ORIENT-NODES.md section 10): what stage 1 (Orient) finds, as nodes, for each kind - the frame the
 * search starts from, where it looks from, the rim, and what is grown from the rim. Shown read-only: every node stands
 * for today's code, and nothing here is wired by an operator yet.
 *
 * THE GREYING RULE, from both sides: a node computed FROM the finished rim (the rim plane, the rim crossing) is shown
 * greyed and disabled here with its reason, and is what the Support zones tab receives. Nothing on the rim tab may
 * read a greyed node - the rim cannot depend on its own result. `nodeGraph.test.ts` holds that invariant.
 */
// It said "Available from the Support zones tab", which promised a node no Zones palette offers (an aligner run has no
// Zones tab; the denture palette has no rim-plane node until U7) - Fable, 2026-11-23.
export const RIM_DERIVED_REASON = 'Needs the finished rim, so it cannot feed the rim. Not editable in this version.';

export const RIM_TAB_KINDS = {
  ...ALIGNER_KINDS,
  // C3: no Arch frame node here any more - it was Orient's Arch shape under a second name (owner: "are they doing the
  // same thing?"). The rim reads the FINAL orientation from tab 1, and its node says so (`RIM_TAKES`).
  rimLowPoints: { label: 'Rim', out: 'rim', inputs: {},
    says: 'The rim line: by default the lowest outer edge on the tissue side, followed all the way round the arch - or the outline of the flat area the part stands on.' },
  rimStrip: { label: 'Rim strip', out: 'mask', inputs: { rim: 'rim' },
    says: `Faces along the rim, as wide as the profile's rim strip width (${RIM_STRIP_MM.rim_band} mm by default).` },
  lowRimStrip: { label: 'Low rim strip', out: 'mask', inputs: { rim: 'rim' },
    says: `The wider strip along the rim, as wide as the profile's low rim strip width (${RIM_STRIP_MM.low_rim_band} mm by default).` },
  fitPlane: { label: 'Rim plane', out: 'plane', inputs: { rim: 'rim' }, derived: true,
    says: 'The plane fitted through the finished rim line.' },
  rimCrossing: { label: 'Rim crossing', out: 'position', inputs: { plane: 'plane' }, derived: true,
    says: 'Where the rim plane crosses the symmetry plane, at the back of the part. The cavity rays start here.' },
};

/** The rim tab's graph for `kind` ('aligner' | 'denture'): nodes as `{ id, kind, inputs }`, read-only. */
export function rimTabGraph(kind) {
  const node = (id, k, inputs = {}) => ({ id, kind: k, params: {}, inputs });
  const nodes = kind === 'aligner'
    ? [...alignerGraph().nodes, node('RIMPLANE', 'fitPlane', { rim: 'RIM' })]
    : [node('RIM', 'rimLowPoints'), node('RIMBAND', 'rimStrip', { rim: 'RIM' }),
      node('LOWRIMBAND', 'lowRimStrip', { rim: 'RIM' }), node('RIMPLANE', 'fitPlane', { rim: 'RIM' }), node('CROSSING', 'rimCrossing', { plane: 'RIMPLANE' })];
  return { kind, nodes, outputs: {} };
}

/** The Rim node's warning when it follows the flat area's edge but 1 Orient stands the part on no flat area. */
export const FLAT_EDGE_NEEDS_BASE = 'RIM: the rim follows the flat area\'s edge, but 1 Orient does not stand the part on a flat area (no "Stand on the flat area"), so the found rim will be used.';

/** What the rim node takes, said on it: it has no wire on this tab, because it reads the final orientation of tab 1. */
export const RIM_TAKES = 'the final orientation, from 1 Orient';

/** The two strip widths a type may set on the Rim tab: profile placement keys, with their engine defaults. */
export const RIM_STRIP_WIDTHS = { RIMBAND: { key: 'rimBandMm', standard: RIM_STRIP_MM.rim_band }, LOWRIMBAND: { key: 'lowRimBandMm', standard: RIM_STRIP_MM.low_rim_band } };

/**
 * The standard spacing of the tips along the rim line: the shipped denture's `downPitchMm`, which an unset
 * `dentalRimPitchMm` inherits (engine `profile.rs` `dental_rim_pitch`). `nodeGraph.test.ts` fails if it drifts.
 */
export const RIM_LINE_PITCH_MM = 2;

/**
 * EVERY profile number the Rim tab may set, and its check - the ONE list: `typeInForce.ts` (the draft), `serve.mjs`
 * (what /rerun and /tilt-preview pass on) and the page all read it, so a key cannot be offered in one and dropped in
 * another. The strip widths (C3) and, since 2026-11-23, the two spacings (owner: tips along the line at one spacing,
 * the strip's area like the supported area): `dentalRimPitchMm` along the rim line, `rimStripPitchMm` over the strip's
 * area (0 = none of its own, left to the area pass; engine `check_placement` refuses under 0.2 mm).
 */
export const RIM_PLACEMENT = {
  rimBandMm: (v) => v > 0 && v <= 20 ? null : 'must be above 0 and at most 20 mm',
  lowRimBandMm: (v) => v > 0 && v <= 20 ? null : 'must be above 0 and at most 20 mm',
  dentalRimPitchMm: (v) => v >= 0.2 && v <= 10 ? null : 'must be 0.2 to 10 mm',
  rimStripPitchMm: (v) => v === 0 || (v >= 0.2 && v <= 10) ? null : 'must be 0 (like the supported area) or 0.2 to 10 mm',
};

/** A Rim-tab profile number the profile could not take, or null. A key the tab does not set is a problem too. */
export function placementProblem(key, value) {
  const check = RIM_PLACEMENT[key];
  if (!check) return `the Rim tab sets only ${Object.keys(RIM_PLACEMENT).join(', ')}, not ${key}`;
  const n = typeof value === 'number' ? value : Number.NaN;
  const why = Number.isFinite(n) ? check(n) : 'must be a number';
  return why ? `${key} ${why}, got ${value}` : null;
}

/** The old name, kept for the strip widths' callers. */
export const widthProblem = placementProblem;

/**
 * WHICH SIDE OF THE RIM a strip covers (WORKBENCH-TABS-PLAN C3, the strips' Side choice): both (the standard), inner
 * (the fitting surface) or outer (the visible outside). No engine change: the strip's output is free since step 7.3, so
 * a side is the strip AND an engine Rim side node (`rimSide`, step 9), wired in its place. `mm` 20 is the widest Rim
 * side, so the cut only picks the side and the strip keeps its own (profile) width. "both" removes the two nodes and
 * wires the output back to the strip, so an untouched choice leaves the standard graph exactly as it was.
 */
export const STRIP_SIDES = [['both', 'both sides (standard)'], ['inner', 'inner - the fitting surface'], ['outer', 'outer - the visible outside']];
const SIDE_NODES = {
  RIMBAND: { side: 'RIMBAND_SIDE', cut: 'RIMBAND_ON_SIDE', output: 'rim_band' },
  LOWRIMBAND: { side: 'LOWRIMBAND_SIDE', cut: 'LOWRIMBAND_ON_SIDE', output: 'low_rim_band' },
};

/** The side `stripId`'s strip covers in `graph`: 'both', 'inner' or 'outer'. */
export function stripSideOf(graph, stripId) {
  const nodes = SIDE_NODES[stripId];
  const side = nodes && graph?.outputs?.[nodes.output] === nodes.cut ? byId(graph, nodes.side)?.params?.which : undefined;
  return side === 'inner' || side === 'outer' ? side : 'both';
}

/** `graph` with `stripId`'s strip on `side`: the Rim side and its cut added and wired to the output, or removed for 'both'. */
export function withStripSide(graph, stripId, side) {
  const { side: sideId, cut, output } = SIDE_NODES[stripId];
  const nodes = graph.nodes.filter((n) => n.id !== sideId && n.id !== cut);
  if (side !== 'inner' && side !== 'outer') return { ...graph, nodes, outputs: { ...graph.outputs, [output]: stripId } };
  return {
    ...graph,
    nodes: [...nodes,
      { id: sideId, kind: 'rimSide', params: { which: side, mm: 20 }, inputs: { rim: 'RIM' } },
      { id: cut, kind: 'intersect', params: {}, inputs: { a: stripId, b: sideId } }],
    outputs: { ...graph.outputs, [output]: cut },
  };
}

/**
 * The editable fields of one rim-tab node (WORKBENCH-TABS-PLAN C3), on the DENTURE's tab only: the Rim node's four
 * settings live on the zone graph's RIM node (`graph`), the strip widths on the type's profile (`placement`, the edits
 * not yet run). `value` is what the field shows, `standard` what its restore mark puts back; `target` says where an
 * edit goes. The aligner's tab stays locked.
 */
function rimFields(kind, id, graph, placement) {
  if (kind !== 'denture') return [];
  if (id === 'RIM') {
    const rim = graph?.nodes?.find((n) => n.id === 'RIM')?.params ?? {};
    return Object.entries(KINDS.rim.params).map(([key, standard]) => ({
      key, ...PARAM_WORDS[key], value: key in rim ? rim[key] : standard, standard, target: 'graph',
    }));
  }
  const width = RIM_STRIP_WIDTHS[id];
  if (!width) return [];
  const widthField = { key: width.key, label: 'strip width (mm)', help: `This type's ${id === 'RIMBAND' ? 'rim strip' : 'low rim strip'} width, a profile number: the engine grows the strip this far from the rim, along the surface. Above 0, at most 20.`,
    value: placement?.[width.key] ?? width.standard, standard: width.standard, target: 'placement' };
  // The Side choice: a graph edit (`withStripSide`), so `target: 'side'`. Its help says to look at the rim-side pictures
  // first - the owner's condition for using it (WORKBENCH-TABS-PLAN C3); the standard stays both sides.
  const sideField = { key: 'side', label: 'which side of the rim', help: 'Both sides is the standard. Inner keeps only the fitting-surface side of the strip, outer only the visible outside - the other side then gets no strip tips. Look at the rim-side pictures (dentalwork/output/rimside-pictures) before relying on one side.',
    value: stripSideOf(graph, id), standard: 'both', target: 'side', choices: STRIP_SIDES };
  if (id !== 'RIMBAND') return [widthField, sideField];
  // The rim strip's tips (owner 2026-11-23): one spacing along the rim LINE, and the strip's AREA either at the line's
  // spacing (as before), at its own, or left to the area pass like any supported area. Absent keys are the standard.
  return [widthField, sideField,
    { key: 'dentalRimPitchMm', label: 'tip spacing along the rim line (mm)', help: `The distance between tips placed along the rim line itself. Standard ${RIM_LINE_PITCH_MM} mm, the supported area's spacing. 0.2 to 10.`,
      value: placement?.dentalRimPitchMm ?? RIM_LINE_PITCH_MM, standard: RIM_LINE_PITCH_MM, target: 'placement' },
    { key: 'rimStripPitchMm', label: 'tips over the rest of the strip', help: 'The strip\'s faces off the rim line. "Same as the line": a grid of rim tips at the line\'s spacing, even outside the allowed area (as before). "Like the supported area": no grid of its own - the strip gets the normal area tips, only where support is allowed. Or a spacing of its own.',
      value: placement?.rimStripPitchMm === undefined ? '' : String(placement.rimStripPitchMm), standard: '', target: 'placement',
      choices: [['', 'same as the line'], ['0', 'like the supported area'], ['1', '1 mm grid'], ['1.5', '1.5 mm grid'], ['3', '3 mm grid'], ['4', '4 mm grid']] },
  ];
}

/**
 * What the canvas draws for each rim-tab node: its words, whether it is greyed (and why), its wires, and - on the
 * denture's tab - its editable fields and their problems. `ctx` is `{ graph, placement, ran, standsOnFlatArea }`;
 * absent, the fields show their standard values. `standsOnFlatArea` (false when the Orient canvas's pose is not a
 * Stand on the flat area) lets the Rim warn that the flat area's edge cannot be had.
 */
export function rimTabView(kind, ctx = {}) {
  const graph = rimTabGraph(kind);
  return graph.nodes.map((n) => {
    const spec = RIM_TAB_KINDS[n.kind];
    // `takes`: what each input carries (the source's output type), for the node's "Takes:" line - `inputs` holds
    // the source node's ID, which is what the wires need and not what a reader wants to see.
    const takes = n.kind === 'rimLowPoints' ? [RIM_TAKES]
      : Object.values(n.inputs).map((from) => RIM_TAB_KINDS[graph.nodes.find((m) => m.id === from)?.kind]?.out ?? 'unknown');
    const fields = rimFields(kind, n.id, ctx.graph, ctx.placement);
    const problems = n.id === 'RIM' && kind === 'denture'
      ? [...rimProblems({ id: 'RIM', params: Object.fromEntries(fields.map((f) => [f.key, f.value])) }),
        // The flat area's edge needs a flat area to stand on: without one the engine falls back to the found rim (and
        // the case facts say why), so the tab says it BEFORE the run (Fable's review).
        ...(ctx.standsOnFlatArea === false && fields.some((f) => f.key === 'source' && f.value === 'flatEdge')
          ? [FLAT_EDGE_NEEDS_BASE] : [])]
      // A dropdown's value is text ('' = the standard, which is no number at all and needs no check).
      // Profile numbers only: the Side choice is a graph edit, checked with the graph (`validate`).
      : fields.filter((f) => f.target === 'placement' && f.value !== '').map((f) => placementProblem(f.key, f.choices ? Number(f.value) : f.value)).filter(Boolean);
    return { id: n.id, title: spec.label, says: spec.says, out: spec.out, derived: Boolean(spec.derived),
      reason: spec.derived ? RIM_DERIVED_REASON : null, inputs: Object.entries(n.inputs), takes, fields, problems };
  });
}

/** The Rim output card: what tab 3 receives from this tab, one line each (C3). */
export function rimOutputLines(kind, ctx = {}) {
  if (kind !== 'denture') return [];
  const rim = ctx.graph?.nodes?.find((n) => n.id === 'RIM')?.params ?? {};
  const width = (id) => ctx.placement?.[RIM_STRIP_WIDTHS[id].key] ?? RIM_STRIP_WIDTHS[id].standard;
  // What the run on screen used (summary `placementRan`), when it differs from the tab: the widths live in browser
  // storage, so another browser or a cleared one shows the standard while the run used something else (Fable's review).
  const ranWidth = (id) => ctx.ran?.[RIM_STRIP_WIDTHS[id].key] ?? RIM_STRIP_WIDTHS[id].standard;
  const ranNote = (id) => (ranWidth(id) !== width(id) ? ` (the run on screen used ${ranWidth(id)} mm)` : '');
  const sideNote = (id) => { const side = stripSideOf(ctx.graph, id); return side === 'both' ? '' : `, ${side} side only`; };
  const linePitch = ctx.placement?.dentalRimPitchMm ?? RIM_LINE_PITCH_MM;
  const strip = ctx.placement?.rimStripPitchMm;
  const stripTips = strip === undefined ? `rim tips at ${linePitch} mm over the whole strip` : strip === 0 ? 'the rest of the strip gets the supported area\'s tips' : `the rest of the strip a ${strip} mm grid`;
  return [
    `Rim line - ${rim.source === 'flatEdge' ? 'the edge of the flat area the part stands on' : 'the lowest edge, found'} (a rim drawn for one case in the app replaces it); tips every ${linePitch} mm along it`,
    `Rim strip - ${width('RIMBAND')} mm along the rim${sideNote('RIMBAND')}${ranNote('RIMBAND')}; ${stripTips}`,
    `Low rim strip - ${width('LOWRIMBAND')} mm along the rim${sideNote('LOWRIMBAND')}${ranNote('LOWRIMBAND')}`,
    'Rim plane - fitted through the rim line',
    'Rim crossing - where the rim plane meets the symmetry plane: the cavity rays start here',
  ];
}

/** True when `graph` is the default, node for node - the only graph that runs today. */
export function isDefault(graph) {
  return JSON.stringify(graph) === JSON.stringify(defaultGraph());
}

/**
 * Whether two graphs are the same graph, whatever order their keys were written in. The run's summary records the graph
 * it ran with its keys sorted, so comparing the canvas to it by plain JSON text said "changed" right after an Apply had
 * run exactly that graph (owner 2026-11-23: "apply and run is not working"). Array order still counts: it is meaning.
 */
export function sameGraph(a, b) {
  const sorted = (v) => (Array.isArray(v) ? v.map(sorted)
    : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])])) : v);
  return JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
}
