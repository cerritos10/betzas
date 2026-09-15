import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/login/actions";

export function TopBar({ email }: { email: string | undefined }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-6 sm:px-8">
      <span className="text-sm text-muted-foreground">{email}</span>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
