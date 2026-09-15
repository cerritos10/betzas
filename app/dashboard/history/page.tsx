import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TransactionHistory } from "../transaction-history";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount, description, transaction_date, created_at")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6 sm:p-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">BetZas</p>
          <h1 className="text-2xl font-semibold">Historial completo</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
      </header>

      <TransactionHistory transactions={transactions ?? []} />
    </main>
  );
}
