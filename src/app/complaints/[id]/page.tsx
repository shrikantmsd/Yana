'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, FileText, Video } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusMenu } from '@/components/ui/dropdown';
import { Timeline } from '@/components/ui/timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerCell, ProductCell, PersonName, OrderLink } from '@/components/shared/entity-cells';
import { cn } from '@/lib/cn';
import { COMPLAINT_STAGES } from '@/types';

const EVIDENCE_ICON = { Photo: Camera, Video, Document: FileText };

export default function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const { updateComplaintStage } = useStore();
  const router = useRouter();
  const complaint = data.complaints.find((c) => c.id === id);

  if (!complaint) return <EmptyState title="Complaint not found" action={<Button onClick={() => router.push('/complaints')} className="mt-2">Back to complaints</Button>} />;

  const stepIdx = COMPLAINT_STAGES.indexOf(complaint.stage);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="num font-display text-[18px] font-bold text-ink-900">{complaint.id}</h1>
              <StatusBadge status={complaint.severity} />
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-500">{complaint.category} · Batch {complaint.batch}</p>
          </div>
          <StatusMenu value={complaint.stage} options={COMPLAINT_STAGES} onChange={(s) => updateComplaintStage(complaint.id, s)} />
        </div>

        <div className="mt-5 flex items-center overflow-x-auto pb-1">
          {COMPLAINT_STAGES.map((s, i) => (
            <div key={s} className="flex shrink-0 items-center">
              <div className="flex flex-col items-center gap-1">
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[9.5px] font-bold', i <= stepIdx ? 'bg-danger-500 text-white' : 'bg-ink-100 text-ink-400')}>{i + 1}</span>
                <span className={cn('w-[64px] text-center text-[9.5px] leading-tight', i <= stepIdx ? 'font-medium text-ink-700' : 'text-ink-400')}>{s}</span>
              </div>
              {i < COMPLAINT_STAGES.length - 1 && <span className={cn('mx-1 h-0.5 w-5 shrink-0', i < stepIdx ? 'bg-danger-300' : 'bg-ink-100')} />}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          <div><p className="text-[11px] text-ink-500">Customer</p><div className="mt-1"><CustomerCell customerId={complaint.customerId} showCompany={false} /></div></div>
          <div><p className="text-[11px] text-ink-500">Product</p><div className="mt-1"><ProductCell sku={complaint.sku} /></div></div>
          <div><p className="text-[11px] text-ink-500">Order</p><p className="mt-1.5"><OrderLink orderId={complaint.orderId} /></p></div>
          <div><p className="text-[11px] text-ink-500">Assigned to</p><p className="mt-1.5 text-[13px] font-medium text-ink-800"><PersonName id={complaint.assignedTo} /></p></div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Description</p>
          <p className="mt-1 text-[13px] text-ink-700">{complaint.description}</p>
        </div>

        {complaint.evidence.length > 0 && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Evidence</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {complaint.evidence.map((e) => {
                const Icon = EVIDENCE_ICON[e.kind];
                return <span key={e.id} className="flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[12px] font-medium text-ink-600"><Icon size={13} /> {e.label}</span>;
              })}
            </div>
          </div>
        )}
      </Card>

      {(complaint.rootCause || complaint.resolution) && (
        <Card>
          <CardHeader title="Root cause & resolution" />
          <CardBody className="space-y-3">
            {complaint.rootCause && <Field label="Root cause" value={complaint.rootCause} />}
            {complaint.correctiveAction && <Field label="Corrective action" value={complaint.correctiveAction} tone="text-info-700" />}
            {complaint.preventiveAction && <Field label="Preventive action" value={complaint.preventiveAction} tone="text-ai-700" />}
            {complaint.resolution && <Field label="Resolution" value={complaint.resolution} tone="text-ok-700" />}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[12px] text-ink-500">Customer confirmation: <StatusBadge status={complaint.customerConfirmation} className="ml-1" /></span>
              {complaint.csat && <span className="text-[12px] text-ink-500">CSAT: <span className="font-semibold text-ink-800">{complaint.csat}/5</span></span>}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Activity" />
        <CardBody><Timeline events={complaint.activity} /></CardBody>
      </Card>
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={cn('mt-0.5 text-[13px]', tone ?? 'text-ink-700')}>{value}</p>
    </div>
  );
}
