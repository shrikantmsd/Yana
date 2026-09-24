import type { City, ID, Priority, Sentiment } from './common';

export const INTENTS = ['Sales', 'Support', 'Complaint', 'Reorder', 'Feedback', 'Referral', 'General'] as const;
export type Intent = (typeof INTENTS)[number];

export interface Message {
  id: ID;
  conversationId: ID;
  sender: 'customer' | 'ai' | 'agent' | 'system';
  text: string;
  at: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: ID;
  customerId: ID;
  companyId: ID;
  intent: Intent;
  handler: 'AI' | 'Human';
  status: 'Open' | 'Waiting Customer' | 'Escalated' | 'Resolved';
  nextAction: string;
  unread: number;
  assignedTo: ID | null;
  messages: Message[];
}

export interface WhatsAppTemplate {
  id: ID;
  name: string;
  category: 'Utility' | 'Marketing' | 'Service';
  language: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  body: string;
  usedBy: string;
}

export const CALL_TYPES = [
  'Sales Follow-up',
  'Reorder',
  'Complaint Resolution',
  'Customer Feedback',
  'Dormant Customer Recovery',
  'Dealer Follow-up',
] as const;
export type CallType = (typeof CALL_TYPES)[number];

export type CallStatus = 'Completed' | 'No Answer' | 'Voicemail' | 'Scheduled' | 'Failed';

export interface Call {
  id: ID;
  customerId: ID;
  companyId: ID;
  callType: CallType;
  trigger: string;
  agent: string;
  status: CallStatus;
  calledAt: string;
  durationSec: number;
  outcome: string;
  sentiment: Sentiment | null;
  transcript: { speaker: 'AI' | 'Customer'; text: string; atSec: number }[];
  crmUpdates: string[];
  nextAction: string;
}

export const CAMPAIGN_CHANNELS = ['WhatsApp', 'Email', 'AI Voice', 'Manual Sales'] as const;
export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number];
export type CampaignStatus = 'Draft' | 'Scheduled' | 'Running' | 'Paused' | 'Completed';

export interface Campaign {
  id: ID;
  name: string;
  objective: string;
  audience: string;
  product: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  startedAt: string;
  sent: number;
  delivered: number;
  read: number;
  responded: number;
  converted: number;
  revenue: number;
}

export interface CampaignInteraction {
  id: ID;
  customerId: ID;
  campaignId: ID;
  action: 'Delivered' | 'Read' | 'Responded' | 'Converted';
  at: string;
}

export interface Automation {
  id: ID;
  name: string;
  description: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  status: 'Active' | 'Paused' | 'Draft';
  lastRunAt: string | null;
  nextRunAt: string | null;
  successRate: number;
  runs: number;
  runLog: { id: ID; at: string; result: 'Success' | 'Failed' | 'Skipped'; detail: string }[];
}

export const REFERRAL_STATUSES = [
  'Referral Requested',
  'Contact Shared',
  'Lead Created',
  'Qualified',
  'Converted',
  'Lost',
] as const;
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export interface Referral {
  id: ID;
  referrerId: ID;
  newLeadName: string;
  newLeadCompany: string;
  city: City;
  leadId: ID | null;
  referredAt: string;
  status: ReferralStatus;
  revenue: number;
  reward: string;
  rewardStatus: 'Pending' | 'Issued' | 'Not Eligible';
  campaign: string;
}

export const REORDER_ACTIONS = [
  'WhatsApp Reminder',
  'Call Customer',
  'Reorder Same',
  'Change Quantity',
  'Assign Salesperson',
] as const;
export type ReorderAction = (typeof REORDER_ACTIONS)[number];

export interface ReorderOpportunity {
  id: ID;
  customerId: ID;
  companyId: ID;
  sku: string;
  productName: string;
  lastOrderAt: string;
  previousQty: number;
  avgQty: number;
  avgCycleDays: number;
  expectedReorderAt: string;
  probability: number;
  recommendedAction: ReorderAction;
  actionTaken: ReorderAction | null;
  actionTakenAt: string | null;
  estimatedValue: number;
}

export type GrowthStatus = 'Suggested' | 'Contacted' | 'Interested' | 'Won' | 'Dismissed';

export interface GrowthOpportunity {
  id: ID;
  kind: 'Upsell' | 'Cross-sell';
  customerId: ID;
  companyId: ID;
  currentProduct: string;
  recommendedProduct: string;
  recommendedSku: string;
  reason: string;
  potentialRevenue: number;
  status: GrowthStatus;
}

export const TASK_TYPES = ['Sales', 'Support', 'Complaint', 'Follow-up', 'Reorder', 'Customer Success', 'Management'] as const;
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: ID;
  title: string;
  customerId: ID | null;
  companyId: ID | null;
  type: TaskType;
  assignedTo: ID;
  priority: Priority;
  dueAt: string;
  status: TaskStatus;
  source: 'Manual' | 'Automation' | 'AI Voice' | 'WhatsApp' | 'Complaint' | 'Reorder Intelligence';
  notes: string;
  createdAt: string;
}

export const SUCCESS_STAGES = [
  'Order Delivered',
  'Welcome',
  'Product Guide',
  'Training',
  'Usage Check',
  'Feedback',
  'Review',
  'Reorder',
  'Upsell',
  'Cross-sell',
  'Referral',
] as const;
export type SuccessStage = (typeof SUCCESS_STAGES)[number];

export interface SuccessJourney {
  id: ID;
  customerId: ID;
  orderId: ID;
  stage: SuccessStage;
  stageSince: string;
  nextAction: string;
  nextActionAt: string;
  needsAttention: boolean;
  attentionReason: string;
}

export interface AppNotification {
  id: ID;
  title: string;
  body: string;
  at: string;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'ai';
  href: string;
  read: boolean;
}
