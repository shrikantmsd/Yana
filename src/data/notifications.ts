import { atDaysAgo } from '@/lib/format';
import type { AppNotification } from '@/types';

export const NOTIFICATIONS: AppNotification[] = [
  { id: 'N-1', title: 'Critical complaint needs review', body: 'Exterior Cleaner staining reported by Shine Detailing Studio.', at: atDaysAgo(0, 9, 12), tone: 'danger', href: '/complaints', read: false },
  { id: 'N-2', title: 'Glass Cleaner is out of stock', body: 'Expected replenishment is in 3 to 6 days.', at: atDaysAgo(0, 8, 30), tone: 'warning', href: '/inventory', read: false },
  { id: 'N-3', title: 'Reorder due: Prime Car Wash', body: 'No reply after 2 reminders. An AI voice call has been queued.', at: atDaysAgo(0, 7, 5), tone: 'ai', href: '/reorders', read: false },
  { id: 'N-4', title: 'New lead from Google Maps', body: 'Gloss Garage Studio in Mumbai. Welcome message sent.', at: atDaysAgo(1, 17, 40), tone: 'info', href: '/leads', read: true },
  { id: 'N-5', title: 'Deal won: Sunshine Motors', body: 'Referred by Kohinoor Motors. Referral reward is due.', at: atDaysAgo(2, 12, 0), tone: 'success', href: '/referrals', read: true },
  { id: 'N-6', title: 'SLA at risk on 2 support tickets', body: 'Both are waiting for a first response.', at: atDaysAgo(2, 10, 20), tone: 'warning', href: '/support', read: true },
  { id: 'N-7', title: 'WhatsApp template rejected', body: 'reactivation_offer needs changes before it can be used.', at: atDaysAgo(3, 15, 10), tone: 'danger', href: '/whatsapp', read: true },
];
