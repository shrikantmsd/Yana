'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { IconButton } from './button';

function useEscape(onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, onClose]);
}

export function Modal({ open, onClose, title, subtitle, children, footer, width = 'max-w-lg' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEscape(onClose, open);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="anim-fade absolute inset-0 bg-ink-950/45 backdrop-blur-[1px]" onClick={onClose} />
      <div className={cn('anim-pop relative flex max-h-[88vh] w-full flex-col rounded-2xl bg-white shadow-pop', width)}>
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-500">{subtitle}</p>}
          </div>
          <IconButton onClick={onClose}><X size={16} /></IconButton>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, subtitle, badge, children, footer, width = 'max-w-xl' }: {
  open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEscape(onClose, open);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="anim-fade absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div className={cn('anim-slide-l relative flex h-full w-full flex-col bg-white shadow-pop', width)}>
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-semibold text-ink-900">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{subtitle}</p>}
          </div>
          <IconButton onClick={onClose}><X size={16} /></IconButton>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'primary' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; confirmLabel?: string; tone?: 'primary' | 'danger';
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm" footer={
      <>
        <button onClick={onClose} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3.5 text-[13px] font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cn('inline-flex h-9 items-center rounded-lg px-3.5 text-[13px] font-medium text-white', tone === 'danger' ? 'bg-danger-600 hover:bg-danger-700' : 'bg-brand-600 hover:bg-brand-700')}
        >
          {confirmLabel}
        </button>
      </>
    }>
      <p className="text-[13px] text-ink-600">{description}</p>
    </Modal>
  );
}
