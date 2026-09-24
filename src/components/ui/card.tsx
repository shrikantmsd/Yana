import { cn } from '@/lib/cn';

export function Card({ className, children, as: As = 'div', ...rest }: React.HTMLAttributes<HTMLDivElement> & { as?: 'div' | 'section' }) {
  const Comp = As as any;
  return (
    <Comp className={cn('rounded-2xl border border-line bg-white shadow-card', className)} {...rest}>
      {children}
    </Comp>
  );
}

export function CardHeader({ title, subtitle, action, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b border-line px-5 py-4', className)}>
      <div className="min-w-0">
        <h3 className="truncate text-[14.5px] font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
