'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Calendar, Mail, MapPin, Phone, Star } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { StatusMenu } from '@/components/ui/dropdown';
import { Timeline } from '@/components/ui/timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { NewTaskModal } from '@/components/modals/new-task-modal';
import { formatCompactINR, formatDate, formatRelative } from '@/lib/format';
import { LEAD_STAGES } from '@/types';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const { updateLeadStage } = useStore();
  const router = useRouter();
  const [taskOpen, setTaskOpen] = useState(false);
  const lead = data.leads.find((l) => l.id === id);
  const deal = data.deals.find((d) => d.leadId === id);

  if (!lead) return <EmptyState title="Lead not found" action={<Button onClick={() => router.push('/leads')} className="mt-2">Back to leads</Button>} />;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <Avatar name={lead.company} size={48} />
            <div>
              <h1 className="font-display text-[18px] font-bold text-ink-900">{lead.company}</h1>
              <p className="mt-0.5 text-[12.5px] text-ink-500">{lead.id} · Contact: {lead.name}</p>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink-600">
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-ink-400" /> {lead.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-ink-400" /> {lead.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} className="text-ink-400" /> {lead.city}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusMenu value={lead.stage} options={LEAD_STAGES} onChange={(s) => updateLeadStage(lead.id, s)} />
            <Button variant="outline" size="sm" onClick={() => setTaskOpen(true)}>Create follow-up task</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Lead Score</p><p className="num mt-1 flex items-center gap-1 text-[16px] font-bold text-ink-900"><Star size={14} className="text-warn-500" /> {lead.score}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Est. Value</p><p className="num mt-1 text-[16px] font-bold text-ink-900">{formatCompactINR(lead.estimatedValue)}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Source</p><p className="mt-1 text-[13.5px] font-semibold text-ink-800">{lead.source}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Next Follow-up</p><p className="mt-1 text-[13.5px] font-semibold text-ink-800">{lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : '—'}</p></Card>
      </div>

      <Card>
        <CardHeader title="Requirement" subtitle={`Assigned to ${data.team.find((t) => t.id === lead.assignedTo)?.name ?? '—'}`} />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap gap-1.5">{lead.productInterest.map((p) => <Pill key={p}>{p}</Pill>)}</div>
          <p className="text-[13px] text-ink-600">{lead.notes}</p>
          {deal && (
            <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2.5">
              <span className="text-[12.5px] text-ink-600">Linked deal: <span className="font-medium text-ink-800">{deal.title}</span></span>
              <StatusBadge status={deal.stage} />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Activity timeline" />
        <CardBody><Timeline events={lead.activity} /></CardBody>
      </Card>
      <NewTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
    </div>
  );
}
