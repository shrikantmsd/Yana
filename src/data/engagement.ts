import { DAY, DEMO_TODAY, atDaysAgo, atDaysAhead } from '@/lib/format';
import { createRng } from '@/lib/random';
import type {
  Automation, Call, CallType, Campaign, CampaignInteraction, Conversation, Customer, Intent, Message, Referral, Task, WhatsAppTemplate,
} from '@/types';
import { AI_AGENTS, TEAM } from './team';

const NOW = DEMO_TODAY.getTime();
const buyerOf = (customers: Customer[], company: string) => customers.find((c) => c.companyId === company)!;

/* ------------------------------------------------------------ conversations */

type Line = ['c' | 'a' | 'h' | 's', string];
interface ConvoSeed {
  company: string;
  intent: Intent;
  handler: 'AI' | 'Human';
  status: Conversation['status'];
  next: string;
  unread: number;
  assignedTo: string | null;
  startedMinAgo: number;
  step?: number;
  lines: Line[];
}

const CONVOS: ConvoSeed[] = [
  {
    company: 'CMP-101', intent: 'Reorder', handler: 'AI', status: 'Open', next: 'Create the order once quantities are confirmed', unread: 1, assignedTo: null, startedMinAgo: 95,
    lines: [
      ['a', 'Hi Rakesh, this is Mitra from YANA MOTORS. Your last Premium Detailing Shampoo order was 32 days ago. Shall I repeat it?'],
      ['c', 'Yes, but make it 12 litres this time. Also add 6 wheel cleaners.'],
      ['a', 'Noted: 12 x Premium Detailing Shampoo 1 L and 6 x Wheel & Rim Cleaner 500 ml. Shall I create the order at your dealer rate?'],
      ['c', 'Yes please. Deliver by Friday.'],
    ],
  },
  {
    company: 'CMP-105', intent: 'Complaint', handler: 'Human', status: 'Escalated', next: 'Send a replacement and collect a sample for testing', unread: 2, assignedTo: 'tm-07', startedMinAgo: 240,
    lines: [
      ['c', 'The glass cleaner is leaving streaks on tinted glass.'],
      ['a', 'Sorry about that, Naveen. Could you send a photo and the batch number printed on the bottle?'],
      ['c', 'Batch B2608-G03. Photo sent.'],
      ['a', 'Thank you. I have logged a complaint and asked our quality team to review it.'],
      ['s', 'Conversation escalated to Sneha Patil'],
      ['h', 'Hi Naveen, Sneha here. We are sending a replacement bottle and will collect a sample for testing.'],
      ['c', 'Okay, please send it soon. We have three cars waiting.'],
    ],
  },
  {
    company: 'CMP-107', intent: 'Sales', handler: 'Human', status: 'Open', next: 'Share the festive scheme sheet and confirm stock', unread: 0, assignedTo: 'tm-03', startedMinAgo: 180, step: 9,
    lines: [
      ['c', 'Jignesh here. What are the festive season slabs for tyre polish and dashboard polish?'],
      ['h', 'Hi Jignesh, Rohan from YANA MOTORS. For 500+ units you get an extra 3% on your current rate. Sharing the scheme sheet now.'],
      ['c', 'Good. Please hold 600 units of each until Monday.'],
      ['h', 'Reserved. I will confirm the stock by tomorrow noon.'],
    ],
  },
  {
    company: 'CMP-102', intent: 'Support', handler: 'AI', status: 'Waiting Customer', next: 'Wait for the customer to report the foam result', unread: 0, assignedTo: null, startedMinAgo: 1500,
    lines: [
      ['c', 'How much Premium shampoo for a foam cannon? The foam looks thin.'],
      ['a', 'For a foam cannon, mix 1:80 (about 12 ml per litre). For thicker foam try 1:60 and use soft water if possible. Would you like the training video?'],
      ['c', 'Send the video.'],
      ['a', 'Here it is: Foam cannon set-up (6 min). Tell me how your next wash goes.'],
    ],
  },
  {
    company: 'CMP-109', intent: 'Feedback', handler: 'AI', status: 'Resolved', next: 'None', unread: 0, assignedTo: null, startedMinAgo: 2900,
    lines: [
      ['a', 'Hi Vijay, how was your last order of Car Wash Shampoo 5 L? Please rate us from 1 to 5.'],
      ['c', '5. Customers love it.'],
      ['a', 'Thank you! Would you like to refer another dealer or garage and earn a reward?'],
      ['c', 'Yes, my friend runs a garage in Baner.'],
    ],
  },
  {
    company: 'CMP-111', intent: 'Reorder', handler: 'Human', status: 'Open', next: 'Call to confirm the large festive reorder', unread: 1, assignedTo: 'tm-06', startedMinAgo: 60,
    lines: [
      ['h', 'Hi Mahesh, Kavita here. Your usual monthly order is due. Should I prepare it?'],
      ['c', 'Yes, but we want to increase the tyre polish and glass cleaner quantity by 40% for the festive rush.'],
    ],
  },
  {
    company: 'CMP-106', intent: 'Reorder', handler: 'AI', status: 'Waiting Customer', next: 'AI voice call scheduled if there is no reply by tomorrow', unread: 0, assignedTo: null, startedMinAgo: 2000, step: 600,
    lines: [
      ['a', 'Hi Suresh, it has been 68 days since your last order. Can we help with a reorder?'],
      ['a', 'Just checking in. Reply YES and we will prepare your usual 5 L cans.'],
      ['s', 'No reply after 2 messages. AI voice call queued.'],
    ],
  },
  {
    company: 'CMP-114', intent: 'Support', handler: 'AI', status: 'Resolved', next: 'None', unread: 0, assignedTo: null, startedMinAgo: 380,
    lines: [
      ['c', 'Where is our order?'],
      ['a', 'Your order is out for delivery and should reach you today by 5 pm. Tracking ID YMT482019.'],
      ['c', 'Thanks.'],
    ],
  },
  {
    company: 'CMP-118', intent: 'Sales', handler: 'Human', status: 'Open', next: 'Send a showroom display kit quotation', unread: 1, assignedTo: 'tm-01', startedMinAgo: 30,
    lines: [
      ['c', 'We want to display YANA products in our new showroom. What do you offer?'],
      ['h', 'Hi Tejas, Aarav here. We offer a display stand with 12 SKUs and a launch scheme. Can I send a quotation today?'],
      ['c', 'Yes, please include the dashboard and tyre polish.'],
    ],
  },
  {
    company: 'CMP-120', intent: 'General', handler: 'AI', status: 'Open', next: 'Share the starter product guide', unread: 1, assignedTo: null, startedMinAgo: 15,
    lines: [
      ['c', 'Hi, we are new. Which products should we start with for a 3-bay wash?'],
      ['a', 'Welcome! For a 3-bay wash we suggest the 5 L shampoo, tyre polish and glass cleaner. Want a starter quotation?'],
      ['c', 'Yes please.'],
    ],
  },
  {
    company: 'CMP-103', intent: 'Referral', handler: 'AI', status: 'Open', next: 'Contact the referred workshop', unread: 0, assignedTo: null, startedMinAgo: 3200,
    lines: [
      ['a', 'Thanks for the great feedback, Sandeep! Refer another workshop and earn a Rs 2,000 credit.'],
      ['c', 'Sure. Talk to my friend Harish at a garage in Okhla.'],
      ['a', 'Lovely. I will reach out to Harish and keep you posted.'],
    ],
  },
];

