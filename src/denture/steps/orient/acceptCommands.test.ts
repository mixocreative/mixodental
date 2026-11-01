import { describe, expect, it } from 'vitest';
import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { emptyScene, reduceScene, type PrintUnit } from '../../../state/project';
import { generationTransform } from '@mixo-geocore/host/supports/unitSupports';
import { acceptCommands } from './acceptCommands';

const unit: PrintUnit = { id: 'u', name: 'denture', source: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) },
  transform: { position: [0, 0, 0], rotation: [0, 0, 0] }, settings: {}, manual: [], deleted: [], zones: [], contactSettings: {} };

describe('acceptCommands', () => {
  it('stores the pose, its tips, the settings and the denture policy in one batch', () => {
    const frame = { position: [3, 4, 5] as [number, number, number], rotation: [0.1, 0, 0] as [number, number, number] };
    const points = [{ id: 'p1', regionId: -1, position: [0, 1, 0] as [number, number, number], normal: [0, -1, 0] as [number, number, number], source: 'interior' as const }];
    const settings = { ...defaultSupportSettings, liftHeight: 3.5 } as LiveSupportSettings;
    const scene = reduceScene({ ...emptyScene, units: [unit] }, { type: 'batch', commands: acceptCommands(unit, { frame, points, settings, denture: { policy: { kind: 'denture', profileId: 'reference-denture', lattice: true } } }) });
    const after = scene.units[0]!;
    expect(after.transform).toEqual(frame);
    expect(generationTransform(after)).toEqual(frame);
    expect(after.placement?.points.map((point) => point.id)).toEqual(['p1']);
    expect(after.denture?.policy.profileId).toBe('reference-denture');
    expect((after.settings as { liftHeight?: number }).liftHeight).toBe(3.5);
  });
});
