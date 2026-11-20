import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { RULE_NAMES } from '@mixo-geocore/host/supports/generateRules';
import { BENCH_RULES, parseSets, readBy, unreadBy } from './rules.mjs';
import { RULE_DEFAULTS } from '../dentalwork/batch-review/ruleDefaults';

/*
 * BENCHWORK'S SHORTLIST AND ITS REFUSALS.
 *
 * Two things can rot silently here and both have precedent on this project:
 *
 *  - A RULE IS RENAMED IN THE ENGINE. Then benchwork passes a name `packRules` does not know, the
 *    engine keeps its default, and the run LOOKS like an answer while having tested nothing. That is
 *    the worst outcome this tool has available, which is why the name check is a test and not a
 *    comment: engine 56 -> 57 renamed two rules, and that is why `profileSelect.ts` still carries
 *    `LEGACY_RULE_NAMES`.
 *  - THE PROVENANCE CLAIM GOES STALE. The shortlist is not a judgement made here; it is the set this
 *    project already treats as worth turning, lifted from the `MIXO_*` switches in
 *    `profileSelect.ts`. The last test holds that sentence true, so the claim in the header cannot
 *    quietly become false.
 */
describe('benchwork offers rules the engine actually reads', () => {
  it('every name is one the engine knows', () => {
    expect(BENCH_RULES.map((rule) => rule.name).filter((name) => !RULE_NAMES.includes(name))).toEqual([]);
  });

  it('names no rule twice', () => {
    const names = BENCH_RULES.map((rule) => rule.name);
    expect(names.length).toBe(new Set(names).size);
  });

  it('stays a shortlist, because a form over 130 knobs is not "few settings"', () => {
    expect(BENCH_RULES.length).toBeLessThanOrEqual(20);
    expect(RULE_NAMES.length).toBeGreaterThan(100);
  });

  it('says what each rule does, in words an operator could read', () => {
    for (const rule of BENCH_RULES) {
      expect(rule.says.length, rule.name).toBeGreaterThan(30);
      expect(['deg', 'mm', 'mm2', 'flag', 'mode'], rule.name).toContain(rule.type);
    }
  });

  it('covers the two defaults the review already quotes, so the words cannot disagree', () => {
    for (const name of Object.keys(RULE_DEFAULTS)) expect(BENCH_RULES.some((rule) => rule.name === name), name).toBe(true);
  });

  it('every switch it claims to come from still exists in profileSelect.ts', () => {
    const source = readFileSync(join(__dirname, '..', 'dentalwork', 'batch-review', 'profileSelect.ts'), 'utf8');
    const claimed = BENCH_RULES.map((rule) => rule.was).filter((was): was is string => was !== null);
    expect(claimed.length).toBeGreaterThan(5);
    for (const env of claimed) expect(source, env).toContain(env);
  });
});

/*
 * REFUSALS, because the whole point of validating is that a typo must not cost minutes of engine time
 * and then quietly return the DEFAULT result. Each case below is a run that must not start.
 */
