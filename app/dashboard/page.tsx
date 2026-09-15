import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateAccountForm } from "./create-account-form";
import { NewTransactionDialog } from "./new-transaction-dialog";
import { NewAccountDialog } from "./new-account-dialog";
import { DeleteAccountButton } from "./delete-account-button";
import { TransactionHistory } from "./transaction-history";
import { StatCard } from "./stat-card";
import { BalanceChart } from "./balance-chart";
import { MovementsBarChart } from "./movements-bar-chart";

type Account = {
  id: string;
  name: string;
  initial_balance: number;
};

type Transaction = {
  id: string;
  account_id: string;
  type: "gain" | "loss" | "wager";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

// El dinero se mueve al apostar (sale del saldo) y al ganar (vuelve el pago
// completo). "Pérdida" es solo informativa: esa parte de lo apostado ya salió
// del saldo y nunca vuelve, así que no se resta otra vez aquí.
function netAmount(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => {
    if (t.type === "gain") return sum + Number(t.amount);
    if (t.type === "wager") return sum - Number(t.amount);
    return sum;
  }, 0);
}

function wageredAmount(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.type === "wager")
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function buildChartData(totalInitial: number, transactions: Transaction[]) {
  const days: { date: string; label: string }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      label: i === 0 ? "Hoy" : WEEKDAYS[d.getDay()],
    });
  }

  return days.map(({ date, label }) => ({
    date,
    label,
    balance: totalInitial + netAmount(transactions.filter((t) => t.transaction_date <= date)),
  }));
}

function buildDailyBreakdown(transactions: Transaction[]) {
  const today = new Date();
  const days: { date: string; label: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      label: i === 0 ? "Hoy" : WEEKDAYS[d.getDay()],
    });
  }

  return days.map(({ date, label }) => {
    const dayTxs = transactions.filter((t) => t.transaction_date === date);
    const sum = (type: Transaction["type"]) =>
      dayTxs
        .filter((t) => t.type === type)
        .reduce((s, t) => s + Number(t.amount), 0);

    return {
      label,
      wager: sum("wager"),
      gain: sum("gain"),
      loss: sum("loss"),
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <main className="flex min-h-screen flex-1 flex-col items-center justify-center gap-6 p-8">
        <div className="flex w-full max-w-sm items-center justify-between">
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
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
      </main>
    );
  }

  const txs = transactions ?? [];
  const totalInitial = accounts.reduce((s, a) => s + Number(a.initial_balance), 0);
  const totalBalance = totalInitial + netAmount(txs);
  const today = new Date().toISOString().slice(0, 10);
  const todayTxs = txs.filter((t) => t.transaction_date === today);
  const todayNet = netAmount(todayTxs);
  const todayWagered = wageredAmount(todayTxs);
  const chartData = buildChartData(totalInitial, txs);
  const dailyBreakdown = buildDailyBreakdown(txs);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6 sm:p-8">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">BetZas</p>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge>Hoy</Badge>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Saldo actual" value={`$${totalBalance.toFixed(2)}`} />
        <StatCard
          label="Resultado de hoy"
          value={`${todayNet >= 0 ? "+" : "−"}$${Math.abs(todayNet).toFixed(2)}`}
          tone={todayNet >= 0 ? "good" : "critical"}
        />
        <StatCard label="Apostado hoy" value={`$${todayWagered.toFixed(2)}`} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Evolución del saldo</CardTitle>
          <span className="text-sm text-muted-foreground">Últimos 7 días</span>
        </CardHeader>
        <CardContent>
          <BalanceChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Apostado, ganancia y pérdida</CardTitle>
          <span className="text-sm text-muted-foreground">Últimos 7 días</span>
        </CardHeader>
        <CardContent>
          <MovementsBarChart data={dailyBreakdown} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {accounts.map((account: Account) => (
            <span
              key={account.id}
              className="flex items-center rounded-full bg-muted pl-3 pr-1.5 py-1 text-sm text-muted-foreground"
            >
              {account.name}
              <DeleteAccountButton accountId={account.id} accountName={account.name} />
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <NewAccountDialog />
          <NewTransactionDialog accounts={accounts} />
        </div>
      </div>

      <TransactionHistory transactions={txs} limit={8} />
    </main>
  );
}
