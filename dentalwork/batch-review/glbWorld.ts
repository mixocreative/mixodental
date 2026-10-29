/*
 * Test helper: the world-space triangles of every named mesh in a binary GLB, with the node transforms
 * applied (the frame a glTF viewer draws). Reads the GLB by hand so the check does not depend on the viewer.
 */
export type WorldMesh = { name: string; positions: Float64Array; indices: Uint32Array };

type Gltf = {
  nodes?: Array<{ name?: string; mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }>;
  meshes?: Array<{ name?: string; primitives: Array<{ attributes: { POSITION: number }; indices?: number }> }>;
  accessors: Array<{ bufferView: number; byteOffset?: number; componentType: number; count: number; type: string }>;
  bufferViews: Array<{ byteOffset?: number; byteLength: number; byteStride?: number }>;
  scenes?: Array<{ nodes: number[] }>;
  scene?: number;
};

export function readGlbWorldMeshes(glb: Buffer): WorldMesh[] {
  if (glb.toString('latin1', 0, 4) !== 'glTF') throw new Error('Not a GLB');
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.toString('utf8', 20, 20 + jsonLength)) as Gltf;
  const binStart = 20 + jsonLength + 8;
  const bin = glb.subarray(binStart);
  const readAccessor = (index: number): { data: Float64Array; components: number } => {
    const accessor = json.accessors[index]!;
    const view = json.bufferViews[accessor.bufferView]!;
    const components = accessor.type === 'VEC3' ? 3 : accessor.type === 'SCALAR' ? 1 : 0;
    if (components === 0) throw new Error(`Unsupported accessor type ${accessor.type}`);
    const out = new Float64Array(accessor.count * components);
    const base = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const stride = view.byteStride ?? (accessor.componentType === 5126 || accessor.componentType === 5125 ? 4 : 2) * components;
    for (let i = 0; i < accessor.count; i++) {
      for (let c = 0; c < components; c++) {
        const at = base + i * stride + c * (accessor.componentType === 5123 ? 2 : 4);
        const value = accessor.componentType === 5126 ? bin.readFloatLE(at)
          : accessor.componentType === 5125 ? bin.readUInt32LE(at)
          : accessor.componentType === 5123 ? bin.readUInt16LE(at)
          : Number.NaN;
        if (Number.isNaN(value)) throw new Error(`Unsupported component type ${accessor.componentType}`);
        out[i * components + c] = value;
      }
    }
    return { data: out, components };
  };
  const localMatrix = (node: NonNullable<Gltf['nodes']>[number]): number[] => {
    if (node.matrix) return node.matrix;
    const [tx, ty, tz] = node.translation ?? [0, 0, 0];
    const [qx, qy, qz, qw] = node.rotation ?? [0, 0, 0, 1];
    const [sx, sy, sz] = node.scale ?? [1, 1, 1];
    // Column-major TRS: rotation from the unit quaternion.
    const xx = qx! * qx!, yy = qy! * qy!, zz = qz! * qz!, xy = qx! * qy!, xz = qx! * qz!, yz = qy! * qz!, wx = qw! * qx!, wy = qw! * qy!, wz = qw! * qz!;
    return [
      (1 - 2 * (yy + zz)) * sx!, 2 * (xy + wz) * sx!, 2 * (xz - wy) * sx!, 0,
      2 * (xy - wz) * sy!, (1 - 2 * (xx + zz)) * sy!, 2 * (yz + wx) * sy!, 0,
      2 * (xz + wy) * sz!, 2 * (yz - wx) * sz!, (1 - 2 * (xx + yy)) * sz!, 0,
      tx!, ty!, tz!, 1,
    ];
  };
  const multiply = (a: number[], b: number[]): number[] => {
    const out = new Array<number>(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r]! += a[k * 4 + r]! * b[c * 4 + k]!;
    return out;
  };
  const result: WorldMesh[] = [];
  const visit = (index: number, parent: number[]): void => {
    const node = json.nodes![index]!;
    const world = multiply(parent, localMatrix(node));
    if (node.mesh !== undefined) {
      const mesh = json.meshes![node.mesh]!;
      for (const primitive of mesh.primitives) {
        const { data } = readAccessor(primitive.attributes.POSITION);
        const positions = new Float64Array(data.length);
        for (let i = 0; i < data.length / 3; i++) {
          const x = data[i * 3]!, y = data[i * 3 + 1]!, z = data[i * 3 + 2]!;
          positions.set([
            world[0]! * x + world[4]! * y + world[8]! * z + world[12]!,
            world[1]! * x + world[5]! * y + world[9]! * z + world[13]!,
            world[2]! * x + world[6]! * y + world[10]! * z + world[14]!,
          ], i * 3);
        }
        const indices = primitive.indices === undefined ? Uint32Array.from({ length: positions.length / 3 }, (_, i) => i)
          : Uint32Array.from(readAccessor(primitive.indices).data);
        result.push({ name: node.name ?? mesh.name ?? '', positions, indices });
      }
    }
    for (const child of node.children ?? []) visit(child, world);
  };
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const scene = json.scenes![json.scene ?? 0]!;
  for (const root of scene.nodes) visit(root, identity);
  return result;
}

