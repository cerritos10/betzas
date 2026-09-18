"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditMovementForm } from "./edit-movement-form";
import { deleteMovement } from "./actions";
import type { Transaction } from "./calculations";

const TYPE_LABEL: Record<Transaction["type"], string> = {
  gain: "Ganancia",
  loss: "Pérdida",
  wager: "Apostado",
  withdrawal: "Retiro",
};

const TYPE_STYLE: Record<Transaction["type"], { sign: string; color: string }> = {
  gain: { sign: "+", color: "text-[#0ca30c]" },
  loss: { sign: "−", color: "text-[#d03b3b]" },
  wager: { sign: "", color: "text-[#3987e5]" },
  withdrawal: { sign: "−", color: "text-[#d95926]" },
};

export type MovementGroup = {
  key: string;
  ids: string[];
  batchId: string | null;
  accountId: string;
  date: string;
  when: string;
  description: string | null;
  members: { type: Transaction["type"]; amount: number }[];
  editable: boolean;
};

export function MovementGroupRow({ group }: { group: MovementGroup }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-1">
        {group.description && (
          <span className="truncate font-medium">{group.description}</span>
        )}
        <span className="text-sm text-muted-foreground">{group.when}</span>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {group.members.map((m) => (
            <span key={m.type} className={`text-sm font-semibold ${TYPE_STYLE[m.type].color}`}>
              {TYPE_LABEL[m.type]} {TYPE_STYLE[m.type].sign}${m.amount.toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {group.editable && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Editar" />}
            >
              <Pencil className="size-3.5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar movimiento</DialogTitle>
                <DialogDescription>
                  Modifica los montos, la fecha o la descripción.
                </DialogDescription>
              </DialogHeader>
              <EditMovementForm
                movement={{
                  ids: group.ids,
                  batchId: group.batchId,
                  accountId: group.accountId,
                  date: group.date,
                  description: group.description ?? "",
                  wager: group.members.find((m) => m.type === "wager")?.amount ?? 0,
                  gain: group.members.find((m) => m.type === "gain")?.amount ?? 0,
                  loss: group.members.find((m) => m.type === "loss")?.amount ?? 0,
                }}
                onSuccess={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Eliminar"
                className="hover:bg-destructive/20 hover:text-destructive"
              />
            }
          >
            <Trash2 className="size-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await deleteMovement(group.ids);
                    setDeleteOpen(false);
                  });
                }}
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}
