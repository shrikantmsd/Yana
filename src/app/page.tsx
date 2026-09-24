'use client';
import {
  Users, Store, Target, ShoppingCart, IndianRupee, Repeat2, LifeBuoy, ShieldAlert, CalendarClock, TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDemoData } from '@/state/store';
import { DEFAULT_FILTERS, FilterBar, type DashboardFilters } from '@/components/dashboard/filter-bar';
import { ChartCard } from '@/components/dashboard/chart-card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { ProbabilityMeter } from '@/components/ui/progress';
import { TrendChart } from '@/components/charts/line-chart';
import { BarChartCard } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { MiniTableCard } from '@/components/tables/mini-table';
import { CustomerCell, ProductCell } from '@/components/shared/entity-cells';
import { applyDashboardFilters } from '@/lib/filters';
import { resolveRange } from '@/lib/ranges';
import {
  dashboardKpis, revenueTrend, salesTrend, leadFunnel, ordersByCategory, customerGrowth, repeatPurchaseTrend,
  reorderOpportunityTrend, complaintTrend, csatTrend, geographicDistribution, highValueCustomers,
} from '@/lib/kpi';
import { formatCompactINR, formatDateShort, formatINR, formatRelative, daysUntil } from '@/lib/format';
import { INTENT_TONES } from '@/lib/status';

