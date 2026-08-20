"use client";

import { useEffect } from "react";
import "./styles/globals.css";

// Last-resort boundary — catches errors the root layout itself throws, which
// nested error.tsx boundaries (see (marketing)/error.tsx, dashboard/error.tsx)
// can't reach. Must render its own <html>/<body> since it replaces the root
// layout entirely when triggered.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background-bg-secondary antialiased">
        <div className="mx-auto flex max-w-md flex-col items-center px-6 text-center">
          <h1 className="text-xl font-bold text-text-primary-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-text-tertiary-600">
            HomePath hit an unexpected error. Try refreshing the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full bg-button-primary-default px-5 py-2.5 text-sm font-semibold text-text-primary-on-brand hover:bg-button-primary-hover"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
