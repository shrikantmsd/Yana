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
import { CustomerCell, PersonName } from '@/components/shared/entity-cells';
import { formatRelative } from '@/lib/format';
import { TICKET_CATEGORIES, TICKET_STATUSES, PRIORITIES, type Ticket } from '@/types';

export default function SupportPage() {
  const { tickets } = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const rows = useMemo(() => [...tickets].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).filter((t) => {
    if (category && t.category !== category) return false;
    if (status && t.status !== status) return false;
    if (priority && t.priority !== priority) return false;
    if (q && !`${t.id} ${t.issue}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [tickets, q, category, status, priority]);

  const columns: Column<Ticket>[] = [
    { key: 'id', header: 'Ticket', sortValue: (t) => t.id, render: (t) => <span className="num font-medium text-ink-800">{t.id}</span> },
    { key: 'customer', header: 'Customer', render: (t) => <CustomerCell customerId={t.customerId} showCompany={false} /> },
    { key: 'issue', header: 'Issue', render: (t) => <span className="block max-w-[280px] truncate text-ink-600">{t.issue}</span> },
    { key: 'category', header: 'Category', sortValue: (t) => t.category, render: (t) => <span className="text-ink-500">{t.category}</span> },
    { key: 'priority', header: 'Priority', sortValue: (t) => t.priority, render: (t) => <StatusBadge status={t.priority} /> },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => <StatusBadge status={t.status} /> },
    { key: 'agent', header: 'Agent', render: (t) => <PersonName id={t.assignedTo} /> },
    { key: 'created', header: 'Created', sortValue: (t) => t.createdAt, render: (t) => <span className="text-ink-400">{formatRelative(t.createdAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Support</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">WhatsApp-first support desk — {tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length} tickets currently open.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.support} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search tickets…" className="w-56" />
          <Select value={category} onChange={setCategory} placeholder="All categories" className="w-48" options={TICKET_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <Select value={priority} onChange={setPriority} placeholder="All priorities" className="w-36" options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
          <Select value={status} onChange={setStatus} placeholder="All statuses" className="w-40" options={TICKET_STATUSES.map((s) => ({ value: s, label: s }))} />
        </div>
      </Card>
      <Card><DataTable columns={columns} rows={rows} getRowId={(t) => t.id} onRowClick={(t) => router.push(`/support/${t.id}`)} pageSize={12} emptyTitle="No tickets match these filters" /></Card>
    </div>
  );
}
