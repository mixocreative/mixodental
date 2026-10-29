import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import DebugSection from './DebugSection';
import { layerId, toggleLayer, visibleLayers } from './useDebugLayers';
import { debugMeshes } from './viewport/DebugLayerMeshes';
import type { OrientationLayer } from '../dental/orientationEvidence';

const layers: OrientationLayer[] = [
  { name: 'TRIM detected trim chains', color: 0xd62828, positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) },
  { name: 'UEND trim U ends', color: 0x1fd36a, positions: new Float32Array([0, 0, 0, 0, 0, 1, 0, 1, 0]), indices: new Uint32Array() },
];

describe('Debug section', () => {
  it('starts collapsed and lists the layers with their checkboxes', () => {
    const html = renderToStaticMarkup(<DebugSection open={false} onOpenChange={() => {}} status="ready" layers={layers} visible={new Set()} onToggle={() => {}} />);
    expect(html).toContain('<details');
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html).toContain('>Debug<');
    const open = renderToStaticMarkup(<DebugSection open status="ready" onOpenChange={() => {}} layers={layers} visible={new Set()} onToggle={() => {}} />);
    expect(open).toMatch(/<details[^>]*\sopen/);
    expect(open.match(/type="checkbox"/g)).toHaveLength(2);
    expect(open).toContain('background:#d62828');
  });

  it('toggling a layer adds its mesh to the scene and removing it takes the mesh away', () => {
    expect(layerId(layers[0]!)).toBe('TRIM');
    const scene = new THREE.Group();
    let visible: ReadonlySet<string> = new Set();
    const sync = () => {
      scene.clear();
      scene.add(...debugMeshes(visibleLayers(layers, visible)));
    };
    sync();
    expect(scene.children).toHaveLength(0);
    visible = toggleLayer(visible, 'TRIM');
    sync();
    expect(scene.children.map((child) => child.name)).toEqual(['TRIM detected trim chains']);
    expect((scene.children[0] as THREE.Mesh).material).toBeInstanceOf(THREE.MeshBasicMaterial);
    visible = toggleLayer(visible, 'TRIM');
    sync();
    expect(scene.children).toHaveLength(0);
  });
});
