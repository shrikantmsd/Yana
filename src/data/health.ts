import { daysSince } from '@/lib/format';
import { orderNet } from '@/lib/order-flow';
import type { Company, Customer, CustomerHealth, Order } from '@/types';

function healthFor(orders: Order[], since: string, highValueCutoff: number): CustomerHealth {
  const live = orders.filter((o) => o.status !== 'Cancelled');
  if (live.length === 0) return 'New';
  const last = live[live.length - 1];
  const gap = daysSince(last.orderedAt);
  const revenue = live.reduce((s, o) => s + orderNet(o), 0);
  if (gap > 110) return 'Dormant';
  if (gap > 60) return 'At Risk';
  if (daysSince(since) <= 75) return 'New';
  if (revenue >= highValueCutoff) return 'High Value';
  return 'Active';
}

/** Sets each customer's and company's health label from how recently and how much they buy. */
export function assignHealth(customers: Customer[], companies: Company[], orders: Order[]) {
  const byCustomer = new Map<string, Order[]>();
  const byCompany = new Map<string, Order[]>();
  for (const o of orders) {
    (byCustomer.get(o.customerId) ?? byCustomer.set(o.customerId, []).get(o.customerId)!).push(o);
    (byCompany.get(o.companyId) ?? byCompany.set(o.companyId, []).get(o.companyId)!).push(o);
  }
  const cutoff = (groups: Map<string, Order[]>) => {
    const revs = [...groups.values()].map((os) => os.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + orderNet(o), 0)).sort((a, b) => a - b);
    return revs.length ? revs[Math.floor(revs.length * 0.75)] : Infinity;
  };
  const custCut = cutoff(byCustomer);
  const compCut = cutoff(byCompany);
  return {
    customers: customers.map((c) => ({ ...c, health: healthFor(byCustomer.get(c.id) ?? [], c.customerSince, custCut) })),
    companies: companies.map((c) => ({ ...c, health: healthFor(byCompany.get(c.id) ?? [], c.since, compCut) })),
  };
}
