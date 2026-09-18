"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateMovement, type UpdateMovementState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EditableMovement = {
  ids: string[];
  batchId: string | null;
  accountId: string;
  date: string;
  description: string;
  wager: number;
  gain: number;
  loss: number;
};

export function EditMovementForm({
  movement,
  onSuccess,
}: {
  movement: EditableMovement;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<
    UpdateMovementState,
    FormData
  >(updateMovement, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onSuccess?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSuccess]);

  const wagerRef = useRef<HTMLInputElement>(null);
  const gainRef = useRef<HTMLInputElement>(null);
  const lossRef = useRef<HTMLInputElement>(null);

  function calculateLoss() {
    const wager = Number(wagerRef.current?.value) || 0;
    const gain = Number(gainRef.current?.value) || 0;
    const loss = Math.max(wager - gain, 0);
    if (lossRef.current) {
      lossRef.current.value = loss ? loss.toFixed(2) : "";
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="account_id" value={movement.accountId} />
      {movement.batchId && (
        <input type="hidden" name="batch_id" value={movement.batchId} />
      )}
      {movement.ids.map((id) => (
        <input key={id} type="hidden" name="member_id" value={id} />
      ))}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_transaction_date">Fecha</Label>
        <Input
          id="edit_transaction_date"
          name="transaction_date"
          type="date"
          defaultValue={movement.date}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_wager">Apostado</Label>
        <Input
          ref={wagerRef}
          id="edit_wager"
          name="wager"
          type="number"
          step="0.01"
          min="0"
          defaultValue={movement.wager || ""}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_gain">Ganancia</Label>
        <Input
          ref={gainRef}
          id="edit_gain"
          name="gain"
          type="number"
          step="0.01"
          min="0"
          defaultValue={movement.gain || ""}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="edit_loss">Pérdida</Label>
          <button
            type="button"
            onClick={calculateLoss}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Calcular (Apostado − Ganancia)
          </button>
        </div>
        <Input
          ref={lossRef}
          id="edit_loss"
          name="loss"
          type="number"
          step="0.01"
          min="0"
          defaultValue={movement.loss || ""}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit_description">Descripción (opcional)</Label>
        <Input
          id="edit_description"
          name="description"
          defaultValue={movement.description}
          placeholder="Notas del día"
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
