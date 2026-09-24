import { DAY, DEMO_TODAY, IST_OFFSET, fromDateInput } from './format';

export type RangeKey = '7d' | '30d' | '90d' | '12m' | 'fy' | 'custom';

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'fy', label: 'This financial year' },
];

export interface ResolvedRange {
  from: number;
  to: number;
  prevFrom: number;
  prevTo: number;
  label: string;
}

export function resolveRange(key: RangeKey, custom?: { from: string; to: string }): ResolvedRange {
  const to = DEMO_TODAY.getTime();
  let from: number;
  let label = RANGE_OPTIONS.find((r) => r.value === key)?.label ?? 'Custom range';

  if (key === 'custom' && custom?.from && custom?.to) {
    from = new Date(fromDateInput(custom.from)).getTime() - 12 * 3_600_000;
    const customTo = new Date(fromDateInput(custom.to)).getTime() + 12 * 3_600_000 - 1;
    const span = customTo - from;
    return { from, to: customTo, prevFrom: from - span, prevTo: from, label };
  }
  if (key === 'fy') {
    const ist = new Date(to + IST_OFFSET);
    const fyYear = ist.getUTCMonth() >= 3 ? ist.getUTCFullYear() : ist.getUTCFullYear() - 1;
    from = Date.UTC(fyYear, 3, 1) - IST_OFFSET;
  } else {
    const days = key === '7d' ? 7 : key === '30d' ? 30 : key === '90d' ? 90 : 365;
    from = to - days * DAY;
  }
  if (key === 'custom') label = 'Last 12 months';
  const span = to - from;
  return { from, to, prevFrom: from - span, prevTo: from, label };
}