describe('benchwork refuses before it spends a run', () => {
  // The engine gate is NARROWER than the type for R1b: `supports/island_rules.rs` reads anything
  // outside the open range 45..90 as OFF. Without this, `--set noSupportSteepDeg=30` passed the 0-90
  // check every angle uses, spent minutes of engine time and tested nothing - a run that comes back
  // looking like an answer with the rule never switched on.
  it('refuses a value the engine would silently read as off', () => {
    const bad = parseSets(['noSupportSteepDeg=30']);
    expect(bad.problems.join(' ')).toMatch(/would test nothing/);
    expect(parseSets(['noSupportSteepDeg=90']).problems).toHaveLength(1);
    expect(parseSets(['noSupportSteepDeg=45']).problems).toHaveLength(1);
    // And it must still take the values the engine DOES read, or the guard is just a wall.
    expect(parseSets(['noSupportSteepDeg=67.5']).problems).toHaveLength(0);
    expect(parseSets(['noSupportSteepDeg=67.5']).rules.noSupportSteepDeg).toBe(67.5);
    // A rule with no declared range is untouched by this.
    expect(parseSets(['overhangAngleDeg=30']).problems).toHaveLength(0);
  });

  it('takes good values, with a flag becoming a boolean and a number a number', () => {
    const { rules, problems } = parseSets(['overhangAngleDeg=50', 'socketNoSupport=1', 'rimRespectsNoSupport=0']);
    expect(problems).toEqual([]);
    expect(rules).toEqual({ overhangAngleDeg: 50, socketNoSupport: true, rimRespectsNoSupport: false });
  });

  it('refuses a name the engine would ignore', () => {
    const { rules, problems } = parseSets(['nosuchRule=5']);
    expect(rules).toEqual({});
    expect(problems[0]).toContain('not a rule the Jig offers');
  });

  it('refuses a flag that is not 1 or 0, rather than guessing', () => {
    expect(parseSets(['socketNoSupport=yes']).problems[0]).toContain('a flag takes 1 or 0');
    expect(parseSets(['socketNoSupport=true']).problems[0]).toContain('a flag takes 1 or 0');
  });

  /* An angle here is a slope from horizontal (engine 57), so 0-90 is the whole range. */
  it('refuses an angle outside 0-90', () => {
    expect(parseSets(['overhangAngleDeg=200']).problems[0]).toContain('0-90');
    expect(parseSets(['overhangAngleDeg=-5']).problems[0]).toContain('0-90');
    expect(parseSets(['overhangAngleDeg=90']).problems).toEqual([]);
  });

  it('refuses a negative length and a fractional mode', () => {
    expect(parseSets(['overhangMaxReachMm=-1']).problems[0]).toContain('cannot be negative');
    expect(parseSets(['lowOutsideAllowed=1.5']).problems[0]).toContain('whole number');
  });

  it('refuses a pair that is not name=value, including an empty value', () => {
    expect(parseSets(['overhangAngleDeg']).problems[0]).toContain('expected name=value');
    expect(parseSets(['=50']).problems[0]).toContain('expected name=value');
    expect(parseSets(['overhangAngleDeg=']).problems[0]).toContain('not a number');
  });

  it('collects every problem, so one command reports all of its mistakes', () => {
    const { problems } = parseSets(['nosuchRule=5', 'socketNoSupport=yes', 'overhangAngleDeg=200']);
    expect(problems).toHaveLength(3);
  });
});

/*
 * WHO READS WHAT. `kinds` is the only thing standing between the operator and a run that comes back
 * identical because nothing ever read the rule - the failure this whole tool exists to prevent.
 */
describe('benchwork only offers a kind the rules that kind reads', () => {
  it('every rule declares its kinds, and they are real kinds', () => {
    for (const rule of BENCH_RULES) {
      expect(Array.isArray(rule.kinds), rule.name).toBe(true);
      expect(rule.kinds.length, rule.name).toBeGreaterThan(0);
      for (const kind of rule.kinds) expect(['denture', 'aligner'], rule.name).toContain(kind);
    }
  });

  it('names the denture-only rules as unread by an aligner', () => {
    const rules = Object.fromEntries(BENCH_RULES.map((rule) => [rule.name, 1]));
    const unread = unreadBy('aligner', rules);
    expect(unread).toContain('socketNoSupport');
    expect(unread).not.toContain('overhangAngleDeg');
    expect(unreadBy('denture', rules)).toEqual([]);
  });

  it('readBy keeps only what the kind reads, and drops the rest', () => {
    expect(readBy('aligner', { overhangAngleDeg: 55, socketNoSupport: true })).toEqual({ overhangAngleDeg: 55 });
    expect(readBy('denture', { overhangAngleDeg: 55, socketNoSupport: true })).toEqual({ overhangAngleDeg: 55, socketNoSupport: true });
  });

  /*
   * Measured on the reference aligner 2026-11-20: 94 tips at the default, at 55 and at 10. The rule
   * arrives; nothing moved. This test exists so that stays declared rather than quietly forgotten -
   * if someone later proves an effect, they delete the marker and this test tells them to.
   */
  it('marks a rule that reaches a kind but has never been seen to move it', () => {
    const angle = BENCH_RULES.find((rule) => rule.name === 'overhangAngleDeg');
    expect(angle?.unprovenOn).toEqual(['aligner']);
    for (const rule of BENCH_RULES) {
      for (const kind of rule.unprovenOn ?? []) expect(rule.kinds, rule.name).toContain(kind);
    }
  });
});
