"use client";

import { useActionState, useEffect, useRef } from "react";
import { createWithdrawal, type CreateWithdrawalState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { todayInTZ } from "@/lib/date";

type Account = { id: string; name: string; balance: number };

export function WithdrawalForm({ accounts }: { accounts: Account[] }) {
  const [state, formAction, pending] = useActionState<
    CreateWithdrawalState,
    FormData
  >(createWithdrawal, undefined);
  const wasPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  const today = todayInTZ();

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account_id">Cuenta</Label>
        <Select name="account_id" defaultValue={accounts[0]?.id}>
          <SelectTrigger id="account_id" className="w-full">
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} — ${account.balance.toFixed(2)} disponible
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Monto a retirar</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="transaction_date">Fecha</Label>
        <Input
          id="transaction_date"
          name="transaction_date"
          type="date"
          defaultValue={today}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" placeholder="Ej. transferencia a banco" />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando..." : "Retirar"}
      </Button>
    </form>
  );
}
