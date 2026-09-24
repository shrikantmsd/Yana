import type { CustomerType, Product, StockStatus } from '@/types';

export function displayName(p: Pick<Product, 'name' | 'packSize' | 'unit'>): string {
  return `${p.name} ${p.packSize} ${p.unit}`;
}

export function stockStatus(p: Pick<Product, 'stock' | 'reorderLevel'>): StockStatus {
  if (p.stock <= 0) return 'Out of Stock';
  if (p.stock <= p.reorderLevel * 0.5) return 'Critical';
  if (p.stock <= p.reorderLevel) return 'Low Stock';
  return 'In Stock';
}

/** Which price list a customer type buys from. */
export function priceFor(type: CustomerType, p: Pick<Product, 'dealerPrice' | 'distributorPrice'>): number {
  if (type === 'Distributor') return p.distributorPrice;
  if (type === 'Fleet Customer' || type === 'Corporate Customer') return Math.round(p.dealerPrice * 1.08);
  return p.dealerPrice;
}
