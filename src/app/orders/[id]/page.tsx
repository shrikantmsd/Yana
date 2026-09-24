'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Printer, Truck } from 'lucide-react';
import { useDemoData, useStore } from '@/state/store';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusMenu } from '@/components/ui/dropdown';
import { Timeline } from '@/components/ui/timeline';
import { EmptyState } from '@/components/ui/empty-state';
import { CustomerCell, CompanyCell, ProductCell, PersonName } from '@/components/shared/entity-cells';
import { formatDate, formatINR } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/types';
import { flowIndex, ORDER_FLOW } from '@/lib/order-flow';
import { cn } from '@/lib/cn';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const data = useDemoData();
  const { updateOrderStatus, updatePaymentStatus } = useStore();
  const router = useRouter();
  const order = data.orders.find((o) => o.id === id);

  if (!order) return <EmptyState title="Order not found" action={<Button onClick={() => router.push('/orders')} className="mt-2">Back to orders</Button>} />;

  const step = flowIndex(order.status);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-ink-800"><ArrowLeft size={14} /> Back</button>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="num font-display text-[19px] font-bold text-ink-900">{order.id}</h1>
            <p className="mt-0.5 text-[12.5px] text-ink-500">Placed {formatDate(order.orderedAt)} · Salesperson: <PersonName id={order.salespersonId} /></p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Printer size={13} /> Invoice</Button>
            <StatusMenu value={order.status} options={ORDER_STATUSES} onChange={(s) => updateOrderStatus(order.id, s)} />
          </div>
        </div>

        {order.status !== 'Cancelled' && (
          <div className="mt-5 flex items-center overflow-x-auto pb-1">
            {ORDER_FLOW.map((s, i) => (
              <div key={s} className="flex shrink-0 items-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold', i <= step ? 'bg-ok-500 text-white' : 'bg-ink-100 text-ink-400')}>{i + 1}</span>
                  <span className={cn('w-[70px] text-center text-[10px] leading-tight', i <= step ? 'font-medium text-ink-700' : 'text-ink-400')}>{s}</span>
                </div>
                {i < ORDER_FLOW.length - 1 && <span className={cn('mx-1 h-0.5 w-6 shrink-0', i < step ? 'bg-ok-400' : 'bg-ink-100')} />}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 sm:grid-cols-4">
          <div><p className="text-[11px] text-ink-500">Customer</p><div className="mt-1"><CustomerCell customerId={order.customerId} /></div></div>
          <div><p className="text-[11px] text-ink-500">Company</p><div className="mt-1"><CompanyCell companyId={order.companyId} /></div></div>
          <div><p className="text-[11px] text-ink-500">Payment</p><div className="mt-1"><StatusMenu value={order.paymentStatus} options={PAYMENT_STATUSES} onChange={(s) => updatePaymentStatus(order.id, s)} /></div></div>
          <div><p className="text-[11px] text-ink-500">Tracking ID</p><p className="num mt-1.5 text-[13px] font-medium text-ink-800">{order.trackingId ?? '—'}</p></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Items" />
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead><tr className="border-b border-line text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-5 py-2.5">Product</th><th className="px-3 py-2.5">Qty</th><th className="px-3 py-2.5">Unit Price</th><th className="px-3 py-2.5">Discount</th><th className="px-3 py-2.5">Tax</th><th className="px-5 py-2.5 text-right">Line Total</th>
            </tr></thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-2.5"><ProductCell sku={it.sku} /></td>
                  <td className="num px-3 py-2.5 text-[13px]">{it.quantity}</td>
                  <td className="num px-3 py-2.5 text-[13px]">{formatINR(it.unitPrice)}</td>
                  <td className="num px-3 py-2.5 text-[13px] text-ink-500">{it.discountPct}%</td>
                  <td className="num px-3 py-2.5 text-[13px] text-ink-500">{it.taxRate}%</td>
                  <td className="num px-5 py-2.5 text-right text-[13px] font-semibold">{formatINR(it.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1.5 border-t border-line px-5 py-4 sm:ml-auto sm:w-64">
          <div className="flex justify-between text-[12.5px] text-ink-500"><span>Subtotal</span><span className="num">{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between text-[12.5px] text-ink-500"><span>Discount</span><span className="num">−{formatINR(order.discount)}</span></div>
          <div className="flex justify-between text-[12.5px] text-ink-500"><span>Tax (GST)</span><span className="num">{formatINR(order.tax)}</span></div>
          <div className="flex justify-between border-t border-line pt-1.5 text-[14px] font-bold text-ink-900"><span>Total</span><span className="num">{formatINR(order.total)}</span></div>
        </div>
      </Card>

      {order.notes && <Card className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Notes</p><p className="mt-1 text-[13px] text-ink-600">{order.notes}</p></Card>}

      <Card>
        <CardHeader title="Order timeline" />
        <CardBody><Timeline events={order.timeline} /></CardBody>
      </Card>
    </div>
  );
}
