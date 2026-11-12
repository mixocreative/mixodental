import type { TriangleMesh } from '@mixo-geocore/host/core/analysis/types';
import type { SupportJob } from '@mixo-geocore/host/core/jobs';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { ModelTransform } from '@mixo-geocore/host/state/transform';
import { encodeStl, type ExportFilePlan } from '@mixo-geocore/host/supports/export';
import { runSupportJob } from '@mixo-geocore/host/supports/jobRunner';
import type { ExportUnitResult } from '@mixo-geocore/host/workers/meshProtocol';
import { buildDenture, type DentureJob } from './dentureCore';

/*
 * Export of a plate that holds dentures (in the denture worker): every unit whose supports go into a file is built
 * at full resolution, a denture with its own pipeline (`buildDenture`), any other unit with the shared job runner,
 * then the planned files are written as binary STL. What each build said about itself goes back for the shared
 * export gate (`exportRefusal`), as the shared mesh worker reports it.
 */

/** One unit of the export: its plate transform and exactly one build job. */
export interface ExportUnitJob {
  unitId: string;
  transform: ModelTransform;
  denture?: DentureJob;
  generic?: SupportJob;
}

export interface ExportedFiles {
  files: { fileName: string; buffer: ArrayBuffer }[];
  units: ExportUnitResult[];
}

const modelOf = (unit: ExportUnitJob): TriangleMesh => (unit.denture?.mesh ?? unit.generic?.mesh)!;

export function exportFiles(units: readonly ExportUnitJob[], files: readonly ExportFilePlan[], revision: number, onProgress?: (fraction: number) => void): ExportedFiles {
  const needed = units.filter(({ unitId }) => files.some((file) => file.parts.some((part) => part.unitId === unitId && part.content === 'supports')));
  const supports = new Map<string, GeneratedSupportMesh>();
  const results: ExportUnitResult[] = needed.map((unit, k) => {
    const built = unit.denture ? buildDenture({ ...unit.denture, mode: 'export', revision }) : runSupportJob(unit.generic!, undefined, revision);
    supports.set(unit.unitId, built);
    onProgress?.((0.8 * (k + 1)) / needed.length);
    // `triangles` is what engine 64's gate reads to tell "the build produced nothing" from "no
    // result came back" - the two used to be one refusal, and it named a cause that had not
    // happened (GEO-002). Counted from the mesh it actually built, never claimed.
    return { unitId: unit.unitId, revision: built.revision ?? -1, triangles: built.indices.length / 3, verdict: built.verdict?.status ?? 'inconclusive', islands: built.islands?.status === 'inconclusive' ? 'inconclusive' : 'ok' };
  });
  const byId = new Map(units.map((unit) => [unit.unitId, unit]));
  const written = files.flatMap((file) => {
    const parts = file.parts.map((part) => ({
      mesh: part.content === 'model' ? modelOf(byId.get(part.unitId)!) : supports.get(part.unitId)!,
      transform: byId.get(part.unitId)!.transform,
    })).filter((part) => part.mesh && part.mesh.indices.length > 0);
    return parts.length === 0 ? [] : [{ fileName: file.fileName, buffer: encodeStl(parts) }];
  });
  onProgress?.(1);
  return { files: written, units: results };
}
