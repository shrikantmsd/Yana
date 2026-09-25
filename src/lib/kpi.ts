import type { DemoData } from '@/data';
import { orderNet } from './order-flow';
import { stockStatus } from './product';
import { makeBuckets, sumByBucket, type Bucket } from './timeseries';
import { daysSince, daysUntil } from './format';
import { CITY_REGION, CITIES } from '@/types';
import type { ResolvedRange } from './ranges';

const t = (iso: string) => new Date(iso).getTime();

export function series(buckets: Bucket[], values: number[]) {
  return buckets.map((b, i) => ({ label: b.label, value: values[i] }));
}

export function dashboardKpis(d: DemoData, range: ResolvedRange) {
  const inRange = (iso: string) => t(iso) >= range.from && t(iso) <= range.to;
  const inPrev = (iso: string) => t(iso) >= range.prevFrom && t(iso) < range.prevTo;
  const liveOrders = d.orders.filter((o) => o.status !== 'Cancelled');
  const curOrders = liveOrders.filter((o) => inRange(o.orderedAt));
  const prevOrders = liveOrders.filter((o) => inPrev(o.orderedAt));
  const revenue = curOrders.reduce((s, o) => s + orderNet(o), 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + orderNet(o), 0);

  const curCustomerIds = new Set(curOrders.map((o) => o.customerId));
  const repeatCustomers = [...curCustomerIds].filter((id) => liveOrders.filter((o) => o.customerId === id && t(o.orderedAt) < range.to).length > 1);
  const repeatRate = curCustomerIds.size ? Math.round((repeatCustomers.length / curCustomerIds.size) * 100) : 0;

  const curLeads = d.leads.filter((l) => inRange(l.createdAt));
  const wonLeads = curLeads.filter((l) => l.stage === 'Won').length;
  const closedLeads = curLeads.filter((l) => l.stage === 'Won' || l.stage === 'Lost').length;

  const openTickets = d.tickets.filter((tk) => tk.status !== 'Resolved' && tk.status !== 'Closed').length;
  const openComplaints = d.complaints.filter((c) => c.stage !== 'Closed').length;
  const expectedReorders = d.reorderOpportunities.filter((r) => daysUntil(r.expectedReorderAt) <= 14 && daysUntil(r.expectedReorderAt) >= -14).length;
  const activeDealers = new Set(d.companies.filter((c) => c.customerType === 'Dealer' && c.health !== 'Dormant').map((c) => c.id)).size;

  return {
    totalCustomers: d.customers.length,
    activeDealers,
    totalLeads: curLeads.length,
    orders: curOrders.length,
    revenue,
    revenueDelta: prevRevenue ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0,
    repeatPurchaseRate: repeatRate,
    openSupportTickets: openTickets,
    openComplaints,
    expectedReorders,
    salesConversionRate: closedLeads ? Math.round((wonLeads / closedLeads) * 100) : 0,
  };
}

export function revenueTrend(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  const live = d.orders.filter((o) => o.status !== 'Cancelled');
  return series(buckets, sumByBucket(live, buckets, (o) => t(o.orderedAt), (o) => orderNet(o)));
}

export function salesTrend(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  return series(buckets, sumByBucket(d.deals.filter((x) => x.stage === 'Won'), buckets, (x) => t(x.expectedCloseAt), (x) => x.value));
}

const FUNNEL_STAGES = ['New', 'Contacted', 'Engaged', 'Qualified', 'Proposal', 'Negotiation', 'Won'] as const;
export function leadFunnel(d: DemoData) {
  const rank = new Map(FUNNEL_STAGES.map((s, i) => [s, i]));
  return FUNNEL_STAGES.map((stage) => ({
    label: stage,
    value: d.leads.filter((l) => l.stage !== 'Lost' && (rank.get(l.stage) ?? -1) >= rank.get(stage)!).length,
  }));
}

