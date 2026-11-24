/*
 * ONE JOB: draw the rim tab - one card per node, one wire per input, the rim-derived nodes greyed with their reason
 * (docs/ORIENT-NODES.md section 10), each denture node's settings as fields, and the Rim output card listing what tab 3
 * receives (WORKBENCH-TABS-PLAN C3).
 *
 * This is a VIEW of `nodeGraph.mjs` `rimTabView(kind, ctx)` and `rimOutputLines`, which own the words, the fields, their
 * limits and the greying rule and are tested without a browser. Nothing here can be connected or removed: the wiring is
 * today's code. A field reports its edit through `onField`, and only fields the engine reads exist (the Rim node's four
 * settings, the profile's two strip widths) - a control that accepted an edit nothing reads would be a control that lies.
 * The aligner's tab has no fields: its graph is locked. Dragging a card only moves it (layout is not meaning).
 */
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Background, Controls, Handle, Position, ReactFlow, applyNodeChanges, useStore, type Edge, type Node, type NodeChange, type NodeProps } from '@xyflow/react';
import { MeasureWhenReady, type Positions } from './ZoneEditor';

/** One editable field on a rim-tab node (`nodeGraph.mjs` rimFields): where its edit goes is `target`. */
export interface RimField { key: string; label: string; help: string; value: string | number; standard: string | number; target: 'graph' | 'placement'; choices?: [string, string][] }
/** One node as `rimTabView` describes it. */
export interface RimTabNode { id: string; title: string; says: string; out: string; derived: boolean; reason: string | null; inputs: [string, string][]; takes: string[]; fields?: RimField[]; problems?: string[] }
export interface RimCanvasProps {
  kind: string;
  view: RimTabNode[];
  /** The Rim output card's lines (`rimOutputLines`): what tab 3 receives. Absent or empty: no card. */
  output?: string[];
  /** An edit to a field (C3); `value` null restores the standard. Absent: the tab is read-only, as the aligner's. */
  onField?(nodeId: string, field: RimField, value: string | number | null): void;
  /** The one node selected (null for none or several), for the 3D preview of its line or belt - as ZoneEditor's. */
  onSelect?(id: string | null): void;
}

