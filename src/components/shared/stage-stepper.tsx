import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StageStepper<S extends string>({ stages, current, toneClass = 'bg-brand-600' }: { stages: readonly S[]; current: S; toneClass?: string }) {
  const idx = stages.indexOf(current);
  return (
    <div className="thin-scroll flex items-center overflow-x-auto py-1">
      {stages.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s} className="flex shrink-0 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold', done ? 'bg-ok-500 text-white' : active ? `${toneClass} text-white` : 'bg-ink-100 text-ink-400')}>
                {done ? <Check size={13} /> : i + 1}
              </span>
              <span className={cn('w-[84px] text-center text-[10.5px] font-medium leading-tight', done || active ? 'text-ink-700' : 'text-ink-400')}>{s}</span>
            </div>
            {i < stages.length - 1 && <span className={cn('mx-1 h-0.5 w-6 shrink-0 rounded-full', done ? 'bg-ok-400' : 'bg-ink-100')} />}
          </div>
        );
      })}
    </div>
  );
}
