'use client';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/state/toast';
import { StoreProvider } from '@/state/store';
import { AppShell } from '../layout/app-shell';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StoreProvider>
        <AppShell>{children}</AppShell>
      </StoreProvider>
    </ToastProvider>
  );
}
