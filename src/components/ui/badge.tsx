import { cn } from '@/lib/cn';
import { TONE_CLASSES, toneOf, type Tone } from '@/lib/status';

export function StatusBadge({ status, tone, className }: { status: string; tone?: Tone; className?: string }) {
  const t = TONE_CLASSES[tone ?? toneOf(status)];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1 ring-inset', t.badge, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />
      {status}
    </span>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  return <span className={cn('inline-block h-2 w-2 rounded-full', TONE_CLASSES[tone].solid)} />;
}

export function Pill({ children, className, tone = 'neutral' }: { children: React.ReactNode; className?: string; tone?: Tone }) {
  const t = TONE_CLASSES[tone];
  return <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', t.soft, t.text, className)}>{children}</span>;
}
