"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateOperation, type UpdateOperationState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type EditableOperation = {
  id: string;
  accountId: string;
  type: "withdrawal" | "deposit" | "income";
  amount: number;
  date: string;
  description: string;
};

export function EditOperationForm({
  operation,
  onSuccess,
}: {
  operation: EditableOperation;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    UpdateOperationState,
    FormData
  >(updateOperation, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={operation.id} />
      <input type="hidden" name="account_id" value={operation.accountId} />

      <div className="flex flex-col gap-2">
        <Label>Tipo</Label>
        <RadioGroup name="type" defaultValue={operation.type} className="flex flex-col gap-2.5">
          <label className="flex items-start gap-2 text-sm">
            <RadioGroupItem value="withdrawal" className="mt-0.5" />
            <span>
              <span className="font-medium">Retiro</span>
              <span className="block text-xs text-muted-foreground">
                Resta del saldo actual.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <RadioGroupItem value="deposit" className="mt-0.5" />
            <span>
              <span className="font-medium">Depósito</span>
              <span className="block text-xs text-muted-foreground">
                Suma al saldo actual.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <RadioGroupItem value="income" className="mt-0.5" />
            <span>
              <span className="font-medium">Ingreso</span>
              <span className="block text-xs text-muted-foreground">
                No afecta el saldo actual.
              </span>
            </span>
          </label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_op_amount">Monto</Label>
        <Input
          id="edit_op_amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={operation.amount}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_op_date">Fecha</Label>
        <Input
          id="edit_op_date"
          name="transaction_date"
          type="date"
          defaultValue={operation.date}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_op_description">Descripción (opcional)</Label>
        <Input
          id="edit_op_description"
          name="description"
          defaultValue={operation.description}
          placeholder="Ej. transferencia a banco"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
