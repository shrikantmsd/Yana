import { DAY, DEMO_TODAY, addDays, atDaysAgo } from '@/lib/format';
import { createRng, type Rng } from '@/lib/random';
import type {
  Complaint, ComplaintCategory, ComplaintStage, Customer, Feedback, Order, Priority, Product, Severity, Ticket, TicketCategory, TicketStatus, TimelineEvent,
} from '@/types';
import { COMPLAINT_STAGES } from '@/types';
import { SUPPORT_TEAM, TEAM } from './team';

const NOW = DEMO_TODAY.getTime();
const iso = (ms: number) => new Date(Math.min(ms, NOW)).toISOString();
const ownerName = (id: string) => TEAM.find((t) => t.id === id)?.name ?? 'the team';

/* ------------------------------------------------------------------ tickets */

const TICKET_POOL: Record<TicketCategory, { issue: string; resolution: string }[]> = {
  'Product Information': [
    { issue: 'Asked for the safe dilution ratio of {p} for foam cannon use.', resolution: 'Shared the dilution chart and datasheet on WhatsApp.' },
    { issue: 'Wants the safety data sheet for {p}.', resolution: 'Sent the latest safety data sheet and usage guide.' },
    { issue: 'Asked whether {p} is safe on ceramic-coated paint.', resolution: 'Confirmed it is coating-safe and shared application tips.' },
  ],
  'Product Usage': [
    { issue: 'Unsure how much {p} to use per wash.', resolution: 'Explained the dosage and shared the training video.' },
    { issue: 'Asked how long to leave {p} on the surface.', resolution: 'Advised the dwell time and rinse steps.' },
  ],
  'Application Guidance': [
    { issue: 'Wants a full wash, decontaminate and protect routine for SUVs.', resolution: 'Shared the recommended step-by-step routine.' },
    { issue: 'Needs guidance on using {p} on matte finishes.', resolution: 'Advised a spot test and shared matte-safe steps.' },
  ],
  'Order Status': [
    { issue: 'Asking for the dispatch status of the latest order.', resolution: 'Shared the tracking link and expected delivery date.' },
    { issue: 'Tracking ID is not showing any updates.', resolution: 'Checked with the courier and shared a refreshed tracking link.' },
  ],
  Delivery: [
    { issue: 'Delivery is delayed beyond the promised date.', resolution: 'Escalated to the courier and delivered the next day.' },
    { issue: 'Only part of the order was delivered.', resolution: 'Dispatched the pending cartons by express courier.' },
  ],
  Payment: [
    { issue: 'Payment link expired before the customer could pay.', resolution: 'Generated a fresh payment link and confirmed receipt.' },
    { issue: 'Needs a credit note for a returned carton.', resolution: 'Credit note issued and shared by email.' },
  ],
  Availability: [
    { issue: '{p} is showing out of stock. Asked for the restock date.', resolution: 'Shared the expected restock date and reserved units.' },
    { issue: 'Needs 200 units of {p} urgently.', resolution: 'Allocated stock from the next batch and confirmed the date.' },
  ],
  'Dealer Support': [
    { issue: 'Requested a point-of-sale display stand.', resolution: 'Display stand approved and dispatched.' },
    { issue: 'Asked about the dealer margin scheme for the festive season.', resolution: 'Shared the scheme sheet and discount slabs.' },
  ],
  'Technical Support': [
    { issue: 'Foam is not forming well with hard water using {p}.', resolution: 'Advised a higher dosage and a softer water rinse.' },
    { issue: 'Streaks visible after using {p} on tinted glass.', resolution: 'Advised a two-cloth method and shared a video.' },
  ],
  'Human Assistance': [
    { issue: 'Customer asked to speak to a person about bulk pricing.', resolution: 'Sales head called back and agreed a bulk price.' },
    { issue: 'Wants to discuss a change to the payment terms.', resolution: 'Account owner reviewed and shared updated terms.' },
  ],
};

const SLA_HOURS: Record<Priority, number> = { Urgent: 4, High: 8, Medium: 24, Low: 48 };

function ticketStatus(age: number, rng: Rng): TicketStatus {
  if (age < 1) return rng.weighted<TicketStatus>([['New', 45], ['Acknowledged', 35], ['In Progress', 20]]);
  if (age < 4) return rng.weighted<TicketStatus>([['Acknowledged', 15], ['In Progress', 35], ['Waiting Customer', 20], ['Resolved', 30]]);
  if (age < 10) return rng.weighted<TicketStatus>([['Waiting Customer', 6], ['Resolved', 44], ['Closed', 50]]);
  return rng.chance(0.9) ? 'Closed' : 'Resolved';
}

