"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const SERIES_COLOR = "#3987e5";

type Point = { label: string; date: string; balance: number };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Point }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs text-muted-foreground">{point.label}</p>
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <span
          className="inline-block h-0.5 w-3 rounded-full"
          style={{ backgroundColor: SERIES_COLOR }}
        />
        ${point.balance.toFixed(2)}
      </p>
    </div>
  );
}

export function BalanceChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={44}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: SERIES_COLOR, stroke: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: SERIES_COLOR, stroke: "var(--card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
