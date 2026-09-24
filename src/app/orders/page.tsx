'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoData } from '@/state/store';
import { LifecycleStrip } from '@/components/ui/lifecycle-strip';
import { MODULE_STAGES } from '@/lib/lifecycle';
import { SearchInput, Select } from '@/components/ui/inputs';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { CustomerCell } from '@/components/shared/entity-cells';
import { formatDate, formatINR } from '@/lib/format';
import { ORDER_STATUSES, PAYMENT_STATUSES, type Order } from '@/types';

export default function OrdersPage() {
  const { orders } = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState('');

  const rows = useMemo(() => [...orders].sort((a, b) => +new Date(b.orderedAt) - +new Date(a.orderedAt)).filter((o) => {
    if (status && o.status !== status) return false;
    if (payment && o.paymentStatus !== payment) return false;
    if (q && !`${o.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [orders, q, status, payment]);

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order', sortValue: (o) => o.id, render: (o) => <span className="num font-semibold text-ink-800">{o.id}</span> },
    { key: 'customer', header: 'Customer', render: (o) => <CustomerCell customerId={o.customerId} /> },
    { key: 'items', header: 'Items', sortValue: (o) => o.items.length, render: (o) => <span className="text-ink-500">{o.items.length}</span> },
    { key: 'total', header: 'Total', sortValue: (o) => o.total, render: (o) => <span className="num font-semibold">{formatINR(o.total)}</span> },
    { key: 'payment', header: 'Payment', sortValue: (o) => o.paymentStatus, render: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: 'status', header: 'Order Status', sortValue: (o) => o.status, render: (o) => <StatusBadge status={o.status} /> },
    { key: 'delivery', header: 'Delivery', sortValue: (o) => o.deliveryStatus, render: (o) => <span className="text-ink-500">{o.deliveryStatus}</span> },
    { key: 'date', header: 'Order Date', sortValue: (o) => o.orderedAt, render: (o) => <span className="text-ink-500">{formatDate(o.orderedAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Orders</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">{orders.length} orders recorded across all customers.</p>
      </div>
      <LifecycleStrip active={MODULE_STAGES.orders} />
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Search by order ID…" className="w-56" />
          <Select value={status} onChange={setStatus} placeholder="All statuses" className="w-40" options={ORDER_STATUSES.map((s) => ({ value: s, label: s }))} />
          <Select value={payment} onChange={setPayment} placeholder="All payment states" className="w-44" options={PAYMENT_STATUSES.map((s) => ({ value: s, label: s }))} />
        </div>
      </Card>
      <Card>
        <DataTable columns={columns} rows={rows} getRowId={(o) => o.id} onRowClick={(o) => router.push(`/orders/${o.id}`)} pageSize={14} emptyTitle="No orders match these filters" />
      </Card>
    </div>
  );
}
