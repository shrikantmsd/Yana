import type { DemoData } from '@/data';
import type { TimelineEvent } from '@/types';

export function buildCustomerActivity(customerId: string, d: DemoData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  for (const o of d.orders.filter((x) => x.customerId === customerId)) events.push(...o.timeline.map((e) => ({ ...e, title: `Order ${o.id}: ${e.title}` })));
  for (const t of d.tickets.filter((x) => x.customerId === customerId)) events.push(...t.activity.map((e) => ({ ...e, title: `Ticket ${t.id}: ${e.title}` })));
  for (const c of d.complaints.filter((x) => x.customerId === customerId)) events.push(...c.activity.map((e) => ({ ...e, title: `Complaint ${c.id}: ${e.title}` })));
  for (const call of d.calls.filter((x) => x.customerId === customerId)) events.push({ id: `${call.id}-e`, at: call.calledAt, kind: 'call', title: `${call.callType} call (${call.status})`, description: call.outcome });
  for (const f of d.feedback.filter((x) => x.customerId === customerId)) events.push({ id: `${f.id}-e`, at: f.at, kind: 'feedback', title: `Feedback: ${f.rating}/5 via ${f.channel}`, description: f.comment });
  for (const conv of d.conversations.filter((x) => x.customerId === customerId)) {
    const first = conv.messages[0];
    if (first) events.push({ id: `${conv.id}-e`, at: first.at, kind: 'whatsapp', title: `WhatsApp: ${conv.intent}`, description: first.text });
  }
  for (const r of d.referrals.filter((x) => x.referrerId === customerId)) events.push({ id: `${r.id}-e`, at: r.referredAt, kind: 'referral', title: `Referred ${r.newLeadCompany}`, description: `Status: ${r.status}` });
  return events.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 60);
}

export interface JourneyStep { label: string; done: boolean }

/**
 * Labels for the Customer 360 lifecycle stepper.
 *
 * This is intentionally the THIRD, most granular of three separate lifecycle
 * lists in the codebase — each is correct for its own screen, not a
 * duplicate to be merged:
 *   1. LIFECYCLE_STAGES (types/common.ts)   — the 17-stage macro lifecycle
 *      shown as the strip on every module's page header.
 *   2. SUCCESS_STAGES (types/engagement.ts) — the 11-stage post-delivery
 *      journey used only by the Customer Success board.
 *   3. CUSTOMER_360_JOURNEY_STAGES (here)   — this 12-step per-customer
 *      timeline, used only on a single customer's own profile page.
 * If a fourth breakdown is ever needed, name and export it the same way
 * rather than inlining another ad-hoc array.
 */
export const CUSTOMER_360_JOURNEY_STAGES = [
  'Lead', 'Conversation', 'Qualified', 'Sale', 'Order', 'Dispatch',
  'Delivery', 'Usage Check', 'Feedback', 'Reorder', 'Upsell / Cross-sell', 'Referral',
] as const;

export function buildCustomerJourney(customerId: string, d: DemoData): JourneyStep[] {
  const orders = d.orders.filter((o) => o.customerId === customerId);
  const live = orders.filter((o) => o.status !== 'Cancelled');
  const hasConversation = d.conversations.some((c) => c.customerId === customerId) || d.calls.some((c) => c.customerId === customerId);
  const dispatched = live.some((o) => ['Dispatched', 'Out for Delivery', 'Delivered', 'Completed'].includes(o.status));
  const delivered = live.some((o) => o.status === 'Delivered' || o.status === 'Completed');
  const hasFeedback = d.feedback.some((f) => f.customerId === customerId) || d.successJourneys.some((s) => s.customerId === customerId && ['Feedback', 'Review', 'Reorder', 'Upsell', 'Cross-sell'].includes(s.stage));
  const reordered = live.length > 1;
  const upsold = d.growthOpportunities.some((g) => g.customerId === customerId && g.kind === 'Upsell');
  const crossSold = d.growthOpportunities.some((g) => g.customerId === customerId && g.kind === 'Cross-sell');
  const referred = d.referrals.some((r) => r.referrerId === customerId);

  const done: Record<(typeof CUSTOMER_360_JOURNEY_STAGES)[number], boolean> = {
    Lead: true,
    Conversation: hasConversation,
    Qualified: live.length > 0 || hasConversation,
    Sale: live.length > 0,
    Order: live.length > 0,
    Dispatch: dispatched,
    Delivery: delivered,
    'Usage Check': delivered,
    Feedback: hasFeedback,
    Reorder: reordered,
    'Upsell / Cross-sell': upsold || crossSold,
    Referral: referred,
  };
  return CUSTOMER_360_JOURNEY_STAGES.map((label) => ({ label, done: done[label] }));
}