export function buildConversations(customers: Customer[]): Conversation[] {
  return CONVOS.map((s, i) => {
    const c = buyerOf(customers, s.company);
    const id = `CONV-${6001 + i}`;
    const step = s.step ?? 4;
    const start = NOW - s.startedMinAgo * 60_000;
    const messages: Message[] = s.lines.map(([who, text], k) => ({
      id: `${id}-m${k + 1}`,
      conversationId: id,
      sender: who === 'c' ? 'customer' : who === 'a' ? 'ai' : who === 'h' ? 'agent' : 'system',
      text,
      at: new Date(Math.min(NOW - 60_000, start + k * step * 60_000)).toISOString(),
      status: who === 'c' ? undefined : 'read',
    }));
    return { id, customerId: c.id, companyId: c.companyId, intent: s.intent, handler: s.handler, status: s.status, nextAction: s.next, unread: s.unread, assignedTo: s.assignedTo, messages };
  });
}

export const TEMPLATES: WhatsAppTemplate[] = [
  { id: 'TPL-01', name: 'lead_welcome', category: 'Service', language: 'English', status: 'Approved', usedBy: 'New Lead → WhatsApp Welcome', body: 'Hi {{1}}, thanks for your interest in YANA MOTORS car care products. I am {{2}} from the team. Can I share our catalogue and price list?' },
  { id: 'TPL-02', name: 'order_confirmed', category: 'Utility', language: 'English', status: 'Approved', usedBy: 'Order Confirmed → Customer Notification', body: 'Hi {{1}}, your order {{2}} worth {{3}} is confirmed. We will update you as soon as it is dispatched.' },
  { id: 'TPL-03', name: 'order_dispatched', category: 'Utility', language: 'English', status: 'Approved', usedBy: 'Order dispatch updates', body: 'Hi {{1}}, order {{2}} has been dispatched. Tracking ID {{3}}. Expected delivery {{4}}.' },
  { id: 'TPL-04', name: 'usage_guide', category: 'Service', language: 'English', status: 'Approved', usedBy: 'Order Delivered → Product Usage Guide', body: 'Your YANA order {{1}} has been delivered. Here is a two minute guide to get the best results: {{2}}' },
  { id: 'TPL-05', name: 'feedback_request', category: 'Service', language: 'English', status: 'Approved', usedBy: '7-Day Post Delivery → Feedback Request', body: 'Hi {{1}}, how did your last order work out? Reply with a number from 1 (poor) to 5 (excellent).' },
  { id: 'TPL-06', name: 'reorder_reminder', category: 'Marketing', language: 'English', status: 'Approved', usedBy: 'Reorder Due → WhatsApp Reminder', body: 'Hi {{1}}, based on your usual cycle you may be running low on {{2}}. Reply YES to reorder the same quantity.' },
  { id: 'TPL-07', name: 'referral_request', category: 'Marketing', language: 'English', status: 'Pending', usedBy: 'Positive Feedback → Referral Request', body: 'Hi {{1}}, glad you like YANA products! Refer a fellow detailer, garage or dealer and earn a reward of {{2}}.' },
  { id: 'TPL-08', name: 'reactivation_offer', category: 'Marketing', language: 'English', status: 'Rejected', usedBy: 'Dormant Customer → Reactivation Campaign', body: 'We miss you, {{1}}! Enjoy {{2}} off your next order this month.' },
];

