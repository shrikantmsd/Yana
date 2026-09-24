'use client';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { buildDemoData, type DemoData } from '@/data';
import { DEAL_STAGE_PROBABILITY, type ComplaintStage, type DealStage, type GrowthStatus, type LeadStage, type OrderStatus, type PaymentStatus, type ReorderAction, type TaskStatus, type TicketStatus } from '@/types';
import { buildOrderTimeline, derivedStatuses } from '@/lib/order-flow';
import { demoNow } from '@/lib/format';
import { useToast } from './toast';

interface StoreShape {
  data: DemoData;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  updateComplaintStage: (id: string, stage: ComplaintStage) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  updateDealStage: (id: string, stage: DealStage) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  addTask: (input: { title: string; type: DemoData['tasks'][number]['type']; assignedTo: string; priority: DemoData['tasks'][number]['priority']; dueAt: string; notes?: string; customerId?: string | null; companyId?: string | null }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setAutomationStatus: (id: string, status: 'Active' | 'Paused') => void;
  setGrowthStatus: (id: string, status: GrowthStatus) => void;
  setReorderAction: (id: string, action: ReorderAction) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationRead: (id: string) => void;
}

const StoreContext = createContext<StoreShape | null>(null);

function withEvent<T extends { activity: { id: string; at: string; kind: string; title: string; description?: string }[] }>(row: T, kind: string, title: string, description?: string): T {
  return { ...row, activity: [...row.activity, { id: `${'id' in row ? (row as any).id : 'e'}-${row.activity.length + 1}`, at: demoNow(), kind: kind as any, title, description }] };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => buildDemoData());
  const toast = useToast();

  const api = useMemo<StoreShape>(() => ({
    data,

    updateOrderStatus: (id, status) => {
      setData((d) => {
        const orders = d.orders.map((o) => {
          if (o.id !== id) return o;
          const updated = { ...o, status, ...derivedStatuses(status) };
          if (status === 'Delivered' || status === 'Completed') updated.deliveredAt = updated.deliveredAt ?? demoNow();
          updated.timeline = buildOrderTimeline(updated, Date.now());
          return updated;
        });
        return { ...d, orders };
      });
      toast({ title: 'Order updated', description: `${id} marked as ${status}`, tone: 'success' });
    },

    updatePaymentStatus: (id, status) => {
      setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)) }));
      toast({ title: 'Payment status updated', description: `${id} marked as ${status}`, tone: 'success' });
    },

    updateTicketStatus: (id, status) => {
      setData((d) => ({
        ...d,
        tickets: d.tickets.map((tkt) => {
          if (tkt.id !== id) return tkt;
          const done = status === 'Resolved' || status === 'Closed';
          const next = { ...tkt, status, resolvedAt: done ? tkt.resolvedAt ?? demoNow() : tkt.resolvedAt, closedAt: status === 'Closed' ? demoNow() : tkt.closedAt };
          return withEvent(next, 'support', `Status changed to ${status}`);
        }),
      }));
      toast({ title: 'Ticket updated', description: `${id} marked as ${status}`, tone: 'success' });
    },

    updateComplaintStage: (id, stage) => {
      setData((d) => ({
        ...d,
        complaints: d.complaints.map((c) => {
          if (c.id !== id) return c;
          const next = { ...c, stage, closedAt: stage === 'Closed' ? demoNow() : c.closedAt };
          return withEvent(next, 'complaint', `Moved to ${stage}`);
        }),
      }));
      toast({ title: 'Complaint updated', description: `${id} moved to ${stage}`, tone: 'success' });
    },

    updateLeadStage: (id, stage) => {
      setData((d) => ({
        ...d,
        leads: d.leads.map((l) => {
          if (l.id !== id) return l;
          const next = { ...l, stage, lastContactAt: demoNow() };
          return withEvent(next, 'lead', `Stage changed to ${stage}`);
        }),
      }));
      toast({ title: 'Lead updated', description: `Moved to ${stage}`, tone: 'success' });
    },

    updateDealStage: (id, stage) => {
      setData((d) => ({ ...d, deals: d.deals.map((deal) => (deal.id === id ? { ...deal, stage, probability: DEAL_STAGE_PROBABILITY[stage] } : deal)) }));
      toast({ title: 'Deal updated', description: `Moved to ${stage}`, tone: 'success' });
    },

    setTaskStatus: (id, status) =>
      setData((d) => ({ ...d, tasks: d.tasks.map((tsk) => (tsk.id === id ? { ...tsk, status } : tsk)) })),

    addTask: (input) => {
      setData((d) => ({
        ...d,
        tasks: [{ id: `TASK-${4001 + d.tasks.length + 1}`, status: 'To Do' as TaskStatus, source: 'Manual' as const, notes: input.notes ?? '', createdAt: demoNow(), customerId: input.customerId ?? null, companyId: input.companyId ?? null, ...input }, ...d.tasks],
      }));
      toast({ title: 'Task created', tone: 'success' });
    },

    markNotificationRead: (id) => setData((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    markAllNotificationsRead: () => setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),

    setAutomationStatus: (id, status) => {
      setData((d) => ({ ...d, automations: d.automations.map((a) => (a.id === id ? { ...a, status } : a)) }));
      toast({ title: status === 'Active' ? 'Automation resumed' : 'Automation paused', tone: 'success' });
    },

    setGrowthStatus: (id, status) => setData((d) => ({ ...d, growthOpportunities: d.growthOpportunities.map((g) => (g.id === id ? { ...g, status } : g)) })),

    setReorderAction: (id, action) => {
      setData((d) => ({ ...d, reorderOpportunities: d.reorderOpportunities.map((r) => (r.id === id ? { ...r, actionTaken: action, actionTakenAt: demoNow() } : r)) }));
      toast({ title: action === 'Reorder Same' ? 'Reorder created' : `${action} logged`, description: '(Demo action — nothing was actually sent.)', tone: 'success' });
    },

    sendMessage: (conversationId, text) =>
      setData((d) => ({
        ...d,
        conversations: d.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          const msg = { id: `${c.id}-m${c.messages.length + 1}`, conversationId, sender: 'agent' as const, text, at: demoNow(), status: 'sent' as const };
          return { ...c, messages: [...c.messages, msg], status: 'Open' as const, unread: 0, nextAction: 'Wait for the customer to reply' };
        }),
      })),

    markConversationRead: (id) => setData((d) => ({ ...d, conversations: d.conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) })),
  }), [data, toast]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useDemoData() {
  return useStore().data;
}
