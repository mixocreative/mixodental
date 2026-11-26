import { describe, expect, it } from 'vitest';
import rulesSource from '@mixo-geocore/host/supports/generateRules.ts?raw';
import { RULE_DEFAULTS } from './ruleDefaults';

/** The default a rule's doc comment in generateRules.ts states ("... default 45 ..."). */
function documentedDefault(rule: string): number {
  const block = rulesSource.slice(0, rulesSource.indexOf(`  ${rule}?: number;`));
  const comment = block.slice(block.lastIndexOf('/**'));
  const found = /default (\d+)/.exec(comment);
  if (!found) throw new Error(`no default in the doc comment of ${rule}`);
  return Number(found[1]);
}

describe('rule defaults quoted by the viewer', () => {
  it('match the engine docs for the global and the dental rim overhang angle', () => {
    expect(RULE_DEFAULTS.overhangAngleDeg).toBe(documentedDefault('overhangAngleDeg'));
    expect(RULE_DEFAULTS.dentalRimOverhangAngleDeg).toBe(documentedDefault('dentalRimOverhangAngleDeg'));
  });
});