export function generateTickets(customers: Customer[], orders: Order[], products: Product[]): Ticket[] {
  const rng = createRng(77);
  const raw: Omit<Ticket, 'id'>[] = [];
  const categories: [TicketCategory, number][] = [
    ['Product Information', 12], ['Product Usage', 14], ['Application Guidance', 8], ['Order Status', 18], ['Delivery', 10],
    ['Payment', 9], ['Availability', 9], ['Dealer Support', 6], ['Technical Support', 9], ['Human Assistance', 5],
  ];

  for (let i = 0; i < 64; i++) {
    const age = i < 14 ? rng.between(0.05, 9) : rng.between(10, 340);
    const createdMs = NOW - age * DAY;
    const customer = rng.pick(customers);
    const theirOrders = orders.filter((o) => o.customerId === customer.id && new Date(o.orderedAt).getTime() < createdMs);
    const order = theirOrders.length ? theirOrders[theirOrders.length - 1] : null;
    const item = order ? rng.pick(order.items) : null;
    const product = products.find((p) => p.sku === item?.sku) ?? rng.pick(products);
    const category = rng.weighted(categories);
    const template = rng.pick(TICKET_POOL[category]);
    const priority = category === 'Human Assistance' ? rng.pick<Priority>(['Medium', 'High']) : rng.weighted<Priority>([['Low', 25], ['Medium', 45], ['High', 22], ['Urgent', 8]]);
    const status = ticketStatus(age, rng);
    const sla = SLA_HOURS[priority];
    const done = status === 'Resolved' || status === 'Closed';
    const resolvedMs = createdMs + rng.between(0.4, 1.35) * sla * 3_600_000;
    const closedMs = resolvedMs + rng.between(1, 3) * DAY;
    const assignedTo = category === 'Technical Support' && rng.chance(0.4) ? 'tm-10' : rng.pick(SUPPORT_TEAM).id;
    const channel = rng.weighted<Ticket['channel']>([['WhatsApp', 70], ['AI Voice', 10], ['Phone', 10], ['Email', 10]]);

    raw.push({
      customerId: customer.id,
      companyId: customer.companyId,
      sku: ['Payment', 'Human Assistance', 'Order Status', 'Delivery'].includes(category) && rng.chance(0.6) ? null : product.sku,
      orderId: order?.id ?? null,
      category,
      issue: template.issue.replace('{p}', product.name),
      priority,
      status,
      assignedTo,
      channel,
      createdAt: iso(createdMs),
      slaDueAt: new Date(createdMs + sla * 3_600_000).toISOString(),
      resolvedAt: done ? iso(resolvedMs) : null,
      closedAt: status === 'Closed' ? iso(closedMs) : null,
      resolution: done ? template.resolution : '',
      activity: [],
    });
  }

  raw.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return raw.map((t, i) => {
    const id = `TKT-${3001 + i}`;
    const events: TimelineEvent[] = [
      { id: `${id}-e1`, at: t.createdAt, kind: 'support', title: `Ticket created from ${t.channel}` },
      { id: `${id}-e2`, at: iso(new Date(t.createdAt).getTime() + 5 * 60_000), kind: 'support', title: `Assigned to ${ownerName(t.assignedTo)}` },
    ];
    if (t.status !== 'New') events.push({ id: `${id}-e3`, at: iso(new Date(t.createdAt).getTime() + 22 * 60_000), kind: 'support', title: 'Acknowledged and customer informed' });
    if (t.resolvedAt) events.push({ id: `${id}-e4`, at: t.resolvedAt, kind: 'support', title: 'Marked as resolved', description: t.resolution });
    if (t.closedAt) events.push({ id: `${id}-e5`, at: t.closedAt, kind: 'support', title: 'Ticket closed' });
    return { ...t, id, activity: events };
  });
}

/* --------------------------------------------------------------- complaints */

interface ComplaintSeed {
  company: string;
  sku: string;
  category: ComplaintCategory;
  severity: Severity;
  stage: ComplaintStage;
  ago: number;
  batch: string;
  description: string;
  evidence: [string, 'Photo' | 'Video' | 'Document'][];
  rootCause?: string;
  corrective?: string;
  preventive?: string;
  resolution?: string;
  confirmation?: Complaint['customerConfirmation'];
  assignedTo: string;
}

