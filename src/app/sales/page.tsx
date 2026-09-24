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
import { ProbabilityMeter } from '@/components/ui/progress';
import { KpiCard } from '@/components/ui/kpi-card';
import { PersonName } from '@/components/shared/entity-cells';
import { formatCompactINR, formatDate } from '@/lib/format';
import { DEAL_STAGES, type Deal, type DealStage } from '@/types';
import { IndianRupee, Percent, Target, TrendingUp } from 'lucide-react';
import { TEAM } from '@/data/team';

const COLUMNS: KanbanColumn<DealStage>[] = DEAL_STAGES.map((s) => ({
  value: s, label: s,
  accent: s === 'Won' ? 'bg-ok-500' : s === 'Lost' ? 'bg-danger-500' : s === 'Order' || s === 'Negotiation' ? 'bg-warn-500' : 'bg-info-500',
}));

export default function SalesPage() {
  const { deals } = useDemoData();
  const { updateDealStage } = useStore();
  const router = useRouter();
  const [view, setView] = useState('kanban');
  const [q, setQ] = useState('');
  const [salesperson, setSalesperson] = useState('');

  const rows = useMemo(() => deals.filter((d) => {
    if (salesperson && d.salespersonId !== salesperson) return false;
    if (q && !`${d.title} ${d.company}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [deals, q, salesperson]);

  const open = rows.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost');
  const pipelineValue = open.reduce((s, d) => s + d.value, 0);
  const weightedValue = open.reduce((s, d) => s + (d.value * d.probability) / 100, 0);
  const won = rows.filter((d) => d.stage === 'Won');
  const closedCount = rows.filter((d) => d.stage === 'Won' || d.stage === 'Lost').length;
  const winRate = closedCount ? Math.round((won.length / closedCount) * 100) : 0;

  const columns: Column<Deal>[] = [
    { key: 'title', header: 'Deal', sortValue: (d) => d.title, render: (d) => <div><p className="font-medium text-ink-800">{d.title}</p><p className="text-[11.5px] text-ink-400">{d.company} · {d.city}</p></div> },
    { key: 'stage', header: 'Stage', sortValue: (d) => d.stage, render: (d) => <StatusBadge status={d.stage} /> },
    { key: 'value', header: 'Value', sortValue: (d) => d.value, render: (d) => <span className="num font-semibold">{formatCompactINR(d.value)}</span> },
    { key: 'prob', header: 'Probability', sortValue: (d) => d.probability, render: (d) => <ProbabilityMeter value={d.probability} /> },
    { key: 'owner', header: 'Salesperson', render: (d) => <PersonName id={d.salespersonId} /> },
    { key: 'next', header: 'Next Action', render: (d) => <span className="text-ink-500">{d.nextAction}</span> },
    { key: 'close', header: 'Expected Close', sortValue: (d) => d.expectedCloseAt, render: (d) => <span className="text-ink-500">{formatDate(d.expectedCloseAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink-900">Sales Pipeline</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">{open.length} open deals across the funnel.</p>
        </div>
        <SegmentedControl value={view} onChange={setView} items={[{ value: 'kanban', label: 'Kanban' }, { value: 'table', label: 'Table' }]} />
      </div>
      <LifecycleStrip active={MODULE_STAGES.sales} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Pipeline Value" value={formatCompactINR(pipelineValue)} icon={IndianRupee} tone="brand" />
        <KpiCard label="Weighted (Potential) Revenue" value={formatCompactINR(weightedValue)} icon={TrendingUp} tone="info" />
        <KpiCard label="Open Deals" value={String(open.length)} icon={Target} tone="ai" />
        <KpiCard label="Win Rate" value={`${winRate}%`} icon={Percent} tone="ok" />
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search deals…" className="w-64" />
          <Select value={salesperson} onChange={setSalesperson} placeholder="All salespeople" className="w-44" options={TEAM.filter((t) => t.role.startsWith('Sales')).map((t) => ({ value: t.id, label: t.name }))} />
        </div>
      </Card>

      {view === 'kanban' ? (
        <KanbanBoard
          columns={COLUMNS} items={rows} getId={(d) => d.id} getStage={(d) => d.stage} onMove={(id, stage) => updateDealStage(id, stage)}
          renderColumnFooter={(_, items) => <p className="num text-[11px] font-semibold text-ink-500">{formatCompactINR(items.reduce((s, d) => s + d.value, 0))}</p>}
          renderCard={(d) => (
            <div>
              <p className="text-[12.5px] font-semibold text-ink-800">{d.company}</p>
              <p className="mt-0.5 truncate text-[11.5px] text-ink-500">{d.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="num text-[11.5px] font-semibold text-brand-700">{formatCompactINR(d.value)}</span>
                <span className="text-[10.5px] text-ink-400">{d.probability}%</span>
              </div>
            </div>
          )}
        />
      ) : (
        <Card><DataTable columns={columns} rows={rows} getRowId={(d) => d.id} pageSize={12} defaultSort={{ key: 'value', dir: 'desc' }} emptyTitle="No deals match these filters" /></Card>
      )}
    </div>
  );
}
