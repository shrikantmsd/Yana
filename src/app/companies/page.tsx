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
import { Avatar } from '@/components/ui/avatar';
import { PersonName } from '@/components/shared/entity-cells';
import { formatCompactINR, formatDate } from '@/lib/format';
import { orderNet } from '@/lib/order-flow';
import { CITIES, CUSTOMER_TYPES, HEALTH_STATES, type Company } from '@/types';

export default function CompaniesPage() {
  const { companies, orders, tickets, complaints } = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [health, setHealth] = useState('');

  const summary = useMemo(() => new Map(companies.map((c) => {
    const os = orders.filter((o) => o.companyId === c.id && o.status !== 'Cancelled');
    return [c.id, {
      revenue: os.reduce((s, o) => s + orderNet(o), 0),
      orderCount: os.length,
      lastOrder: os.length ? os.reduce((a, b) => (+new Date(a.orderedAt) > +new Date(b.orderedAt) ? a : b)).orderedAt : null,
      openTickets: tickets.filter((t) => t.companyId === c.id && t.status !== 'Resolved' && t.status !== 'Closed').length,
      openComplaints: complaints.filter((x) => x.companyId === c.id && x.stage !== 'Closed').length,
    }];
  })), [companies, orders, tickets, complaints]);

  const rows = useMemo(() => companies.filter((c) => {
    if (type && c.customerType !== type) return false;
    if (city && c.city !== city) return false;
    if (health && c.health !== health) return false;
    if (q && !`${c.name} ${c.id} ${c.area}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [companies, q, type, city, health]);

  const columns: Column<Company>[] = [
    { key: 'name', header: 'Company', sortValue: (c) => c.name, render: (c) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={c.name} size={30} />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800">{c.name}</p><p className="truncate text-[11.5px] text-ink-400">{c.id} · {c.area}</p></div>
      </div>
    ) },
    { key: 'type', header: 'Type', sortValue: (c) => c.customerType, render: (c) => <span className="text-ink-500">{c.customerType}</span> },
    { key: 'city', header: 'City', sortValue: (c) => c.city, render: (c) => <span className="text-ink-500">{c.city}</span> },
    { key: 'owner', header: 'Account Owner', render: (c) => <PersonName id={c.accountOwnerId} /> },
    { key: 'revenue', header: 'Revenue', sortValue: (c) => summary.get(c.id)?.revenue ?? 0, render: (c) => <span className="num font-semibold">{formatCompactINR(summary.get(c.id)?.revenue ?? 0)}</span> },
    { key: 'orders', header: 'Orders', sortValue: (c) => summary.get(c.id)?.orderCount ?? 0, render: (c) => <span className="num">{summary.get(c.id)?.orderCount ?? 0}</span> },
    { key: 'issues', header: 'Open Tickets / Complaints', render: (c) => <span className="num text-ink-600">{summary.get(c.id)?.openTickets ?? 0} / {summary.get(c.id)?.openComplaints ?? 0}</span> },
    { key: 'health', header: 'Health', sortValue: (c) => c.health, render: (c) => <StatusBadge status={c.health} /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Companies</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{companies.length} channel accounts — detailers, washes, workshops, dealers, distributors, retailers and fleets.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.companies} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search companies…" className="w-64" />
          <Select value={type} onChange={setType} placeholder="All types" className="w-48" options={CUSTOMER_TYPES.map((t) => ({ value: t, label: t }))} />
          <Select value={city} onChange={setCity} placeholder="All cities" className="w-36" options={CITIES.map((c) => ({ value: c, label: c }))} />
          <Select value={health} onChange={setHealth} placeholder="All health states" className="w-40" options={HEALTH_STATES.map((h) => ({ value: h, label: h }))} />
        </div>
      </Card>
      <Card>
        <DataTable columns={columns} rows={rows} getRowId={(c) => c.id} onRowClick={(c) => router.push(`/companies/${c.id}`)} pageSize={12} emptyTitle="No companies match these filters" />
      </Card>
    </div>
  );
}
