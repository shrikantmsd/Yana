import { cn } from '@/lib/cn';
import { TONE_CLASSES, type Tone } from '@/lib/status';

export function ProgressBar({ value, tone = 'brand', className, trackClassName }: { value: number; tone?: Tone; className?: string; trackClassName?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-ink-100', trackClassName)}>
      <div className={cn('h-full rounded-full transition-all', TONE_CLASSES[tone].solid, className)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProbabilityMeter({ value }: { value: number }) {
  const tone: Tone = value >= 70 ? 'success' : value >= 40 ? 'warning' : 'danger';
  return (
    <div className="flex items-center gap-2">
      <ProgressBar value={value} tone={tone} className="w-16" />
      <span className="num text-[12px] font-semibold text-ink-700">{value}%</span>
    </div>
  );
}
