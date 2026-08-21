"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDashboardShell } from "@/components/dashboard-shell-context";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileNavOpen } = useDashboardShell();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleSignOut() {
    clearSession();
    router.push("/");
    router.refresh();
  }

  const isOverview = pathname === "/dashboard";
  const current = DASHBOARD_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-border-secondary bg-background-bg-primary/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isOverview && user ? (
          <div>
            <p className="text-sm font-semibold text-text-primary-900">
              {greeting()}, {user.name.split(" ")[0]}! 👋
            </p>
            <p className="text-xs text-text-tertiary-600">
              Here&apos;s what&apos;s happening with your home journey.
            </p>
          </div>
        ) : (
          current && (
            <span className="flex items-center gap-2 rounded-full bg-background-bg-brand-primary px-3.5 py-1.5 text-sm font-semibold text-text-brand-secondary-700">
              <current.icon className="h-4 w-4" />
              {current.label}
            </span>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>
        {user && <UserMenu user={user} onSignOut={handleSignOut} />}
      </div>
    </header>
  );
}
