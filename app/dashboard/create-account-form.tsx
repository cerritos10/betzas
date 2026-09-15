"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccount, type CreateAccountState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState<
    CreateAccountState,
    FormData
  >(createAccount, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre de cuenta</Label>
        <Input id="name" name="name" placeholder="Principal" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="initial_balance">Saldo inicial</Label>
        <Input
          id="initial_balance"
          name="initial_balance"
          type="number"
          step="0.01"
          min="0"
          placeholder="6.39"
          required
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