/** The fields of one node: a dropdown for a choice, a number box otherwise, each with its restore mark when changed. */
function Fields({ n, onField }: { n: RimTabNode; onField?: RimCanvasProps['onField'] }) {
  if (!n.fields?.length || !onField) return null;
  return (
    <>
      {n.fields.map((f) => (
        <label className="zn-row" key={`${f.key}=${String(f.value)}`} title={f.help} data-ui={`rim-field-${n.id}-${f.key}`}>
          <span className="zn-in">{f.label}</span>
          {f.choices
            ? (
              <select className="nodrag" defaultValue={String(f.value)} onChange={(e) => onField(n.id, f, e.target.value)}>
                {f.choices.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
              )
            : <input className="nodrag" type="number" step="any" defaultValue={String(f.value)} onBlur={(e) => onField(n.id, f, Number(e.target.value))} />}
          {String(f.value) !== String(f.standard) && (
            <button type="button" className="zn-restore nodrag" data-ui="node-restore" aria-label={`Restore ${f.label}`}
              title={`Restore to ${f.choices?.find(([v]) => v === String(f.standard))?.[1] ?? String(f.standard)}`}
              onClick={(e) => { e.preventDefault(); onField(n.id, f, null); }}>↺</button>
          )}
        </label>
      ))}
      {n.problems?.map((p) => <div className="zn-issue" key={p}>{p}</div>)}
    </>
  );
}

/** The Rim output card: what the Zones tab receives from this tab (C3), one line each, with one socket in. */
function OutputCard({ data }: NodeProps<Node<{ lines: string[] }>>) {
  return (
    <div className="zn rim-node rim-output" data-ui="rim-output" style={{ '--zn-group': 'var(--node-orient)' } as CSSProperties}>
      <Handle type="target" position={Position.Left} id="in" isConnectable={false} />
      <div className="zn-group">Rim output</div>
      <div className="zn-head"><b>Gives to 3 Zones</b></div>
      {data.lines.map((line) => <div className="zn-says" key={line}>{line}</div>)}
    </div>
  );
}

const GIVES: Record<string, string> = { frame: 'a frame', direction: 'a direction', rim: 'a rim line', mask: 'faces', plane: 'a plane', position: 'a point' };

function RimNode({ data }: NodeProps<Node<{ n: RimTabNode; onField?: RimCanvasProps['onField'] }>>) {
  const { n, onField } = data;
  return (
    <div
      className={`zn rim-node${n.derived ? ' derived' : ''}${n.problems?.length ? ' has-issue' : ''}`}
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
      <Fields n={n} onField={onField} />
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

const nodeTypes = { rim: RimNode, rimOutput: OutputCard };
const OUTPUT = 'rim-output';

/**
 * Hands the cards' heights to the layout, measured in the page. React Flow's own `measured` stayed empty on this
 * canvas - in its store and in the controlled nodes alike (checked in the page 2026-11-24) - so the layout reads each
 * card's offsetHeight, which ignores the canvas zoom, and again whenever a card resizes (a field's problem appears).
 */
function ReportHeights({ ids, onHeights }: { ids: string; onHeights(heights: Record<string, number>): void }) {
  const dom = useStore((s) => s.domNode);
  useEffect(() => {
    if (!dom) return undefined;
    const cards = () => [...dom.querySelectorAll<HTMLElement>('.react-flow__node')];
    const read = () => onHeights(Object.fromEntries(cards().map((el) => [el.dataset.id ?? '', el.offsetHeight] as const).filter(([id, h]) => id && h > 0)));
    const watch = new ResizeObserver(read);
    for (const el of cards()) watch.observe(el);
    read();
    return () => watch.disconnect();
  }, [dom, ids, onHeights]);
  return null;
}

const COL = 250;
// The row height before the cards are measured, and the gap kept between measured cards.
const ROW = 190;
const GAP = 24;

/**
 * One column per depth, and each node on the row of its first input when that row is free in its column - so a chain
 * (rim plane -> rim crossing) runs straight across instead of climbing. A node is placed at its row's height or just
 * below the card above it in its column, whichever is lower, using `heights` (the cards' measured heights): a fixed
 * row could not hold the rim tips belt, whose four fields made it 351 px tall and ran it into the low-point belt
 * below (owner 2026-11-24, "the interface is bad"). Unmeasured cards count as ROW - GAP tall.
 */
export function layoutRimTab(view: RimTabNode[], heights: Record<string, number> = {}): Positions {
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
  // Column by column, down each in row order: a card starts level with its first input (already placed - it is in an
  // earlier column), so a chain still runs straight across, but never above the bottom of the card before it.
  const y = new Map<string, number>();
  for (const col of [...new Set(view.map((n) => depthOf(n.id)))].sort((a, b) => a - b)) {
    let bottom = -GAP;
    for (const n of view.filter((m) => depthOf(m.id) === col).sort((a, b) => row.get(a.id)! - row.get(b.id)!)) {
      const level = n.inputs.length > 0 ? y.get(n.inputs[0]![1]) : undefined;
      const top = Math.max(level ?? row.get(n.id)! * ROW, bottom + GAP);
      y.set(n.id, top);
      bottom = top + (heights[n.id] ?? ROW - GAP);
    }
  }
  return Object.fromEntries(view.map((n) => [n.id, { x: depthOf(n.id) * COL, y: y.get(n.id) ?? 0 }]));
}

export function RimCanvas({ view, output = [], onField, onSelect }: RimCanvasProps) {
  // The cards' measured heights, once React Flow has measured them: the layout stacks by them (layoutRimTab).
  const [heights, setHeights] = useState<Record<string, number>>({});
  const positions = useMemo(() => layoutRimTab(view, heights), [view, heights]);
  // The output card sits one column right of the rightmost node, on the first row.
  const outputAt = useMemo(() => ({ x: Math.max(0, ...Object.values(positions).map((p) => p.x)) + COL, y: 0 }), [positions]);
  const derived = useMemo<Node[]>(() => [
    ...view.map((n) => ({ id: n.id, type: 'rim', position: positions[n.id] ?? { x: 0, y: 0 }, data: { n, onField }, deletable: false, connectable: false })),
    ...(output.length > 0 ? [{ id: OUTPUT, type: 'rimOutput', position: outputAt, data: { lines: output }, deletable: false, connectable: false }] : []),
  ], [view, positions, output, outputAt, onField]);
  // Same trap as the zone editor: React Flow keeps each node's MEASURED size in local state; rebuilding from the
  // view without carrying it drops the size, and wires have no handle positions to draw from.
  const [nodes, setNodes] = useState<Node[]>(derived);
  useEffect(() => {
    // The selection rides along too: a belt width edit redraws the view, and dropping `selected` there deselected the
    // belt - and took its 3D preview away - at the very moment the edit should show on the model.
    setNodes((prev) => derived.map((n) => { const was = prev.find((p) => p.id === n.id); return { ...n, measured: was?.measured, selected: was?.selected }; }));
  }, [derived]);
  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((ns) => applyNodeChanges(changes, ns)), []);
  const onHeights = useCallback((next: Record<string, number>) => setHeights((was) => (JSON.stringify(was) === JSON.stringify(next) ? was : next)), []);
  const edges = useMemo<Edge[]>(() => [
    ...view.flatMap((n) => n.inputs.map(([name, from]) => ({
      id: `${from}->${n.id}.${name}`, source: from, sourceHandle: 'out', target: n.id, targetHandle: name,
      className: n.derived ? 'to-derived' : undefined,
    }))),
    // One wire from the rim line to the output card: the card lists the strips and planes the rim gives too.
    ...(output.length > 0 && view.some((n) => n.id === 'RIM') ? [{ id: `RIM->${OUTPUT}`, source: 'RIM', sourceHandle: 'out', target: OUTPUT, targetHandle: 'in' }] : []),
  ], [view, output]);
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
      onSelectionChange={({ nodes: picked }) => onSelect?.(picked.length === 1 && picked[0]!.id !== OUTPUT ? picked[0]!.id : null)}
      fitView
      fitViewOptions={fit}
      minZoom={0.2}
      proOptions={{ hideAttribution: false }}
    >
      <MeasureWhenReady ids={nodes.map((n) => n.id).join(',')} />
      <ReportHeights ids={nodes.map((n) => n.id).join(',')} onHeights={onHeights} />
      <Background />
      <Controls showInteractive={false} fitViewOptions={fit} />
    </ReactFlow>
  );
}
