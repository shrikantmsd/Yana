'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface KanbanColumn<S extends string> {
  value: S;
  label: string;
  accent?: string;
}

export function KanbanBoard<T, S extends string>({
  columns, items, getId, getStage, onMove, renderCard, renderColumnFooter,
}: {
  columns: KanbanColumn<S>[]; items: T[]; getId: (item: T) => string; getStage: (item: T) => S; onMove: (id: string, stage: S) => void;
  renderCard: (item: T) => React.ReactNode; renderColumnFooter?: (stage: S, items: T[]) => React.ReactNode;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<S | null>(null);

  return (
    <div className="thin-scroll flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => {
        const colItems = items.filter((it) => getStage(it) === col.value);
        return (
          <div
            key={col.value}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.value); }}
            onDragLeave={() => setOverCol((c) => (c === col.value ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) onMove(dragId, col.value);
              setDragId(null);
              setOverCol(null);
            }}
            className={cn('flex w-[264px] shrink-0 flex-col rounded-xl bg-ink-50/70 transition-colors', overCol === col.value && 'bg-brand-50 ring-2 ring-brand-200')}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', col.accent ?? 'bg-ink-400')} />
                <span className="text-[12.5px] font-semibold text-ink-700">{col.label}</span>
              </div>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-500 ring-1 ring-line">{colItems.length}</span>
            </div>
            <div className="thin-scroll flex max-h-[560px] flex-col gap-2 overflow-y-auto px-2 pb-2">
              {colItems.map((item) => (
                <div
                  key={getId(item)}
                  draggable
                  onDragStart={() => setDragId(getId(item))}
                  onDragEnd={() => setDragId(null)}
                  className={cn('cursor-grab rounded-lg bg-white p-3 shadow-card ring-1 ring-line active:cursor-grabbing', dragId === getId(item) && 'opacity-50')}
                >
                  {renderCard(item)}
                </div>
              ))}
              {colItems.length === 0 && <div className="rounded-lg border border-dashed border-line-strong py-6 text-center text-[11.5px] text-ink-400">Drop here</div>}
            </div>
            {renderColumnFooter && <div className="px-3 pb-2.5 pt-1">{renderColumnFooter(col.value, colItems)}</div>}
          </div>
        );
      })}
    </div>
  );
}
