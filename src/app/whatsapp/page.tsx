'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Check, CheckCheck, Send, User, Workflow } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { CustomerCell } from '@/components/shared/entity-cells';
import { TextInput } from '@/components/ui/inputs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatRelative, formatTime } from '@/lib/format';
import { INTENT_TONES } from '@/lib/status';
import { MessageCircle, ListChecks } from 'lucide-react';

export default function WhatsAppPage() {
  const { conversations, templates, customers } = useDemoData();
  const { sendMessage, markConversationRead } = useStore();
  const [tab, setTab] = useState('inbox');
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? '');
  const [draft, setDraft] = useState('');

  const sorted = useMemo(() => [...conversations].sort((a, b) => +new Date(b.messages.at(-1)?.at ?? 0) - +new Date(a.messages.at(-1)?.at ?? 0)), [conversations]);
  const active = conversations.find((c) => c.id === activeId) ?? sorted[0];
  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const aiHandled = conversations.filter((c) => c.handler === 'AI').length;

  const openThread = (id: string) => { setActiveId(id); markConversationRead(id); };
  const send = () => { if (!draft.trim() || !active) return; sendMessage(active.id, draft.trim()); setDraft(''); };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">WhatsApp</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{conversations.length} conversations · {totalUnread} unread</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.whatsapp} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Open Conversations" value={String(conversations.filter((c) => c.status === 'Open' || c.status === 'Escalated').length)} icon={MessageCircle} tone="brand" />
        <KpiCard label="Handled by AI" value={String(aiHandled)} icon={Bot} tone="ai" />
        <KpiCard label="Approved Templates" value={String(templates.filter((t) => t.status === 'Approved').length)} icon={ListChecks} tone="ok" />
        <KpiCard label="Escalated" value={String(conversations.filter((c) => c.status === 'Escalated').length)} icon={User} tone="warn" />
      </div>

      <Card>
        <Tabs items={[{ value: 'inbox', label: 'Inbox' }, { value: 'templates', label: 'Templates' }, { value: 'analytics', label: 'Message Analytics' }]} value={tab} onChange={setTab} className="px-4" />

        {tab === 'inbox' && (
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]" style={{ minHeight: 520 }}>
            <div className="thin-scroll max-h-[560px] overflow-y-auto border-b border-line md:border-b-0 md:border-r">
              {sorted.map((c) => {
                const last = c.messages.at(-1);
                const customer = customers.find((x) => x.id === c.customerId);
                return (
                  <button key={c.id} onClick={() => openThread(c.id)} className={`flex w-full items-start gap-2.5 border-b border-line p-3 text-left hover:bg-ink-50 ${c.id === active?.id ? 'bg-brand-50/60' : ''}`}>
                    <Avatar name={customer?.name ?? '?'} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[12.5px] font-semibold text-ink-800">{customer?.name}</p>
                        <span className="shrink-0 text-[10px] text-ink-400">{last && formatTime(last.at)}</span>
                      </div>
                      <p className="truncate text-[11.5px] text-ink-500">{last?.text}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Pill tone={INTENT_TONES[c.intent]}>{c.intent}</Pill>
                        {c.handler === 'AI' && <Pill tone="ai">AI</Pill>}
                        {c.unread > 0 && <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9.5px] font-bold text-white">{c.unread}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col">
              {!active ? <EmptyState title="No conversation selected" /> : (
                <>
                  <div className="flex items-center justify-between border-b border-line p-3.5">
                    <CustomerCell customerId={active.customerId} />
                    <StatusBadge status={active.status} />
                  </div>
                  <div className="thin-scroll flex-1 space-y-3 overflow-y-auto bg-ink-50/40 p-4" style={{ maxHeight: 400 }}>
                    {active.messages.map((m) => {
                      const fromCustomer = m.sender === 'customer';
                      return (
                        <div key={m.id} className={`flex ${fromCustomer ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[12.5px] ${fromCustomer ? 'bg-white text-ink-800 shadow-card' : m.sender === 'ai' ? 'bg-ai-600 text-white' : m.sender === 'system' ? 'bg-ink-200 text-ink-600 italic' : 'bg-brand-600 text-white'}`}>
                            {m.text}
                            <div className={`mt-1 flex items-center gap-1 text-[9.5px] ${fromCustomer ? 'text-ink-400' : 'text-white/70'}`}>
                              {m.sender === 'ai' && <Bot size={10} />}
                              {formatTime(m.at)}
                              {!fromCustomer && (m.status === 'read' ? <CheckCheck size={11} /> : <Check size={11} />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-line p-3">
                    <p className="mb-1.5 truncate text-[11px] text-ink-400">Next action: {active.nextAction}</p>
                    <div className="flex gap-2">
                      <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a reply… (demo — not sent anywhere)" />
                      <button onClick={send} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700"><Send size={15} /></button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'templates' && (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {templates.map((t) => (
              <Card key={t.id} className="p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-ink-800">{t.name}</p>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-ink-400">{t.category} · {t.language}</p>
                <p className="mt-2 rounded-lg bg-ink-50 p-2.5 text-[12px] text-ink-600">{t.body}</p>
                <p className="mt-2 text-[11px] text-ink-400">Used by: {t.usedBy}</p>
              </Card>
            ))}
          </div>
        )}

        {tab === 'analytics' && (
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <Card className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">By intent</p>
              {(['Sales', 'Support', 'Complaint', 'Reorder', 'Feedback', 'Referral', 'General'] as const).map((intent) => {
                const count = conversations.filter((c) => c.intent === intent).length;
                return count > 0 ? (
                  <div key={intent} className="flex items-center justify-between py-1.5 text-[12.5px]"><Pill tone={INTENT_TONES[intent]}>{intent}</Pill><span className="num font-semibold text-ink-700">{count}</span></div>
                ) : null;
              })}
            </Card>
            <Card className="p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">AI vs human handling</p>
              <div className="flex items-center justify-between py-1.5 text-[12.5px]"><span className="flex items-center gap-1.5"><Bot size={14} className="text-ai-600" /> Handled by AI</span><span className="num font-semibold">{aiHandled}</span></div>
              <div className="flex items-center justify-between py-1.5 text-[12.5px]"><span className="flex items-center gap-1.5"><User size={14} className="text-ink-500" /> Handled by a person</span><span className="num font-semibold">{conversations.length - aiHandled}</span></div>
            </Card>
            <Link href="/campaigns" className="sm:col-span-2">
              <Card className="flex items-center justify-between p-4 hover:shadow-pop">
                <span className="text-[13px] font-medium text-ink-700">See WhatsApp campaign performance</span>
                <ArrowRight size={15} className="text-ink-400" />
              </Card>
            </Link>
            <Link href="/automations" className="sm:col-span-2">
              <Card className="flex items-center justify-between p-4 hover:shadow-pop">
                <span className="flex items-center gap-2 text-[13px] font-medium text-ink-700"><Workflow size={15} /> See WhatsApp automations (welcome, reminders, feedback requests)</span>
                <ArrowRight size={15} className="text-ink-400" />
              </Card>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
