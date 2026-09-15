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
import { CreateAccountForm } from "./create-account-form";

export function NewAccountDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">+ Nueva cuenta</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear cuenta</DialogTitle>
          <DialogDescription>
            Registra otra cuenta financiera con su saldo inicial.
          </DialogDescription>
        </DialogHeader>
        <CreateAccountForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
