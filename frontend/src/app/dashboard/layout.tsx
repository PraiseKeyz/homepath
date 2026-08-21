import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { DashboardShellProvider } from "@/components/dashboard-shell-context";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShellProvider>
        <div className="flex min-h-screen">
          <DashboardSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardTopbar />
            <main className="flex-1 bg-background-bg-secondary p-6 lg:p-10">
              {children}
            </main>
          </div>
        </div>
      </DashboardShellProvider>
    </AuthGuard>
  );
}
