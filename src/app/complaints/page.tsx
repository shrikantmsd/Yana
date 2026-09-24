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
import { CustomerCell, ProductCell } from '@/components/shared/entity-cells';
import { formatRelative } from '@/lib/format';
import { COMPLAINT_CATEGORIES, SEVERITIES, COMPLAINT_STAGES, type Complaint } from '@/types';

export default function ComplaintsPage() {
  const { complaints } = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [stage, setStage] = useState('');

  const rows = useMemo(() => [...complaints].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).filter((c) => {
    if (category && c.category !== category) return false;
    if (severity && c.severity !== severity) return false;
    if (stage && c.stage !== stage) return false;
    if (q && !`${c.id} ${c.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [complaints, q, category, severity, stage]);

  const columns: Column<Complaint>[] = [
    { key: 'id', header: 'Complaint', sortValue: (c) => c.id, render: (c) => <span className="num font-medium text-ink-800">{c.id}</span> },
    { key: 'customer', header: 'Customer', render: (c) => <CustomerCell customerId={c.customerId} showCompany={false} /> },
    { key: 'product', header: 'Product', render: (c) => <ProductCell sku={c.sku} /> },
    { key: 'category', header: 'Category', sortValue: (c) => c.category, render: (c) => <span className="text-ink-500">{c.category}</span> },
    { key: 'severity', header: 'Severity', sortValue: (c) => c.severity, render: (c) => <StatusBadge status={c.severity} /> },
    { key: 'stage', header: 'Stage', sortValue: (c) => c.stage, render: (c) => <StatusBadge status={c.stage} /> },
    { key: 'csat', header: 'CSAT', sortValue: (c) => c.csat ?? -1, render: (c) => <span className="num text-ink-600">{c.csat ? `${c.csat}/5` : '—'}</span> },
    { key: 'created', header: 'Reported', sortValue: (c) => c.createdAt, render: (c) => <span className="text-ink-400">{formatRelative(c.createdAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Complaint Management</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{complaints.filter((c) => c.stage !== 'Closed').length} complaints open across all severities.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.complaints} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search complaints…" className="w-56" />
          <Select value={category} onChange={setCategory} placeholder="All categories" className="w-48" options={COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <Select value={severity} onChange={setSeverity} placeholder="All severities" className="w-36" options={SEVERITIES.map((s) => ({ value: s, label: s }))} />
          <Select value={stage} onChange={setStage} placeholder="All stages" className="w-44" options={COMPLAINT_STAGES.map((s) => ({ value: s, label: s }))} />
        </div>
      </Card>
      <Card><DataTable columns={columns} rows={rows} getRowId={(c) => c.id} onRowClick={(c) => router.push(`/complaints/${c.id}`)} pageSize={12} emptyTitle="No complaints match these filters" /></Card>
    </div>
  );
}
