import { useEffect, useState } from 'react';
import type { PrintUnit } from '../state/project';
import { displayMesh } from '../state/meshExtras';
import { drawThumbnail } from '../components/viewport/drawThumbnail';
import { onRigReset } from '../components/viewport/deckRig';
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

  /*
   * EVERY PICTURE THIS RIG DREW IS SUSPECT ONCE ITS CONTEXT IS GONE. `toDataURL` on a dead canvas
   * returns a blank PNG, which this cache cannot tell from a real one and would keep for the life
   * of the page - so a laptop waking from sleep showed a deck of empty frames, with no message and
   * no way to redraw them. Dropping the cache makes `nextThumbnailToDraw` hand every unit back.
   */
  useEffect(() => onRigReset(() => setCache(new Map())), []);

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
      /*
        * A THROW IS AN ANSWER TOO, and without this it was an endless loop. `drawThumbnail` can
        * throw - `toGeometry` on a malformed mesh, `toDataURL` on a tainted or dead canvas - and
        * the cache is written on the NEXT line, so nothing was recorded and `nextThumbnailToDraw`
        * handed the same unit straight back, for ever, on every pass. `thumbnail.ts` claims this
        * loop is closed; it was closed on the `undefined` RETURN path only.
        *
        * The entry is recorded with no `url`, which is exactly what that field is optional for:
        * the card was DRAWN, there is no picture, and nobody asks again.
        */
      let url: string | undefined;
      try {
        url = drawThumbnail(displayMesh(unit.source), unit.transform);
      } catch {
        url = undefined;
      }
      // Recorded EVEN WITH NO PICTURE: see `Thumbnail`. An unrecorded row would come back on the
      // next pass for ever.
      // The ROTATION it was drawn at goes in beside the mesh: the batch turns a row after the deck
      // has drawn it, and without this the picture would never follow (`thumbnail.ts`).
      setCache((current) => new Map(current).set(unit.id, { mesh: unit.source, rotation: unit.transform.rotation, ...(url ? { url } : {}) }));
    }, 0);
    return () => window.clearTimeout(handle);
  }, [units, cache, enabled]);

  return cache;
}
