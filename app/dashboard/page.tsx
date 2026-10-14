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
import { MovementsPeriodChart } from "./movements-period-chart";
import { NetResultPeriodChart } from "./net-result-period-chart";
import { MovementsPieChart } from "./movements-pie-chart";
import {
  netAmount,
  sumType,
  bettingResult,
  lastNMonths,
  lastNWeeks,
  type Transaction,
} from "./calculations";

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

function breakdownFor(transactions: Transaction[]) {
  return {
    wager: sumType(transactions, "wager"),
    gain: sumType(transactions, "gain"),
    loss: sumType(transactions, "loss"),
    withdrawal: sumType(transactions, "withdrawal"),
  };
}

function buildDailyBreakdown(transactions: Transaction[]) {
  return lastSevenDays().map(({ date, label }) => ({
    label,
    ...breakdownFor(transactions.filter((t) => t.transaction_date === date)),
  }));
}

function buildWeeklyBreakdown(transactions: Transaction[], todayStr: string) {
  return lastNWeeks(8, todayStr).map(({ start, end, label }) => ({
    label,
    ...breakdownFor(
      transactions.filter((t) => t.transaction_date >= start && t.transaction_date <= end)
    ),
  }));
}

function buildMonthlyBreakdown(transactions: Transaction[], todayStr: string) {
  return lastNMonths(6, todayStr).map(({ key, label }) => ({
    label,
    ...breakdownFor(transactions.filter((t) => t.transaction_date.startsWith(key))),
  }));
}

function buildDailyResult(transactions: Transaction[]) {
  return lastSevenDays().map(({ date, label }) => ({
    label,
    result: bettingResult(transactions.filter((t) => t.transaction_date === date)),
  }));
}

function buildWeeklyResult(transactions: Transaction[], todayStr: string) {
  return lastNWeeks(8, todayStr).map(({ start, end, label }) => ({
    label,
    result: bettingResult(
      transactions.filter((t) => t.transaction_date >= start && t.transaction_date <= end)
    ),
  }));
}

function buildMonthlyResult(transactions: Transaction[], todayStr: string) {
  return lastNMonths(6, todayStr).map(({ key, label }) => ({
    label,
    result: bettingResult(transactions.filter((t) => t.transaction_date.startsWith(key))),
  }));
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from("accounts").select("id, name, initial_balance"),
    supabase
      .from("transactions")
      .select("id, account_id, type, amount, description, transaction_date, created_at, batch_id")
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
  const todayResult = bettingResult(todayTxs);
  const todayWagered = sumType(todayTxs, "wager");
  const chartData = buildChartData(totalInitial, txs);
  const dailyBreakdown = buildDailyBreakdown(txs);
  const weeklyBreakdown = buildWeeklyBreakdown(txs, today);
  const monthlyBreakdown = buildMonthlyBreakdown(txs, today);
  const dailyResult = buildDailyResult(txs);
  const weeklyResult = buildWeeklyResult(txs, today);
  const monthlyResult = buildMonthlyResult(txs, today);
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
          value={`${todayResult >= 0 ? "+" : "−"}$${Math.abs(todayResult).toFixed(2)}`}
          icon={todayResult >= 0 ? TrendingUp : TrendingDown}
          iconColor={todayResult >= 0 ? "good" : "critical"}
          valueTone={todayResult >= 0 ? "good" : "critical"}
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
        <CardHeader>
          <CardTitle>Resultado neto</CardTitle>
          <CardDescription>Ganancia menos lo apostado en cada periodo.</CardDescription>
        </CardHeader>
        <CardContent>
          <NetResultPeriodChart
            daily={dailyResult}
            weekly={weeklyResult}
            monthly={monthlyResult}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apostado, ganancia y pérdida</CardTitle>
        </CardHeader>
        <CardContent>
          <MovementsPeriodChart
            daily={dailyBreakdown}
            weekly={weeklyBreakdown}
            monthly={monthlyBreakdown}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TransactionHistory transactions={txs} limit={8} />
        <AccountList accounts={accountsWithBalance} />
      </div>
    </div>
  );
}
