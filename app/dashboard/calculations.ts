export type Transaction = {
  id: string;
  account_id: string;
  type: "gain" | "loss" | "wager" | "withdrawal";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  batch_id: string | null;
};

// El dinero se mueve al apostar (sale del saldo), al ganar (vuelve el pago
// completo) y al retirar (sale del saldo hacia afuera de la app). "Pérdida"
// es solo informativa: esa parte de lo apostado ya salió del saldo y nunca
// vuelve, así que no se resta otra vez aquí.
export function netAmount(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => {
    if (t.type === "gain") return sum + Number(t.amount);
    if (t.type === "wager") return sum - Number(t.amount);
    if (t.type === "withdrawal") return sum - Number(t.amount);
    return sum;
  }, 0);
}

export function sumType(transactions: Transaction[], type: Transaction["type"]) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}
