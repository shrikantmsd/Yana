'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusMenu } from '@/components/ui/dropdown';
import { Timeline } from '@/components/ui/timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerCell, ProductCell, PersonName, OrderLink } from '@/components/shared/entity-cells';
import { formatDateTime } from '@/lib/format';
import { TICKET_STATUSES } from '@/types';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const { updateTicketStatus } = useStore();
  const router = useRouter();
  const ticket = data.tickets.find((t) => t.id === id);

  if (!ticket) return <EmptyState title="Ticket not found" action={<Button onClick={() => router.push('/support')} className="mt-2">Back to support</Button>} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="num font-display text-[18px] font-bold text-ink-900">{ticket.id}</h1>
              <StatusBadge status={ticket.priority} />
            </div>
            <p className="mt-1 max-w-md text-[13.5px] text-ink-700">{ticket.issue}</p>
          </div>
          <StatusMenu value={ticket.status} options={TICKET_STATUSES} onChange={(s) => updateTicketStatus(ticket.id, s)} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          <div><p className="text-[11px] text-ink-500">Customer</p><div className="mt-1"><CustomerCell customerId={ticket.customerId} showCompany={false} /></div></div>
          <div><p className="text-[11px] text-ink-500">Category</p><p className="mt-1.5 text-[13px] font-medium text-ink-800">{ticket.category}</p></div>
          <div><p className="text-[11px] text-ink-500">Channel</p><p className="mt-1.5 text-[13px] font-medium text-ink-800">{ticket.channel}</p></div>
          <div><p className="text-[11px] text-ink-500">Assigned to</p><p className="mt-1.5 text-[13px] font-medium text-ink-800"><PersonName id={ticket.assignedTo} /></p></div>
          {ticket.sku && <div><p className="text-[11px] text-ink-500">Product</p><div className="mt-1"><ProductCell sku={ticket.sku} /></div></div>}
          {ticket.orderId && <div><p className="text-[11px] text-ink-500">Related Order</p><p className="mt-1.5"><OrderLink orderId={ticket.orderId} /></p></div>}
          <div><p className="text-[11px] text-ink-500">SLA Due</p><p className="mt-1.5 text-[13px] font-medium text-ink-800">{formatDateTime(ticket.slaDueAt)}</p></div>
        </div>
        {ticket.resolution && (
          <div className="mt-4 rounded-lg bg-ok-50 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ok-700">Resolution</p>
            <p className="mt-0.5 text-[13px] text-ok-800">{ticket.resolution}</p>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Activity" />
        <CardBody><Timeline events={ticket.activity} /></CardBody>
      </Card>
    </div>
  );
}
