// Copyright (c) Mixo Creative.

import { describe, expect, it } from 'vitest';
import { exportBatches } from './exportBatches';
import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';

/**
 * THE SPLIT THAT KEEPS AN EXPORT'S PEAK TO ONE FILE.
 *
 * Small, and tested anyway: it decides which units are built for which file, and getting that wrong
 * is not a crash. Too many jobs in a batch and the peak this exists to bound comes back; too few and
 * `exportFiles` is asked to write a file whose parts name a unit it was never given, which is an
 * empty or short STL in the operator's downloads with nothing on screen about it.
 */

const plan = (fileName: string, unitIds: readonly string[]): ExportFilePlan =>
  ({ fileName, parts: unitIds.map((unitId) => ({ unitId, content: 'model' })) } as unknown as ExportFilePlan);

const job = (unitId: string) => ({ unitId });

describe('the export, one file at a time', () => {
  it('gives each file only the units it names', () => {
    const batches = exportBatches([plan('a.stl', ['a']), plan('b.stl', ['b'])], [job('a'), job('b')]);

    expect(batches.map((batch) => batch.file.fileName)).toEqual(['a.stl', 'b.stl']);
    expect(batches.map((batch) => batch.jobs.map((entry) => entry.unitId))).toEqual([['a'], ['b']]);
  });

  it('keeps a file that needs two units together, because one file is one build job', () => {
    // A model-and-supports file names its unit twice; a combined file names several.
    const batches = exportBatches([plan('pair.stl', ['a', 'b', 'a'])], [job('a'), job('b')]);

    expect(batches).toHaveLength(1);
    expect(batches[0]!.jobs.map((entry) => entry.unitId)).toEqual(['a', 'b']);
  });

  it('keeps the plan order, which is the order the operator sees files arrive in', () => {
    const batches = exportBatches([plan('z.stl', ['b']), plan('a.stl', ['a'])], [job('a'), job('b')]);

    expect(batches.map((batch) => batch.file.fileName)).toEqual(['z.stl', 'a.stl']);
  });

  it('drops a file no job can build, rather than asking for an empty one', () => {
    // The unit left the scene, or its supports were all deleted. `planExport` already drops most of
    // these; sending the rest anyway would turn a planning gap into a short file on disk.
    const batches = exportBatches([plan('gone.stl', ['ghost']), plan('a.stl', ['a'])], [job('a')]);

    expect(batches.map((batch) => batch.file.fileName)).toEqual(['a.stl']);
  });
});
