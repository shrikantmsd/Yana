import {
  LayoutDashboard, Users, Building2, Target, Handshake, ShoppingCart, Package, Boxes, LifeBuoy, ShieldAlert,
  HeartHandshake, Megaphone, MessageCircle, PhoneCall, Repeat, TrendingUp, Gift, ListChecks, Workflow, ChartColumn, Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'openTickets' | 'openComplaints' | 'unreadConversations' | 'dueTasks';
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  { title: 'Overview', items: [{ href: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'Accounts',
    items: [
      { href: '/customers', label: 'Customers', icon: Users },
      { href: '/companies', label: 'Companies', icon: Building2 },
      { href: '/leads', label: 'Leads', icon: Target },
      { href: '/sales', label: 'Sales', icon: Handshake },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { href: '/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/products', label: 'Products', icon: Package },
      { href: '/inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    title: 'Care',
    items: [
      { href: '/support', label: 'Support', icon: LifeBuoy, badgeKey: 'openTickets' },
      { href: '/complaints', label: 'Complaints', icon: ShieldAlert, badgeKey: 'openComplaints' },
      { href: '/customer-success', label: 'Customer Success', icon: HeartHandshake },
    ],
  },
  {
    title: 'Growth',
    items: [
      { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, badgeKey: 'unreadConversations' },
      { href: '/ai-voice', label: 'AI Voice', icon: PhoneCall },
      { href: '/reorders', label: 'Reorders', icon: Repeat },
      { href: '/upsell-cross-sell', label: 'Upsell & Cross-sell', icon: TrendingUp },
      { href: '/referrals', label: 'Referrals', icon: Gift },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/tasks', label: 'Tasks', icon: ListChecks, badgeKey: 'dueTasks' },
      { href: '/automations', label: 'Automations', icon: Workflow },
      { href: '/reports', label: 'Reports', icon: ChartColumn },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { href: '/settings', label: 'Settings', icon: Settings };

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);
