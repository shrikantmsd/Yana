'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes, PackageCheck, PackageX, TriangleAlert } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { Card, CardHeader } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/badge';
import { SearchInput, Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { inventorySummary } from '@/lib/kpi';
import { formatDate, formatRelative } from '@/lib/format';
import { displayName, stockStatus } from '@/lib/product';
import { PRODUCT_CATEGORIES, type Product } from '@/types';

export default function InventoryPage() {
  const data = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const summary = useMemo(() => inventorySummary(data), [data]);

  const rows = useMemo(() => data.products.filter((p) => {
    if (category && p.category !== category) return false;
    if (q && !`${p.name} ${p.sku}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [data.products, q, category]);

  const columns: Column<Product>[] = [
    { key: 'sku', header: 'SKU', sortValue: (p) => p.sku, render: (p) => <span className="num text-ink-500">{p.sku}</span> },
    { key: 'name', header: 'Product', sortValue: (p) => p.name, render: (p) => <span className="font-medium text-ink-800">{displayName(p)}</span> },
    { key: 'stock', header: 'Current Stock', sortValue: (p) => p.stock, render: (p) => <span className="num font-semibold">{p.stock}</span> },
    { key: 'reorder', header: 'Reorder Level', sortValue: (p) => p.reorderLevel, render: (p) => <span className="num text-ink-500">{p.reorderLevel}</span> },
    { key: 'status', header: 'Stock Status', sortValue: (p) => stockStatus(p), render: (p) => <StatusBadge status={stockStatus(p)} /> },
    { key: 'movement', header: 'Last Movement', sortValue: (p) => p.lastMovement.at, render: (p) => <span className="text-ink-500">{p.lastMovement.type} · {formatRelative(p.lastMovement.at)}</span> },
    { key: 'eta', header: 'Expected Replenishment', sortValue: (p) => p.expectedReplenishmentAt ?? '', render: (p) => <span className="text-ink-500">{p.expectedReplenishmentAt ? formatDate(p.expectedReplenishmentAt) : '—'}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Inventory</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Stock levels across all warehouses, based on demo sales velocity.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total SKUs" value={String(summary.totalSkus)} icon={Boxes} tone="brand" />
        <KpiCard label="Total Stock (units)" value={summary.totalStock.toLocaleString('en-IN')} icon={PackageCheck} tone="info" />
        <KpiCard label="Low Stock" value={String(summary.lowStock)} icon={TriangleAlert} tone="warn" />
        <KpiCard label="Out of Stock" value={String(summary.outOfStock)} icon={PackageX} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fast-moving products" subtitle="By units sold per month" />
          <div className="divide-y divide-line px-5">
            {summary.fastMoving.map((p) => (
              <div key={p.sku} className="flex items-center justify-between py-2.5"><span className="truncate text-[13px] text-ink-700">{displayName(p)}</span><span className="num shrink-0 font-semibold text-ok-600">{p.monthlyVelocity}/mo</span></div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Slow-moving products" subtitle="By units sold per month" />
          <div className="divide-y divide-line px-5">
            {summary.slowMoving.map((p) => (
              <div key={p.sku} className="flex items-center justify-between py-2.5"><span className="truncate text-[13px] text-ink-700">{displayName(p)}</span><span className="num shrink-0 font-semibold text-ink-500">{p.monthlyVelocity}/mo</span></div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search by SKU or product…" className="w-64" />
          <Select value={category} onChange={setCategory} placeholder="All categories" className="w-52" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        </div>
      </Card>
      <Card>
        <DataTable columns={columns} rows={rows} getRowId={(p) => p.sku} onRowClick={(p) => router.push(`/products/${p.sku}`)} pageSize={12} defaultSort={{ key: 'status', dir: 'asc' }} emptyTitle="No products match these filters" />
      </Card>
    </div>
  );
}