const OPEN: ComplaintSeed[] = [
  {
    company: 'CMP-107', sku: 'YM-CWS-5L', category: 'Packaging / Leakage', severity: 'High', stage: 'Human Review', ago: 2, batch: 'B2608-C05', assignedTo: 'tm-10',
    description: 'Two of the six 5 L cans in the last consignment arrived with cracked caps. Shampoo leaked inside the carton and damaged the labels on the other cans.',
    evidence: [['Leak stain on carton', 'Photo'], ['Cracked cap close-up', 'Photo']],
    rootCause: 'Cap torque was below specification on one filling line, and the carton drop test was not repeated for this batch.',
    corrective: 'Replace the affected cans and re-pack the consignment. Batch B2608-C05 is on hold for a torque check.',
    preventive: 'Check cap torque every 30 minutes on Line 2 and repeat the carton drop test for every batch.',
  },
  {
    company: 'CMP-101', sku: 'YM-TYP-500', category: 'Product Quality', severity: 'High', stage: 'Investigation', ago: 3, batch: 'B2607-T11', assignedTo: 'tm-10',
    description: 'Tyre polish separated into two layers with sediment at the bottom in three bottles. Shaking does not fully mix it.',
    evidence: [['Separated bottle', 'Photo'], ['Batch label', 'Photo'], ['Clip showing sediment', 'Video']],
  },
  {
    company: 'CMP-105', sku: 'YM-GLC-500', category: 'Performance / Efficacy', severity: 'Medium', stage: 'Classification', ago: 1, batch: 'B2608-G03', assignedTo: 'tm-07',
    description: 'Glass cleaner leaves faint streaks on tinted rear glass even after buffing with a clean microfiber cloth.',
    evidence: [['Streaks on rear glass', 'Photo']],
  },
  {
    company: 'CMP-109', sku: 'YM-DBP-250', category: 'Wrong Product', severity: 'Low', stage: 'Resolution', ago: 5, batch: 'B2608-D09', assignedTo: 'tm-08',
    description: 'A carton labelled Dashboard Polish contained 12 bottles of Interior Cleaner.',
    evidence: [['Carton label', 'Photo'], ['Bottles received', 'Photo']],
    rootCause: 'Picking error: cartons for two similar orders were labelled on the same shelf.',
    corrective: 'Correct stock sent by express courier. Wrong bottles to be collected on the same trip.',
    preventive: 'Scan each carton against the order before sealing.',
    resolution: 'Replacement of 12 Dashboard Polish bottles shipped.',
    confirmation: 'Pending',
  },
  {
    company: 'CMP-102', sku: 'YM-EXC-500', category: 'Product Quality', severity: 'Critical', stage: 'Human Review', ago: 1, batch: 'B2608-E07', assignedTo: 'tm-10',
    description: 'Exterior cleaner left visible staining on the black bonnet of a client car during a detailing job. The studio says it was used as directed.',
    evidence: [['Stain on bonnet', 'Photo'], ['Bottle and label', 'Photo'], ['Application video', 'Video']],
  },
  {
    company: 'CMP-104', sku: 'YM-PDS-1L', category: 'Performance / Efficacy', severity: 'Medium', stage: 'Customer Confirmation', ago: 9, batch: 'B2607-P02', assignedTo: 'tm-10',
    description: 'Premium detailing shampoo produces less foam than the previous batch at the 1:80 foam cannon dilution.',
    evidence: [['Foam comparison', 'Photo']],
    rootCause: 'Surfactant level on the low side of tolerance for this batch.',
    corrective: 'Advised a 1:60 dilution and sent a replacement litre from batch B2608-P04.',
    preventive: 'Tighten the in-process foam height limits for this product.',
    resolution: 'Replacement litre delivered. Customer is testing the new dilution.',
    confirmation: 'Pending',
  },
  {
    company: 'CMP-106', sku: 'YM-CWS-5L', category: 'Delivery Delay', severity: 'Medium', stage: 'CSAT', ago: 12, batch: '—', assignedTo: 'tm-08',
    description: 'The order arrived 6 days after the promised date, leaving the wash bay without stock for two days.',
    evidence: [['Delivery challan', 'Document']],
    rootCause: 'Courier hub backlog in Chennai during the festive period.',
    corrective: 'Expedited the next consignment through a different courier.',
    preventive: 'Add a second courier option for Chennai and send proactive delay alerts.',
    resolution: 'Credit note of ₹2,500 issued and a guaranteed delivery slot for the next order.',
    confirmation: 'Confirmed',
  },
  {
    company: 'CMP-115', sku: 'YM-CWS-5L', category: 'Billing', severity: 'Low', stage: 'Classification', ago: 2, batch: '—', assignedTo: 'tm-07',
    description: 'GST on the latest invoice was charged at 28% instead of 18%.',
    evidence: [['Invoice copy', 'Document']],
  },
];

