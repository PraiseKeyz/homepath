import Link from "next/link";

const PRODUCT_LINKS = [
  { href: "/properties", label: "Browse properties" },
  { href: "/#trust-layer", label: "TrustLayer" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#journey", label: "Your journey" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Create an account" },
  { href: "/register?role=developer", label: "For developers" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-text-quaternary-500 uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-text-tertiary-600 hover:text-text-primary-900"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border-secondary bg-background-bg-primary">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-base font-bold text-text-primary-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
                H
              </span>
              HomePath
            </Link>
            <p className="mt-3 max-w-xs text-sm text-text-tertiary-600">
              Verified land, cooperative savings, and demand-matched developers
              — turning the housing crisis into a solvable logistics problem.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        </div>

        <div className="mt-12 border-t border-border-secondary pt-8 text-sm text-text-quaternary-500">
          <p>
            &copy; {new Date().getFullYear()} HomePath. Hackathon build — not a
            licensed real estate, mortgage, or legal service.
          </p>
        </div>
      </div>
    </footer>
  );
}
