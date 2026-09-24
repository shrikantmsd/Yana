'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { AXIS_STYLE, CHART_COLORS, GRID_STROKE } from './chart-theme';
import { ChartTooltip } from './tooltip';

export function TrendChart({ data, color = CHART_COLORS.brand, formatter, height = 220, area = true }: {
  data: { label: string; value: number | null }[]; color?: string; formatter?: (v: number) => string; height?: number; area?: boolean;
}) {
  const Comp = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Comp data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} tickFormatter={formatter as any} width={44} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {area ? (
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#trendFill)" connectNulls dot={false} activeDot={{ r: 4 }} />
        ) : (
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} />
        )}
      </Comp>
    </ResponsiveContainer>
  );
}
