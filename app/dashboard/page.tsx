import { Wallet, TrendingUp, TrendingDown, Dice5 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayInTZ } from "@/lib/date";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateAccountForm } from "./create-account-form";
import { NewTransactionDialog } from "./new-transaction-dialog";
import { TransactionHistory } from "./transaction-history";
import { AccountList } from "./account-list";
import { StatCard } from "./stat-card";
import { BalanceChart } from "./balance-chart";
import { MovementsBarChart } from "./movements-bar-chart";
import { MovementsPieChart } from "./movements-pie-chart";
import { netAmount, sumType, type Transaction } from "./calculations";

type Account = {
  id: string;
  name: string;
  initial_balance: number;
};

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function lastSevenDays() {
  const [y, m, d] = todayInTZ().split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d));
  const days: { date: string; label: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date(anchor);
    day.setUTCDate(day.getUTCDate() - i);
    days.push({
      date: day.toISOString().slice(0, 10),
      label: i === 0 ? "Hoy" : WEEKDAYS[day.getUTCDay()],
    });
  }

  return days;
}

function buildChartData(totalInitial: number, transactions: Transaction[]) {
  return lastSevenDays().map(({ date, label }) => ({
    date,
    label,
    balance:
      totalInitial +
      netAmount(transactions.filter((t) => t.transaction_date <= date)),
  }));
}

function buildDailyBreakdown(transactions: Transaction[]) {
  return lastSevenDays().map(({ date, label }) => {
    const dayTxs = transactions.filter((t) => t.transaction_date === date);
    return {
      label,
      wager: sumType(dayTxs, "wager"),
      gain: sumType(dayTxs, "gain"),
      loss: sumType(dayTxs, "loss"),
      withdrawal: sumType(dayTxs, "withdrawal"),
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("id, name, initial_balance"),
    supabase
      .from("transactions")
      .select("id, account_id, type, amount, description, transaction_date, created_at")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>
              Registra tu primera cuenta financiera con su saldo inicial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAccountForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  const txs = transactions ?? [];
  const totalInitial = accounts.reduce((s, a) => s + Number(a.initial_balance), 0);
  const totalBalance = totalInitial + netAmount(txs);
  const today = todayInTZ();
  const todayTxs = txs.filter((t) => t.transaction_date === today);
  const todayNet = netAmount(todayTxs);
  const todayWagered = sumType(todayTxs, "wager");
  const chartData = buildChartData(totalInitial, txs);
  const dailyBreakdown = buildDailyBreakdown(txs);
  const weekTxs = txs.filter((t) => chartData.some((d) => d.date === t.transaction_date));

  const accountsWithBalance = accounts.map((account: Account) => ({
    id: account.id,
    name: account.name,
    balance:
      Number(account.initial_balance) +
      netAmount(txs.filter((t) => t.account_id === account.id)),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <NewTransactionDialog accounts={accounts} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Saldo actual"
          value={`$${totalBalance.toFixed(2)}`}
          icon={Wallet}
          iconColor="violet"
        />
        <StatCard
          label="Resultado de hoy"
          value={`${todayNet >= 0 ? "+" : "−"}$${Math.abs(todayNet).toFixed(2)}`}
          icon={todayNet >= 0 ? TrendingUp : TrendingDown}
          iconColor={todayNet >= 0 ? "good" : "critical"}
          valueTone={todayNet >= 0 ? "good" : "critical"}
        />
        <StatCard
          label="Apostado hoy"
          value={`$${todayWagered.toFixed(2)}`}
          icon={Dice5}
          iconColor="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Evolución del saldo</CardTitle>
            <span className="text-sm text-muted-foreground">7 días</span>
          </CardHeader>
          <CardContent>
            <BalanceChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Distribución</CardTitle>
            <span className="text-sm text-muted-foreground">7 días</span>
          </CardHeader>
          <CardContent>
            <MovementsPieChart
              wager={sumType(weekTxs, "wager")}
              gain={sumType(weekTxs, "gain")}
              loss={sumType(weekTxs, "loss")}
              withdrawal={sumType(weekTxs, "withdrawal")}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Apostado, ganancia y pérdida</CardTitle>
          <span className="text-sm text-muted-foreground">Últimos 7 días</span>
        </CardHeader>
        <CardContent>
          <MovementsBarChart data={dailyBreakdown} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TransactionHistory transactions={txs} limit={8} />
        <AccountList accounts={accountsWithBalance} />
      </div>
    </div>
  );
}
