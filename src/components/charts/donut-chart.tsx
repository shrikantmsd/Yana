'use client';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORICAL } from './chart-theme';
import { ChartTooltip } from './tooltip';
import { formatCompact } from '@/lib/format';

export function DonutChart({ data, height = 220, colors = CATEGORICAL, centerLabel }: {
  data: { label: string; value: number }[]; height?: number; colors?: string[]; centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="92%" paddingAngle={2} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v: number) => `${formatCompact(v)} (${total ? Math.round((v / total) * 100) : 0}%)`} />} />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-lg font-bold text-ink-900">{formatCompact(total)}</span>
            <span className="text-[10.5px] text-ink-400">{centerLabel}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-2 sm:min-w-[130px]">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-[12px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="min-w-0 flex-1 truncate text-ink-600">{d.label}</span>
            <span className="num font-semibold text-ink-800">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
