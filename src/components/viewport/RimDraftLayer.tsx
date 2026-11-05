import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { SurfaceAnchor, SurfacePath } from '../../core/surfacePath/path';
import { RIM_ANCHOR_RADIUS_MM, anchorCentre, anchorCentres, chordPositions } from '../../dental/rim/rimDraftGeometry';
import { SEE_THROUGH } from './style';
import { usePreviewColours } from './sceneColours';

/*
 * THE RIM THE OPERATOR IS DRAWING, on the model.
 *
 * Anchors are CONTENT, not UI accent, so they are the same red a selected support is: solid for one that
 * is placed, see-through for the one under the pointer that is not placed yet. The chord between them is
 * the same red as a hairline, so the whole drawing reads as one shape rather than beads on a string.
 *
 * Everything is drawn with `depthTest` off and a high `renderOrder`, so an anchor on the far side of the
 * aligner is still visible. A rim runs all the way round a shell: half of it is always facing away, and
 * a drawing that disappeared as it went round the back would be impossible to judge.
 *
 * Nothing here is pickable (`raycast` returns undefined everywhere). The model underneath is what the
 * pointer talks to - the mode decides what a hit MEANS from the path and the tool, not from which marker
 * the ray happened to touch, so a marker that caught clicks would steal them from the surface.
 */
export function RimDraftLayer({ path, preview, selected }: {
  path: SurfacePath;
  /** The anchor that would be placed if the operator clicked now; absent when the pointer is off the model. */
  preview?: SurfaceAnchor | undefined;
  /** The anchor being moved or picked out, drawn ringed so Delete point has a visible subject. */
  selected?: number | undefined;
}) {
  const colours = usePreviewColours();
  const centres = useMemo(() => anchorCentres(path), [path]);
  const chord = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(chordPositions(path), 3));
    return geometry;
  }, [path]);
  useEffect(() => () => chord.dispose(), [chord]);
  const previewCentre = useMemo(() => (preview ? anchorCentre(preview) : undefined), [preview]);

  if (centres.length === 0 && previewCentre === undefined) return null;
  return <group raycast={() => undefined} renderOrder={18}>
    {centres.length > 1 && <lineSegments geometry={chord} raycast={() => undefined}>
      <lineBasicMaterial color={colours.remove} transparent opacity={0.9} depthTest={false} depthWrite={false} />
    </lineSegments>}
    {centres.map((centre, at) => <mesh key={at} position={centre} raycast={() => undefined}>
      <sphereGeometry args={[RIM_ANCHOR_RADIUS_MM, 12, 8]} />
      <meshBasicMaterial color={colours.remove} transparent opacity={1} depthTest={false} depthWrite={false} />
    </mesh>)}
    {/*
      The selected anchor wears a ring rather than a different colour: colour here already means
      "placed or not", and a third red would make the operator learn a second meaning for one hue.
    */}
    {selected !== undefined && centres[selected] !== undefined
      && <mesh position={centres[selected]} raycast={() => undefined}>
        <sphereGeometry args={[RIM_ANCHOR_RADIUS_MM * 1.7, 14, 10]} />
        <meshBasicMaterial color={colours.remove} transparent opacity={0.3} depthTest={false} depthWrite={false} />
      </mesh>}
    {previewCentre !== undefined && <mesh position={previewCentre} raycast={() => undefined}>
      <sphereGeometry args={[RIM_ANCHOR_RADIUS_MM, 12, 8]} />
      <meshBasicMaterial color={colours.remove} transparent opacity={SEE_THROUGH} depthTest={false} depthWrite={false} />
    </mesh>}
  </group>;
}
