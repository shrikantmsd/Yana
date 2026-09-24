import { addDays, atDaysAgo, atDaysAhead, slugify } from '@/lib/format';
import { createRng } from '@/lib/random';
import {
  DEAL_STAGE_PROBABILITY,
  type City,
  type Customer,
  type CustomerType,
  type Deal,
  type DealStage,
  type Lead,
  type LeadSource,
  type LeadStage,
  type TimelineEvent,
} from '@/types';
import { CITY_OWNER, TEAM } from './team';

interface LeadSeed {
  company: string;
  contact: string;
  city: City;
  type: CustomerType;
  source: LeadSource;
  interest: string[];
  stage: LeadStage;
  lostReason?: string;
}

const FULL = ['Full YANA range'];

const SEEDS: LeadSeed[] = [
  { company: 'Gloss Garage Studio', contact: 'Rahul Sawant', city: 'Mumbai', type: 'Professional Detailer', source: 'Google Maps', interest: ['Premium Detailing Shampoo', 'Wheel & Rim Cleaner'], stage: 'New' },
  { company: 'Turbo Shine Detailers', contact: 'Ishaan Kulkarni', city: 'Pune', type: 'Professional Detailer', source: 'Justdial', interest: ['Car Wash Shampoo', 'Exterior Cleaner'], stage: 'New' },
  { company: 'Highway Auto Care', contact: 'Balwinder Singh', city: 'Delhi', type: 'Workshop', source: 'Website', interest: ['Glass Cleaner', 'Interior Cleaner'], stage: 'New' },
  { company: 'Sparkle Wash Point', contact: 'Ravi Teja', city: 'Hyderabad', type: 'Car Wash', source: 'WhatsApp', interest: ['Car Wash Shampoo 5 L', 'Tyre Polish'], stage: 'New' },
  { company: 'Lakeview Motors', contact: 'Prakash Nambiar', city: 'Bengaluru', type: 'Dealer', source: 'LinkedIn', interest: FULL, stage: 'New' },
  { company: 'Zoom Car Spa', contact: 'Mohit Agarwal', city: 'Ahmedabad', type: 'Car Wash', source: 'Campaign', interest: ['Car Wash Shampoo 5 L'], stage: 'Contacted' },
  { company: 'Patel Tyre & Care', contact: 'Dinesh Patel', city: 'Ahmedabad', type: 'Retailer', source: 'Direct', interest: ['Tyre Polish', 'Dashboard Polish'], stage: 'Contacted' },
  { company: 'Bharat Fleet Solutions', contact: 'Sunil Rathod', city: 'Pune', type: 'Fleet Customer', source: 'LinkedIn', interest: ['Car Wash Shampoo 5 L', 'Interior Cleaner'], stage: 'Contacted' },
  { company: 'Sunrise Motors Retail', contact: 'Jayant Kale', city: 'Mumbai', type: 'Retailer', source: 'Justdial', interest: ['Dashboard Polish', 'Glass Cleaner'], stage: 'Contacted' },
  { company: 'Apex Auto Detailing', contact: 'Sanjana Rao', city: 'Bengaluru', type: 'Professional Detailer', source: 'Google Maps', interest: ['Premium Detailing Shampoo'], stage: 'Contacted' },
  { company: 'Coastal Car Care', contact: "Joseph D'Souza", city: 'Mumbai', type: 'Car Wash', source: 'Referral', interest: ['Car Wash Shampoo 5 L', 'Tyre Polish'], stage: 'Engaged' },
  { company: 'Vega Auto Zone', contact: 'Harpreet Kaur', city: 'Delhi', type: 'Retailer', source: 'Distributor Network', interest: FULL, stage: 'Engaged' },
  { company: 'Pinnacle Cab Services', contact: 'Rajesh Nair', city: 'Chennai', type: 'Fleet Customer', source: 'Website', interest: ['Glass Cleaner', 'Interior Cleaner'], stage: 'Engaged' },
  { company: 'Orchid Corporate Services', contact: 'Sunita Bhalla', city: 'Delhi', type: 'Corporate Customer', source: 'LinkedIn', interest: ['Car Wash Shampoo 5 L'], stage: 'Engaged' },
  { company: 'Detail Masters India', contact: 'Arvind Krishnan', city: 'Chennai', type: 'Professional Detailer', source: 'Campaign', interest: ['Premium Detailing Shampoo', 'Microfiber Towels'], stage: 'Engaged' },
  { company: 'Torque Garage', contact: 'Sachin Bhosale', city: 'Pune', type: 'Workshop', source: 'WhatsApp', interest: ['Interior Cleaner', 'Glass Cleaner'], stage: 'Qualified' },
  { company: 'Elite Auto Spa', contact: 'Nadeem Khan', city: 'Hyderabad', type: 'Car Wash', source: 'Google Maps', interest: ['Car Wash Shampoo 5 L', 'Exterior Cleaner'], stage: 'Qualified' },
  { company: 'Motorhub Distributors', contact: 'Prabhakar Reddy', city: 'Hyderabad', type: 'Distributor', source: 'Distributor Network', interest: FULL, stage: 'Qualified' },
  { company: 'Yellow Wheels Rentals', contact: 'Mukesh Jain', city: 'Ahmedabad', type: 'Fleet Customer', source: 'Direct', interest: ['Car Wash Shampoo 5 L', 'Dashboard Polish'], stage: 'Qualified' },
  { company: 'Crystal Coat Studio', contact: 'Manisha Iyer', city: 'Bengaluru', type: 'Professional Detailer', source: 'Referral', interest: ['Premium Detailing Shampoo', 'Wheel & Rim Cleaner'], stage: 'Proposal' },
  { company: 'Rajdhani Auto Parts', contact: 'Vinod Sethi', city: 'Delhi', type: 'Retailer', source: 'Justdial', interest: ['Tyre Polish', 'Glass Cleaner'], stage: 'Proposal' },
  { company: 'Western Wheels Dealership', contact: 'Amol Gaikwad', city: 'Pune', type: 'Dealer', source: 'LinkedIn', interest: FULL, stage: 'Proposal' },
  { company: 'Southern Star Distributors', contact: 'Ganesh Subramanian', city: 'Chennai', type: 'Distributor', source: 'Distributor Network', interest: FULL, stage: 'Negotiation' },
  { company: 'Metro Cab Care', contact: 'Yusuf Shaikh', city: 'Mumbai', type: 'Fleet Customer', source: 'Website', interest: ['Car Wash Shampoo 5 L', 'Interior Cleaner'], stage: 'Negotiation' },
  { company: 'Sai Auto Wash', contact: 'Pradeep Naidu', city: 'Hyderabad', type: 'Car Wash', source: 'WhatsApp', interest: ['Car Wash Shampoo 5 L', 'Glass Cleaner'], stage: 'Negotiation' },
  { company: 'Prestige Detailing Co', contact: 'Kabir Anand', city: 'Delhi', type: 'Professional Detailer', source: 'Google Maps', interest: ['Premium Detailing Shampoo'], stage: 'Won' },
  { company: 'Sunshine Motors', contact: 'Lata Deshpande', city: 'Pune', type: 'Dealer', source: 'Referral', interest: FULL, stage: 'Won' },
  { company: 'Garage 27', contact: 'Tarun Mehra', city: 'Bengaluru', type: 'Workshop', source: 'Campaign', interest: ['Glass Cleaner', 'Dashboard Polish'], stage: 'Won' },
  { company: 'Budget Car Wash', contact: 'Salim Merchant', city: 'Mumbai', type: 'Car Wash', source: 'Justdial', interest: ['Car Wash Shampoo 1 L'], stage: 'Lost', lostReason: 'Chose a cheaper local brand.' },
  { company: 'Neo Detailing Hub', contact: 'Harsha Vardhan', city: 'Hyderabad', type: 'Professional Detailer', source: 'LinkedIn', interest: ['Premium Detailing Shampoo'], stage: 'Lost', lostReason: 'Not ready to switch supplier this quarter.' },
];

