/*
 * ONE JOB: draw the rim tab's nodes read-only - one card per node, one wire per input, the rim-derived nodes greyed
 * with their reason (docs/ORIENT-NODES.md section 10, "On the rim tab, every rim-derived node is greyed out").
 *
 * This is a VIEW of `nodeGraph.mjs` `rimTabView(kind)`, which owns the words and the greying rule and is tested without
 * a browser. Nothing here can be connected, removed or edited: every node stands for today's code, and a control that
 * accepted an edit nothing reads would be a control that lies. Dragging a card only moves it (layout is not meaning).
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Background, Controls, Handle, Position, ReactFlow, applyNodeChanges, type Edge, type Node, type NodeChange, type NodeProps } from '@xyflow/react';
import { MeasureWhenReady, type Positions } from './ZoneEditor';

/** One node as `rimTabView` describes it. */
export interface RimTabNode { id: string; title: string; says: string; out: string; derived: boolean; reason: string | null; inputs: [string, string][]; takes: string[] }
export interface RimCanvasProps { kind: string; view: RimTabNode[] }

const GIVES: Record<string, string> = { frame: 'a frame', direction: 'a direction', rim: 'a rim line', mask: 'faces', plane: 'a plane', position: 'a point' };

function RimNode({ data }: NodeProps<Node<{ n: RimTabNode }>>) {
  const { n } = data;
  return (
    <div
      className={`zn rim-node${n.derived ? ' derived' : ''}`}
      aria-disabled={n.derived || undefined}
      data-ui={`rim-node-${n.id}`}
      style={{ '--zn-group': n.derived ? 'var(--muted)' : 'var(--node-orient)' } as CSSProperties}
    >
      <div className="zn-group">{n.derived ? 'From the rim' : 'Rim tab'}</div>
      {/* The engine id is a hover, as on the zone canvas: it is what messages cite, and noise otherwise. */}
      <div className="zn-head" title={`${n.id} - ${n.says}`}><b>{n.title}</b></div>
      {n.reason && <div className="zn-reason">{n.reason}</div>}
      <div className="zn-says">{n.says}</div>
      {/* Takes / Gives, from the node's own wiring (WORKBENCH-TABS-PLAN section 8). */}
      <div className="zn-takes" data-ui="node-takes">
        <b>Takes:</b> {n.takes.length === 0 ? 'the scan itself' : n.takes.map((type) => GIVES[type] ?? type).join(', ')}
        {' · '}<b>Gives:</b> {GIVES[n.out] ?? n.out}
      </div>
      {n.inputs.map(([name]) => (
        <div className="zn-row zn-socket" key={name}>
          <Handle type="target" position={Position.Left} id={name} isConnectable={false} />
          <span className="zn-in">{name}</span>
        </div>
      ))}
      <div className="zn-row zn-out-row">
        <span className="zn-outtype">gives {GIVES[n.out] ?? n.out}</span>
        <Handle type="source" position={Position.Right} id="out" isConnectable={false} />
      </div>
    </div>
  );
}

const nodeTypes = { rim: RimNode };

const COL = 250;
const ROW = 150;

/**
 * One column per depth, and each node on the row of its first input when that row is free in its column - so a chain
 * (rim plane -> rim crossing) runs straight across instead of climbing. Rows are 150 px, not the zone editor's 210:
 * these cards hold no settings, and the zone editor's spacing zoomed the fitted canvas out to unreadable text.
 */
export function layoutRimTab(view: RimTabNode[]): Positions {
  const depth = new Map<string, number>();
  const depthOf = (id: string, seen = new Set<string>()): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const ins = view.find((n) => n.id === id)?.inputs ?? [];
    const d = ins.length === 0 ? 0 : 1 + Math.max(...ins.map(([, from]) => depthOf(from, seen)));
    depth.set(id, d);
    return d;
  };
  const row = new Map<string, number>();
  const taken = new Map<number, Set<number>>();
  for (const n of view) {
    const col = depthOf(n.id);
    const used = taken.get(col) ?? new Set<number>();
    let r = n.inputs.length > 0 ? row.get(n.inputs[0]![1]) ?? 0 : 0;
    while (used.has(r)) r += 1;
    used.add(r);
    taken.set(col, used);
    row.set(n.id, r);
  }
  return Object.fromEntries(view.map((n) => [n.id, { x: depthOf(n.id) * COL, y: (row.get(n.id) ?? 0) * ROW }]));
}

export function RimCanvas({ view }: RimCanvasProps) {
  const positions = useMemo(() => layoutRimTab(view), [view]);
  const derived = useMemo<Node[]>(() => view.map((n) => ({
    id: n.id, type: 'rim', position: positions[n.id] ?? { x: 0, y: 0 }, data: { n }, deletable: false, connectable: false,
  })), [view, positions]);
  // Same trap as the zone editor: React Flow keeps each node's MEASURED size in local state; rebuilding from the
  // view without carrying it drops the size, and wires have no handle positions to draw from.
  const [nodes, setNodes] = useState<Node[]>(derived);
  useEffect(() => {
    setNodes((prev) => derived.map((n) => ({ ...n, measured: prev.find((p) => p.id === n.id)?.measured })));
  }, [derived]);
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)), []);
  const edges = useMemo<Edge[]>(() => view.flatMap((n) => n.inputs.map(([name, from]) => ({
    id: `${from}->${n.id}.${name}`, source: from, sourceHandle: 'out', target: n.id, targetHandle: name,
    className: n.derived ? 'to-derived' : undefined,
  }))), [view]);
  // A floor on the fitted zoom, so a sentence stays readable; a wide aligner tab scrolls a little rather than shrinking.
  const fit = useMemo(() => ({ padding: 0.06, minZoom: 0.8, maxZoom: 1 }), []);
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      nodesConnectable={false}
      deleteKeyCode={null}
      fitView
      fitViewOptions={fit}
      minZoom={0.2}
      proOptions={{ hideAttribution: false }}
    >
      <MeasureWhenReady ids={nodes.map((n) => n.id).join(',')} />
      <Background />
      <Controls showInteractive={false} fitViewOptions={fit} />
    </ReactFlow>
  );
}