/** Closest point distance from `p` to triangle abc (Ericson, Real-Time Collision Detection 5.1.5). */
function pointTriangleDistance(p: number[], a: number[], b: number[], c: number[]): number {
  const sub = (u: number[], v: number[]) => [u[0]! - v[0]!, u[1]! - v[1]!, u[2]! - v[2]!];
  const dot = (u: number[], v: number[]) => u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!;
  const ab = sub(b!, a!), ac = sub(c!, a!), ap = sub(p!, a!);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  let q: number[];
  if (d1 <= 0 && d2 <= 0) q = a!;
  else {
    const bp = sub(p!, b!);
    const d3 = dot(ab, bp), d4 = dot(ac, bp);
    const cp = sub(p!, c!);
    const d5 = dot(ab, cp), d6 = dot(ac, cp);
    const vc = d1 * d4 - d3 * d2, vb = d5 * d2 - d1 * d6, va = d3 * d6 - d5 * d4;
    if (d3 >= 0 && d4 <= d3) q = b!;
    else if (d6 >= 0 && d5 <= d6) q = c!;
    else if (vc <= 0 && d1 >= 0 && d3 <= 0) { const t = d1 / (d1 - d3); q = [0, 1, 2].map((k) => a![k]! + t * ab[k]!); }
    else if (vb <= 0 && d2 >= 0 && d6 <= 0) { const t = d2 / (d2 - d6); q = [0, 1, 2].map((k) => a![k]! + t * ac[k]!); }
    else if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const t = (d4 - d3) / (d4 - d3 + d5 - d6); const bc = sub(c!, b!); q = [0, 1, 2].map((k) => b![k]! + t * bc[k]!); }
    else {
      const denom = 1 / (va + vb + vc);
      const v = vb * denom, w = vc * denom;
      q = [0, 1, 2].map((k) => a![k]! + ab[k]! * v + ac[k]! * w);
    }
  }
  const d = sub(p!, q);
  return Math.sqrt(dot(d, d));
}

/**
 * Distance from each point (xyz triples) to the nearest triangle of `surface` (exact point-triangle
 * distance; a uniform grid over triangle bounding boxes, widened until the answer is certain).
 */
export function distancesToSurface(points: Float64Array, surface: WorldMesh[]): number[] {
  const tris: number[][][] = [];
  for (const mesh of surface) for (let t = 0; t < mesh.indices.length; t += 3) {
    const corners = [0, 1, 2].map((k) => { const v = mesh.indices[t + k]!; return [mesh.positions[v * 3]!, mesh.positions[v * 3 + 1]!, mesh.positions[v * 3 + 2]!]; });
    tris.push(corners);
  }
  const cell = 1;
  const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
  const grid = new Map<string, number[]>();
  tris.forEach((corners, index) => {
    const lo = [0, 1, 2].map((a) => Math.floor(Math.min(...corners.map((c) => c[a]!)) / cell));
    const hi = [0, 1, 2].map((a) => Math.floor(Math.max(...corners.map((c) => c[a]!)) / cell));
    for (let x = lo[0]!; x <= hi[0]!; x++) for (let y = lo[1]!; y <= hi[1]!; y++) for (let z = lo[2]!; z <= hi[2]!; z++) {
      const k = key(x, y, z);
      const bucket = grid.get(k);
      if (bucket) bucket.push(index); else grid.set(k, [index]);
    }
  });
  const out: number[] = [];
  for (let i = 0; i < points.length / 3; i++) {
    const p = [points[i * 3]!, points[i * 3 + 1]!, points[i * 3 + 2]!];
    let best = Infinity;
    for (let radius = cell; ; radius *= 2) {
      const seen = new Set<number>();
      const lo = p.map((v) => Math.floor((v - radius) / cell)), hi = p.map((v) => Math.floor((v + radius) / cell));
      for (let x = lo[0]!; x <= hi[0]!; x++) for (let y = lo[1]!; y <= hi[1]!; y++) for (let z = lo[2]!; z <= hi[2]!; z++) {
        for (const t of grid.get(key(x, y, z)) ?? []) {
          if (seen.has(t)) continue;
          seen.add(t);
          const [a, b, c] = tris[t]!;
          best = Math.min(best, pointTriangleDistance(p, a!, b!, c!));
        }
      }
      if (best <= radius) break;
      if (radius > 1e4) throw new Error('No surface found for a point');
    }
    out.push(best);
  }
  return out;
}
