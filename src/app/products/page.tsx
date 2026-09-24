'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { SearchInput, Select } from '@/components/ui/inputs';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { SegmentedControl } from '@/components/ui/tabs';
import { formatINR } from '@/lib/format';
import { displayName, stockStatus } from '@/lib/product';
import { PRODUCT_CATEGORIES } from '@/types';

export default function ProductsPage() {
  const { products } = useDemoData();
  const router = useRouter();
  const [view, setView] = useState('grid');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const rows = useMemo(() => products.filter((p) => {
    if (category && p.category !== category) return false;
    if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [products, q, category]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-ink-900">Products</h1>
          <p className="mt-0.5 text-[13px] text-ink-500">{products.length} SKUs in the YANA MOTORS catalogue.</p>
        </div>
        <SegmentedControl value={view} onChange={setView} items={[{ value: 'grid', label: 'Grid' }, { value: 'table', label: 'Table' }]} />
      </div>
      <LifecycleStrip active={MODULE_STAGES.products} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search products or SKU…" className="w-64" />
          <Select value={category} onChange={setCategory} placeholder="All categories" className="w-52" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        </div>
      </Card>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((p) => {
            const status = stockStatus(p);
            return (
              <button key={p.sku} onClick={() => router.push(`/products/${p.sku}`)} className="text-left">
                <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-pop">
                  <div className="flex h-24 items-center justify-center rounded-xl" style={{ background: `${p.imageColor}14` }}>
                    <span className="h-12 w-8 rounded-sm" style={{ background: p.imageColor, opacity: 0.85 }} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-[13.5px] font-semibold text-ink-900">{displayName(p)}</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">{p.sku} · {p.category}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="num text-[14px] font-bold text-ink-900">{formatINR(p.mrp)}</span>
                    <StatusBadge status={status} />
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead><tr className="border-b border-line text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-4 py-2.5">Product</th><th className="px-4 py-2.5">Category</th><th className="px-4 py-2.5">MRP</th><th className="px-4 py-2.5">Dealer Price</th><th className="px-4 py-2.5">Stock</th><th className="px-4 py-2.5">Status</th>
            </tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.sku} onClick={() => router.push(`/products/${p.sku}`)} className="cursor-pointer border-b border-line last:border-0 hover:bg-ink-50/70">
                  <td className="px-4 py-3"><p className="text-[13px] font-medium text-ink-800">{displayName(p)}</p><p className="text-[11px] text-ink-400">{p.sku}</p></td>
                  <td className="px-4 py-3 text-[13px] text-ink-500">{p.category}</td>
                  <td className="num px-4 py-3 text-[13px] font-semibold">{formatINR(p.mrp)}</td>
                  <td className="num px-4 py-3 text-[13px] text-ink-500">{formatINR(p.dealerPrice)}</td>
                  <td className="num px-4 py-3 text-[13px]">{p.stock}</td>
                  <td className="px-4 py-3"><StatusBadge status={stockStatus(p)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