/* -------------------------------------------------------------------- calls */

const CALL_AGENT: Record<CallType, string> = {
  'Sales Follow-up': AI_AGENTS.sales, Reorder: AI_AGENTS.sales, 'Dormant Customer Recovery': AI_AGENTS.sales, 'Dealer Follow-up': AI_AGENTS.sales,
  'Complaint Resolution': AI_AGENTS.support, 'Customer Feedback': AI_AGENTS.success,
};
const CALL_TRIGGER: Record<CallType, string> = {
  'Sales Follow-up': 'Quotation not answered for 3 days', Reorder: 'No reply after 2 WhatsApp reminders', 'Dormant Customer Recovery': 'No order for 90+ days',
  'Dealer Follow-up': 'Festive scheme launch', 'Complaint Resolution': 'High severity complaint', 'Customer Feedback': '7 days after delivery',
};
const SCRIPTS: Record<CallType, [string, string, string, string]> = {
  'Sales Follow-up': ['Hello {n}, this is {a} from YANA MOTORS, following up on the quotation we shared.', 'Yes, I saw it. Pricing looks fine, I need a few days.', 'Understood. Shall I note a follow-up for Thursday and send a sample kit meanwhile?', 'Sure, send the sample.'],
  Reorder: ['Hello {n}, this is {a} from YANA MOTORS. It looks like you may be running low on stock.', 'Yes, we were going to order this week.', 'I can create the order at your usual quantity. Shall I go ahead?', 'Yes, same as last time.'],
  'Dormant Customer Recovery': ['Hello {n}, this is {a} from YANA MOTORS. We have not heard from you in a while.', 'We still have stock from the last order.', 'Understood. Can our account owner check in next month with a festive offer?', 'That works, thanks.'],
  'Dealer Follow-up': ['Hello {n}, this is {a} from YANA MOTORS about the festive dealer scheme.', 'Yes, I got the sheet. The slabs look good.', 'Would you like our salesperson to help plan your festive stock?', 'Yes, ask him to call tomorrow.'],
  'Complaint Resolution': ['Hello {n}, this is {a} from YANA MOTORS. I am calling about your recent complaint.', 'Yes, the product did not perform as expected.', 'We are sorry. A replacement is approved and our team will collect a sample.', 'Okay, please do it quickly.'],
  'Customer Feedback': ['Hello {n}, this is {a} from YANA MOTORS. How did your last order work out?', 'Quite good, customers liked the foam.', 'Great to hear. On a scale of 1 to 5, how would you rate it?', 'Four, maybe five.'],
};
const OUTCOMES: Record<CallType, string[]> = {
  'Sales Follow-up': ['Sample kit requested', 'Decision expected next week', 'Wants a revised quotation'],
  Reorder: ['Reorder confirmed by voice', 'Will reorder next week', 'Asked for a callback from the account owner'],
  'Dormant Customer Recovery': ['Still holds stock, revisit in 30 days', 'Interested in the festive scheme', 'Not interested right now'],
  'Dealer Follow-up': ['Stocking plan discussed', 'Wants a salesperson visit', 'Confirmed festive order'],
  'Complaint Resolution': ['Replacement accepted', 'Customer satisfied with the resolution', 'Customer wants a human callback'],
  'Customer Feedback': ['Feedback recorded as 5/5', 'Feedback recorded as 4/5', 'Feedback recorded as 3/5, follow-up needed'],
};

interface CallSeed { company: string; type: CallType; status: Call['status']; sec: number; ago: number; sentiment: Call['sentiment']; outcome: string; next: string; trigger?: string; crm?: string[]; lines?: [string, string][] }

