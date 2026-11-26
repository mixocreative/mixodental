import { describe, expect, it } from 'vitest';
import { DENTURE_PROFILE_FILES } from '@mixo-geocore/host/dental/dentureProfileFiles';
import { discoverTypes } from '../src/dentalTypes/shippedTypes';
import { typeFileText, type TypeFile } from '../src/dentalTypes/typeFile';
import { catalogOf } from './typeCatalog';
import { builtInKnown, builtInProfiles, TYPE_DEPS } from './typeInForce';

const generic = Object.values(DENTURE_PROFILE_FILES)[0] as Record<string, unknown>;
const soft = (badge: string): TypeFile => ({
  typeFile: 1, category: 'denture', id: 'soft', basedOn: String(generic.id), badge,
  profile: { ...generic, id: 'soft', name: { en: 'Soft denture', ja: 'Soft denture', 'zh-Hant': 'Soft denture' } }, rules: {}, zoneGraph: null, validation: null,
});

describe('the type catalog the workbench opens with', () => {
  const builtIns = { denture: builtInProfiles('denture'), aligner: builtInProfiles('aligner') };

  it('lists each built-in, read-only, as a whole type file, and the newest save of each saved type', () => {
    const files = {
      '/types/denture/soft.20261120-090000.type.json': typeFileText(soft('OLD')),
      '/types/denture/soft.20261125-210430.type.json': typeFileText(soft('NEW')),
    };
    const { types, refused } = catalogOf(discoverTypes(files, TYPE_DEPS, builtInKnown()), builtIns);
    expect(refused).toEqual([]);
    expect(types.map((t) => [t.category, t.id, t.builtIn])).toEqual([
      ['aligner', 'reference-aligner', true], ['denture', 'reference-denture', true], ['denture', 'soft', false],
    ]);
    const built = types.find((t) => t.id === 'reference-denture')!;
    // A built-in is a type file too: its own profile, no pinned rules, the standard graphs.
    expect(built.type).toMatchObject({ id: 'reference-denture', rules: {}, zoneGraph: null });
    expect(built.path).toBeNull();
    const saved = types.find((t) => t.id === 'soft')!;
    expect(saved).toMatchObject({ name: 'Soft denture', badge: 'NEW', path: 'types/denture/soft.20261125-210430.type.json', stamp: '20261125-210430' });
    expect(saved.saves.map((s) => s.path)).toEqual(['types/denture/soft.20261125-210430.type.json', 'types/denture/soft.20261120-090000.type.json']);
  });

  it('carries every file that could not load, with its reason and a repo path', () => {
    const { refused } = catalogOf(discoverTypes({ '/types/denture/x.type.json': '{}' }, TYPE_DEPS, builtInKnown()), builtIns);
    expect(refused.map((r) => r.file)).toEqual(['types/denture/x.type.json']);
    expect(refused[0]!.reason).toMatch(/missing key/);
  });
});
