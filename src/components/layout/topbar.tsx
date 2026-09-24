'use client';
import { Menu } from 'lucide-react';
import { Breadcrumbs, useSectionLabel } from './breadcrumbs';
import { GlobalSearch } from './global-search';
import { NotificationsPanel } from './notifications-panel';
import { QuickActions } from './quick-actions';
import { Avatar } from '../ui/avatar';
import { useDemoData } from '@/state/store';
import { IconButton } from '../ui/button';

export function Topbar({ onOpenMobileNav, trail }: { onOpenMobileNav: () => void; trail?: string[] }) {
  const { currentUser } = useDemoData();
  const sectionLabel = useSectionLabel();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas/90 px-4 backdrop-blur sm:px-6">
      <IconButton onClick={onOpenMobileNav} className="md:hidden"><Menu size={18} /></IconButton>
      <div className="hidden shrink-0 md:block">
        <Breadcrumbs trail={trail} />
      </div>
      <p className="truncate text-[14px] font-semibold text-ink-900 md:hidden">{sectionLabel}</p>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        <span className="hidden items-center gap-1.5 rounded-full bg-warn-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-warn-700 ring-1 ring-inset ring-warn-200 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-warn-500" /> Demo
        </span>
        <QuickActions />
        <NotificationsPanel />
        <Avatar name={currentUser.name} size={32} className="hidden sm:inline-flex" />
      </div>
    </header>
  );
}