const CALLS: CallSeed[] = [
  { company: 'CMP-106', type: 'Reorder', status: 'Completed', sec: 214, ago: 0.2, sentiment: 'Positive', outcome: 'Agreed to reorder next week, wants a call from the account owner', next: 'Priya Nair to call tomorrow at 3 pm', crm: ['Sentiment logged: Positive', 'Task created for the account owner', 'Reorder opportunity marked Contacted'],
    lines: [['AI', 'Hello, this is Aria from YANA MOTORS. Am I speaking with Suresh?'], ['Customer', 'Yes, speaking.'], ['AI', 'Your last order was about ten weeks ago. Are you running low on shampoo?'], ['Customer', 'We moved some volume to another brand for a month, but the quality dropped.'], ['AI', 'Sorry to hear that. Can our account owner Priya call you tomorrow with a rate for the 5 litre can?'], ['Customer', 'Yes, tomorrow afternoon is fine.']] },
  { company: 'CMP-116', type: 'Dormant Customer Recovery', status: 'Completed', sec: 96, ago: 1.1, sentiment: 'Neutral', outcome: 'Still holds stock, revisit in 30 days', next: 'Re-engage on 19 Oct', crm: ['Sentiment logged: Neutral', 'Next follow-up set for 30 days'] },
  { company: 'CMP-107', type: 'Dealer Follow-up', status: 'Completed', sec: 305, ago: 2.3, sentiment: 'Positive', outcome: 'Confirmed festive order of 600 units', next: 'Salesperson to confirm stock', crm: ['Deal moved to Order stage', 'Task created for Rohan Deshmukh'] },
  { company: 'CMP-105', type: 'Complaint Resolution', status: 'Completed', sec: 180, ago: 0.6, sentiment: 'Neutral', outcome: 'Replacement approved, sample pickup scheduled', next: 'Quality team to collect the sample', crm: ['Complaint updated: replacement approved', 'Task created for the quality manager'] },
  { company: 'CMP-109', type: 'Customer Feedback', status: 'Completed', sec: 140, ago: 3.2, sentiment: 'Positive', outcome: 'Feedback recorded as 5/5', next: 'Send referral request', crm: ['Feedback saved: 5/5', 'Referral request queued'] },
  { company: 'CMP-113', type: 'Reorder', status: 'No Answer', sec: 0, ago: 0.1, sentiment: null, outcome: 'No answer, retry in 4 hours', next: 'Retry call at 3 pm', crm: ['Call attempt logged'] },
  { company: 'CMP-117', type: 'Dormant Customer Recovery', status: 'Voicemail', sec: 32, ago: 1.6, sentiment: null, outcome: 'Voicemail left with callback number', next: 'WhatsApp follow-up tomorrow', crm: ['Voicemail logged'] },
  { company: 'CMP-103', type: 'Sales Follow-up', status: 'Completed', sec: 260, ago: 4.1, sentiment: 'Positive', outcome: 'Interested in interior cleaner and dashboard polish for the new bay', next: 'Send a sample kit', crm: ['Deal created: Workshop consumables', 'Sample kit task created'] },
  { company: 'CMP-115', type: 'Reorder', status: 'Scheduled', sec: 0, ago: -0.9, sentiment: null, outcome: 'Scheduled for tomorrow 11 am', next: 'AI call scheduled', trigger: 'Reorder reminder unanswered for 48 hours' },
  { company: 'CMP-120', type: 'Customer Feedback', status: 'Completed', sec: 120, ago: 5.0, sentiment: 'Positive', outcome: 'Feedback recorded as 5/5', next: 'Share the referral programme', crm: ['Feedback saved: 5/5'] },
];

export function buildCalls(customers: Customer[]): Call[] {
  const rng = createRng(1212);
  const first = (n: string) => n.split(' ')[0];
  const make = (s: CallSeed, cust: Customer, i: number): Call => {
    const agent = CALL_AGENT[s.type];
    const transcript = s.status === 'Completed'
      ? (s.lines ?? SCRIPTS[s.type].map((t, k): [string, string] => [k % 2 === 0 ? 'AI' : 'Customer', t.replace('{n}', first(cust.name)).replace('{a}', first(agent))])).map(([speaker, text], k) => ({ speaker: speaker as 'AI' | 'Customer', text, atSec: k * Math.max(8, Math.round(s.sec / 7)) }))
      : [];
    return {
      id: `CALL-${8001 + i}`, customerId: cust.id, companyId: cust.companyId, callType: s.type, trigger: s.trigger ?? CALL_TRIGGER[s.type], agent,
      status: s.status, calledAt: new Date(NOW - s.ago * DAY).toISOString(), durationSec: s.sec, outcome: s.outcome, sentiment: s.sentiment, transcript,
      crmUpdates: s.crm ?? [], nextAction: s.next,
    };
  };

  const calls = CALLS.map((s, i) => make(s, buyerOf(customers, s.company), i));
  const types: [CallType, number][] = [['Sales Follow-up', 20], ['Reorder', 34], ['Complaint Resolution', 8], ['Customer Feedback', 18], ['Dormant Customer Recovery', 12], ['Dealer Follow-up', 8]];
  for (let i = 0; i < 30; i++) {
    const type = rng.weighted(types);
    const status = rng.weighted<Call['status']>([['Completed', 64], ['No Answer', 18], ['Voicemail', 12], ['Failed', 6]]);
    const done = status === 'Completed';
    const s: CallSeed = {
      company: '', type, status, sec: done ? rng.int(45, 330) : status === 'Voicemail' ? rng.int(20, 40) : 0, ago: rng.between(6, 95),
      sentiment: done ? rng.weighted<NonNullable<Call['sentiment']>>([['Positive', 55], ['Neutral', 33], ['Negative', 12]]) : null,
      outcome: done ? rng.pick(OUTCOMES[type]) : status === 'No Answer' ? 'No answer, retry later' : status === 'Voicemail' ? 'Voicemail left' : 'Call failed, number unreachable',
      next: done ? 'Update CRM and follow up' : 'Retry call', crm: done ? ['Transcript saved', 'CRM record updated'] : ['Call attempt logged'],
    };
    calls.push(make(s, rng.pick(customers), calls.length));
  }
  return calls.sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime()).map((c, i) => ({ ...c, id: `CALL-${8001 + calls.length - 1 - i}` }));
}

