import Link from "next/link";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-bg-secondary">
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-16">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-base font-bold text-text-primary-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button-primary-default text-sm text-text-primary-on-brand">
            H
          </span>
          HomePath
        </Link>

        <div className="w-full rounded-2xl border border-border-secondary bg-background-bg-primary p-8 shadow-dropdown-panel">
          <h1 className="text-2xl font-bold text-text-primary-900">{title}</h1>
          <p className="mt-1 text-sm text-text-tertiary-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-sm text-text-tertiary-600">{footer}</p>
      </div>
    </div>
  );
}
