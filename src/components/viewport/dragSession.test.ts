import { describe, expect, it, vi } from 'vitest';
import { beginDrag, type DragEndings, type DragTarget } from './dragSession';

/*
 * The suite runs in node (`vite.config.ts`), so the drag is given its own event target rather than a
 * DOM. What that CAN prove is every rule this module owns: which endings commit, which abandon, that
 * the orbit comes back exactly once, and which listener is registered in the capture phase. What it
 * cannot prove is the DOM's own dispatch order - that is the browser's contract, asserted here as the
 * flags passed to `addEventListener`, and exercised end to end by `a4m`/`a4n` in `scripts/walk.mjs`.
 */
const fakeTarget = () => {
  const on: { type: string; listener: (event: Event) => void; capture: boolean }[] = [];
  return {
    get live() { return on.length; },
    capture(type: string) { return on.filter((row) => row.type === type).map((row) => row.capture); },
    fire(type: string, event: Partial<Event> & Record<string, unknown> = {}) {
      for (const row of [...on]) if (row.type === type) row.listener(event as Event);
    },
    addEventListener(type: string, listener: (event: Event) => void, options?: { capture?: boolean }) {
      on.push({ type, listener, capture: options?.capture === true });
    },
    removeEventListener(type: string, listener: (event: Event) => void, options?: { capture?: boolean }) {
      // THE FLAG IS PART OF THE MATCH, as it is in the DOM. Ignoring it here would let a module that
      // registered in capture and removed in bubble pass this suite while leaving a live listener on
      // the window - and for the Escape handler that means a key stopped app-wide, for ever.
      const at = on.findIndex((row) => row.type === type && row.listener === listener && row.capture === (options?.capture === true));
      if (at >= 0) on.splice(at, 1);
    },
  } satisfies DragTarget & Record<string, unknown>;
};

/** A drag with every ending counted, so a wrong ending is named rather than merely failing. */
const start = (over: Partial<DragEndings> = {}) => {
  const seen = { lock: 0, unlock: 0, release: 0, cancel: 0, moves: [] as PointerEvent[] };
  const target = fakeTarget();
  const end = beginDrag({
    lock: () => { seen.lock += 1; },
    unlock: () => { seen.unlock += 1; },
    release: () => { seen.release += 1; },
    cancel: () => { seen.cancel += 1; },
    move: (event) => { seen.moves.push(event); },
    ...over,
  }, target);
  return { seen, end, target };
};

const escapeKey = () => ({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() });

describe('beginDrag', () => {
  it('takes the orbit on press and gives it back on release, once', () => {
    const { seen, target } = start();
    expect(seen).toMatchObject({ lock: 1, unlock: 0, release: 0 });
    target.fire('pointerup');
    expect(seen).toMatchObject({ unlock: 1, release: 1, cancel: 0 });
    // Every listener is gone, so a release belonging to nothing cannot commit the same drag twice.
    expect(target.live).toBe(0);
    target.fire('pointerup');
    expect(seen).toMatchObject({ unlock: 1, release: 1 });
  });

  it.each(['pointercancel', 'blur'])('%s abandons the drag, and never commits it', (type) => {
    const { seen, target } = start();
    target.fire(type);
    expect(seen).toMatchObject({ cancel: 1, release: 0, unlock: 1 });
    expect(target.live).toBe(0);
  });

  it('Escape abandons the drag and is taken away from the app', () => {
    const { seen, target } = start();
    const event = escapeKey();
    target.fire('keydown', event);
    expect(seen).toMatchObject({ cancel: 1, release: 0, unlock: 1 });
    // App.tsx answers Escape on a window listener of its own: unstopped, cancelling a drag would also
    // clear the selection the drag needs, or leave the dental step.
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('listens for the key in the capture phase and for the release in the bubble phase', () => {
    // The phases are the two halves of one rule: Escape must beat the app's listener, and pointerup
    // must NOT beat the canvas handler that returns early while a drag runs (`babylon/rimDraw.ts`).
    const { target } = start();
    expect(target.capture('keydown')).toEqual([true]);
    expect(target.capture('pointerup')).toEqual([false]);
    expect(target.capture('pointermove')).toEqual([false]);
  });

  it('leaves every other key to the app', () => {
    const { seen, target } = start();
    const event = { key: 'a', preventDefault: vi.fn(), stopPropagation: vi.fn() };
    target.fire('keydown', event);
    expect(seen).toMatchObject({ cancel: 0, release: 0, unlock: 0 });
    expect(event.stopPropagation).not.toHaveBeenCalled();
  });

  it('delivers pointer moves while it runs, and none after it ends', () => {
    const { seen, target } = start();
    target.fire('pointermove');
    expect(seen.moves).toHaveLength(1);
    target.fire('pointerup');
    target.fire('pointermove');
    expect(seen.moves).toHaveLength(1);
  });

  it('ends silently on unmount: the orbit comes back and the drag means nothing', () => {
    const { seen, end, target } = start();
    end();
    expect(seen).toMatchObject({ unlock: 1, release: 0, cancel: 0 });
    expect(target.live).toBe(0);
    end();
    expect(seen.unlock).toBe(1);
    target.fire('pointerup');
    expect(seen).toMatchObject({ unlock: 1, release: 0 });
  });

  it('hands the orbit back even when the release throws', () => {
    const { seen, target } = start({ release: () => { throw new Error('the commit failed'); } });
    expect(() => target.fire('pointerup')).toThrow('the commit failed');
    expect(seen.unlock).toBe(1);
  });

  it('can be ended from inside a move, and the release that follows means nothing', () => {
    // A caller whose unit unmounts mid-drag ends it from its own cleanup, which can run from a move.
    const seen = { unlock: 0, release: 0 };
    const target = fakeTarget();
    const end = beginDrag({
      lock: () => {},
      unlock: () => { seen.unlock += 1; },
      release: () => { seen.release += 1; },
      cancel: () => {},
      move: () => end(),
    }, target);
    target.fire('pointermove');
    expect(seen).toMatchObject({ unlock: 1, release: 0 });
    expect(target.live).toBe(0);
    target.fire('pointerup');
    expect(seen).toMatchObject({ unlock: 1, release: 0 });
  });

  it('runs two drags in turn without one hearing the other', () => {
    const first = start();
    first.end();
    const second = start();
    second.target.fire('pointerup');
    expect(first.seen).toMatchObject({ release: 0, cancel: 0 });
    expect(second.seen.release).toBe(1);
  });
});