/* ---------------------------------------------------------------- campaigns */

export const CAMPAIGNS: Campaign[] = [
  { id: 'CAM-01', name: 'Monsoon Care Kit Offer', objective: 'Drive 5 L shampoo orders before the rains', audience: 'Car washes and detailers in the west', product: 'Car Wash Shampoo 5 L', channel: 'WhatsApp', status: 'Completed', startedAt: atDaysAgo(62), sent: 420, delivered: 402, read: 318, responded: 96, converted: 31, revenue: 486000 },
  { id: 'CAM-02', name: 'Premium Shampoo Launch', objective: 'Introduce the concentrate to professional detailers', audience: 'Professional detailers, all cities', product: 'Premium Detailing Shampoo', channel: 'WhatsApp', status: 'Running', startedAt: atDaysAgo(18), sent: 260, delivered: 251, read: 214, responded: 74, converted: 19, revenue: 312000 },
  { id: 'CAM-03', name: 'Festive Dealer Scheme', objective: 'Stock up dealers and distributors before Diwali', audience: 'Dealers and distributors', product: 'Full YANA range', channel: 'Email', status: 'Running', startedAt: atDaysAgo(9), sent: 88, delivered: 85, read: 52, responded: 21, converted: 8, revenue: 940000 },
  { id: 'CAM-04', name: 'Dormant Customer Win-back', objective: 'Recover customers inactive for 90+ days', audience: 'Customers with no order in 90 days', product: 'Car Wash Shampoo 5 L', channel: 'AI Voice', status: 'Running', startedAt: atDaysAgo(24), sent: 46, delivered: 29, read: 24, responded: 14, converted: 5, revenue: 118000 },
  { id: 'CAM-05', name: 'Reorder Reminder Wave 12', objective: 'Remind customers who are due to reorder', audience: 'Customers due within 7 days', product: 'Multiple products', channel: 'WhatsApp', status: 'Completed', startedAt: atDaysAgo(35), sent: 132, delivered: 129, read: 112, responded: 68, converted: 41, revenue: 655000 },
  { id: 'CAM-06', name: 'Fleet Wash Programme', objective: 'Sign annual wash supply contracts', audience: 'Fleet and corporate customers', product: 'Car Wash Shampoo 5 L, Interior Cleaner', channel: 'Manual Sales', status: 'Running', startedAt: atDaysAgo(41), sent: 24, delivered: 24, read: 24, responded: 11, converted: 3, revenue: 265000 },
  { id: 'CAM-07', name: 'Glass Cleaner Restock Alert', objective: 'Announce restock of Glass Cleaner', audience: 'Customers who bought Glass Cleaner', product: 'Glass Cleaner 500 ml', channel: 'WhatsApp', status: 'Scheduled', startedAt: atDaysAhead(3), sent: 0, delivered: 0, read: 0, responded: 0, converted: 0, revenue: 0 },
  { id: 'CAM-08', name: 'Referral Rewards Drive', objective: 'Turn happy customers into referrers', audience: 'High-value customers with CSAT 4 and above', product: 'Referral programme', channel: 'WhatsApp', status: 'Running', startedAt: atDaysAgo(14), sent: 58, delivered: 57, read: 49, responded: 22, converted: 7, revenue: 232000 },
  { id: 'CAM-09', name: 'Tyre Polish Retail Bundle', objective: 'Push tyre polish through retailers', audience: 'Retailers', product: 'Tyre Polish 500 ml', channel: 'Email', status: 'Paused', startedAt: atDaysAgo(50), sent: 64, delivered: 61, read: 33, responded: 9, converted: 2, revenue: 74000 },
  { id: 'CAM-10', name: 'Detailing Workshop Invite', objective: 'Invite detailers to a hands-on product workshop', audience: 'Professional detailers in Bengaluru and Pune', product: 'Premium Detailing Shampoo', channel: 'Email', status: 'Draft', startedAt: atDaysAhead(10), sent: 0, delivered: 0, read: 0, responded: 0, converted: 0, revenue: 0 },
];

