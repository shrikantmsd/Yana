import { buildAccounts } from './accounts';
import { PRODUCT_SEEDS } from './products';
import { generateOrders } from './orders';
import { applyInventory } from './inventory';
import { assignHealth } from './health';
import { generateLeads, generateDeals } from './leads';
import { generateTickets, generateComplaints, generateFeedback } from './service';
import { buildConversations, TEMPLATES, buildCalls, CAMPAIGNS, buildCampaignInteractions, buildAutomations, buildReferrals, buildTasks, TEAM_NAMES } from './engagement';
import { generateReorderOpportunities } from './reorders';
import { generateGrowthOpportunities } from './growth';
import { generateSuccessJourneys } from './success';
import { NOTIFICATIONS } from './notifications';
import { TEAM, CURRENT_USER } from './team';
import type {
  AppNotification, Automation, Call, Campaign, CampaignInteraction, Company, Complaint, Conversation, Customer, Deal, Feedback,
  GrowthOpportunity, Lead, Order, Product, Referral, ReorderOpportunity, SuccessJourney, Task, TeamMember, Ticket, WhatsAppTemplate,
} from '@/types';

export interface DemoData {
  team: TeamMember[];
  currentUser: TeamMember;
  companies: Company[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  leads: Lead[];
  deals: Deal[];
  tickets: Ticket[];
  complaints: Complaint[];
  feedback: Feedback[];
  conversations: Conversation[];
  templates: WhatsAppTemplate[];
  calls: Call[];
  campaigns: Campaign[];
  campaignInteractions: CampaignInteraction[];
  automations: Automation[];
  referrals: Referral[];
  tasks: Task[];
  reorderOpportunities: ReorderOpportunity[];
  growthOpportunities: GrowthOpportunity[];
  successJourneys: SuccessJourney[];
  notifications: AppNotification[];
}

/** Builds the entire demo dataset once. Deterministic — same data every time the app loads. */
export function buildDemoData(): DemoData {
  const accounts = buildAccounts();
  const orders = generateOrders(accounts.customers, PRODUCT_SEEDS, accounts.stopByCompany);
  const products = applyInventory(PRODUCT_SEEDS, orders);
  const health = assignHealth(accounts.customers, accounts.companies, orders);
  const leads = generateLeads();
  const deals = generateDeals(leads, health.customers);
  const tickets = generateTickets(health.customers, orders, products);
  const complaints = generateComplaints(health.customers, orders, products);
  const feedback = generateFeedback(orders);
  const conversations = buildConversations(health.customers);
  const calls = buildCalls(health.customers);
  const campaignInteractions = buildCampaignInteractions(health.customers);
  const automations = buildAutomations(TEAM_NAMES);
  const referrals = buildReferrals(health.customers);
  const tasks = buildTasks(health.customers);
  const reorderOpportunities = generateReorderOpportunities(health.customers, orders, products);
  const growthOpportunities = generateGrowthOpportunities(health.customers, orders, products);
  const successJourneys = generateSuccessJourneys(health.customers, orders);

  return {
    team: TEAM,
    currentUser: CURRENT_USER,
    companies: health.companies,
    customers: health.customers,
    products,
    orders,
    leads,
    deals,
    tickets,
    complaints,
    feedback,
    conversations,
    templates: TEMPLATES,
    calls,
    campaigns: CAMPAIGNS,
    campaignInteractions,
    automations,
    referrals,
    tasks,
    reorderOpportunities,
    growthOpportunities,
    successJourneys,
    notifications: NOTIFICATIONS,
  };
}
