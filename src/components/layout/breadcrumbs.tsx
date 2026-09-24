'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_NAV_ITEMS, SETTINGS_ITEM } from '@/config/nav';

const LABELS: Record<string, string> = { 'upsell-cross-sell': 'Upsell & Cross-sell', 'customer-success': 'Customer Success', 'ai-voice': 'AI Voice' };

export function useSectionLabel() {
  const pathname = usePathname();
  if (pathname === '/') return 'Dashboard';
  const seg = pathname.split('/').filter(Boolean)[0];
  return ALL_NAV_ITEMS.find((i) => i.href === `/${seg}`)?.label ?? (seg === 'settings' ? SETTINGS_ITEM.label : LABELS[seg] ?? 'YANA MOTORS OS');
}

export function Breadcrumbs({ trail }: { trail?: string[] }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const sectionLabel = useSectionLabel();

  if (segments.length === 0) return <span className="text-[13px] font-semibold text-ink-900">Dashboard</span>;

  const rootHref = `/${segments[0]}`;
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-[13px]">
      <Link href={rootHref} className="font-medium text-ink-500 hover:text-ink-800">{sectionLabel}</Link>
      {(trail ?? segments.slice(1)).map((crumb, i, arr) => (
        <span key={i} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight size={13} className="shrink-0 text-ink-300" />
          <span className={i === arr.length - 1 ? 'truncate font-semibold text-ink-900' : 'truncate text-ink-500'}>{crumb}</span>
        </span>
      ))}
    </div>
  );
}
