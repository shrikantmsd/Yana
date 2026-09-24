'use client';
import { useMemo, useState } from 'react';
import { useDemoData } from '@/state/store';
import { Card, CardHeader } from '@/components/ui/card';
import { ChartCard } from '@/components/dashboard/chart-card';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/inputs';
import { TrendChart } from '@/components/charts/line-chart';
import { BarChartCard } from '@/components/charts/bar-chart';
import { DonutChart } from '@/components/charts/donut-chart';
import { RANGE_OPTIONS, resolveRange, type RangeKey } from '@/lib/ranges';
import {
  revenueTrend, salesTrend, leadFunnel, ordersByCategory, customerGrowth, repeatPurchaseTrend,
  reorderOpportunityTrend, complaintTrend, csatTrend, geographicDistribution,
} from '@/lib/kpi';
import { orderNet } from '@/lib/order-flow';
import { formatCompactINR, formatPct } from '@/lib/format';
import { CATEGORICAL } from '@/components/charts/chart-theme';
import { CUSTOMER_TYPES, HEALTH_STATES, LEAD_SOURCES, TICKET_CATEGORIES } from '@/types';

const TABS = [
  { value: 'revenue', label: 'Revenue' }, { value: 'sales', label: 'Sales' }, { value: 'leads', label: 'Leads' },
  { value: 'orders', label: 'Orders' }, { value: 'products', label: 'Products' }, { value: 'customers', label: 'Customers' },
  { value: 'repeat', label: 'Repeat Purchases' }, { value: 'reorders', label: 'Reorders' }, { value: 'support', label: 'Support' },
  { value: 'complaints', label: 'Complaints' }, { value: 'csat', label: 'Satisfaction' }, { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'calls', label: 'AI Calls' }, { value: 'campaigns', label: 'Campaigns' }, { value: 'referrals', label: 'Referrals' },
];

