export type Transaction = {
  id: string;
  account_id: string;
  type: "gain" | "loss" | "wager" | "withdrawal" | "deposit" | "income";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  batch_id: string | null;
};

// El dinero se mueve al apostar (sale del saldo), al ganar (vuelve el pago
// completo), al retirar (sale del saldo hacia afuera de la app) y al
// depositar (entra al saldo desde afuera). "Pérdida" es solo informativa: esa
// parte de lo apostado ya salió del saldo y nunca vuelve, así que no se resta
// otra vez aquí. "Ingreso" tampoco afecta el saldo: es dinero que cuentas
// como recuperado de tu inversión pero que nunca pasó por la cuenta.
export function netAmount(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => {
    if (t.type === "gain") return sum + Number(t.amount);
    if (t.type === "deposit") return sum + Number(t.amount);
    if (t.type === "wager") return sum - Number(t.amount);
    if (t.type === "withdrawal") return sum - Number(t.amount);
    return sum;
  }, 0);
}

// Cuánto de tu inversión llevas recuperado: lo que has metido (depósitos e
// ingresos) menos lo que has sacado (retiros). No incluye lo que ganas o
// pierdes apostando, solo el movimiento de tu propio dinero.
export function operationsTotal(transactions: Transaction[]) {
  return (
    sumType(transactions, "deposit") +
    sumType(transactions, "income") -
    sumType(transactions, "withdrawal")
  );
}

export function sumType(transactions: Transaction[], type: Transaction["type"]) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

// Qué tan bien te fue apostando: lo que te devolvieron las ganancias contra lo
// que pusiste en juego. A diferencia de netAmount, no incluye retiros (sacar
// dinero no es parte del resultado de tus apuestas).
export function bettingResult(transactions: Transaction[]) {
  return sumType(transactions, "gain") - sumType(transactions, "wager");
}

export const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// "todayStr" debe venir de todayInTZ() para anclar los periodos a la fecha
// local del usuario, no a UTC.
export function lastNMonths(n: number, todayStr: string) {
  const [y, m] = todayStr.split("-").map(Number);
  const months: { key: string; label: string }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: MONTH_LABELS[d.getUTCMonth()] });
  }

  return months;
}

export function lastNWeeks(n: number, todayStr: string) {
  const [y, m, d] = todayStr.split("-").map(Number);
  const today = new Date(Date.UTC(y, m - 1, d));
  const diffToMonday = (today.getUTCDay() + 6) % 7;
  const currentMonday = new Date(today);
  currentMonday.setUTCDate(today.getUTCDate() - diffToMonday);

  const weeks: { start: string; end: string; label: string }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(currentMonday);
    start.setUTCDate(currentMonday.getUTCDate() - i * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    weeks.push({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: `${start.getUTCDate()} ${MONTH_LABELS[start.getUTCMonth()]}`,
    });
  }

  return weeks;
}
