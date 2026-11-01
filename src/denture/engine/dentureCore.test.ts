import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { GeneratedSupportMesh } from '@mixo-geocore/host/core/supports/mesh';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { defaultDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { transformedMinY } from '@mixo-geocore/host/state/transform';
import { nodeEngine, parseStl } from '../../../scripts/node-engine';
import { dentureSupportSettings } from '../settings/dentureSupportSettings';
import { buildDenture, checkModelLanding, liftedFrame, orientAndScan, placeDenture, scanSettingsOf, withUnitIds, type DentureJob } from './dentureCore';

describe('withUnitIds', () => {
  it('renames the policy ids a build reports to the unit ids, keeping others', () => {
    const mesh = { positions: new Float32Array(), indices: new Uint32Array(), parts: [], components: [{ part: 'pillar', contactId: 'denture-min-0', start: 0, count: 0 }, { part: 'raft', start: 0, count: 0 }],
      dropped: ['denture-min-0', 'manual-1'], droppedByZones: ['denture-min-0'], leftOut: [{ id: 'denture-min-0', position: [0, 0, 0], reason: 'x' }] } as GeneratedSupportMesh;
    const out = withUnitIds(mesh, new Map([['denture-min-0', 'p1']]));
    expect(out.dropped).toEqual(['p1', 'manual-1']);
    expect(out.droppedByZones).toEqual(['p1']);
    expect(out.leftOut?.[0]?.id).toBe('p1');
    expect(out.components.map((component) => component.contactId)).toEqual(['p1', undefined]);
  });
});

/*
 * The smallest local denture scan (dentalwork/fixtures/case-denture, git-ignored customer data), read in place.
 * Local only: skipped when absent, so CI never needs it.
 */
const DIR = resolve('dentalwork/fixtures/case-denture');
const SMALLEST = existsSync(DIR) ? readdirSync(DIR).filter((name) => name.toLowerCase().endsWith('.stl') && !name.includes('-sup')).map((name) => join(DIR, name)).sort((a, b) => statSync(a).size - statSync(b).size)[0] : undefined;

describe.skipIf(!SMALLEST)('denture pipeline (local real scan)', () => {
  it('orients, places, builds with hand work and checks a model landing', () => {
    const bytes = readFileSync(SMALLEST!);
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    nodeEngine.center_positions_in_place(mesh.positions);
    const settings = dentureSupportSettings('reference-denture');
    const { orientation, scan } = orientAndScan(mesh, 'reference-denture', scanSettingsOf(settings, undefined));
    expect(orientation.kind).toBe('oriented');
    if (scan.kind !== 'scan') throw new Error('scan failed');
    const frame = liftedFrame(mesh, scan.rows[0]!.rotation as Vector, settings.liftHeight, [5, -5]);
    expect(transformedMinY(mesh.positions, frame)).toBeCloseTo(settings.liftHeight, 3);
    const job: DentureJob = { mesh, policy: defaultDenturePolicy('reference-denture', settings.trussEnabled), frame, plateY: 0, settings, rules: {},
      hand: { manual: [], deleted: [], zones: [], contactSettings: {} }, labelText: 'D', mode: 'preview' };
    const { points, parts } = placeDenture(job);
    expect(points.length).toBeGreaterThan(20);
    expect(parts.parts.some((part) => part.role === 'target')).toBe(true);
    const built = buildDenture(job);
    expect(built.indices.length).toBeGreaterThan(0);
    const ids = new Set(points.map((point) => point.id));
    // Every contact the build names is a unit (position) id, never a policy id.
    for (const component of built.components) if (component.contactId) expect(ids.has(component.contactId)).toBe(true);
    // A deleted tip is gone from the next build.
    const gone = points.find((point) => built.components.some((component) => component.contactId === point.id))!.id;
    const without = buildDenture({ ...job, hand: { ...job.hand, deleted: [gone] } });
    expect(without.components.some((component) => component.contactId === gone)).toBe(false);
    // At upright the scan's left-out tip (a policy id) lands on the model once it is on the allow list.
    const point = built.unresolved?.find((entry) => entry.kind !== 'island');
    if (point) {
      const check = checkModelLanding(job, point.position as Vector, point.normal as Vector);
      expect('pieces' in check || 'refusal' in check).toBe(true);
      const allowed = buildDenture({ ...job, policy: { ...job.policy, modelLandingAllow: [point.id] } });
      expect(allowed.modelLanded?.some((entry) => entry.id === point.id)).toBe(true);
    }
  });
});
