'use client';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_STYLE, CATEGORICAL, CHART_COLORS, GRID_STROKE } from './chart-theme';
import { ChartTooltip } from './tooltip';

export function BarChartCard({ data, color = CHART_COLORS.info, formatter, height = 220, multiColor, horizontal }: {
  data: { label: string; value: number }[]; color?: string; formatter?: (v: number) => string; height?: number; multiColor?: boolean; horizontal?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 6, right: 8, left: horizontal ? 8 : -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatter as any} />
            <YAxis type="category" dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={16} />
            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatter as any} width={44} />
          </>
        )}
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<ChartTooltip formatter={formatter} />} />
        <Bar dataKey="value" radius={[6, 6, 6, 6]} maxBarSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={multiColor ? CATEGORICAL[i % CATEGORICAL.length] : color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
