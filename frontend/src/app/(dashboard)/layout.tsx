import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 bg-background-bg-secondary p-6 lg:p-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
