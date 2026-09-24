'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { useDemoData } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatINR } from '@/lib/format';
import { displayName, stockStatus } from '@/lib/product';

export default function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = use(params);
  const data = useDemoData();
  const router = useRouter();
  const [tab, setTab] = useState('usage');
  const product = data.products.find((p) => p.sku === sku);

  if (!product) return <EmptyState title="Product not found" action={<Button onClick={() => router.push('/products')} className="mt-2">Back to products</Button>} />;

  const status = stockStatus(product);
  const recentOrders = data.orders.filter((o) => o.items.some((i) => i.sku === sku)).slice(-5).reverse();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl" style={{ background: `${product.imageColor}14` }}>
            <span className="h-16 w-10 rounded-sm" style={{ background: product.imageColor, opacity: 0.85 }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[19px] font-bold text-ink-900">{displayName(product)}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-500">{product.sku} · {product.category}</p>
            <p className="mt-2 text-[13px] text-ink-600">{product.description}</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <Price label="MRP" value={product.mrp} />
              <Price label="Dealer" value={product.dealerPrice} />
              <Price label="Distributor" value={product.distributorPrice} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Current Stock</p><p className="num mt-1 text-[16px] font-bold text-ink-900">{product.stock}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Reorder Level</p><p className="num mt-1 text-[16px] font-bold text-ink-900">{product.reorderLevel}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Monthly Velocity</p><p className="num mt-1 text-[16px] font-bold text-ink-900">{product.monthlyVelocity}</p></Card>
        <Card className="p-3.5"><p className="text-[11px] text-ink-500">Replenishment</p><p className="mt-1 text-[13px] font-semibold text-ink-800">{product.expectedReplenishmentAt ? formatDate(product.expectedReplenishmentAt) : '—'}</p></Card>
      </div>

      <Card>
        <Tabs items={[{ value: 'usage', label: 'Usage & Application' }, { value: 'compat', label: 'Compatibility' }, { value: 'faq', label: 'FAQ' }, { value: 'orders', label: 'Recent Orders' }]} value={tab} onChange={setTab} className="px-4" />
        <CardBody>
          {tab === 'usage' && (
            <div className="space-y-4">
              <div><p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Application</p><p className="text-[13px] text-ink-600">{product.application}</p></div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Usage instructions</p>
                <ol className="list-decimal space-y-1 pl-5 text-[13px] text-ink-600">{product.usageInstructions.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Precautions</p>
                <ul className="list-disc space-y-1 pl-5 text-[13px] text-danger-700">{product.precautions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
              {product.trainingVideo && (
                <div className="flex items-center gap-2.5 rounded-lg bg-ai-50 px-3.5 py-2.5 text-ai-700">
                  <PlayCircle size={18} /><span className="text-[13px] font-medium">{product.trainingVideo.title} · {product.trainingVideo.minutes} min training video</span>
                </div>
              )}
            </div>
          )}
          {tab === 'compat' && <div className="flex flex-wrap gap-1.5">{product.compatibility.map((c) => <Pill key={c} tone="success">{c}</Pill>)}</div>}
          {tab === 'faq' && (
            <div className="space-y-3">
              {product.faq.map((f, i) => (
                <div key={i}><p className="text-[13px] font-semibold text-ink-800">{f.q}</p><p className="mt-0.5 text-[13px] text-ink-600">{f.a}</p></div>
              ))}
            </div>
          )}
          {tab === 'orders' && (
            recentOrders.length === 0 ? <EmptyState title="No orders yet for this product" /> : (
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <button key={o.id} onClick={() => router.push(`/orders/${o.id}`)} className="flex w-full items-center justify-between rounded-lg border border-line p-2.5 text-left hover:bg-ink-50/70">
                    <span className="num text-[12.5px] font-medium text-ink-800">{o.id}</span>
                    <span className="text-[11.5px] text-ink-400">{formatDate(o.orderedAt)}</span>
                    <StatusBadge status={o.status} />
                  </button>
                ))}
              </div>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Price({ label, value }: { label: string; value: number }) {
  return <div><p className="text-[10.5px] uppercase tracking-wide text-ink-400">{label}</p><p className="num text-[15px] font-bold text-ink-900">{formatINR(value)}</p></div>;
}
