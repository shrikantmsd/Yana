'use client';
import { useState } from 'react';
import { Select } from '../ui/inputs';
import { RANGE_OPTIONS, resolveRange, type RangeKey } from '@/lib/ranges';
import { CITIES, CUSTOMER_TYPES, PRODUCT_CATEGORIES, ORDER_STATUSES } from '@/types';
import { TEAM } from '@/data/team';
import { Filter, RotateCcw } from 'lucide-react';

export interface DashboardFilters {
  range: RangeKey;
  city: string;
  customerType: string;
  category: string;
  salesperson: string;
  status: string;
}

export const DEFAULT_FILTERS: DashboardFilters = { range: '30d', city: '', customerType: '', category: '', salesperson: '', status: '' };

export function FilterBar({ filters, onChange }: { filters: DashboardFilters; onChange: (f: DashboardFilters) => void }) {
  const set = <K extends keyof DashboardFilters>(k: K, v: string) => onChange({ ...filters, [k]: v });
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white p-2.5">
      <span className="flex items-center gap-1.5 px-1 text-[11.5px] font-semibold text-ink-400"><Filter size={13} /> Filters</span>
      <Select value={filters.range} onChange={(v) => set('range', v)} className="w-36" options={RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))} />
      <Select value={filters.city} onChange={(v) => set('city', v)} className="w-32" placeholder="All cities" options={CITIES.map((c) => ({ value: c, label: c }))} />
      <Select value={filters.customerType} onChange={(v) => set('customerType', v)} className="w-40" placeholder="All customer types" options={CUSTOMER_TYPES.map((c) => ({ value: c, label: c }))} />
      <Select value={filters.category} onChange={(v) => set('category', v)} className="w-40" placeholder="All categories" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
      <Select value={filters.salesperson} onChange={(v) => set('salesperson', v)} className="w-36" placeholder="All salespeople" options={TEAM.filter((t) => t.role.startsWith('Sales')).map((t) => ({ value: t.id, label: t.name }))} />
      <Select value={filters.status} onChange={(v) => set('status', v)} className="w-36" placeholder="Any order status" options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))} />
      {dirty && (
        <button onClick={() => onChange(DEFAULT_FILTERS)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-700">
          <RotateCcw size={12} /> Reset
        </button>
      )}
    </div>
  );
}

export function useResolvedRange(key: RangeKey) {
  return resolveRange(key);
}
