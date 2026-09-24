import { DAY, DEMO_TODAY, atDaysAhead, daysSince } from '@/lib/format';
import { createRng } from '@/lib/random';
import type { Customer, Order, SuccessJourney, SuccessStage } from '@/types';
import { SUCCESS_STAGES } from '@/types';

const NOW = DEMO_TODAY.getTime();

const STAGE_FOR_DAY: { upTo: number; stage: SuccessStage; nextAction: string }[] = [
  { upTo: 1, stage: 'Welcome', nextAction: 'Send the welcome message and product guide' },
  { upTo: 3, stage: 'Product Guide', nextAction: 'Confirm the guide was received and understood' },
  { upTo: 7, stage: 'Training', nextAction: 'Share the training video for the products ordered' },
  { upTo: 12, stage: 'Usage Check', nextAction: 'Check in on the first few uses' },
  { upTo: 18, stage: 'Feedback', nextAction: 'Request a 1 to 5 rating' },
  { upTo: 25, stage: 'Review', nextAction: 'Ask for a public review if the rating was positive' },
  { upTo: 34, stage: 'Reorder', nextAction: 'Send a reorder reminder' },
  { upTo: 44, stage: 'Upsell', nextAction: 'Suggest the Premium shampoo upgrade' },
  { upTo: 60, stage: 'Cross-sell', nextAction: 'Suggest a complementary product' },
];

export function generateSuccessJourneys(customers: Customer[], orders: Order[]): SuccessJourney[] {
  const rng = createRng(6767);
  const latestDelivered = new Map<string, Order>();
  for (const o of orders) {
    if (!(o.status === 'Delivered' || o.status === 'Completed') || !o.deliveredAt) continue;
    if ((NOW - new Date(o.deliveredAt).getTime()) / DAY > 60) continue;
    const prev = latestDelivered.get(o.customerId);
    if (!prev || new Date(o.deliveredAt!).getTime() > new Date(prev.deliveredAt!).getTime()) latestDelivered.set(o.customerId, o);
  }

  const out: SuccessJourney[] = [];
  for (const [customerId, order] of latestDelivered) {
    const age = daysSince(order.deliveredAt!);
    const row = STAGE_FOR_DAY.find((r) => age <= r.upTo) ?? STAGE_FOR_DAY[STAGE_FOR_DAY.length - 1];
    const stageSince = new Date(new Date(order.deliveredAt!).getTime() + (STAGE_FOR_DAY.find((r) => r.stage === row.stage)!.upTo - 3) * DAY * 0).toISOString();
    const needsAttention = age > row.upTo - 1 && rng.chance(0.35);
    out.push({
      id: `SJ-${out.length + 1}`,
      customerId,
      orderId: order.id,
      stage: row.stage,
      stageSince: order.deliveredAt!,
      nextAction: row.nextAction,
      nextActionAt: atDaysAhead(rng.int(0, 2)),
      needsAttention,
      attentionReason: needsAttention ? `No response yet at the ${row.stage} step (${Math.round(age)} days since delivery).` : '',
    });
  }
  return out;
}

export { SUCCESS_STAGES };
