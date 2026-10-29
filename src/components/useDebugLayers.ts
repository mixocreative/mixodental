import { useEffect, useState } from 'react';
import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import { geometryReady } from '@mixo-geocore/host/workers/geometryClient';
import { orientationLayers, type OrientationLayer } from '../dental/orientationEvidence';

/*
 * The Debug section's state: whether it is open (remembered per browser, like the language), which
 * Step 1 evidence layers are checked, and the layers of the loaded model. The layers are computed once
 * per model and profile, from the unit-local mesh; the model's transform is applied by the viewport,
 * so a pose change needs no new engine run.
 */

export const DEBUG_OPEN_KEY = 'mixodental.debugOpen';

/** Collapsed unless the user opened it before. */
export function readDebugOpen(): boolean {
  try {
    return localStorage.getItem(DEBUG_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeDebugOpen(open: boolean): void {
  try {
    localStorage.setItem(DEBUG_OPEN_KEY, open ? '1' : '0');
  } catch { /* storage blocked: the choice lasts this visit */ }
}

/** The engine's layer id: its first word (TRIM, UEND, PLANE, BACK). */
export function layerId(layer: OrientationLayer): string {
  return layer.name.split(' ')[0] ?? layer.name;
}

/** Plain labels by layer id; an unknown id shows the engine's own name. */
export const LAYER_LABELS: Record<string, string> = { TRIM: 'Trim lines', UEND: 'U ends', PLANE: 'Bottom plane', BACK: 'Back arrow' };

export function toggleLayer(visible: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(visible);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

/** The layers whose ids are checked, in the engine's order. */
export function visibleLayers(layers: readonly OrientationLayer[], visible: ReadonlySet<string>): OrientationLayer[] {
  return layers.filter((layer) => visible.has(layerId(layer)));
}

export type DebugLayerStatus = 'idle' | 'busy' | 'ready' | 'failed';

/** Layers per source mesh and profile. A WeakMap, so a removed model frees its layers. */
const computed = new WeakMap<TriangleMesh, Map<string, OrientationLayer[]>>();

export interface DebugLayers {
  open: boolean;
  setOpen: (open: boolean) => void;
  status: DebugLayerStatus;
  /** The loaded model's layers (empty until ready). */
  layers: OrientationLayer[];
  visible: ReadonlySet<string>;
  toggle: (id: string) => void;
}

/**
 * The Debug section's data for the active model. Computes only while the section is open, so a
 * collapsed section costs nothing; `profile` undefined (no dental profile) computes nothing.
 */
export function useDebugLayers(source: TriangleMesh | undefined, profile: string | undefined): DebugLayers {
  const [open, setOpenState] = useState(readDebugOpen);
  const [visible, setVisible] = useState<ReadonlySet<string>>(() => new Set());
  const [result, setResult] = useState<{ source: TriangleMesh | undefined; status: DebugLayerStatus; layers: OrientationLayer[] }>({ source: undefined, status: 'idle', layers: [] });

  useEffect(() => {
    if (!open || !source || !profile) return;
    const cached = computed.get(source)?.get(profile);
    if (cached) {
      setResult({ source, status: cached.length > 0 ? 'ready' : 'failed', layers: cached });
      return;
    }
    let cancelled = false;
    setResult({ source, status: 'busy', layers: [] });
    const timer = setTimeout(() => {
      void geometryReady().then(() => {
        if (cancelled) return;
        let layers: OrientationLayer[];
        try {
          layers = orientationLayers(source, profile);
        } catch {
          layers = [];
        }
        const byProfile = computed.get(source) ?? new Map<string, OrientationLayer[]>();
        byProfile.set(profile, layers);
        computed.set(source, byProfile);
        setResult({ source, status: layers.length > 0 ? 'ready' : 'failed', layers });
      });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, source, profile]);

  const current = result.source === source;
  return {
    open,
    setOpen: (next) => {
      setOpenState(next);
      writeDebugOpen(next);
    },
    status: !open || !profile || !source ? 'idle' : current ? result.status : 'busy',
    layers: current ? result.layers : [],
    visible,
    toggle: (id) => setVisible((before) => toggleLayer(before, id)),
  };
}
