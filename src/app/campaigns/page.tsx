'use client';
import { useMemo, useState } from 'react';
import { Megaphone, Send, TrendingUp, IndianRupee } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Select } from '@/components/ui/inputs';
import { ProgressBar } from '@/components/ui/progress';
import { Drawer } from '@/components/ui/overlay';
import { formatCompactINR, formatDate } from '@/lib/format';
import { CAMPAIGN_CHANNELS, type Campaign } from '@/types';

export default function CampaignsPage() {
  const { campaigns } = useDemoData();
  const [channel, setChannel] = useState('');
  const [active, setActive] = useState<Campaign | null>(null);

  const rows = campaigns.filter((c) => !channel || c.channel === channel);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalConverted = campaigns.reduce((s, c) => s + c.converted, 0);
  const avgConversion = totalSent ? Math.round((totalConverted / totalSent) * 1000) / 10 : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Campaigns</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{campaigns.filter((c) => c.status === 'Running').length} campaigns running across WhatsApp, email and AI voice.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.campaigns} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Sent" value={totalSent.toLocaleString('en-IN')} icon={Send} tone="info" />
        <KpiCard label="Converted" value={totalConverted.toLocaleString('en-IN')} icon={TrendingUp} tone="ok" />
        <KpiCard label="Conversion Rate" value={`${avgConversion}%`} icon={Megaphone} tone="brand" />
        <KpiCard label="Revenue Attributed" value={formatCompactINR(totalRevenue)} icon={IndianRupee} tone="ai" />
      </div>

      <Card className="p-3">
        <Select value={channel} onChange={setChannel} placeholder="All channels" className="w-44" options={CAMPAIGN_CHANNELS.map((c) => ({ value: c, label: c }))} />
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => {
          const rate = c.sent ? Math.round((c.converted / c.sent) * 100) : 0;
          return (
            <button key={c.id} onClick={() => setActive(c)} className="text-left">
              <Card className="flex h-full flex-col p-4 hover:shadow-pop">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13.5px] font-semibold text-ink-900">{c.name}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-[11.5px] text-ink-400">{c.channel} · {c.product}</p>
                <p className="mt-2 line-clamp-2 text-[12px] text-ink-500">{c.objective}</p>
                <div className="mt-auto pt-3">
                  <div className="flex justify-between text-[11px] text-ink-500"><span>Sent {c.sent}</span><span>{rate}% converted</span></div>
                  <ProgressBar value={rate} tone="brand" className="mt-1.5" />
                  <p className="num mt-2 text-[13px] font-bold text-ink-900">{formatCompactINR(c.revenue)} <span className="text-[10.5px] font-normal text-ink-400">attributed</span></p>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.name ?? ''} subtitle={active ? `${active.channel} · Started ${formatDate(active.startedAt)}` : ''} badge={active && <StatusBadge status={active.status} />}>
        {active && (
          <div className="space-y-4">
            <p className="text-[13px] text-ink-600">{active.objective}</p>
            <div className="flex flex-wrap gap-1.5"><Pill>{active.audience}</Pill><Pill>{active.product}</Pill></div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Sent" value={active.sent} /><Metric label="Delivered" value={active.delivered} />
              <Metric label="Read" value={active.read} /><Metric label="Responded" value={active.responded} />
              <Metric label="Converted" value={active.converted} /><Metric label="Revenue" value={formatCompactINR(active.revenue)} />
            </div>
            {active.sent > 0 && (
              <div className="space-y-2">
                <Funnel label="Delivered" value={active.delivered} total={active.sent} />
                <Funnel label="Read" value={active.read} total={active.sent} />
                <Funnel label="Responded" value={active.responded} total={active.sent} />
                <Funnel label="Converted" value={active.converted} total={active.sent} />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg bg-ink-50 p-2.5"><p className="text-[10.5px] text-ink-500">{label}</p><p className="num text-[15px] font-bold text-ink-900">{value}</p></div>;
}
function Funnel({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11.5px] text-ink-500"><span>{label}</span><span className="num font-medium text-ink-700">{value} ({pct}%)</span></div>
      <ProgressBar value={pct} tone="info" className="mt-1" />
    </div>
  );
}
