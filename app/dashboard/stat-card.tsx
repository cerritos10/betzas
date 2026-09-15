import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "critical";
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-xl bg-muted/50 p-4 ring-1 ring-foreground/10">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-2xl font-semibold",
          tone === "good" && "text-[#0ca30c]",
          tone === "critical" && "text-[#d03b3b]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
