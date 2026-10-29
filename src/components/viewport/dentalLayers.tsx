import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SupportPoint, TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { buildVertexGrid, sameStamp, stampVertices, type VertexGrid } from '@mixo-geocore/host/core/supports/zones';
import type { DentalRim } from '@mixo-geocore/host/dental/dental';
import { legacyBaselineVertices } from '@mixo-geocore/host/dental/legacyArea';
import { dentalContactMask, isManualArea, type DentalAllowStamp, type DentalPolicy } from '@mixo-geocore/host/dental/dentalPolicy';
import type { AreaRisk } from '../../dental/areaRisk';
import { PREVIEW } from './style';
import { faceMaskContourSegments, faceMaskOverlay } from './faceMaskOverlay';
import { SurfaceStampLayer } from './supportLayers';
import { TIP_MARKER_GEOMETRY, TIP_MARKER_MATERIAL } from './warmMaterials';

/* The dental flow's layers on the aligner: the support area and its paint, the detected edges, the rim and the Step 2 tip preview. Display only. */

export function DentalStampLayer({ mesh, geometry, policy, opacity }: { mesh: TriangleMesh; geometry: THREE.BufferGeometry; policy: DentalPolicy; opacity: number }) {
  // The baseline (the footprint the opening sees, from Rust) is computed off the render pass;
  // brush edits stay visible immediately and the generic layer composes them with this mask when it arrives.
  const [baseline, setBaseline] = useState<Uint8Array>();
  useEffect(() => {
    let cancelled = false;
    setBaseline(undefined);
    const timer = setTimeout(() => { if (!cancelled) setBaseline(legacyBaselineVertices(mesh, policy)); }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mesh, policy.rim, isManualArea(policy)]);
  return <SurfaceStampLayer mesh={mesh} geometry={geometry} stamps={policy.stamps} filledKind="allow" color={PREVIEW.areaPermitted} opacity={opacity} baseline={baseline} />;
}

/**
 * Paint of a two-contour area anywhere on the model (Paint adds area outside the detected strip,
 * Erase removes it; last stamp wins). Display only: Rust `dental_policy` decides the faces and tips.
 */
export function DentalPaintLayer({ mesh, geometry, stamps, opacity }: { mesh: TriangleMesh; geometry: THREE.BufferGeometry; stamps: readonly DentalAllowStamp[]; opacity: number }) {
  return <SurfaceStampLayer mesh={mesh} geometry={geometry} stamps={stamps} filledKind="allow" color={PREVIEW.areaPermitted} opacity={opacity} />;
}

/** The exact approved triangles only: shared vertices cannot bleed colour onto tooth faces. */
export function DentalFaceLayer({ mesh, policy, opacity }: { mesh: TriangleMesh; policy: Extract<DentalPolicy, { kind: 'two-contour' }>; opacity: number }) {
  const [layer, setLayer] = useState<{ geometry: THREE.BufferGeometry; colors: THREE.BufferAttribute;
    positions: Float32Array; normals: Float32Array; mask: Uint8Array; grid: VertexGrid | undefined;
    applied: readonly DentalAllowStamp[] }>();
  useEffect(() => {
    const { positions, normals } = faceMaskOverlay(mesh, dentalContactMask(policy, mesh.indices.length / 3));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    const colors = new THREE.BufferAttribute(new Uint8Array(positions.length / 3 * 4).fill(255), 4, true);
    geometry.setAttribute('color', colors);
    setLayer({ geometry, colors, positions, normals, mask: new Uint8Array(positions.length / 3).fill(1),
      grid: buildVertexGrid(positions), applied: [] });
    return () => geometry.dispose();
  }, [mesh, policy.region]);
  useEffect(() => {
    if (!layer) return;
    const stamps = policy.stamps;
    const incremental = layer.applied.length <= stamps.length && layer.applied.every((stamp, at) => {
      const next = stamps[at]!;
      return stamp.kind === next.kind && sameStamp({ ...stamp, kind: 'paint' }, { ...next, kind: 'paint' });
    });
    if (!incremental) layer.mask.fill(1);
    for (let at = incremental ? layer.applied.length : 0; at < stamps.length; at += 1) {
      const stamp = stamps[at]!;
      stampVertices({ ...stamp, kind: stamp.kind === 'allow' ? 'paint' : 'erase' },
        layer.positions, layer.normals, layer.mask, layer.grid);
    }
    layer.applied = stamps;
    const rgba = layer.colors.array as Uint8Array;
    for (let vertex = 0; vertex < layer.mask.length; vertex += 1) rgba[vertex * 4 + 3] = layer.mask[vertex] ? 255 : 0;
    layer.colors.needsUpdate = true;
  }, [layer, policy.stamps]);
  if (!layer) return null;
  return <mesh geometry={layer.geometry} raycast={() => undefined} renderOrder={16}>
    <meshBasicMaterial color={PREVIEW.areaPermitted} vertexColors side={THREE.DoubleSide} transparent opacity={opacity}
      depthWrite={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
  </mesh>;
}

/** Exact mesh edges, not a planar proxy for the non-planar dental trim. */
export function DentalRegionLines({ mesh, policy }: { mesh: TriangleMesh; policy: Extract<DentalPolicy, { kind: 'two-contour' }> }) {
  const lines = useMemo(() => [policy.region.outerEdges, policy.region.openingEdges].map((pairs) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(faceMaskContourSegments(mesh, pairs), 3));
    return geometry;
  }), [mesh, policy.region]);
  useEffect(() => () => lines.forEach((line) => line.dispose()), [lines]);
  return <group raycast={() => undefined} renderOrder={17}>
    <lineSegments geometry={lines[0]} raycast={() => undefined}><lineBasicMaterial color={PREVIEW.ring} depthTest={false} depthWrite={false} /></lineSegments>
    <lineSegments geometry={lines[1]} raycast={() => undefined}><lineBasicMaterial color="#ee1938" depthTest={false} depthWrite={false} /></lineSegments>
  </group>;
}

