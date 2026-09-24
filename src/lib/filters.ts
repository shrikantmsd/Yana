import type { DemoData } from '@/data';
import type { DashboardFilters } from '@/components/dashboard/filter-bar';

/** Narrows the whole demo dataset down to what matches the dashboard's filter bar. */
export function applyDashboardFilters(d: DemoData, f: DashboardFilters): DemoData {
  let companies = d.companies;
  let customers = d.customers;
  if (f.city) { companies = companies.filter((c) => c.city === f.city); customers = customers.filter((c) => c.city === f.city); }
  if (f.customerType) { companies = companies.filter((c) => c.customerType === f.customerType); customers = customers.filter((c) => c.customerType === f.customerType); }
  if (f.salesperson) { companies = companies.filter((c) => c.accountOwnerId === f.salesperson); customers = customers.filter((c) => c.accountOwnerId === f.salesperson); }
  const customerIds = new Set(customers.map((c) => c.id));

  let orders = d.orders.filter((o) => customerIds.has(o.customerId));
  if (f.status) orders = orders.filter((o) => o.status === f.status);
  if (f.category) {
    const skuCat = new Map(d.products.map((p) => [p.sku, p.category]));
    orders = orders.filter((o) => o.items.some((it) => skuCat.get(it.sku) === f.category));
  }

  const leads = d.leads.filter((l) => (!f.city || l.city === f.city) && (!f.customerType || l.customerType === f.customerType) && (!f.salesperson || l.assignedTo === f.salesperson));
  const deals = d.deals.filter((x) => (!f.city || x.city === f.city) && (!f.salesperson || x.salespersonId === f.salesperson));
  const tickets = d.tickets.filter((t) => customerIds.has(t.customerId));
  const complaints = d.complaints.filter((c) => customerIds.has(c.customerId));
  const reorderOpportunities = d.reorderOpportunities.filter((r) => customerIds.has(r.customerId));
  const growthOpportunities = d.growthOpportunities.filter((g) => customerIds.has(g.customerId));
  const calls = d.calls.filter((c) => customerIds.has(c.customerId));
  const conversations = d.conversations.filter((c) => customerIds.has(c.customerId));
  const feedback = d.feedback.filter((fb) => customerIds.has(fb.customerId));

  return { ...d, companies, customers, orders, leads, deals, tickets, complaints, reorderOpportunities, growthOpportunities, calls, conversations, feedback };
}
