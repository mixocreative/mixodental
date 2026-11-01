import { describe, expect, it } from 'vitest';
import { KeyedQueue } from './keyedQueue';

const later = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 5));

describe('KeyedQueue', () => {
  it('runs one job at a time and replaces a queued job of the same key', async () => {
    const queue = new KeyedQueue();
    const ran: string[] = [];
    const job = (name: string) => () => { ran.push(name); return later(name); };
    const first = queue.push('a', job('a1'));
    const replaced = queue.push('b', job('b1'));
    const newest = queue.push('b', job('b2'));
    const other = queue.push('c', job('c1'));
    expect(await Promise.all([first, replaced, newest, other])).toEqual(['a1', undefined, 'b2', 'c1']);
    expect(ran).toEqual(['a1', 'b2', 'c1']);
  });

  it('passes a failure to its caller and keeps going', async () => {
    const queue = new KeyedQueue();
    const failing = queue.push('x', () => Promise.reject(new Error('boom')));
    const next = queue.push('y', () => later(2));
    await expect(failing).rejects.toThrow('boom');
    expect(await next).toBe(2);
  });
});
