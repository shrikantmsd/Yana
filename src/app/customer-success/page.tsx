'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { HeartHandshake, TriangleAlert, Percent, Users } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/badge';
import { CustomerCell } from '@/components/shared/entity-cells';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatRelative } from '@/lib/format';
import { SUCCESS_STAGES } from '@/types';
import { cn } from '@/lib/cn';

export default function CustomerSuccessPage() {
  const { successJourneys, customers } = useDemoData();
  const router = useRouter();

  const attention = successJourneys.filter((j) => j.needsAttention);
  const successRate = successJourneys.length ? Math.round(((successJourneys.length - attention.length) / successJourneys.length) * 100) : 0;
  const byStage = useMemo(() => new Map(SUCCESS_STAGES.map((s) => [s, successJourneys.filter((j) => j.stage === s)])), [successJourneys]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Customer Success</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">The post-delivery journey for every customer who received an order in the last 60 days.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES['customer-success']} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Customers in Journey" value={String(successJourneys.length)} icon={Users} tone="brand" />
        <KpiCard label="Needing Attention" value={String(attention.length)} icon={TriangleAlert} tone="warn" />
        <KpiCard label="Success Rate" value={`${successRate}%`} icon={Percent} tone="ok" />
        <KpiCard label="Active Stages" value={String([...byStage.values()].filter((v) => v.length > 0).length)} icon={HeartHandshake} tone="ai" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Post-delivery journey" subtitle="Order Delivered → Welcome → Product Guide → Training → Usage Check → Feedback → Review → Reorder → Upsell → Cross-sell → Referral" />
        <div className="thin-scroll flex gap-3 overflow-x-auto p-4">
          {SUCCESS_STAGES.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} className="flex w-[210px] shrink-0 flex-col rounded-xl bg-ink-50/70">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[12px] font-semibold text-ink-700">{stage}</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-500 ring-1 ring-line">{items.length}</span>
                </div>
                <div className="thin-scroll flex max-h-80 flex-col gap-2 overflow-y-auto px-2 pb-2">
                  {items.map((j) => (
                    <button key={j.id} onClick={() => router.push(`/customers/${j.customerId}`)} className={cn('rounded-lg bg-white p-2.5 text-left shadow-card ring-1', j.needsAttention ? 'ring-warn-300' : 'ring-line')}>
                      <CustomerCell customerId={j.customerId} showCompany={false} />
                      <p className="mt-1.5 truncate text-[11px] text-ink-500">{j.nextAction}</p>
                      {j.needsAttention && <p className="mt-1 flex items-center gap-1 text-[10.5px] font-medium text-warn-700"><TriangleAlert size={11} /> Needs attention</p>}
                    </button>
                  ))}
                  {items.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-4 text-center text-[11px] text-ink-400">None</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader title="Customers needing attention" subtitle="Stuck longer than expected at their current step" />
        {attention.length === 0 ? <EmptyState title="Nothing needs attention right now" /> : (
          <div className="divide-y divide-line px-5">
            {attention.map((j) => (
              <button key={j.id} onClick={() => router.push(`/customers/${j.customerId}`)} className="flex w-full items-center justify-between gap-3 py-3 text-left">
                <CustomerCell customerId={j.customerId} />
                <div className="text-right">
                  <StatusBadge status={j.stage} />
                  <p className="mt-1 text-[11px] text-ink-400">{j.attentionReason}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
