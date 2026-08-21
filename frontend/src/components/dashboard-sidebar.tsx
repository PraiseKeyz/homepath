"use client";

import { LogOut, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDashboardShell } from "@/components/dashboard-shell-context";
import type { User } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";

function NavRow({
  href,
  label,
  Icon,
  isActive,
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  Icon: (typeof DASHBOARD_NAV_ITEMS)[number]["icon"];
  isActive: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-lg py-2 pr-3 pl-4 text-sm font-medium text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900",
        isActive &&
          "bg-background-bg-brand-primary text-text-brand-secondary-700",
      )}
    >
      {isActive && (
        <span className="absolute top-1/2 left-0 h-4 w-1 -translate-y-1/2 rounded-r-full bg-button-primary-default" />
      )}
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {!!badge && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-utility-error-500 px-1.5 text-[11px] font-bold text-text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

function SidebarContent({
  onNavigate,
  onClose,
}: {
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useDashboardShell();
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
  const mainItems = items.filter((item) => item.group === "main");
  const accountItems = items.filter((item) => item.group === "account");

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-secondary px-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/homepath-logo-white.png"
            alt="HomePath"
            width={492}
            height={132}
            className="h-8 w-auto"
          />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="space-y-0.5 border-b border-border-secondary pb-4">
          {mainItems.map((item) => (
            <NavRow
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              isActive={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="mt-auto space-y-0.5 border-t border-border-secondary pt-4">
          {accountItems.map((item) => (
            <NavRow
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              isActive={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
              badge={
                item.href === "/dashboard/notifications"
                  ? unreadCount
                  : undefined
              }
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      {user && (
        <div className="shrink-0 border-t border-b border-border-secondary p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-text-tertiary-600 transition-colors hover:bg-background-bg-secondary-hover hover:text-text-primary-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </>
  );
}

export function DashboardSidebar() {
  const { mobileNavOpen, setMobileNavOpen } = useDashboardShell();

  useEffect(() => {
    if (!mobileNavOpen) return;

    document.body.style.overflow = "hidden";
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border-secondary bg-background-bg-primary lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-background-bg-overlay/60 transition-opacity duration-300 lg:hidden",
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-background-bg-primary shadow-effects-shadows-shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          onNavigate={() => setMobileNavOpen(false)}
          onClose={() => setMobileNavOpen(false)}
        />
      </aside>
    </>
  );
}
