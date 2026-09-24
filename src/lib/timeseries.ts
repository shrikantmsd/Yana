import { DAY, IST_OFFSET, formatDateShort, formatMonthYear } from './format';

export interface Bucket {
  start: number;
  end: number; // exclusive
  label: string;
}

/** Splits a date range into day, week or month buckets depending on how long it is. */
export function makeBuckets(from: number, to: number): Bucket[] {
  const span = (to - from) / DAY;
  const out: Bucket[] = [];

  if (span <= 14) {
    const istFrom = from + IST_OFFSET;
    let start = Math.floor(istFrom / DAY) * DAY - IST_OFFSET;
    while (start <= to) {
      out.push({ start, end: start + DAY, label: formatDateShort(start) });
      start += DAY;
    }
    return out;
  }

  if (span <= 100) {
    let end = to + 1;
    while (end - 7 * DAY > from - 7 * DAY + 1 && out.length < 40) {
      const start = end - 7 * DAY;
      out.unshift({ start, end, label: formatDateShort(start) });
      end = start;
      if (start <= from) break;
    }
    return out;
  }

  const f = new Date(from + IST_OFFSET);
  let y = f.getUTCFullYear();
  let m = f.getUTCMonth();
  for (let i = 0; i < 60; i++) {
    const start = Date.UTC(y, m, 1) - IST_OFFSET;
    const end = Date.UTC(y, m + 1, 1) - IST_OFFSET;
    if (start > to) break;
    out.push({ start, end, label: formatMonthYear(start + 2 * DAY) });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

export function bucketIndex(buckets: Bucket[], t: number): number {
  for (let i = 0; i < buckets.length; i++) if (t >= buckets[i].start && t < buckets[i].end) return i;
  return -1;
}

/** Adds up a value per bucket (defaults to counting items). */
export function sumByBucket<T>(
  items: readonly T[],
  buckets: Bucket[],
  getTime: (item: T) => number,
  getValue: (item: T) => number = () => 1,
): number[] {
  const out = buckets.map(() => 0);
  for (const item of items) {
    const i = bucketIndex(buckets, getTime(item));
    if (i >= 0) out[i] += getValue(item);
  }
  return out;
}