const CLOSED_POOL: Record<ComplaintCategory, { d: string; rc: string; ca: string; pa: string; res: string }> = {
  'Product Quality': { d: '{p} looked thinner than usual and performed below expectation.', rc: 'Batch viscosity at the low end of tolerance.', ca: 'Replaced the affected units.', pa: 'Added a viscosity check at filling.', res: 'Replacement dispatched and confirmed working.' },
  'Packaging / Leakage': { d: 'Bottles of {p} arrived with loose caps and minor leakage.', rc: 'Cap seal not fully tightened on a filling shift.', ca: 'Replaced leaking bottles at no cost.', pa: 'Introduced a cap torque check every hour.', res: 'Replacement stock delivered.' },
  'Wrong Product': { d: 'Received the wrong pack size of {p}.', rc: 'Pick-list confusion between two pack sizes.', ca: 'Sent the correct pack size and collected the wrong one.', pa: 'Added pack-size barcodes to the pick list.', res: 'Correct stock delivered.' },
  'Short Quantity': { d: 'One carton of {p} was missing from the consignment.', rc: 'Carton count was not reconciled at dispatch.', ca: 'Sent the missing carton by express courier.', pa: 'Carton count check added at the dispatch bay.', res: 'Missing carton delivered.' },
  'Damaged in Transit': { d: 'Two cartons of {p} were crushed in transit.', rc: 'Insufficient outer packing for a long route.', ca: 'Replaced the damaged cartons.', pa: 'Double-wall cartons for long routes.', res: 'Replacement delivered and courier notified.' },
  'Performance / Efficacy': { d: '{p} did not clean as well as the previous batch.', rc: 'Active content near the lower limit for this batch.', ca: 'Replaced stock and shared application guidance.', pa: 'Tighter in-process checks on active content.', res: 'Customer confirmed the replacement worked.' },
  'Fragrance / Appearance': { d: 'The fragrance and colour of {p} differed from earlier orders.', rc: 'Fragrance supplier lot change.', ca: 'Explained the change and replaced one carton.', pa: 'Fragrance lot approvals before use.', res: 'Customer accepted the replacement.' },
  'Delivery Delay': { d: 'Delivery of {p} arrived four days late.', rc: 'Courier capacity shortage.', ca: 'Expedited the next order.', pa: 'Added a backup courier.', res: 'Delay acknowledged and a credit issued.' },
  Billing: { d: 'Invoice for {p} showed the wrong discount.', rc: 'Old price list applied in billing.', ca: 'Issued a corrected invoice.', pa: 'Price lists are locked per month.', res: 'Corrected invoice shared.' },
};

const batchFor = (sku: string, orderedAt: string, rng: Rng) =>
  `B${orderedAt.slice(2, 4)}${orderedAt.slice(5, 7)}-${sku.split('-')[1][0]}${String(rng.int(1, 12)).padStart(2, '0')}`;

function findOrder(orders: Order[], customerId: string, sku: string, beforeMs: number): Order | undefined {
  const mine = orders.filter((o) => o.customerId === customerId && new Date(o.orderedAt).getTime() < beforeMs && o.status !== 'Cancelled');
  return [...mine].reverse().find((o) => o.items.some((i) => i.sku === sku)) ?? mine[mine.length - 1];
}