export default function ReportsPage() {
  const d = useDemoData();
  const [tab, setTab] = useState('revenue');
  const [rangeKey, setRangeKey] = useState<RangeKey>('90d');
  const range = useMemo(() => resolveRange(rangeKey), [rangeKey]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink-900">Reports &amp; Analytics</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">A deeper look at every part of the business.</p>
        </div>
        <Select value={rangeKey} onChange={(v) => setRangeKey(v as RangeKey)} className="w-40" options={RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))} />
      </div>

      <Card>
        <Tabs items={TABS} value={tab} onChange={setTab} className="px-4" />
        <div className="p-4">
          {tab === 'revenue' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Revenue Trend" subtitle={range.label}><TrendChart data={revenueTrend(d, range)} formatter={formatCompactINR} /></ChartCard>
              <ChartCard title="Revenue by Product Category"><DonutChart data={ordersByCategory(d, range)} centerLabel="Revenue" /></ChartCard>
            </div>
          )}
          {tab === 'sales' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Sales Trend" subtitle="Value of deals won"><TrendChart data={salesTrend(d, range)} color="#2f6fe4" formatter={formatCompactINR} /></ChartCard>
              <ChartCard title="Deals by Stage"><BarChartCard data={Object.entries(d.deals.reduce((m: Record<string, number>, x) => ((m[x.stage] = (m[x.stage] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} multiColor horizontal /></ChartCard>
            </div>
          )}
          {tab === 'leads' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Lead Funnel"><BarChartCard data={leadFunnel(d)} horizontal color="#7c3aed" /></ChartCard>
              <ChartCard title="Leads by Source"><DonutChart data={LEAD_SOURCES.map((s) => ({ label: s, value: d.leads.filter((l) => l.source === s).length })).filter((x) => x.value > 0)} centerLabel="Leads" /></ChartCard>
            </div>
          )}
          {tab === 'orders' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Orders by Status"><BarChartCard data={Object.entries(d.orders.reduce((m: Record<string, number>, o) => ((m[o.status] = (m[o.status] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} multiColor horizontal /></ChartCard>
              <ChartCard title="Orders by City"><BarChartCard data={geographicDistribution(d).map(({ label, value: c }) => ({ label, value: d.orders.filter((o) => d.customers.find((cu) => cu.id === o.customerId)?.city === label).length }))} horizontal color="#2f6fe4" /></ChartCard>
            </div>
          )}
          {tab === 'products' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Units Sold by Product" subtitle="All time">
                <BarChartCard horizontal multiColor height={320} data={d.products.map((p) => ({ label: p.name, value: d.orders.filter((o) => o.status !== 'Cancelled').flatMap((o) => o.items).filter((i) => i.sku === p.sku).reduce((s, i) => s + i.quantity, 0) })).sort((a, b) => b.value - a.value)} />
              </ChartCard>
              <ChartCard title="Revenue Share by Category"><DonutChart data={ordersByCategory(d, resolveRange('12m'))} centerLabel="12 months" /></ChartCard>
            </div>
          )}
          {tab === 'customers' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Customer Growth" subtitle={range.label}><TrendChart data={customerGrowth(d, range)} color="#1fa35a" formatter={(v) => `${v}`} /></ChartCard>
              <ChartCard title="Customers by Health"><DonutChart data={HEALTH_STATES.map((h) => ({ label: h, value: d.customers.filter((c) => c.health === h).length }))} centerLabel="Customers" /></ChartCard>
              <ChartCard title="Customers by Type"><BarChartCard data={CUSTOMER_TYPES.map((t) => ({ label: t, value: d.customers.filter((c) => c.customerType === t).length }))} horizontal color="#7c3aed" /></ChartCard>
              <ChartCard title="Customers by City"><BarChartCard data={geographicDistribution(d)} horizontal multiColor /></ChartCard>
            </div>
          )}
          {tab === 'repeat' && <ChartCard title="Repeat Purchase Rate" subtitle={`${range.label} — share of buyers with 2+ orders`}><TrendChart data={repeatPurchaseTrend(d, range)} color="#7c3aed" formatter={(v) => `${v}%`} /></ChartCard>}
          {tab === 'reorders' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Reorder Opportunities by Week"><BarChartCard data={reorderOpportunityTrend(d)} color="#f5a30b" /></ChartCard>
              <ChartCard title="Recommended Actions"><DonutChart data={Object.entries(d.reorderOpportunities.reduce((m: Record<string, number>, r) => ((m[r.recommendedAction] = (m[r.recommendedAction] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Opportunities" /></ChartCard>
            </div>
          )}
          {tab === 'support' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Tickets by Category"><BarChartCard data={TICKET_CATEGORIES.map((c) => ({ label: c, value: d.tickets.filter((t) => t.category === c).length })).filter((x) => x.value > 0)} horizontal multiColor height={300} /></ChartCard>
              <ChartCard title="Tickets by Status"><DonutChart data={Object.entries(d.tickets.reduce((m: Record<string, number>, t) => ((m[t.status] = (m[t.status] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Tickets" /></ChartCard>
            </div>
          )}
          {tab === 'complaints' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Complaint Trend" subtitle={range.label}><TrendChart data={complaintTrend(d, range)} color="#dc2626" /></ChartCard>
              <ChartCard title="Complaints by Category"><BarChartCard data={Object.entries(d.complaints.reduce((m: Record<string, number>, c) => ((m[c.category] = (m[c.category] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} horizontal multiColor height={300} /></ChartCard>
            </div>
          )}
          {tab === 'csat' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Customer Satisfaction Trend" subtitle="Average rating out of 5"><TrendChart data={csatTrend(d, range).map((p) => ({ label: p.label, value: p.value === null ? null : p.value / 20 }))} color="#e5333b" formatter={(v) => v.toFixed(1)} /></ChartCard>
              <ChartCard title="Feedback Rating Distribution"><BarChartCard data={[1, 2, 3, 4, 5].map((r) => ({ label: `${r}★`, value: d.feedback.filter((f) => f.rating === r).length }))} color="#f5a30b" /></ChartCard>
            </div>
          )}
          {tab === 'whatsapp' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Conversations by Intent"><DonutChart data={Object.entries(d.conversations.reduce((m: Record<string, number>, c) => ((m[c.intent] = (m[c.intent] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Conversations" /></ChartCard>
              <ChartCard title="AI vs Human Handling"><BarChartCard data={[{ label: 'AI', value: d.conversations.filter((c) => c.handler === 'AI').length }, { label: 'Human', value: d.conversations.filter((c) => c.handler === 'Human').length }]} multiColor /></ChartCard>
            </div>
          )}
          {tab === 'calls' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Calls by Type"><BarChartCard data={Object.entries(d.calls.reduce((m: Record<string, number>, c) => ((m[c.callType] = (m[c.callType] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} horizontal multiColor height={300} /></ChartCard>
              <ChartCard title="Call Outcomes by Status"><DonutChart data={Object.entries(d.calls.reduce((m: Record<string, number>, c) => ((m[c.status] = (m[c.status] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Calls" /></ChartCard>
            </div>
          )}
          {tab === 'campaigns' && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Revenue by Campaign"><BarChartCard data={d.campaigns.filter((c) => c.revenue > 0).map((c) => ({ label: c.name, value: c.revenue })).sort((a, b) => b.value - a.value)} horizontal color="#e5333b" formatter={formatCompactINR} height={280} /></ChartCard>
              <ChartCard title="Sent by Channel"><DonutChart data={Object.entries(d.campaigns.reduce((m: Record<string, number>, c) => ((m[c.channel] = (m[c.channel] ?? 0) + c.sent), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Sent" /></ChartCard>
            </div>
          )}
          {tab === 'referrals' && (
            <ChartCard title="Referral Status Breakdown"><DonutChart data={Object.entries(d.referrals.reduce((m: Record<string, number>, r) => ((m[r.status] = (m[r.status] ?? 0) + 1), m), {})).map(([label, value]) => ({ label, value }))} centerLabel="Referrals" /></ChartCard>
          )}
        </div>
      </Card>
    </div>
  );
}
