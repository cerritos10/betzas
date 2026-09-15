import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Transaction = {
  id: string;
  type: "gain" | "loss" | "wager";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

const TYPE_LABEL: Record<Transaction["type"], string> = {
  gain: "Ganancia",
  loss: "Pérdida",
  wager: "Apuesta",
};

function formatWhen(transaction: Transaction) {
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date(transaction.created_at).toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (transaction.transaction_date === today) {
    return `Hoy · ${time}`;
  }

  const date = new Date(`${transaction.transaction_date}T00:00:00`);
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

export function TransactionHistory({
  transactions,
  limit,
}: {
  transactions: Transaction[];
  limit?: number;
}) {
  const visible = limit ? transactions.slice(0, limit) : transactions;

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Movimientos recientes</CardTitle>
        {limit && transactions.length > limit && (
          <Link
            href="/dashboard/history"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todos →
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no has registrado movimientos.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {TYPE_LABEL[t.type]}
                    {t.description ? ` · ${t.description}` : ""}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatWhen(t)}
                  </span>
                </div>
                <span
                  className={
                    t.type === "gain"
                      ? "font-semibold text-[#0ca30c]"
                      : t.type === "loss"
                        ? "font-semibold text-[#d03b3b]"
                        : "font-semibold text-[#3987e5]"
                  }
                >
                  {t.type === "gain" ? "+" : t.type === "loss" ? "−" : ""}$
                  {Number(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
