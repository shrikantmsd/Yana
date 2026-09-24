import type { LifecycleStage } from '@/types';

/** Which lifecycle stages each part of the app belongs to (used by the little "road" in page headers). */
export const MODULE_STAGES: Record<string, LifecycleStage[]> = {
  customers: ['Lead', 'Sales', 'Order', 'Reorder'],
  companies: ['Lead', 'Sales', 'Order', 'Reorder'],
  leads: ['Lead', 'Qualification'],
  sales: ['Sales'],
  orders: ['Order', 'Delivery'],
  products: ['Order', 'Product Usage'],
  inventory: ['Order', 'Delivery'],
  support: ['Support'],
  complaints: ['Complaint', 'Resolution'],
  'customer-success': ['Delivery', 'Product Usage', 'Customer Success', 'Feedback'],
  campaigns: ['Market', 'Marketing'],
  whatsapp: ['Marketing', 'Support', 'Reorder'],
  'ai-voice': ['Sales', 'Resolution', 'Reorder'],
  reorders: ['Reorder'],
  'upsell-cross-sell': ['Upsell', 'Cross-sell'],
  referrals: ['Referral', 'Lead'],
};
