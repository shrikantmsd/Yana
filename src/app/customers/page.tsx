'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { SearchInput, Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { CompanyCell } from '@/components/shared/entity-cells';
import { Avatar } from '@/components/ui/avatar';
import { formatCompactINR, formatDate, formatRelative, initials } from '@/lib/format';
import { customerLifetimeStats } from '@/lib/kpi';
import { CITIES, CUSTOMER_TYPES, HEALTH_STATES, type Customer } from '@/types';
import { Phone, Mail } from 'lucide-react';

export default function CustomersPage() {
  const { customers, orders } = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [health, setHealth] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');

  const rows = useMemo(() => customers.filter((c) => {
    if (health && c.health !== health) return false;
    if (type && c.customerType !== type) return false;
    if (city && c.city !== city) return false;
    if (q && !`${c.name} ${c.phone} ${c.email} ${c.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [customers, q, health, type, city]);

  const stats = useMemo(() => new Map(customers.map((c) => [c.id, customerLifetimeStats({ orders }, c.id)])), [customers, orders]);

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Customer', sortValue: (c) => c.name, render: (c) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={c.name} size={30} />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-800">{c.name}</p>
          <p className="truncate text-[11.5px] text-ink-400">{c.id} · {c.role}</p>
        </div>
      </div>
    ) },
    { key: 'company', header: 'Company', render: (c) => <CompanyCell companyId={c.companyId} /> },
    { key: 'type', header: 'Type', sortValue: (c) => c.customerType, render: (c) => <span className="text-ink-500">{c.customerType}</span> },
    { key: 'city', header: 'City', sortValue: (c) => c.city, render: (c) => <span className="text-ink-500">{c.city}</span> },
    { key: 'revenue', header: 'Lifetime Revenue', sortValue: (c) => stats.get(c.id)?.lifetimeRevenue ?? 0, render: (c) => <span className="num font-semibold">{formatCompactINR(stats.get(c.id)?.lifetimeRevenue ?? 0)}</span> },
    { key: 'lastOrder', header: 'Last Order', sortValue: (c) => stats.get(c.id)?.lastOrderAt ?? '', render: (c) => <span className="text-ink-500">{formatRelative(stats.get(c.id)?.lastOrderAt ?? null)}</span> },
    { key: 'whatsapp', header: 'WhatsApp', render: (c) => <StatusBadge status={c.whatsappStatus} /> },
    { key: 'health', header: 'Health', sortValue: (c) => c.health, render: (c) => <StatusBadge status={c.health} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Customers</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{customers.length} customers across all cities and channel types.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.customers} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name, phone, email, ID…" className="w-64" />
          <Select value={type} onChange={setType} placeholder="All types" className="w-44" options={CUSTOMER_TYPES.map((t) => ({ value: t, label: t }))} />
          <Select value={city} onChange={setCity} placeholder="All cities" className="w-36" options={CITIES.map((c) => ({ value: c, label: c }))} />
          <Select value={health} onChange={setHealth} placeholder="All health states" className="w-40" options={HEALTH_STATES.map((h) => ({ value: h, label: h }))} />
        </div>
      </Card>
      <Card>
        <DataTable columns={columns} rows={rows} getRowId={(c) => c.id} onRowClick={(c) => router.push(`/customers/${c.id}`)} pageSize={12} emptyTitle="No customers match these filters" />
      </Card>
    </div>
  );
}
