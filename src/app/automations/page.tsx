'use client';
import { useState } from 'react';
import { Activity, CheckCircle2, Pause, Workflow, Zap } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/overlay';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { Automation } from '@/types';
import { cn } from '@/lib/cn';

export default function AutomationsPage() {
  const { automations } = useDemoData();
  const { setAutomationStatus } = useStore();
  const [active, setActive] = useState<Automation | null>(null);

  const activeCount = automations.filter((a) => a.status === 'Active').length;
  const totalRuns = automations.reduce((s, a) => s + a.runs, 0);
  const avgSuccess = automations.filter((a) => a.runs > 0).length
    ? Math.round(automations.filter((a) => a.runs > 0).reduce((s, a) => s + a.successRate, 0) / automations.filter((a) => a.runs > 0).length)
    : 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Automation Center</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">The rules that quietly run the customer lifecycle in the background.</p>
      </div>
      <LifecycleStrip active={[]} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Active Automations" value={String(activeCount)} icon={Workflow} tone="brand" />
        <KpiCard label="Total Runs" value={totalRuns.toLocaleString('en-IN')} icon={Zap} tone="ai" />
        <KpiCard label="Average Success Rate" value={`${avgSuccess}%`} icon={CheckCircle2} tone="ok" />
        <KpiCard label="Paused / Draft" value={String(automations.filter((a) => a.status !== 'Active').length)} icon={Pause} tone="warn" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {automations.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-ink-900">{a.name}</p>
                <p className="mt-0.5 text-[12px] text-ink-500">{a.description}</p>
              </div>
              <StatusBadge status={a.status} className="shrink-0" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink-500">
              <span>Trigger: <span className="font-medium text-ink-700">{a.trigger}</span></span>
              {a.runs > 0 && <span>{a.runs} runs · <span className={cn('font-medium', a.successRate >= 90 ? 'text-ok-600' : 'text-warn-600')}>{a.successRate}% success</span></span>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-400">
              <span>Last run: {a.lastRunAt ? formatRelative(a.lastRunAt) : 'never'}</span>
              {a.nextRunAt && <span>Next: {formatRelative(a.nextRunAt)}</span>}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setActive(a)}>View details</Button>
              {a.status !== 'Draft' && (
                <Button size="sm" variant={a.status === 'Active' ? 'ghost' : 'primary'} onClick={() => setAutomationStatus(a.id, a.status === 'Active' ? 'Paused' : 'Active')}>
                  {a.status === 'Active' ? <><Pause size={13} /> Pause</> : <><Activity size={13} /> Resume</>}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.name ?? ''} badge={active && <StatusBadge status={active.status} />}>
        {active && (
          <div className="space-y-4">
            <p className="text-[13px] text-ink-600">{active.description}</p>
            <Section label="Trigger" items={[active.trigger]} />
            {active.conditions.length > 0 && <Section label="Conditions" items={active.conditions} />}
            <Section label="Actions" items={active.actions} tone="text-ai-700" />
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Recent runs</p>
              {active.runLog.length === 0 ? <p className="text-[12.5px] text-ink-400">This automation hasn&apos;t run yet.</p> : (
                <div className="space-y-1.5">
                  {active.runLog.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-[12px]">
                      <span className="text-ink-600">{r.detail}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={r.result} />
                        <span className="text-ink-400">{formatRelative(r.at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Section({ label, items, tone }: { label: string; items: string[]; tone?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <ul className="space-y-1">{items.map((it, i) => <li key={i} className={cn('flex gap-1.5 text-[13px]', tone ?? 'text-ink-700')}><span>•</span>{it}</li>)}</ul>
    </div>
  );
}
