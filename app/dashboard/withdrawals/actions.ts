"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateWithdrawalState = { error: string } | undefined;

export async function createWithdrawal(
  _prevState: CreateWithdrawalState,
  formData: FormData
): Promise<CreateWithdrawalState> {
  const accountId = formData.get("account_id");
  const amountRaw = formData.get("amount");
  const description = formData.get("description");
  const transactionDate = formData.get("transaction_date");

  if (typeof accountId !== "string" || !accountId) {
    return { error: "Selecciona una cuenta." };
  }

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser un número mayor a 0." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para registrar un retiro." };
  }

  const { error } = await supabase.from("transactions").insert({
    account_id: accountId,
    user_id: user.id,
    type: "withdrawal",
    amount,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    ...(typeof transactionDate === "string" && transactionDate
      ? { transaction_date: transactionDate }
      : {}),
  });

  if (error) {
    return { error: "No se pudo registrar el retiro. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/withdrawals");
}
