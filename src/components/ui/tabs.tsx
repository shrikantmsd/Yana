'use client';
import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

export function Tabs({ items, value, onChange, className }: { items: TabItem[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn('thin-scroll flex gap-1 overflow-x-auto border-b border-line', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-[13px] font-medium transition-colors',
              active ? 'text-brand-700' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold', active ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500')}>{item.count}</span>
            )}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function SegmentedControl({ items, value, onChange }: { items: TabItem[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-ink-100 p-0.5">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn('rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors', value === item.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
