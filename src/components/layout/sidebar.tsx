'use client';
import { ChevronsLeft, ChevronsRight, CircleHelp, HelpCircle, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { NAV_SECTIONS, SETTINGS_ITEM } from '@/config/nav';
import { useDemoData } from '@/state/store';
import { Avatar } from '../ui/avatar';

function useBadgeCounts() {
  const d = useDemoData();
  return {
    openTickets: d.tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length,
    openComplaints: d.complaints.filter((c) => c.stage !== 'Closed').length,
    unreadConversations: d.conversations.filter((c) => c.unread > 0).length,
    dueTasks: d.tasks.filter((t) => t.status !== 'Done').length,
  };
}

function NavLink({ href, label, icon: Icon, count, collapsed, onNavigate }: { href: string; label: string; icon: any; count?: number; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
        active ? 'bg-brand-50 text-brand-700' : 'text-ink-300 hover:bg-white/[0.06] hover:text-white',
        collapsed && 'justify-center px-0',
      )}
    >
      {active && !collapsed && <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />}
      <Icon size={17} className={cn('shrink-0', active ? 'text-brand-600' : 'text-ink-400 group-hover:text-white')} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!!count && !collapsed && (
        <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold', active ? 'bg-brand-100 text-brand-700' : 'bg-white/10 text-ink-200')}>{count}</span>
      )}
      {!!count && collapsed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-500" />}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: { collapsed: boolean; onToggle: () => void; mobileOpen: boolean; onCloseMobile: () => void }) {
  const counts = useBadgeCounts();
  const { currentUser } = useDemoData();

  const body = (
    <div className={cn('flex h-full flex-col bg-ink-950 text-white', collapsed ? 'w-[68px]' : 'w-64')}>
      <div className={cn('flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4', collapsed && 'justify-center px-0')}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-display text-[15px] font-bold">Y</span>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-[14.5px] font-bold tracking-wide">YANA MOTORS</p>
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-ink-400">OS</p>
          </div>
        )}
        <button onClick={onCloseMobile} className="ml-auto rounded-md p-1 text-ink-300 hover:bg-white/10 md:hidden">
          <X size={16} />
        </button>
      </div>

      <nav className="thin-scroll flex-1 space-y-4 overflow-y-auto px-2.5 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && <p className="mb-1 px-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-500">{section.title}</p>}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.href} {...item} count={item.badgeKey ? counts[item.badgeKey] : undefined} collapsed={collapsed} onNavigate={onCloseMobile} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-0.5 border-t border-white/10 px-2.5 py-3">
        <NavLink {...SETTINGS_ITEM} collapsed={collapsed} onNavigate={onCloseMobile} />
        <NavLink href="/help" label="Help" icon={CircleHelp} collapsed={collapsed} onNavigate={onCloseMobile} />
        <div className={cn('mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2', collapsed && 'justify-center px-0')}>
          <Avatar name={currentUser.name} size={28} />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12.5px] font-semibold text-white">{currentUser.name}</p>
              <p className="truncate text-[11px] text-ink-400">{currentUser.role}</p>
            </div>
          )}
        </div>
        <button onClick={onToggle} className={cn('mt-1 hidden w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-ink-400 hover:bg-white/[0.06] hover:text-white md:flex', collapsed && 'justify-center px-0')}>
          {collapsed ? <ChevronsRight size={16} /> : <><ChevronsLeft size={16} /> Collapse</>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden md:block">{body}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="anim-fade absolute inset-0 bg-ink-950/60" onClick={onCloseMobile} />
          <aside className="anim-slide-r absolute inset-y-0 left-0">{body}</aside>
        </div>
      )}
    </>
  );
}
