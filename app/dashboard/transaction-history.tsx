import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { todayInTZ } from "@/lib/date";
import type { Transaction } from "./calculations";
import { MovementGroupRow, type MovementGroup } from "./movement-group-row";

function formatWhen(transactionDate: string, createdAt: string) {
  const today = todayInTZ();
  const time = new Date(createdAt).toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (transactionDate === today) {
    return `Hoy · ${time}`;
  }

  const date = new Date(`${transactionDate}T00:00:00`);
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function groupTransactions(transactions: Transaction[]): MovementGroup[] {
  const order: string[] = [];
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const key = t.batch_id ?? t.id;
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(t);
  }

  return order.map((key) => {
    const members = groups.get(key)!;
    const first = members[0];

    return {
      key,
      ids: members.map((m) => m.id),
      batchId: first.batch_id,
      accountId: first.account_id,
      date: first.transaction_date,
      when: formatWhen(first.transaction_date, first.created_at),
      description: first.description,
      members: members.map((m) => ({ type: m.type, amount: Number(m.amount) })),
      editable: members.every((m) => m.type !== "withdrawal"),
    };
  });
}

export function TransactionHistory({
  transactions,
  limit,
}: {
  transactions: Transaction[];
  limit?: number;
}) {
  const groups = groupTransactions(transactions);
  const visible = limit ? groups.slice(0, limit) : groups;

  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Movimientos recientes</CardTitle>
        {limit && groups.length > limit && (
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
            {visible.map((group) => (
              <MovementGroupRow key={group.key} group={group} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
