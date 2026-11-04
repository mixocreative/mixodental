import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { tokenCss } from '../../ui/tokenColour';
import { useTokenRevision } from '../../ui/useTokenRevision';

/** How far out from the model's edge the mark stands, as a fraction of the model's own width. */
const OFFSET = 0.0;
/** The arc's radius, as a fraction of the model's width. */
const RADIUS = 0.3;

/**
 * THE PRINT ANGLE, DRAWN IN THE SCENE. Step 1 asks the reader to judge an angle, and an angle is a thing you
 * read off a drawing, not off a number in a panel: a line along the build plate, a line at the angle, the arc
 * between them, and the reading beside it.
 *
 * It stands beside the model rather than through it, so it never hides the shell it is about, and it is drawn
 * flat in the YZ plane - the plane a camera on the X axis looks straight at - and it opens TOWARDS -Z,
 * which is screen-right from that camera (its right vector is world -Z), so the arc turns the same way the
 * model rises. Opening it towards +Z put the angle on the left while the model leaned right (`ViewRequest` kind `side`), which is the
 * view the step opens in. From any other angle it foreshortens, exactly as a real angle does.
 *
 * The reading is DOM, not geometry (`Html` from drei), so it is set in the app's own face at the app's own
 * size and stays sharp at any zoom - a texture of a number would not.
 */
export function PrintAngleArc({ box, deg }: { box: THREE.Box3; deg: number }) {
  useTokenRevision();
  const colour = tokenCss('--angle-mark');

  const { arc, plateLine, tiltLine, labelAt, pivot } = useMemo(() => {
    const size = new THREE.Vector3();
    box.getSize(size);
    const centre = new THREE.Vector3();
    box.getCenter(centre);
    const width = Math.max(size.x, size.z, 1);
    // On the plate, just clear of the model's edge, on the side the camera looks from.
    // On the plate under the model's own footprint, so it is inside whatever the camera framed: a mark set
    // beyond the model's edge falls outside the framing and is never seen. It draws over the shell
    // (`depthTest: false`), which is what an annotation should do.
    const origin = new THREE.Vector3(centre.x, 0, centre.z + width * OFFSET);
    const radius = width * RADIUS;
    const turn = THREE.MathUtils.degToRad(deg);

    // Segment PAIRS, not a strip: `<line>` in JSX is the SVG element, so the arc is drawn with
    // `lineSegments` like the other marks in the scene, and that wants two points per segment.
    const steps = 48;
    const at = (i: number) => {
      const a = (turn * i) / steps;
      return new THREE.Vector3(origin.x, origin.y + Math.sin(a) * radius, origin.z - Math.cos(a) * radius);
    };
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < steps; i += 1) { points.push(at(i), at(i + 1)); }
    const half = turn / 2;
    return {
      pivot: origin,
      arc: new THREE.BufferGeometry().setFromPoints(points),
      // The plate's own line, and the line the model stands at.
      plateLine: new THREE.BufferGeometry().setFromPoints([origin, new THREE.Vector3(origin.x, origin.y, origin.z - radius * 1.25)]),
      tiltLine: new THREE.BufferGeometry().setFromPoints([origin, new THREE.Vector3(origin.x, origin.y + Math.sin(turn) * radius * 1.25, origin.z - Math.cos(turn) * radius * 1.25)]),
      labelAt: new THREE.Vector3(origin.x, origin.y + Math.sin(half) * radius * 1.35, origin.z - Math.cos(half) * radius * 1.35),
    };
  }, [box, deg]);

  return <group raycast={() => undefined} renderOrder={20} name="print-angle">
    <lineSegments geometry={plateLine} raycast={() => undefined}><lineBasicMaterial color={colour} depthTest={false} depthWrite={false} transparent opacity={0.55} /></lineSegments>
    <lineSegments geometry={tiltLine} raycast={() => undefined}><lineBasicMaterial color={colour} depthTest={false} depthWrite={false} transparent opacity={0.55} /></lineSegments>
    <lineSegments geometry={arc} raycast={() => undefined}><lineBasicMaterial color={colour} depthTest={false} depthWrite={false} /></lineSegments>
    <Html position={labelAt.toArray()} center zIndexRange={[5, 0]} pointerEvents="none" prepend>
      <span className="angle-reading" data-ui="scene-print-angle">{deg.toFixed(1)}<span className="angle-reading-deg">°</span></span>
    </Html>
    <mesh position={pivot.toArray()} raycast={() => undefined}>
      <sphereGeometry args={[Math.max(box.getSize(new THREE.Vector3()).x, 1) * 0.008, 10, 10]} />
      <meshBasicMaterial color={colour} depthTest={false} />
    </mesh>
  </group>;
}

/**
 * The mark for one unit: its box is taken from the SCENE, in world space, because the arc stands on the build
 * plate beside the model and not in the model's own turned frame.
 */
export function PrintAngleMark({ unitId, deg }: { unitId: string; deg: number }) {
  const scene = useThree((state) => state.scene);
  const box = useMemo(() => {
    const group = scene.getObjectByName(unitId);
    if (!group) return undefined;
    const found = new THREE.Box3().expandByObject(group);
    return found.isEmpty() ? undefined : found;
  }, [scene, unitId, deg]);
  return box ? <PrintAngleArc box={box} deg={deg} /> : null;
}
