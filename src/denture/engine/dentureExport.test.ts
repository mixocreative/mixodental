import { describe, expect, it } from 'vitest';
import { defaultSupportSettings, type LiveSupportSettings } from '@mixo-geocore/host/core/supports/settings';
import { exportFiles } from './dentureExport';

describe('dentureExport', () => {
  it('writes the model part of a unit without building supports', () => {
    const mesh = { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) };
    const out = exportFiles([{ unitId: 'u', transform: { position: [0, 0, 0], rotation: [0, 0, 0] },
      generic: { mesh, frame: null, settings: defaultSupportSettings as LiveSupportSettings, contacts: { points: [], manual: [], deleted: [], zones: [], contactSettings: {} }, labelText: 'A', mode: 'export' } }],
    [{ fileName: 'u.stl', parts: [{ unitId: 'u', content: 'model' }] }], 3);
    expect(out.units).toEqual([]);
    expect(out.files.map((file) => [file.fileName, file.buffer.byteLength])).toEqual([['u.stl', 84 + 50]]);
  });
});
