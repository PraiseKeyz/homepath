"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";

export function DashboardSidebar() {
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

  const items = DASHBOARD_NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );
  const sections = [...new Set(items.map((item) => item.section))];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border-secondary bg-background-bg-primary lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b border-border-secondary px-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-text-primary-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
            H
          </span>
          HomePath
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section}>
            <p className="px-3 text-xs font-semibold tracking-wide text-text-quaternary-500 uppercase">
              {section}
            </p>
            <div className="mt-2 space-y-0.5">
              {items
                .filter((item) => item.section === section)
                .map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg py-2 pr-3 pl-4 text-sm font-medium text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900",
                        isActive &&
                          "bg-background-bg-brand-primary text-text-brand-secondary-700",
                      )}
                    >
                      {isActive && (
                        <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-button-primary-default" />
                      )}
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-border-secondary p-3">
          <UserMenu user={user} onSignOut={handleSignOut} />
        </div>
      )}
    </aside>
  );
}
