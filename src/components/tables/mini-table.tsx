'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '../ui/card';
import { EmptyState } from '../ui/empty-state';

export function MiniTableCard<T>({
  title, subtitle, rows, columns, getRowId, getHref, viewAllHref, emptyLabel = 'Nothing to show right now',
}: {
  title: string; subtitle?: string; rows: T[]; columns: { header: string; render: (row: T) => React.ReactNode; className?: string }[];
  getRowId: (row: T) => string; getHref?: (row: T) => string; viewAllHref?: string; emptyLabel?: string;
}) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={viewAllHref && (
        <Link href={viewAllHref} className="flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700">View all <ArrowRight size={12} /></Link>
      )} />
      {rows.length === 0 ? (
        <EmptyState title={emptyLabel} />
      ) : (
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                {columns.map((c, i) => (
                  <th key={i} className={`whitespace-nowrap px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400 ${c.className ?? ''}`}>{c.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const href = getHref?.(row);
                return (
                  <tr
                    key={getRowId(row)}
                    className={`border-b border-line last:border-0 ${href ? 'cursor-pointer hover:bg-ink-50/70' : ''}`}
                    onClick={href ? () => router.push(href) : undefined}
                  >
                    {columns.map((c, i) => (
                      <td key={i} className={`px-4 py-2.5 text-[12.5px] text-ink-700 ${c.className ?? ''}`}>{c.render(row)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
