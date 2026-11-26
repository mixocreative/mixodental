import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { matchPath, matchTarget, targetBeside, targetFor } from './targetMatch.mjs';

const folder = () => mkdtempSync(join(tmpdir(), 'target-match-'));

describe('the target match is kept by CONTENT, never by name', () => {
  it('a renamed pair finds the same result; changed bytes do not', () => {
    const dir = folder();
    for (const [name, text] of [['a.stl', 'scan'], ['a-sup.stl', 'target'], ['b.stl', 'scan'], ['b-sup.stl', 'target'], ['c.stl', 'other scan']]) writeFileSync(join(dir, name), text);
    const keep = join(dir, 'kept');
    expect(matchPath(join(dir, 'a.stl'), join(dir, 'a-sup.stl'), keep)).toBe(matchPath(join(dir, 'b.stl'), join(dir, 'b-sup.stl'), keep));
    expect(matchPath(join(dir, 'c.stl'), join(dir, 'a-sup.stl'), keep)).not.toBe(matchPath(join(dir, 'a.stl'), join(dir, 'a-sup.stl'), keep));
  });
});

describe('nothing dies silently', () => {
  it('a matcher that cannot run answers failed WITH the reason and keeps nothing (so the next ask retries)', () => {
    const dir = folder();
    writeFileSync(join(dir, 'a.stl'), 'scan');
    writeFileSync(join(dir, 'a-sup.stl'), 'target');
    const got = matchTarget(join(dir, 'a.stl'), join(dir, 'a-sup.stl'), { dir: join(dir, 'kept'), python: join(dir, 'no-such-python') });
    expect(got.status).toBe('failed');
    expect(got.path).toBeNull();
    expect(got.reason).toMatch(/did not run/);
  });
  it('a scan with no target is null; a GLB pair is unsupported with the reason, without running the matcher', () => {
    const dir = folder();
    for (const name of ['lone.stl', 'g.glb', 'g-sup.stl']) writeFileSync(join(dir, name), 'x');
    expect(targetFor(join(dir, 'lone.stl'))).toBeNull();
    expect(targetBeside(join(dir, 'lone.stl'))).toBeNull();
    const glb = targetFor(join(dir, 'g.glb'), { python: join(dir, 'no-such-python') });
    expect(glb?.status).toBe('unsupported');
    expect(glb?.reason).toMatch(/STL/);
  });
});
