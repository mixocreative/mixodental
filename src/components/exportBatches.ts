// Copyright (c) Mixo Creative.

import type { ExportFilePlan } from '@mixo-geocore/host/supports/export';

/**
 * ONE FILE'S WORTH OF WORK AT A TIME - the rule, as a plain function, so it can be checked without
 * a worker.
 *
 * WHY THE EXPORT WAS SPLIT UP. `exportFiles` took the whole case in one call: every unit's supports
 * built at full resolution, every STL encoded, and every buffer held at once until the last one was
 * done. On a thirty-model case that peak is of the order of a gigabyte of ArrayBuffers in one tab -
 * and V8's own string and buffer limits are not the operator's problem, the dead tab is. An export
 * is also the LAST thing anyone does with a case, so the memory is at its highest exactly when the
 * failure costs the most work.
 *
 * Each batch is independent: its supports are built, its bytes are handed over, and the buffer is
 * released before the next batch asks for anything. The peak becomes one file.
 *
 * WHAT THIS DOES NOT CHANGE, deliberately: the SINK. Each file still goes to the browser as a
 * download, in the same order, with the same number of hand-overs - so the partial-export report
 * (`exportPartialText`, walk `r1`) and everything the audit established about committing more than
 * once still hold exactly as written.
 *
 * DEBT NOT TAKEN, with its reason: a folder chosen once through `showDirectoryPicker` would be
 * better still - it fixes Chrome's refusal of several automatic downloads from one gesture, which
 * the operator meets unbidden on a case of thirty. It is not taken here because the picker opens a
 * NATIVE dialog that no automation can answer, and the walk drives this very button; a gate that
 * hangs for ten minutes is a worse defect than the one being fixed. It wants its own increment with
 * a way for the walk to opt out that is not a lie about what shipped.
 */

/** One file, with the units it needs built. `unitId`s are those its parts name, in first-appearance order. */
export interface ExportBatch<J extends { unitId: string }> {
  readonly file: ExportFilePlan;
  readonly jobs: readonly J[];
}

/**
 * The export, one file at a time, each with only the jobs that file needs.
 *
 * A FILE WITH NO JOB IS DROPPED rather than sent, and that matters: `exportFiles` would be asked to
 * write a file whose parts name units nobody built, and the honest answer to that is upstream in
 * `planExport` - which already drops a unit whose supports were all deleted. Sending it anyway would
 * turn a planning gap into an empty file in the operator's downloads.
 */
export function exportBatches<J extends { unitId: string }>(
  files: readonly ExportFilePlan[], jobs: readonly J[],
): ExportBatch<J>[] {
  const batches: ExportBatch<J>[] = [];
  for (const file of files) {
    const wanted = new Set(file.parts.map((part) => part.unitId));
    const mine = jobs.filter((job) => wanted.has(job.unitId));
    if (mine.length > 0) batches.push({ file, jobs: mine });
  }
  return batches;
}
