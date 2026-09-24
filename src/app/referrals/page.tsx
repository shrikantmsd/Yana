'use client';
import { useMemo } from 'react';
import { Gift, IndianRupee, Percent, Users } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { DataTable, type Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/badge';
import { CustomerCell } from '@/components/shared/entity-cells';
import { formatCompactINR, formatDate } from '@/lib/format';
import type { Referral } from '@/types';

export default function ReferralsPage() {
  const { referrals } = useDemoData();
  const converted = referrals.filter((r) => r.status === 'Converted');
  const conversionRate = referrals.length ? Math.round((converted.length / referrals.length) * 100) : 0;
  const totalRevenue = referrals.reduce((s, r) => s + r.revenue, 0);

  const columns: Column<Referral>[] = [
    { key: 'referrer', header: 'Referrer', render: (r) => <CustomerCell customerId={r.referrerId} /> },
    { key: 'lead', header: 'New Lead', render: (r) => <div><p className="font-medium text-ink-800">{r.newLeadCompany}</p><p className="text-[11px] text-ink-400">{r.newLeadName} · {r.city}</p></div> },
    { key: 'date', header: 'Referral Date', sortValue: (r) => r.referredAt, render: (r) => <span className="text-ink-500">{formatDate(r.referredAt)}</span> },
    { key: 'status', header: 'Status', sortValue: (r) => r.status, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'revenue', header: 'Revenue', sortValue: (r) => r.revenue, render: (r) => <span className="num font-semibold">{r.revenue ? formatCompactINR(r.revenue) : '—'}</span> },
    { key: 'reward', header: 'Reward', render: (r) => <span className="text-ink-600">{r.reward}</span> },
    { key: 'rewardStatus', header: 'Reward Status', sortValue: (r) => r.rewardStatus, render: (r) => <StatusBadge status={r.rewardStatus} /> },
    { key: 'campaign', header: 'Campaign', render: (r) => <span className="text-ink-500">{r.campaign}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Referrals</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Happy Customer → Referral Request → Contact Shared → Lead Created → Qualification → Sale</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.referrals} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Referrals" value={String(referrals.length)} icon={Users} tone="brand" />
        <KpiCard label="Converted" value={String(converted.length)} icon={Gift} tone="ok" />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} icon={Percent} tone="ai" />
        <KpiCard label="Revenue from Referrals" value={formatCompactINR(totalRevenue)} icon={IndianRupee} tone="info" />
      </div>

      <Card><DataTable columns={columns} rows={referrals} getRowId={(r) => r.id} pageSize={12} emptyTitle="No referrals recorded yet" /></Card>
    </div>
  );
}