const SCORE: Record<LeadStage, [number, number]> = {
  New: [20, 45], Contacted: [30, 55], Engaged: [45, 68], Qualified: [62, 82], Proposal: [72, 88], Negotiation: [78, 92], Won: [85, 98], Lost: [15, 40],
};
const AGE: Record<LeadStage, [number, number]> = {
  New: [0, 6], Contacted: [3, 14], Engaged: [8, 25], Qualified: [15, 40], Proposal: [22, 55], Negotiation: [30, 70], Won: [40, 100], Lost: [30, 110],
};
const VALUE: Record<CustomerType, [number, number]> = {
  Distributor: [600_000, 1_200_000], Dealer: [250_000, 600_000], 'Fleet Customer': [120_000, 300_000], 'Corporate Customer': [80_000, 180_000],
  'Professional Detailer': [60_000, 160_000], 'Car Wash': [50_000, 140_000], Workshop: [40_000, 110_000], Retailer: [40_000, 120_000],
};
const STAGE_ORDER: LeadStage[] = ['New', 'Contacted', 'Engaged', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export function generateLeads(): Lead[] {
  const rng = createRng(31);
  const owner = (id: string) => TEAM.find((t) => t.id === id)?.name ?? 'the team';

  return SEEDS.map((s, i) => {
    const id = `LEAD-${2001 + i}`;
    const rank = STAGE_ORDER.indexOf(s.stage);
    const createdAgo = rng.int(AGE[s.stage][0], AGE[s.stage][1]);
    const createdAt = atDaysAgo(createdAgo, rng.int(9, 17), rng.int(0, 59));
    const lastAgo = s.stage === 'New' ? createdAgo : Math.min(createdAgo, rng.int(0, 8));
    const closed = s.stage === 'Won' || s.stage === 'Lost';
    const assignedTo = CITY_OWNER[s.city];
    const [vmin, vmax] = VALUE[s.type];
    const estimatedValue = Math.round(rng.int(vmin, vmax) / 5000) * 5000;
    const at = (frac: number) => addDays(createdAt, (createdAgo - lastAgo) * frac + 0.02);
    const first = s.contact.split(' ')[0].toLowerCase();

    const activity: TimelineEvent[] = [{ id: `${id}-a1`, at: createdAt, kind: 'lead', title: `Lead captured from ${s.source}` }];
    const push = (kind: TimelineEvent['kind'], title: string, frac: number, description?: string) =>
      activity.push({ id: `${id}-a${activity.length + 1}`, at: at(frac), kind, title, description });
    push('whatsapp', 'WhatsApp welcome message sent', 0.02, 'Sent automatically by the New Lead automation (demo).');
    if (rank >= 1) push('call', `Intro call by ${owner(assignedTo)}`, 0.2, 'Confirmed business type and current supplier.');
    if (rank >= 2) push('whatsapp', 'Product catalogue and price list shared', 0.4);
    if (rank >= 3) push('sales', 'Requirement captured', 0.55, `Interested in: ${s.interest.join(', ')}.`);
    if (rank >= 4) push('sales', 'Quotation shared', 0.72);
    if (rank >= 5) push('sales', 'Pricing and credit terms discussed', 0.85);
    if (s.stage === 'Won') push('sales', 'Deal won', 1, 'Handed over to Customer Success for onboarding.');
    if (s.stage === 'Lost') push('sales', 'Marked as lost', 1, s.lostReason);

    const notes: Record<LeadStage, string> = {
      New: 'New enquiry. First contact pending.',
      Contacted: 'Intro call done. Waiting for a catalogue review.',
      Engaged: 'Reviewing samples and price list.',
      Qualified: 'Decision maker identified. Requirement confirmed.',
      Proposal: 'Quotation shared. Awaiting feedback.',
      Negotiation: 'Negotiating volume discount and credit period.',
      Won: 'Converted. First order expected this month.',
      Lost: s.lostReason ?? '',
    };

    return {
      id,
      name: s.contact,
      company: s.company,
      phone: `+91 ${rng.pick(['98', '97', '96', '99', '90', '93'])}${rng.int(100, 999)} ${rng.int(10000, 99999)}`,
      email: `${first}@${slugify(s.company)}.example`,
      city: s.city,
      customerType: s.type,
      source: s.source,
      productInterest: s.interest,
      score: rng.int(SCORE[s.stage][0], SCORE[s.stage][1]),
      stage: s.stage,
      assignedTo,
      createdAt,
      lastContactAt: s.stage === 'New' && createdAgo === 0 ? null : atDaysAgo(lastAgo, rng.int(10, 17), rng.int(0, 59)),
      nextFollowUpAt: closed ? null : atDaysAhead(rng.int(-2, 8), 11),
      estimatedValue,
      notes: notes[s.stage],
      lostReason: s.lostReason,
      activity,
    };
  });
}

const STAGE_MAP: Record<LeadStage, DealStage[]> = {
  New: [], Contacted: [], Engaged: ['Lead', 'Qualified'], Qualified: ['Qualified', 'Requirement', 'Product Recommendation'],
  Proposal: ['Quotation'], Negotiation: ['Negotiation', 'Order'], Won: ['Won'], Lost: ['Lost'],
};
const NEXT_ACTION: Record<DealStage, string> = {
  Lead: 'Qualify requirements', Qualified: 'Schedule a call to map the requirement', Requirement: 'Send product recommendation',
  'Product Recommendation': 'Share a sample kit', Quotation: 'Follow up on the quotation', Negotiation: 'Finalise credit terms',
  Order: 'Confirm order and payment', Won: 'Hand over to Customer Success', Lost: 'Revisit next quarter',
};
const TITLES: Record<CustomerType, string> = {
  Distributor: 'Distribution agreement', Dealer: 'Dealer stocking order', 'Fleet Customer': 'Fleet supply contract', 'Corporate Customer': 'Corporate supply contract',
  'Professional Detailer': 'Detailing chemicals starter order', 'Car Wash': 'Monthly wash-bay supply', Workshop: 'Workshop consumables', Retailer: 'Retail shelf range',
};

export function generateDeals(leads: Lead[], customers: Customer[]): Deal[] {
  const rng = createRng(53);
  const deals: Deal[] = [];
  let n = 3001;

  for (const l of leads) {
    const options = STAGE_MAP[l.stage];
    if (options.length === 0) continue;
    const stage = rng.pick(options);
    const closed = stage === 'Won' || stage === 'Lost';
    deals.push({
      id: `DEAL-${n++}`,
      title: `${l.company}: ${TITLES[l.customerType].toLowerCase()}`,
      leadId: l.id,
      company: l.company,
      city: l.city,
      value: l.estimatedValue,
      probability: DEAL_STAGE_PROBABILITY[stage],
      stage,
      salespersonId: l.assignedTo,
      nextAction: NEXT_ACTION[stage],
      expectedCloseAt: closed ? atDaysAgo(rng.int(3, 30)) : atDaysAhead(rng.int(4, 45)),
      createdAt: l.createdAt,
    });
  }

  // Expansion deals with existing customers
  const expansions: [number, string, DealStage, number][] = [
    [1, 'Add Premium Detailing Shampoo to monthly order', 'Requirement', 85_000],
    [4, 'Move to 5 L cans across all bays', 'Product Recommendation', 62_000],
    [8, 'Festive season stocking plan', 'Quotation', 540_000],
    [10, 'Extend range with Wheel & Rim Cleaner', 'Negotiation', 210_000],
    [13, 'Quarterly supply contract', 'Quotation', 260_000],
    [16, 'Add tyre and dashboard polish', 'Qualified', 95_000],
    [19, 'Annual fleet wash programme', 'Order', 320_000],
    [24, 'Showroom detailing kit rollout', 'Lead', 150_000],
  ];
  for (const [idx, title, stage, value] of expansions) {
    const c = customers[idx];
    if (!c) continue;
    deals.push({
      id: `DEAL-${n++}`,
      title,
      customerId: c.id,
      company: c.name,
      city: c.city,
      value,
      probability: DEAL_STAGE_PROBABILITY[stage],
      stage,
      salespersonId: c.accountOwnerId,
      nextAction: NEXT_ACTION[stage],
      expectedCloseAt: atDaysAhead(rng.int(6, 40)),
      createdAt: atDaysAgo(rng.int(6, 30)),
    });
  }
  return deals;
}