export function buildCampaignInteractions(customers: Customer[]): CampaignInteraction[] {
  const rng = createRng(606);
  const usable = CAMPAIGNS.filter((c) => c.sent > 0 && c.channel !== 'Manual Sales');
  const out: CampaignInteraction[] = [];
  for (const cust of customers) {
    for (const cam of rng.shuffle(usable).slice(0, 2)) {
      out.push({
        id: `CI-${out.length + 1}`, customerId: cust.id, campaignId: cam.id,
        action: rng.weighted<CampaignInteraction['action']>([['Delivered', 20], ['Read', 45], ['Responded', 25], ['Converted', 10]]),
        at: new Date(Math.min(NOW - 3_600_000, new Date(cam.startedAt).getTime() + rng.between(0.2, 6) * DAY)).toISOString(),
      });
    }
  }
  return out;
}

/* -------------------------------------------------------------- automations */

interface AutoSeed { name: string; description: string; trigger: string; conditions: string[]; actions: string[]; status: Automation['status']; runs: number; success: number; scheduled?: boolean; lastAgoH: number | null }

const AUTOS: AutoSeed[] = [
  { name: 'New Lead → WhatsApp Welcome', description: 'Greets every new lead within a minute and shares the catalogue.', trigger: 'A lead is created', conditions: ['Lead has a WhatsApp-enabled number', 'Lead source is not Referral'], actions: ['Send WhatsApp welcome template', 'Assign to the city owner', 'Create a follow-up task for the next day'], status: 'Active', runs: 214, success: 97, lastAgoH: 3 },
  { name: 'Qualified Lead → Sales Assignment', description: 'Moves qualified leads into the pipeline and tells the salesperson.', trigger: 'Lead stage changes to Qualified', conditions: ['Estimated value above ₹50,000'], actions: ['Assign to the salesperson for the city', 'Create a deal in the pipeline', 'Notify the salesperson'], status: 'Active', runs: 71, success: 99, lastAgoH: 26 },
  { name: 'Order Confirmed → Customer Notification', description: 'Confirms every order to the customer with the total and delivery date.', trigger: 'Order status changes to Confirmed', conditions: ['Customer has WhatsApp opt-in'], actions: ['Send WhatsApp order confirmation', 'Send invoice copy by email'], status: 'Active', runs: 208, success: 98, lastAgoH: 5 },
  { name: 'Order Delivered → Product Usage Guide', description: 'Sends the right usage guide and training video after delivery.', trigger: 'Order status changes to Delivered', conditions: ['Customer has WhatsApp opt-in'], actions: ['Send usage guide and training video', 'Add the customer to the Customer Success journey'], status: 'Active', runs: 195, success: 96, lastAgoH: 9 },
  { name: '7-Day Post Delivery → Feedback Request', description: 'Asks for a 1 to 5 rating a week after delivery.', trigger: 'Seven days after delivery', conditions: ['No open complaint on the order'], actions: ['Send the feedback request on WhatsApp', 'Save the reply as feedback'], status: 'Active', runs: 168, success: 94, scheduled: true, lastAgoH: 8 },
  { name: 'Complaint Created → Support Ticket', description: 'Opens a linked ticket and acknowledges the customer instantly.', trigger: 'A complaint is created', conditions: [], actions: ['Create a linked support ticket', 'Assign the quality manager', 'Send an acknowledgement to the customer'], status: 'Active', runs: 24, success: 100, lastAgoH: 20 },
  { name: 'High Severity Complaint → Human Alert', description: 'Pulls a person in immediately for serious complaints.', trigger: 'Complaint severity is High or Critical', conditions: [], actions: ['Alert the quality manager', 'Move to Human Review', 'Pause automated replies'], status: 'Active', runs: 6, success: 100, lastAgoH: 21 },
  { name: 'Reorder Due → WhatsApp Reminder', description: 'Reminds customers shortly before their expected reorder date.', trigger: 'Expected reorder date is within 3 days', conditions: ['Reorder probability above 60%', 'No open order in the last 7 days'], actions: ['Send the reorder reminder on WhatsApp', 'Create a reorder task'], status: 'Active', runs: 132, success: 95, scheduled: true, lastAgoH: 6 },
  { name: 'No Reorder Response → AI Voice Call', description: 'Follows up by voice when a reminder gets no reply.', trigger: '48 hours after a reminder with no reply', conditions: ['Customer allows calls', 'Within calling hours, 10 am to 6 pm'], actions: ['Place an AI voice call', 'Save the transcript to the CRM', 'Create a human task if needed'], status: 'Paused', runs: 46, success: 87, scheduled: true, lastAgoH: 74 },
  { name: 'Positive Feedback → Referral Request', description: 'Asks happy customers to refer others.', trigger: 'Feedback rating is 4 or 5', conditions: ['No referral request in the last 90 days'], actions: ['Send the referral request on WhatsApp', 'Create a referral record'], status: 'Active', runs: 58, success: 93, lastAgoH: 30 },
  { name: 'Dormant Customer → Reactivation Campaign', description: 'Wins back customers who stopped ordering.', trigger: 'No order for 90 days', conditions: ['Customer health is Dormant or At Risk'], actions: ['Add to the win-back campaign', 'Send a reactivation offer', 'Ask the account owner to call'], status: 'Draft', runs: 0, success: 0, scheduled: true, lastAgoH: null },
];

