'use client';
import { useMemo, useState } from 'react';
import { Bot, Phone, PhoneMissed, Smile, Timer } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Drawer } from '@/components/ui/overlay';
import { CustomerCell } from '@/components/shared/entity-cells';
import { formatDateTime, formatDuration, formatRelative } from '@/lib/format';
import { CALL_TYPES, type Call } from '@/types';

const SENTIMENT_TONE = { Positive: 'success', Neutral: 'neutral', Negative: 'danger' } as const;

export default function AiVoicePage() {
  const { calls } = useDemoData();
  const [callType, setCallType] = useState('');
  const [active, setActive] = useState<Call | null>(null);

  const rows = useMemo(() => calls.filter((c) => !callType || c.callType === callType), [calls, callType]);
  const completed = calls.filter((c) => c.status === 'Completed');
  const avgDuration = completed.length ? Math.round(completed.reduce((s, c) => s + c.durationSec, 0) / completed.length) : 0;
  const positive = completed.filter((c) => c.sentiment === 'Positive').length;

  const columns: Column<Call>[] = [
    { key: 'customer', header: 'Customer', render: (c) => <CustomerCell customerId={c.customerId} showCompany={false} /> },
    { key: 'type', header: 'Call Type', sortValue: (c) => c.callType, render: (c) => <span className="text-ink-500">{c.callType}</span> },
    { key: 'agent', header: 'Agent', render: (c) => <span className="flex items-center gap-1.5 text-ink-600"><Bot size={13} className="text-ai-600" /> {c.agent}</span> },
    { key: 'status', header: 'Status', sortValue: (c) => c.status, render: (c) => <StatusBadge status={c.status} /> },
    { key: 'duration', header: 'Duration', sortValue: (c) => c.durationSec, render: (c) => <span className="num text-ink-500">{formatDuration(c.durationSec)}</span> },
    { key: 'sentiment', header: 'Sentiment', render: (c) => c.sentiment ? <StatusBadge status={c.sentiment} /> : <span className="text-ink-300">—</span> },
    { key: 'when', header: 'When', sortValue: (c) => c.calledAt, render: (c) => <span className="text-ink-400">{formatRelative(c.calledAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">AI Voice</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{calls.length} calls placed by the AI voice agents — WhatsApp escalation, reorder follow-ups, feedback and recovery.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES['ai-voice']} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Calls" value={String(calls.length)} icon={Phone} tone="brand" />
        <KpiCard label="Completed" value={String(completed.length)} icon={Bot} tone="ai" />
        <KpiCard label="Avg. Duration" value={formatDuration(avgDuration)} icon={Timer} tone="info" />
        <KpiCard label="Positive Sentiment" value={String(positive)} icon={Smile} tone="ok" />
      </div>

      <Card className="p-3">
        <Select value={callType} onChange={setCallType} placeholder="All call types" className="w-52" options={CALL_TYPES.map((c) => ({ value: c, label: c }))} />
      </Card>

      <Card><DataTable columns={columns} rows={rows} getRowId={(c) => c.id} onRowClick={setActive} pageSize={12} emptyTitle="No calls match this filter" /></Card>

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.callType ?? ''} subtitle={active ? formatDateTime(active.calledAt) : ''} badge={active && <StatusBadge status={active.status} />}>
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-[11px] text-ink-500">Customer</p><div className="mt-1"><CustomerCell customerId={active.customerId} /></div></div>
              <div><p className="text-[11px] text-ink-500">Trigger</p><p className="mt-1 text-[12.5px] text-ink-700">{active.trigger}</p></div>
              <div><p className="text-[11px] text-ink-500">Duration</p><p className="num mt-1 text-[13px] font-semibold">{formatDuration(active.durationSec)}</p></div>
              <div><p className="text-[11px] text-ink-500">Sentiment</p>{active.sentiment ? <StatusBadge status={active.sentiment} className="mt-1" /> : <p className="mt-1 text-ink-300">—</p>}</div>
            </div>
            <div className="rounded-lg bg-ink-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Outcome</p>
              <p className="mt-1 text-[13px] text-ink-700">{active.outcome}</p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Next action</p>
              <p className="mt-1 text-[13px] text-ink-700">{active.nextAction}</p>
            </div>
            {active.transcript.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Transcript</p>
                <div className="space-y-2.5">
                  {active.transcript.map((line, i) => (
                    <div key={i} className={`flex ${line.speaker === 'AI' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] ${line.speaker === 'AI' ? 'bg-ai-600 text-white' : 'bg-white text-ink-800 shadow-card'}`}>
                        <p className="mb-0.5 flex items-center gap-1 text-[9.5px] font-semibold uppercase opacity-70">{line.speaker === 'AI' && <Bot size={10} />} {line.speaker}</p>
                        {line.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {active.crmUpdates.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">CRM updates from this call</p>
                <ul className="space-y-1">{active.crmUpdates.map((u, i) => <li key={i} className="text-[12.5px] text-ink-600">• {u}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
