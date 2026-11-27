import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Vector } from '@mixo-geocore/host/core/vec3';
import { defaultDenturePolicy } from '@mixo-geocore/host/dental/denturePolicy';
import { runCheckJob } from '@mixo-geocore/host/supports/jobRunner';
import { inverseTransformPoint } from '@mixo-geocore/host/state/transform';
import { nodeEngine, parseStl } from '../../../scripts/node-engine';
import { sampleByContent } from '../../../scripts/samples.mjs';
import { DENTURE_RULE_SPOTS } from '../../../scripts/samplePins.mjs';
import { buildDenture, liftedFrame, orientAndScan, placeDenture, scanSettingsOf, type DentureJob } from '../engine/dentureCore';
import { dentureSupportSettings } from '../settings/dentureSupportSettings';
import { overhangRuleOf } from '../settings/dentureRules';
import { splitByRule } from './acceptedSpots';
import { ruleReasons } from './ruleSpots';

/*
 * P7b item 3 on the real denture scan #1 (pinned by content, read in place, local only): the shared
 * overhang check lists 6 spots (5 before dentures moved to 60 degrees) the denture build never reports; the denture rules explain every one of them, so the
 * check agrees with the build report (nothing unresolved, no real problem left). The 6 belongs to THIS scan,
 * which is why it is pinned rather than "the second file in the folder" - that file changes as samples grow.
 */
const SCAN = sampleByContent(DENTURE_RULE_SPOTS);

describe.skipIf(!SCAN)('the check follows the denture rules (real denture scan #1)', () => {
  it('every spot the shared check lists beyond the build report is accepted by rule', () => {
    const bytes = readFileSync(SCAN!);
    const mesh = parseStl(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    nodeEngine.center_positions_in_place(mesh.positions);
    const settings = dentureSupportSettings('reference-denture');
    const { scan } = orientAndScan(mesh, 'reference-denture', scanSettingsOf(settings, undefined));
    if (scan.kind !== 'scan') throw new Error('scan failed');
    const frame = liftedFrame(mesh, scan.rows[scan.order[0]!]!.rotation as Vector, settings.liftHeight, [0, 0]);
    // The unit's Overhang angle rides in the rules, as in the app (dentureRulesOf): the build and the check must judge
    // overhangs at the same angle, or the check lists every face between the two as a miss.
    const job: DentureJob = { mesh, policy: defaultDenturePolicy('reference-denture', settings.trussEnabled), frame, plateY: 0, settings, rules: overhangRuleOf(settings),
      hand: { manual: [], deleted: [], zones: [], contactSettings: {} }, labelText: 'D', mode: 'preview' };
    const built = buildDenture(job);
    // The build report: no unresolved point, no island the build could not carry.
    expect(built.unresolved?.length ?? 0).toBe(0);
    const orientation = { position: [0, 0, 0] as Vector, rotation: [...frame.rotation] as Vector };
    const kept = placeDenture(job).points.filter((point) => !built.dropped.includes(point.id));
    const found = runCheckJob({ mesh, orientation, contacts: kept.map((point) => [...point.position] as Vector), settings: { overhangAngleDegrees: settings.scatterAngle, spacing: settings.scatterSpacing } });
    // What the app does with them: back to unit-local, asked of the denture rules.
    const spots = found.map((problem) => ({ ...problem, position: inverseTransformPoint(orientation, problem.position) }));
    expect(spots.length).toBe(6); // 6 at the denture Overhang angle 60 (5 at the shared 45 it had until 2026-11-27)
    const { real, accepted } = splitByRule(spots, ruleReasons(mesh, 'reference-denture', spots.map((spot) => spot.position)));
    expect(real).toEqual([]);
    expect(accepted.reduce((sum, group) => sum + group.points.length, 0)).toBe(6);
    // Each accepted spot is on a face the rules do name; nothing falls outside the three reasons.
    expect(accepted.every((group) => ['outside-allowed', 'no-support', 'rim'].includes(group.reason))).toBe(true);
  }, 300_000);
});
