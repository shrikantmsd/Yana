import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

const PALETTE = ['bg-brand-100 text-brand-700', 'bg-info-100 text-info-700', 'bg-ok-100 text-ok-700', 'bg-ai-100 text-ai-700', 'bg-warn-100 text-warn-700'];
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const cls = PALETTE[hash(name) % PALETTE.length];
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', cls, className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {initials(name) || '?'}
    </span>
  );
}
