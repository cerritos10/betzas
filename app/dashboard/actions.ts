"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateAccountState = { error: string } | undefined;

export async function createAccount(
  _prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  const name = formData.get("name");
  const initialBalanceRaw = formData.get("initial_balance");

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Ingresa un nombre para la cuenta." };
  }

  const initialBalance = Number(initialBalanceRaw);
  if (!Number.isFinite(initialBalance) || initialBalance < 0) {
    return { error: "El saldo inicial debe ser un número válido mayor o igual a 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para crear una cuenta." };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    name: name.trim(),
    initial_balance: initialBalance,
  });

  if (error) {
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
}

export type CreateTransactionState = { error: string } | undefined;

function parseOptionalAmount(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

export async function createTransaction(
  _prevState: CreateTransactionState,
  formData: FormData
): Promise<CreateTransactionState> {
  const accountId = formData.get("account_id");
  const description = formData.get("description");
  const transactionDate = formData.get("transaction_date");

  if (typeof accountId !== "string" || !accountId) {
    return { error: "Selecciona una cuenta." };
  }

  const amounts = {
    wager: parseOptionalAmount(formData.get("wager")),
    gain: parseOptionalAmount(formData.get("gain")),
    loss: parseOptionalAmount(formData.get("loss")),
  };

  if (Object.values(amounts).some((v) => Number.isNaN(v) || v < 0)) {
    return { error: "Los montos deben ser números válidos mayores o iguales a 0." };
  }

  if (Object.values(amounts).every((v) => v === 0)) {
    return {
      error: "Ingresa al menos un monto: apostado, ganancia o pérdida.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para registrar un movimiento." };
  }

  const sharedFields = {
    account_id: accountId,
    user_id: user.id,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    ...(typeof transactionDate === "string" && transactionDate
      ? { transaction_date: transactionDate }
      : {}),
  };

  const rows = (
    [
      ["wager", amounts.wager],
      ["gain", amounts.gain],
      ["loss", amounts.loss],
    ] as const
  )
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({ ...sharedFields, type, amount }));

  const { error } = await supabase.from("transactions").insert(rows);

  if (error) {
    return { error: "No se pudo registrar el movimiento. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
}

export async function deleteAccount(accountId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
}
