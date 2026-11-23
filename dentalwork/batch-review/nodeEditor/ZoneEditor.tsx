/*
 * ONE JOB: draw the zone graph as a Blender-style canvas and turn gestures into graph edits.
 *
 * This is a VIEW. Every rule - socket types, required outputs, what removing a node breaks - lives in
 * `nodeGraph.mjs`, which is tested without a browser. This file only maps: a graph node to a canvas
 * node, an input wire to an edge, a dragged connection to `rewire` / `bindOutput`, a deleted edge to an
 * emptied input, a deleted node to `removeNode`. If a rule ever appears here instead of there, it has
 * escaped its tests.
 *
 * WRONG WIRES CANNOT BE DRAWN. `isValidConnection` asks the model's socket types, so dragging a depth
 * map onto a mask input simply does not connect - Blender's lesson: the connection you cannot make is
 * worth more than the error you would read afterwards.
 *
 * LAYOUT IS NOT MEANING. Where a node sits on the canvas is kept apart from the graph (`positions`),
 * because order of combination is the WIRING. Moving a node changes nothing the engine would read.
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  Background, Controls, Handle, MiniMap, Position, ReactFlow, applyEdgeChanges, applyNodeChanges, useReactFlow, useStore, useUpdateNodeInternals,
  type Connection, type Edge, type EdgeChange, type Node, type NodeChange, type NodeProps,
} from '@xyflow/react';

/**
 * Measure every node again the moment React Flow has registered its container.
 *
 * React Flow measures a node with a ResizeObserver, which reports once on first sight and afterwards
 * only when the size CHANGES. Its handler (`@xyflow/system` updateNodeInternals) silently returns
 * while the store has no container, and the container is registered in the zoom pane's effect - which
 * on this page ran AFTER the first report. The one report was dropped, nothing changed size again, and
 * every node stayed hidden with no wires.
 *
 * Proved, not reasoned, and in both directions: nudging every node's size by one pixel made all twenty
 * wires appear; removing this component brought back 0 wires in a FOREGROUND tab.
 *
 * AND A TESTING TRAP, which hid the fix for a while: a BACKGROUND tab gets no animation frames and no
 * resize notifications, so in one this component's `requestAnimationFrame` never runs and the canvas
 * looks broken whatever the code does. Test the editor in the fronted tab.
 */
export function MeasureWhenReady({ ids }: { ids: string }) {
  const ready = useStore((s) => s.domNode !== null);
  const update = useUpdateNodeInternals();
  useEffect(() => {
    if (ready) requestAnimationFrame(() => update(ids.split(',')));
  }, [ready, ids, update]);
  return null;
}


/* The model's shape, as far as this view needs it. The model itself is plain JS (`nodeGraph.mjs`). */
export interface GraphNode { id: string; kind: string; params: Record<string, string | number>; inputs: Record<string, string | null>; note?: string }
export interface Graph { nodes: GraphNode[]; outputs: Record<string, string | null> }
interface KindSpec { label: string; out: string; inputs: Record<string, string>; params: Record<string, string | number>; fixed?: boolean; reads: string; stage: string }
interface Words { title: string; says: string }
interface ParamWords { label: string; help: string; choices?: [string, string][] }
export interface GraphLib {
  KINDS: Record<string, KindSpec>;
  REQUIRED_OUTPUTS: Record<string, string>;
  /* The plain words, owned by the model and enforced by its tests: nothing on the canvas is a bare engine name. */
  KIND_WORDS: Record<string, Words>;
  PARAM_WORDS: Record<string, ParamWords>;
  OUTPUT_WORDS: Record<string, Words>;
  /* What each value type is called on a node's output ("gives faces"), and the output node's own words: the zone
     and Orient libraries say different things, and a canvas that hard-coded the zones' told an Orient node it
     "gives a rim line". */
  TYPE_WORDS: Record<string, string>;
  OUTPUT_NODE: Words;
  /* A parameter's standard value: the default graph's node with the same id, else the kind's own default. */
  defaultOf(node: GraphNode, key: string): string | number | undefined;
  /* The groups and each kind's group: a coloured stripe per group, so kinds are found at a glance. */
  NODE_GROUPS: Record<string, { title: string; says: string; token: string }>;
  KIND_GROUP: Record<string, string>;
  /* What this version does not read (mirrors zone_graph.rs): drawn as fixed, never as a field. */
  FIXED: { params: Record<string, string[]>; outputs: string[] };
  rewire(g: Graph, id: string, input: string, from: string | null): Graph;
  bindOutput(g: Graph, name: string, from: string | null): Graph;
  removeNode(g: Graph, id: string): Graph;
  setParam(g: Graph, id: string, key: string, value: string | number): Graph;
  unreached(g: Graph): string[];
  validate(g: Graph): { problems: string[]; warnings: string[] };
}
export type Positions = Record<string, { x: number; y: number }>;

