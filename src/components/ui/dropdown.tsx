'use client';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { StatusBadge } from './badge';

export function Dropdown({ trigger, children, align = 'left', className }: { trigger: React.ReactNode; children: (close: () => void) => React.ReactNode; align?: 'left' | 'right'; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div className={cn('anim-pop absolute z-30 mt-1.5 min-w-[180px] rounded-xl border border-line bg-white p-1 shadow-pop', align === 'right' ? 'right-0' : 'left-0', className)}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, active, icon }: { children: React.ReactNode; onClick?: () => void; active?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors', active ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50')}
    >
      {icon}
      {children}
    </button>
  );
}

/** A status badge that opens a menu of other statuses to switch to. */
export function StatusMenu<T extends string>({ value, options, onChange, disabled }: { value: T; options: readonly T[]; onChange: (v: T) => void; disabled?: boolean }) {
  if (disabled) return <StatusBadge status={value} />;
  return (
    <Dropdown trigger={
      <button className="group inline-flex items-center gap-1 rounded-full transition-opacity hover:opacity-80">
        <StatusBadge status={value} />
        <ChevronDown size={12} className="text-ink-400" />
      </button>
    }>
      {(close) => (
        <div className="max-h-64 overflow-y-auto thin-scroll">
          {options.map((opt) => (
            <DropdownItem key={opt} active={opt === value} onClick={() => { onChange(opt); close(); }}>
              <StatusBadge status={opt} className="pointer-events-none" />
            </DropdownItem>
          ))}
        </div>
      )}
    </Dropdown>
  );
}
