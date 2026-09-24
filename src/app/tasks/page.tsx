'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2, ListChecks, ListPlus, TriangleAlert } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { Card } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { SegmentedControl } from '@/components/ui/tabs';
import { Select } from '@/components/ui/inputs';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { KanbanBoard, type KanbanColumn } from '@/components/ui/kanban';
import { CustomerCell, PersonName } from '@/components/shared/entity-cells';
import { NewTaskModal } from '@/components/modals/new-task-modal';
import { formatDate, daysUntil } from '@/lib/format';
import { TASK_TYPES, type Task, type TaskStatus } from '@/types';
import { TEAM } from '@/data/team';
import { cn } from '@/lib/cn';

const COLUMNS: KanbanColumn<TaskStatus>[] = [
  { value: 'To Do', label: 'To Do', accent: 'bg-ink-400' },
  { value: 'In Progress', label: 'In Progress', accent: 'bg-info-500' },
  { value: 'Done', label: 'Done', accent: 'bg-ok-500' },
];

export default function TasksPage() {
  const { tasks } = useDemoData();
  const { setTaskStatus } = useStore();
  const [view, setView] = useState('kanban');
  const [type, setType] = useState('');
  const [assignee, setAssignee] = useState('');
  const [newOpen, setNewOpen] = useState(false);

  const rows = useMemo(() => [...tasks].sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt)).filter((t) => {
    if (type && t.type !== type) return false;
    if (assignee && t.assignedTo !== assignee) return false;
    return true;
  }), [tasks, type, assignee]);

  const overdue = tasks.filter((t) => t.status !== 'Done' && daysUntil(t.dueAt) < 0).length;
  const dueToday = tasks.filter((t) => t.status !== 'Done' && Math.abs(daysUntil(t.dueAt)) < 0.5).length;
  const done = tasks.filter((t) => t.status === 'Done').length;

  const columns: Column<Task>[] = [
    { key: 'title', header: 'Task', sortValue: (t) => t.title, render: (t) => <div><p className="font-medium text-ink-800">{t.title}</p>{t.notes && <p className="truncate text-[11px] text-ink-400">{t.notes}</p>}</div> },
    { key: 'customer', header: 'Related to', render: (t) => t.customerId ? <CustomerCell customerId={t.customerId} showCompany={false} /> : <span className="text-ink-300">—</span> },
    { key: 'type', header: 'Type', sortValue: (t) => t.type, render: (t) => <span className="text-ink-500">{t.type}</span> },
    { key: 'assignee', header: 'Assigned To', render: (t) => <PersonName id={t.assignedTo} /> },
    { key: 'priority', header: 'Priority', sortValue: (t) => t.priority, render: (t) => <StatusBadge status={t.priority} /> },
    { key: 'due', header: 'Due', sortValue: (t) => t.dueAt, render: (t) => <span className={cn(daysUntil(t.dueAt) < 0 && t.status !== 'Done' ? 'font-medium text-danger-600' : 'text-ink-500')}>{formatDate(t.dueAt)}</span> },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => (
      <div className="flex gap-1">
        {(['To Do', 'In Progress', 'Done'] as TaskStatus[]).map((s) => (
          <button key={s} onClick={() => setTaskStatus(t.id, s)} className={cn('rounded-md px-1.5 py-1 text-[10px] font-semibold', t.status === s ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500 hover:bg-ink-200')}>{s}</button>
        ))}
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink-900">Tasks</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">{tasks.filter((t) => t.status !== 'Done').length} tasks open across the team.</p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl value={view} onChange={setView} items={[{ value: 'kanban', label: 'Kanban' }, { value: 'table', label: 'Table' }]} />
          <Button size="sm" onClick={() => setNewOpen(true)}><ListPlus size={14} /> New task</Button>
        </div>
      </div>
      <LifecycleStrip active={[]} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Overdue" value={String(overdue)} icon={TriangleAlert} tone="danger" />
        <KpiCard label="Due Today" value={String(dueToday)} icon={ListChecks} tone="warn" />
        <KpiCard label="Completed" value={String(done)} icon={CheckCircle2} tone="ok" />
        <KpiCard label="Total Tasks" value={String(tasks.length)} icon={ListChecks} tone="brand" />
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={type} onChange={setType} placeholder="All types" className="w-40" options={TASK_TYPES.map((t) => ({ value: t, label: t }))} />
          <Select value={assignee} onChange={setAssignee} placeholder="All team members" className="w-44" options={TEAM.map((t) => ({ value: t.id, label: t.name }))} />
        </div>
      </Card>

      {view === 'kanban' ? (
        <KanbanBoard
          columns={COLUMNS} items={rows} getId={(t) => t.id} getStage={(t) => t.status} onMove={(id, status) => setTaskStatus(id, status)}
          renderCard={(t) => (
            <div>
              <p className="text-[12.5px] font-semibold text-ink-800">{t.title}</p>
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge status={t.priority} />
                <span className={cn('text-[10.5px]', daysUntil(t.dueAt) < 0 && t.status !== 'Done' ? 'font-semibold text-danger-600' : 'text-ink-400')}>{formatDate(t.dueAt)}</span>
              </div>
            </div>
          )}
        />
      ) : (
        <Card><DataTable columns={columns} rows={rows} getRowId={(t) => t.id} pageSize={14} emptyTitle="No tasks match these filters" /></Card>
      )}
      <NewTaskModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}
