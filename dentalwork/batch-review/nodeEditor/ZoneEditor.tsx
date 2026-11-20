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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background, Controls, Handle, MiniMap, Position, ReactFlow, applyEdgeChanges, applyNodeChanges, useStore, useUpdateNodeInternals,
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
function MeasureWhenReady({ ids }: { ids: string }) {
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
  rewire(g: Graph, id: string, input: string, from: string | null): Graph;
  bindOutput(g: Graph, name: string, from: string | null): Graph;
  removeNode(g: Graph, id: string): Graph;
  setParam(g: Graph, id: string, key: string, value: string | number): Graph;
  unreached(g: Graph): string[];
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
}

/* ONE output node with a socket per output, like Blender's Material Output - eight separate output
   nodes scattered down the canvas read as eight unrelated things. */
const OUTPUTS = 'outputs';

/** A first layout: each node one column right of its deepest input, outputs in the last column. */
export function autoLayout(g: Graph): Positions {
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
  const rows = new Map<number, number>();
  const at = (col: number) => { const r = rows.get(col) ?? 0; rows.set(col, r + 1); return r; };
  const pos: Positions = {};
  for (const n of g.nodes) { const col = depth.get(n.id) ?? 0; pos[n.id] = { x: col * 260, y: at(col) * 230 }; }
  pos[OUTPUTS] = { x: last * 260, y: 0 };
  return pos;
}

interface ZoneData extends Record<string, unknown> {
  lib: GraphLib; node: GraphNode; idle: boolean; live: string[];
  onParam(id: string, key: string, value: string | number): void;
}
interface OutputData extends Record<string, unknown> { lib: GraphLib; filled: Record<string, boolean> }

function ZoneNode({ data }: NodeProps<Node<ZoneData>>) {
  const { lib, node, idle, live, onParam } = data;
  const spec = lib.KINDS[node.kind];
  const words = lib.KIND_WORDS[node.kind];
  const inputLabel = (name: string) => (node.kind === 'subtract' ? (name === 'a' ? 'A - kept' : 'B - removed from A') : name === 'a' || name === 'b' ? name.toUpperCase() : name);
  return (
    <div className={`zn${idle ? ' idle' : ''}${spec.fixed ? ' fixed' : ''}`}>
      <div className="zn-head"><b>{words.title}</b><span className="zn-id">{node.id}</span></div>
      <div className="zn-says">{words.says}</div>
      {Object.entries(spec.inputs).map(([name, want]) => (
        // The handle lives INSIDE its row, so it lines up with its label however the sentence above wraps.
        <div className="zn-row zn-socket" key={name}>
          <Handle type="target" position={Position.Left} id={name} className={`h-${want.split('|')[0]}`} />
          <span className="zn-in">{inputLabel(name)}</span>
          <span className="zn-type">{want === 'mask|curve' ? 'faces or a line' : want === 'depthMap' ? 'depth map' : want === 'mask' ? 'faces' : want}</span>
        </div>
      ))}
      {Object.entries(node.params).map(([key, value]) => {
        const p = lib.PARAM_WORDS[key] ?? { label: key, help: '' };
        const isLive = live.includes(`${node.id}.${key}`);
        return (
          <label className="zn-row" key={`${key}=${String(value)}`} title={isLive ? `${p.help} LIVE: this one runs today.` : p.help}>
            <span className="zn-in">{p.label}{isLive && <b className="zn-live"> · live</b>}</span>
            {p.choices
              ? (
                <select className="nodrag" defaultValue={String(value)} onChange={(e) => onParam(node.id, key, e.target.value)}>
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
          </label>
        );
      })}
      {idle && <div className="zn-note">Not connected to the output - not run, costs nothing.</div>}
      {spec.fixed && <div className="zn-note">Found in stage 1 (Orient); fixed here.</div>}
      <div className="zn-row zn-out-row">
        <span className="zn-outtype">gives {spec.out === 'mask' ? 'faces' : spec.out === 'depthMap' ? 'a depth map' : spec.out === 'position' ? 'a point' : 'a line'}</span>
        <Handle type="source" position={Position.Right} id="out" className={`h-${spec.out}`} />
      </div>
    </div>
  );
}

/** The single output: one socket per name the engine reads, each saying what the engine does with it. */
function OutputNode({ data }: NodeProps<Node<OutputData>>) {
  const { lib, filled } = data;
  return (
    <div className="zo">
      <div className="zn-head"><b>Zone output</b></div>
      <div className="zn-says">What the engine reads. Each socket below decides one thing about where tips may go.</div>
      {Object.entries(lib.REQUIRED_OUTPUTS).map(([name, want]) => (
        <div className={`zn-row zn-socket zo-row${filled[name] ? '' : ' empty'}`} key={name} title={lib.OUTPUT_WORDS[name].says}>
          <Handle type="target" position={Position.Left} id={name} className={`h-${want}`} />
          <div>
            <b>{lib.OUTPUT_WORDS[name].title}</b>
            <div className="zo-says">{lib.OUTPUT_WORDS[name].says}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const nodeTypes = { zone: ZoneNode, output: OutputNode };

export function ZoneEditor({ lib, graph, positions, liveParams = [], onGraph, onPositions }: ZoneEditorProps) {
  const idle = useMemo(() => new Set(lib.unreached(graph)), [lib, graph]);
  const onParam = useCallback((id: string, key: string, value: string | number) => onGraph(lib.setParam(graph, id, key, value)), [lib, graph, onGraph]);

  const derived: Node[] = useMemo(() => [
    ...graph.nodes.map((n) => ({
      id: n.id, type: 'zone', position: positions[n.id] ?? { x: 0, y: 0 },
      deletable: !lib.KINDS[n.kind].fixed,
      data: { lib, node: n, idle: idle.has(n.id), live: liveParams, onParam } satisfies ZoneData,
    })),
    {
      id: OUTPUTS, type: 'output', position: positions[OUTPUTS] ?? { x: 0, y: 0 }, deletable: false,
      data: { lib, filled: Object.fromEntries(Object.keys(lib.REQUIRED_OUTPUTS).map((k) => [k, Boolean(graph.outputs[k])])) } satisfies OutputData,
    },
  ], [graph, positions, lib, idle, liveParams, onParam]);

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
    ...graph.nodes.flatMap((n) => Object.entries(n.inputs).filter(([, from]) => from).map(([input, from]) => ({
      id: `${from}->${n.id}.${input}`, source: from as string, sourceHandle: 'out', target: n.id, targetHandle: input,
    }))),
    ...Object.entries(graph.outputs).filter(([, from]) => from).map(([name, from]) => ({
      id: `${from}->${OUTPUTS}.${name}`, source: from as string, sourceHandle: 'out', target: OUTPUTS, targetHandle: name, className: 'to-output',
    })),
  ], [graph]);

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
    if (c.target === OUTPUTS) return Boolean(c.targetHandle) && lib.REQUIRED_OUTPUTS[c.targetHandle as string] === out;
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
      // Fitting all 22 nodes into a short canvas zoomed them out until a field was 7px tall - legible to
      // nobody. Fit no smaller than this; the rest is a pan away, and the minimap shows where.
      fitViewOptions={{ minZoom: 0.6, padding: 0.05 }}
      minZoom={0.2}
      proOptions={{ hideAttribution: false }}
    >
      <MeasureWhenReady ids={nodes.map((n) => n.id).join(',')} />
      <Background />
      <Controls />
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}
