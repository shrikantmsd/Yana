'use client';
import { useMemo, useState } from 'react';
import { CalendarClock, IndianRupee, Repeat, TrendingUp } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { ProbabilityMeter } from '@/components/ui/progress';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Button } from '@/components/ui/button';
import { CustomerCell, ProductCell } from '@/components/shared/entity-cells';
import { formatCompactINR, formatDate, daysUntil } from '@/lib/format';
import { REORDER_ACTIONS, type ReorderOpportunity } from '@/types';
import { ChevronDown } from 'lucide-react';

export default function ReordersPage() {
  const { reorderOpportunities } = useDemoData();
  const { setReorderAction } = useStore();
  const [window, setWindowFilter] = useState('');

  const rows = useMemo(() => reorderOpportunities.filter((r) => {
    const d = daysUntil(r.expectedReorderAt);
    if (window === 'overdue') return d < 0;
    if (window === 'week') return d >= 0 && d <= 7;
    if (window === 'month') return d > 7 && d <= 30;
    return true;
  }), [reorderOpportunities, window]);

  const overdue = reorderOpportunities.filter((r) => daysUntil(r.expectedReorderAt) < 0).length;
  const totalValue = rows.reduce((s, r) => s + r.estimatedValue, 0);
  const highProb = rows.filter((r) => r.probability >= 70).length;

  const columns: Column<ReorderOpportunity>[] = [
    { key: 'customer', header: 'Customer', render: (r) => <CustomerCell customerId={r.customerId} showCompany={false} /> },
    { key: 'product', header: 'Product', render: (r) => <ProductCell sku={r.sku} /> },
    { key: 'last', header: 'Last Order', sortValue: (r) => r.lastOrderAt, render: (r) => <span className="text-ink-500">{formatDate(r.lastOrderAt)}</span> },
    { key: 'avgQty', header: 'Avg Qty', sortValue: (r) => r.avgQty, render: (r) => <span className="num text-ink-600">{r.avgQty}</span> },
    { key: 'cycle', header: 'Avg Cycle', sortValue: (r) => r.avgCycleDays, render: (r) => <span className="num text-ink-600">{r.avgCycleDays}d</span> },
    { key: 'expected', header: 'Expected Reorder', sortValue: (r) => r.expectedReorderAt, render: (r) => <span className={daysUntil(r.expectedReorderAt) < 0 ? 'font-medium text-danger-600' : 'text-ink-500'}>{formatDate(r.expectedReorderAt)}</span> },
    { key: 'prob', header: 'Probability', sortValue: (r) => r.probability, render: (r) => <ProbabilityMeter value={r.probability} /> },
    { key: 'value', header: 'Est. Value', sortValue: (r) => r.estimatedValue, render: (r) => <span className="num font-semibold">{formatCompactINR(r.estimatedValue)}</span> },
    { key: 'action', header: 'Action', render: (r) => (
      r.actionTaken ? <StatusBadge status={r.actionTaken} tone="success" /> : (
        <Dropdown trigger={<Button size="sm" variant="outline" className="gap-1">{r.recommendedAction} <ChevronDown size={12} /></Button>}>
          {(close) => REORDER_ACTIONS.map((a) => <DropdownItem key={a} onClick={() => { setReorderAction(r.id, a); close(); }}>{a}</DropdownItem>)}
        </Dropdown>
      )
    ) },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Reorder Intelligence</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Predicted from each customer&apos;s own purchase history and cycle.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.reorders} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Overdue Reorders" value={String(overdue)} icon={CalendarClock} tone="danger" />
        <KpiCard label="High Probability (70%+)" value={String(highProb)} icon={TrendingUp} tone="ok" />
        <KpiCard label="Opportunities Shown" value={String(rows.length)} icon={Repeat} tone="brand" />
        <KpiCard label="Estimated Value" value={formatCompactINR(totalValue)} icon={IndianRupee} tone="ai" />
      </div>

      <Card className="p-3">
        <Select value={window} onChange={setWindowFilter} placeholder="All timeframes" className="w-44" options={[{ value: 'overdue', label: 'Overdue' }, { value: 'week', label: 'Due in 7 days' }, { value: 'month', label: 'Due in 30 days' }]} />
      </Card>
      <Card><DataTable columns={columns} rows={rows} getRowId={(r) => r.id} pageSize={12} defaultSort={{ key: 'prob', dir: 'desc' }} emptyTitle="No reorder opportunities in this window" /></Card>
    </div>
  );
}