export interface ZoneEditorProps {
  lib: GraphLib;
  graph: Graph;
  positions: Positions;
  /**
   * `node.param` keys that already run today through a live rule (R1b.deg -> noSupportSteepDeg). They
   * are marked on the node, because an operator must be able to tell the one edit that takes effect on
   * Apply from the many that are only composed until the engine accepts a graph.
   */
  liveParams?: string[];
  onGraph(next: Graph): void;
  onPositions(next: Positions): void;
  /** Lines per node id: what that step measured on the case on screen (the Orient readouts). Absent: none. */
  values?: Record<string, string[]>;
}

/* ONE output node with a socket per output, like Blender's Material Output - eight separate output
   nodes scattered down the canvas read as eight unrelated things. */
const OUTPUTS = 'outputs';

/** The nodes some wire leads from `roots` back to, the roots included. */
function reachFrom(g: Graph, roots: string[]): Set<string> {
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const from of Object.values(g.nodes.find((n) => n.id === id)?.inputs ?? {})) if (from) visit(from);
  };
  roots.forEach(visit);
  return seen;
}

/**
 * The nodes ONLY fixed outputs need: the part of the graph the operator cannot change in this version.
 * They are not drawn; their output sockets say "already set" (owner review, 2026-11-20). A node a free
 * output also reads (the hole strip feeds Allowed) is drawn like any other.
 */
export function fixedOnly(g: Graph, fixedOutputs: string[]): Set<string> {
  const outs = (pick: (name: string) => boolean) => Object.entries(g.outputs).filter(([name, from]) => from && pick(name)).map(([, from]) => from as string);
  const free = reachFrom(g, outs((name) => !fixedOutputs.includes(name)));
  const fixed = reachFrom(g, outs((name) => fixedOutputs.includes(name)));
  return new Set([...fixed].filter((id) => !free.has(id)));
}

const COL = 260;
const ROW = 210;

/** A first layout: each drawn node one column right of its deepest input, the output node in the last column. */
export function autoLayout(g: Graph, fixedOutputs: string[] = []): Positions {
  const depth = new Map<string, number>();
  const visit = (id: string, seen: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.has(id)) return 0; // a cycle: the model reports it; the layout just must not hang
    seen.add(id);
    const node = g.nodes.find((n) => n.id === id);
    const ins = Object.values(node?.inputs ?? {}).filter((v): v is string => Boolean(v));
    const d = ins.length === 0 ? 0 : 1 + Math.max(...ins.map((from) => visit(from, seen)));
    depth.set(id, d);
    return d;
  };
  g.nodes.forEach((n) => visit(n.id, new Set()));
  const last = Math.max(0, ...depth.values()) + 1;
  const fixed = fixedOnly(g, fixedOutputs);
  const place = (ids: string[], top: number) => {
    const rows = new Map<number, number>();
    for (const id of ids) {
      const col = depth.get(id) ?? 0;
      const r = rows.get(col) ?? 0;
      rows.set(col, r + 1);
      pos[id] = { x: col * COL, y: top + r * ROW };
    }
  };
  const pos: Positions = {};
  place(g.nodes.map((n) => n.id).filter((id) => !fixed.has(id)), 0);
  pos[OUTPUTS] = { x: last * COL, y: 0 };
  return pos;
}