/**
 * Low points of overhang regions that lie outside the permitted area: a blue disc on each (the
 * region's faces within click reach), drawn like the area layer so it shows through nothing else.
 * Display only: the supports and the export never read it.
 */
export function DentalRiskLayer({ mesh, risks, opacity }: { mesh: TriangleMesh; risks: readonly AreaRisk[]; opacity: number }) {
  const geometry = useMemo(() => {
    const faces = risks.reduce((sum, risk) => sum + risk.faces.length, 0);
    const positions = new Float32Array(faces * 9);
    let at = 0;
    for (const risk of risks) for (const face of risk.faces) for (let k = 0; k < 3; k += 1) {
      const vertex = mesh.indices[face * 3 + k]! * 3;
      positions.set([mesh.positions[vertex]!, mesh.positions[vertex + 1]!, mesh.positions[vertex + 2]!], at);
      at += 3;
    }
    const built = new THREE.BufferGeometry();
    built.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return built;
  }, [mesh, risks]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  if (risks.length === 0) return null;
  return <mesh geometry={geometry} raycast={() => undefined} renderOrder={18} name="area-risks">
    <meshBasicMaterial color={PREVIEW.riskOutside} side={THREE.DoubleSide} transparent opacity={opacity}
      depthWrite={false} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
  </mesh>;
}

/** The proven lower-edge loop, held just above the model so the permitted area has a clear boundary. */
export function DentalRimLine({ rim }: { rim: DentalRim }) {
  const geometry = useMemo(() => {
    const line = new THREE.BufferGeometry();
    line.setAttribute('position', new THREE.BufferAttribute(rim.points.slice(), 3));
    return line;
  }, [rim.points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const offset = useMemo(() => new THREE.Vector3(...rim.openingDirection).multiplyScalar(0.035), [rim.openingDirection]);
  if (rim.boundaryKind !== 'lower-edge-loop') return null;
  return <group position={offset} raycast={() => undefined} renderOrder={17}>
    <lineLoop geometry={geometry} raycast={() => undefined}>
      <lineBasicMaterial color={PREVIEW.areaPermitted} transparent opacity={0.9} depthTest={false} depthWrite={false} />
    </lineLoop>
    <lineLoop geometry={geometry} scale={1.001} raycast={() => undefined}>
      <lineBasicMaterial color={PREVIEW.areaPermitted} transparent opacity={0.22} depthTest={false} depthWrite={false} />
    </lineLoop>
  </group>;
}

/** A tip as the markers need it (the preview's points and Step 2's contacts both fit). */
export type TipMark = Pick<SupportPoint, 'id' | 'position' | 'normal'>;
/** Tips shown selected (solid red), or previewed under Drag over (`ghost`, red to select or grey to unselect). */
export interface TipMarks { solid: ReadonlySet<string>; ghost: readonly string[]; ghostTone: 'remove' | 'ring' }

const MARKER_MATERIALS = {
  remove: new THREE.MeshStandardMaterial({ color: PREVIEW.remove, roughness: 0.65 }),
  ring: new THREE.MeshStandardMaterial({ color: PREVIEW.ring, roughness: 0.65 }),
};

function TipInstances({ points, material, scale }: { points: readonly TipMark[]; material: THREE.Material; scale: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const size = new THREE.Vector3(scale, scale, scale);
    points.forEach((point, index) => {
      position.set(...point.position).addScaledVector(new THREE.Vector3(...point.normal), 0.08);
      mesh.setMatrixAt(index, matrix.compose(position, new THREE.Quaternion(), size));
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points, scale]);
  if (points.length === 0) return null;
  // Shared geometry and material: a new count remounts the mesh but never recompiles its shader.
  return <instancedMesh key={points.length} ref={ref} args={[TIP_MARKER_GEOMETRY, material, points.length]} raycast={() => undefined} frustumCulled={false} dispose={null} />;
}

/** Step 2's actual reviewed contact set, drawn directly without building any support body. */
export function DentalTipMarkers({ points, marks }: { points: readonly TipMark[]; marks?: TipMarks }) {
  const { plain, solid, ghost } = useMemo(() => {
    if (!marks) return { plain: points, solid: [] as TipMark[], ghost: [] as TipMark[] };
    const ghosted = new Set(marks.ghost);
    const out = { plain: [] as TipMark[], solid: [] as TipMark[], ghost: [] as TipMark[] };
    for (const point of points) (marks.solid.has(point.id) ? out.solid : ghosted.has(point.id) ? out.ghost : out.plain).push(point);
    return out;
  }, [points, marks]);
  return <>
    <TipInstances points={plain} material={TIP_MARKER_MATERIAL} scale={0.42} />
    <TipInstances points={solid} material={MARKER_MATERIALS.remove} scale={0.6} />
    <TipInstances points={ghost} material={MARKER_MATERIALS[marks?.ghostTone ?? 'remove']} scale={0.6} />
  </>;
}

