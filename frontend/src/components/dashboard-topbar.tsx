"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";

export function DashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleSignOut() {
    clearSession();
    router.push("/");
    router.refresh();
  }

  const current = DASHBOARD_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border-secondary bg-background-bg-primary/90 px-6 backdrop-blur">
      <div className="flex items-center gap-2">
        {current && (
          <span className="flex items-center gap-2 rounded-full bg-background-bg-brand-primary px-3.5 py-1.5 text-sm font-semibold text-text-brand-secondary-700">
            <current.icon className="h-4 w-4" />
            {current.label}
          </span>
        )}
      </div>

      {user && <UserMenu user={user} onSignOut={handleSignOut} />}
    </header>
  );
}
