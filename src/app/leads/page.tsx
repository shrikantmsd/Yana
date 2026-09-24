'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { SearchInput, Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/tabs';
import { KanbanBoard, type KanbanColumn } from '@/components/ui/kanban';
import { formatCompactINR, formatRelative } from '@/lib/format';
import { LEAD_SOURCES, LEAD_STAGES, type Lead, type LeadStage } from '@/types';
import { CITIES } from '@/types';

const COLUMNS: KanbanColumn<LeadStage>[] = [
  { value: 'New', label: 'New', accent: 'bg-info-500' },
  { value: 'Contacted', label: 'Contacted', accent: 'bg-info-500' },
  { value: 'Engaged', label: 'Engaged', accent: 'bg-info-500' },
  { value: 'Qualified', label: 'Qualified', accent: 'bg-brand-500' },
  { value: 'Proposal', label: 'Proposal', accent: 'bg-warn-500' },
  { value: 'Negotiation', label: 'Negotiation', accent: 'bg-warn-500' },
  { value: 'Won', label: 'Won', accent: 'bg-ok-500' },
  { value: 'Lost', label: 'Lost', accent: 'bg-danger-500' },
];

export default function LeadsPage() {
  const { leads } = useDemoData();
  const { updateLeadStage } = useStore();
  const router = useRouter();
  const [view, setView] = useState('table');
  const [q, setQ] = useState('');
  const [source, setSource] = useState('');
  const [city, setCity] = useState('');

  const rows = useMemo(() => leads.filter((l) => {
    if (source && l.source !== source) return false;
    if (city && l.city !== city) return false;
    if (q && !`${l.name} ${l.company}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [leads, q, source, city]);

  const columns: Column<Lead>[] = [
    { key: 'company', header: 'Lead', sortValue: (l) => l.company, render: (l) => (
      <div><p className="font-medium text-ink-800">{l.company}</p><p className="text-[11.5px] text-ink-400">{l.name} · {l.city}</p></div>
    ) },
    { key: 'source', header: 'Source', sortValue: (l) => l.source, render: (l) => <span className="text-ink-500">{l.source}</span> },
    { key: 'interest', header: 'Product Interest', render: (l) => <span className="block max-w-[180px] truncate text-ink-500">{l.productInterest.join(', ')}</span> },
    { key: 'score', header: 'Score', sortValue: (l) => l.score, render: (l) => <span className="num font-semibold">{l.score}</span> },
    { key: 'stage', header: 'Stage', sortValue: (l) => l.stage, render: (l) => <StatusBadge status={l.stage} /> },
    { key: 'value', header: 'Est. Value', sortValue: (l) => l.estimatedValue, render: (l) => <span className="num font-semibold">{formatCompactINR(l.estimatedValue)}</span> },
    { key: 'next', header: 'Next Follow-up', sortValue: (l) => l.nextFollowUpAt ?? '', render: (l) => <span className="text-ink-500">{l.nextFollowUpAt ? formatRelative(l.nextFollowUpAt) : '—'}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink-900">Leads</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">{leads.length} leads in the pipeline right now.</p>
        </div>
        <SegmentedControl value={view} onChange={setView} items={[{ value: 'table', label: 'Table' }, { value: 'kanban', label: 'Kanban' }]} />
      </div>
      <LifecycleStrip active={MODULE_STAGES.leads} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search leads…" className="w-64" />
          <Select value={source} onChange={setSource} placeholder="All sources" className="w-44" options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))} />
          <Select value={city} onChange={setCity} placeholder="All cities" className="w-36" options={CITIES.map((c) => ({ value: c, label: c }))} />
        </div>
      </Card>

      {view === 'table' ? (
        <Card>
          <DataTable columns={columns} rows={rows} getRowId={(l) => l.id} onRowClick={(l) => router.push(`/leads/${l.id}`)} pageSize={12} defaultSort={{ key: 'score', dir: 'desc' }} emptyTitle="No leads match these filters" />
        </Card>
      ) : (
        <KanbanBoard
          columns={COLUMNS} items={rows} getId={(l) => l.id} getStage={(l) => l.stage}
          onMove={(id, stage) => updateLeadStage(id, stage)}
          renderCard={(l) => (
            <div onClick={() => router.push(`/leads/${l.id}`)}>
              <p className="text-[12.5px] font-semibold text-ink-800">{l.company}</p>
              <p className="mt-0.5 text-[11.5px] text-ink-500">{l.name}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="num text-[11.5px] font-semibold text-brand-700">{formatCompactINR(l.estimatedValue)}</span>
                <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">Score {l.score}</span>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
