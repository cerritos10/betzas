import { Scale, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionHistory } from "../transaction-history";
import {
  netAmount,
  sumType,
  operationsTotal,
  lastNMonths,
  type Transaction,
} from "../calculations";
import { StatCard } from "../stat-card";
import { OperationForm } from "./operation-form";
import { OperationsChart } from "./operations-chart";
import { todayInTZ } from "@/lib/date";

function buildMonthlyOperations(transactions: Transaction[], todayStr: string) {
  return lastNMonths(6, todayStr).map(({ key, label }) => {
    const monthTxs = transactions.filter((t) => t.transaction_date.startsWith(key));
    return {
      label,
      income: sumType(monthTxs, "deposit") + sumType(monthTxs, "income"),
      withdrawal: sumType(monthTxs, "withdrawal"),
    };
  });
}

export default async function OperationsPage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("id, name, initial_balance"),
    supabase
      .from("transactions")
      .select("id, account_id, type, amount, description, transaction_date, created_at, batch_id")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const txs = transactions ?? [];
  const today = todayInTZ();

  const accountsWithBalance = (accounts ?? []).map((account) => ({
    id: account.id,
    name: account.name,
    balance:
      Number(account.initial_balance) +
      netAmount(txs.filter((t) => t.account_id === account.id)),
  }));

  const operations = txs.filter((t) =>
    ["withdrawal", "deposit", "income"].includes(t.type)
  );
  const total = operationsTotal(txs);
  const totalIncome = sumType(txs, "deposit") + sumType(txs, "income");
  const totalWithdrawn = sumType(txs, "withdrawal");
  const monthlyOperations = buildMonthlyOperations(txs, today);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Operaciones</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={total > 0 ? "Por recuperar" : "Recuperado (ganancia)"}
          value={total > 0 ? `$${total.toFixed(2)}` : `+$${Math.abs(total).toFixed(2)}`}
          icon={Scale}
          iconColor={total > 0 ? "aqua" : "good"}
          valueTone={total > 0 ? "neutral" : "good"}
        />
        <StatCard
          label="Total ingresos"
          value={`$${totalIncome.toFixed(2)}`}
          icon={ArrowDownToLine}
          iconColor="aqua"
        />
        <StatCard
          label="Total retirado"
          value={`$${totalWithdrawn.toFixed(2)}`}
          icon={ArrowUpFromLine}
          iconColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar operación</CardTitle>
            <CardDescription>
              Retiro, depósito (suma al saldo) o ingreso (no afecta el saldo).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountsWithBalance.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Primero crea una cuenta desde el Dashboard.
              </p>
            ) : (
              <OperationForm accounts={accountsWithBalance} />
            )}
          </CardContent>
        </Card>

        <TransactionHistory transactions={operations} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Ingresos y retiros por mes</CardTitle>
          <span className="text-sm text-muted-foreground">6 meses</span>
        </CardHeader>
        <CardContent>
          <OperationsChart data={monthlyOperations} />
        </CardContent>
      </Card>
    </div>
  );
}
