'use client';
import { useState } from 'react';
import { Modal } from '../ui/overlay';
import { Field, Select, TextArea, TextInput } from '../ui/inputs';
import { Button } from '../ui/button';
import { useStore } from '@/state/store';
import { TASK_TYPES, PRIORITIES } from '@/types';
import { TEAM } from '@/data/team';
import { fromDateInput, toDateInput, atDaysAhead } from '@/lib/format';

export function NewTaskModal({ open, onClose, customerId = null, companyId = null }: { open: boolean; onClose: () => void; customerId?: string | null; companyId?: string | null }) {
  const { addTask } = useStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<(typeof TASK_TYPES)[number]>('Follow-up');
  const [assignedTo, setAssignedTo] = useState(TEAM[0].id);
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>('Medium');
  const [dueDate, setDueDate] = useState(toDateInput(atDaysAhead(2)));
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    addTask({ title: title.trim(), type, assignedTo, priority, dueAt: fromDateInput(dueDate), notes, customerId, companyId });
    setTitle(''); setNotes('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New task" subtitle="Demo action — saved locally for this session" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!title.trim()}>Create task</Button>
      </>
    }>
      <div className="space-y-3.5">
        <Field label="Title">
          <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow up on the quotation" autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={type} onChange={(v) => setType(v as any)} options={TASK_TYPES.map((t) => ({ value: t, label: t }))} />
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(v) => setPriority(v as any)} options={PRIORITIES.map((p) => ({ value: p, label: p }))} />
          </Field>
          <Field label="Assigned to">
            <Select value={assignedTo} onChange={setAssignedTo} options={TEAM.map((t) => ({ value: t.id, label: t.name }))} />
          </Field>
          <Field label="Due date">
            <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context for whoever picks this up" />
        </Field>
      </div>
    </Modal>
  );
}
