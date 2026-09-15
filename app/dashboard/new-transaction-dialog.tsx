"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTransactionForm } from "./create-transaction-form";

type Account = { id: string; name: string };

export function NewTransactionDialog({ accounts }: { accounts: Account[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>+ Nuevo movimiento</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
          <DialogDescription>Agrega una ganancia o pérdida.</DialogDescription>
        </DialogHeader>
        <CreateTransactionForm
          accounts={accounts}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
