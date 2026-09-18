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

type MovementFormResult =
  | { ok: false; error: string }
  | {
      ok: true;
      accountId: string;
      amounts: { wager: number; gain: number; loss: number };
      description: string | null;
      transactionDate: string | null;
    };

function readMovementForm(formData: FormData): MovementFormResult {
  const accountId = formData.get("account_id");
  const description = formData.get("description");
  const transactionDate = formData.get("transaction_date");

  if (typeof accountId !== "string" || !accountId) {
    return { ok: false, error: "Selecciona una cuenta." };
  }

  const amounts = {
    wager: parseOptionalAmount(formData.get("wager")),
    gain: parseOptionalAmount(formData.get("gain")),
    loss: parseOptionalAmount(formData.get("loss")),
  };

  if (Object.values(amounts).some((v) => Number.isNaN(v) || v < 0)) {
    return {
      ok: false,
      error: "Los montos deben ser números válidos mayores o iguales a 0.",
    };
  }

  if (Object.values(amounts).every((v) => v === 0)) {
    return {
      ok: false,
      error: "Ingresa al menos un monto: apostado, ganancia o pérdida.",
    };
  }

  return {
    ok: true,
    accountId,
    amounts,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    transactionDate:
      typeof transactionDate === "string" && transactionDate
        ? transactionDate
        : null,
  };
}

export async function createTransaction(
  _prevState: CreateTransactionState,
  formData: FormData
): Promise<CreateTransactionState> {
  const parsed = readMovementForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para registrar un movimiento." };
  }

  const sharedFields = {
    account_id: parsed.accountId,
    user_id: user.id,
    description: parsed.description,
    batch_id: crypto.randomUUID(),
    ...(parsed.transactionDate ? { transaction_date: parsed.transactionDate } : {}),
  };

  const rows = (
    [
      ["wager", parsed.amounts.wager],
      ["gain", parsed.amounts.gain],
      ["loss", parsed.amounts.loss],
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

export type UpdateMovementState = { error: string } | undefined;

export async function updateMovement(
  _prevState: UpdateMovementState,
  formData: FormData
): Promise<UpdateMovementState> {
  const parsed = readMovementForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const memberIds = formData.getAll("member_id").filter((v): v is string => typeof v === "string");
  const batchIdRaw = formData.get("batch_id");
  const batchId = typeof batchIdRaw === "string" && batchIdRaw ? batchIdRaw : crypto.randomUUID();

  if (memberIds.length === 0) {
    return { error: "No se encontró el registro a editar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para editar un movimiento." };
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", memberIds)
    .eq("user_id", user.id);

  if (deleteError) {
    return { error: "No se pudo actualizar el movimiento. Intenta de nuevo." };
  }

  const sharedFields = {
    account_id: parsed.accountId,
    user_id: user.id,
    description: parsed.description,
    batch_id: batchId,
    ...(parsed.transactionDate ? { transaction_date: parsed.transactionDate } : {}),
  };

  const rows = (
    [
      ["wager", parsed.amounts.wager],
      ["gain", parsed.amounts.gain],
      ["loss", parsed.amounts.loss],
    ] as const
  )
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({ ...sharedFields, type, amount }));

  const { error: insertError } = await supabase.from("transactions").insert(rows);

  if (insertError) {
    return { error: "No se pudo actualizar el movimiento. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
}

export async function deleteMovement(ids: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("transactions").delete().in("id", ids).eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/withdrawals");
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
