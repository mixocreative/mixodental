import { useMemo } from 'react';
import { tokenCss } from '../../ui/tokenColour';
import { useTokenRevision } from '../../ui/useTokenRevision';

/*
 * Every colour of the 3D viewport, read from the CSS tokens in src/styles.css (documented in docs/ui-styling.md).
 * Nothing here is a colour value: each entry names a token. `useViewportColours` re-reads them whenever a token
 * changes (src/ui/tokenColour.ts), so editing a token recolours the open scene.
 */

const PREVIEW_TOKENS = {
  add: '--mark-add', remove: '--mark-remove', ring: '--mark-ring', zone: '--mark-zone', dental: '--mark-dental',
  areaPermitted: '--mark-area-permitted', areaEdge: '--mark-area-edge', riskOutside: '--mark-risk-outside', island: '--mark-island',
  overhang: '--mark-overhang', outside: '--mark-outside', plate: '--scene-plate',
} as const;
const SCENE_TOKENS = { background: '--scene-bg', lightSky: '--scene-light-sky', lightGround: '--scene-light-ground', gridCell: '--scene-grid-cell', gridSection: '--scene-grid-section' } as const;
const MODEL_TOKENS = { idle: '--model-idle', selected: '--model-selected', active: '--model-active', activeGlow: '--model-active-glow', glowOff: '--model-glow-off', vertexBase: '--model-vertex-base' } as const;
const SUPPORT_TOKENS = { idle: '--support-idle', selectedObject: '--support-selected-object', picked: '--support-picked' } as const;

type Read<T extends Record<string, string>> = { readonly [K in keyof T]: string };
function read<T extends Record<string, string>>(tokens: T): Read<T> {
  return Object.fromEntries(Object.entries(tokens).map(([key, token]) => [key, tokenCss(token)])) as Read<T>;
}

/** The edit-preview and check-marker colours (the former `PREVIEW`), and the tone names a ghost can take (`add`, `remove`, `ring`...). */
export type PreviewColours = Read<typeof PREVIEW_TOKENS>;
export interface ViewportColours {
  readonly preview: PreviewColours;
  readonly scene: Read<typeof SCENE_TOKENS>;
  readonly model: Read<typeof MODEL_TOKENS>;
  readonly support: Read<typeof SUPPORT_TOKENS>;
}

/** The viewport colours as the tokens hold them right now. */
export function viewportColours(): ViewportColours {
  return { preview: read(PREVIEW_TOKENS), scene: read(SCENE_TOKENS), model: read(MODEL_TOKENS), support: read(SUPPORT_TOKENS) };
}

/** The viewport colours; the component re-renders when a token changes. */
export function useViewportColours(): ViewportColours {
  const revision = useTokenRevision();
  return useMemo(viewportColours, [revision]);
}

/** Just the edit-preview colours, for components that draw only marks. */
export function usePreviewColours(): PreviewColours {
  return useViewportColours().preview;
}
