import {
  Bot, MessageCircle, Package, Phone, ShieldAlert, Smile, Star, LifeBuoy, Megaphone, Gift, CircleDot, type LucideIcon,
} from 'lucide-react';
import { formatDateTime } from '@/lib/format';
import type { TimelineEvent, TimelineKind } from '@/types';
import { cn } from '@/lib/cn';

const ICONS: Record<TimelineKind, LucideIcon> = {
  lead: Star, whatsapp: MessageCircle, call: Phone, sales: Star, order: Package, support: LifeBuoy,
  complaint: ShieldAlert, feedback: Smile, campaign: Megaphone, referral: Gift, system: Bot,
};
const TONE: Record<TimelineKind, string> = {
  lead: 'bg-info-50 text-info-600', whatsapp: 'bg-ok-50 text-ok-600', call: 'bg-ai-50 text-ai-600', sales: 'bg-brand-50 text-brand-600',
  order: 'bg-info-50 text-info-600', support: 'bg-warn-50 text-warn-600', complaint: 'bg-danger-50 text-danger-600', feedback: 'bg-ok-50 text-ok-600',
  campaign: 'bg-ai-50 text-ai-600', referral: 'bg-brand-50 text-brand-600', system: 'bg-ink-100 text-ink-500',
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  if (sorted.length === 0) return <p className="py-6 text-center text-[13px] text-ink-400">No activity recorded yet.</p>;
  return (
    <ol className="relative">
      {sorted.map((e, i) => {
        const Icon = ICONS[e.kind] ?? CircleDot;
        return (
          <li key={e.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i !== sorted.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-px bg-line" />}
            <span className={cn('z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', TONE[e.kind])}>
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-[13px] font-medium text-ink-800">{e.title}</p>
                <p className="shrink-0 text-[11px] text-ink-400">{formatDateTime(e.at)}</p>
              </div>
              {e.description && <p className="mt-0.5 text-[12.5px] text-ink-500">{e.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