export function generateComplaints(customers: Customer[], orders: Order[], products: Product[]): Complaint[] {
  const rng = createRng(505);
  const raw: Omit<Complaint, 'id' | 'activity'>[] = [];
  const pName = (sku: string) => products.find((p) => p.sku === sku)?.name ?? 'the product';

  for (const s of OPEN) {
    const customer = customers.find((c) => c.companyId === s.company)!;
    const createdMs = NOW - s.ago * DAY - rng.int(0, 8) * 3_600_000;
    const order = findOrder(orders, customer.id, s.sku, createdMs);
    if (!order) continue;
    raw.push({
      customerId: customer.id, companyId: customer.companyId, orderId: order.id, sku: s.sku, batch: s.batch, category: s.category,
      description: s.description,
      evidence: s.evidence.map(([label, kind], i) => ({ id: `ev-${raw.length}-${i}`, label, kind })),
      severity: s.severity, assignedTo: s.assignedTo, stage: s.stage,
      rootCause: s.rootCause ?? '', correctiveAction: s.corrective ?? '', preventiveAction: s.preventive ?? '', resolution: s.resolution ?? '',
      customerConfirmation: s.confirmation ?? (s.stage === 'Customer Confirmation' || s.stage === 'CSAT' ? 'Pending' : 'Pending'),
      csat: null, createdAt: iso(createdMs), closedAt: null,
    });
  }

  const eligible = orders.filter((o) => (o.status === 'Delivered' || o.status === 'Completed') && (NOW - new Date(o.orderedAt).getTime()) / DAY > 25);
  const cats: [ComplaintCategory, number][] = [
    ['Product Quality', 14], ['Packaging / Leakage', 18], ['Wrong Product', 9], ['Short Quantity', 9], ['Damaged in Transit', 12],
    ['Performance / Efficacy', 14], ['Fragrance / Appearance', 6], ['Delivery Delay', 12], ['Billing', 6],
  ];
  for (let i = 0; i < 16; i++) {
    const order = rng.pick(eligible);
    const item = rng.pick(order.items);
    const category = rng.weighted(cats);
    const t = CLOSED_POOL[category];
    const createdMs = new Date(order.orderedAt).getTime() + rng.between(6, 15) * DAY;
    const severity = rng.weighted<Severity>([['Low', 40], ['Medium', 40], ['High', 17], ['Critical', 3]]);
    raw.push({
      customerId: order.customerId, companyId: order.companyId, orderId: order.id, sku: item.sku, batch: batchFor(item.sku, order.orderedAt, rng), category,
      description: t.d.replace('{p}', pName(item.sku)),
      evidence: rng.chance(0.6) ? [{ id: `ev-c${i}`, label: 'Photo from customer', kind: 'Photo' }] : [],
      severity, assignedTo: rng.pick(['tm-10', 'tm-07', 'tm-08']), stage: 'Closed',
      rootCause: t.rc, correctiveAction: t.ca, preventiveAction: t.pa, resolution: t.res, customerConfirmation: 'Confirmed',
      csat: rng.weighted<number>([[5, 45], [4, 35], [3, 15], [2, 5]]), createdAt: iso(createdMs), closedAt: iso(createdMs + rng.between(3, 12) * DAY),
    });
  }

  raw.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return raw.map((c, i) => {
    const id = `CMPL-${5001 + i}`;
    const upTo = COMPLAINT_STAGES.indexOf(c.stage);
    const end = c.closedAt ? new Date(c.closedAt).getTime() : NOW;
    const start = new Date(c.createdAt).getTime();
    const titles = [
      'Complaint received on WhatsApp',
      'AI intake collected photos, batch number and order details',
      `Classified as ${c.category}, severity ${c.severity}`,
      `Investigation started by ${ownerName(c.assignedTo)}`,
      `Reviewed by ${ownerName(c.assignedTo)}`,
      'Resolution agreed and actioned',
      'Customer asked to confirm the fix',
      'CSAT survey sent',
      c.csat ? `Closed with CSAT ${c.csat}/5` : 'Complaint closed',
    ];
    const activity: TimelineEvent[] = titles
      .slice(0, upTo + 1)
      .map((title, k) => ({ id: `${id}-e${k + 1}`, at: iso(start + ((end - start) * k) / Math.max(1, upTo + 1)), kind: 'complaint' as const, title }));
    return { ...c, id, activity };
  });
}

/* ----------------------------------------------------------------- feedback */

const COMMENTS: Record<number, string[]> = {
  5: ['Great foam and the bay smells fresh. Will reorder soon.', 'Very consistent quality. Clients noticed the finish.', 'Fast delivery and helpful team.', 'Best shampoo we have used for the price.'],
  4: ['Good product. A bigger pack of polish would help.', 'Works well. Packaging could be sturdier.', 'Happy overall. Would like more training videos.'],
  3: ['Average results on tinted glass. Need better guidance.', 'Delivery was a day late but the product is fine.'],
  2: ['Shampoo foamed less than the last batch.'],
  1: ['Bottle leaked in the carton.'],
};

export function generateFeedback(orders: Order[]): Feedback[] {
  const rng = createRng(909);
  const out: Feedback[] = [];
  for (const o of orders) {
    const age = (NOW - new Date(o.orderedAt).getTime()) / DAY;
    if (!(o.status === 'Delivered' || o.status === 'Completed') || age < 8 || age > 340 || !rng.chance(0.28)) continue;
    const rating = rng.weighted<number>([[5, 45], [4, 35], [3, 12], [2, 5], [1, 3]]);
    out.push({
      id: `FB-${7001 + out.length}`,
      customerId: o.customerId,
      orderId: o.id,
      rating,
      comment: rng.pick(COMMENTS[rating]),
      channel: rng.weighted<Feedback['channel']>([['WhatsApp', 70], ['AI Voice', 15], ['Email', 15]]),
      at: iso(new Date(addDays(o.orderedAt, rng.between(7, 9))).getTime()),
    });
  }
  return out;
}

export { atDaysAgo };
