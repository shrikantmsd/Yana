'use client';
import { ListChecks, Plus, ShieldAlert, ShoppingCart, Target } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Dropdown, DropdownItem } from '../ui/dropdown';
import { NewTaskModal } from '../modals/new-task-modal';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const [taskOpen, setTaskOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Dropdown align="right" trigger={
        <Button size="sm" className="gap-1.5"><Plus size={14} /> <span className="hidden sm:inline">Quick action</span></Button>
      }>
        {(close) => (
          <>
            <DropdownItem icon={<ListChecks size={14} />} onClick={() => { close(); setTaskOpen(true); }}>New task</DropdownItem>
            <DropdownItem icon={<Target size={14} />} onClick={() => { close(); router.push('/leads'); }}>New lead</DropdownItem>
            <DropdownItem icon={<ShoppingCart size={14} />} onClick={() => { close(); router.push('/orders'); }}>New order</DropdownItem>
            <DropdownItem icon={<ShieldAlert size={14} />} onClick={() => { close(); router.push('/complaints'); }}>Log complaint</DropdownItem>
          </>
        )}
      </Dropdown>
      <NewTaskModal open={taskOpen} onClose={() => setTaskOpen(false)} />
    </>
  );
}
