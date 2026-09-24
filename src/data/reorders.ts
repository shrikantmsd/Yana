import { DAY, DEMO_TODAY, atDaysAgo, daysSince } from '@/lib/format';
import { displayName } from '@/lib/product';
import { createRng } from '@/lib/random';
import type { Customer, Order, Product, ReorderAction, ReorderOpportunity } from '@/types';

const NOW = DEMO_TODAY.getTime();

/** Looks at repeat purchases of the same product by the same customer and predicts the next order. */
export function generateReorderOpportunities(customers: Customer[], orders: Order[], products: Product[]): ReorderOpportunity[] {
  const rng = createRng(2323);
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const byPair = new Map<string, { customerId: string; sku: string; dates: number[]; qtys: number[] }>();

  for (const o of orders) {
    if (o.status === 'Cancelled') continue;
    for (const item of o.items) {
      const key = `${o.customerId}__${item.sku}`;
      const entry = byPair.get(key) ?? { customerId: o.customerId, sku: item.sku, dates: [], qtys: [] };
      entry.dates.push(new Date(o.orderedAt).getTime());
      entry.qtys.push(item.quantity);
      byPair.set(key, entry);
    }
  }

  const out: ReorderOpportunity[] = [];
  for (const { customerId, sku, dates, qtys } of byPair.values()) {
    if (dates.length < 2) continue;
    dates.sort((a, b) => a - b);
    const gaps = dates.slice(1).map((d, i) => (d - dates[i]) / DAY);
    const avgCycleDays = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
    if (avgCycleDays < 10) continue;
    const lastOrderAt = new Date(dates[dates.length - 1]).toISOString();
    const daysSinceLast = daysSince(lastOrderAt);
    const expectedReorderAt = new Date(dates[dates.length - 1] + avgCycleDays * DAY).toISOString();
    const daysPastExpected = daysSinceLast - avgCycleDays;
    // How likely a reorder is right now: peaks just after the expected date, fades if very overdue (may have churned or switched supplier).
    let probability = 82 - Math.abs(daysPastExpected) * 1.6;
    if (daysPastExpected > 20) probability -= (daysPastExpected - 20) * 1.1;
    probability = Math.max(8, Math.min(95, Math.round(probability + rng.between(-4, 4))));
    const avgQty = Math.round(qtys.reduce((s, q) => s + q, 0) / qtys.length);
    const previousQty = qtys[qtys.length - 1];
    const product = bySku.get(sku);
    if (!product || daysSinceLast < avgCycleDays * 0.45) continue;

    let recommendedAction: ReorderAction = 'WhatsApp Reminder';
    if (daysPastExpected > 12) recommendedAction = 'Call Customer';
    else if (daysPastExpected > 25) recommendedAction = 'Assign Salesperson';
    else if (probability > 80) recommendedAction = 'Reorder Same';

    const acted = rng.chance(0.22);
    out.push({
      id: `RO-${out.length + 1}`,
      customerId,
      companyId: customers.find((c) => c.id === customerId)!.companyId,
      sku,
      productName: displayName(product),
      lastOrderAt,
      previousQty,
      avgQty,
      avgCycleDays,
      expectedReorderAt,
      probability,
      recommendedAction,
      actionTaken: acted ? rng.pick<ReorderAction>(['WhatsApp Reminder', 'Call Customer']) : null,
      actionTakenAt: acted ? atDaysAgo(rng.int(0, 2)) : null,
      estimatedValue: Math.round((avgQty * previousQty ? avgQty : avgQty) * 0), // placeholder replaced below
    });
  }

  // fill in estimated value using unit price from most recent matching order line
  for (const ro of out) {
    const order = [...orders].reverse().find((o) => o.customerId === ro.customerId && o.items.some((i) => i.sku === ro.sku));
    const line = order?.items.find((i) => i.sku === ro.sku);
    ro.estimatedValue = line ? Math.round(line.unitPrice * ro.avgQty * 1.03) : 0;
  }

  return out.sort((a, b) => b.probability - a.probability).slice(0, 60);
}
