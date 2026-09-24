import type { ID, Priority, Severity, TimelineEvent } from './common';

export const TICKET_CATEGORIES = [
  'Product Information',
  'Product Usage',
  'Application Guidance',
  'Order Status',
  'Delivery',
  'Payment',
  'Availability',
  'Dealer Support',
  'Technical Support',
  'Human Assistance',
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = ['New', 'Acknowledged', 'In Progress', 'Waiting Customer', 'Resolved', 'Closed'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export interface Ticket {
  id: ID;
  customerId: ID;
  companyId: ID;
  sku: string | null;
  orderId: ID | null;
  category: TicketCategory;
  issue: string;
  priority: Priority;
  status: TicketStatus;
  assignedTo: ID;
  channel: 'WhatsApp' | 'AI Voice' | 'Email' | 'Phone';
  createdAt: string;
  slaDueAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  resolution: string;
  activity: TimelineEvent[];
}

export const COMPLAINT_STAGES = [
  'Complaint Received',
  'AI Intake',
  'Classification',
  'Investigation',
  'Human Review',
  'Resolution',
  'Customer Confirmation',
  'CSAT',
  'Closed',
] as const;
export type ComplaintStage = (typeof COMPLAINT_STAGES)[number];

export const COMPLAINT_CATEGORIES = [
  'Product Quality',
  'Packaging / Leakage',
  'Wrong Product',
  'Short Quantity',
  'Damaged in Transit',
  'Performance / Efficacy',
  'Fragrance / Appearance',
  'Delivery Delay',
  'Billing',
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export interface Complaint {
  id: ID;
  customerId: ID;
  companyId: ID;
  orderId: ID;
  sku: string;
  batch: string;
  category: ComplaintCategory;
  description: string;
  evidence: { id: ID; label: string; kind: 'Photo' | 'Video' | 'Document' }[];
  severity: Severity;
  assignedTo: ID;
  stage: ComplaintStage;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  resolution: string;
  customerConfirmation: 'Pending' | 'Confirmed' | 'Disputed' | 'Not Required';
  csat: number | null;
  createdAt: string;
  closedAt: string | null;
  activity: TimelineEvent[];
}

export interface Feedback {
  id: ID;
  customerId: ID;
  orderId: ID;
  rating: number;
  comment: string;
  channel: 'WhatsApp' | 'AI Voice' | 'Email';
  at: string;
}
