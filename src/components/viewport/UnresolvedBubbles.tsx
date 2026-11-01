import { Html } from '@react-three/drei';
import type { GeneratedSupportMesh, UnresolvedPoint } from '@mixo-geocore/host/core/supports/mesh';
import { inverseTransformPoint, type ModelTransform } from '@mixo-geocore/host/state/transform';
import { t, translateMessage } from '../../i18n';
import { Icon } from '../../ui/Icon';
import { LANDING_TIER_TEXT, unresolvedMessage } from '../../supports/unresolved/unresolvedText';

type Landed = NonNullable<GeneratedSupportMesh['modelLanded']>[number];

/**
 * One unresolved point (Round C): a flat circle with a warning sign and a pointed tail whose tip touches the point,
 * the plain-language reason on hover (and to screen readers). Plain DOM, drawn by `UnresolvedBubbles` at the point.
 * With `onResolve` the bubble is a button: a click supports that one point from the model surface.
 */
export function UnresolvedBubble({ point, onResolve }: { point: UnresolvedPoint; onResolve?: (point: UnresolvedPoint) => void }) {
  const text = translateMessage(unresolvedMessage(point, onResolve !== undefined));
  if (onResolve) {
    return <button type="button" className="unresolved-bubble unresolved-bubble--resolvable" data-ui="unresolved-bubble" data-kind={point.kind} data-resolvable="true"
      aria-label={text} title={text} onClick={(event) => { event.stopPropagation(); onResolve(point); }}>
      <Icon name="warning" className="unresolved-bubble-sign" />
    </button>;
  }
  return <div className="unresolved-bubble" data-ui="unresolved-bubble" data-kind={point.kind} role="img" tabIndex={0} aria-label={text} title={text}>
    <Icon name="warning" className="unresolved-bubble-sign" />
  </div>;
}

/** A support the engine landed on the model's own surface: a small mark coloured by its landing tier. */
export function LandingMark({ landed }: { landed: Landed }) {
  const text = t(LANDING_TIER_TEXT[landed.tier]);
  return <div className="landing-mark" data-ui="landing-mark" data-tier={landed.tier} role="img" aria-label={text} title={text} />;
}

/** Click-to-resolve of one unit's bubbles: which points a click can resolve, and what the click does. */
export interface BubbleResolve {
  resolvable: (point: UnresolvedPoint) => boolean;
  onResolve: (point: UnresolvedPoint) => void;
}

/**
 * The unresolved points and the model-landed supports of one built unit, as screen-facing HTML marks that keep their
 * size on screen. The build reports them in its generation frame (`frame`, the unit's stored generation transform);
 * they are drawn in the unit's own space, so they follow the unit like its supports. No mesh is copied. `resolve`
 * (the denture Step 2) turns the resolvable bubbles into buttons.
 */
export function UnresolvedBubbles({ mesh, frame, resolve }: { mesh: GeneratedSupportMesh; frame: ModelTransform; resolve?: BubbleResolve | undefined }) {
  const points = mesh.unresolved ?? [];
  const landed = mesh.modelLanded ?? [];
  if (points.length === 0 && landed.length === 0) return null;
  return <group name="unresolved-points">
    {points.map((point) => <Html key={`u:${point.id}`} position={inverseTransformPoint(frame, point.position)} zIndexRange={[2, 1]} className="unresolved-anchor">
      <UnresolvedBubble point={point} {...(resolve?.resolvable(point) ? { onResolve: resolve.onResolve } : {})} />
    </Html>)}
    {landed.map((entry) => <Html key={`l:${entry.id}`} position={inverseTransformPoint(frame, entry.position)} zIndexRange={[2, 1]} className="landing-anchor">
      <LandingMark landed={entry} />
    </Html>)}
  </group>;
}
