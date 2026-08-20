import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust-layer", label: "TrustLayer" },
  { href: "#journey", label: "Your journey" },
  { href: "#developers", label: "For developers" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-30 mx-auto max-w-5xl px-4">
      <div className="flex items-center justify-between rounded-full border border-border-secondary bg-background-bg-primary/90 py-2.5 pr-2.5 pl-4 shadow-dropdown-panel backdrop-blur">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-text-primary-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
            H
          </span>
          HomePath
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
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

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