export function buildAutomations(names: string[]): Automation[] {
  const rng = createRng(1717);
  return AUTOS.map((a, i) => {
    const id = `AUTO-${String(i + 1).padStart(2, '0')}`;
    const runLog = a.runs === 0 ? [] : Array.from({ length: 6 }, (_, k) => {
      const result = rng.weighted<Automation['runLog'][number]['result']>([['Success', a.success || 90], ['Failed', 100 - (a.success || 90)], ['Skipped', 4]]);
      return {
        id: `${id}-r${k + 1}`,
        at: new Date(NOW - ((a.lastAgoH ?? 4) + k * rng.between(3, 20)) * 3_600_000).toISOString(),
        result,
        detail: result === 'Success' ? `Completed for ${rng.pick(names)}` : result === 'Failed' ? `Could not reach the customer (demo)` : 'Skipped because a condition did not match',
      };
    });
    return {
      id, name: a.name, description: a.description, trigger: a.trigger, conditions: a.conditions, actions: a.actions, status: a.status, runs: a.runs, successRate: a.success,
      lastRunAt: a.lastAgoH === null ? null : new Date(NOW - a.lastAgoH * 3_600_000).toISOString(),
      nextRunAt: a.status === 'Active' && a.scheduled ? atDaysAhead(1, 9) : null,
      runLog,
    };
  });
}

/* ---------------------------------------------------------------- referrals */

export function buildReferrals(customers: Customer[]): Referral[] {
  const b = (co: string) => buyerOf(customers, co).id;
  const r = (n: number, co: string, lead: string, company: string, city: Referral['city'], ago: number, status: Referral['status'], revenue: number, reward: string, campaign: string, leadId: string | null = null): Referral => ({
    id: `REF-${9001 + n}`, referrerId: b(co), newLeadName: lead, newLeadCompany: company, city, leadId, referredAt: atDaysAgo(ago), status, revenue, reward,
    rewardStatus: status === 'Converted' ? 'Issued' : status === 'Lost' ? 'Not Eligible' : 'Pending', campaign,
  });
  return [
    r(0, 'CMP-109', 'Lata Deshpande', 'Sunshine Motors', 'Pune', 68, 'Converted', 186000, '₹5,000 credit', 'Dealer Referral Rewards', 'LEAD-2027'),
    r(1, 'CMP-101', 'Manisha Iyer', 'Crystal Coat Studio', 'Bengaluru', 40, 'Qualified', 0, '₹2,000 credit', 'Referral Rewards Drive', 'LEAD-2019'),
    r(2, 'CMP-104', "Joseph D'Souza", 'Coastal Car Care', 'Mumbai', 22, 'Lead Created', 0, '₹2,000 credit', 'Referral Rewards Drive', 'LEAD-2011'),
    r(3, 'CMP-102', 'Sagar Wagh', 'Baner Wash Hub', 'Pune', 9, 'Contact Shared', 0, '₹2,000 credit', 'Referral Rewards Drive'),
    r(4, 'CMP-103', 'Harish Sethi', 'Okhla Auto Detailing', 'Delhi', 3, 'Referral Requested', 0, '₹2,000 credit', 'Referral Rewards Drive'),
    r(5, 'CMP-108', 'Anwar Khan', 'Marine Drive Cabs', 'Mumbai', 31, 'Lead Created', 0, '₹3,000 credit', 'Fleet Referral Bonus'),
    r(6, 'CMP-112', 'Suraj Kumar', 'Adyar Speed Wash', 'Chennai', 74, 'Lost', 0, '₹0', 'Referral Rewards Drive'),
    r(7, 'CMP-107', 'Pankaj Trivedi', 'Naroda Auto Mart', 'Ahmedabad', 85, 'Converted', 96000, '₹4,000 credit', 'Dealer Referral Rewards'),
    r(8, 'CMP-111', 'Imtiyaz Ali', 'Kukatpally Car Studio', 'Hyderabad', 27, 'Qualified', 0, '₹2,000 credit', 'Referral Rewards Drive'),
    r(9, 'CMP-105', 'Chetan Gowda', 'Whitefield Detailers', 'Bengaluru', 5, 'Referral Requested', 0, '₹2,000 credit', 'Referral Rewards Drive'),
  ];
}

/* -------------------------------------------------------------------- tasks */

