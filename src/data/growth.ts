import { createRng } from '@/lib/random';
import { priceFor } from '@/lib/product';
import type { Customer, GrowthOpportunity, GrowthStatus, Order, Product } from '@/types';

interface Rule {
  ifBought: string[];
  ifNotBought?: string[];
  suggestSku: string;
  kind: 'Upsell' | 'Cross-sell';
  reason: string;
  eligibleTypes?: Customer['customerType'][];
}

const RULES: Rule[] = [
  { ifBought: ['YM-CWS-1L', 'YM-CWS-5L'], ifNotBought: ['YM-TYP-500'], suggestSku: 'YM-TYP-500', kind: 'Cross-sell', reason: 'Buys shampoo regularly but has not added tyre polish to the order yet.' },
  { ifBought: ['YM-CWS-1L', 'YM-CWS-5L'], ifNotBought: ['YM-DBP-250'], suggestSku: 'YM-DBP-250', kind: 'Cross-sell', reason: 'Shampoo customer with no dashboard polish on record — a natural add-on for the same visit.' },
  { ifBought: ['YM-CWS-1L', 'YM-CWS-5L'], ifNotBought: ['YM-GLC-500'], suggestSku: 'YM-GLC-500', kind: 'Cross-sell', reason: 'Completes the core wash routine alongside the shampoo they already buy.' },
  { ifBought: ['YM-CWS-1L'], suggestSku: 'YM-PDS-1L', kind: 'Upsell', reason: 'Currently on the standard shampoo; the concentrated Premium formula gives more washes per litre and a better finish.', eligibleTypes: ['Professional Detailer', 'Car Wash'] },
  { ifBought: ['YM-PDS-1L'], ifNotBought: ['YM-WRC-500'], suggestSku: 'YM-WRC-500', kind: 'Cross-sell', reason: 'Detailing customers using the Premium shampoo typically pair it with the Wheel & Rim Cleaner.', eligibleTypes: ['Professional Detailer'] },
  { ifBought: ['YM-EXC-500', 'YM-INC-500'], ifNotBought: ['YM-MFT-3'], suggestSku: 'YM-MFT-3', kind: 'Cross-sell', reason: 'Uses cleaning products regularly but has not ordered dedicated microfiber towels.' },
  { ifBought: ['YM-CWS-5L'], suggestSku: 'YM-PDS-1L', kind: 'Upsell', reason: 'High-volume shampoo buyer — Premium concentrate can lower their cost per wash.', eligibleTypes: ['Distributor', 'Dealer'] },
];

const STATUS_WEIGHTS: [GrowthStatus, number][] = [['Suggested', 42], ['Contacted', 26], ['Interested', 16], ['Won', 10], ['Dismissed', 6]];

export function generateGrowthOpportunities(customers: Customer[], orders: Order[], products: Product[]): GrowthOpportunity[] {
  const rng = createRng(4545);
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const boughtByCustomer = new Map<string, Set<string>>();
  const lastNameBySku = new Map(products.map((p) => [p.sku, p.name]));
  for (const o of orders) {
    if (o.status === 'Cancelled') continue;
    const set = boughtByCustomer.get(o.customerId) ?? new Set<string>();
    o.items.forEach((i) => set.add(i.sku));
    boughtByCustomer.set(o.customerId, set);
  }

  const out: GrowthOpportunity[] = [];
  for (const c of customers) {
    const bought = boughtByCustomer.get(c.id);
    if (!bought || bought.size === 0) continue;
    for (const rule of RULES) {
      if (rule.eligibleTypes && !rule.eligibleTypes.includes(c.customerType)) continue;
      if (!rule.ifBought.some((sku) => bought.has(sku))) continue;
      if (rule.ifNotBought && rule.ifNotBought.some((sku) => bought.has(sku))) continue;
      if (bought.has(rule.suggestSku)) continue;
      if (!rng.chance(0.55)) continue;
      const product = bySku.get(rule.suggestSku)!;
      const qty = rng.int(6, 24);
      out.push({
        id: `GO-${out.length + 1}`,
        kind: rule.kind,
        customerId: c.id,
        companyId: c.companyId,
        currentProduct: [...bought].map((s) => lastNameBySku.get(s)).slice(0, 2).join(', '),
        recommendedProduct: product.name,
        recommendedSku: product.sku,
        reason: rule.reason,
        potentialRevenue: Math.round(priceFor(c.customerType, product) * qty),
        status: rng.weighted(STATUS_WEIGHTS),
      });
    }
  }
  return out;
}
