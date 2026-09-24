export function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-pop">
      {label && <p className="mb-1 text-[11px] font-medium text-ink-500">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5 text-[12px] font-medium text-ink-800">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name ? `${p.name}: ` : ''}{formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}
