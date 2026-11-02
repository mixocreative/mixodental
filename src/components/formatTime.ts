import { t } from '../i18n';

/** A duration in plain words ("12 s", "1 min 5 s"); never below one second. */
export function formatTime(ms: number): string {
  const seconds = Math.max(1, Math.round(ms / 1000));
  return seconds < 60 ? t('{n} s', { n: seconds }) : t('{m} min {s} s', { m: Math.floor(seconds / 60), s: seconds % 60 });
}
