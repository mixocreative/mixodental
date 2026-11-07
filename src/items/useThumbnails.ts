import { useEffect, useState } from 'react';
import type { PrintUnit } from '../state/project';
import { displayMesh } from '../state/meshExtras';
import { drawThumbnail } from '../components/viewport/drawThumbnail';
import { nextThumbnailToDraw, prunedThumbnails, type ThumbCache } from './thumbnail';

/**
 * THE ROW PICTURES, drawn one at a time and kept until the model changes.
 *
 * ONE PER TASK, not a loop over the drop. Uploading and drawing a large mesh is tens of
 * milliseconds; doing a whole drop in one go would hold the main thread through all of it and the
 * deck would appear frozen at the moment it opens. A row at a time lets the list paint, so the
 * pictures arrive visibly one after another, which is also an honest progress indicator.
 *
 * `enabled` is the deck being on screen. There is no point drawing pictures for a list nobody is
 * looking at, and it keeps the cost off the dental flow, which never shows a row.
 */
export function useThumbnails(units: readonly PrintUnit[], enabled: boolean): ThumbCache {
  const [cache, setCache] = useState<ThumbCache>(() => new Map());

  // A closed model keeps no bitmap. `prunedThumbnails` returns the SAME map when nothing was closed,
  // so this cannot be a render loop of its own.
  useEffect(() => setCache((current) => prunedThumbnails(current, units)), [units]);

  useEffect(() => {
    if (!enabled) return;
    const unit = nextThumbnailToDraw(units, cache);
    if (!unit) return;
    const handle = window.setTimeout(() => {
      /*
       * THE DISPLAY MESH, not `unit.source`. The import worker prepares a simplified copy for heavy
       * meshes and the viewport draws that one (`state/meshExtras.ts`); this passed the full
       * import mesh while its own documentation claimed otherwise, so a 12 MB model was uploaded
       * whole to be photographed at 160 px. `displayMesh` falls back to the source when there is no
       * simplified copy, so a small model is unaffected.
       *
       * The cache is still keyed on `unit.source`: that is the identity of the unit's model, and the
       * simplified copy is derived from it.
       */
      const url = drawThumbnail(displayMesh(unit.source), unit.transform);
      // Recorded EVEN WITH NO PICTURE: see `Thumbnail`. An unrecorded row would come back on the
      // next pass for ever.
      setCache((current) => new Map(current).set(unit.id, { mesh: unit.source, ...(url ? { url } : {}) }));
    }, 0);
    return () => window.clearTimeout(handle);
  }, [units, cache, enabled]);

  return cache;
}
