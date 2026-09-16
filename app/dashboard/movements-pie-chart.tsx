"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

type Slice = { key: keyof typeof COLORS; value: number };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Slice }[];
}) {
  if (!active || !payload?.length) return null;
  const { key, value } = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="flex items-center gap-1.5 text-sm">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: COLORS[key] }}
        />
        <span className="text-muted-foreground">{SERIES_LABEL[key]}</span>
        <span className="font-semibold">${value.toFixed(2)}</span>
      </p>
    </div>
  );
}

export function MovementsPieChart({
  wager,
  gain,
  loss,
  withdrawal,
}: {
  wager: number;
  gain: number;
  loss: number;
  withdrawal: number;
}) {
  const data: Slice[] = (
    [
      ["wager", wager],
      ["gain", gain],
      ["loss", loss],
      ["withdrawal", withdrawal],
    ] as const
  )
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ key, value }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Sin movimientos esta semana.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            strokeWidth={2}
            stroke="var(--card)"
          >
            {data.map((slice) => (
              <Cell key={slice.key} fill={COLORS[slice.key]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-sm">
        {data.map((slice) => (
          <span key={slice.key} className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[slice.key] }}
            />
            {SERIES_LABEL[slice.key]}
          </span>
        ))}
      </div>
    </div>
  );
}
