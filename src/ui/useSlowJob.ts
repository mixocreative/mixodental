import { useEffect, useState } from 'react';

/**
 * "IS THIS TAKING LONG ENOUGH TO BE WORTH SAYING?" — true only once `busy` has been true for `afterMs`
 * without a break.
 *
 * It exists because of the jobs that run again and again as the reader works: the support placement redone
 * every time the aligner turns, for one. Those finish in well under a second most of the time, and a
 * progress bar that appears and vanishes on every nudge of a dial is worse than no bar at all - it makes a
 * steady scene flicker and teaches the reader to ignore the one bar that does mean something. Waiting a
 * beat first means the bar is only ever seen when there is really something to wait for.
 *
 * The delay is NOT a guess at how long the job takes; it is how long a reader will happily wait before
 * wanting to be told anything, which is why one value suits every caller.
 */
export function useSlowJob(busy: boolean, afterMs = 450): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) { setSlow(false); return; }
    const timer = window.setTimeout(() => setSlow(true), afterMs);
    return () => window.clearTimeout(timer);
  }, [busy, afterMs]);
  return busy && slow;
}
