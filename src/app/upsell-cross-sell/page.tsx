'use client';
import { useMemo, useState } from 'react';
import { ArrowRight, IndianRupee, TrendingUp, Layers, Percent } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { Select } from '@/components/ui/inputs';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { StatusMenu } from '@/components/ui/dropdown';
import { CustomerCell } from '@/components/shared/entity-cells';
import { formatCompactINR } from '@/lib/format';
import { GROWTH_STATUSES_LIST } from '@/lib/growth-status';
import { formatDate } from '@/lib/format';

export default function UpsellCrossSellPage() {
  const { growthOpportunities } = useDemoData();
  const { setGrowthStatus } = useStore();
  const [kind, setKind] = useState('');

  const rows = useMemo(() => growthOpportunities.filter((g) => !kind || g.kind === kind), [growthOpportunities, kind]);
  const potential = rows.reduce((s, g) => s + g.potentialRevenue, 0);
  const won = growthOpportunities.filter((g) => g.status === 'Won');
  const winRate = growthOpportunities.length ? Math.round((won.length / growthOpportunities.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Upsell &amp; Cross-sell</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Suggestions generated from what each customer has already bought.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES['upsell-cross-sell']} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Opportunities" value={String(rows.length)} icon={Layers} tone="brand" />
        <KpiCard label="Potential Revenue" value={formatCompactINR(potential)} icon={IndianRupee} tone="ok" />
        <KpiCard label="Won" value={String(won.length)} icon={TrendingUp} tone="info" />
        <KpiCard label="Win Rate" value={`${winRate}%`} icon={Percent} tone="ai" />
      </div>

      <Card className="p-3">
        <Select value={kind} onChange={setKind} placeholder="Upsell & Cross-sell" className="w-44" options={[{ value: 'Upsell', label: 'Upsell' }, { value: 'Cross-sell', label: 'Cross-sell' }]} />
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((g) => (
          <Card key={g.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <Pill tone={g.kind === 'Upsell' ? 'brand' : 'info'}>{g.kind}</Pill>
              <StatusMenu value={g.status} options={GROWTH_STATUSES_LIST} onChange={(s) => setGrowthStatus(g.id, s)} />
            </div>
            <div className="mt-3"><CustomerCell customerId={g.customerId} /></div>
            <div className="mt-3 flex items-center gap-2 text-[12.5px]">
              <span className="max-w-[45%] truncate text-ink-500">{g.currentProduct}</span>
              <ArrowRight size={13} className="shrink-0 text-ink-300" />
              <span className="min-w-0 truncate font-semibold text-ink-800">{g.recommendedProduct}</span>
            </div>
            <p className="mt-2 text-[12px] text-ink-500">{g.reason}</p>
            <p className="num mt-3 text-[15px] font-bold text-ink-900">{formatCompactINR(g.potentialRevenue)} <span className="text-[10.5px] font-normal text-ink-400">potential</span></p>
          </Card>
        ))}
      </div>
    </div>
  );
}
