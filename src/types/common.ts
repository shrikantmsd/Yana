/**
 * Shared building blocks used by every module.
 * IDs are plain strings (e.g. "CUST-1001") so they map cleanly to database rows later.
 * Dates are ISO strings so they map to "timestamptz" columns later.
 */
export type ID = string;

export const CITIES = ['Mumbai', 'Pune', 'Bengaluru', 'Delhi', 'Hyderabad', 'Chennai', 'Ahmedabad'] as const;
export type City = (typeof CITIES)[number];

export const CITY_STATE: Record<City, string> = {
  Mumbai: 'Maharashtra',
  Pune: 'Maharashtra',
  Bengaluru: 'Karnataka',
  Delhi: 'Delhi',
  Hyderabad: 'Telangana',
  Chennai: 'Tamil Nadu',
  Ahmedabad: 'Gujarat',
};

export const CITY_REGION: Record<City, 'West' | 'South' | 'North'> = {
  Mumbai: 'West',
  Pune: 'West',
  Ahmedabad: 'West',
  Bengaluru: 'South',
  Hyderabad: 'South',
  Chennai: 'South',
  Delhi: 'North',
};

export const CUSTOMER_TYPES = [
  'Professional Detailer',
  'Car Wash',
  'Workshop',
  'Dealer',
  'Distributor',
  'Retailer',
  'Fleet Customer',
  'Corporate Customer',
] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const HEALTH_STATES = ['New', 'Active', 'High Value', 'At Risk', 'Dormant'] as const;
export type CustomerHealth = (typeof HEALTH_STATES)[number];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

/** The YANA MOTORS customer lifecycle, in order. */
export const LIFECYCLE_STAGES = [
  'Market',
  'Lead',
  'Marketing',
  'Qualification',
  'Sales',
  'Order',
  'Delivery',
  'Product Usage',
  'Customer Success',
  'Support',
  'Complaint',
  'Resolution',
  'Feedback',
  'Reorder',
  'Upsell',
  'Cross-sell',
  'Referral',
] as const;
export type LifecycleStage = (typeof LIFECYCLE_STAGES)[number];

export type TimelineKind =
  | 'lead'
  | 'whatsapp'
  | 'call'
  | 'sales'
  | 'order'
  | 'support'
  | 'complaint'
  | 'feedback'
  | 'campaign'
  | 'referral'
  | 'system';

export interface TimelineEvent {
  id: ID;
  at: string;
  kind: TimelineKind;
  title: string;
  description?: string;
  href?: string;
}

export interface TeamMember {
  id: ID;
  name: string;
  role: string;
  email: string;
  city?: City;
  active: boolean;
}
