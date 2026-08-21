"use client";

import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { UserMenu } from "@/components/user-menu";
import type { User } from "@/lib/api";
import { clearSession, getStoredUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust-layer", label: "TrustLayer" },
  { href: "#journey", label: "Your journey" },
  { href: "/developers", label: "For developers" },
];

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setChecked(true);
  }, []);

  function handleSignOut() {
    clearSession();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-4 z-30 mx-auto max-w-6xl px-6">
      <div className="flex items-center justify-between rounded-full border border-border-secondary bg-background-bg-primary/90 py-3 pr-3 pl-6 shadow-dropdown-panel backdrop-blur">
        <Link href="/" className="flex items-center">
          <Image
            src="/homepath-logo-white.png"
            alt="HomePath"
            width={492}
            height={132}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-tertiary-600 hover:text-text-primary-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {!checked ? (
          <div className="h-9 w-24" />
        ) : user ? (
          <UserMenu user={user} onSignOut={handleSignOut}>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          </UserMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
