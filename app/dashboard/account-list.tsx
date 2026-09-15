import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewAccountDialog } from "./new-account-dialog";
import { DeleteAccountButton } from "./delete-account-button";

type Account = { id: string; name: string; balance: number };

export function AccountList({ accounts }: { accounts: Account[] }) {
  return (
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Cuentas</CardTitle>
        <NewAccountDialog />
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {accounts.map((account) => (
            <li key={account.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="font-medium">{account.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">${account.balance.toFixed(2)}</span>
                <DeleteAccountButton accountId={account.id} accountName={account.name} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
