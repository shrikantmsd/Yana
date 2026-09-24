import { DAY, DEMO_TODAY, addDays, atDaysAgo, daysSince } from '@/lib/format';
import { buildOrderTimeline, derivedStatuses } from '@/lib/order-flow';
import { displayName, priceFor } from '@/lib/product';
import { createRng, type Rng } from '@/lib/random';
import type { Customer, CustomerType, Order, OrderItem, OrderStatus, PaymentStatus, Product } from '@/types';

interface Line {
  sku: string;
  qty: [number, number];
}
interface Pattern {
  cycle: [number, number];
  basket: Line[];
}

/** How each type of customer typically buys: how often, and what. */
const PATTERNS: Record<CustomerType, Pattern> = {
  Distributor: {
    cycle: [26, 38],
    basket: [
      { sku: 'YM-CWS-5L', qty: [24, 60] }, { sku: 'YM-TYP-500', qty: [60, 144] }, { sku: 'YM-DBP-250', qty: [48, 120] },
      { sku: 'YM-GLC-500', qty: [60, 144] }, { sku: 'YM-INC-500', qty: [48, 96] }, { sku: 'YM-EXC-500', qty: [36, 96] }, { sku: 'YM-PDS-1L', qty: [24, 48] },
    ],
  },
  Dealer: {
    cycle: [30, 44],
    basket: [
      { sku: 'YM-CWS-5L', qty: [8, 18] }, { sku: 'YM-CWS-1L', qty: [24, 60] }, { sku: 'YM-TYP-500', qty: [24, 48] },
      { sku: 'YM-DBP-250', qty: [24, 48] }, { sku: 'YM-GLC-500', qty: [24, 48] },
    ],
  },
  Retailer: {
    cycle: [34, 52],
    basket: [
      { sku: 'YM-CWS-1L', qty: [12, 36] }, { sku: 'YM-TYP-500', qty: [12, 24] }, { sku: 'YM-DBP-250', qty: [12, 24] },
      { sku: 'YM-GLC-500', qty: [12, 24] }, { sku: 'YM-MFT-3', qty: [12, 24] },
    ],
  },
  'Professional Detailer': {
    cycle: [28, 42],
    basket: [
      { sku: 'YM-PDS-1L', qty: [6, 18] }, { sku: 'YM-CWS-5L', qty: [2, 6] }, { sku: 'YM-INC-500', qty: [6, 18] }, { sku: 'YM-EXC-500', qty: [6, 18] },
      { sku: 'YM-WRC-500', qty: [6, 12] }, { sku: 'YM-TYP-500', qty: [6, 12] }, { sku: 'YM-MFT-3', qty: [6, 18] },
    ],
  },
  'Car Wash': {
    cycle: [22, 34],
    basket: [{ sku: 'YM-CWS-5L', qty: [6, 14] }, { sku: 'YM-TYP-500', qty: [6, 12] }, { sku: 'YM-GLC-500', qty: [6, 12] }, { sku: 'YM-EXC-500', qty: [4, 10] }],
  },
  Workshop: {
    cycle: [40, 60],
    basket: [{ sku: 'YM-CWS-5L', qty: [2, 6] }, { sku: 'YM-GLC-500', qty: [6, 12] }, { sku: 'YM-INC-500', qty: [6, 12] }, { sku: 'YM-DBP-250', qty: [6, 12] }],
  },
  'Fleet Customer': {
    cycle: [34, 48],
    basket: [{ sku: 'YM-CWS-5L', qty: [4, 10] }, { sku: 'YM-GLC-500', qty: [12, 24] }, { sku: 'YM-INC-500', qty: [12, 24] }, { sku: 'YM-DBP-250', qty: [12, 24] }],
  },
  'Corporate Customer': {
    cycle: [55, 80],
    basket: [{ sku: 'YM-CWS-5L', qty: [2, 5] }, { sku: 'YM-GLC-500', qty: [6, 12] }, { sku: 'YM-INC-500', qty: [6, 12] }],
  },
};

const STEP: Partial<Record<CustomerType, number>> = { Distributor: 12, Dealer: 6 };

function pickStatus(age: number, rng: Rng): OrderStatus {
  if (age > 1.2 && rng.chance(0.025)) return 'Cancelled';
  if (age < 0.6) return 'New';
  if (age < 1.5) return rng.pick<OrderStatus>(['Confirmed', 'Payment Pending']);
  if (age < 3) return rng.pick<OrderStatus>(['Processing', 'Packed', 'Payment Pending']);
  if (age < 4.5) return rng.pick<OrderStatus>(['Packed', 'Dispatched']);
  if (age < 6.5) return rng.pick<OrderStatus>(['Dispatched', 'Out for Delivery']);
  if (age < 14) return 'Delivered';
  return rng.chance(0.85) ? 'Completed' : 'Delivered';
}

function pickPayment(status: OrderStatus, age: number, type: CustomerType, rng: Rng): PaymentStatus {
  if (status === 'Cancelled') return rng.chance(0.4) ? 'Refunded' : 'Pending';
  if (status === 'Payment Pending') return 'Pending';
  const credit = ['Distributor', 'Dealer', 'Corporate Customer', 'Fleet Customer'].includes(type);
  if (age > 45) return credit && rng.chance(0.1) ? 'Overdue' : 'Paid';
  if (age > 20) return credit ? rng.weighted<PaymentStatus>([['Paid', 60], ['Partially Paid', 20], ['Overdue', 20]]) : 'Paid';
  if (age > 4) return credit ? rng.weighted<PaymentStatus>([['Paid', 45], ['Pending', 35], ['Partially Paid', 20]]) : rng.weighted<PaymentStatus>([['Paid', 85], ['Pending', 15]]);
  return rng.weighted<PaymentStatus>([['Paid', 40], ['Pending', 60]]);
}

