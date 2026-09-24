'use client';
import { Bell, Check } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { formatRelative } from '@/lib/format';
import { TONE_CLASSES } from '@/lib/status';
import { useDemoData, useStore } from '@/state/store';
import { useOnClickOutside } from '@/lib/use-click-outside';
import { IconButton } from '../ui/button';

export function NotificationsPanel() {
  const { notifications } = useDemoData();
  const { markNotificationRead, markAllNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <IconButton onClick={() => setOpen((v) => !v)} className="relative">
        <Bell size={17} />
        {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[9.5px] font-bold text-white">{unread}</span>}
      </IconButton>
      {open && (
        <div className="anim-pop absolute right-0 top-11 z-30 w-[340px] rounded-xl border border-line bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-semibold text-ink-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-[11.5px] font-medium text-brand-600 hover:text-brand-700">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="thin-scroll max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => { markNotificationRead(n.id); setOpen(false); }}
                className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-ink-50"
              >
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-ink-200' : TONE_CLASSES[n.tone].solid}`} />
                <span className="min-w-0 flex-1">
                  <span className={`block text-[12.5px] ${n.read ? 'font-medium text-ink-600' : 'font-semibold text-ink-900'}`}>{n.title}</span>
                  <span className="mt-0.5 block text-[12px] text-ink-500">{n.body}</span>
                  <span className="mt-1 block text-[10.5px] text-ink-400">{formatRelative(n.at)}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
