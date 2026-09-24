import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'icon';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800',
  outline: 'border border-line-strong bg-white text-ink-700 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
};
const SIZE: Record<Size, string> = { sm: 'h-8 px-3 text-[12.5px] gap-1.5', md: 'h-9.5 px-4 text-[13px] gap-2', icon: 'h-9 w-9' };

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant], SIZE[size], className,
      )}
      {...rest}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

export function IconButton({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800', className)} {...rest} />;
}
