import type { City, CustomerHealth, CustomerType, ID, TimelineEvent } from './common';

export type CustomerStatus = 'Active' | 'Inactive' | 'On Hold';
export type WhatsAppStatus = 'Opted In' | 'Pending' | 'Opted Out';

export interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
  customerId?: ID;
}

export interface Company {
  id: ID;
  name: string;
  customerType: CustomerType;
  city: City;
  state: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  accountOwnerId: ID;
  since: string;
  contacts: Contact[];
  health: CustomerHealth;
}

export interface Customer {
  id: ID;
  name: string;
  role: string;
  phone: string;
  email: string;
  companyId: ID;
  customerType: CustomerType;
  city: City;
  state: string;
  customerSince: string;
  status: CustomerStatus;
  whatsappStatus: WhatsAppStatus;
  health: CustomerHealth;
  accountOwnerId: ID;
}

export const LEAD_STAGES = ['New', 'Contacted', 'Engaged', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_SOURCES = [
  'Google Maps',
  'LinkedIn',
  'Justdial',
  'Website',
  'WhatsApp',
  'Referral',
  'Campaign',
  'Direct',
  'Distributor Network',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
  id: ID;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: City;
  customerType: CustomerType;
  source: LeadSource;
  productInterest: string[];
  score: number;
  stage: LeadStage;
  assignedTo: ID;
  createdAt: string;
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  estimatedValue: number;
  notes: string;
  lostReason?: string;
  convertedCustomerId?: ID;
  activity: TimelineEvent[];
}

export const DEAL_STAGES = [
  'Lead',
  'Qualified',
  'Requirement',
  'Product Recommendation',
  'Quotation',
  'Negotiation',
  'Order',
  'Won',
  'Lost',
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_PROBABILITY: Record<DealStage, number> = {
  Lead: 10,
  Qualified: 25,
  Requirement: 40,
  'Product Recommendation': 50,
  Quotation: 60,
  Negotiation: 75,
  Order: 90,
  Won: 100,
  Lost: 0,
};

export interface Deal {
  id: ID;
  title: string;
  leadId?: ID;
  customerId?: ID;
  company: string;
  city: City;
  value: number;
  probability: number;
  stage: DealStage;
  salespersonId: ID;
  nextAction: string;
  expectedCloseAt: string;
  createdAt: string;
}
