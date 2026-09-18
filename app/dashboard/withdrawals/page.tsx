import { Banknote, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionHistory } from "../transaction-history";
import { netAmount, sumType, type Transaction } from "../calculations";
import { StatCard } from "../stat-card";
import { WithdrawalForm } from "./withdrawal-form";
import { WithdrawalsChart } from "./withdrawals-chart";
import { todayInTZ } from "@/lib/date";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function lastSixMonths() {
  const [y, m] = todayInTZ().split("-").map(Number);
  const months: { key: string; label: string }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: MONTHS[d.getUTCMonth()] });
  }

  return months;
}

function buildMonthlyWithdrawals(withdrawals: Transaction[]) {
  return lastSixMonths().map(({ key, label }) => ({
    label,
    total: withdrawals
      .filter((t) => t.transaction_date.startsWith(key))
      .reduce((sum, t) => sum + Number(t.amount), 0),
  }));
}

export default async function WithdrawalsPage() {
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

  const accountsWithBalance = (accounts ?? []).map((account) => ({
    id: account.id,
    name: account.name,
    balance:
      Number(account.initial_balance) +
      netAmount(txs.filter((t) => t.account_id === account.id)),
  }));

  const withdrawals = txs.filter((t) => t.type === "withdrawal");
  const totalWithdrawn = sumType(txs, "withdrawal");
  const monthlyWithdrawals = buildMonthlyWithdrawals(withdrawals);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Retiros</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total retirado"
          value={`$${totalWithdrawn.toFixed(2)}`}
          icon={Banknote}
          iconColor="orange"
        />
        <StatCard
          label="Retiros realizados"
          value={`${withdrawals.length}`}
          icon={Receipt}
          iconColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Retirar</CardTitle>
            <CardDescription>
              El monto se resta directo del saldo de la cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accountsWithBalance.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Primero crea una cuenta desde el Dashboard.
              </p>
            ) : (
              <WithdrawalForm accounts={accountsWithBalance} />
            )}
          </CardContent>
        </Card>

        <TransactionHistory transactions={withdrawals} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Retiros por mes</CardTitle>
          <span className="text-sm text-muted-foreground">6 meses</span>
        </CardHeader>
        <CardContent>
          <WithdrawalsChart data={monthlyWithdrawals} />
        </CardContent>
      </Card>
    </div>
  );
}
