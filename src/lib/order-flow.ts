import type { DeliveryStatus, DispatchStatus, Order, OrderStatus, TimelineEvent } from '@/types';
import { DEMO_TODAY } from './format';

export const ORDER_FLOW: OrderStatus[] = [
  'New',
  'Confirmed',
  'Processing',
  'Packed',
  'Dispatched',
  'Out for Delivery',
  'Delivered',
  'Completed',
];

/** Position of a status on the happy path (-1 = cancelled). */
export function flowIndex(s: OrderStatus): number {
  if (s === 'Cancelled') return -1;
  if (s === 'Payment Pending') return 1;
  return ORDER_FLOW.indexOf(s);
}

export function derivedStatuses(s: OrderStatus): { dispatchStatus: DispatchStatus; deliveryStatus: DeliveryStatus } {
  switch (s) {
    case 'Packed':
      return { dispatchStatus: 'Ready to Dispatch', deliveryStatus: 'Pending' };
    case 'Dispatched':
      return { dispatchStatus: 'Dispatched', deliveryStatus: 'In Transit' };
    case 'Out for Delivery':
      return { dispatchStatus: 'Dispatched', deliveryStatus: 'Out for Delivery' };
    case 'Delivered':
    case 'Completed':
      return { dispatchStatus: 'Dispatched', deliveryStatus: 'Delivered' };
    case 'Cancelled':
      return { dispatchStatus: 'Cancelled', deliveryStatus: 'Cancelled' };
    default:
      return { dispatchStatus: 'Not Dispatched', deliveryStatus: 'Pending' };
  }
}

const STEPS: { status: OrderStatus; title: string; hours: number }[] = [
  { status: 'New', title: 'Order placed', hours: 0 },
  { status: 'Confirmed', title: 'Order confirmed', hours: 2 },
  { status: 'Processing', title: 'Processing started', hours: 20 },
  { status: 'Packed', title: 'Packed and ready to dispatch', hours: 44 },
  { status: 'Dispatched', title: 'Dispatched from warehouse', hours: 52 },
  { status: 'Out for Delivery', title: 'Out for delivery', hours: 100 },
  { status: 'Delivered', title: 'Delivered to customer', hours: 120 },
  { status: 'Completed', title: 'Order completed', hours: 240 },
];

/** Builds the order history from the order's current status. */
export function buildOrderTimeline(
  o: Pick<Order, 'id' | 'orderedAt' | 'status' | 'trackingId'>,
  nowMs: number = DEMO_TODAY.getTime(),
): TimelineEvent[] {
  const start = new Date(o.orderedAt).getTime();
  const at = (hours: number) => new Date(Math.min(start + hours * 3_600_000, nowMs)).toISOString();
  const events: TimelineEvent[] = [];

  if (o.status === 'Cancelled') {
    events.push({ id: `${o.id}-t0`, at: o.orderedAt, kind: 'order', title: 'Order placed' });
    events.push({ id: `${o.id}-t1`, at: at(6), kind: 'order', title: 'Order cancelled', description: 'Cancelled before dispatch.' });
    return events;
  }

  const upTo = flowIndex(o.status);
  STEPS.forEach((step, i) => {
    if (i > upTo) return;
    let description: string | undefined;
    if (step.status === 'Dispatched' && o.trackingId) description = `Tracking ID ${o.trackingId}`;
    events.push({ id: `${o.id}-t${i}`, at: at(step.hours), kind: 'order', title: step.title, description });
  });
  if (o.status === 'Payment Pending') {
    events.push({ id: `${o.id}-tp`, at: at(3), kind: 'order', title: 'Waiting for payment', description: 'Processing starts once payment is received.' });
  }
  return events;
}

/** Order value before GST (what we treat as "revenue"). */
export const orderNet = (o: Pick<Order, 'subtotal' | 'discount'>) => o.subtotal - o.discount;
