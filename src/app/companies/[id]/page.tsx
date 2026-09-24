'use client';
import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerCell, PersonName } from '@/components/shared/entity-cells';
import { OrderLink } from '@/components/shared/entity-cells';
import { formatCompactINR, formatDate, formatINR } from '@/lib/format';
import { orderNet } from '@/lib/order-flow';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const router = useRouter();
  const company = data.companies.find((c) => c.id === id);
  const customers = data.customers.filter((c) => c.companyId === id);
  const orders = useMemo(() => data.orders.filter((o) => o.companyId === id).sort((a, b) => +new Date(b.orderedAt) - +new Date(a.orderedAt)), [data.orders, id]);
  const liveOrders = orders.filter((o) => o.status !== 'Cancelled');
  const tickets = data.tickets.filter((t) => t.companyId === id);
  const complaints = data.complaints.filter((c) => c.companyId === id);
  const products = useMemo(() => {
    const qty = new Map<string, number>();
    for (const o of liveOrders) for (const it of o.items) qty.set(it.productName, (qty.get(it.productName) ?? 0) + it.quantity);
    return [...qty.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [liveOrders]);

  if (!company) return <EmptyState title="Company not found" action={<Button onClick={() => router.push('/companies')} className="mt-2">Back to companies</Button>} />;

  const revenue = liveOrders.reduce((s, o) => s + orderNet(o), 0);

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <Avatar name={company.name} size={52} className="text-[16px]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[19px] font-bold text-ink-900">{company.name}</h1>
                <StatusBadge status={company.health} />
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-500">{company.id} · Account owner: <PersonName id={company.accountOwnerId} /> · Customer since {formatDate(company.since)}</p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink-600">
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-ink-400" /> {company.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-ink-400" /> {company.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-ink-400" /> {company.address}</span>
              </div>
              <div className="mt-2.5"><Pill>{company.customerType}</Pill></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4"><p className="text-[11.5px] text-ink-500">Revenue</p><p className="num mt-1 text-[18px] font-bold text-ink-900">{formatCompactINR(revenue)}</p></Card>
        <Card className="p-4"><p className="text-[11.5px] text-ink-500">Orders</p><p className="num mt-1 text-[18px] font-bold text-ink-900">{liveOrders.length}</p></Card>
        <Card className="p-4"><p className="text-[11.5px] text-ink-500">Open Tickets</p><p className="num mt-1 text-[18px] font-bold text-ink-900">{tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length}</p></Card>
        <Card className="p-4"><p className="text-[11.5px] text-ink-500">Open Complaints</p><p className="num mt-1 text-[18px] font-bold text-ink-900">{complaints.filter((c) => c.stage !== 'Closed').length}</p></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader title="Recent orders" />
          {orders.length === 0 ? <EmptyState title="No orders yet" /> : (
            <div className="divide-y divide-line">
              {orders.slice(0, 10).map((o) => (
                <button key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-ink-50/70">
                  <div>
                    <p className="text-[13px] font-medium"><OrderLink orderId={o.id} /></p>
                    <p className="mt-0.5 text-[11.5px] text-ink-400">{formatDate(o.orderedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num text-[13px] font-semibold text-ink-800">{formatINR(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Contacts" />
            <CardBody className="space-y-2.5">
              {company.contacts.map((c) => (
                <div key={c.name} className="flex items-center gap-2.5">
                  <Avatar name={c.name} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink-800">{c.name}</p>
                    <p className="truncate text-[11px] text-ink-400">{c.role}</p>
                  </div>
                  {c.customerId && <button onClick={() => router.push(`/customers/${c.customerId}`)} className="shrink-0 text-[11px] font-semibold text-brand-600 hover:underline">Profile</button>}
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Products purchased" />
            <CardBody className="space-y-2.5">
              {products.length === 0 ? <p className="text-[12.5px] text-ink-400">No orders yet.</p> : products.map(([name, qty]) => (
                <div key={name} className="flex items-center justify-between text-[12.5px]"><span className="min-w-0 truncate text-ink-700">{name}</span><span className="num font-semibold text-ink-800">×{qty}</span></div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
