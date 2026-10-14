"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const GOOD = "#0ca30c";
const CRITICAL = "#d03b3b";

type Point = { label: string; result: number };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className="text-sm font-semibold"
        style={{ color: value >= 0 ? GOOD : CRITICAL }}
      >
        {value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}
      </p>
    </div>
  );
}

export function NetResultChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={48}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: number) => `$${value}`}
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="result" radius={[4, 4, 4, 4]} maxBarSize={28}>
            {data.map((point, i) => (
              <Cell key={i} fill={point.result >= 0 ? GOOD : CRITICAL} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
