import { cn } from '@/lib/cn';
import type { LifecycleStage } from '@/types';
import { LIFECYCLE_STAGES } from '@/types';

/** The little "Market → Lead → ... → Referral" road shown on module headers, with this module's stages lit up. */
export function LifecycleStrip({ active }: { active: LifecycleStage[] }) {
  return (
    <div className="thin-scroll -mx-1 flex items-center gap-1 overflow-x-auto px-1 py-1">
      {LIFECYCLE_STAGES.map((stage, i) => {
        const on = active.includes(stage);
        return (
          <div key={stage} className="flex shrink-0 items-center gap-1">
            <span className={cn('whitespace-nowrap rounded-full px-2 py-1 text-[10.5px] font-medium', on ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-400')}>{stage}</span>
            {i < LIFECYCLE_STAGES.length - 1 && <span className="text-ink-300">→</span>}
          </div>
        );
      })}
    </div>
  );
}
