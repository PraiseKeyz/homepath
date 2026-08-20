"use client";

import { Building2, PiggyBank } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/cn";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: typeof PiggyBank;
  roles: User["role"][] | null;
}[] = [
  {
    href: "/dashboard/cooperative",
    label: "Cooperative Savings",
    icon: PiggyBank,
    roles: null,
  },
  {
    href: "/dashboard/build-match",
    label: "BuildMatch",
    icon: Building2,
    roles: ["DEVELOPER"],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border-secondary bg-background-bg-primary p-4 lg:block">
      <Link
        href="/"
        className="flex items-center gap-2 px-2 text-base font-bold text-text-primary-900"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
          H
        </span>
        HomePath
      </Link>

      <nav className="mt-8 space-y-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-tertiary-600 hover:bg-background-bg-secondary-hover hover:text-text-primary-900",
                isActive &&
                  "bg-background-bg-brand-primary text-text-brand-secondary-700 hover:bg-background-bg-brand-primary",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
