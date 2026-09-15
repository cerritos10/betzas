"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTransaction, type CreateTransactionState } from "./actions";
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

type Account = { id: string; name: string };

export function CreateTransactionForm({
  accounts,
  onSuccess,
}: {
  accounts: Account[];
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    CreateTransactionState,
    FormData
  >(createTransaction, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account_id">Cuenta</Label>
        <Select name="account_id" defaultValue={accounts[0]?.id}>
          <SelectTrigger id="account_id" className="w-full">
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <p className="text-sm text-muted-foreground">
        Llena solo los montos que apliquen.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wager">Apostado</Label>
        <Input
          id="wager"
          name="wager"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="gain">Ganancia</Label>
        <Input
          id="gain"
          name="gain"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loss">Pérdida</Label>
        <Input
          id="loss"
          name="loss"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input id="description" name="description" placeholder="Notas del día" />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando..." : "Registrar"}
      </Button>
    </form>
  );
}
