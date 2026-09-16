import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_BG = {
  violet: "bg-[#9085e9]/15 text-[#9085e9]",
  good: "bg-[#0ca30c]/15 text-[#0ca30c]",
  critical: "bg-[#d03b3b]/15 text-[#d03b3b]",
  blue: "bg-[#3987e5]/15 text-[#3987e5]",
  orange: "bg-[#d95926]/15 text-[#d95926]",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  valueTone = "neutral",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: keyof typeof ICON_BG;
  valueTone?: "neutral" | "good" | "critical";
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className={cn("flex size-9 items-center justify-center rounded-lg", ICON_BG[iconColor])}>
        <Icon className="size-4.5" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "text-xl font-semibold",
            valueTone === "good" && "text-[#0ca30c]",
            valueTone === "critical" && "text-[#d03b3b]"
          )}
        >
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
