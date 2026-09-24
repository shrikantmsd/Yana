'use client';
import Link from 'next/link';
import { useDemoData } from '@/state/store';
import { Avatar } from '../ui/avatar';

export function CustomerCell({ customerId, showCompany = true }: { customerId: string; showCompany?: boolean }) {
  const { customers, companies } = useDemoData();
  const c = customers.find((x) => x.id === customerId);
  if (!c) return <span className="text-ink-400">—</span>;
  const company = companies.find((x) => x.id === c.companyId);
  return (
    <Link href={`/customers/${c.id}`} onClick={(e) => e.stopPropagation()} className="flex min-w-0 items-center gap-2 hover:underline">
      <Avatar name={c.name} size={26} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink-800">{c.name}</span>
        {showCompany && <span className="block truncate text-[11px] text-ink-400">{company?.name ?? c.city}</span>}
      </span>
    </Link>
  );
}

export function CompanyCell({ companyId }: { companyId: string }) {
  const { companies } = useDemoData();
  const c = companies.find((x) => x.id === companyId);
  if (!c) return <span className="text-ink-400">—</span>;
  return (
    <Link href={`/companies/${c.id}`} onClick={(e) => e.stopPropagation()} className="flex min-w-0 items-center gap-2 hover:underline">
      <Avatar name={c.name} size={26} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink-800">{c.name}</span>
        <span className="block truncate text-[11px] text-ink-400">{c.city} · {c.customerType}</span>
      </span>
    </Link>
  );
}

export function ProductCell({ sku }: { sku: string }) {
  const { products } = useDemoData();
  const p = products.find((x) => x.sku === sku);
  if (!p) return <span className="text-ink-400">—</span>;
  return (
    <Link href={`/products/${p.sku}`} onClick={(e) => e.stopPropagation()} className="flex min-w-0 items-center gap-2 hover:underline">
      <span className="h-6 w-6 shrink-0 rounded-md" style={{ background: `${p.imageColor}1A`, border: `1px solid ${p.imageColor}33` }} />
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink-800">{p.name}</span>
        <span className="block truncate text-[11px] text-ink-400">{p.sku}</span>
      </span>
    </Link>
  );
}

export function PersonName({ id }: { id: string }) {
  const { team } = useDemoData();
  return <span>{team.find((t) => t.id === id)?.name ?? '—'}</span>;
}

export function OrderLink({ orderId }: { orderId: string }) {
  return <Link href={`/orders/${orderId}`} onClick={(e) => e.stopPropagation()} className="num font-medium text-brand-700 hover:underline">{orderId}</Link>;
}
