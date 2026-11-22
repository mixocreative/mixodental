import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DENTAL_KINDS } from '@mixo-geocore/host/dental/dentalKind';
import { ja } from '../locales/ja';
import { zhHant } from '../locales/zh-Hant';
import { ANY_MODEL, CATEGORY_TABLE, categoryAnswer, typeBadge } from './purposes';

/* From the repo root, where vitest runs. */
const art = (icon: string): string => `src/ui/assets/art/${icon}.svg`;

/*
 * THE CATEGORY TABLE IS COMPLETE. Adding a category is: a kind in the engine, a row in `CATEGORY_TABLE`, an SVG in
 * `src/ui/assets/art/`, and the label in both locales (`src/components/README.md`, "Adding a category"). The compiler
 * enforces the row; this test enforces the rest, so a category can never show without its icon or its words.
 */
describe('the category table', () => {
  it('has a row for every engine category', () => {
    expect(Object.keys(CATEGORY_TABLE).sort()).toEqual([...DENTAL_KINDS].sort());
  });

  it('points every icon at a file in src/ui/assets/art', () => {
    for (const { icon } of [...Object.values(CATEGORY_TABLE), ANY_MODEL]) expect(existsSync(art(icon)), `${icon}.svg`).toBe(true);
  });

  it('has every label translated in Japanese and Taiwan Chinese', () => {
    for (const { label } of [...Object.values(CATEGORY_TABLE), ANY_MODEL]) {
      expect(ja[label], `ja: ${label}`).toBeTruthy();
      expect(zhHant[label], `zh-Hant: ${label}`).toBeTruthy();
    }
  });
});

describe('a type badge', () => {
  it('falls back to G for a profile no table or saved type names', () => {
    expect(typeBadge('reference-denture')).toEqual({ letter: 'G', style: 'generic' });
    expect(typeBadge('not-a-profile').letter).toBe('G');
  });
});

describe('picking a category', () => {
  it('keeps the type in force when its own category is picked again, and answers the default otherwise', () => {
    expect(categoryAnswer('reference-aligner', 'reference-aligner')).toBeUndefined();
    expect(categoryAnswer('reference-denture', 'reference-aligner')).toBe('reference-denture');
    expect(categoryAnswer('reference-aligner', undefined)).toBe('reference-aligner');
  });
});
