'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './button';

export function Pagination({ page, pageCount, total, pageSize, onChange }: { page: number; pageCount: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-3">
      <p className="text-[12px] text-ink-500">
        <span className="num font-medium text-ink-700">{from}–{to}</span> of <span className="num font-medium text-ink-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <IconButton disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></IconButton>
        <span className="num px-1.5 text-[12px] font-medium text-ink-600">{page} / {Math.max(1, pageCount)}</span>
        <IconButton disabled={page >= pageCount} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></IconButton>
      </div>
    </div>
  );
}

export function usePagination<T>(rows: T[], pageSize = 10) {
  return { pageSize } as const;
}
