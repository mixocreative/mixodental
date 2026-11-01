/*
 * One-at-a-time job queue where a newer job with the same key replaces a queued one (its promise resolves
 * `undefined`, it never runs). The denture worker answers one job at a time, so a burst of edits or of
 * dial moves runs only its last request; a job already running finishes.
 */

interface Entry<T> {
  key: string;
  run: () => Promise<T>;
  settle: (value: T | undefined, error?: unknown) => void;
}

export class KeyedQueue {
  private readonly waiting: Entry<unknown>[] = [];
  private busy = false;

  /** Queues `run` under `key`; resolves with its result, or `undefined` when a newer job of the key replaced it first. */
  push<T>(key: string, run: () => Promise<T>): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      const at = this.waiting.findIndex((entry) => entry.key === key);
      if (at >= 0) this.waiting.splice(at, 1)[0]!.settle(undefined);
      this.waiting.push({ key, run, settle: (value, error) => (error === undefined ? resolve(value as T | undefined) : reject(error)) } as Entry<unknown>);
      this.next();
    });
  }

  /** Jobs waiting (not the running one). */
  get size(): number {
    return this.waiting.length;
  }

  private next(): void {
    if (this.busy) return;
    const entry = this.waiting.shift();
    if (!entry) return;
    this.busy = true;
    entry.run().then((value) => entry.settle(value), (error: unknown) => entry.settle(undefined, error ?? new Error('job failed'))).finally(() => {
      this.busy = false;
      this.next();
    });
  }
}
