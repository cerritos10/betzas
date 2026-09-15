import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col md:pl-56">
        <TopBar email={user?.email} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