interface RawOrder {
  customer: Customer;
  orderedAt: string;
  lines: { sku: string; qty: number; discountPct: number }[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  age: number;
  notes: string;
}

const NOTES = ['Deliver before 5 pm.', 'Call on arrival at the gate.', 'Include invoice copy with the parcel.', 'Festive season stock, please prioritise.'];

export function generateOrders(customers: Customer[], products: Product[], stopByCompany: Record<string, number>): Order[] {
  const rng = createRng(4242);
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const raw: RawOrder[] = [];
  const seenBuyers = new Map<string, number>();
  let customerIndex = 0;

  for (const c of customers) {
    customerIndex += 1;
    const pattern = PATTERNS[c.customerType];
    const seen = seenBuyers.get(c.companyId) ?? 0;
    seenBuyers.set(c.companyId, seen + 1);
    const secondary = seen > 0;
    const cycle = rng.int(pattern.cycle[0], pattern.cycle[1]) * (secondary ? 1.6 : 1);
    const joinedAgo = daysSince(c.customerSince);
    const stop = stopByCompany[c.companyId];
    // every third customer ordered in the last few days, so the "recent orders" list shows every stage
    const recent = stop === undefined && customerIndex % 3 === 0;
    const lastAgo = stop !== undefined ? stop + rng.int(0, 4) : recent ? rng.int(0, 6) : rng.int(1, Math.min(55, Math.round(cycle * 0.85)));
    let firstAgo = Math.min(360 - rng.int(0, 12), joinedAgo - rng.int(2, 7));
    if (firstAgo < lastAgo) firstAgo = lastAgo;

    let ago = lastAgo;
    let guard = 0;
    while (ago <= firstAgo && guard++ < 40) {
      const orderedAt = atDaysAgo(Math.floor(ago), Math.floor(ago) === 0 ? rng.int(7, 9) : rng.int(9, 18), rng.int(0, 59));
      // business grows over the year: older orders are a little smaller
      const growth = 0.72 + 0.56 * (1 - Math.min(ago, 360) / 360);
      const age = daysSince(orderedAt);
      let picked = pattern.basket.filter(() => rng.chance(0.72));
      if (picked.length === 0) picked = [rng.pick(pattern.basket)];
      picked = picked.slice(0, 5);
      const step = STEP[c.customerType] ?? 1;
      const lines = picked.map((l) => {
        const qty = Math.max(step, Math.round((rng.int(l.qty[0], l.qty[1]) * growth) / step) * step);
        const discountPct = c.customerType === 'Distributor' ? rng.pick([3, 5, 5, 8]) : rng.weighted<number>([[0, 45], [2, 20], [3, 15], [5, 15], [8, 5]]);
        return { sku: l.sku, qty, discountPct };
      });
      const status = pickStatus(age, rng);
      raw.push({
        customer: c,
        orderedAt,
        lines,
        status,
        paymentStatus: pickPayment(status, age, c.customerType, rng),
        age,
        notes: rng.chance(0.08) ? rng.pick(NOTES) : '',
      });
      ago += cycle * rng.between(0.8, 1.2);
    }
  }

  raw.sort((a, b) => new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime());

  return raw.map((r, i) => {
    const id = `ORD-${1001 + i}`;
    const c = r.customer;
    const items: OrderItem[] = r.lines.map((l, idx) => {
      const p = bySku.get(l.sku)!;
      const unitPrice = priceFor(c.customerType, p);
      const gross = l.qty * unitPrice;
      const discount = Math.round((gross * l.discountPct) / 100);
      const net = gross - discount;
      const tax = Math.round((net * p.gstRate) / 100);
      return {
        id: `${id}-L${idx + 1}`,
        sku: p.sku,
        productName: displayName(p),
        quantity: l.qty,
        unitPrice,
        discountPct: l.discountPct,
        taxRate: p.gstRate,
        gross,
        discount,
        tax,
        lineTotal: net + tax,
      };
    });
    const dispatched = ['Dispatched', 'Out for Delivery', 'Delivered', 'Completed'].includes(r.status);
    const delivered = r.status === 'Delivered' || r.status === 'Completed';
    const trackingId = dispatched ? `YMT${rng.int(100000, 999999)}` : null;
    const deliveredAt = delivered ? new Date(Math.min(new Date(addDays(r.orderedAt, rng.between(3.4, 5.6))).getTime(), DEMO_TODAY.getTime() - DAY / 4)).toISOString() : null;
    const base = {
      id,
      customerId: c.id,
      companyId: c.companyId,
      orderedAt: r.orderedAt,
      items,
      subtotal: items.reduce((s, x) => s + x.gross, 0),
      discount: items.reduce((s, x) => s + x.discount, 0),
      tax: items.reduce((s, x) => s + x.tax, 0),
      total: items.reduce((s, x) => s + x.lineTotal, 0),
      paymentStatus: r.paymentStatus,
      status: r.status,
      ...derivedStatuses(r.status),
      salespersonId: c.accountOwnerId,
      expectedDeliveryAt: r.status === 'Cancelled' ? null : addDays(r.orderedAt, 4.5),
      deliveredAt,
      trackingId,
      notes: r.notes,
    };
    return { ...base, timeline: buildOrderTimeline(base) };
  });
}
