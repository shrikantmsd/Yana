/**
 * Formatting helpers. Dates are always shown in Indian time (IST) and numbers use
 * Indian digit grouping (12,34,567). Written by hand so the server and the browser
 * always print exactly the same text.
 */

/** The demo "today". Change this one line to move the whole demo in time. */
export const DEMO_TODAY = new Date('2026-09-19T05:00:00.000Z'); // 10:30 am IST
export const DAY = 86_400_000;
export const IST_OFFSET = 330 * 60_000;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const ist = (v: string | number | Date) => new Date(new Date(v).getTime() + IST_OFFSET);

export function formatDate(v?: string | null): string {
  if (!v) return '—';
  const d = ist(v);
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateShort(v?: string | number | null): string {
  if (v === null || v === undefined) return '—';
  const d = ist(v);
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`;
}

export function formatMonthYear(v: string | number): string {
  const d = ist(v);
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
}

export function formatTime(v?: string | null): string {
  if (!v) return '—';
  const d = ist(v);
  const h = d.getUTCHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${pad(d.getUTCMinutes())} ${h < 12 ? 'am' : 'pm'}`;
}

export function formatDateTime(v?: string | null): string {
  if (!v) return '—';
  return `${formatDate(v)}, ${formatTime(v)}`;
}

/** "3h ago", "in 2d", "just now" — measured against the demo "today". */
export function formatRelative(v?: string | null, now: Date = DEMO_TODAY): string {
  if (!v) return '—';
  const diff = now.getTime() - new Date(v).getTime();
  const abs = Math.abs(diff);
  const mins = abs / 60_000;
  let text: string;
  if (mins < 1) return 'just now';
  if (mins < 60) text = `${Math.round(mins)}m`;
  else if (mins < 60 * 24) text = `${Math.round(mins / 60)}h`;
  else if (mins < 60 * 24 * 45) text = `${Math.round(mins / 60 / 24)}d`;
  else return formatDate(v);
  return diff >= 0 ? `${text} ago` : `in ${text}`;
}

export function daysBetween(a: string | number | Date, b: string | number | Date): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / DAY;
}
export const daysSince = (v: string | number | Date) => daysBetween(v, DEMO_TODAY);
export const daysUntil = (v: string | number | Date) => daysBetween(DEMO_TODAY, v);

export function addDays(v: string | number | Date, n: number): string {
  return new Date(new Date(v).getTime() + n * DAY).toISOString();
}

/** ISO timestamp for "n days before the demo today" at a given IST clock time. */
export function atDaysAgo(days: number, hour = 11, minute = 0): string {
  const istNow = DEMO_TODAY.getTime() + IST_OFFSET;
  const istMidnight = Math.floor(istNow / DAY) * DAY;
  return new Date(istMidnight - days * DAY + hour * 3_600_000 + minute * 60_000 - IST_OFFSET).toISOString();
}
export const atDaysAhead = (days: number, hour = 11, minute = 0) => atDaysAgo(-days, hour, minute);

/** "2026-09-19" in IST, for <input type="date"> */
export function toDateInput(v: string | number | Date): string {
  const d = ist(v);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}
export function fromDateInput(s: string): string {
  return new Date(`${s}T12:00:00+05:30`).toISOString();
}

export function formatNumber(n: number): string {
  const neg = n < 0;
  const s = Math.abs(Math.round(n)).toString();
  let out = s;
  if (s.length > 3) {
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    out = `${rest},${s.slice(-3)}`;
  }
  return neg ? `-${out}` : out;
}

export const formatINR = (n: number) => `₹${formatNumber(n)}`;

function trim(v: number): string {
  const s = v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
}

/** ₹4.2 L, ₹1.3 Cr — how Indian businesses read big numbers. */
export function formatCompactINR(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (a >= 1e7) return `${sign}₹${trim(a / 1e7)} Cr`;
  if (a >= 1e5) return `${sign}₹${trim(a / 1e5)} L`;
  if (a >= 1e3) return `${sign}₹${trim(a / 1e3)}K`;
  return `${sign}₹${Math.round(a)}`;
}

export function formatCompact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e5) return `${trim(n / 1e5)}L`;
  if (a >= 1e3) return `${trim(n / 1e3)}K`;
  return String(Math.round(n));
}

export const formatPct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;

export function formatDuration(sec: number): string {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${pad(s)}s` : `${s}s`;
}

export function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Timestamp used when a demo action happens ("now" inside the demo). */
export const demoNow = () => DEMO_TODAY.toISOString();
