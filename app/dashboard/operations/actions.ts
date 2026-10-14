"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateOperationState = { error: string } | undefined;

const OPERATION_TYPES = ["withdrawal", "income", "deposit"] as const;
type OperationType = (typeof OPERATION_TYPES)[number];

const ERROR_BY_TYPE: Record<OperationType, string> = {
  withdrawal: "No se pudo registrar el retiro. Intenta de nuevo.",
  income: "No se pudo registrar el ingreso. Intenta de nuevo.",
  deposit: "No se pudo registrar el depósito. Intenta de nuevo.",
};

const UPDATE_ERROR_BY_TYPE: Record<OperationType, string> = {
  withdrawal: "No se pudo actualizar el retiro. Intenta de nuevo.",
  income: "No se pudo actualizar el ingreso. Intenta de nuevo.",
  deposit: "No se pudo actualizar el depósito. Intenta de nuevo.",
};

type OperationFormResult =
  | { ok: false; error: string }
  | {
      ok: true;
      accountId: string;
      type: OperationType;
      amount: number;
      description: string | null;
      transactionDate: string | null;
    };

function readOperationForm(formData: FormData): OperationFormResult {
  const accountId = formData.get("account_id");
  const type = formData.get("type");
  const amountRaw = formData.get("amount");
  const description = formData.get("description");
  const transactionDate = formData.get("transaction_date");

  if (typeof accountId !== "string" || !accountId) {
    return { ok: false, error: "Selecciona una cuenta." };
  }

  if (typeof type !== "string" || !OPERATION_TYPES.includes(type as OperationType)) {
    return { ok: false, error: "Selecciona el tipo de operación." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "El monto debe ser un número mayor a 0." };
  }

  return {
    ok: true,
    accountId,
    type: type as OperationType,
    amount,
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

export async function createOperation(
  _prevState: CreateOperationState,
  formData: FormData
): Promise<CreateOperationState> {
  const parsed = readOperationForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para registrar una operación." };
  }

  const { error } = await supabase.from("transactions").insert({
    account_id: parsed.accountId,
    user_id: user.id,
    type: parsed.type,
    amount: parsed.amount,
    description: parsed.description,
    ...(parsed.transactionDate ? { transaction_date: parsed.transactionDate } : {}),
  });

  if (error) {
    return { error: ERROR_BY_TYPE[parsed.type] };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/operations");
}

export type UpdateOperationState = { error: string } | undefined;

export async function updateOperation(
  _prevState: UpdateOperationState,
  formData: FormData
): Promise<UpdateOperationState> {
  const parsed = readOperationForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "No se encontró la operación a editar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para editar una operación." };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      account_id: parsed.accountId,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      ...(parsed.transactionDate ? { transaction_date: parsed.transactionDate } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: UPDATE_ERROR_BY_TYPE[parsed.type] };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/operations");
}
