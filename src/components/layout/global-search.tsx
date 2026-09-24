'use client';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { useDemoData } from '@/state/store';
import { useOnClickOutside } from '@/lib/use-click-outside';

interface Hit { group: string; id: string; title: string; subtitle: string; href: string }

export function GlobalSearch() {
  const d = useDemoData();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    const out: Hit[] = [];
    for (const c of d.customers) if (c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)) out.push({ group: 'Customers', id: c.id, title: c.name, subtitle: `${c.city} · ${c.customerType}`, href: `/customers/${c.id}` });
    for (const c of d.companies) if (c.name.toLowerCase().includes(query)) out.push({ group: 'Companies', id: c.id, title: c.name, subtitle: `${c.city} · ${c.customerType}`, href: `/companies/${c.id}` });
    for (const o of d.orders) if (o.id.toLowerCase().includes(query)) out.push({ group: 'Orders', id: o.id, title: o.id, subtitle: d.customers.find((c) => c.id === o.customerId)?.name ?? '', href: `/orders/${o.id}` });
    for (const p of d.products) if (p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)) out.push({ group: 'Products', id: p.sku, title: p.name, subtitle: p.sku, href: `/products/${p.sku}` });
    for (const l of d.leads) if (l.name.toLowerCase().includes(query) || l.company.toLowerCase().includes(query)) out.push({ group: 'Leads', id: l.id, title: l.company, subtitle: l.name, href: `/leads/${l.id}` });
    for (const t of d.tickets) if (t.id.toLowerCase().includes(query)) out.push({ group: 'Support', id: t.id, title: t.id, subtitle: t.issue.slice(0, 40), href: `/support/${t.id}` });
    return out.slice(0, 8);
  }, [q, d]);

  const go = (href: string) => { router.push(href); setOpen(false); setQ(''); };

  return (
    <div ref={ref} className="relative hidden w-full max-w-sm sm:block">
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search customers, orders, leads…"
        className="h-9 w-full rounded-lg border border-line-strong bg-ink-50/60 pl-9 pr-8 text-[13px] outline-none placeholder:text-ink-400 focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
      />
      {q && (
        <button onClick={() => setQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
          <X size={14} />
        </button>
      )}
      {open && q.trim().length >= 2 && (
        <div className="anim-pop absolute left-0 right-0 top-11 z-30 max-h-80 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-pop thin-scroll">
          {hits.length === 0 ? (
            <p className="px-3 py-4 text-center text-[12.5px] text-ink-400">No matches for "{q}"</p>
          ) : (
            hits.map((h) => (
              <button key={`${h.group}-${h.id}`} onClick={() => go(h.href)} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left hover:bg-ink-50">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink-800">{h.title}</span>
                  <span className="block truncate text-[11.5px] text-ink-400">{h.subtitle}</span>
                </span>
                <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500">{h.group}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
