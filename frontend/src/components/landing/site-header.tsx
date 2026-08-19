import Link from "next/link";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#trust-layer", label: "TrustLayer" },
  { href: "#journey", label: "Your journey" },
  { href: "#developers", label: "For developers" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-secondary bg-background-bg-primary/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-text-primary-900">
          HomePath
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-text-secondary-700 hover:text-text-primary-900"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-button-primary-default px-4 py-2 text-sm font-semibold text-text-primary-on-brand hover:bg-button-primary-hover"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
