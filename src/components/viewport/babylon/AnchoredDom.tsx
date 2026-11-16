import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import type { DomAnchors } from './domAnchor';

/*
 * React DOM anchored to points in the Babylon scene -- the unresolved bubbles, the landing marks
 * and anything else that is a real element rather than geometry.
 *
 * IT RENDERS THE SAME COMPONENTS THE THREE.JS VIEW RENDERS. `UnresolvedBubble` and `LandingMark`
 * are plain DOM with no renderer in them, so both views mount the identical element with the
 * identical class, `data-ui` name, label and behaviour. That is what makes the UI identical rather
 * than merely similar: there is one bubble, not two that resemble each other.
 *
 * Only the POSITIONING differs. drei's `<Html>` does it inside three's render loop; here each
 * element is registered with `domAnchor`, which projects its point every frame.
 */

export interface AnchoredItem {
  key: string;
  /** Where it sits, in world space. */
  at: () => Vector | undefined;
  node: ReactNode;
  /** Mirrors drei's per-use class (`unresolved-anchor`, `landing-anchor`). */
  className?: string;
}

function Anchored({ item, anchors }: { item: AnchoredItem; anchors: DomAnchors }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return anchors.follow(element, item.at);
  }, [anchors, item.at]);
  return <div ref={ref} className={item.className}>{item.node}</div>;
}

/**
 * Mounts `items` into `host` (the overlay over the canvas) and keeps each on its point. Renders
 * nothing until both the host and the anchors exist, because the scene is built in an effect and
 * the first render happens before it.
 */
export function AnchoredDom({ host, anchors, items }: {
  host: HTMLElement | null;
  anchors: DomAnchors | null;
  items: readonly AnchoredItem[];
}) {
  if (!host || !anchors || items.length === 0) return null;
  return createPortal(
    <>{items.map((item) => <Anchored key={item.key} item={item} anchors={anchors} />)}</>,
    host,
  );
}
