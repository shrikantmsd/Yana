import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from './card';

const ICON_TONE: Record<'brand' | 'ok' | 'warn' | 'danger' | 'ai' | 'info', string> = {
  brand: 'bg-brand-50 text-brand-600',
  ok: 'bg-ok-50 text-ok-600',
  warn: 'bg-warn-50 text-warn-600',
  danger: 'bg-danger-50 text-danger-600',
  ai: 'bg-ai-50 text-ai-600',
  info: 'bg-info-50 text-info-600',
};

export function KpiCard({
  label, value, icon: Icon, delta, deltaLabel = 'vs previous period', tone = 'brand', suffix,
}: {
  label: string; value: string; icon: LucideIcon; delta?: number; deltaLabel?: string; tone?: keyof typeof ICON_TONE; suffix?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-ink-500">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', ICON_TONE[tone])}>
          <Icon size={16} />
        </span>
      </div>
      <p className="num mt-2 text-[22px] font-bold text-ink-900">
        {value}
        {suffix && <span className="ml-1 text-[13px] font-medium text-ink-400">{suffix}</span>}
      </p>
      {delta !== undefined && (
        <p className={cn('mt-1.5 flex items-center gap-1 text-[11.5px] font-medium', positive ? 'text-ok-600' : 'text-danger-600')}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta)}% <span className="font-normal text-ink-400">{deltaLabel}</span>
        </p>
      )}
    </Card>
  );
}