type T = [string, string | null, Task['type'], string, Task['priority'], number, Task['status'], Task['source'], string];
const TASKS: T[] = [
  ['Call Suresh Pillai about a 5 L can reorder', 'CMP-106', 'Reorder', 'tm-04', 'High', 0, 'To Do', 'AI Voice', 'Customer agreed to talk after the AI call.'],
  ['Send replacement glass cleaner to Speed Auto Care', 'CMP-105', 'Complaint', 'tm-07', 'High', 1, 'In Progress', 'Complaint', 'Collect a sample from the same batch.'],
  ['Review cap torque records for batch B2608-C05', null, 'Complaint', 'tm-10', 'Urgent', 0, 'In Progress', 'Complaint', 'Check Line 2 records for the last 3 shifts.'],
  ['Approve festive scheme slabs for AutoShine', 'CMP-107', 'Sales', 'tm-01', 'Medium', 2, 'To Do', 'WhatsApp', ''],
  ['Follow up on quotation with Crystal Coat Studio', null, 'Follow-up', 'tm-04', 'High', -1, 'To Do', 'Manual', 'Referred by ABC Auto Care.'],
  ['Confirm 600-unit festive stock hold', 'CMP-107', 'Sales', 'tm-03', 'High', 1, 'In Progress', 'WhatsApp', 'Confirm by tomorrow noon.'],
  ['Send sample kit to Metro Auto Works', 'CMP-103', 'Follow-up', 'tm-05', 'Medium', 2, 'To Do', 'AI Voice', 'Interior cleaner and dashboard polish.'],
  ['Check in with Vasant Auto Mart in 30 days', 'CMP-116', 'Customer Success', 'tm-05', 'Low', 28, 'To Do', 'AI Voice', ''],
  ['Prepare display kit quotation for Silverline', 'CMP-118', 'Sales', 'tm-01', 'High', 0, 'To Do', 'WhatsApp', 'Include tyre and dashboard polish.'],
  ['Share starter guide with Zoom Wash & Wax', 'CMP-120', 'Customer Success', 'tm-09', 'Medium', 0, 'To Do', 'WhatsApp', ''],
  ['Investigate tyre polish separation, batch B2607-T11', 'CMP-101', 'Complaint', 'tm-10', 'High', -1, 'In Progress', 'Complaint', 'Retention samples requested from the lab.'],
  ['Call Orbit Logistics about the GST correction', 'CMP-115', 'Support', 'tm-07', 'Medium', 1, 'To Do', 'Complaint', 'Issue a corrected invoice.'],
  ['Weekly customer health review', null, 'Management', 'tm-01', 'Medium', 3, 'To Do', 'Manual', 'Review At Risk and Dormant accounts.'],
  ['Check stock plan for Glass Cleaner', null, 'Management', 'tm-00', 'Urgent', 0, 'To Do', 'Manual', 'Product is out of stock. Confirm the replenishment date.'],
  ['Revisit Ganesh Motor Garage', 'CMP-117', 'Reorder', 'tm-03', 'Medium', -2, 'To Do', 'Automation', 'Dormant for 120+ days.'],
  ['Collect feedback from Namma Garage Works', 'CMP-113', 'Customer Success', 'tm-09', 'Medium', 2, 'To Do', 'Automation', ''],
  ['Update dealer price list for the festive season', null, 'Management', 'tm-00', 'Low', 6, 'To Do', 'Manual', ''],
  ['Post-delivery usage check for ABC Auto Care', 'CMP-101', 'Customer Success', 'tm-09', 'Low', 1, 'In Progress', 'Automation', ''],
  ['Send credit note for the Prime Car Wash delay', 'CMP-106', 'Complaint', 'tm-08', 'Medium', -3, 'Done', 'Complaint', 'Credit note of ₹2,500.'],
  ['Onboard Bharat Detailing Lab', 'CMP-119', 'Customer Success', 'tm-09', 'Medium', -5, 'Done', 'Manual', ''],
  ['Reply to festive scheme query from Kohinoor Motors', 'CMP-109', 'Sales', 'tm-02', 'Low', -2, 'Done', 'WhatsApp', ''],
  ['Ship replacement dashboard polish to Kohinoor', 'CMP-109', 'Complaint', 'tm-08', 'Medium', -4, 'Done', 'Complaint', ''],
  ['Book courier backup for Chennai', null, 'Management', 'tm-01', 'Medium', -6, 'Done', 'Manual', ''],
  ['Follow up on payment for overdue invoices', 'CMP-114', 'Support', 'tm-05', 'High', -1, 'To Do', 'Manual', 'Two invoices are overdue.'],
];

export function buildTasks(customers: Customer[]): Task[] {
  return TASKS.map(([title, company, type, assignedTo, priority, due, status, source, notes], i) => {
    const cust = company ? buyerOf(customers, company) : null;
    return {
      id: `TASK-${4001 + i}`, title, customerId: cust?.id ?? null, companyId: cust?.companyId ?? null, type, assignedTo, priority,
      dueAt: atDaysAhead(due, 17), status, source, notes, createdAt: atDaysAgo(Math.max(1, 2 - due)),
    };
  });
}

export const TEAM_NAMES = TEAM.map((t) => t.name);
