"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  wager: "#3987e5",
  gain: "#0ca30c",
  loss: "#d03b3b",
  withdrawal: "#d95926",
} as const;

const SERIES_LABEL = {
  wager: "Apostado",
  gain: "Ganancia",
  loss: "Pérdida",
  withdrawal: "Retiro",
} as const;

type Point = {
  label: string;
  wager: number;
  gain: number;
  loss: number;
  withdrawal: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: keyof typeof COLORS; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[entry.dataKey] }}
            />
            <span className="text-muted-foreground">
              {SERIES_LABEL[entry.dataKey]}
            </span>
            <span className="font-semibold">${entry.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function LegendContent() {
  return (
    <div className="flex justify-center gap-4 pt-2 text-sm">
      {(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => (
        <span key={key} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: COLORS[key] }}
          />
          {SERIES_LABEL[key]}
        </span>
      ))}
    </div>
  );
}

export function MovementsBarChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
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
            width={44}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
          <Legend content={<LegendContent />} />
          <Bar dataKey="wager" fill={COLORS.wager} radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="gain" fill={COLORS.gain} radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="loss" fill={COLORS.loss} radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="withdrawal" fill={COLORS.withdrawal} radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
