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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Historial completo</h1>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
      </div>

      <TransactionHistory transactions={transactions ?? []} />
    </div>
  );
}