export function ordersByCategory(d: DemoData, range: ResolvedRange) {
  const bySku = new Map(d.products.map((p) => [p.sku, p.category]));
  const totals = new Map<string, number>();
  for (const o of d.orders) {
    if (o.status === 'Cancelled' || t(o.orderedAt) < range.from || t(o.orderedAt) > range.to) continue;
    for (const it of o.items) {
      const cat = bySku.get(it.sku) ?? 'Other';
      totals.set(cat, (totals.get(cat) ?? 0) + it.lineTotal);
    }
  }
  return [...totals.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function customerGrowth(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  const counts = sumByBucket(d.customers, buckets, (c) => t(c.customerSince));
  let running = d.customers.filter((c) => t(c.customerSince) < buckets[0]?.start).length;
  return buckets.map((b, i) => ({ label: b.label, value: (running += counts[i]) }));
}

export function repeatPurchaseTrend(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  const live = d.orders.filter((o) => o.status !== 'Cancelled');
  return buckets.map((b) => {
    const inB = live.filter((o) => t(o.orderedAt) >= b.start && t(o.orderedAt) < b.end);
    const ids = new Set(inB.map((o) => o.customerId));
    const repeat = [...ids].filter((id) => live.filter((o) => o.customerId === id && t(o.orderedAt) < b.end).length > 1);
    return { label: b.label, value: ids.size ? Math.round((repeat.length / ids.size) * 100) : 0 };
  });
}

export function reorderOpportunityTrend(d: DemoData) {
  const buckets: { label: string; value: number }[] = [];
  for (let w = 0; w < 6; w++) {
    const from = w * 7 - 7;
    const to = w * 7;
    buckets.push({ label: w === 0 ? 'Overdue' : `Week ${w}`, value: d.reorderOpportunities.filter((r) => daysUntil(r.expectedReorderAt) > from && daysUntil(r.expectedReorderAt) <= to).length });
  }
  return buckets;
}

export function complaintTrend(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  return series(buckets, sumByBucket(d.complaints, buckets, (c) => t(c.createdAt)));
}

export function csatTrend(d: DemoData, range: ResolvedRange) {
  const buckets = makeBuckets(range.from, range.to);
  return buckets.map((b) => {
    const rated = d.feedback.filter((f) => t(f.at) >= b.start && t(f.at) < b.end);
    return { label: b.label, value: rated.length ? Math.round((rated.reduce((s, f) => s + f.rating, 0) / rated.length) * 20) : null };
  });
}

export function geographicDistribution(d: DemoData) {
  return CITIES.map((city) => ({ label: city, value: d.customers.filter((c) => c.city === city).length, region: CITY_REGION[city] }));
}

export function inventorySummary(d: Pick<DemoData, 'products'>) {
  const statuses = d.products.map(stockStatus);
  return {
    totalSkus: d.products.length,
    totalStock: d.products.reduce((s, p) => s + p.stock, 0),
    lowStock: statuses.filter((s) => s === 'Low Stock').length,
    outOfStock: statuses.filter((s) => s === 'Out of Stock').length,
    fastMoving: [...d.products].sort((a, b) => b.monthlyVelocity - a.monthlyVelocity).slice(0, 5),
    slowMoving: [...d.products].sort((a, b) => a.monthlyVelocity - b.monthlyVelocity).slice(0, 5),
  };
}

export function highValueCustomers(d: DemoData, limit = 8) {
  const revenueByCustomer = new Map<string, number>();
  for (const o of d.orders) {
    if (o.status === 'Cancelled') continue;
    revenueByCustomer.set(o.customerId, (revenueByCustomer.get(o.customerId) ?? 0) + orderNet(o));
  }
  return [...revenueByCustomer.entries()]
    .map(([customerId, revenue]) => ({ customer: d.customers.find((c) => c.id === customerId)!, revenue }))
    .filter((x) => x.customer)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function customerLifetimeStats(d: Pick<DemoData, 'orders'>, customerId: string) {
  const orders = d.orders.filter((o) => o.customerId === customerId && o.status !== 'Cancelled').sort((a, b) => t(a.orderedAt) - t(b.orderedAt));
  const revenue = orders.reduce((s, o) => s + orderNet(o), 0);
  const skuQty = new Map<string, { name: string; qty: number }>();
  for (const o of orders) for (const it of o.items) skuQty.set(it.sku, { name: it.productName, qty: (skuQty.get(it.sku)?.qty ?? 0) + it.quantity });
  const topProducts = [...skuQty.values()].sort((a, b) => b.qty - a.qty).slice(0, 3);
  const gaps = orders.slice(1).map((o, i) => daysSince(orders[i].orderedAt) - daysSince(o.orderedAt));
  const avgCycle = gaps.length ? Math.round(gaps.reduce((s, g) => s + Math.abs(g), 0) / gaps.length) : null;
  const last = orders[orders.length - 1];
  return {
    lifetimeRevenue: revenue,
    totalOrders: orders.length,
    avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
    lastOrderAt: last?.orderedAt ?? null,
    purchaseFrequencyDays: avgCycle,
    expectedNextReorderAt: last && avgCycle ? new Date(t(last.orderedAt) + avgCycle * 86_400_000).toISOString() : null,
    topProducts,
  };
}

/**
 * Counts (or sums) items by a key, for simple "breakdown by X" charts.
 * Pulled out of report components so the UI layer only says *what* to
 * group by, not *how* to group it — keeps the counting logic in one
 * place, ready to become a SQL "group by" once there's a real database.
 */
export function countBy<T>(items: readonly T[], keyOf: (item: T) => string): { label: string; value: number }[] {
  const m = new Map<string, number>();
  for (const item of items) {
    const k = keyOf(item);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, value]) => ({ label, value }));
}

export function sumBy<T>(items: readonly T[], keyOf: (item: T) => string, valueOf: (item: T) => number): { label: string; value: number }[] {
  const m = new Map<string, number>();
  for (const item of items) {
    const k = keyOf(item);
    m.set(k, (m.get(k) ?? 0) + valueOf(item));
  }
  return [...m.entries()].map(([label, value]) => ({ label, value }));
}

export interface CompanySummary {
  revenue: number;
  orderCount: number;
  lastOrderAt: string | null;
  openTickets: number;
  openComplaints: number;
}

/** Per-company rollup used by the Companies list — one place, instead of inline in the page. */
export function companySummaries(d: Pick<DemoData, 'companies' | 'orders' | 'tickets' | 'complaints'>): Map<string, CompanySummary> {
  return new Map(d.companies.map((c) => {
    const os = d.orders.filter((o) => o.companyId === c.id && o.status !== 'Cancelled');
    return [c.id, {
      revenue: os.reduce((s, o) => s + orderNet(o), 0),
      orderCount: os.length,
      lastOrderAt: os.length ? os.reduce((a, b) => (+new Date(a.orderedAt) > +new Date(b.orderedAt) ? a : b)).orderedAt : null,
      openTickets: d.tickets.filter((t) => t.companyId === c.id && t.status !== 'Resolved' && t.status !== 'Closed').length,
      openComplaints: d.complaints.filter((x) => x.companyId === c.id && x.stage !== 'Closed').length,
    }];
  }));
}
