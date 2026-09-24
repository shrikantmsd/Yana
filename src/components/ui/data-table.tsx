'use client';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { EmptyState } from './empty-state';
import { Pagination } from './pagination';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  headerClassName?: string;
}

export function DataTable<T>({
  columns, rows, getRowId, onRowClick, pageSize = 10, emptyTitle = 'Nothing here yet', emptyDescription, defaultSort, dense,
}: {
  columns: Column<T>[]; rows: T[]; getRowId: (row: T) => string; onRowClick?: (row: T) => void; pageSize?: number;
  emptyTitle?: string; emptyDescription?: string; defaultSort?: { key: string; dir: 'asc' | 'desc' }; dense?: boolean;
}) {
  const [sort, setSort] = useState(defaultSort ?? null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortValue) return;
    setSort((cur) => (cur?.key === col.key ? { key: col.key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key: col.key, dir: 'asc' }));
  };

  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div>
      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {columns.map((col) => (
                <th key={col.key} className={cn('whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400', col.headerClassName)}>
                  {col.sortValue ? (
                    <button onClick={() => toggleSort(col)} className="inline-flex items-center gap-1 hover:text-ink-600">
                      {col.header}
                      {sort?.key === col.key ? sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} /> : <ArrowUpDown size={11} className="opacity-40" />}
                    </button>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={() => onRowClick?.(row)}
                className={cn('border-b border-line last:border-0', onRowClick && 'cursor-pointer hover:bg-ink-50/70')}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 text-[13px] text-ink-700', dense ? 'py-2' : 'py-3', col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={clampedPage} pageCount={pageCount} total={sorted.length} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