interface ZoneData extends Record<string, unknown> {
  lib: GraphLib; node: GraphNode; idle: boolean; live: string[];
  /* What this node measured on the case on screen (the Orient readouts); absent for none. */
  values?: string[];
  /* The model's problems that name THIS node ("R1: ..."), shown on it; the rest stay in the list above. */
  issues: { text: string; warn: boolean }[];
  onParam(id: string, key: string, value: string | number): void;
  onRemove(id: string): void;
}
interface OutputData extends Record<string, unknown> { lib: GraphLib; filled: Record<string, boolean> }
/**
 * A node added from the toolbar has no position yet: put it in the middle of what is on screen, not
 * wherever a layout would send it, so it appears where the operator is looking.
 */
function PlaceNew({ missing, onPlace }: { missing: string; onPlace(at: Positions): void }) {
  const rf = useReactFlow();
  const dom = useStore((st) => st.domNode);
  useEffect(() => {
    if (!missing || !dom) return;
    const r = dom.getBoundingClientRect();
    const centre = rf.screenToFlowPosition({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    onPlace(Object.fromEntries(missing.split(',').map((id, k) => [id, { x: centre.x - 110 + k * 30, y: centre.y - 80 + k * 30 }])));
  }, [missing, dom, rf, onPlace]);
  return null;
}


function ZoneNode({ data, selected }: NodeProps<Node<ZoneData>>) {
  const { lib, node, idle, live, onParam, onRemove, issues } = data;
  const spec = lib.KINDS[node.kind];
  const words = lib.KIND_WORDS[node.kind];
  const group = lib.NODE_GROUPS[lib.KIND_GROUP[node.kind]];
  const typeText = (want: string) => want.split('|').map((t) => lib.TYPE_WORDS[t] ?? t).join(' or ');
  const inputLabel = (name: string) => (node.kind === 'subtract' ? (name === 'a' ? 'A - kept' : 'B - removed from A') : name === 'a' || name === 'b' ? name.toUpperCase() : name);
  return (
    <div className={`zn${idle ? ' idle' : ''}${spec.fixed ? ' fixed' : ''}${issues.some((i) => !i.warn) ? ' has-issue' : ''}`} style={{ '--zn-group': `var(${group?.token ?? '--muted'})` } as CSSProperties}>
      <div className="zn-group">{group?.title}</div>
      {/* The engine id (R1, NS, ...) is a hover, not a label: it is what messages cite, and noise otherwise. */}
      <div className="zn-head" title={`${node.id} - ${words.says}`}>
        <b>{words.title}</b>
        {selected && !spec.fixed && <button type="button" className="zn-remove nodrag" aria-label={`Remove ${words.title}`} title="Remove this node (or press Delete)" onClick={() => onRemove(node.id)}>×</button>}
      </div>
      {issues.map((i) => <div className={i.warn ? 'zn-warn' : 'zn-issue'} key={i.text}>{i.text}</div>)}
      <div className="zn-says">{words.says}</div>
      {/* TAKES / GIVES, generated from the kind table so they cannot drift from the wiring (WORKBENCH-TABS-PLAN
          section 8): the owner could not tell what a node took in or handed on. */}
      {(data.values?.length ?? 0) > 0 && (
        <div className="zn-readout" data-ui="node-readout" title="What this step measured on the case on screen">
          {data.values!.map((line) => <div key={line}>{line}</div>)}
        </div>
      )}
      <div className="zn-takes" data-ui="node-takes">
        <b>Takes:</b> {Object.keys(spec.inputs).length === 0 ? 'the scan itself' : Object.values(spec.inputs).map(typeText).join(', ')}
        {' · '}<b>Gives:</b> {typeText(spec.out)}
      </div>
      {Object.entries(spec.inputs).map(([name, want]) => (
        // The handle lives INSIDE its row, so it lines up with its label however the sentence above wraps.
        <div className="zn-row zn-socket" key={name}>
          <Handle type="target" position={Position.Left} id={name} className={`h-${want.split('|')[0]}`} />
          <span className="zn-in">{inputLabel(name)}</span>
          <span className="zn-type">{typeText(want)}</span>
        </div>
      ))}
      {Object.entries(node.params).map(([key, value]) => {
        const p = lib.PARAM_WORDS[key] ?? { label: key, help: '' };
        const isLive = live.includes(`${node.id}.${key}`);
        if (lib.FIXED.params[node.kind]?.includes(key)) {
          // A field the engine ignores is a control that lies, so a fixed setting is text, not an input.
          const shown = p.choices?.find(([v]) => v === value)?.[1] ?? String(value);
          return (
            <div className="zn-row" key={key} title={`${p.help} Locked: this version of the engine does not read a change to it yet.`}>
              <span className="zn-in">{p.label}</span>
              <span className="zn-fixed">{shown} · locked</span>
            </div>
          );
        }
        return (
          <label className="zn-row" key={`${key}=${String(value)}`} title={isLive ? `${p.help} LIVE: this one runs today.` : p.help}>
            <span className="zn-in">{p.label}{isLive && <b className="zn-live"> · live</b>}</span>
            {p.choices
              ? (
                <select className="nodrag" defaultValue={String(value)} title={p.choices.find(([v]) => v === String(value))?.[1]} onChange={(e) => onParam(node.id, key, e.target.value)}>
                  {p.choices.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
                )
              : (
                <input
                  className="nodrag"
                  defaultValue={String(value)}
                  type="number"
                  step="any"
                  onBlur={(e) => onParam(node.id, key, Number(e.target.value))}
                />
                )}
            {/* RESTORE (WORKBENCH-TABS-PLAN section 4): shown only when the value differs, and it says what it restores to. */}
            {(() => {
              const back = lib.defaultOf(node, key);
              return back !== undefined && String(back) !== String(value)
                ? <button type="button" className="zn-restore nodrag" data-ui="node-restore" title={`Restore to ${p.choices?.find(([v]) => v === String(back))?.[1] ?? String(back)}`} aria-label={`Restore ${p.label}`} onClick={(e) => { e.preventDefault(); onParam(node.id, key, back); }}>↺</button>
                : null;
            })()}
          </label>
        );
      })}
      {idle && <div className="zn-note">Not connected to the output - not run, costs nothing.</div>}
      {spec.fixed && <div className="zn-note">Found in stage 1 (Orient); fixed here.</div>}
      <div className="zn-row zn-out-row">
        <span className="zn-outtype">gives {lib.TYPE_WORDS[spec.out] ?? spec.out}</span>
        <Handle type="source" position={Position.Right} id="out" className={`h-${spec.out}`} />
      </div>
    </div>
  );
}

/** Outputs stage 1 (Orient) sets: the rim line and the strips grown from it. */
const FROM_ORIENT = ['rim', 'rim_band', 'low_rim_band'];

/** The single output: one socket per name the engine reads, each saying what the engine does with it. */
function OutputNode({ data }: NodeProps<Node<OutputData>>) {
  const { lib, filled } = data;
  return (
    <div className="zo">
      <div className="zn-head"><b>{lib.OUTPUT_NODE.title}</b></div>
      <div className="zn-says">{lib.OUTPUT_NODE.says}</div>
      {Object.entries(lib.REQUIRED_OUTPUTS).map(([name, want]) => (
        <div className={`zn-row zn-socket zo-row${filled[name] ? '' : ' empty'}${lib.FIXED.outputs.includes(name) ? ' fixed' : ''}`} key={name} title={lib.OUTPUT_WORDS[name].says}>
          {lib.FIXED.outputs.includes(name)
            ? <span className="zo-set" aria-hidden="true">✓</span>
            : <Handle type="target" position={Position.Left} id={name} className={`h-${want}`} />}
          <div>
            <b>{lib.OUTPUT_WORDS[name].title}</b>
            {lib.FIXED.outputs.includes(name) && <span className="zo-from"> · already set {FROM_ORIENT.includes(name) ? 'in Orient' : 'by the engine'}</span>}
            <div className="zo-says">{lib.OUTPUT_WORDS[name].says}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// NOT 'output': React Flow ships an `output` type whose stylesheet centres the text and adds a border.
const nodeTypes = { zone: ZoneNode, zoneOutput: OutputNode };

/** The minimap draws each node in its group's colour, read from the token so it follows the theme. */
function minimapColor(node: Node): string {
  const data = node.data as Partial<ZoneData>;
  const token = data.lib && data.node ? data.lib.NODE_GROUPS[data.lib.KIND_GROUP[data.node.kind]]?.token : undefined;
  return token ? getComputedStyle(document.documentElement).getPropertyValue(token).trim() || 'gray' : getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
}

export function ZoneEditor({ lib, graph, positions, liveParams = [], onGraph, onPositions, values }: ZoneEditorProps) {
  const idle = useMemo(() => new Set(lib.unreached(graph)), [lib, graph]);
  const fixed = useMemo(() => fixedOnly(graph, lib.FIXED.outputs), [graph, lib]);
  // Every model message that concerns one node starts with its id and a colon - the one convention
  // validate() keeps - so the node at fault can carry its own message instead of a list naming ids.
  const issues = useMemo(() => {
    const { problems, warnings } = lib.validate(graph);
    const by = new Map<string, { text: string; warn: boolean }[]>();
    const add = (m: string, warn: boolean) => {
      const at = m.indexOf(': ');
      const id = at > 0 ? m.slice(0, at) : '';
      if (graph.nodes.some((n) => n.id === id)) by.set(id, [...(by.get(id) ?? []), { text: m.slice(at + 2), warn }]);
    };
    problems.forEach((m) => add(m, false));
    warnings.forEach((m) => add(m, true));
    return by;
  }, [lib, graph]);
  const onParam = useCallback((id: string, key: string, value: string | number) => onGraph(lib.setParam(graph, id, key, value)), [lib, graph, onGraph]);
  const onRemove = useCallback((id: string) => onGraph(lib.removeNode(graph, id)), [lib, graph, onGraph]);

  const derived: Node[] = useMemo(() => [
    // What only a fixed output needs (the rim line and its strips from Orient, the sockets) is not
    // drawn: the owner's call, 2026-11-20 - "no reason to make it into a node, just show it is already
    // set". It stays in the graph, because the engine checks those outputs by name.
    ...graph.nodes.filter((n) => !fixed.has(n.id)).map((n) => ({
      id: n.id, type: 'zone', position: positions[n.id] ?? { x: 0, y: 0 },
      deletable: !lib.KINDS[n.kind].fixed,
      data: { lib, node: n, idle: idle.has(n.id), live: liveParams, onParam, onRemove, issues: issues.get(n.id) ?? [], values: values?.[n.id] } satisfies ZoneData,
    })),
    {
      id: OUTPUTS, type: 'zoneOutput', position: positions[OUTPUTS] ?? { x: 0, y: 0 }, deletable: false,
      data: { lib, filled: Object.fromEntries(Object.keys(lib.REQUIRED_OUTPUTS).map((k) => [k, Boolean(graph.outputs[k])])) } satisfies OutputData,
    },
  ], [graph, positions, lib, idle, liveParams, onParam, onRemove, issues, fixed, values]);

  /*
   * React Flow keeps each node's MEASURED size in the node object, delivered through onNodesChange.
   * Rebuilding nodes from the graph on every render threw that away, so wires had no handle positions
   * and none were drawn - 22 nodes, 34 sockets, 0 edges on the first run. Local state takes every
   * change (size, selection, drag) and keeps the measurement across rebuilds from the graph.
   */
  const [nodes, setNodes] = useState<Node[]>(derived);
  useEffect(() => {
    setNodes((prev) => derived.map((n) => {
      const was = prev.find((p) => p.id === n.id);
      return was ? { ...n, measured: was.measured, selected: was.selected } : n;
    }));
  }, [derived]);
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)), []);

  const derivedEdges: Edge[] = useMemo(() => [
    ...graph.nodes.filter((n) => !fixed.has(n.id)).flatMap((n) => Object.entries(n.inputs).filter(([, from]) => from && !fixed.has(from)).map(([input, from]) => ({
      id: `${from}->${n.id}.${input}`, source: from as string, sourceHandle: 'out', target: n.id, targetHandle: input,
    }))),
    ...Object.entries(graph.outputs).filter(([name, from]) => from && !lib.FIXED.outputs.includes(name)).map(([name, from]) => ({
      id: `${from}->${OUTPUTS}.${name}`, source: from as string, sourceHandle: 'out', target: OUTPUTS, targetHandle: name, className: 'to-output',
    })),
  ], [graph, fixed, lib]);

  /*
   * Same rule as the nodes: React Flow emits a wire's SELECTION through onEdgesChange. Rebuilding the
   * edges from the graph without holding it meant a clicked wire never became selected - the click
   * landed on the right path, measured, and nothing could then be deleted with the keyboard.
   */
  const [edges, setEdges] = useState<Edge[]>(derivedEdges);
  useEffect(() => {
    setEdges((prev) => derivedEdges.map((e) => ({ ...e, selected: prev.find((p) => p.id === e.id)?.selected ?? false })));
  }, [derivedEdges]);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((es) => applyEdgeChanges(changes, es)), []);

  /** The model's socket rule, asked before a wire may land: wrong types do not connect at all. */
  const isValidConnection = useCallback((c: Connection | Edge) => {
    const from = graph.nodes.find((n) => n.id === c.source);
    if (!from || c.source === c.target) return false;
    const out = lib.KINDS[from.kind].out;
    if (c.target === OUTPUTS) return Boolean(c.targetHandle) && !lib.FIXED.outputs.includes(c.targetHandle as string) && lib.REQUIRED_OUTPUTS[c.targetHandle as string] === out;
    const to = graph.nodes.find((n) => n.id === c.target);
    const want = to && c.targetHandle ? lib.KINDS[to.kind].inputs[c.targetHandle] : undefined;
    return Boolean(want && want.split('|').includes(out));
  }, [graph, lib]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return;
    if (c.target === OUTPUTS) { if (c.targetHandle) onGraph(lib.bindOutput(graph, c.targetHandle, c.source)); }
    else if (c.targetHandle) onGraph(lib.rewire(graph, c.target, c.targetHandle, c.source));
  }, [graph, lib, onGraph]);

  /** Deleting a wire EMPTIES the input - the model then names what is missing. */
  const onEdgesDelete = useCallback((gone: Edge[]) => {
    let next = graph;
    for (const e of gone) {
      if (e.target === OUTPUTS) { if (e.targetHandle) next = lib.bindOutput(next, e.targetHandle, null); }
      else if (e.targetHandle) next = lib.rewire(next, e.target, e.targetHandle, null);
    }
    onGraph(next);
  }, [graph, lib, onGraph]);

  const onNodesDelete = useCallback((gone: Node[]) => {
    let next = graph;
    for (const n of gone) if (n.type === 'zone') next = lib.removeNode(next, n.id);
    onGraph(next);
  }, [graph, lib, onGraph]);

  const onNodeDragStop = useCallback((_e: unknown, n: Node) => onPositions({ ...positions, [n.id]: n.position }), [positions, onPositions]);
  const fitOptions = useMemo(() => ({
    minZoom: 0.6, padding: 0.05,
    nodes: [...graph.nodes.filter((n) => !fixed.has(n.id)).map((n) => ({ id: n.id })), { id: OUTPUTS }],
  }), [graph, fixed]);
  const onPlace = useCallback((at: Positions) => onPositions({ ...positions, ...at }), [positions, onPositions]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      isValidConnection={isValidConnection}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      onNodesDelete={onNodesDelete}
      onNodeDragStop={onNodeDragStop}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
      // Fit the part the operator EDITS - the free nodes and the output - not all of it: fitting every node
      // zoomed out until a sentence was 6 px tall. The fixed band is just below, a scroll away, and the
      // minimap shows it. The Controls' fit button uses the same options, or it would undo this.
      fitViewOptions={fitOptions}
      minZoom={0.2}
      proOptions={{ hideAttribution: false }}
    >
      <MeasureWhenReady ids={nodes.map((n) => n.id).join(',')} />
      <PlaceNew missing={graph.nodes.filter((n) => !positions[n.id]).map((n) => n.id).join(',')} onPlace={onPlace} />
      <Background />
      <Controls fitViewOptions={fitOptions} />
      <MiniMap pannable zoomable nodeColor={minimapColor} />
    </ReactFlow>
  );
}
