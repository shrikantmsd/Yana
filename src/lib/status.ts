/** One place that decides which colour every status word gets. */
export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'ai' | 'neutral' | 'brand';

const TONES: Record<string, Tone> = {
  // health
  New: 'info',
  Active: 'success',
  'High Value': 'brand',
  'At Risk': 'warning',
  Dormant: 'danger',
  Inactive: 'neutral',
  'On Hold': 'warning',
  // whatsapp opt-in
  'Opted In': 'success',
  Pending: 'warning',
  'Opted Out': 'danger',
  // lead + deal stages
  Contacted: 'info',
  Engaged: 'info',
  Qualified: 'info',
  Proposal: 'warning',
  Negotiation: 'warning',
  Won: 'success',
  Lost: 'danger',
  Lead: 'info',
  Requirement: 'info',
  'Product Recommendation': 'info',
  Quotation: 'warning',
  Order: 'success',
  // orders
  Confirmed: 'info',
  'Payment Pending': 'warning',
  Processing: 'info',
  Packed: 'info',
  Dispatched: 'info',
  'Out for Delivery': 'info',
  Delivered: 'success',
  Completed: 'success',
  Cancelled: 'danger',
  Paid: 'success',
  'Partially Paid': 'warning',
  Overdue: 'danger',
  Refunded: 'neutral',
  'Not Dispatched': 'neutral',
  'Ready to Dispatch': 'warning',
  'In Transit': 'info',
  // tickets
  Acknowledged: 'info',
  'In Progress': 'info',
  'Waiting Customer': 'warning',
  Resolved: 'success',
  Closed: 'neutral',
  // priority + severity
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Urgent: 'danger',
  Critical: 'danger',
  // sla
  'On Track': 'success',
  Breached: 'danger',
  Met: 'success',
  Missed: 'danger',
  // complaint workflow
  'Complaint Received': 'info',
  'AI Intake': 'ai',
  Classification: 'info',
  Investigation: 'warning',
  'Human Review': 'warning',
  Resolution: 'success',
  'Customer Confirmation': 'info',
  CSAT: 'info',
  Disputed: 'danger',
  'Not Required': 'neutral',
  // stock
  'In Stock': 'success',
  'Low Stock': 'warning',
  'Out of Stock': 'danger',
  Discontinued: 'neutral',
  Draft: 'neutral',
  // calls, campaigns, automations
  'No Answer': 'warning',
  Voicemail: 'warning',
  Scheduled: 'info',
  Failed: 'danger',
  Running: 'success',
  Paused: 'warning',
  Success: 'success',
  Skipped: 'neutral',
  // sentiment
  Positive: 'success',
  Neutral: 'neutral',
  Negative: 'danger',
  // conversations
  Open: 'info',
  Escalated: 'danger',
  AI: 'ai',
  Human: 'neutral',
  // templates
  Approved: 'success',
  Rejected: 'danger',
  // growth + referral
  Suggested: 'info',
  Interested: 'success',
  Dismissed: 'neutral',
  'Referral Requested': 'info',
  'Contact Shared': 'info',
  'Lead Created': 'info',
  Converted: 'success',
  Issued: 'success',
  'Not Eligible': 'neutral',
  // tasks
  'To Do': 'neutral',
  Done: 'success',
  // integrations
  'Not connected': 'neutral',
};

export function toneOf(status: string): Tone {
  return TONES[status] ?? 'neutral';
}

export const INTENT_TONES: Record<string, Tone> = {
  Sales: 'info',
  Support: 'warning',
  Complaint: 'danger',
  Reorder: 'success',
  Feedback: 'ai',
  Referral: 'brand',
  General: 'neutral',
};

export const TONE_CLASSES: Record<Tone, { badge: string; dot: string; text: string; solid: string; soft: string }> = {
  success: { badge: 'bg-ok-50 text-ok-700 ring-ok-200', dot: 'bg-ok-500', text: 'text-ok-700', solid: 'bg-ok-500', soft: 'bg-ok-50' },
  warning: { badge: 'bg-warn-50 text-warn-700 ring-warn-200', dot: 'bg-warn-500', text: 'text-warn-700', solid: 'bg-warn-500', soft: 'bg-warn-50' },
  danger: { badge: 'bg-danger-50 text-danger-700 ring-danger-200', dot: 'bg-danger-500', text: 'text-danger-700', solid: 'bg-danger-500', soft: 'bg-danger-50' },
  info: { badge: 'bg-info-50 text-info-700 ring-info-200', dot: 'bg-info-500', text: 'text-info-700', solid: 'bg-info-500', soft: 'bg-info-50' },
  ai: { badge: 'bg-ai-50 text-ai-700 ring-ai-200', dot: 'bg-ai-500', text: 'text-ai-700', solid: 'bg-ai-500', soft: 'bg-ai-50' },
  neutral: { badge: 'bg-ink-50 text-ink-600 ring-ink-200', dot: 'bg-ink-400', text: 'text-ink-600', solid: 'bg-ink-400', soft: 'bg-ink-50' },
  brand: { badge: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-600', text: 'text-brand-700', solid: 'bg-brand-600', soft: 'bg-brand-50' },
};
