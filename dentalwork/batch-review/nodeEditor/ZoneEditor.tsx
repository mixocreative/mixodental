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
export interface GraphLib {
  KINDS: Record<string, KindSpec>;
  REQUIRED_OUTPUTS: Record<string, string>;
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

const OUT = 'out:';

/** A first layout: each node one column right of its deepest input, outputs in the last column. */
export function autoLayout(lib: GraphLib, g: Graph): Positions {
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
  for (const n of g.nodes) { const col = depth.get(n.id) ?? 0; pos[n.id] = { x: col * 240, y: at(col) * 150 }; }
  for (const name of Object.keys(lib.REQUIRED_OUTPUTS)) pos[OUT + name] = { x: last * 240, y: at(last) * 64 };
  return pos;
}

interface ZoneData extends Record<string, unknown> {
  lib: GraphLib; node: GraphNode; idle: boolean; live: string[];
  onParam(id: string, key: string, value: string | number): void;
}
interface OutputData extends Record<string, unknown> { name: string; want: string; filled: boolean }

function ZoneNode({ data }: NodeProps<Node<ZoneData>>) {
  const { lib, node, idle, live, onParam } = data;
  const spec = lib.KINDS[node.kind];
  const inputs = Object.entries(spec.inputs);
  return (
    <div className={`zn${idle ? ' idle' : ''}${spec.fixed ? ' fixed' : ''}`} title={`${spec.reads}${node.note ? ` - ${node.note}` : ''}`}>
      <div className="zn-head"><b>{node.id}</b> {spec.label}</div>
      {inputs.map(([name, want], k) => (
        <div className="zn-row" key={name}>
          <Handle type="target" position={Position.Left} id={name} className={`h-${want.split('|')[0]}`} style={{ top: 38 + k * 22 }} />
          <span className="zn-in">{node.kind === 'subtract' ? (name === 'a' ? 'A (kept)' : 'B (removed)') : name}</span>
          <span className="zn-type">{want.replace('|', ' / ')}</span>
        </div>
      ))}
      {Object.entries(node.params).map(([key, value]) => (
        <label className="zn-row" key={key} title={live.includes(`${node.id}.${key}`) ? 'LIVE: this one runs today - press Apply and run again beside the stages.' : undefined}>
          <span className="zn-in">{key}{live.includes(`${node.id}.${key}`) && <b className="zn-live"> · live</b>}</span>
          <input
            className="nodrag"
            defaultValue={String(value)}
            type={typeof spec.params[key] === 'number' ? 'number' : 'text'}
            step="any"
            onBlur={(e) => onParam(node.id, key, typeof spec.params[key] === 'number' ? Number(e.target.value) : e.target.value)}
          />
        </label>
      ))}
      {idle && <div className="zn-note">reaches no output - not evaluated</div>}
      <Handle type="source" position={Position.Right} id="out" className={`h-${spec.out}`} />
      <span className="zn-outtype">{spec.out}</span>
    </div>
  );
}

function OutputNode({ data }: NodeProps<Node<OutputData>>) {
  return (
    <div className={`zo${data.filled ? '' : ' empty'}`} title={`The engine reads "${data.name}" by name. It needs a ${data.want}; left empty, the run is refused.`}>
      <Handle type="target" position={Position.Left} id="in" className={`h-${data.want}`} />
      <b>{data.name}</b> <span className="zn-type">{data.want}</span>
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
    ...Object.entries(lib.REQUIRED_OUTPUTS).map(([name, want]) => ({
      id: OUT + name, type: 'output', position: positions[OUT + name] ?? { x: 0, y: 0 }, deletable: false,
      data: { name, want, filled: Boolean(graph.outputs[name]) } satisfies OutputData,
    })),
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
      id: `${from}->${OUT}${name}`, source: from as string, sourceHandle: 'out', target: OUT + name, targetHandle: 'in', className: 'to-output',
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
    if (c.target?.startsWith(OUT)) return lib.REQUIRED_OUTPUTS[c.target.slice(OUT.length)] === out;
    const to = graph.nodes.find((n) => n.id === c.target);
    const want = to && c.targetHandle ? lib.KINDS[to.kind].inputs[c.targetHandle] : undefined;
    return Boolean(want && want.split('|').includes(out));
  }, [graph, lib]);

  const onConnect = useCallback((c: Connection) => {
    if (!c.source || !c.target) return;
    if (c.target.startsWith(OUT)) onGraph(lib.bindOutput(graph, c.target.slice(OUT.length), c.source));
    else if (c.targetHandle) onGraph(lib.rewire(graph, c.target, c.targetHandle, c.source));
  }, [graph, lib, onGraph]);

  /** Deleting a wire EMPTIES the input - the model then names what is missing. */
  const onEdgesDelete = useCallback((gone: Edge[]) => {
    let next = graph;
    for (const e of gone) {
      if (e.target.startsWith(OUT)) next = lib.bindOutput(next, e.target.slice(OUT.length), null);
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
