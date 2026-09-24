'use client';
import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ListPlus, Mail, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button, IconButton } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Timeline } from '@/components/ui/timeline';
import { JourneySteps } from '@/components/shared/journey-steps';
import { OrderLink, ProductCell } from '@/components/shared/entity-cells';
import { NewTaskModal } from '@/components/modals/new-task-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { ProbabilityMeter } from '@/components/ui/progress';
import { customerLifetimeStats } from '@/lib/kpi';
import { buildCustomerActivity, buildCustomerJourney } from '@/lib/customer-activity';
import { formatCompactINR, formatDate, formatINR, formatRelative } from '@/lib/format';
import { INTENT_TONES } from '@/lib/status';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const router = useRouter();
  const [tab, setTab] = useState('activity');
  const [taskOpen, setTaskOpen] = useState(false);

  const customer = data.customers.find((c) => c.id === id);
  const company = data.companies.find((c) => c.id === customer?.companyId);
  const orders = useMemo(() => data.orders.filter((o) => o.customerId === id).sort((a, b) => +new Date(b.orderedAt) - +new Date(a.orderedAt)), [data.orders, id]);
  const tickets = data.tickets.filter((t) => t.customerId === id);
  const complaints = data.complaints.filter((c) => c.customerId === id);
  const conversations = data.conversations.filter((c) => c.customerId === id);
  const growth = data.growthOpportunities.filter((g) => g.customerId === id);
  const reorders = data.reorderOpportunities.filter((r) => r.customerId === id);
  const referrals = data.referrals.filter((r) => r.referrerId === id);
  const stats = useMemo(() => customerLifetimeStats(data, id), [data, id]);
  const activity = useMemo(() => buildCustomerActivity(id, data), [data, id]);
  const journey = useMemo(() => buildCustomerJourney(id, data), [data, id]);

  if (!customer) {
    return <EmptyState title="Customer not found" description="This customer may have been part of a filtered view." action={<Button onClick={() => router.push('/customers')} className="mt-2">Back to customers</Button>} />;
  }

  const tabs = [
    { value: 'activity', label: 'Activity', count: activity.length },
    { value: 'orders', label: 'Orders', count: orders.length },
    { value: 'support', label: 'Support & Complaints', count: tickets.length + complaints.length },
    { value: 'growth', label: 'Growth', count: growth.length + reorders.length + referrals.length },
  ];

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800">
        <ArrowLeft size={14} /> Back
      </button>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <Avatar name={customer.name} size={52} className="text-[16px]" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[19px] font-bold text-ink-900">{customer.name}</h1>
                <StatusBadge status={customer.health} />
              </div>
              <p className="mt-0.5 text-[12.5px] text-ink-500">{customer.id} · {customer.role} at {company ? <Link href={`/companies/${company.id}`} className="font-medium text-brand-600 hover:underline">{company.name}</Link> : '—'}</p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink-600">
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-ink-400" /> {customer.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-ink-400" /> {customer.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-ink-400" /> {customer.city}, {customer.state}</span>
                <span className="flex items-center gap-1.5"><Calendar size={13} className="text-ink-400" /> Customer since {formatDate(customer.customerSince)}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Pill>{customer.customerType}</Pill>
                <StatusBadge status={customer.status} />
                <StatusBadge status={customer.whatsappStatus} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setTaskOpen(true)}><ListPlus size={14} /> New task</Button>
            <Button size="sm" onClick={() => router.push('/orders')}><ShoppingBag size={14} /> New order</Button>
          </div>
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Lifecycle</p>
          <JourneySteps steps={journey} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <Tabs items={tabs} value={tab} onChange={setTab} className="px-4" />
            <CardBody>
              {tab === 'activity' && <Timeline events={activity} />}

              {tab === 'orders' && (orders.length === 0 ? <EmptyState title="No orders yet" /> : (
                <div className="space-y-2.5">
                  {orders.map((o) => (
                    <button key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line p-3 text-left hover:bg-ink-50/70">
                      <div>
                        <p className="text-[13px] font-semibold text-ink-800"><OrderLink orderId={o.id} /></p>
                        <p className="mt-0.5 text-[11.5px] text-ink-400">{formatDate(o.orderedAt)} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="num text-[13px] font-semibold text-ink-800">{formatINR(o.total)}</span>
                        <StatusBadge status={o.status} />
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {tab === 'support' && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Support tickets</p>
                    {tickets.length === 0 ? <p className="text-[12.5px] text-ink-400">No tickets.</p> : (
                      <div className="space-y-2">
                        {tickets.map((t) => (
                          <button key={t.id} onClick={() => router.push(`/support/${t.id}`)} className="flex w-full items-center justify-between rounded-lg border border-line p-2.5 text-left hover:bg-ink-50/70">
                            <span className="min-w-0 truncate text-[12.5px] text-ink-700">{t.issue}</span>
                            <StatusBadge status={t.status} className="ml-2 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Complaints</p>
                    {complaints.length === 0 ? <p className="text-[12.5px] text-ink-400">No complaints.</p> : (
                      <div className="space-y-2">
                        {complaints.map((c) => (
                          <button key={c.id} onClick={() => router.push(`/complaints/${c.id}`)} className="flex w-full items-center justify-between rounded-lg border border-line p-2.5 text-left hover:bg-ink-50/70">
                            <span className="min-w-0 truncate text-[12.5px] text-ink-700">{c.category}: {c.description.slice(0, 50)}…</span>
                            <StatusBadge status={c.stage} className="ml-2 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">WhatsApp conversations</p>
                    {conversations.length === 0 ? <p className="text-[12.5px] text-ink-400">No conversations.</p> : (
                      <div className="space-y-2">
                        {conversations.map((c) => (
                          <Link key={c.id} href="/whatsapp" className="flex items-center justify-between rounded-lg border border-line p-2.5 hover:bg-ink-50/70">
                            <span className="min-w-0 truncate text-[12.5px] text-ink-700">{c.messages.at(-1)?.text}</span>
                            <Pill tone={INTENT_TONES[c.intent]} className="ml-2 shrink-0">{c.intent}</Pill>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'growth' && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Reorder opportunities</p>
                    {reorders.length === 0 ? <p className="text-[12.5px] text-ink-400">No repeat-purchase pattern detected yet.</p> : (
                      <div className="space-y-2">
                        {reorders.map((r) => (
                          <div key={r.id} className="flex items-center justify-between rounded-lg border border-line p-2.5">
                            <ProductCell sku={r.sku} />
                            <ProbabilityMeter value={r.probability} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Upsell &amp; cross-sell</p>
                    {growth.length === 0 ? <p className="text-[12.5px] text-ink-400">No suggestions right now.</p> : (
                      <div className="space-y-2">
                        {growth.map((g) => (
                          <div key={g.id} className="flex items-center justify-between rounded-lg border border-line p-2.5">
                            <span className="min-w-0 truncate text-[12.5px] text-ink-700">{g.kind}: {g.recommendedProduct}</span>
                            <StatusBadge status={g.status} className="ml-2 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Referrals made</p>
                    {referrals.length === 0 ? <p className="text-[12.5px] text-ink-400">No referrals yet.</p> : (
                      <div className="space-y-2">
                        {referrals.map((r) => (
                          <div key={r.id} className="flex items-center justify-between rounded-lg border border-line p-2.5">
                            <span className="text-[12.5px] text-ink-700">{r.newLeadCompany}</span>
                            <StatusBadge status={r.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Commercial metrics" />
            <CardBody className="space-y-3">
              <Metric label="Lifetime Revenue" value={formatCompactINR(stats.lifetimeRevenue)} />
              <Metric label="Total Orders" value={String(stats.totalOrders)} />
              <Metric label="Average Order Value" value={formatINR(stats.avgOrderValue)} />
              <Metric label="Last Order" value={formatRelative(stats.lastOrderAt)} />
              <Metric label="Expected Next Reorder" value={stats.expectedNextReorderAt ? formatDate(stats.expectedNextReorderAt) : '—'} />
              <Metric label="Purchase Frequency" value={stats.purchaseFrequencyDays ? `~${stats.purchaseFrequencyDays} days` : '—'} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Top products" />
            <CardBody className="space-y-2.5">
              {stats.topProducts.length === 0 ? <p className="text-[12.5px] text-ink-400">No orders yet.</p> : stats.topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[12.5px]">
                  <span className="min-w-0 truncate text-ink-700">{p.name}</span>
                  <span className="num shrink-0 font-semibold text-ink-800">×{p.qty}</span>
                </div>
              ))}
            </CardBody>
          </Card>
          {company && company.contacts.length > 1 && (
            <Card>
              <CardHeader title="Other contacts" subtitle={company.name} />
              <CardBody className="space-y-2.5">
                {company.contacts.filter((c) => c.customerId !== customer.id).map((c) => (
                  <div key={c.name} className="flex items-center gap-2.5">
                    <Avatar name={c.name} size={28} />
                    <div className="min-w-0">
                      <p className="truncate text-[12.5px] font-medium text-ink-800">{c.name}</p>
                      <p className="truncate text-[11px] text-ink-400">{c.role}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      <NewTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} customerId={customer.id} companyId={customer.companyId} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-ink-500">{label}</span>
      <span className="num text-[13px] font-semibold text-ink-800">{value}</span>
    </div>
  );
}
