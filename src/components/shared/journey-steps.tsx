import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { JourneyStep } from '@/lib/customer-activity';

export function JourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="thin-scroll flex items-center overflow-x-auto py-1">
      {steps.map((s, i) => (
        <div key={s.label} className="flex shrink-0 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold', s.done ? 'bg-ok-500 text-white' : 'bg-ink-100 text-ink-400')}>
              {s.done ? <Check size={13} /> : i + 1}
            </span>
            <span className={cn('w-[74px] text-center text-[10.5px] font-medium leading-tight', s.done ? 'text-ink-700' : 'text-ink-400')}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <span className={cn('mx-1 h-0.5 w-6 shrink-0 rounded-full', steps[i + 1].done && s.done ? 'bg-ok-400' : 'bg-ink-150 bg-ink-100')} />}
        </div>
      ))}
    </div>
  );
}
