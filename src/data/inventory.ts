import { DAY, DEMO_TODAY, atDaysAgo, atDaysAhead } from '@/lib/format';
import { stockStatus } from '@/lib/product';
import { createRng } from '@/lib/random';
import type { Order, Product } from '@/types';

/** How many months of sales each product has in the warehouse (0 = sold out). Creates a realistic mix of stock statuses. */
const COVER: Record<string, number> = {
  'YM-CWS-1L': 2.4,
  'YM-CWS-5L': 1.6,
  'YM-TYP-500': 0.85,
  'YM-DBP-250': 0.4,
  'YM-GLC-500': 0,
  'YM-INC-500': 1.3,
  'YM-EXC-500': 1.1,
  'YM-PDS-1L': 0.9,
  'YM-WRC-500': 3.6,
  'YM-MFT-3': 2.9,
};

/** Works out sales speed from real (demo) orders, then sets stock levels from it. */
export function applyInventory(products: Product[], orders: Order[]): Product[] {
  const rng = createRng(99);
  const cutoff = DEMO_TODAY.getTime() - 90 * DAY;
  const units: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === 'Cancelled' || new Date(o.orderedAt).getTime() < cutoff) continue;
    for (const it of o.items) units[it.sku] = (units[it.sku] ?? 0) + it.quantity;
  }
  return products.map((p) => {
    const velocity = Math.round((units[p.sku] ?? 0) / 3);
    const reorderLevel = Math.max(24, velocity);
    const stock = Math.round(velocity * (COVER[p.sku] ?? 1.5));
    const next: Product = { ...p, monthlyVelocity: velocity, reorderLevel, stock };
    const status = stockStatus(next);
    next.expectedReplenishmentAt =
      status === 'In Stock' ? atDaysAhead(rng.int(20, 40)) : status === 'Low Stock' ? atDaysAhead(rng.int(6, 10)) : atDaysAhead(rng.int(3, 6));
    next.lastMovement =
      status === 'In Stock' && rng.chance(0.5)
        ? { at: atDaysAgo(rng.int(3, 9), 14), type: 'Inbound', qty: Math.round(velocity * 0.8) }
        : { at: atDaysAgo(rng.int(0, 2), 16), type: 'Dispatch', qty: Math.max(6, Math.round(velocity / 8)) };
    return next;
  });
}
