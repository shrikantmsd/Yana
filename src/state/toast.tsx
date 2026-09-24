'use client';
import { CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'warning';
}

const ToastContext = createContext<{ push: (t: Omit<Toast, 'id'>) => void } | null>(null);

const ICON = { success: CheckCircle, info: Info, warning: TriangleAlert };
const RING = { success: 'text-ok-600', info: 'text-info-600', warning: 'text-warn-600' };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${++counter.current}`;
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = (id: string) => setToasts((cur) => cur.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = ICON[toast.tone ?? 'info'];
          return (
            <div key={toast.id} className="anim-toast pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-pop">
              <Icon size={18} className={cn('mt-0.5 shrink-0', RING[toast.tone ?? 'info'])} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-[12.5px] text-ink-500">{toast.description}</p>}
              </div>
              <button onClick={() => dismiss(toast.id)} className="shrink-0 rounded-md p-0.5 text-ink-400 hover:bg-ink-50 hover:text-ink-600">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx.push;
}