export default function DashboardPage() {
  const data = useDemoData();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(() => applyDashboardFilters(data, filters), [data, filters]);
  const range = useMemo(() => resolveRange(filters.range), [filters.range]);
  const kpis = useMemo(() => dashboardKpis(filtered, range), [filtered, range]);

  const recentOrders = [...filtered.orders].sort((a, b) => +new Date(b.orderedAt) - +new Date(a.orderedAt)).slice(0, 6);
  const recentLeads = [...filtered.leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6);
  const recentConvos = [...filtered.conversations].sort((a, b) => +new Date(b.messages.at(-1)?.at ?? 0) - +new Date(a.messages.at(-1)?.at ?? 0)).slice(0, 6);
  const openTickets = filtered.tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').slice(0, 6);
  const openComplaints = filtered.complaints.filter((c) => c.stage !== 'Closed').slice(0, 6);
  const topCustomers = highValueCustomers(filtered, 6);
  const upcomingReorders = [...filtered.reorderOpportunities].filter((r) => daysUntil(r.expectedReorderAt) > -14).sort((a, b) => b.probability - a.probability).slice(0, 6);
  const recentCalls = filtered.calls.slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[22px] font-bold text-ink-900">Executive Dashboard</h1>
        <p className="text-[13px] text-ink-500">Everything you need to run YANA MOTORS at a glance. All figures below are demo data.</p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Customers" value={kpis.totalCustomers.toLocaleString('en-IN')} icon={Users} tone="brand" />
        <KpiCard label="Active Dealers" value={kpis.activeDealers.toLocaleString('en-IN')} icon={Store} tone="info" />
        <KpiCard label="Total Leads" value={kpis.totalLeads.toLocaleString('en-IN')} icon={Target} tone="ai" />
        <KpiCard label="Orders" value={kpis.orders.toLocaleString('en-IN')} icon={ShoppingCart} tone="info" />
        <KpiCard label="Revenue" value={formatCompactINR(kpis.revenue)} icon={IndianRupee} tone="ok" delta={kpis.revenueDelta} />
        <KpiCard label="Repeat Purchase Rate" value={`${kpis.repeatPurchaseRate}%`} icon={Repeat2} tone="brand" />
        <KpiCard label="Open Support Tickets" value={kpis.openSupportTickets.toLocaleString('en-IN')} icon={LifeBuoy} tone="warn" />
        <KpiCard label="Open Complaints" value={kpis.openComplaints.toLocaleString('en-IN')} icon={ShieldAlert} tone="danger" />
        <KpiCard label="Expected Reorders" value={kpis.expectedReorders.toLocaleString('en-IN')} icon={CalendarClock} tone="ai" />
        <KpiCard label="Sales Conversion" value={`${kpis.salesConversionRate}%`} icon={TrendingUp} tone="ok" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle={range.label}>
          <TrendChart data={revenueTrend(filtered, range)} formatter={formatCompactINR} />
        </ChartCard>
        <ChartCard title="Sales Trend" subtitle="Value of deals won">
          <TrendChart data={salesTrend(filtered, range)} color="#2f6fe4" formatter={formatCompactINR} />
        </ChartCard>
        <ChartCard title="Lead Funnel" subtitle="Leads currently at or past each stage">
          <BarChartCard data={leadFunnel(filtered)} horizontal color="#7c3aed" formatter={(v) => `${v}`} height={260} />
        </ChartCard>
        <ChartCard title="Orders by Product Category" subtitle="Share of revenue in range">
          <DonutChart data={ordersByCategory(filtered, range)} centerLabel="Revenue" />
        </ChartCard>
        <ChartCard title="Customer Growth" subtitle="Cumulative customers over time">
          <TrendChart data={customerGrowth(filtered, range)} color="#1fa35a" formatter={(v) => `${v}`} />
        </ChartCard>
        <ChartCard title="Repeat Purchase Trend" subtitle="Share of buyers with 2+ orders">
          <TrendChart data={repeatPurchaseTrend(filtered, range)} color="#7c3aed" formatter={(v) => `${v}%`} />
        </ChartCard>
        <ChartCard title="Reorder Opportunities" subtitle="Expected reorders by week (this week = overdue)">
          <BarChartCard data={reorderOpportunityTrend(filtered)} color="#f5a30b" formatter={(v) => `${v}`} />
        </ChartCard>
        <ChartCard title="Complaint Trends" subtitle={range.label}>
          <TrendChart data={complaintTrend(filtered, range)} color="#dc2626" formatter={(v) => `${v}`} />
        </ChartCard>
        <ChartCard title="Customer Satisfaction" subtitle="Average rating out of 5">
          <TrendChart data={csatTrend(filtered, range).map((p) => ({ label: p.label, value: p.value === null ? null : p.value / 20 }))} color="#e5333b" formatter={(v) => v.toFixed(1)} />
        </ChartCard>
        <ChartCard title="Geographic Customer Distribution" subtitle="Customers by city">
          <BarChartCard data={geographicDistribution(filtered)} horizontal multiColor formatter={(v) => `${v}`} height={260} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MiniTableCard
          title="Recent Orders" viewAllHref="/orders" rows={recentOrders} getRowId={(o) => o.id} getHref={(o) => `/orders/${o.id}`}
          columns={[
            { header: 'Order', render: (o) => <span className="num font-medium text-ink-800">{o.id}</span> },
            { header: 'Customer', render: (o) => <CustomerCell customerId={o.customerId} showCompany={false} /> },
            { header: 'Total', render: (o) => <span className="num font-semibold">{formatINR(o.total)}</span> },
            { header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
            { header: 'Date', render: (o) => <span className="text-ink-400">{formatDateShort(o.orderedAt)}</span> },
          ]}
        />
        <MiniTableCard
          title="Recent Leads" viewAllHref="/leads" rows={recentLeads} getRowId={(l) => l.id} getHref={(l) => `/leads/${l.id}`}
          columns={[
            { header: 'Company', render: (l) => <span><span className="block font-medium text-ink-800">{l.company}</span><span className="block text-[11px] text-ink-400">{l.name}</span></span> },
            { header: 'Source', render: (l) => <span className="text-ink-500">{l.source}</span> },
            { header: 'Stage', render: (l) => <StatusBadge status={l.stage} /> },
            { header: 'Value', render: (l) => <span className="num font-semibold">{formatCompactINR(l.estimatedValue)}</span> },
          ]}
        />
        <MiniTableCard
          title="Recent WhatsApp Conversations" viewAllHref="/whatsapp" rows={recentConvos} getRowId={(c) => c.id} getHref={() => '/whatsapp'}
          columns={[
            { header: 'Customer', render: (c) => <CustomerCell customerId={c.customerId} showCompany={false} /> },
            { header: 'Last message', render: (c) => <span className="block max-w-[220px] truncate text-ink-600">{c.messages.at(-1)?.text}</span> },
            { header: 'Intent', render: (c) => <Pill tone={INTENT_TONES[c.intent]}>{c.intent}</Pill> },
            { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
          ]}
        />
        <MiniTableCard
          title="Open Support Tickets" viewAllHref="/support" rows={openTickets} getRowId={(t) => t.id} getHref={(t) => `/support/${t.id}`}
          columns={[
            { header: 'Ticket', render: (t) => <span className="num font-medium">{t.id}</span> },
            { header: 'Customer', render: (t) => <CustomerCell customerId={t.customerId} showCompany={false} /> },
            { header: 'Category', render: (t) => <span className="text-ink-500">{t.category}</span> },
            { header: 'Priority', render: (t) => <StatusBadge status={t.priority} /> },
            { header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
          ]}
        />
        <MiniTableCard
          title="Open Complaints" viewAllHref="/complaints" rows={openComplaints} getRowId={(c) => c.id} getHref={(c) => `/complaints/${c.id}`}
          columns={[
            { header: 'Complaint', render: (c) => <span className="num font-medium">{c.id}</span> },
            { header: 'Customer', render: (c) => <CustomerCell customerId={c.customerId} showCompany={false} /> },
            { header: 'Category', render: (c) => <span className="text-ink-500">{c.category}</span> },
            { header: 'Severity', render: (c) => <StatusBadge status={c.severity} /> },
            { header: 'Stage', render: (c) => <StatusBadge status={c.stage} /> },
          ]}
        />
        <MiniTableCard
          title="High-Value Customers" viewAllHref="/customers" rows={topCustomers} getRowId={(x) => x.customer.id} getHref={(x) => `/customers/${x.customer.id}`}
          columns={[
            { header: 'Customer', render: (x) => <CustomerCell customerId={x.customer.id} /> },
            { header: 'Lifetime revenue', render: (x) => <span className="num font-semibold">{formatCompactINR(x.revenue)}</span> },
            { header: 'Health', render: (x) => <StatusBadge status={x.customer.health} /> },
          ]}
        />
        <MiniTableCard
          title="Upcoming Reorders" viewAllHref="/reorders" rows={upcomingReorders} getRowId={(r) => r.id} getHref={() => '/reorders'}
          columns={[
            { header: 'Customer', render: (r) => <CustomerCell customerId={r.customerId} showCompany={false} /> },
            { header: 'Product', render: (r) => <ProductCell sku={r.sku} /> },
            { header: 'Expected', render: (r) => <span className="text-ink-500">{formatDateShort(r.expectedReorderAt)}</span> },
            { header: 'Probability', render: (r) => <ProbabilityMeter value={r.probability} /> },
          ]}
        />
        <MiniTableCard
          title="AI Voice Calls" viewAllHref="/ai-voice" rows={recentCalls} getRowId={(c) => c.id} getHref={() => '/ai-voice'}
          columns={[
            { header: 'Customer', render: (c) => <CustomerCell customerId={c.customerId} showCompany={false} /> },
            { header: 'Type', render: (c) => <span className="text-ink-500">{c.callType}</span> },
            { header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
            { header: 'When', render: (c) => <span className="text-ink-400">{formatRelative(c.calledAt)}</span> },
          ]}
        />
      </div>
    </div>
  );
}
